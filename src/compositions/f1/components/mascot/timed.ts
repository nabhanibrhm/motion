/**
 * Tiny frame-driven timeline: a value, or a list of [frame, value] steps (frames of the containing Sequence).
 * `["idle"]`-style constants and `[[0, "idle"], [90, "point"]]` timelines are both `Timed<T>`.
 * The value of a step holds until the next step. Entries need not be sorted.
 */
export type Timed<T> = T | readonly (readonly [number, T])[];

export type Sample<T> = {
  value: T;
  /** Frames since this step began (0 before the first step). */
  since: number;
  /** The step before this one, if any. */
  prev?: T;
  /** Frame at which this step began (0 for constants). */
  at: number;
};

export const isTimeline = <T>(v: Timed<T>): v is readonly (readonly [number, T])[] => Array.isArray(v);

export const sample = <T>(v: Timed<T>, frame: number): Sample<T> => {
  if (!isTimeline(v)) return { value: v, since: Math.max(0, frame), at: 0 };
  const steps = [...v].sort((a, b) => a[0] - b[0]);
  if (steps.length === 0) throw new Error("Timed: empty timeline");
  let i = 0;
  for (let k = 0; k < steps.length; k++) if (steps[k][0] <= frame) i = k;
  return {
    value: steps[i][1],
    since: Math.max(0, frame - steps[i][0]),
    prev: i > 0 ? steps[i - 1][1] : undefined,
    at: steps[i][0],
  };
};

/** Frames at which a timeline changes (empty for constants). */
export const stepFrames = <T>(v: Timed<T>): number[] => (isTimeline(v) ? v.map((s) => s[0]) : []);

/** Talking: true, false, or [start, end) frame ranges. Returns frames since the active range began, or -1 when silent. */
export type Talking = boolean | readonly (readonly [number, number])[];

export const talkFrameAt = (talking: Talking, frame: number, at = 0): number => {
  if (talking === true) return Math.max(0, frame - at);
  if (talking === false) return -1;
  for (const [a, b] of talking) if (frame >= a && frame < b) return frame - a;
  return -1;
};
