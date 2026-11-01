/*
 * Scene bits (port of scenes/hook/bits.tsx). `(props, f) => HTML string`.
 *
 *   F1.Solid({ color }, inner)                       solid scene ground covering the shared background
 *   F1.FeedCard({ src, x, y, w, h, rot, at, avatar, pos, opacity }, f)   social-feed post that springs in
 *   F1.Sepia(inner)                                  flashback grade around absolutely positioned photos
 *   F1.Chip({ text, x, y, at, fontSize, bg, color, border, strike }, f)  tag chip, optional accent strike-through
 */
(function (F1) {
  const { editorial, toon } = F1.theme;
  const n = F1.n;
  const FULL = "position:absolute;inset:0";

  F1.Solid = ({ color }, inner = "") => `<div style="${FULL};background:${color}">${inner}</div>`;

  F1.FeedCard = ({ src, x, y, w = 270, h = 330, rot = 0, at, avatar, pos = "50% 35%", opacity = 1 }, f) => {
    const s = F1.spring({ frame: f - at, config: { damping: 14, stiffness: 140 } });
    const wrap = F1.css({
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 18,
      background: editorial.white,
      transform: `rotate(${rot}deg) scale(${n(s, 4)})`,
      opacity: f < at ? 0 : n(opacity * Math.min(1, s * 2), 3),
      padding: 12,
      boxSizing: "border-box",
      boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
    });
    const bar = (width) => `<div style="${F1.css({ width, height: 10, borderRadius: 5, background: editorial.panel })}"></div>`;
    const img = F1.css({ display: "block", width: "100%", height: h - 112, objectFit: "cover", objectPosition: pos, borderRadius: 10, marginTop: 4 });
    return `<div style="${wrap}">
<div style="display:flex;align-items:center;gap:10px;height:36px"><div style="${F1.css({ width: 30, height: 30, borderRadius: 15, background: avatar })}"></div>${bar(96)}</div>
<img src="${F1.esc(F1.asset(src))}" alt="" style="${img}">
<div style="display:flex;gap:12px;margin-top:10px;align-items:center"><svg width="26" height="24" viewBox="0 0 24 22"><path d="M12 21 C-6 9 4 -3 12 5 C20 -3 30 9 12 21Z" fill="${editorial.accent}"/></svg>${bar(60)}</div></div>`;
  };

  F1.Sepia = (inner) => `<div style="${FULL};filter:sepia(0.85) contrast(1.05) brightness(0.97)">${inner}</div>`;

  F1.Chip = ({ text, x, y, at, fontSize = 40, bg = editorial.white, color = editorial.ink, border = editorial.rule, strike }, f) => {
    if (f < at) return "";
    const p = F1.ramp(f, at, 14);
    const sk = strike === undefined ? 0 : F1.ramp(f, strike, 16);
    const style = F1.css({
      position: "absolute",
      left: x,
      top: y,
      opacity: n(p, 3),
      transform: `translateY(${n((1 - p) * 18)}px)`,
      padding: `${n(fontSize * 0.3)}px ${n(fontSize * 0.7)}px`,
      borderRadius: 999,
      background: bg,
      color,
      border: `3px solid ${border}`,
      fontFamily: toon.font.display,
      fontWeight: 800,
      fontSize,
      whiteSpace: "nowrap",
    });
    const line = sk > 0 ? `<div style="${F1.css({ position: "absolute", left: "6%", top: "52%", height: 5, width: `${n(88 * sk)}%`, background: editorial.accent, borderRadius: 3 })}"></div>` : "";
    return `<div style="${style}">${F1.esc(text)}${line}</div>`;
  };
})((globalThis.F1 = globalThis.F1 || {}));
