import { ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { chart, editorial, toon } from "../../../../theme";
import { clamp, ramp } from "../../components/toon/anim";

/** Local helpers for the demo chapter (grounds, headings, waffle and ring charts). */

/** Solid scene ground with a short fade-in. */
export const Bg: React.FC<{ dark?: boolean; alt?: boolean }> = ({ dark, alt }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ background: dark ? editorial.ink : alt ? editorial.panel : editorial.bg, opacity: ramp(frame, 0, 8) }} />;
};

/** Kicker + headline (+ optional sub) block that rises in. */
export const Heading: React.FC<{
  x: number;
  y: number;
  w: number;
  at?: number;
  dark?: boolean;
  kicker?: string;
  lines: string[];
  size?: number;
  sub?: string;
  exitAt?: number;
}> = ({ x, y, w, at = 0, dark, kicker, lines, size = 76, sub, exitAt }) => {
  const frame = useCurrentFrame();
  const a = ramp(frame, at, 14);
  const out = exitAt === undefined ? 1 : 1 - ramp(frame, exitAt, 10);
  if (frame < at || out <= 0) return null;
  const ink = dark ? editorial.white : editorial.ink;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: a * out, transform: `translateY(${(1 - a) * 22}px)` }}>
      {kicker && (
        <div
          style={{
            fontFamily: toon.font.body,
            fontWeight: 800,
            fontSize: 26,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: dark ? editorial.accentOnDark : editorial.accentOnLight,
            marginBottom: 14,
          }}
        >
          {kicker}
        </div>
      )}
      {lines.map((l, i) => (
        <div key={i} style={{ fontFamily: toon.font.display, fontWeight: 800, fontSize: size, lineHeight: 1.04, letterSpacing: "-0.02em", color: ink }}>
          {l}
        </div>
      ))}
      {sub && <div style={{ marginTop: 18, fontFamily: toon.font.body, fontWeight: 600, fontSize: 34, lineHeight: 1.25, color: dark ? editorial.mutedOnDark : editorial.muted }}>{sub}</div>}
    </div>
  );
};

/** 10x10 dot grid; the first `pct` dots turn to the highlight colour in reading order. */
export const Waffle: React.FC<{ x: number; y: number; size: number; pct: number; at: number; dur?: number; dark?: boolean }> = ({ x, y, size, pct, at, dur = 40, dark }) => {
  const frame = useCurrentFrame();
  const cell = size / 10;
  const filled = interpolate(frame, [at, at + dur], [0, pct], clamp);
  const appear = ramp(frame, Math.max(0, at - 14), 14);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: size, height: size, opacity: appear }}>
      {Array.from({ length: 100 }, (_, i) => {
        const on = i < filled;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: (i % 10) * cell + cell * 0.1,
              top: Math.floor(i / 10) * cell + cell * 0.1,
              width: cell * 0.8,
              height: cell * 0.8,
              borderRadius: "50%",
              background: on ? chart.highlight : dark ? "#3A3A3A" : chart.muted,
            }}
          />
        );
      })}
    </div>
  );
};

/** Circular arc 0 -> pct with a centre slot for the number. */
export const ArcRing: React.FC<{ cx: number; cy: number; r: number; pct: number; at: number; dur?: number; thick?: number; children?: ReactNode }> = ({ cx, cy, r, pct, at, dur = 45, thick = 46, children }) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [at, at + dur], [0, pct], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const circ = 2 * Math.PI * r;
  const appear = ramp(frame, Math.max(0, at - 12), 14);
  const box = (r + thick) * 2;
  return (
    <div style={{ position: "absolute", left: cx - box / 2, top: cy - box / 2, width: box, height: box, opacity: appear }}>
      <svg width={box} height={box} viewBox={`${-box / 2} ${-box / 2} ${box} ${box}`}>
        <circle r={r} fill="none" stroke={chart.grid} strokeWidth={thick} />
        <circle r={r} fill="none" stroke={chart.highlight} strokeWidth={thick} strokeLinecap="butt" strokeDasharray={`${(circ * v) / 100} ${circ}`} transform="rotate(-90)" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
    </div>
  );
};
