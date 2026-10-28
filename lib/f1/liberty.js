/*
 * Liberty chapter kit (port of scenes/liberty/kit.tsx). `(props, f) => HTML string`, all frame-driven.
 *
 *   F1.liberty.Backdrop({ dark }, f)                                   solid ground, fades in over 8 frames
 *   F1.liberty.Reveal({ at, exitAt, style }, f, inner)                 fade + small rise at `at`, fade out at `exitAt`
 *   F1.liberty.Head({ x, y, w, kicker, headline, size, at, exitAt, dark, sub }, f)   kicker + headline + accent rule
 *   F1.liberty.Chip({ text, dark })                                    editorial row chip with an accent marker
 *   F1.liberty.AppTile({ app, x, y, at, exitAt, size }, f)             typographic app tile: youtube | instagram | tiktok
 */
(function (F1) {
  const { editorial, brand, toon } = F1.theme;
  const n = F1.n;

  const Backdrop = ({ dark = false } = {}, f) =>
    `<div style="${F1.css({ position: "absolute", inset: 0, background: dark ? editorial.ink : editorial.bg, opacity: n(F1.ramp(f, 0, 8), 3) })}"></div>`;

  const Reveal = ({ at, exitAt, style = {} }, f, inner) => {
    const t = F1.ramp(f, at, 14);
    const out = exitAt === undefined ? 1 : 1 - F1.ramp(f, exitAt, 10);
    if (f < at || out <= 0) return "";
    return `<div style="${F1.css({ position: "absolute", opacity: n(t * out, 3), transform: `translateY(${n((1 - t) * 22)}px)`, ...style })}">${inner}</div>`;
  };

  const Head = ({ x, y, w, kicker, headline, size = 84, at = 6, exitAt, dark = false, sub }, f) =>
    Reveal(
      { at, exitAt, style: { left: x, top: y, width: w } },
      f,
      F1.join(
        kicker &&
          `<div style="${F1.css({ fontFamily: toon.font.body, fontWeight: 800, fontSize: 26, letterSpacing: "0.14em", textTransform: "uppercase", color: dark ? editorial.accentOnDark : editorial.accentOnLight, marginBottom: 14 })}">${F1.esc(kicker)}</div>`,
        `<div style="${F1.css({ fontFamily: toon.font.display, fontWeight: 800, fontSize: size, lineHeight: 1.04, letterSpacing: "-0.01em", color: dark ? editorial.white : editorial.ink })}">${F1.esc(headline)}</div>`,
        `<div style="${F1.css({ width: 72, height: 6, borderRadius: 3, background: editorial.accent, margin: "20px 0 0" })}"></div>`,
        sub &&
          `<div style="${F1.css({ fontFamily: toon.font.body, fontWeight: 600, fontSize: 34, lineHeight: 1.3, marginTop: 18, color: dark ? editorial.mutedOnDark : editorial.muted })}">${F1.esc(sub)}</div>`,
      ),
    );

  const Chip = ({ text, dark = false }) =>
    `<div style="${F1.css({ display: "flex", alignItems: "center", gap: 16, padding: "10px 22px", borderRadius: 12, background: dark ? "#1A1A1A" : editorial.panel, fontFamily: toon.font.display, fontWeight: 700, fontSize: 36, color: dark ? editorial.white : editorial.ink })}"><span style="${F1.css({ width: 12, height: 12, borderRadius: 6, background: editorial.accent })}"></span>${F1.esc(text)}</div>`;

  const TILE = {
    youtube: { bg: brand.youtube, name: "YouTube", glyph: `<svg width="64" height="64" viewBox="0 0 64 64"><rect x="6" y="14" width="52" height="36" rx="11" fill="#fff"/><path d="M27 23 L27 41 L42 32 Z" fill="${brand.youtube}"/></svg>` },
    instagram: { bg: brand.instagram, name: "Instagram", glyph: `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="#fff" stroke-width="5"><rect x="9" y="9" width="46" height="46" rx="14"/><circle cx="32" cy="32" r="11"/><circle cx="46" cy="18" r="2" fill="#fff"/></svg>` },
    tiktok: {
      bg: "#000",
      name: "TikTok",
      glyph: `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke-width="8" stroke-linecap="round"><path d="M30 24 V44 a8 8 0 1 1 -8 -8" stroke="${brand.tiktok}" transform="translate(-2 0)"/><path d="M30 24 V44 a8 8 0 1 1 -8 -8" stroke="${brand.tiktokPink}" transform="translate(2 2)"/><path d="M30 24 V44 a8 8 0 1 1 -8 -8 M30 24 q2 10 14 10" stroke="#fff"/></svg>`,
    },
  };

  /** Typographic app tile (we have no official logo files for these). Top-left x,y. */
  const AppTile = ({ app, x, y, at, exitAt, size = 150 }, f) => {
    const t = F1.ramp(f, at, 14);
    const d = TILE[app];
    const out = exitAt === undefined ? 1 : 1 - F1.ramp(f, exitAt, 10);
    if (f < at || out <= 0) return "";
    const wrap = F1.css({ position: "absolute", left: x, top: y, width: size, opacity: n(t * out, 3), transform: `translateY(${n((1 - t) * 20)}px)`, textAlign: "center", fontFamily: toon.font.body, fontWeight: 800, fontSize: 24, color: editorial.white });
    const tile = F1.css({ width: size, height: size, borderRadius: n(size * 0.26), background: d.bg, border: app === "tiktok" ? "3px solid #444" : "none", display: "flex", alignItems: "center", justifyContent: "center" });
    return `<div style="${wrap}"><div style="${tile}">${d.glyph}</div><div style="margin-top:10px">${d.name}</div></div>`;
  };

  F1.liberty = { Backdrop, Reveal, Head, Chip, AppTile };
})((globalThis.F1 = globalThis.F1 || {}));
