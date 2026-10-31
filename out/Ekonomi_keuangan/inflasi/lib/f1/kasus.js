/*
 * Kit for the "Kasus Nasi Goreng" short (1080x1920), doodle look after @Ror_Fly's recipe explainer:
 * one ink pen with a slight line boil, pastel fills, one coral accent, a persistent title + suspect stepper,
 * the evidence object on the left and an info card on the right. `(props, f) => HTML string`, all frame-driven.
 *
 *   const pen = K.pen("bahan", f)                         call first in a scene: the line-boil filter defs (put it in the output)
 *   K.sk(html)                                            wraps drawings in the doodle filter (never text: it stays crisp)
 *   K.inked(html)                                         sk plus an ink contour around the silhouette (mascots)
 *   K.rp(n)                                               "Rp20.000" (Indonesian thousands dots)
 *   K.Title({ dark }, f)                                  "KASUS NASI GORENG" + hand-written subtitle (frame overlay)
 *   K.Stepper({ active, done, at, dark }, f)              PENJUAL BAHAN KITA DALANG VONIS (frame overlay)
 *   K.Card({ x, y, w, at, kicker, big, label, sub, bar, dark }, f)   info card; bar = { k, text, split }
 *   K.Stamp({ text, x, y, at, color, rot, size }, f)      rubber stamp that slams in (scale 1.6 -> 1)
 *   K.Receipt({ x, y, w, at, price, oldPrice, strikeAt }, f)   nasi goreng receipt
 *   K.Note({ x, y, w, at, shrink, shrinkAt, frames }, f)  a Rp100.000 note (drawn), optional shrink
 *   K.Icon(name, size)                                    doodle icons: rice chili egg gas plate coin cart envelope ice mattress shield
 *   K.Pop({ x, y, at, frames }, f, inner)                 pop-in wrapper, x,y = centre
 *   K.Up({ x, y, at, size }, f)                           coral "price up" arrow that pops in
 *   K.Label(text, { size, color })                        hand-written label
 *
 * Stage: title y 120-300, stepper y 330-440, object x 60-520 / card x 560-960 between y 480 and 1000,
 * captions y 1040-1240, mascots' feet y 1580. The bottom ~15% and right ~120 px stay clear (platform UI).
 */
(function (F1) {
  const { doodle: C, font } = F1.theme;
  const n = F1.n;
  const W = F1.STAGE.width;
  const RED = C.coral;
  const INK = C.ink;
  const PEN = 4; // stroke width of the pen, in icon units (viewBox 100)
  // font stacks for SVG attributes (double quotes inside an attribute would end it)
  const FT = font.title.replace(/"/g, "'");
  const FH = font.hand.replace(/"/g, "'");

  /* ---------------------------------------------------------------- the pen (line boil) */

  let fx = "none";
  /** Line-boil filter for this scene: a new noise seed every 5 frames (6 fps boil), tiny displacement. */
  const pen = (id, f, { scale = 2.6, step = 5 } = {}) => {
    const fid = `pen-${id}`;
    fx = `url(#${fid})`;
    const seed = (Math.floor(Math.max(0, f) / step) % 6) + 1;
    return `<svg width="0" height="0" style="position:absolute"><filter id="${fid}" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="${seed}"/><feDisplacementMap in="SourceGraphic" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/></filter></svg>`;
  };
  const sk = (html, extra = {}) => (html ? `<div style="${F1.css({ position: "absolute", inset: 0, filter: fx, ...extra })}">${html}</div>` : "");
  /** Like sk, plus an ink contour around the silhouette (the mascots: same pen as the props without redrawing them). */
  const inked = (html, w = 3) => {
    const o = [[w, 0], [-w, 0], [0, w], [0, -w]].map(([x, y]) => `drop-shadow(${x}px ${y}px 0 ${INK})`).join(" ");
    return sk(html, { filter: `${o} ${fx}` });
  };

  const rp = (v) => `Rp${Math.round(v).toLocaleString("id-ID")}`;

  /** Chunky outlined title text (Luckiest Guy, coral fill, ink outline drawn under the fill). */
  const outlined = (text, { size, color = RED, stroke = INK, width = 0.07 }) =>
    `<span style="${F1.css({ fontFamily: font.title, fontSize: size, lineHeight: 1, color, WebkitTextStroke: `${n(size * width)}px ${stroke}`, paintOrder: "stroke fill", letterSpacing: "0.02em" })}">${F1.esc(text)}</span>`;

  const Label = (text, { size = 30, color = C.muted, extra = {} } = {}) =>
    `<div style="${F1.css({ fontFamily: font.hand, fontSize: size, lineHeight: 1.15, color, textAlign: "center", ...extra })}">${F1.esc(text)}</div>`;

  const Pop = ({ x, y, at = 0, frames = 14 }, f, inner) => {
    if (f < at) return "";
    const s = F1.popScale(f, at, frames);
    return `<div style="${F1.css({ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${n(s, 4)})`, opacity: n(Math.min(1, F1.ramp(f, at, 6)), 3) })}">${inner}</div>`;
  };

  /* ---------------------------------------------------------------- frame overlay: title + stepper */

  const Title = ({ dark = false } = {}, f) => {
    const p = F1.ramp(f, -10, 12);
    return `<div style="${F1.css({ position: "absolute", left: 60, width: 900, top: 140, textAlign: "center", opacity: n(p, 3) })}">
<div style="white-space:nowrap">${outlined("KASUS NASI GORENG", { size: 84, stroke: dark ? C.paper : INK })}</div>
${Label("harga naik terus  ·  siapa pelakunya?", { size: 36, color: dark ? "#c9c3be" : C.muted, extra: { marginTop: 10 } })}</div>`;
  };

  const STEPS = ["PENJUAL", "BAHAN", "KITA", "DALANG", "VONIS"];
  /** Suspect stepper. active = index of the current step (-1 none); done = steps already checked; at = frame the active step lit up. */
  const Stepper = ({ active = -1, done = 0, at = 0, dark = false }, f) => {
    const y = 380;
    const x0 = 150;
    const dx = 195;
    const R = 28;
    const line = dark ? "#5b5557" : C.grey;
    const parts = [];
    const labels = [];
    for (let i = 0; i < STEPS.length; i++) {
      const x = x0 + i * dx;
      if (i < STEPS.length - 1) {
        const lit = i < done ? 1 : 0;
        parts.push(`<line x1="${x + R + 6}" y1="${y}" x2="${x + dx - R - 6}" y2="${y}" stroke="${lit ? RED : line}" stroke-width="5" stroke-linecap="round"/>`);
      }
      const isDone = i < done;
      const isActive = i === active && !isDone;
      const s = isActive ? F1.popScale(f, at, 16) : 1;
      const fill = isDone ? RED : dark ? C.night : "#ffffff";
      const ring = isDone ? (dark ? C.paper : INK) : isActive ? RED : line;
      const mark = isDone
        ? `<path d="M ${x - 11} ${y + 1} L ${x - 3} ${y + 10} L ${x + 13} ${y - 9}" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`
        : `<text x="${x}" y="${y + 11}" text-anchor="middle" font-family="${FT}" font-size="30" fill="${isActive ? RED : line}">${i + 1}</text>`;
      parts.push(`<g transform="translate(${x} ${y}) scale(${n(s, 4)}) translate(${-x} ${-y})"><circle cx="${x}" cy="${y}" r="${R}" fill="${fill}" stroke="${ring}" stroke-width="${isActive ? 6 : 4.5}"/>${mark}</g>`);
      const lc = isActive ? RED : isDone ? (dark ? C.paper : INK) : dark ? "#8a8486" : C.muted;
      labels.push(`<div style="${F1.css({ position: "absolute", left: x - 90, width: 180, top: y + R + 10, textAlign: "center", fontFamily: font.hand, fontSize: 28, letterSpacing: "0.04em", color: lc })}">${STEPS[i]}</div>`);
    }
    return sk(`<svg width="${W}" height="520" viewBox="0 0 ${W} 520" style="position:absolute;left:0;top:0">${parts.join("")}</svg>`) + labels.join("");
  };

  /* ---------------------------------------------------------------- info card (right column) */

  /** Ror_Fly's measurement card: small coral kicker, a big outlined number, the name, a hand-written note, a progress bar. */
  const Card = ({ x = 560, y = 520, w = 400, at = 0, kicker, big, label, sub, bar, dark = false, bigSize = 104 }, f) => {
    if (f < at) return "";
    const p = F1.ramp(f, at, 16, F1.expoOut);
    const paper = dark ? C.night : "#ffffff";
    const ink = dark ? C.paper : INK;
    const box = `<div style="${F1.css({ position: "absolute", inset: 0, filter: fx })}"><div style="${F1.css({ position: "absolute", inset: 0, background: paper, border: `4px solid ${ink}`, borderRadius: 22, boxShadow: `8px 10px 0 ${dark ? "#000" : C.coralSoft}` })}"></div></div>`;
    let barHtml = "";
    if (bar) {
      const k = F1.clamp01(bar.k);
      const segs = bar.split
        ? bar.split.map((s) => `<div style="${F1.css({ width: `${n(s.k * 100, 2)}%`, height: "100%", background: s.color })}"></div>`).join("")
        : `<div style="${F1.css({ width: `${n(k * 100, 2)}%`, height: "100%", background: dark ? C.coralLight : RED })}"></div>`;
      barHtml = `<div style="${F1.css({ display: "flex", alignItems: "center", gap: 14, marginTop: 18 })}">
<div style="${F1.css({ position: "relative", flex: 1, height: 26 })}"><div style="${F1.css({ position: "absolute", inset: 0, filter: fx })}"><div style="${F1.css({ position: "absolute", inset: 0, display: "flex", borderRadius: 14, overflow: "hidden", border: `3.5px solid ${ink}`, background: dark ? "#2e2a2b" : "#ffffff" })}">${segs}</div></div></div>
${bar.text ? `<div style="${F1.css({ fontFamily: font.hand, fontSize: 28, color: dark ? "#c9c3be" : C.muted, whiteSpace: "nowrap" })}">${F1.esc(bar.text)}</div>` : ""}</div>`;
    }
    return `<div style="${F1.css({ position: "absolute", left: x, top: y, width: w, opacity: n(Math.min(1, p * 1.4), 3), transform: `translateX(${n((1 - p) * 60)}px) rotate(${n((1 - p) * 3)}deg)` })}">${box}
<div style="${F1.css({ position: "relative", padding: "28px 32px 30px" })}">
${kicker ? `<div style="${F1.css({ fontFamily: font.hand, fontSize: 30, letterSpacing: "0.06em", color: dark ? C.coralLight : RED })}">${F1.esc(kicker)}</div>` : ""}
${big != null ? `<div style="${F1.css({ marginTop: 8, whiteSpace: "nowrap" })}">${outlined(String(big), { size: bigSize, color: dark ? C.coralLight : RED, stroke: ink, width: 0.06 })}</div>` : ""}
${label ? `<div style="${F1.css({ fontFamily: font.title, fontSize: 50, lineHeight: 1.05, color: ink, marginTop: 10, letterSpacing: "0.02em" })}">${F1.esc(label)}</div>` : ""}
${sub ? `<div style="${F1.css({ fontFamily: font.hand, fontSize: 30, lineHeight: 1.15, color: dark ? "#c9c3be" : C.muted, marginTop: 6 })}">${F1.esc(sub)}</div>` : ""}
${barHtml}</div></div>`;
  };

  /* ---------------------------------------------------------------- props */

  const Stamp = ({ text, x, y, at, color = RED, rot = -8, size = 64 }, f) => {
    if (f < at) return "";
    const p = F1.ramp(f, at, 8, F1.Easing.in(F1.Easing.quad));
    const s = 1.6 - 0.6 * p;
    const shake = f < at + 14 ? Math.sin((f - at) * 2.6) * (1 - F1.ramp(f, at + 8, 6)) * 4 : 0;
    const wrap = F1.css({ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) translateX(${n(shake)}px) rotate(${rot}deg) scale(${n(s, 4)})`, opacity: n(Math.min(1, p * 1.5) * 0.94, 3) });
    const box = `<div style="${F1.css({ position: "absolute", inset: 0, filter: fx })}"><div style="${F1.css({ position: "absolute", inset: 0, border: `9px solid ${color}`, borderRadius: 16, background: "rgba(255,255,255,0.86)" })}"></div></div>`;
    return `<div style="${wrap}">${box}<div style="${F1.css({ position: "relative", padding: "14px 30px 8px", color, fontFamily: font.title, fontSize: size, letterSpacing: "0.04em", whiteSpace: "nowrap", lineHeight: 1 })}">${F1.esc(text)}</div></div>`;
  };

  /** Receipt, x,y = top-left. `price` counts from oldPrice to price between strikeAt and strikeAt+24. */
  const Receipt = ({ x = 70, y = 520, w = 450, at = 0, price = 20000, oldPrice = 5000, strikeAt = 10 }, f) => {
    if (f < at) return "";
    const p = F1.ramp(f, at, 14, F1.expoOut);
    const k = F1.ramp(f, strikeAt, 24, F1.easeOut);
    const shown = Math.round((oldPrice + (price - oldPrice) * k) / 500) * 500;
    const row = (l, r, extra = {}) =>
      `<div style="${F1.css({ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: font.hand, fontSize: 34, color: INK, ...extra })}"><span>${l}</span><span>${r}</span></div>`;
    const dash = `<div style="${F1.css({ borderTop: `3px dashed ${C.grey}`, margin: "14px 0" })}"></div>`;
    // paper with a torn (zigzag) bottom edge, drawn in the pen
    const N = 16;
    let d = "M 0 0 L 100 0 L 100 97";
    for (let i = N - 1; i >= 0; i--) d += ` L ${n(((i + 0.5) * 100) / N, 2)} 100 L ${n((i * 100) / N, 2)} 97`;
    const paper = `<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;overflow:visible"><path d="${d} Z" fill="#fff" stroke="${INK}" stroke-width="4" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>`;
    return `<div style="${F1.css({ position: "absolute", left: x, top: y, width: w, transform: `translateY(${n((1 - p) * 60)}px) rotate(-3deg)`, opacity: n(p, 3) })}">
<div style="${F1.css({ position: "absolute", inset: 0, filter: `${fx} drop-shadow(8px 10px 0 ${C.coralSoft})` })}">${paper}</div>
<div style="${F1.css({ position: "relative", padding: "30px 34px 46px" })}">
<div style="${F1.css({ textAlign: "center", fontFamily: font.title, fontSize: 34, color: INK, letterSpacing: "0.03em", whiteSpace: "nowrap" })}">WARUNG PAK UJANG</div>
${Label("nasi goreng sejak dulu", { size: 28, extra: { marginTop: 2 } })}${dash}
${row("Nasi goreng x1", "")}
${row(`<span style="${F1.css({ textDecoration: k > 0 ? "line-through" : "none", textDecorationThickness: "3px", color: k > 0 ? C.muted : INK })}">${rp(oldPrice)}</span>`, "", { marginTop: 4, fontSize: 40 })}${dash}
${row(`<span style="margin-right:18px">TOTAL</span>`, outlined(rp(shown), { size: 60, color: k > 0 ? RED : INK, stroke: INK, width: k > 0 ? 0.05 : 0 }), { alignItems: "center" })}</div></div>`;
  };

  /** A Rp100.000 note (drawn, not a reproduction), centred at x,y. Shrinks to `shrink` of its width from shrinkAt. */
  const Note = ({ x = 290, y = 700, w = 440, at = 0, shrink = 1, shrinkAt = 0, frames = 40 }, f) => {
    if (f < at) return "";
    const pin = F1.popScale(f, at, 16);
    const k = shrink === 1 ? 0 : F1.ramp(f, shrinkAt, frames, F1.expoInOut);
    const s = pin * (1 - (1 - shrink) * k);
    const h = w * 0.5;
    const svg = `<svg width="${w}" height="${n(h)}" viewBox="0 0 400 200" style="overflow:visible">
<rect x="4" y="4" width="392" height="192" rx="16" fill="#f4a3b1" stroke="${C.paper}" stroke-width="6"/>
<rect x="20" y="20" width="360" height="160" rx="10" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round"/>
<circle cx="300" cy="100" r="54" fill="#fff" fill-opacity="0.35" stroke="${C.paper}" stroke-width="4"/>
<text x="34" y="74" font-family="${FT}" font-size="50" fill="#fff" stroke="${INK}" stroke-width="3" paint-order="stroke">100.000</text>
<text x="34" y="108" font-family="${FH}" font-size="24" fill="${INK}">seratus ribu rupiah</text>
<text x="34" y="170" font-family="${FT}" font-size="38" fill="#fff" stroke="${INK}" stroke-width="2.5" paint-order="stroke">Rp</text></svg>`;
    return `<div style="${F1.css({ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${n(s, 4)}) rotate(-4deg)`, filter: fx })}">${svg}</div>`;
  };

  const st = `stroke="${INK}" stroke-width="${PEN}" stroke-linejoin="round" stroke-linecap="round"`;
  const ICONS = {
    rice: () => `<path d="M14 48 Q50 108 86 48 Z" fill="${C.ice}" ${st}/><path d="M18 48 Q22 26 50 24 Q78 26 82 48 Z" fill="#fff" ${st}/><path d="M36 36 l3 -3 M52 32 l3 -2 M64 38 l3 -3" ${st} stroke-width="3"/><rect x="36" y="82" width="28" height="9" rx="4" fill="${C.ice}" ${st}/>`,
    chili: () => `<path d="M30 30 Q84 22 76 84 Q60 54 24 46 Z" fill="${RED}" ${st}/><path d="M28 32 Q18 18 32 8" fill="none" ${st} stroke="#3e8a3a" stroke-width="7"/><path d="M40 36 Q60 36 66 56" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.7"/>`,
    egg: () => `<path d="M10 58 Q12 30 40 32 Q56 18 76 30 Q94 40 88 62 Q84 84 52 84 Q14 86 10 58 Z" fill="#fff" ${st}/><circle cx="52" cy="56" r="16" fill="${C.butter}" ${st}/><circle cx="47" cy="51" r="4" fill="#fff"/>`,
    gas: () => `<rect x="22" y="26" width="56" height="64" rx="18" fill="${C.mint}" ${st}/><rect x="38" y="8" width="24" height="20" rx="5" fill="${C.grey}" ${st}/><text x="50" y="68" text-anchor="middle" font-family="${FT}" font-size="20" fill="#fff" stroke="${INK}" stroke-width="2" paint-order="stroke">LPG</text>`,
    plate: () => `<ellipse cx="50" cy="64" rx="44" ry="18" fill="#fff" ${st}/><path d="M22 62 Q50 14 78 62 Z" fill="#e8a24a" ${st}/><circle cx="50" cy="40" r="9" fill="#fff" ${st} stroke-width="3"/><circle cx="50" cy="40" r="4" fill="${C.butter}"/>`,
    coin: () => `<circle cx="50" cy="50" r="40" fill="${C.butter}" ${st}/><circle cx="50" cy="50" r="30" fill="none" ${st} stroke-width="2.5" stroke-dasharray="3 6"/><text x="50" y="62" text-anchor="middle" font-family="${FT}" font-size="30" fill="${INK}">Rp</text>`,
    cart: () => `<rect x="10" y="44" width="80" height="32" rx="6" fill="${RED}" ${st}/><rect x="16" y="20" width="68" height="24" rx="4" fill="${C.ice}" ${st}/><path d="M6 20 L94 20" ${st} stroke-width="6"/><path d="M90 60 L98 60" ${st}/><circle cx="28" cy="84" r="10" fill="#fff" ${st}/><circle cx="72" cy="84" r="10" fill="#fff" ${st}/><text x="50" y="66" text-anchor="middle" font-family="${FT}" font-size="13" fill="#fff">NASGOR</text>`,
    envelope: () => `<rect x="10" y="22" width="80" height="58" rx="6" fill="${C.mint}" ${st}/><path d="M10 26 L50 56 L90 26" fill="none" ${st} stroke="${C.butter}" stroke-width="6"/><path d="M10 26 L50 56 L90 26" fill="none" ${st} stroke-width="2"/><text x="50" y="76" text-anchor="middle" font-family="${FT}" font-size="17" fill="#fff" stroke="${INK}" stroke-width="2" paint-order="stroke">THR</text>`,
    ice: () => `<rect x="16" y="16" width="68" height="68" rx="14" fill="${C.ice}" ${st}/><path d="M28 30 L46 30 M28 40 L36 40" stroke="#fff" stroke-width="6" stroke-linecap="round"/><path d="M84 40 L92 46" ${st} stroke="${C.iceDeep}"/>`,
    mattress: () => `<rect x="4" y="30" width="8" height="58" rx="3" fill="#c99a68" ${st} stroke-width="3"/><rect x="6" y="52" width="88" height="22" rx="8" fill="${C.ice}" ${st} stroke-width="3"/><rect x="14" y="40" width="26" height="14" rx="7" fill="#fff" ${st} stroke-width="3"/><path d="M44 52 Q70 42 94 52" fill="${C.coralSoft}" ${st} stroke-width="3"/><path d="M8 74 L8 90 M92 74 L92 90" ${st} stroke-width="3"/>`,
    shield: () => `<path d="M50 8 L86 22 L86 50 Q86 80 50 94 Q14 80 14 50 L14 22 Z" fill="${C.mint}" ${st}/><path d="M32 52 L46 66 L70 38" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`,
  };
  const Icon = (name, size = 120) => `<svg width="${size}" height="${size}" viewBox="0 0 100 100" style="overflow:visible">${ICONS[name]()}</svg>`;

  const Up = ({ x, y, at, size = 70 }, f) =>
    Pop({ x, y, at, frames: 12 }, f, `<svg width="${size}" height="${size}" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="${RED}" ${st}/><path d="M50 22 L76 52 L60 52 L60 78 L40 78 L40 52 L24 52 Z" fill="#fff" ${st} stroke-width="3"/></svg>`);

  F1.kasus = { pen, sk, inked, rp, outlined, Label, Pop, Title, Stepper, Card, Stamp, Receipt, Note, Icon, Up, W, RED, INK, STEPS };
})((globalThis.F1 = globalThis.F1 || {}));
