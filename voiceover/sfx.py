"""Synthesise the F1 video's sound effects (deterministic, numpy only) into public/sfx/*.wav.

Usage: python voiceover/sfx.py
44.1 kHz mono 16-bit, every file peak-normalised to -6.2 dBFS (0.49), a few hundred ms long.
Seeded RNG, so re-running reproduces identical bytes.
"""

import wave
from pathlib import Path

import numpy as np

OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
SR = 44100
PEAK = 0.49  # -6.2 dBFS


def t_axis(sec: float) -> np.ndarray:
    return np.arange(int(sec * SR)) / SR


def noise(sec: float, seed: int) -> np.ndarray:
    return np.random.default_rng(seed).uniform(-1, 1, int(sec * SR)).astype(np.float64)


def lowpass(x: np.ndarray, cutoff) -> np.ndarray:
    """One-pole low-pass; `cutoff` may be a scalar or a per-sample array (Hz)."""
    c = np.broadcast_to(np.asarray(cutoff, dtype=np.float64), x.shape)
    a = 1 - np.exp(-2 * np.pi * c / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def highpass(x: np.ndarray, cutoff) -> np.ndarray:
    return x - lowpass(x, cutoff)


def bandpass(x: np.ndarray, lo, hi) -> np.ndarray:
    return lowpass(highpass(x, lo), hi)


def decay(sec: float, tau: float, attack: float = 0.002) -> np.ndarray:
    t = t_axis(sec)
    return np.exp(-t / tau) * np.minimum(1, t / attack)


def fade_out(x: np.ndarray, ms: float = 8) -> np.ndarray:
    n = int(ms / 1000 * SR)
    x = x.copy()
    x[-n:] *= np.linspace(1, 0, n)
    return x


def hann_env(sec: float, peak_at: float = 0.5) -> np.ndarray:
    t = t_axis(sec) / sec
    return np.sin(np.pi * np.clip(np.where(t < peak_at, 0.5 * t / peak_at, 0.5 + 0.5 * (t - peak_at) / (1 - peak_at)), 0, 1)) ** 2


def sine(freq, sec: float, phase: float = 0.0) -> np.ndarray:
    f = np.broadcast_to(np.asarray(freq, dtype=np.float64), (int(sec * SR),))
    return np.sin(2 * np.pi * np.cumsum(f) / SR + phase)


def bell(f0: float, sec: float, tau: float) -> np.ndarray:
    partials = [(1, 1.0), (2.76, 0.45), (5.4, 0.22), (8.93, 0.1)]
    t = t_axis(sec)
    return sum(a * np.sin(2 * np.pi * f0 * r * t) * np.exp(-t / (tau / (1 + 0.6 * i))) for i, (r, a) in enumerate(partials)) * np.minimum(1, t / 0.002)


def place(total: float, *items) -> np.ndarray:
    out = np.zeros(int(total * SR))
    for at, x in items:
        i = int(at * SR)
        out[i:i + len(x)] += x[: len(out) - i]
    return out


def whoosh() -> np.ndarray:
    sec = 0.6
    cut = 300 + 5200 * hann_env(sec, 0.45)
    return lowpass(noise(sec, 1), cut) * hann_env(sec, 0.45)


def swoosh_soft() -> np.ndarray:
    sec = 0.5
    cut = 250 + 1800 * hann_env(sec, 0.4)
    return lowpass(noise(sec, 2), cut) * hann_env(sec, 0.4) * 0.8


def pop() -> np.ndarray:
    sec = 0.16
    f = 180 + 520 * np.exp(-t_axis(sec) / 0.018)
    return sine(f, sec) * decay(sec, 0.035) + 0.25 * lowpass(noise(sec, 3), 2500) * decay(sec, 0.004, 0.0005)


def click() -> np.ndarray:
    sec = 0.07
    return highpass(noise(sec, 4), 1500) * decay(sec, 0.006, 0.0003) * 0.7 + 0.5 * sine(2100, sec) * decay(sec, 0.01, 0.0003)


def ding() -> np.ndarray:
    return fade_out(bell(1320, 1.0, 0.45), 30)


def tick() -> np.ndarray:
    sec = 0.05
    return (sine(3200, sec) * 0.6 + highpass(noise(sec, 5), 3000) * 0.4) * decay(sec, 0.006, 0.0003)


def riser() -> np.ndarray:
    sec = 1.0
    t = t_axis(sec) / sec
    cut = 200 + 6000 * t**2
    n = lowpass(noise(sec, 6), cut) * (0.15 + 0.85 * t**1.5)
    tone = sine(180 + 900 * t**2, sec) * 0.35 * t**1.5
    return fade_out(n + tone, 12)


def door_open() -> np.ndarray:
    """Soft creak: wobbling low sawtooth through a low-pass, plus a little air."""
    sec = 0.95
    t = t_axis(sec)
    rng = np.random.default_rng(7)
    wobble = np.convolve(rng.normal(0, 1, len(t)), np.ones(900) / 900, mode="same") * 28
    f = 95 + 55 * (t / sec) + wobble
    ph = np.cumsum(f) / SR
    saw = 2 * (ph % 1) - 1
    creak = lowpass(saw, 900 + 500 * np.sin(2 * np.pi * 3.1 * t))
    air = lowpass(noise(sec, 8), 1400) * 0.25
    return (creak * 0.8 + air) * hann_env(sec, 0.55)


def cash() -> np.ndarray:
    ratchet = highpass(noise(0.12, 9), 2500) * (0.5 + 0.5 * np.sin(2 * np.pi * 70 * t_axis(0.12))) ** 2 * decay(0.12, 0.05) * 0.5
    return fade_out(place(0.9, (0.0, ratchet), (0.12, 0.8 * bell(2093, 0.78, 0.3)), (0.2, 0.7 * bell(2637, 0.7, 0.3))), 30)


def shutter() -> np.ndarray:
    def hit(seed: int, f: float) -> np.ndarray:
        s = 0.06
        return bandpass(noise(s, seed), 800, 5000) * decay(s, 0.008, 0.0003) + 0.6 * sine(f, s) * decay(s, 0.015, 0.0003)
    return place(0.25, (0.0, hit(10, 140)), (0.075, 0.8 * hit(11, 110)))


SOUNDS = {
    "whoosh": whoosh, "swoosh-soft": swoosh_soft, "pop": pop, "click": click, "ding": ding, "tick": tick,
    "riser": riser, "door-open": door_open, "cash": cash, "shutter": shutter,
}


def write(name: str, x: np.ndarray) -> None:
    x = x - x.mean()
    x = x / np.max(np.abs(x)) * PEAK
    with wave.open(str(OUT / f"{name}.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype("<i2").tobytes())
    print(f"  {name:12s} {len(x) / SR:.2f}s  peak {20 * np.log10(np.max(np.abs(x))):.1f} dBFS")


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for n, fn in SOUNDS.items():
        write(n, fn())
