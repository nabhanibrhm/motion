import { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { editorial, toon } from "../../../../theme";
import { ramp } from "../../components/toon";
import { expoOut } from "../../components/photo";

/** Solid editorial ground for a scene: light (#EEE) or dark (black). */
export const Bg: React.FC<{ dark?: boolean }> = ({ dark }) => <AbsoluteFill style={{ background: dark ? editorial.ink : editorial.bg }} />;

/** Calm entrance: fade plus a short lift. Optional exit fade. */
export const Reveal: React.FC<{ at: number; exitAt?: number; dy?: number; children: ReactNode; style?: CSSProperties }> = ({ at, exitAt, dy = 22, children, style }) => {
  const frame = useCurrentFrame();
  const inP = ramp(frame, at, 14, expoOut);
  const out = exitAt === undefined ? 1 : 1 - ramp(frame, exitAt, 10);
  return <div style={{ opacity: inP * out, transform: `translateY(${(1 - inP) * dy}px)`, ...style }}>{children}</div>;
};

export type HeadLine = { text: string; at: number; accent?: boolean; strike?: boolean };

/** A short editorial text block: kicker plus headline lines that each enter at their own frame. */
export const Head: React.FC<{
  x: number;
  y: number;
  w: number;
  kicker?: string;
  kickerAt?: number;
  lines: HeadLine[];
  size?: number;
  dark?: boolean;
  exitAt?: number;
}> = ({ x, y, w, kicker, kickerAt = 0, lines, size = 96, dark, exitAt }) => {
  const fg = dark ? editorial.white : editorial.ink;
  const accent = dark ? editorial.accentOnDark : editorial.accent;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w }}>
      {kicker && (
        <Reveal at={kickerAt} exitAt={exitAt}>
          <div style={{ fontFamily: toon.font.body, fontWeight: 800, fontSize: 28, letterSpacing: "0.16em", textTransform: "uppercase", color: dark ? editorial.mutedOnDark : editorial.muted, marginBottom: 14 }}>{kicker}</div>
        </Reveal>
      )}
      {lines.map((l) => (
        <Reveal key={l.text} at={l.at} exitAt={exitAt}>
          <div style={{ fontFamily: toon.font.display, fontWeight: 800, fontSize: size, lineHeight: 1.02, color: l.accent ? accent : fg }}>
            <span style={{ position: "relative", display: "inline-block" }}>
              {l.text}
              {l.strike && <StrikeLine at={l.at + 6} color={accent} />}
            </span>
          </div>
        </Reveal>
      ))}
    </div>
  );
};

const StrikeLine: React.FC<{ at: number; color: string }> = ({ at, color }) => {
  const frame = useCurrentFrame();
  return <div style={{ position: "absolute", left: 0, top: "54%", height: 8, width: `${ramp(frame, at, 14, expoOut) * 100}%`, background: color, borderRadius: 4 }} />;
};

/** Small rounded label (pill). */
export const Pill: React.FC<{ text: string; x: number; y: number; at: number; exitAt?: number; dark?: boolean; accent?: boolean; size?: number }> = ({ text, x, y, at, exitAt, dark, accent, size = 34 }) => {
  const bg = accent ? editorial.accent : dark ? editorial.white : editorial.ink;
  const fg = accent ? editorial.white : dark ? editorial.ink : editorial.white;
  return (
    <Reveal at={at} exitAt={exitAt} dy={12} style={{ position: "absolute", left: x, top: y }}>
      <div style={{ display: "inline-block", whiteSpace: "nowrap", padding: "8px 22px", borderRadius: 999, background: bg, color: fg, fontFamily: toon.font.body, fontWeight: 800, fontSize: size, letterSpacing: "0.04em" }}>{text}</div>
    </Reveal>
  );
};
