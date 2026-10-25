import { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { brand, editorial, toon } from "../../../../theme";
import { ramp } from "../../components/toon/anim";

/** Local helpers for the liberty chapter (all frame-driven). */

/** Solid ground. Light scenes use the editorial #EEE, dark scenes black; fades in so cuts stay soft. */
export const Backdrop: React.FC<{ dark?: boolean }> = ({ dark = false }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ background: dark ? editorial.ink : editorial.bg, opacity: ramp(frame, 0, 8) }} />;
};

/** Fade + small rise into place at frame `at`, optional fade out at `exitAt`. */
export const Reveal: React.FC<{ at: number; exitAt?: number; children: ReactNode; style?: CSSProperties }> = ({ at, exitAt, children, style }) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, at, 14);
  const out = exitAt === undefined ? 1 : 1 - ramp(frame, exitAt, 10);
  if (frame < at || out <= 0) return null;
  return <div style={{ position: "absolute", opacity: t * out, transform: `translateY(${(1 - t) * 22}px)`, ...style }}>{children}</div>;
};

/** Kicker + headline + accent rule (editorial text block). */
export const Head: React.FC<{ x: number; y: number; w: number; kicker?: string; headline: string; size?: number; at?: number; exitAt?: number; dark?: boolean; sub?: string }> = ({
  x, y, w, kicker, headline, size = 84, at = 6, exitAt, dark = false, sub,
}) => (
  <Reveal at={at} exitAt={exitAt} style={{ left: x, top: y, width: w }}>
    {kicker && <div style={{ fontFamily: toon.font.body, fontWeight: 800, fontSize: 26, letterSpacing: "0.14em", textTransform: "uppercase", color: dark ? editorial.accentOnDark : editorial.accentOnLight, marginBottom: 14 }}>{kicker}</div>}
    <div style={{ fontFamily: toon.font.display, fontWeight: 800, fontSize: size, lineHeight: 1.04, letterSpacing: "-0.01em", color: dark ? editorial.white : editorial.ink }}>{headline}</div>
    <div style={{ width: 72, height: 6, borderRadius: 3, background: editorial.accent, margin: "20px 0 0" }} />
    {sub && <div style={{ fontFamily: toon.font.body, fontWeight: 600, fontSize: 34, lineHeight: 1.3, marginTop: 18, color: dark ? editorial.mutedOnDark : editorial.muted }}>{sub}</div>}
  </Reveal>
);

/** A single editorial row chip (panel with a small accent marker). */
export const Chip: React.FC<{ text: string; dark?: boolean }> = ({ text, dark }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 22px", borderRadius: 12, background: dark ? "#1A1A1A" : editorial.panel, fontFamily: toon.font.display, fontWeight: 700, fontSize: 36, color: dark ? editorial.white : editorial.ink }}>
    <span style={{ width: 12, height: 12, borderRadius: 6, background: editorial.accent }} />
    {text}
  </div>
);

type Tile = "youtube" | "instagram" | "tiktok";
const TILE: Record<Tile, { bg: string; fg: string; glyph: ReactNode; name: string }> = {
  youtube: { bg: brand.youtube, fg: "#fff", name: "YouTube", glyph: <svg width="64" height="64" viewBox="0 0 64 64"><rect x="6" y="14" width="52" height="36" rx="11" fill="#fff" /><path d="M27 23 L27 41 L42 32 Z" fill={brand.youtube} /></svg> },
  instagram: { bg: brand.instagram, fg: "#fff", name: "Instagram", glyph: <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="#fff" strokeWidth="5"><rect x="9" y="9" width="46" height="46" rx="14" /><circle cx="32" cy="32" r="11" /><circle cx="46" cy="18" r="2" fill="#fff" /></svg> },
  tiktok: { bg: "#000", fg: "#fff", name: "TikTok", glyph: <svg width="64" height="64" viewBox="0 0 64 64" fill="none" strokeWidth="8" strokeLinecap="round"><path d="M30 24 V44 a8 8 0 1 1 -8 -8" stroke={brand.tiktok} transform="translate(-2 0)" /><path d="M30 24 V44 a8 8 0 1 1 -8 -8" stroke={brand.tiktokPink} transform="translate(2 2)" /><path d="M30 24 V44 a8 8 0 1 1 -8 -8 M30 24 q2 10 14 10" stroke="#fff" /></svg> },
};

/** Typographic app tile (we have no official logo files for these). Top-left x,y. */
export const AppTile: React.FC<{ app: Tile; x: number; y: number; at: number; exitAt?: number; size?: number }> = ({ app, x, y, at, exitAt, size = 150 }) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, at, 14);
  const d = TILE[app];
  const out = exitAt === undefined ? 1 : 1 - ramp(frame, exitAt, 10);
  if (frame < at || out <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: size, opacity: t * out, transform: `translateY(${(1 - t) * 20}px)`, textAlign: "center", fontFamily: toon.font.body, fontWeight: 800, fontSize: 24, color: editorial.white }}>
      <div style={{ width: size, height: size, borderRadius: size * 0.26, background: d.bg, border: app === "tiktok" ? "3px solid #444" : "none", display: "flex", alignItems: "center", justifyContent: "center" }}>{d.glyph}</div>
      <div style={{ marginTop: 10 }}>{d.name}</div>
    </div>
  );
};
