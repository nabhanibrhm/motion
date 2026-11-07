"""Shrink long internal pauses in synthesised voice clips (free post-process, no API call).

Finds silences (RMS below --db in 10 ms windows) longer than --min inside a clip and shrinks each to
--max seconds with a short crossfade. Leading and trailing silence is left untouched and speech is never
cut (only whole windows below the threshold are removed). The clip's ``sha256`` in the sibling
``cartesia.json`` is updated (``key`` unchanged) so the pipeline still treats it as current.

Usage (repository root, root .venv python):
  python tools/voice/tighten.py --dir episodes/11_diskon/voice-lines --voice 04b567df a053f6bc [--dry-run]
  python tools/voice/tighten.py episodes/14_kerja/voice-lines/cuti-1.wav [--max 0.12] [--min 0.15]
Selection: file paths and/or --dir with --voice (voice id prefixes matched against cartesia.json).
"""
import argparse
import hashlib
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

WIN = 0.010
XFADE = 0.010


def find_pauses(x: np.ndarray, sr: int, db: float, min_len: float):
    mono = np.abs(x).max(axis=1) if x.ndim > 1 else np.abs(x)  # peak across channels is conservative
    w = max(1, int(sr * WIN))
    n = len(mono) // w
    rms = np.sqrt((mono[: n * w].reshape(n, w).astype(np.float64) ** 2).mean(axis=1))
    quiet = rms < 10 ** (db / 20)
    runs, i = [], 0
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]:
                j += 1
            if i > 0 and j < n and (j - i) * w / sr > min_len:  # internal only
                runs.append((i * w, j * w))
            i = j
        else:
            i += 1
    return runs


def tighten(x: np.ndarray, sr: int, runs, keep: float):
    """Keep ~keep/2 of each pause on both sides and splice them with a crossfade."""
    xf = int(sr * XFADE)
    half = (int(sr * keep) + xf) // 2
    cur, pos = None, 0
    for a, b in runs:
        seg = x[pos : a + half]
        cur = seg if cur is None else _blend(cur, seg, xf)
        pos = b - half
    tail = x[pos:]
    return tail if cur is None else _blend(cur, tail, xf)


def _blend(a, b, xf):
    # first piece 'a' already holds everything so far; 'b' starts xf samples "inside" the removed gap
    xf = min(xf, len(a), len(b))
    if xf == 0:
        return np.concatenate([a, b])
    ramp = np.linspace(0.0, 1.0, xf, endpoint=False).reshape((-1,) + (1,) * (a.ndim - 1))
    mix = a[-xf:] * (1 - ramp) + b[:xf] * ramp
    return np.concatenate([a[:-xf], mix, b[xf:]])


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("files", nargs="*")
    p.add_argument("--dir")
    p.add_argument("--voice", nargs="+", default=[], help="voice id prefix(es) from cartesia.json")
    p.add_argument("--max", type=float, default=0.12, help="longest pause kept, seconds")
    p.add_argument("--min", type=float, default=0.15, help="pauses longer than this are shrunk, seconds")
    p.add_argument("--db", type=float, default=-35.0)
    p.add_argument("--dry-run", action="store_true")
    a = p.parse_args()
    paths = [Path(f) for f in a.files]
    if a.dir:
        d = Path(a.dir)
        side = json.loads((d / "cartesia.json").read_text(encoding="utf-8"))
        for name, rec in sorted(side.items()):
            if not a.voice or any(rec.get("voice", "").startswith(v) for v in a.voice):
                paths.append(d / name)
    if not paths:
        sys.exit("tighten.py: no clips selected")
    total_before = total_after = 0.0
    for path in paths:
        x, sr = sf.read(str(path), dtype="float32", always_2d=False)
        info = sf.info(str(path))
        runs = find_pauses(x, sr, a.db, a.min)
        saved = sum((b - s) / sr - a.max for s, b in runs)
        saved = max(saved, 0.0)
        desc = ", ".join(f"{(b - s) / sr:.2f}" for s, b in runs) or "-"
        print(f"{path.name:18s} {len(x) / sr:6.2f}s  pauses>{a.min}: {len(runs)} [{desc}]  saves ~{saved:.2f}s")
        if a.dry_run or not runs:
            continue
        y = tighten(x, sr, runs, a.max)
        sf.write(str(path), y, sr, subtype=info.subtype, format="WAV")
        side_path = path.parent / "cartesia.json"
        if side_path.exists():
            side = json.loads(side_path.read_text(encoding="utf-8"))
            if path.name in side:
                side[path.name]["sha256"] = hashlib.sha256(path.read_bytes()).hexdigest()
                side_path.write_text(json.dumps(side, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
        total_before += len(x) / sr
        total_after += len(y) / sr
    if not a.dry_run:
        print(f"tightened: {total_before:.2f}s -> {total_after:.2f}s")


if __name__ == "__main__":
    main()
