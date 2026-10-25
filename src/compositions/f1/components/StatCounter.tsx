import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { toon } from "../../../theme";

type Props = {
  from?: number;
  to: number;
  prefix?: string;
  suffix?: string;
  label?: string;
  decimals?: number;
  delay?: number;
  countFrames?: number;
  fontSize?: number;
  color?: string;
  /** Label colour (default muted grey for light grounds; on black pass editorial.mutedOnDark). */
  labelColor?: string;
};

const format = (n: number, decimals: number) => {
  const [int, dec] = n.toFixed(decimals).split(".");
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (dec ? `.${dec}` : "");
};

// Number counting from `from` to `to` with a label underneath.
export const StatCounter: React.FC<Props> = ({
  from = 0,
  to,
  prefix = "",
  suffix = "",
  label,
  decimals = 0,
  delay = 0,
  countFrames = 45,
  fontSize = 220,
  color = toon.cream,
  labelColor = toon.muted,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = interpolate(frame - delay, [0, countFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const pop = spring({ frame: frame - delay, fps, config: { damping: 12, mass: 0.6 } });
  const labelIn = spring({ frame: frame - delay - 10, fps, config: { damping: 16 } });

  return (
    <div style={{ fontFamily: toon.font.display, textAlign: "center", color }}>
      <div
        style={{
          fontSize,
          fontWeight: 800,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          opacity: Math.min(1, pop * 2),
          transform: `scale(${interpolate(pop, [0, 1], [0.8, 1])})`,
        }}
      >
        {prefix}
        {format(from + (to - from) * t, decimals)}
        {suffix}
      </div>
      {label && (
        <div
          style={{
            marginTop: fontSize * 0.08,
            fontSize: fontSize * 0.18,
            fontWeight: 700,
            fontFamily: toon.font.body,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: labelColor,
            opacity: labelIn,
            transform: `translateY(${interpolate(labelIn, [0, 1], [20, 0])}px)`,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};
