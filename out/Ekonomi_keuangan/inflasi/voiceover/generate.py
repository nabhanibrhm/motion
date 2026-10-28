"""Generate the voiceover (per-speaker voices) and its word timing data.

Usage: python voiceover/generate.py voiceover/inflasi.json          build the voice from the config
       python voiceover/generate.py voiceover/inflasi.json --list   write voiceover/lines.md (what to record)

Two sources (config `"source"`):
  "edge-tts" (default)  every chunk is synthesised with edge-tts, which also returns word timings.
  "files"               every line is a ready-made audio file, one per line, made elsewhere (TTSMaker):
                        voiceover/lines/<section id>-<line index>.mp3 (or .wav). Inline [pause] markers are
                        ignored (one file per line). Word timings come from faster-whisper (local, CPU):
                        its recognised words are matched to the script's words, and words it heard
                        differently (numbers, slang) get times shared out by length within their gap.

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
LINES_DIR = Path(os.environ.get("VOICE_LINES") or ROOT / "voiceover" / "lines")  # VOICE_LINES: test with another folder
WHISPER_MODEL = os.environ.get("WHISPER_MODEL", "small")  # "small" handles Indonesian well on CPU
_whisper = None


def norm(w: str) -> str:
    return re.sub(r"[^a-z0-9]", "", w.lower())


def line_file(sec_id: str, li: int) -> Path:
    for ext in (".mp3", ".wav"):
        p = LINES_DIR / f"{sec_id}-{li}{ext}"
        if p.exists():
            return p
    sys.exit(f"generate.py: missing {LINES_DIR.relative_to(ROOT)}/{sec_id}-{li}.mp3 (run with --list to see every file to make)")


def speech_bounds(x: np.ndarray, sr: int) -> tuple[float, float]:
    """First and last moment the recording is louder than -40 dB below its peak (20 ms frames)."""
    hop = int(0.02 * sr)
    frames = x[: len(x) // hop * hop].reshape(-1, hop)
    rms = np.sqrt(np.mean(frames * frames, axis=1))
    loud = np.nonzero(rms > rms.max() * 0.01)[0]
    return (loud[0] * hop / sr, (loud[-1] + 1) * hop / sr) if len(loud) else (0.0, len(x) / sr)


def snap_onsets(words: list[dict], x: np.ndarray, sr: int) -> list[dict]:
    """Whisper starts a word right after the previous one, even across a pause: move each start to
    where sound resumes (first 10 ms frame above 1% of the peak, less 40 ms for soft consonants) if that is inside the word."""
    hop = int(0.01 * sr)
    frames = x[: len(x) // hop * hop].reshape(-1, hop)
    rms = np.sqrt(np.mean(frames * frames, axis=1))
    loud = rms > rms.max() * 0.01
    out = []
    for w in words:
        a, b = int(w["start"] / 0.01), int(w["end"] / 0.01)
        hit = next((k for k in range(a, min(b, len(loud))) if loud[k]), None)
        start = round(max(w["start"], hit * 0.01 - 0.04), 3) if hit is not None else w["start"]
        out.append({**w, "start": min(start, w["end"])})
    return out


def align(text: str, heard: list[dict], bounds: tuple[float, float]) -> list[dict]:
    """Give every script token a time from the recognised words. Matches are taken as they are;
    script tokens heard differently (or not at all) share the time between their matched neighbours;
    the loudness bounds of the recording frame the first and last words."""
    import difflib

    tokens = text.split()
    heard = [w for w in heard if w["end"] > bounds[0] and w["start"] < bounds[1]]
    a = [norm(t) for t in tokens]
    b = [norm(w["word"]) for w in heard]
    times: list[tuple[float, float] | None] = [None] * len(tokens)
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if op == "equal":
            for k in range(i2 - i1):
                times[i1 + k] = (heard[j1 + k]["start"], heard[j1 + k]["end"])
        elif op == "replace":
            span(tokens, times, i1, i2, heard[j1]["start"], heard[j2 - 1]["end"])
    # tokens still without a time (nothing heard for them): share the gap between their neighbours
    i = 0
    while i < len(tokens):
        if times[i] is not None:
            i += 1
            continue
        j = i
        while j < len(tokens) and times[j] is None:
            j += 1
        t0 = times[i - 1][1] if i > 0 else bounds[0]
        t1 = times[j][0] if j < len(tokens) else bounds[1]
        if t1 - t0 < 0.08 * (j - i):  # no room: squeeze in after the previous word
            t1 = t0 + 0.08 * (j - i)
        span(tokens, times, i, j, t0, t1)
        i = j
    return [{"word": t, "start": round(s, 3), "end": round(e, 3)} for t, (s, e) in zip(tokens, times)]


def span(tokens: list[str], times: list, i1: int, i2: int, t0: float, t1: float) -> None:
    """Share [t0, t1] between tokens[i1:i2] in proportion to their length."""
    lens = [max(1, len(norm(t))) for t in tokens[i1:i2]]
    total, t = sum(lens), t0
    for k, n in enumerate(lens):
        d = (t1 - t0) * n / total
        times[i1 + k] = (t, t + d)
        t += d


def from_file(path: Path, text: str) -> dict:
    """A ready-made line (cached by file content). Returns {"words": [{word,start,end}], "mp3": Path}."""
    global _whisper
    key = hashlib.sha1(path.read_bytes() + text.encode() + WHISPER_MODEL.encode() + b"v4").hexdigest()[:16]
    meta = CACHE / f"file-{key}.json"
    if meta.exists():
        return {"words": json.loads(meta.read_text(encoding="utf-8")), "mp3": path}
    if _whisper is None:
        from faster_whisper import WhisperModel

        print(f"    loading faster-whisper '{WHISPER_MODEL}' (first run downloads it)")
        _whisper = WhisperModel(WHISPER_MODEL, device="cpu", compute_type="int8")
    # decode with our FFmpeg (16 kHz mono) instead of faster-whisper's own reader (PyAV versions break it)
    pcm = subprocess.run([str(FFMPEG), "-v", "error", "-i", str(path), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], check=True, capture_output=True).stdout
    audio16 = np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768.0
    # no initial_prompt: given the script as a prompt, Whisper tends to skip text it "already heard"
    segments, _ = _whisper.transcribe(audio16, language="id", word_timestamps=True, beam_size=5, condition_on_previous_text=False)
    heard = [{"word": w.word.strip(), "start": w.start, "end": w.end} for s in segments for w in s.words if w.word.strip()]
    if not heard:
        print(f"    warn: no words recognised in {path.name}; timing spread over the speech")
    words = snap_onsets(align(text, heard, speech_bounds(audio16, 16000)), audio16, 16000)
    meta.write_text(json.dumps(words, ensure_ascii=False), encoding="utf-8")
    return {"words": words, "mp3": path}


def write_list(cfg: dict) -> None:
    """voiceover/lines.md: every file to make, with the speaker and the exact text to paste."""
    rows = ["# Lines to record", "", "One file per line in `voiceover/lines/`. Paste the text as it is (the [pause] markers are left out).", ""]
    for sec in cfg["sections"]:
        for li, line in enumerate(sec["lines"]):
            text = re.sub(r"\s+", " ", MARKER.sub(" ", line["text"])).strip()
            voice = cfg["speakers"][line["speaker"]].get("ttsmaker", "")
            rows.append(f'- [ ] `{sec["id"]}-{li}.mp3`, **{line["speaker"].upper()}**{f" ({voice})" if voice else ""}: {text}')
    path = ROOT / "voiceover" / "lines.md"
    path.write_text("\n".join(rows) + "\n", encoding="utf-8")
    print(f"wrote {path.relative_to(ROOT)}")


async def synth(text: str, spk: dict) -> dict:
    """Synthesise one chunk with edge-tts (cached). Returns {"words": [{word,start,end}], "mp3": Path}."""
    import edge_tts

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
        files = cfg.get("source") == "files"
        # files: the whole line is one recording, so [pause] markers are dropped
        pieces = [re.sub(r"\s+", " ", MARKER.sub(" ", line["text"]))] if files else MARKER.split(line["text"])  # text, secs, text, ...
        words_all = []
        for pi in range(0, len(pieces), 2):
            chunk_text = pieces[pi].strip()
            if chunk_text:
                if files:
                    res = from_file(line_file(sec["id"], li), chunk_text)
                    x = level(decode(res["mp3"]))
                    raw = res["words"]
                else:
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
    if "--list" in sys.argv:
        write_list(cfg)
        return
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
