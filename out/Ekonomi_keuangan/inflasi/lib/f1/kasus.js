/*
 * Kit for the "Kasus Nasi Goreng" short (1080x1920). `(props, f) => HTML string`, all frame-driven.
 *
 *   F1.kasus.rp(n)                                         "Rp20.000" (Indonesian thousands dots)
 *   F1.kasus.Kicker({ text, x, y, w, at, dark }, f)        small uppercase label + headline block, centred
 *   F1.kasus.Suspect({ n, title, x, y, w, at, dark }, f)   "TERSANGKA #n" card header that drops in
 *   F1.kasus.Stamp({ text, x, y, at, color, rot, size }, f)   rubber stamp that slams in (scale 1.6 -> 1)
 *   F1.kasus.Receipt({ x, y, at, price, oldPrice, strikeAt }, f)   nasi goreng receipt card
 *   F1.kasus.Note({ x, y, w, at, shrink, shrinkAt }, f)    a Rp100.000 note (drawn), optional shrink
 *   F1.kasus.Icon(name, size, color)                       flat icons: rice chili egg gas plate coin cart envelope ice mattress shield
 *   F1.kasus.Pop({ x, y, at, frames }, f, inner)           pop-in wrapper, x,y = centre
 *   F1.kasus.Up({ x, y, at, size }, f)                     red "price up" arrow that pops in
 */
(function (F1) {
  const { editorial, toon, objects } = F1.theme;
  const n = F1.n;
  const W = F1.STAGE.width;
  const RED = objects.liveries.red;
  // font stacks for SVG attributes (double quotes inside an attribute would end it)
  const FD = toon.font.display.replace(/"/g, "'");
  const FB = toon.font.body.replace(/"/g, "'");

  const rp = (v) => `Rp${Math.round(v).toLocaleString("id-ID")}`;

  const Pop = ({ x, y, at = 0, frames = 14 }, f, inner) => {
    if (f < at) return "";
    const s = F1.popScale(f, at, frames);
    return `<div style="${F1.css({ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${n(s, 4)})`, opacity: n(Math.min(1, F1.ramp(f, at, 6)), 3) })}">${inner}</div>`;
  };

  const Kicker = ({ kicker, text, x = 60, y = 180, w = 900, at = 0, dark = false, size = 76 }, f) => {
    if (f < at) return "";
    const p = F1.ramp(f, at, 14);
    return `<div style="${F1.css({ position: "absolute", left: x, top: y, width: w, textAlign: "center", opacity: n(p, 3), transform: `translateY(${n((1 - p) * 20)}px)` })}">
${kicker ? `<div style="${F1.css({ fontFamily: toon.font.body, fontWeight: 800, fontSize: 30, letterSpacing: "0.14em", textTransform: "uppercase", color: dark ? editorial.accentOnDark : editorial.accentOnLight, marginBottom: 12 })}">${F1.esc(kicker)}</div>` : ""}
<div style="${F1.css({ fontFamily: toon.font.display, fontWeight: 800, fontSize: size, lineHeight: 1.05, letterSpacing: "-0.01em", color: dark ? editorial.white : editorial.ink })}">${F1.esc(text)}</div></div>`;
  };

  const Suspect = ({ n: num, title, x = 60, y = 170, w = 900, at = 0, dark = false }, f) => {
    if (f < at) return "";
    const p = F1.ramp(f, at, 16, F1.expoOut);
    const box = F1.css({
      position: "absolute", left: x, top: y, width: w, padding: "22px 30px", boxSizing: "border-box", borderRadius: 20,
      background: dark ? "#1A1A1A" : editorial.white, border: `3px solid ${dark ? "#444" : editorial.ink}`, boxShadow: `0 8px 0 ${dark ? "#000" : editorial.ink}`,
      transform: `translateY(${n((1 - p) * -60)}px) rotate(${n((1 - p) * -3)}deg)`, opacity: n(Math.min(1, p * 2), 3), textAlign: "center",
    });
    return `<div style="${box}">
<div style="${F1.css({ fontFamily: toon.font.body, fontWeight: 800, fontSize: 30, letterSpacing: "0.16em", color: dark ? editorial.accentOnDark : editorial.accentOnLight })}">TERSANGKA #${num}</div>
<div style="${F1.css({ fontFamily: toon.font.display, fontWeight: 800, fontSize: 84, lineHeight: 1.05, color: dark ? editorial.white : editorial.ink, marginTop: 4 })}">${F1.esc(title)}</div></div>`;
  };

  const Stamp = ({ text, x, y, at, color = RED, rot = -8, size = 64 }, f) => {
    if (f < at) return "";
    const p = F1.ramp(f, at, 8, F1.Easing.in(F1.Easing.quad));
    const s = 1.6 - 0.6 * p;
    const style = F1.css({
      position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${n(s, 4)})`, opacity: n(Math.min(1, p * 1.5) * 0.92, 3),
      padding: "10px 28px", border: `8px solid ${color}`, borderRadius: 14, color, fontFamily: toon.font.display, fontWeight: 800, fontSize: size,
      letterSpacing: "0.04em", whiteSpace: "nowrap", background: "rgba(255,255,255,0.8)",
    });
    return `<div style="${style}">${F1.esc(text)}</div>`;
  };

  /** Receipt card, x,y = top-left. `price` animates from oldPrice to price between strikeAt and strikeAt+24. */
  const Receipt = ({ x = 240, y = 300, w = 600, at = 0, price = 20000, oldPrice = 5000, strikeAt = 10 }, f) => {
    if (f < at) return "";
    const p = F1.ramp(f, at, 14, F1.expoOut);
    const k = F1.ramp(f, strikeAt, 24, F1.easeOut);
    const shown = Math.round((oldPrice + (price - oldPrice) * k) / 500) * 500;
    const row = (l, r, extra = {}) =>
      `<div style="${F1.css({ display: "flex", justifyContent: "space-between", fontFamily: toon.font.body, fontWeight: 700, fontSize: 34, color: editorial.ink, ...extra })}"><span>${l}</span><span>${r}</span></div>`;
    const dash = `<div style="${F1.css({ borderTop: `4px dashed ${editorial.rule}`, margin: "18px 0" })}"></div>`;
    const box = F1.css({
      position: "absolute", left: x, top: y, width: w, padding: "34px 40px 40px", boxSizing: "border-box", background: editorial.white,
      borderRadius: 8, boxShadow: "0 18px 40px rgba(0,0,0,0.18)", transform: `translateY(${n((1 - p) * 60)}px) rotate(-2deg)`, opacity: n(p, 3),
    });
    return `<div style="${box}">
<div style="${F1.css({ textAlign: "center", fontFamily: toon.font.display, fontWeight: 800, fontSize: 42, color: editorial.ink })}">WARUNG PAK UJANG</div>
<div style="${F1.css({ textAlign: "center", fontFamily: toon.font.body, fontWeight: 600, fontSize: 26, color: editorial.muted, marginTop: 4 })}">Nasi goreng sejak dulu</div>${dash}
${row("Nasi goreng ×1", "")}
${row(`<span style="${F1.css({ textDecoration: k > 0 ? "line-through" : "none", color: k > 0 ? editorial.muted : editorial.ink })}">${rp(oldPrice)}</span>`, "", { marginTop: 8, fontSize: 40 })}${dash}
${row("TOTAL", `<span style="${F1.css({ fontFamily: toon.font.display, fontWeight: 800, fontSize: 92, color: k > 0 ? RED : editorial.ink })}">${rp(shown)}</span>`, { alignItems: "center", fontWeight: 800 })}</div>`;
  };

  /** A Rp100.000 note (drawn, not a reproduction), centred at x,y. Shrinks to `shrink` of its width from shrinkAt. */
  const Note = ({ x = 540, y = 560, w = 760, at = 0, shrink = 1, shrinkAt = 0, frames = 40 }, f) => {
    if (f < at) return "";
    const pin = F1.popScale(f, at, 16);
    const k = shrink === 1 ? 0 : F1.ramp(f, shrinkAt, frames, F1.expoInOut);
    const s = pin * (1 - (1 - shrink) * k);
    const h = w * 0.47;
    const pink = "#e8607a";
    const deep = "#b8324f";
    const svg = `<svg width="${w}" height="${n(h)}" viewBox="0 0 400 188">
<rect x="2" y="2" width="396" height="184" rx="14" fill="${pink}" stroke="${deep}" stroke-width="4"/>
<rect x="14" y="14" width="372" height="160" rx="8" fill="none" stroke="#fff" stroke-opacity="0.5" stroke-width="2"/>
<circle cx="300" cy="94" r="54" fill="#fff" fill-opacity="0.22"/><circle cx="300" cy="94" r="34" fill="#fff" fill-opacity="0.25"/>
<text x="28" y="58" font-family="${FD}" font-weight="800" font-size="40" fill="#fff">100.000</text>
<text x="28" y="88" font-family="${FB}" font-weight="800" font-size="16" letter-spacing="3" fill="#fff" fill-opacity="0.9">SERATUS RIBU RUPIAH</text>
<text x="28" y="164" font-family="${FD}" font-weight="800" font-size="30" fill="#fff" fill-opacity="0.85">Rp</text>
<text x="372" y="168" text-anchor="end" font-family="${FD}" font-weight="800" font-size="22" fill="#fff" fill-opacity="0.8">100000</text></svg>`;
    return `<div style="${F1.css({ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${n(s, 4)})`, filter: "drop-shadow(0 14px 24px rgba(0,0,0,0.35))" })}">${svg}</div>`;
  };

  const ICONS = {
    rice: (c) => `<ellipse cx="50" cy="44" rx="34" ry="20" fill="#fff" stroke="${c}" stroke-width="4"/><path d="M14 50 Q50 104 86 50 Z" fill="${c}"/><rect x="34" y="84" width="32" height="8" rx="4" fill="${c}"/>`,
    chili: () => `<path d="M30 30 Q80 20 76 80 Q60 54 26 44 Z" fill="${RED}"/><path d="M28 32 Q20 18 30 10" stroke="#3e8a3a" stroke-width="7" fill="none" stroke-linecap="round"/>`,
    egg: () => `<ellipse cx="50" cy="56" rx="40" ry="32" fill="#fff" stroke="#d9d0c0" stroke-width="3"/><circle cx="50" cy="56" r="16" fill="#f6b81c"/>`,
    gas: () => `<rect x="24" y="26" width="52" height="62" rx="18" fill="#2d9a52"/><rect x="40" y="10" width="20" height="18" rx="4" fill="#666"/><text x="50" y="66" text-anchor="middle" font-family="${FD}" font-weight="800" font-size="18" fill="#fff">LPG</text>`,
    plate: (c) => `<ellipse cx="50" cy="60" rx="44" ry="18" fill="#fff" stroke="${c}" stroke-width="4"/><path d="M24 58 Q50 18 76 58 Z" fill="#d98b2b"/><circle cx="50" cy="40" r="7" fill="#fff"/><circle cx="50" cy="40" r="3.5" fill="#f6b81c"/>`,
    coin: () => `<circle cx="50" cy="50" r="40" fill="#f2c230" stroke="#b8860b" stroke-width="5"/><text x="50" y="62" text-anchor="middle" font-family="${FD}" font-weight="800" font-size="34" fill="#8a6408">Rp</text>`,
    cart: (c) => `<rect x="12" y="40" width="76" height="34" rx="6" fill="#d9483b"/><rect x="8" y="22" width="84" height="12" rx="4" fill="${c}"/><rect x="14" y="34" width="6" height="8" fill="${c}"/><rect x="80" y="34" width="6" height="8" fill="${c}"/><circle cx="28" cy="82" r="10" fill="${c}"/><circle cx="72" cy="82" r="10" fill="${c}"/>`,
    envelope: () => `<rect x="10" y="22" width="80" height="56" rx="6" fill="#2d9a52"/><path d="M10 26 L50 56 L90 26" fill="none" stroke="#f2c230" stroke-width="5"/><text x="50" y="74" text-anchor="middle" font-family="${FD}" font-weight="800" font-size="16" fill="#fff">THR</text>`,
    ice: () => `<rect x="18" y="18" width="64" height="64" rx="14" fill="#cfeefc" stroke="#6cc3ea" stroke-width="4"/><path d="M30 30 L46 30" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`,
    mattress: (c) => `<rect x="6" y="70" width="6" height="18" fill="${c}"/><rect x="88" y="70" width="6" height="18" fill="${c}"/><rect x="4" y="30" width="8" height="44" rx="3" fill="#a0703c"/><rect x="6" y="52" width="88" height="22" rx="8" fill="#9fb6d6" stroke="${c}" stroke-width="3"/><rect x="14" y="40" width="26" height="14" rx="7" fill="#fff" stroke="${c}" stroke-width="3"/><path d="M44 52 Q70 44 94 52" fill="#c9d8ec" stroke="${c}" stroke-width="3"/>`,
    shield: () => `<path d="M50 8 L86 22 L86 50 Q86 80 50 94 Q14 80 14 50 L14 22 Z" fill="#2d9a52"/><path d="M32 52 L46 66 L70 38" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`,
  };
  const Icon = (name, size = 120, color = editorial.ink) => `<svg width="${size}" height="${size}" viewBox="0 0 100 100">${ICONS[name](color)}</svg>`;

  const Up = ({ x, y, at, size = 70 }, f) =>
    Pop({ x, y, at, frames: 12 }, f, `<svg width="${size}" height="${size}" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="${RED}"/><path d="M50 22 L76 52 L60 52 L60 78 L40 78 L40 52 L24 52 Z" fill="#fff"/></svg>`);

  F1.kasus = { rp, Pop, Kicker, Suspect, Stamp, Receipt, Note, Icon, Up, W, RED };
})((globalThis.F1 = globalThis.F1 || {}));
