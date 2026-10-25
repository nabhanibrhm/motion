import { CSSProperties } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { driftPx, popScale, ramp } from "./anim";

/** Slow constant drift of its children (default -2 px/s horizontally). Frame-driven. */
export const Drift: React.FC<{
  /** px per second along x (default -2). */
  px?: number;
  /** px per second along y (default 0). */
  py?: number;
  children?: React.ReactNode;
  style?: CSSProperties;
}> = ({ px = -2, py = 0, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return <div style={{ ...style, transform: `translate(${driftPx(t, px)}px, ${driftPx(t, py)}px)` }}>{children}</div>;
};

export type EnterFrom = "right" | "left" | "up" | "down" | "none";

/**
 * Fade + slide entrance (ease-out). Text: from "right", dist 26, 12 frames.
 * Illustrations: use a larger `dist` and `frames` (e.g. 60 / 20) so they ease in.
 */
export const Enter: React.FC<{
  /** Frame (scene-relative) at which the entrance starts. */
  at?: number;
  from?: EnterFrom;
  dist?: number;
  frames?: number;
  /** Frame at which to fade back out (over 8 frames). */
  exitAt?: number;
  children?: React.ReactNode;
  style?: CSSProperties;
}> = ({ at = 0, from = "right", dist = 26, frames = 12, exitAt, children, style }) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, at, frames);
  const out = exitAt === undefined ? 1 : 1 - ramp(frame, exitAt, 8);
  const d = (1 - p) * dist;
  const tx = from === "right" ? d : from === "left" ? -d : 0;
  const ty = from === "down" ? d : from === "up" ? -d : 0;
  return <div style={{ ...style, opacity: p * out, transform: `translate(${tx}px, ${ty}px)` }}>{children}</div>;
};

/** Wrapper that scales in with an overshoot (back-ease ~1.7) at frame `at`. */
export const Pop: React.FC<{
  at?: number;
  frames?: number;
  /** transform-origin (default "50% 50%"). */
  origin?: string;
  /** Frame at which to shrink back out (over 8 frames). */
  exitAt?: number;
  children?: React.ReactNode;
  style?: CSSProperties;
}> = ({ at = 0, frames = 14, origin = "50% 50%", exitAt, children, style }) => {
  const frame = useCurrentFrame();
  const s = popScale(frame, at, frames);
  const out = exitAt === undefined ? 1 : 1 - ramp(frame, exitAt, 8);
  const scale = s * out;
  return (
    <div
      style={{
        ...style,
        transformOrigin: origin,
        transform: `scale(${scale})`,
        opacity: Math.min(1, s * 4) * out,
        visibility: scale <= 0.001 ? "hidden" : "visible",
      }}
    >
      {children}
    </div>
  );
};
