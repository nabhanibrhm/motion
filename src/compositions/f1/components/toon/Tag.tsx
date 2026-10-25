import { useCurrentFrame, useVideoConfig } from "remotion";
import { toon } from "../../../../theme";
import { mix } from "./color";
import { popScale, ramp, wave } from "./anim";

export type Pt = { x: number; y: number };

export type LeaderProps = {
  /** Object end of the line (gets a dot). */
  from: Pt;
  /** Label end of the line. */
  to: Pt;
  /** Frame at which the line starts drawing. */
  at?: number;
  /** Frames to draw (default 14). */
  frames?: number;
  color?: string;
  width?: number;
  dot?: boolean;
};

/** Thin leader line drawn from `from` to `to` (full-frame SVG overlay, frame coordinates). */
export const Leader: React.FC<LeaderProps> = ({ from, to, at = 0, frames = 14, color = mix(toon.cream, toon.ground, 0.3), width = 3, dot = true }) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const p = ramp(frame, at, frames);
  const dp = popScale(frame, at, 10);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}>
      <path d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`} pathLength={1} stroke={color} strokeWidth={width} strokeLinecap="round" fill="none" strokeDasharray="1 1" strokeDashoffset={1 - p} />
      {dot && <circle cx={from.x} cy={from.y} r={7 * dp} fill={color} />}
    </svg>
  );
};

export type TagProps = {
  text: string;
  /** Centre of the label. */
  x: number;
  y: number;
  /** Frame at which the tag pops in (its leader draws just before). */
  at?: number;
  /** If set, a leader is drawn from this point on the art to the label edge. */
  point?: Pt;
  /** "light" cream tag (default), "red", "amber", "dark". */
  variant?: "light" | "red" | "amber" | "dark";
  fontSize?: number;
  /** Override the estimated label width (px). */
  labelWidth?: number;
};

const VARIANTS = {
  light: { bg: toon.paper, fg: toon.ink },
  red: { bg: toon.green, fg: toon.paper },
  amber: { bg: toon.amber, fg: toon.ink },
  dark: { bg: toon.ink, fg: toon.paper },
};

/** White label tag (flat, rounded) with an optional leader line to a point on the art. */
export const Tag: React.FC<TagProps> = ({ text, x, y, at = 0, point, variant = "light", fontSize = 34, labelWidth }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const v = VARIANTS[variant];
  const padX = 22;
  const w = labelWidth ?? text.length * fontSize * 0.55 + padX * 2;
  const h = fontSize * 1.22 + 18;
  const bob = wave(t, 2.5, x * 0.003) * 2;
  const s = popScale(frame, at, 12);

  // Where the leader meets the label: the label rectangle's edge facing `point`.
  let edge: Pt | undefined;
  if (point) {
    const dx = point.x - x;
    const dy = point.y - y;
    const k = Math.min(dx === 0 ? Infinity : w / 2 / Math.abs(dx), dy === 0 ? Infinity : h / 2 / Math.abs(dy));
    edge = { x: x + dx * k, y: y + dy * k };
  }

  return (
    <>
      {point && edge && <Leader from={point} to={edge} at={Math.max(0, at - 10)} frames={12} />}
      <div
        style={{
          position: "absolute",
          left: x - w / 2,
          top: y - h / 2 + bob,
          width: w,
          height: h,
          borderRadius: 16,
          background: v.bg,
          color: v.fg,
          fontFamily: toon.font.body,
          fontWeight: 800,
          fontSize,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          whiteSpace: "nowrap",
          boxShadow: `0 6px 0 ${toon.ink}33, inset 0 0 0 3px ${variant === "light" ? toon.sageDeep : "transparent"}`,
          transform: `scale(${s})`,
          opacity: Math.min(1, s * 4),
          visibility: s <= 0.001 ? "hidden" : "visible",
        }}
      >
        {text}
      </div>
    </>
  );
};

/** Dashed cut-away outline for diagram moments: rounded rect (give `h`) or circle (omit `h`). */
export const CutEdge: React.FC<{
  /** Centre. */
  x: number;
  y: number;
  /** Width (or diameter for a circle). */
  w: number;
  h?: number;
  at?: number;
  frames?: number;
  color?: string;
}> = ({ x, y, w, h, at = 0, frames = 16, color = toon.cream }) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const p = ramp(frame, at, frames);
  const dashOffset = -frame * 0.4; // marching ants, very slow
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible", opacity: p }}>
      {h === undefined ? (
        <circle cx={x} cy={y} r={w / 2} fill="none" stroke={color} strokeWidth={4} strokeDasharray="14 12" strokeDashoffset={dashOffset} />
      ) : (
        <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={28} fill="none" stroke={color} strokeWidth={4} strokeDasharray="14 12" strokeDashoffset={dashOffset} />
      )}
    </svg>
  );
};
