import React, { ReactNode } from "react";
import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { editorial, toon } from "../../../../theme";
import { ramp } from "../../components/toon/anim";

/** Solid scene ground (covers the shared background). */
export const Ground: React.FC<{ color: string; children?: ReactNode }> = ({ color, children }) => (
  <AbsoluteFill style={{ background: color }}>{children}</AbsoluteFill>
);

/** A little social-feed post: avatar, handle bar, picture, like row. Pops in with a spring. */
export const FeedCard: React.FC<{
  src: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  rot?: number;
  at: number;
  avatar: string;
  pos?: string;
  opacity?: number;
}> = ({ src, x, y, w = 270, h = 330, rot = 0, at, avatar, pos = "50% 35%", opacity = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 14, stiffness: 140 } });
  if (frame < at) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 18,
        background: editorial.white,
        transform: `rotate(${rot}deg) scale(${s})`,
        opacity: opacity * Math.min(1, s * 2),
        padding: 12,
        boxSizing: "border-box",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, height: 36 }}>
        <div style={{ width: 30, height: 30, borderRadius: 15, background: avatar }} />
        <div style={{ width: 96, height: 10, borderRadius: 5, background: editorial.panel }} />
      </div>
      <Img src={staticFile(src)} style={{ width: "100%", height: h - 112, objectFit: "cover", objectPosition: pos, borderRadius: 10, marginTop: 4 }} />
      <div style={{ display: "flex", gap: 12, marginTop: 10, alignItems: "center" }}>
        <svg width={26} height={24} viewBox="0 0 24 22">
          <path d="M12 21 C-6 9 4 -3 12 5 C20 -3 30 9 12 21Z" fill={editorial.accent} />
        </svg>
        <div style={{ width: 60, height: 10, borderRadius: 5, background: editorial.panel }} />
      </div>
    </div>
  );
};

/** Sepia print: wraps an absolutely positioned photo in a flashback grade (old-F1 only). */
export const Sepia: React.FC<{ children: ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ filter: "sepia(0.85) contrast(1.05) brightness(0.97)" }}>{children}</AbsoluteFill>
);

/** Short tag chip that rises in at a frame; optional accent strike-through. */
export const Chip: React.FC<{
  text: string;
  x: number;
  y: number;
  at: number;
  fontSize?: number;
  bg?: string;
  color?: string;
  border?: string;
  strike?: number;
}> = ({ text, x, y, at, fontSize = 40, bg = editorial.white, color = editorial.ink, border = editorial.rule, strike }) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, at, 14);
  const sk = strike === undefined ? 0 : ramp(frame, strike, 16);
  if (frame < at) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: p,
        transform: `translateY(${(1 - p) * 18}px)`,
        padding: `${fontSize * 0.3}px ${fontSize * 0.7}px`,
        borderRadius: 999,
        background: bg,
        color,
        border: `3px solid ${border}`,
        fontFamily: toon.font.display,
        fontWeight: 800,
        fontSize,
        whiteSpace: "nowrap",
      }}
    >
      {text}
      {sk > 0 && <div style={{ position: "absolute", left: "6%", top: "52%", height: 5, width: `${88 * sk}%`, background: editorial.accent, borderRadius: 3 }} />}
    </div>
  );
};
