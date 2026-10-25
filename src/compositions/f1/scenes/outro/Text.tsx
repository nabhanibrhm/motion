import { interpolate, useCurrentFrame } from "remotion";
import { editorial, toon } from "../../../../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Short editorial headline with kicker and accent rule. Fades in at `at`, out at `exitAt`. */
export const Headline: React.FC<{
  kicker?: string;
  lines: string[];
  x: number;
  y: number;
  w: number;
  at: number;
  exitAt?: number;
  dark?: boolean;
  size?: number;
}> = ({ kicker, lines, x, y, w, at, exitAt, dark = false, size = 88 }) => {
  const f = useCurrentFrame();
  const inn = interpolate(f, [at, at + 16], [0, 1], clamp);
  const out = exitAt === undefined ? 1 : interpolate(f, [exitAt, exitAt + 12], [1, 0], clamp);
  const ink = dark ? editorial.white : editorial.ink;
  if (inn * out <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: inn * out, transform: `translateY(${(1 - inn) * 18}px)`, fontFamily: toon.font.display }}>
      {kicker && (
        <div style={{ fontWeight: 800, fontSize: 28, letterSpacing: 3, textTransform: "uppercase", color: dark ? editorial.accentOnDark : editorial.accentOnLight, marginBottom: 14 }}>{kicker}</div>
      )}
      <div style={{ width: 120 * inn, height: 8, background: editorial.accent, borderRadius: 4, marginBottom: 22 }} />
      {lines.map((l, i) => (
        <div key={i} style={{ fontWeight: 800, fontSize: size, lineHeight: 1.06, color: ink }}>
          {l}
        </div>
      ))}
    </div>
  );
};
