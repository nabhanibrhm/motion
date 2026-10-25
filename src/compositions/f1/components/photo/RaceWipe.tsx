import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { toon } from "../../../../theme";
import { ramp } from "../toon/anim";
import { alpha, expoInOut } from "./util";

export type RaceWipeProps = {
  /** Scene frame at which the frame is fully covered: put your cut here (change the content on this frame). */
  at: number;
  /** Total frames from first bar entering to last bar leaving. Default 20 (~0.67 s). */
  dur?: number;
  /** Travel direction. Default "right" (bars arrive from the left edge). */
  direction?: "right" | "left";
  /** Number of horizontal bars. Default 9. */
  bars?: number;
  /** Lean of the leading edges in degrees. Default 14. */
  skew?: number;
};

// Row weights and colours, repeated down the frame. Mostly green and ink, with sage accents.
const WEIGHTS = [1.2, 0.7, 1.5, 0.9, 1.1, 0.6, 1.4, 0.8, 1.0];
const COLORS = [toon.ink, toon.green, toon.ink, toon.sage, toon.green, toon.ink, toon.green, toon.sage, toon.ink];

/** Full-frame F1 race wipe: horizontal bars sweep across fast with a speed-blur tail, covering the frame at `at` and leaving the other side. */
export const RaceWipe: React.FC<RaceWipeProps> = ({ at, dur = 20, direction = "right", bars = 9, skew = 14 }) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const inF = Math.round(dur * 0.5);
  const outF = Math.round(dur * 0.5);
  if (frame < at - inF - 1 || frame > at + outF + 1) return null;

  const total = WEIGHTS.slice(0, bars).reduce((a, b) => a + b, 0);
  const lean = Math.tan((skew * Math.PI) / 180) * H;
  const barW = W + lean + 200; // wider than the frame so the cover is solid
  const S = Math.min(6, Math.floor(inF / 2)); // max stagger frames

  // Position of bar i (left edge, px) at a given frame: enters from the left, holds around `at`, leaves right.
  const posAt = (i: number, f: number) => {
    const d = (i * 7) % (S + 1); // deterministic stagger order, not a plain top-to-bottom stair
    const enter = ramp(f, at - inF + d, inF - 1 - d, expoInOut);
    const leave = ramp(f, at + 1 + d, outF - d, expoInOut);
    return (enter - 1 + leave) * barW - (lean / 2 + 100);
  };

  let top = 0;
  const rows = Array.from({ length: bars }, (_, i) => {
    const hRow = (WEIGHTS[i % WEIGHTS.length] / total) * H;
    const y0 = top;
    top += hRow;
    const color = COLORS[i % COLORS.length];
    const x = posAt(i, frame);
    const vel = Math.abs(x - posAt(i, frame - 1));
    const tail = Math.min(vel * 1.1, 760); // speed blur: grows with speed
    const streakY = y0 + hRow * (0.25 + 0.5 * ((i * 37) % 10) / 10);
    return (
      <div key={i} style={{ position: "absolute", left: 0, top: y0 - 0.5, width: W, height: hRow + 1, overflow: "visible" }}>
        <div style={{ position: "absolute", left: x, top: 0, width: barW, height: "100%", background: color }} />
        {/* speed blur tail behind the trailing edge */}
        <div style={{ position: "absolute", left: x - tail, top: 0, width: tail, height: "100%", background: `linear-gradient(90deg, ${alpha(color, 0)}, ${alpha(color, 0.85)})` }} />
        {/* smeared leading edge */}
        <div style={{ position: "absolute", left: x + barW, top: 0, width: tail * 0.55, height: "100%", background: `linear-gradient(90deg, ${alpha(color, 0.8)}, ${alpha(color, 0)})` }} />
        <div style={{ position: "absolute", left: x + barW + tail * 0.2, top: streakY - y0 + 14, width: tail * 0.9, height: 3, background: `linear-gradient(90deg, ${alpha(toon.paper, 0.5)}, ${alpha(toon.paper, 0)})` }} />
        {/* thin streaks beyond the tail */}
        <div style={{ position: "absolute", left: x - tail * 1.5, top: streakY - y0, width: tail * 1.1, height: 3, background: `linear-gradient(90deg, ${alpha(toon.paper, 0)}, ${alpha(toon.paper, 0.55)})` }} />
      </div>
    );
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none", transform: direction === "left" ? "scaleX(-1)" : undefined }}>
      {/* skew about the frame centre so every bar leans the same way */}
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `skewX(${-skew}deg)`, transformOrigin: "50% 50%" }}>{rows}</div>
    </AbsoluteFill>
  );
};
