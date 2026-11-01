"""Generate the music bed: a quiet, original "case file" loop (A minor, 96 BPM) synthesised here, so there is no
licence to track. Deterministic (seeded noise), written once to public/music/bed.mp3; scripts/master.mjs mixes it
under the voice and ducks it while anyone speaks.

Usage: python voiceover/bed.py [seconds]   (default 75; the master trims and fades it to the video length)
"""

import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
BPM = 96
BEAT = 60 / BPM
rng = np.random.default_rng(7)


def hz(midi: float) -> float:
    return 440.0 * 2 ** ((midi - 69) / 12)


def env(n: int, attack: float, decay: float) -> np.ndarray:
    t = np.arange(n) / SR
    return np.minimum(1, t / attack) * np.exp(-t / decay)


def pluck(midi: float, dur: float) -> np.ndarray:
    """Karplus-Strong string: a soft pizzicato."""
    n = int(dur * SR)
    p = int(SR / hz(midi))
    buf = rng.uniform(-1, 1, p)
    out = np.empty(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.994
    return out * env(n, 0.003, 0.5)


def tone(midi: float, dur: float, attack: float, decay: float, harmonics=(1, 0.3, 0.1)) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = sum(a * np.sin(2 * np.pi * hz(midi) * (k + 1) * t) for k, a in enumerate(harmonics))
    return x * env(n, attack, decay)


def noise_hit(dur: float, decay: float, hp: bool) -> np.ndarray:
    n = int(dur * SR)
    x = rng.uniform(-1, 1, n)
    if hp:
        x = np.diff(x, prepend=0)  # crude high-pass: a brushed hat
    return x * env(n, 0.001, decay)


def kick(dur: float = 0.35) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 50 + 70 * np.exp(-t / 0.04)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.12)


def add(track: np.ndarray, x: np.ndarray, at: float, gain: float) -> None:
    i = int(at * SR)
    j = min(len(track), i + len(x))
    if i < len(track):
        track[i:j] += gain * x[: j - i]


def main(seconds: float) -> None:
    n = int(seconds * SR)
    mix = np.zeros(n)
    # Am - F - C - G, one bar (4 beats) each; roots for the bass, arpeggio notes for the pluck
    chords = [(57, [69, 72, 76, 72]), (53, [65, 69, 72, 69]), (48, [64, 67, 72, 67]), (55, [62, 67, 71, 67])]
    bar = 4 * BEAT
    for b in range(int(seconds / bar) + 1):
        t0 = b * bar
        root, arp = chords[b % 4]
        add(mix, tone(root - 12, bar, 0.01, 0.6, (1, 0.25)), t0, 0.32)            # bass on the one
        add(mix, tone(root - 12, BEAT, 0.01, 0.25, (1, 0.25)), t0 + 2.5 * BEAT, 0.2)  # and a push before three
        for k in range(8):                                                       # eighth-note pizzicato
            if k in (3, 7) and b % 2:
                continue
            add(mix, pluck(arp[k % 4], 0.6), t0 + k * BEAT / 2, 0.22 if k % 2 == 0 else 0.15)
        for m in arp[:3]:                                                        # soft pad under it all
            add(mix, tone(m - 12, bar, 0.4, 2.5, (1, 0.15)), t0, 0.05)
        for k in range(4):
            if k in (0, 2):
                add(mix, kick(), t0 + k * BEAT, 0.35)
            add(mix, noise_hit(0.12, 0.03, True), t0 + k * BEAT + BEAT / 2, 0.05)
    mix /= np.max(np.abs(mix)) / 0.5
    fade = int(1.0 * SR)
    mix[:fade] *= np.linspace(0, 1, fade)
    pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes()
    out = ROOT / "public" / "music" / "bed.mp3"
    out.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-",
                    "-codec:a", "libmp3lame", "-b:a", "160k", str(out)], input=pcm, check=True)
    print(f"wrote {out.relative_to(ROOT)} ({seconds:.0f} s)")


if __name__ == "__main__":
    main(float(sys.argv[1]) if len(sys.argv) > 1 else 75)
