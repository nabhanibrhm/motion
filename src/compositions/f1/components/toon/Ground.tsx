import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { toon } from "../../../../theme";
import { mix } from "./color";

export type GroundTone = "plum" | "alt" | "deep" | "old" | "ink";

export type GroundProps = {
  /** Preset ground: "plum" (default; editorial light #EEEEEE), "alt" (panel grey #DDDDDD), "deep" / "ink" (black), "old" (sepia flashback). */
  tone?: GroundTone;
  /** Override the ground colour. */
  color?: string;
  /** Strength 0..1 of the soft radial glow behind the art (default 0.5). */
  glow?: number;
  glowColor?: string;
  /** Glow centre as fractions of the frame (default 0.72, 0.5: behind the right-half art). */
  glowX?: number;
  glowY?: number;
  /** Number of floating particles (default 26). */
  particles?: number;
  particleColor?: string;
  /** Changes the particle layout. */
  seed?: number;
};

const TONES: Record<GroundTone, { bg: string; glow: string; dot: string }> = {
  plum: { bg: toon.ground, glow: "#F8F8F8", dot: toon.ink },
  alt: { bg: toon.sage, glow: "#E8E8E8", dot: toon.ink },
  deep: { bg: toon.ink, glow: "#1F1F1F", dot: toon.paper },
  ink: { bg: toon.ink, glow: "#1F1F1F", dot: toon.paper },
  old: { bg: toon.old.ground, glow: "#EBDFC6", dot: toon.old.cream },
};

/** Calm solid ground with an optional soft glow and slow floating particles (all deterministic). */
export const Ground: React.FC<GroundProps> = ({
  tone = "plum",
  color,
  glow = 0.5,
  glowColor,
  glowX = 0.72,
  glowY = 0.5,
  particles = 26,
  particleColor,
  seed = 1,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = frame / fps;
  const p = TONES[tone];
  const bg = color ?? p.bg;
  const gc = glowColor ?? (color ? mix(color, toon.paper, 0.1) : p.glow);
  const dot = particleColor ?? p.dot;

  return (
    <AbsoluteFill style={{ backgroundColor: bg, overflow: "hidden" }}>
      {glow > 0 && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 55% 70% at ${glowX * 100}% ${glowY * 100}%, ${gc} 0%, ${mix(bg, gc, 0.45)} 55%, ${bg} 100%)`,
            opacity: Math.min(1, glow * 1.6),
          }}
        />
      )}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: particles }, (_, i) => {
          const r = 3 + random(`gr-${seed}-${i}`) * 9;
          const speed = 6 + random(`gs-${seed}-${i}`) * 14; // px per second, upward
          const span = height + 80;
          const y = ((((random(`gy-${seed}-${i}`) * span - t * speed) % span) + span) % span) - 40;
          const x = random(`gx-${seed}-${i}`) * width + Math.sin(t * (0.5 + random(`gw-${seed}-${i}`) * 0.6) + i) * 18 - t * 2;
          const tw = 0.5 + 0.5 * Math.sin(t * (0.8 + random(`gt-${seed}-${i}`)) + i * 2.1);
          const o = 0.04 + 0.09 * tw * (0.4 + random(`go-${seed}-${i}`) * 0.6);
          return <circle key={i} cx={x} cy={y} r={r} fill={dot} opacity={o} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
