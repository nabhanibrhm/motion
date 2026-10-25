import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const easeOut = Easing.out(Easing.cubic);
/** Overshoot ease (back ~1.7) for pops. */
export const backOut = Easing.out(Easing.back(1.7));

/** 0 -> 1 progress starting at frame `at`, lasting `frames`. */
export const ramp = (frame: number, at: number, frames = 12, easing: (t: number) => number = easeOut) =>
  interpolate(frame, [at, at + frames], [0, 1], { ...clamp, easing });

/** Pop scale: 0 -> ~1.1 -> 1 with overshoot, starting at `at`. */
export const popScale = (frame: number, at: number, frames = 14) => ramp(frame, at, frames, backOut);

/** Seconds since the start of the scene (frame 0). */
export const useSeconds = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

/** Sine in [-1, 1] with a period in seconds; `phase` is in cycles. */
export const wave = (t: number, period: number, phase = 0) => Math.sin(Math.PI * 2 * (t / period + phase));

/** Smooth 0..1 triangle-ish cycle (0.5 + 0.5 sine). */
export const pulse = (t: number, period: number, phase = 0) => 0.5 + 0.5 * wave(t, period, phase);

/** Slow constant drift in px for a scene time in seconds (default -2 px/s). */
export const driftPx = (t: number, pxPerSec = -2) => t * pxPerSec;
