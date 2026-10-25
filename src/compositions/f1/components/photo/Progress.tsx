import { CSSProperties, ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { toon } from "../../../../theme";
import { ramp } from "../toon/anim";
import { expoOut } from "./util";

type Common = {
  /** Fill target 0..100 (animates 0 -> pct). */
  pct: number;
  /** Scene frame the fill starts and its length in frames (default 40). */
  at?: number;
  dur?: number;
  /** Fill / track colours (default green on sage). */
  color?: string;
  track?: string;
  exitAt?: number;
};

export type ProgressBarProps = Common & {
  /** Top-left in frame px and size. Defaults x 140, y 500, w 640, h 14. */
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  /** Optional small caption above the bar and a live percentage on the right. */
  label?: string;
  showValue?: boolean;
  labelColor?: string;
  style?: CSSProperties;
};

/** Thin editorial bar that fills 0 -> pct. */
export const ProgressBar: React.FC<ProgressBarProps> = ({ pct, at = 0, dur = 40, color = toon.green, track = toon.sage, exitAt, x = 140, y = 500, w = 640, h = 14, label, showValue = false, labelColor = toon.ink, style }) => {
  const frame = useCurrentFrame();
  const appear = ramp(frame, at, 10);
  const fill = ramp(frame, at + 4, dur, expoOut);
  const out = exitAt === undefined ? 1 : 1 - ramp(frame, exitAt, 10);
  if (frame < at || out <= 0) return null;
  const v = pct * fill;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: appear * out, ...style }}>
      {(label || showValue) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontFamily: toon.font.body, fontWeight: 800, fontSize: 26, letterSpacing: "0.12em", textTransform: "uppercase", color: labelColor }}>
          <span>{label}</span>
          {showValue && <span style={{ fontVariantNumeric: "tabular-nums", color }}>{Math.round(v)}%</span>}
        </div>
      )}
      <div style={{ width: "100%", height: h, borderRadius: h, background: track, overflow: "hidden" }}>
        <div style={{ width: `${Math.max(0, Math.min(100, v))}%`, height: "100%", borderRadius: h, background: color }} />
      </div>
    </div>
  );
};

export type RingProps = Common & {
  /** Centre in frame px (default 960, 540) and outer diameter. */
  x?: number;
  y?: number;
  size?: number;
  /** Arc thickness in px (default size * 0.09). */
  stroke?: number;
  /** Show the live percentage in the middle (number + %), or pass your own `children`. */
  showValue?: boolean;
  valueColor?: string;
  children?: ReactNode;
  style?: CSSProperties;
};

/** Circular arc that fills clockwise from 12 o'clock, 0 -> pct. */
export const Ring: React.FC<RingProps> = ({ pct, at = 0, dur = 45, color = toon.green, track = toon.sage, exitAt, x = 960, y = 540, size = 360, stroke, showValue = true, valueColor = toon.ink, children, style }) => {
  const frame = useCurrentFrame();
  const appear = ramp(frame, at, 10);
  const fill = ramp(frame, at + 4, dur, expoOut);
  const out = exitAt === undefined ? 1 : 1 - ramp(frame, exitAt, 10);
  if (frame < at || out <= 0) return null;
  const sw = stroke ?? size * 0.09;
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const v = pct * fill;
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, opacity: appear * out, ...style }}>
      <svg width={size} height={size} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(0, Math.min(100, v)) / 100)} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", fontFamily: toon.font.display, fontWeight: 800, color: valueColor }}>
        {children ?? (showValue && <span style={{ fontSize: size * 0.28, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{Math.round(v)}<span style={{ fontSize: size * 0.15, color }}>%</span></span>)}
      </div>
    </div>
  );
};
