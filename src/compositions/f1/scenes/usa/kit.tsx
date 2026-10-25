import { interpolate, useCurrentFrame } from "remotion";
import { editorial, toon } from "../../../../theme";

const clampX = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Local text block: kicker, headline, accent rule. Fades in at `at`, optional exit. */
export const Heading: React.FC<{
  kicker?: string;
  headline: string;
  x: number;
  y: number;
  w: number;
  size?: number;
  tone?: "light" | "dark";
  at?: number;
  exitAt?: number;
}> = ({ kicker, headline, x, y, w, size = 84, tone = "light", at = 0, exitAt }) => {
  const frame = useCurrentFrame();
  const inn = interpolate(frame, [at, at + 16], [0, 1], clampX);
  const out = exitAt === undefined ? 1 : 1 - interpolate(frame, [exitAt, exitAt + 10], [0, 1], clampX);
  const dark = tone === "dark";
  if (out <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: inn * out, transform: `translateY(${(1 - inn) * 14}px)` }}>
      {kicker && (
        <div style={{ fontFamily: toon.font.body, fontWeight: 800, fontSize: 26, letterSpacing: "0.14em", textTransform: "uppercase", color: dark ? editorial.accentOnDark : editorial.accentOnLight, marginBottom: 12 }}>
          {kicker}
        </div>
      )}
      <div style={{ fontFamily: toon.font.display, fontWeight: 800, fontSize: size, lineHeight: 1.04, letterSpacing: "-0.01em", color: dark ? editorial.white : editorial.ink }}>{headline}</div>
      <div style={{ width: 72, height: 6, borderRadius: 3, background: editorial.accent, marginTop: 20 }} />
    </div>
  );
};

/** Caption under a photo card: name + small sub line, fades in at `at`. */
export const CardLabel: React.FC<{ x: number; y: number; w: number; text: string; sub: string; at: number; tone?: "light" | "dark" }> = ({ x, y, w, text, sub, at, tone = "light" }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 14], [0, 1], clampX);
  const dark = tone === "dark";
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, textAlign: "center", opacity: o, fontFamily: toon.font.display, color: dark ? editorial.white : editorial.ink }}>
      <div style={{ fontWeight: 800, fontSize: 34, lineHeight: 1.1 }}>{text}</div>
      <div style={{ fontFamily: toon.font.body, fontWeight: 700, fontSize: 24, color: dark ? editorial.mutedOnDark : editorial.muted, marginTop: 2 }}>{sub}</div>
    </div>
  );
};
