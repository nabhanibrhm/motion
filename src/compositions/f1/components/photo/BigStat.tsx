import { CSSProperties } from "react";
import { useCurrentFrame } from "remotion";
import { toon } from "../../../../theme";
import { ramp } from "../toon/anim";
import { expoOut } from "./util";

export type BigStatProps = {
  /** Final number (counts 0 -> value). */
  value: number;
  /** Text after the number, e.g. "%", "M", "x". Rendered smaller and raised. */
  suffix?: string;
  prefix?: string;
  /** Decimal places (default 0). */
  decimals?: number;
  /** Optional caption under the number. */
  label?: string;
  /** Scene frame the count starts, and its length in frames (default 45). */
  at?: number;
  dur?: number;
  /** Top-left in frame px; align "center" treats x as the centre. Defaults 140 / 300. */
  x?: number;
  y?: number;
  align?: "left" | "center";
  fontSize?: number;
  /** Number colour (default the editorial accent); on black pass toon.paper. */
  color?: string;
  suffixColor?: string;
  labelColor?: string;
  exitAt?: number;
  style?: CSSProperties;
};

/** Large editorial statistic: tabular numerals counting 0 -> value with a smaller suffix. */
export const BigStat: React.FC<BigStatProps> = ({
  value,
  suffix,
  prefix,
  decimals = 0,
  label,
  at = 0,
  dur = 45,
  x = 140,
  y = 300,
  align = "left",
  fontSize = 280,
  color = toon.green,
  suffixColor,
  labelColor = toon.ink,
  exitAt,
  style,
}) => {
  const frame = useCurrentFrame();
  const appear = ramp(frame, at, 14, expoOut);
  const count = ramp(frame, at, dur, expoOut);
  const out = exitAt === undefined ? 1 : 1 - ramp(frame, exitAt, 10);
  if (frame < at || out <= 0) return null;
  const shown = (value * count).toFixed(decimals);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `${align === "center" ? "translateX(-50%) " : ""}translateY(${(1 - appear) * 28}px)`,
        opacity: appear * out,
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", fontFamily: toon.font.display, fontWeight: 800, lineHeight: 0.92, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", color }}>
        {prefix && <span style={{ fontSize: fontSize * 0.5, marginTop: fontSize * 0.08, marginRight: fontSize * 0.04 }}>{prefix}</span>}
        <span style={{ fontSize }}>{shown}</span>
        {suffix && <span style={{ fontSize: fontSize * 0.5, marginTop: fontSize * 0.06, marginLeft: fontSize * 0.03, color: suffixColor ?? color }}>{suffix}</span>}
      </div>
      {label && (
        <div style={{ marginTop: fontSize * 0.08, fontFamily: toon.font.body, fontWeight: 800, fontSize: Math.max(26, fontSize * 0.13), letterSpacing: "0.14em", textTransform: "uppercase", color: labelColor, opacity: 0.8 * ramp(frame, at + 8, 14) }}>
          {label}
        </div>
      )}
    </div>
  );
};
