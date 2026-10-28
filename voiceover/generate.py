"""Generate the F1 v2 voiceover (edge-tts, per-speaker voices) and its timing data for Remotion.

Usage: python voiceover/generate.py voiceover/f1.json

Config (see f1.json): speakers {id: voice/rate/pitch}, chapters, defaults, sections[] of
lines {speaker, text, after?}. `after` is silence after the line in seconds; the last line's
`after` becomes the section tail. Inline `[pause 0.3]` / `[hold 2.5]` markers inside a line add
silence inside it (the line is synthesised in chunks).

Pipeline:
  1. every chunk (speaker + text) is synthesised once and cached in voiceover/.cache/ (keyed by
     voice|rate|pitch|text), together with its WordBoundary timings;
  2. chunks are decoded with ffmpeg, level-matched, trimmed to the spoken part and placed
     on a sample timeline with explicit silence;
  3. each section is encoded as ONE mp3 -> public/voice/<name>/<id>.mp3;
  4. src/data/<name>-voice.json gets sections[] {id, chapter, start, duration, lead, tail, audio,
     lines[] {speaker, text, start, end, words[] {word, start, end}}}. Line/word times are seconds
     relative to the section; `start` is the section's offset on the narration-only timeline
     (the video adds chapter cards on top, see src/compositions/f1/timeline.ts).
"""

import asyncio
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import wave
from pathlib import Path

import edge_tts
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
# FFmpeg: the FFMPEG env variable, else the one on PATH (apt on WSL, winget on Windows).
FFMPEG = os.environ.get("FFMPEG") or shutil.which("ffmpeg")
if not FFMPEG:
    sys.exit("generate.py: FFmpeg not found. Install it (WSL: sudo apt install ffmpeg, Windows: winget install Gyan.FFmpeg) or set FFMPEG to its path.")
CACHE = ROOT / "voiceover" / ".cache"
SR = 24000  # edge-tts native sample rate
TARGET_RMS = 0.10  # about -20 dBFS speech level, so the three voices sit together
PEAK_CEIL = 0.89
MARKER = re.compile(r"\[(?:pause|hold)\s+([\d.]+)\]")


def norm(w: str) -> str:
    return re.sub(r"[^a-z0-9]", "", w.lower())


async def synth(text: str, spk: dict) -> dict:
    """Synthesise one chunk (cached). Returns {"words": [{word,start,end}], "mp3": Path}."""
    key = hashlib.sha1(f'{spk["voice"]}|{spk["rate"]}|{spk["pitch"]}|{text}'.encode()).hexdigest()[:16]
    mp3, meta = CACHE / f"{key}.mp3", CACHE / f"{key}.json"
    if mp3.exists() and meta.exists():
        return {"words": json.loads(meta.read_text(encoding="utf-8")), "mp3": mp3}
    for attempt in range(4):
        try:
            comm = edge_tts.Communicate(text, spk["voice"], rate=spk["rate"], pitch=spk["pitch"], boundary="WordBoundary")
            words, audio = [], bytearray()
            async for chunk in comm.stream():
                if chunk["type"] == "audio":
                    audio += chunk["data"]
                elif chunk["type"] == "WordBoundary":
                    s = chunk["offset"] / 1e7
                    words.append({"word": chunk["text"], "start": s, "end": s + chunk["duration"] / 1e7})
            if not audio or not words:
                raise RuntimeError("empty synthesis")
            mp3.write_bytes(bytes(audio))
            meta.write_text(json.dumps(words), encoding="utf-8")
            return {"words": words, "mp3": mp3}
        except Exception as exc:  # network hiccups
            print(f"    retry {attempt + 1} after {exc!r}")
            await asyncio.sleep(1.5)
    raise RuntimeError(f"edge-tts failed for: {text}")


def decode(mp3: Path) -> np.ndarray:
    wav = mp3.with_suffix(".wav")
    subprocess.run([str(FFMPEG), "-y", "-v", "error", "-i", str(mp3), "-ac", "1", "-ar", str(SR), str(wav)], check=True)
    with wave.open(str(wav), "rb") as w:
        data = w.readframes(w.getnframes())
    wav.unlink()
    return np.frombuffer(data, dtype=np.int16).astype(np.float32) / 32768.0


def level(x: np.ndarray) -> np.ndarray:
    rms = float(np.sqrt(np.mean(x * x))) or 1e-6
    x = x * (TARGET_RMS / rms)
    over = np.abs(x) > 0.7  # gentle soft limiter above 0.7, ceiling PEAK_CEIL
    x = np.where(over, np.sign(x) * (0.7 + (PEAK_CEIL - 0.7) * np.tanh((np.abs(x) - 0.7) / (PEAK_CEIL - 0.7))), x)
    return x


def encode(samples: np.ndarray, out: Path) -> None:
    pcm = (np.clip(samples, -1, 1) * 32767).astype(np.int16).tobytes()
    out.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run([str(FFMPEG), "-y", "-v", "error", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-",
                    "-codec:a", "libmp3lame", "-b:a", "96k", str(out)], input=pcm, check=True)


def split_boundaries(words: list[dict]) -> list[dict]:
    """Boundaries like "$8 billion" become one word per whitespace token (time split by length)."""
    out = []
    for w in words:
        parts = w["word"].split()
        if len(parts) <= 1:
            out.append(w)
            continue
        total, t = sum(len(p) for p in parts), w["start"]
        for p in parts:
            d = (w["end"] - w["start"]) * len(p) / total
            out.append({"word": p, "start": t, "end": t + d})
            t += d
    return out


def attach_punctuation(text: str, words: list[dict]) -> list[dict]:
    """Boundary words carry no punctuation; re-attach it by walking the text tokens in order."""
    tokens = text.split()
    j, out = 0, []
    for w in words:
        key = norm(w["word"])
        hit = None
        for k in range(j, min(j + 4, len(tokens))):
            if norm(tokens[k]) == key:
                hit = k
                break
        if hit is None:
            print(f'    warn: no text token for boundary "{w["word"]}" in: {text[:50]}')
            out.append(dict(w))
            continue
        for stray in tokens[j:hit]:  # punctuation-only tokens (em dashes) stick to the previous word
            if out:
                out[-1]["word"] += " " + stray
        out.append({**w, "word": tokens[hit]})
        j = hit + 1
    for stray in tokens[j:]:
        if out:
            out[-1]["word"] += " " + stray
    return out


async def build_section(sec: dict, cfg: dict, lead: float, tail_override: float | None, name: str, start: float):
    d = cfg["defaults"]
    parts: list[np.ndarray] = []
    cursor = 0  # samples
    lines_out = []

    def silence(sec_len: float):
        nonlocal cursor
        n = int(round(sec_len * SR))
        parts.append(np.zeros(n, dtype=np.float32))
        cursor += n

    silence(lead)
    lines = sec["lines"]
    last_after = None
    for li, line in enumerate(lines):
        spk = cfg["speakers"][line["speaker"]]
        pieces = MARKER.split(line["text"])  # text, secs, text, secs, ...
        words_all = []
        for pi in range(0, len(pieces), 2):
            chunk_text = pieces[pi].strip()
            if chunk_text:
                res = await synth(chunk_text, spk)
                x = level(decode(res["mp3"]))
                raw = split_boundaries(res["words"])
                raw = attach_punctuation(chunk_text, raw)
                t0 = max(0.0, raw[0]["start"] - 0.04)
                t1 = min(len(x) / SR, raw[-1]["end"] + 0.18)
                x = x[int(t0 * SR):int(t1 * SR)].copy()
                fi, fo = int(0.004 * SR), int(0.02 * SR)
                x[:fi] *= np.linspace(0, 1, fi)
                x[-fo:] *= np.linspace(1, 0, fo)
                base = cursor / SR
                for w in raw:
                    words_all.append({"word": w["word"], "start": round(base + w["start"] - t0, 3),
                                      "end": round(base + w["end"] - t0, 3)})
                parts.append(x)
                cursor += len(x)
            if pi + 1 < len(pieces):
                silence(float(pieces[pi + 1]))
        lines_out.append({"speaker": line["speaker"], "text": re.sub(r"\s+", " ", MARKER.sub(" ", line["text"])).strip(),
                          "start": words_all[0]["start"], "end": words_all[-1]["end"], "words": words_all})
        after = line.get("after")
        if li < len(lines) - 1:
            nxt = lines[li + 1]["speaker"]
            silence(after if after is not None else (d["gapSameSpeaker"] if nxt == line["speaker"] else d["gapNewSpeaker"]))
        else:
            last_after = after if after is not None else 0.4
    tail = tail_override if tail_override is not None else max(d["tail"], last_after - d["lead"])
    silence(tail)

    audio = np.concatenate(parts)
    out = ROOT / "public" / "voice" / name / f'{sec["id"]}.mp3'
    encode(audio, out)
    duration = round(len(audio) / SR, 3)
    # lines/words were timed relative to the start of the section audio (lead included)
    return {"id": sec["id"], "chapter": sec["chapter"], "start": round(start, 3), "duration": duration,
            "lead": round(lead, 3), "tail": round(tail, 3), "audio": f'voice/{name}/{sec["id"]}.mp3',
            "text": " ".join(l["text"] for l in lines_out), "lines": lines_out}


async def main(config_path: Path) -> None:
    cfg = json.loads(config_path.read_text(encoding="utf-8"))
    if "speakers" not in cfg:
        sys.exit(f"{config_path.name} is a v1 config (single global voice); generate.py now needs per-speaker data (f1.json).")
    name = config_path.stem
    CACHE.mkdir(parents=True, exist_ok=True)
    d = cfg["defaults"]
    secs = cfg["sections"]
    out_sections, cursor = [], 0.0
    for i, sec in enumerate(secs):
        first_in_chapter = i == 0 or secs[i - 1]["chapter"] != sec["chapter"]
        last_in_chapter = i == len(secs) - 1 or secs[i + 1]["chapter"] != sec["chapter"]
        lead = d["firstLead"] if i == 0 else d["chapterLead"] if first_in_chapter else d["lead"]
        tail_override = d["chapterEndTail"] if last_in_chapter and i != len(secs) - 1 else None
        s = await build_section(sec, cfg, lead, tail_override, name, cursor)
        cursor += s["duration"]
        out_sections.append(s)
        print(f'  {s["id"]:10s} {s["duration"]:6.2f}s  ({len(s["lines"])} lines)')
        for li, l in enumerate(s["lines"]):
            print(f'      [{li}] {l["speaker"]} {l["start"]:5.2f}-{l["end"]:5.2f}  {l["text"][:60]}')

    manifest = {"speakers": cfg["speakers"], "chapters": cfg["chapters"], "total": round(cursor, 3), "sections": out_sections}
    path = ROOT / "src" / "data" / f"{name}-voice.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(manifest, indent=1, ensure_ascii=False), encoding="utf-8")
    print(f'Total narration: {cursor:.1f}s -> {path.relative_to(ROOT)}')


if __name__ == "__main__":
    asyncio.run(main(Path(sys.argv[1])))
