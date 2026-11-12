/**
 * KASUS "case file" look (runtime.look = "casefile"): paper ground, ink type, one teal accent, red only for stamps and
 * pen marks. Loaded after cine.js as F1.casefile; scenes use it as `const K = F1.casefile;`.
 * Every helper takes the section frame `f` (30-fps units, may be fractional) and returns markup; nothing reads the clock.
 * Layout contract (1080x1920): text x 72-960, right 120 clear; header y 96-180; art y 240-1150; source line ~y 1160;
 * narrator from y ~1200 under the captions (y 1496-1632); the cover centres in y 240-1680.
 */
((F1) => {
  const n = F1.n;
  const css = F1.css;
  const ramp = F1.ramp;
  const K = (F1.casefile = {});
  // Colours come from the theme palette (runtime.palette, fixed key set): bg = ground, paper = card, ink = text and lines,
  // muted = secondary text, teal/tealDark = the one accent, haze = tab/shade fill, drift = rules, red = stamps and pen.
  // T.paper is the ground (and the text colour on an accent fill); defaults are the casefile theme.
  const P = { bg: '#f2efe9', paper: '#fbf9f5', ink: '#151515', muted: '#4a4844', teal: '#1d6b6b', tealDark: '#145252', haze: '#e8e3d9', drift: '#cfc8bb', red: '#e8192c', ...(F1.CONFIG?.palette || {}) };
  const lum = (h) => { const v = parseInt(h.slice(1), 16); return (0.2126 * (v >> 16) + 0.7152 * ((v >> 8) & 255) + 0.0722 * (v & 255)) / 255; };
  const dark = lum(P.bg) < 0.4;
  const rgba = (h, a) => { const v = parseInt(h.slice(1), 16); return `rgba(${v >> 16},${(v >> 8) & 255},${v & 255},${a})`; };
  const T = (K.T = {
    paper: P.bg, paper2: P.haze, card: P.paper, ink: P.ink, ink2: P.muted, rule: P.drift,
    teal: P.teal, tealDark: P.tealDark, tealHi: rgba(P.teal, dark ? 0.45 : 0.3), red: P.red,
    folder: dark ? '#3a3326' : '#e3d4ae', folderTab: dark ? '#4a4131' : '#d9c9a3',
    shadow: dark ? '#000000' : P.ink, castLine: dark ? '#151515' : P.ink, dark,
    // accent tints readable on an ink-filled card
    onInkA: F1.mix(P.teal, P.bg, 0.45), onInkB: F1.mix(P.red, P.bg, 0.4),
  });
  const OSW = "Oswald, sans-serif";
  const MONO = "'JetBrains Mono', monospace";
  const SANS = "'Nunito Sans', sans-serif";
  K.FONT = { osw: OSW, mono: MONO, sans: SANS };
  const steps = () => F1.CONFIG.case.steps;
  const caseId = () => F1.CONFIG.case.id;

  const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' seed='7'/><feColorMatrix values='0 0 0 0 .3  0 0 0 0 .27  0 0 0 0 .2  0 0 0 .16 0'/></filter><rect width='240' height='240' filter='url(%23n)'/></svg>")`;
  /** Paper ground with a fixed grain (no flicker). */
  K.ground = () => `<div style="${css({ position: "absolute", inset: 0, background: T.paper })}"></div><div style="${css({ position: "absolute", inset: 0, backgroundImage: GRAIN, opacity: T.dark ? 0.3 : 0.55, mixBlendMode: T.dark ? 'screen' : 'normal' })}"></div>`;

  /** Whole art layer: ground + slow push-in + a short page slide from the right on the first frames. */
  K.page = (f, D, html, { zoom = 0.025, slide = true } = {}) => {
    const s = 1 + zoom * Math.min(1, f / Math.max(1, D));
    const p = slide ? ramp(f, 0, 8, F1.expoOut) : 1;
    return `${K.ground()}<div style="${css({ position: "absolute", inset: 0, color: T.ink, transformOrigin: "50% 40%", transform: `translateX(${n((1 - p) * 140)}px) scale(${n(s, 4)})`, opacity: n(0.4 + 0.6 * p, 3) })}">${html}</div>`;
  };

  /** Folder-tab progress strip (done = ink, current fills teal across the scene) + "KASUS #11 / LABEL". */
  K.head = (f, D, { step, label }) => {
    const fill = F1.clamp01(f / Math.max(1, D - 1));
    let tabs = "";
    for (let i = 1; i <= steps(); i++) {
      const w = i < step ? 100 : i === step ? Math.max(4, fill * 100) : 0;
      tabs += `<div style="${css({ flex: 1, height: 22, border: `3px solid ${T.ink}`, borderBottom: "none", borderRadius: "8px 8px 0 0", background: T.paper2, position: "relative", overflow: "hidden" })}"><div style="${css({ position: "absolute", left: 0, top: 0, bottom: 0, width: `${n(w, 2)}%`, background: i < step ? T.ink : T.teal })}"></div></div>`;
    }
    return `<div style="${css({ position: "absolute", left: 72, right: 120, top: 96, display: "flex", gap: 10, borderBottom: `3px solid ${T.ink}` })}">${tabs}</div>
<div style="${css({ position: "absolute", left: 72, top: 140, fontFamily: MONO, fontWeight: 600, fontSize: 30, letterSpacing: 2, color: T.ink2, whiteSpace: "nowrap" })}"><span style="color:${T.ink};font-weight:800">${F1.esc(caseId())}</span><span style="color:${T.rule};margin:0 14px">/</span>${label}</div>`;
  };

  /** Generic entrance: fade + rise (dir 0) or slide from the side (dir ±1). Returns {p, style} pieces. */
  const enter = (f, at, frames = 12, dir = 0, dist = 36) => {
    const p = ramp(f, at, frames, F1.expoOut);
    return { p, tr: dir ? `translateX(${n(dir * 60 * (1 - p))}px)` : `translateY(${n(dist * (1 - p))}px)` };
  };
  /** Fade out from `out` over 8 frames (null = never). */
  const leave = (f, out) => (out === null || out === undefined ? 1 : 1 - ramp(f, out, 8));

  /** Absolutely placed block that enters at `at` and optionally leaves at `out`. */
  K.box = (f, { at = -12, out = null, x, y, w = null, h = null, rot = 0, dir = 0, frames = 12, style = {}, html }) => {
    const { p, tr } = enter(f, at, frames, dir);
    const o = p * leave(f, out);
    if (o <= 0.001) return "";
    return `<div style="${css({ position: "absolute", left: x, top: y, width: w, height: h, boxSizing: "border-box", opacity: n(o, 3), transform: `${tr} rotate(${rot}deg)`, ...style })}">${html}</div>`;
  };
  /** Teal mono kicker. */
  K.kicker = (f, { at = -12, out = null, x = 72, y = 250, text, color = T.teal }) =>
    K.box(f, { at, out, x, y, html: `<div style="${css({ fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 4, color, whiteSpace: "nowrap" })}">${text}</div>` });
  /** Oswald uppercase headline. */
  K.title = (f, { at = -12, out = null, x = 72, y = 300, w = 888, size = 96, html, color = T.ink, lh = 1 }) =>
    K.box(f, { at, out, x, y, w, html: `<div style="${css({ fontFamily: OSW, fontWeight: 700, fontSize: size, lineHeight: lh, textTransform: "uppercase", color })}">${html}</div>` });
  /** Paper card with ink border and hard shadow. */
  K.card = (f, { at = -12, out = null, x, y, w, h = null, rot = 0, dir = 0, pad = "28px 32px", bg = T.card, html, dashed = false, shadow = true }) =>
    K.box(f, { at, out, x, y, w, h, rot, dir, style: { padding: pad, background: bg, border: `4px ${dashed ? "dashed" : "solid"} ${dashed ? T.ink2 : T.ink}`, borderRadius: 14, boxShadow: shadow && !dashed ? `10px 10px 0 ${T.shadow}` : "none" }, html });
  /** Chip (mono, bordered); teal = filled teal. */
  K.chip = (f, { at = -12, out = null, x, y, text, teal = false, red = false, rot = 0, size = 28 }) =>
    K.box(f, { at, out, x, y, rot, frames: 10, html: `<div style="${css({ display: "inline-block", fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: 2, padding: "10px 18px", borderRadius: 8, whiteSpace: "nowrap", border: `3px solid ${red ? T.red : teal ? T.teal : T.ink}`, background: red ? T.red : teal ? T.teal : T.card, color: red || teal ? T.paper : T.ink })}">${text}</div>` });
  /** Source line under the art. */
  K.src = (f, { at = -12, y = 1160, text }) =>
    K.box(f, { at, x: 72, y, w: 888, html: `<div style="${css({ fontFamily: MONO, fontWeight: 500, fontSize: 22, lineHeight: 1.4, color: T.ink2 })}">SUMBER: ${text}</div>` });

  /** Red rubber stamp that slams in at `at` (scale 2 -> 1). */
  K.stamp = (f, { at, x, y, rot = -8, text, sub = "", size = 56, color = T.red }) => {
    const p = ramp(f, at, 8, F1.expoOut);
    if (p <= 0) return "";
    return `<div style="${css({ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg) scale(${n(2 - p, 3)})`, transformOrigin: "50% 50%", opacity: n(Math.min(1, p * 1.6), 3), mixBlendMode: T.dark ? "normal" : "multiply" })}"><div style="${css({ fontFamily: OSW, fontWeight: 700, fontSize: size, lineHeight: 1, letterSpacing: 3, color, border: `${Math.max(5, Math.round(size / 9))}px solid ${color}`, borderRadius: 10, padding: `${Math.round(size * 0.14)}px ${Math.round(size * 0.4)}px`, textAlign: "center", whiteSpace: "nowrap" })}">${text}${sub ? `<div style="font-size:${Math.round(size * 0.48)}px;letter-spacing:${Math.round(size * 0.16)}px;margin-top:6px">${sub}</div>` : ""}</div></div>`;
  };

  /** Hand-drawn pen ellipse around a w x h box at (x, y), drawn on over `frames`. */
  K.pen = (f, { at, x, y, w, h, frames = 12, color = T.red, sw = 9 }) => {
    const p = ramp(f, at, frames, F1.easeOut);
    if (p <= 0) return "";
    const W = w + 40;
    const H = h + 40;
    const len = n(3.4 * Math.max(w, h) + 2.2 * Math.min(w, h));
    const d = `M${n(w * 0.55 + 20)} 12 C ${n(w + 34)} 8, ${n(w + 42)} ${n(h + 20)}, ${n(w * 0.5 + 20)} ${n(h + 30)} C 4 ${n(h + 34)}, 0 18, ${n(w * 0.45 + 20)} 9 C ${n(w * 0.7)} 4, ${n(w * 0.82)} 10, ${n(w * 0.88)} 18`;
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="${css({ position: "absolute", left: x - 20, top: y - 20, overflow: "visible" })}"><path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${len}" stroke-dashoffset="${n(len * (1 - p))}"/></svg>`;
  };
  /** Pen strike-through line (slightly tilted), drawn on. */
  K.strike = (f, { at, x, y, w, frames = 8, color = T.red, sw = 9, tilt = -3 }) => {
    const p = ramp(f, at, frames, F1.easeOut);
    if (p <= 0) return "";
    return `<div style="${css({ position: "absolute", left: x, top: y, width: n(w * p), height: sw, borderRadius: sw, background: color, transform: `rotate(${tilt}deg)`, transformOrigin: "0 50%" })}"></div>`;
  };
  /** Pen tick inside a size x size box, drawn on. */
  K.tick = (f, { at, x = 0, y = 0, size = 70, color = T.teal, frames = 8, abs = false }) => {
    const p = ramp(f, at, frames, F1.easeOut);
    if (p <= 0) return "";
    return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" style="${abs ? css({ position: "absolute", left: x, top: y }) : ""}"><path d="M8 34 L26 52 L58 12" fill="none" stroke="${color}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="80" stroke-dashoffset="${n(80 * (1 - p))}"/></svg>`;
  };
  /** Inline highlighter sweep (wrap text): <span style=K.hl(f, at)>…</span>. */
  K.hl = (f, at, frames = 14, color = T.tealHi) => {
    const p = ramp(f, at, frames, F1.easeOut);
    return css({ backgroundImage: `linear-gradient(${color}, ${color})`, backgroundRepeat: "no-repeat", backgroundPosition: "0 60%", backgroundSize: `${n(p * 100, 2)}% 78%`, padding: "0 4px", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" });
  };
  /** Redaction bar over a w x h box; slides off to the right starting at `at`. */
  K.redact = (f, { at, x, y, w, h, frames = 12 }) => {
    const p = ramp(f, at, frames, F1.expoInOut);
    if (p >= 1) return "";
    return `<div style="${css({ position: "absolute", left: x, top: y, width: w, height: h, background: T.ink, borderRadius: 4, transformOrigin: "100% 50%", transform: `scaleX(${n(1 - p, 4)})` })}"></div>`;
  };

  // ---- line icons (stroke = color), 96 x 96 grid
  const ICON = {
    kalender: '<rect x="10" y="16" width="76" height="68" rx="6"/><path d="M10 36h76M30 8v16M66 8v16"/><circle cx="34" cy="56" r="4" fill="currentColor"/><path d="M50 56h18M30 70h40"/>',
    bayi: '<circle cx="48" cy="30" r="15"/><path d="M42 30h.1M54 30h.1" stroke-width="7"/><path d="M24 88c0-18 10-30 24-30s24 12 24 30"/><path d="M40 58l8 10 8-10"/>',
    ayah: '<circle cx="34" cy="24" r="11"/><path d="M14 86V58c0-10 9-17 20-17s20 7 20 17v28"/><circle cx="70" cy="50" r="8"/><path d="M60 86V72c0-7 4-11 10-11s10 4 10 11v14"/>',
    sapu: '<path d="M60 8L44 52"/><path d="M30 48l30 10-8 30H18z"/><path d="M30 72l-4 16M42 74l-3 14"/>',
    piring: '<circle cx="48" cy="52" r="30"/><circle cx="48" cy="52" r="16"/><path d="M12 10v24M6 10v14c0 6 12 6 12 0V10M84 10c-8 4-10 14-10 24h10V10zM84 34v52"/>',
    perisai: '<path d="M48 8l32 12v24c0 22-14 36-32 44C30 80 16 66 16 44V20z"/><path d="M34 48l10 10 18-22"/>',
    bus: '<rect x="12" y="14" width="72" height="60" rx="10"/><path d="M12 46h72M28 74v12M68 74v12"/><circle cx="28" cy="60" r="4" fill="currentColor"/><circle cx="68" cy="60" r="4" fill="currentColor"/>',
    helm: '<path d="M14 64c0-22 15-38 34-38s34 16 34 38"/><path d="M8 64h80v10H8z"/><path d="M40 26v-8h16v8M48 26v38"/>',
    gedung: '<path d="M16 88V20h40v68M56 40h24v48"/><path d="M28 32h6M42 32h6M28 48h6M42 48h6M28 64h6M42 64h6M66 54h6M66 70h6M8 88h80"/>',
    dokumen: '<path d="M22 8h36l18 18v62H22z"/><path d="M58 8v18h18M34 46h30M34 60h30M34 74h18"/>',
    palu: '<path d="M18 40l24-24 14 14-24 24z"/><path d="M46 46l36 36"/><path d="M12 88h40"/>',
    serikat: '<circle cx="28" cy="30" r="10"/><circle cx="68" cy="30" r="10"/><path d="M10 82V60c0-9 8-14 18-14s18 5 18 14v22M50 82V60c0-9 8-14 18-14s18 5 18 14v22"/>',
    kantor: '<rect x="14" y="34" width="68" height="48" rx="6"/><path d="M36 34v-10c0-4 3-6 6-6h12c3 0 6 2 6 6v10M14 54h68"/>',
  };
  K.ICONS = Object.keys(ICON);
  K.icon = (name, size = 96, color = T.ink, sw = 5) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 96 96" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="color:${color};display:block">${ICON[name] || ""}</svg>`;

  /**
   * Narrators, flattened: ink outline, Nisa teal hijab + paper top, Beni teal shirt, Muklis keeps his batik.
   * Same roles API as F1.cine.cast (one role per narration line).
   */
  const RECOLOR = [
    [/#2a2a2e/gi, T.castLine], [/#1d1b1c/gi, T.castLine],
    [/#8fae8c/gi, T.teal], [/#7a9a78/gi, T.tealDark], [/#a3b996/gi, T.card], [/#4b5b73/gi, T.teal],
    [/#d0413a/gi, T.teal], [/#2f6fbf/gi, T.ink2], [/#6b7a55/gi, "#2b2b2b"], [/fill="#f0a493" opacity="0.55"/gi, 'fill="#f0a493" opacity="0.3"'],
  ];
  K.cast = (S, f, roles) => {
    let s = F1.cine.cast(S, f, roles);
    for (const [a, b] of RECOLOR) s = s.replace(a, b);
    return s;
  };
  K.CAST = F1.cine.CAST;

  /** Month grid (7 cols). days = [first, last]; ring = days ringed in teal pen (each ringed from ringAt + 4*i). */
  K.calendar = (f, { x, y, w = 520, month = "DESEMBER", first = 8, last = 28, shade = [], ring = [], ringAt = 0, note = "" }) => {
    const cells = [];
    for (let d = first; d <= last; d++) {
      const i = ring.indexOf(d);
      const sh = shade.includes(d);
      const pen = i >= 0 ? K.pen(f, { at: ringAt + 5 * i, x: 6, y: 6, w: 44, h: 34, color: T.teal, sw: 6, frames: 10 }) : "";
      cells.push(`<div style="${css({ position: "relative", padding: "8px 0", borderRadius: 6, background: sh ? T.paper2 : "transparent" })}">${d}${pen}</div>`);
    }
    return `<div style="${css({ position: "absolute", left: x, top: y, width: w, boxSizing: "border-box", padding: "26px 30px", background: T.card, border: `4px solid ${T.ink}`, borderRadius: 14, boxShadow: `10px 10px 0 ${T.shadow}` })}"><div style="${css({ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: OSW, fontWeight: 700, fontSize: 32 })}"><span>${month}</span><span style="${css({ fontFamily: MONO, fontSize: 20, color: T.ink2 })}">${note}</span></div><div style="${css({ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginTop: 16, fontFamily: MONO, fontWeight: 600, fontSize: 30, textAlign: "center", color: T.ink })}">${cells.join("")}</div></div>`;
  };

  /** Checklist row: box + tick drawn at `tick`, big label, small mono sub. Enters at `at`. */
  K.checkRow = (f, { at, tick, x = 72, y, w = 888, label, sub = "", out = null }) =>
    K.box(f, { at, out, x, y, w, frames: 10, html: `<div style="${css({ display: "flex", gap: 28, alignItems: "center", paddingBottom: 22, borderBottom: `3px solid ${T.rule}` })}"><div style="${css({ width: 84, height: 84, flex: "none", border: `5px solid ${T.ink}`, borderRadius: 12, background: T.card, display: "flex", alignItems: "center", justifyContent: "center" })}">${K.tick(f, { at: tick })}</div><div><div style="${css({ fontFamily: OSW, fontWeight: 700, fontSize: 60, lineHeight: 1 })}">${label}</div>${sub ? `<div style="${css({ fontFamily: MONO, fontWeight: 600, fontSize: 22, color: T.ink2, marginTop: 8 })}">${sub}</div>` : ""}</div></div>` });

  /** Numbered evidence tile with a line icon. on=false greys it out. */
  K.tile = (f, { at, out = null, x, y, w, h, num, icon, big, small = "", bigSize = 64, on = true }) =>
    K.card(f, { at, out, x, y, w, h, pad: "24px 26px", bg: T.card, shadow: on, html: `<div style="${css({ opacity: on ? 1 : 0.4 })}"><div style="${css({ display: "flex", justifyContent: "space-between", alignItems: "flex-start" })}"><span style="${css({ fontFamily: MONO, fontWeight: 800, fontSize: 30, color: T.teal })}">${num}</span>${K.icon(icon, 80)}</div><div style="${css({ fontFamily: OSW, fontWeight: 700, fontSize: bigSize, lineHeight: 1, marginTop: 10 })}">${big}</div>${small ? `<div style="${css({ fontFamily: MONO, fontWeight: 700, fontSize: 22, lineHeight: 1.35, color: T.ink2, marginTop: 10 })}">${small}</div>` : ""}</div>` });

  /** Case folder (tab + body) holding `html` on a paper sheet. */
  K.folder = (f, { at = -12, x = 110, y = 300, w = 860, h = 820, html }) => {
    const { p, tr } = enter(f, at, 14);
    if (p <= 0) return "";
    return `<div style="${css({ position: "absolute", left: x, top: y, width: w, height: h, opacity: n(p, 3), transform: tr })}"><div style="${css({ position: "absolute", left: 0, top: 0, width: 300, height: 80, background: T.folderTab, border: `4px solid ${T.ink}`, borderBottom: "none", borderRadius: "16px 16px 0 0" })}"></div><div style="${css({ position: "absolute", left: 0, top: 74, right: 0, bottom: 0, background: T.folder, border: `4px solid ${T.ink}`, borderRadius: "0 16px 16px 16px", boxShadow: `12px 12px 0 ${T.shadow}` })}"></div><div style="${css({ position: "absolute", left: 56, top: 140, right: 56, padding: "40px 44px", background: T.card, border: `4px solid ${T.ink}`, borderRadius: 12, transform: "rotate(-1.5deg)" })}">${html}</div></div>`;
  };

  /**
   * The TikTok cover card (z 50, full bleed) from `at` (default: 4 frames after the last word) to the end:
   * red case stamp, title lines (accent line in teal), rule, tag, icon (or `art`: raw HTML shown large under the tag, e.g. the subject object). Centred in y 240-1680.
   */
  K.cover = (f, S, { at = null, lines = [], tag = "", icon = "kalender", size = 132, art = "" }) => {
    const last = S.lines[S.lines.length - 1];
    const t0 = at ?? Math.round(last.end * F1.FPS) + 4;
    const cv = ramp(f, t0, 5);
    if (cv <= 0) return "";
    const rows = lines.map((l) => `<div style="${css({ color: l.accent ? T.teal : T.ink })}">${F1.esc(l.t)}</div>`).join("");
    return `<div style="${css({ position: "absolute", inset: 0, zIndex: 50, color: T.ink, background: T.paper, opacity: n(cv, 3) })}">${K.ground()}<div style="${css({ position: "absolute", left: 72, width: 888, top: 240, height: 1440, display: "flex", flexDirection: "column", justifyContent: "center" })}">
<div style="align-self:flex-start;transform:rotate(-4deg)"><div style="${css({ fontFamily: OSW, fontWeight: 700, fontSize: 50, letterSpacing: 3, color: T.red, border: `6px solid ${T.red}`, borderRadius: 10, padding: "6px 22px" })}">${F1.esc(caseId())}</div></div>
<div style="${css({ fontFamily: OSW, fontWeight: 700, fontSize: size, lineHeight: 0.98, textTransform: "uppercase", marginTop: 44 })}">${rows}</div>
<div style="${css({ height: 6, background: T.ink, marginTop: 44 })}"></div>
<div style="${css({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 28 })}"><div style="${css({ fontFamily: MONO, fontWeight: 700, fontSize: 32, color: T.ink2 })}">${tag}</div>${art ? "" : icon ? K.icon(icon, 240) : ""}</div>${art}</div></div>`;
  };
})((globalThis.F1 = globalThis.F1 || {}));
