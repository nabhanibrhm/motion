"""Cartesia TTS provider for ``narration.source: "cartesia"``.

``node scripts/motion.mjs voice <id>`` calls ``lines`` first: each narration line is
synthesised (Cartesia ``/tts/bytes``, WAV) into ``episodes/<NN>_<id>/voice-lines/<section>-<i>.wav``
and the episode is then aligned exactly like a ``source: "files"`` episode.

Billing is 1 credit per character, so every line is cached by a key over its spoken text,
voice, model, language, speed, sample rate and pronunciation dictionary. The key and the
file's SHA-256 are recorded in ``voice-lines/cartesia.json`` (committed with the clips, so the
other laptop reuses them too); an unchanged line is never sent again. ``--force`` re-synthesises
(and re-bills) every line.

The API key is read from the CARTESIA_API_KEY environment variable or the repository's
git-ignored ``.env``; it is never printed.

Helper commands (run from the repository root with the root .venv python):
  python tools/voice/cartesia.py voices [--language id] [--gender masculine]
  python tools/voice/cartesia.py samples [--gender masculine] [--limit 4] [--text "..."] [--out DIR]
  python tools/voice/cartesia.py dict      # create/reuse the pronunciation dictionary, print its id
"""

import argparse
import hashlib
import json
import os
import re
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import wave
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
API = "https://api.cartesia.ai"
API_VERSION = "2026-08-14"
DEFAULTS = {"model": "sonic-3.6", "language": "id-ID", "speed": 1.0, "sampleRate": 44100,
            "dictionary": "config/cartesia-pronunciation.json"}
MARKER = re.compile(r"\[(?:pause|hold)\s+([\d.]+)\]")
SECTION = re.compile(r"^[a-z0-9][a-z0-9-]*$")
SIDECAR = "cartesia.json"
SAMPLE_TEXT = ("Satu koma satu juta orang naik KRL setiap hari. "
               "Kereta bekas dari Jepang yang sudah disetujui DPR tiba-tiba batal datang.")


# --- API -----------------------------------------------------------------------------------

def api_key() -> str:
    key = os.environ.get("CARTESIA_API_KEY")
    env = REPO / ".env"
    if not key and env.exists():
        for line in env.read_text(encoding="utf-8-sig").splitlines():
            name, sep, value = line.partition("=")
            if sep and name.strip().removeprefix("export ").strip() == "CARTESIA_API_KEY":
                key = value.strip().strip("'\"")
    if not key:
        sys.exit("cartesia.py: CARTESIA_API_KEY is not set (add it to the git-ignored .env at the repository root).")
    return key


def call(method: str, path: str, body=None, query=None, binary=False):
    url = API + path + ("?" + urllib.parse.urlencode(query, doseq=True) if query else "")
    headers = {"Authorization": "Bearer " + api_key(), "Cartesia-Version": API_VERSION}
    data = None
    if body is not None:
        data = json.dumps(body).encode()
        headers["Content-Type"] = "application/json"
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, data=data, headers=headers, method=method), timeout=120) as r:
                raw = r.read()
                return raw if binary else json.loads(raw)
        except urllib.error.HTTPError as e:
            detail = e.read().decode("utf-8", "replace")[:500]
            if e.code in (429, 500, 502, 503, 504) and attempt < 3:
                print(f"    cartesia {e.code}, retrying")
                time.sleep(2 * (attempt + 1))
                continue
            sys.exit(f"cartesia.py: {method} {path} failed with HTTP {e.code}: {detail}")
        except urllib.error.URLError as e:
            if attempt < 3:
                time.sleep(2 * (attempt + 1))
                continue
            sys.exit(f"cartesia.py: {method} {path} failed: {e.reason}")


def tts(text: str, voice: str, opts: dict, dict_id: str | None) -> bytes:
    body = {"model_id": opts["model"], "transcript": text, "voice": {"id": voice},
            "output_format": {"container": "wav", "encoding": "pcm_s16le", "sample_rate": int(opts["sampleRate"])},
            "language": opts["language"], "generation_config": {"speed": float(opts["speed"])}}
    if dict_id:
        body["pronunciation_dict_id"] = dict_id
    audio = call("POST", "/tts/bytes", body, binary=True)
    if audio[:4] != b"RIFF":
        sys.exit("cartesia.py: the API did not return WAV audio")
    return audio


def list_voices(language: str | None, gender: str | None) -> list[dict]:
    out, after = [], None
    while True:
        q = {"limit": 100}
        if language:
            q["language"] = language
        if gender:
            q["gender"] = gender
        if after:
            q["starting_after"] = after
        page = call("GET", "/voices", query=q)
        out += page["data"]
        if not page.get("has_more") or not page.get("next_page"):
            return out
        after = page["next_page"]


# --- pronunciation dictionary ---------------------------------------------------------------

def load_dictionary(rel: str | None) -> list[dict]:
    if not rel:
        return []
    path = (REPO / rel).resolve()
    if REPO not in path.parents:
        sys.exit(f"cartesia.py: dictionary path escapes the repository: {rel}")
    if not path.is_file():
        sys.exit(f"cartesia.py: pronunciation dictionary not found: {rel} (set narration cartesia.dictionary to null to use none)")
    items = json.loads(path.read_text(encoding="utf-8-sig"))
    if not isinstance(items, list) or not all(isinstance(i, dict) and isinstance(i.get("text"), str) and isinstance(i.get("pronunciation"), str) for i in items):
        sys.exit(f'cartesia.py: {rel} must be a JSON array of {{"text", "pronunciation"}} entries')
    return [{k: i[k] for k in ("text", "pronunciation", "case_sensitive") if k in i} for i in items]


def dictionary_hash(items: list[dict]) -> str:
    return hashlib.sha256(json.dumps(items, sort_keys=True, ensure_ascii=False).encode()).hexdigest()


def ensure_dictionary(items: list[dict], cache: Path | None) -> str | None:
    """A dictionary is named after its content hash, so each content gets one immutable remote copy
    (found again by name on any machine) and the cache key needs no remote id."""
    if not items:
        return None
    h = dictionary_hash(items)
    name = f"motion-{h[:12]}"
    memo = cache / f"cartesia-dict-{h[:24]}.txt" if cache else None
    if memo and memo.exists():
        return memo.read_text(encoding="utf-8").strip()
    found, after = None, None
    while found is None:
        q = {"limit": 100, **({"starting_after": after} if after else {})}
        page = call("GET", "/pronunciation-dicts/", query=q)
        found = next((d["id"] for d in page.get("data", []) if d.get("name") == name), None)
        if not page.get("has_more") or not page.get("next_page"):
            break
        after = page["next_page"]
    if found is None:
        found = call("POST", "/pronunciation-dicts/", {"name": name, "description": "motion pipeline (content-addressed)", "items": items})["id"]
        print(f"  cartesia: created pronunciation dictionary {name} ({found})")
    if memo:
        memo.parent.mkdir(parents=True, exist_ok=True)
        memo.write_text(found, encoding="utf-8")
    return found


# --- narration lines -------------------------------------------------------------------------

def respell(text: str, say: dict) -> str:
    low = {k.lower(): v for k, v in say.items()}

    def one(m: re.Match) -> str:
        v = low.get(m.group(0).lower())
        return m.group(0) if v is None else (v[:1].upper() + v[1:] if m.group(0)[:1].isupper() else v)

    return re.sub(r"[\w-]+", one, text) if low else text


def options(cfg: dict) -> dict:
    # an explicit "dictionary": null turns the pronunciation dictionary off
    return {**DEFAULTS, **{k: v for k, v in (cfg.get("cartesia") or {}).items() if v is not None or k == "dictionary"}}


def plan(cfg: dict) -> tuple[dict, list[dict]]:
    """Every line to voice with its spoken text, voice and cache key (no network)."""
    opts = options(cfg)
    items = load_dictionary(opts.get("dictionary"))
    dict_h = dictionary_hash(items) if items else ""
    say = opts.get("say") or {}
    missing = sorted({line["speaker"] for sec in cfg["sections"] for line in sec["lines"]
                      if not isinstance(((cfg["speakers"].get(line["speaker"]) or {}).get("cartesia") or {}).get("voice"), str)
                      or not cfg["speakers"][line["speaker"]]["cartesia"]["voice"].strip()})
    if missing:
        sys.exit("cartesia.py: no Cartesia voice id for speaker(s) " + ", ".join(missing)
                 + '. Set speakers.<speaker>.cartesia.voice in narration.json or config/speakers.json'
                 + " (list candidates with: python tools/voice/cartesia.py voices).")
    rows = []
    for sec in cfg["sections"]:
        if not SECTION.match(sec.get("id", "")):
            sys.exit(f"cartesia.py: invalid section id {sec.get('id')!r}")
        for li, line in enumerate(sec["lines"]):
            spk = cfg["speakers"][line["speaker"]]["cartesia"]
            speed = float(spk.get("speed", opts["speed"]))
            text = re.sub(r"\s+", " ", MARKER.sub(" ", line["text"])).strip()
            spoken = respell(text, say)
            key = hashlib.sha256(json.dumps(["cartesia-v1", opts["model"], opts["language"], int(opts["sampleRate"]), speed,
                                             spk["voice"], dict_h, spoken], ensure_ascii=False).encode()).hexdigest()
            rows.append({"name": f'{sec["id"]}-{li}.wav', "speaker": line["speaker"], "voice": spk["voice"], "speed": speed,
                         "spoken": spoken, "key": key})
    return {**opts, "items": items}, rows


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def valid_wav(path: Path) -> bool:
    try:
        with wave.open(str(path), "rb") as audio:
            return audio.getnframes() > 0
    except (OSError, EOFError, wave.Error):
        return False


def write_atomic(path: Path, data: bytes) -> None:
    tmp = path.with_name(path.name + f".tmp-{os.getpid()}")
    tmp.write_bytes(data)
    os.replace(tmp, path)


def cmd_lines(args) -> None:
    cfg = json.loads(Path(args.narration).read_text(encoding="utf-8"))
    lines_dir, cache = Path(args.lines), Path(args.cache)
    opts, rows = plan(cfg)
    lines_dir.mkdir(parents=True, exist_ok=True)
    side_path = lines_dir / SIDECAR
    side = json.loads(side_path.read_text(encoding="utf-8")) if side_path.exists() else {}
    todo, reuse = [], []
    for r in rows:
        target = lines_dir / r["name"]
        if target.with_suffix(".mp3").exists():
            sys.exit(f"cartesia.py: {target.with_suffix('.mp3').name} would shadow the Cartesia clip; move it out of {lines_dir}")
        rec = side.get(r["name"])
        current = target.exists() and rec is not None and rec.get("sha256") == sha(target)
        if target.exists() and not current and not args.force:
            sys.exit(f"cartesia.py: {target.name} exists but was not made by this provider (or was edited); "
                     "move it away, or run voice with --force to replace every clip")
        if not args.force and current and rec.get("key") == r["key"]:
            continue
        cached = cache / f'cartesia-{r["key"][:32]}.wav'
        if not args.force and valid_wav(cached):
            reuse.append((r, cached))
        else:
            todo.append(r)
    chars = sum(len(r["spoken"]) for r in todo)
    print(f'  cartesia: {len(rows)} lines, {len(rows) - len(todo) - len(reuse)} unchanged, {len(reuse)} from cache, '
          f'{len(todo)} to synthesise (~{chars} characters = ~{chars} credits; {opts["model"]}, {opts["language"]})')
    if args.dry_run:
        for r in todo:
            print(f'    {r["name"]:16s} {r["speaker"]} {len(r["spoken"]):4d} chars  {r["spoken"][:60]}')
        return
    cache.mkdir(parents=True, exist_ok=True)
    dict_id = ensure_dictionary(opts["items"], cache) if todo else None
    for r, cached in reuse:
        write_atomic(lines_dir / r["name"], cached.read_bytes())
        side[r["name"]] = {"key": r["key"], "sha256": sha(lines_dir / r["name"]), "voice": r["voice"], "chars": len(r["spoken"])}
    for r in todo:
        print(f'    synth {r["name"]} ({len(r["spoken"])} chars, {r["speaker"]})')
        audio = tts(r["spoken"], r["voice"], {**opts, "speed": r["speed"]}, dict_id)
        write_atomic(cache / f'cartesia-{r["key"][:32]}.wav', audio)
        write_atomic(lines_dir / r["name"], audio)
        side[r["name"]] = {"key": r["key"], "sha256": sha(lines_dir / r["name"]), "voice": r["voice"], "chars": len(r["spoken"])}
        side_path.write_text(json.dumps(dict(sorted(side.items())), indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    live = {r["name"] for r in rows}
    side = {k: v for k, v in sorted(side.items()) if k in live}
    side_path.write_text(json.dumps(side, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")


# --- helpers ---------------------------------------------------------------------------------

def cmd_voices(args) -> None:
    for v in list_voices(args.language, args.gender):
        locales = ",".join(a.get("locale", "") for a in v.get("accents") or [])
        print(f'{v["id"]}  {v["name"]:10s} {v.get("gender") or "-":10s} {locales:14s} {(v.get("description") or "")[:70]}')


def cmd_samples(args) -> None:
    voices = [v for lang in args.language for v in list_voices(lang, args.gender)][: args.limit]
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    opts = dict(DEFAULTS)
    dict_id = ensure_dictionary(load_dictionary(DEFAULTS["dictionary"]), None)
    print(f"  cartesia: {len(voices)} samples x {len(args.text)} chars = ~{len(voices) * len(args.text)} credits")
    for v in voices:
        path = out / f'{v["name"].lower()}-{v["id"][:8]}.wav'
        path.write_bytes(tts(args.text, v["id"], opts, dict_id))
        print(f'{v["name"]:10s} {v["id"]}  {path}')


def cmd_dict(args) -> None:
    print(ensure_dictionary(load_dictionary(args.file), None) or "(dictionary is empty)")


def main() -> None:
    p = argparse.ArgumentParser(description="Cartesia voice provider and helpers")
    sub = p.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("lines", help="synthesise changed narration lines into voice-lines/ (used by motion.mjs voice)")
    s.add_argument("narration")
    s.add_argument("--lines", required=True)
    s.add_argument("--cache", required=True)
    s.add_argument("--force", action="store_true")
    s.add_argument("--dry-run", action="store_true")
    s.set_defaults(fn=cmd_lines)
    s = sub.add_parser("voices", help="list voices (default: Indonesian)")
    s.add_argument("--language", default="id")
    s.add_argument("--gender", choices=["masculine", "feminine", "gender_neutral"])
    s.set_defaults(fn=cmd_voices)
    s = sub.add_parser("samples", help="synthesise one sample sentence per voice into a temp folder")
    s.add_argument("--language", nargs="+", default=["id", "ms"], help="voice languages to draw candidates from, in order")
    s.add_argument("--gender", default="masculine")
    s.add_argument("--limit", type=int, default=4)
    s.add_argument("--text", default=SAMPLE_TEXT)
    s.add_argument("--out", default=str(Path(tempfile.gettempdir()) / "motion-cartesia-samples"))
    s.set_defaults(fn=cmd_samples)
    s = sub.add_parser("dict", help="create or reuse the pronunciation dictionary and print its id")
    s.add_argument("--file", default=DEFAULTS["dictionary"])
    s.set_defaults(fn=cmd_dict)
    args = p.parse_args()
    args.fn(args)


if __name__ == "__main__":
    main()
