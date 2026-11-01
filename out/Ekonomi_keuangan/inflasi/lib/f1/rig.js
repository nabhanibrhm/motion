/**
 * Puppet rig for the human cast (Muklis, Nisa, Beni). The same flat drawings as public/cast/*.svg, split into
 * parts that move: arms swing from the shoulder, the head tilts and nods from the neck, eyes blink, the mouth
 * opens with the voice. Pure functions of the pose, so renders stay deterministic.
 *
 *   F1.rig.svg(who, expr, pose, w, uid)  inline <svg> `w` px wide (uid keeps its pattern ids unique on the page); who: muklis | nisa | beni, expr: biasa | senyum | kaget
 *   F1.rig.pose(f, opts)             the pose at frame f: { talk (0..1, eased), speaking, at, seed, expr }
 *
 * A pose: { open 0..1 (mouth), blink 0..1, head (deg), headY (px), armL, armR, phone (deg), brow (px) }.
 * Arm angles are SVG rotations around the shoulder: positive swings the hand clockwise.
 */
(function (F1) {
  const n = F1.n;
  const R = (F1.rig = {});
  const INK = "#2a2a2e";
  const MOUTH = "#5a2a26";

  const rot = (a, x, y) => `rotate(${n(a, 2)} ${x} ${y})`;
  const g = (t, body) => `<g transform="${t}">${body}</g>`;
  // eyes close by squashing towards their centre line
  const blinkT = (b, y) => `translate(0 ${y}) scale(1 ${n(1 - 0.92 * b, 3)}) translate(0 ${-y})`;
  // closed: the drawing's own mouth; open: a dark D that deepens with `o`
  const talkMouth = (cx, top, w, o) =>
    `<path d="M${cx - w / 2} ${top} Q${cx} ${top + 3} ${cx + w / 2} ${top} Q${cx} ${n(top + 2 * (5 + 15 * o))} ${cx - w / 2} ${top} Z" fill="${MOUTH}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
  const smile = (cx, y) => `<path d="M${cx - 24} ${y} q24 14 48 0" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  const gasp = (cx, y, o) => `<ellipse cx="${cx}" cy="${y}" rx="13" ry="${n(15 + 6 * o)}" fill="${MOUTH}" stroke="${INK}" stroke-width="5"/>`;
  const roundEyes = (y, r, pr, dx = 1) =>
    `<g fill="#ffffff" stroke="${INK}" stroke-width="4"><circle cx="146" cy="${y}" r="${r}"/><circle cx="214" cy="${y}" r="${r}"/></g><g fill="#1d1b1c"><circle cx="${146 + dx}" cy="${y + 1}" r="${pr}"/><circle cx="${214 - dx}" cy="${y + 1}" r="${pr}"/></g>`;

  /* ---------------------------------------------------------------- Muklis: batik, glasses */

  const BATIK = (id) => `<pattern id="${id}" width="48" height="48" patternUnits="userSpaceOnUse" patternTransform="rotate(-32)"><rect width="48" height="48" fill="#7a4a2b"/><rect y="0" width="48" height="14" fill="#3d2416"/><g fill="#e8cfa0"><circle cx="12" cy="31" r="6"/><circle cx="36" cy="31" r="6"/></g><g fill="#3d2416"><circle cx="12" cy="31" r="2"/><circle cx="36" cy="31" r="2"/></g><g fill="#d9b27a"><circle cx="24" cy="7" r="2.5"/><circle cx="0" cy="7" r="2.5"/><circle cx="48" cy="7" r="2.5"/></g></pattern>`;
  const SKIN_M = "#c68a5e";
  const muklis = (expr, p, uid) => {
    const pat = `btm-${uid}`;
    const st = `stroke="${INK}" stroke-width="6" stroke-linejoin="round"`;
    const eyes =
      expr === "senyum"
        ? `<g fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"><path d="M132 186 q14 -16 28 0"/><path d="M200 186 q14 -16 28 0"/></g>`
        : g(blinkT(p.blink, 182), roundEyes(182, 16, 8));
    const mouth =
      expr === "senyum"
        ? `<path d="M150 234 q30 ${n(28 + 14 * p.open)} 60 0 Z" fill="#ffffff" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`
        : p.open > 0.1
          ? talkMouth(180, 236, 46, p.open)
          : smile(180, 238);
    return `<defs>${BATIK(pat)}</defs><ellipse cx="180" cy="950" rx="150" ry="18" fill="#000" opacity="0.12"/>
<g ${st}><rect x="118" y="540" width="56" height="346" rx="18" fill="#23262d"/><rect x="186" y="540" width="56" height="346" rx="18" fill="#23262d"/><path d="M98 878 h82 v36 q0 14 -14 14 h-56 q-16 0 -16 -16 Z" fill="#f7f6f2"/><path d="M180 878 h82 v34 q0 16 -16 16 h-52 q-14 0 -14 -14 Z" fill="#f7f6f2"/>
${g(rot(p.armL, 72, 300), `<rect x="44" y="292" width="56" height="262" rx="26" fill="url(#${pat})" transform="rotate(6 72 292)"/><circle cx="56" cy="566" r="25" fill="${SKIN_M}"/>`)}
${g(rot(p.armR, 288, 300), `<rect x="260" y="292" width="56" height="262" rx="26" fill="url(#${pat})" transform="rotate(-6 288 292)"/><circle cx="304" cy="566" r="25" fill="${SKIN_M}"/>`)}
<path d="M92 284 Q180 258 268 284 L280 572 Q180 588 80 572 Z" fill="url(#${pat})"/><path d="M180 304 V580" fill="none"/><path d="M148 270 L180 306 L160 320 L138 286 Z" fill="#4a2d1c"/><path d="M212 270 L180 306 L200 320 L222 286 Z" fill="#4a2d1c"/></g>
${g(`${rot(p.head, 180, 276)} translate(0 ${n(p.headY)})`, `<g ${st}><rect x="156" y="236" width="48" height="44" fill="${SKIN_M}"/><circle cx="90" cy="184" r="18" fill="${SKIN_M}"/><circle cx="270" cy="184" r="18" fill="${SKIN_M}"/><ellipse cx="180" cy="174" rx="90" ry="96" fill="${SKIN_M}"/><path d="M88 168 Q80 76 180 68 Q280 76 272 168 Q266 128 240 114 Q200 98 150 110 Q132 126 104 132 Q92 144 88 168 Z" fill="#1d1b1c"/></g>
<g stroke="${INK}" stroke-width="6" stroke-linecap="round" fill="none" transform="translate(0 ${n(-p.brow)})"><path d="M124 140 q20 -8 40 -2"/><path d="M196 138 q20 -6 40 2"/></g>${eyes}
<g fill="none" stroke="#1d1b1c" stroke-width="7"><rect x="112" y="158" width="64" height="48" rx="9"/><rect x="184" y="158" width="64" height="48" rx="9"/><path d="M176 176 h8 M112 172 h-20 M248 172 h20"/></g><path d="M180 200 v16" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>${mouth}`)}`;
  };

  /* ---------------------------------------------------------------- Nisa: pashmina hijab, phone */

  const SKIN_N = "#f6dcc8";
  const nisa = (expr, p) => {
    const st = `stroke="${INK}" stroke-width="6" stroke-linejoin="round"`;
    const kaget = expr === "kaget";
    const eyes = kaget
      ? `<g fill="#ffffff" stroke="${INK}" stroke-width="4"><circle cx="150" cy="186" r="15"/><circle cx="210" cy="186" r="15"/></g><g fill="#1d1b1c"><circle cx="150" cy="186" r="7"/><circle cx="210" cy="186" r="7"/></g>`
      : `<g fill="#1d1b1c"><ellipse cx="150" cy="186" rx="10" ry="13"/><ellipse cx="210" cy="186" rx="10" ry="13"/></g><g fill="#ffffff"><circle cx="153" cy="181" r="3.5"/><circle cx="213" cy="181" r="3.5"/></g>`;
    const brows = kaget ? 146 : 154;
    const mouth = kaget ? gasp(180, 236, p.open) : p.open > 0.1 ? talkMouth(180, 228, 44, p.open) : smile(180, 230);
    return `<ellipse cx="180" cy="950" rx="140" ry="18" fill="#000" opacity="0.12"/>
<g ${st}><path d="M118 600 L106 884 L172 884 L180 650 L188 884 L254 884 L242 600 Z" fill="#23262d"/><path d="M98 880 h80 v34 q0 14 -14 14 h-54 q-16 0 -16 -16 Z" fill="#f7f6f2"/><path d="M182 880 h80 v32 q0 16 -16 16 h-50 q-14 0 -14 -14 Z" fill="#f7f6f2"/>
${g(rot(p.armR, 285, 305), `<rect x="258" y="300" width="54" height="300" rx="26" fill="#a3b996" transform="rotate(-6 285 300)"/><circle cx="306" cy="612" r="23" fill="${SKIN_N}"/>`)}
<rect x="58" y="300" width="54" height="190" rx="26" fill="#a3b996" transform="rotate(10 85 300)"/><path d="M96 290 Q180 268 264 290 L286 650 Q180 670 74 650 Z" fill="#a3b996"/>
${g(rot(p.phone, 85, 495), `<rect x="60" y="468" width="118" height="54" rx="26" fill="#a3b996" transform="rotate(-28 85 495)"/><rect x="130" y="366" width="46" height="84" rx="10" fill="${INK}" transform="rotate(-10 153 408)"/><circle cx="156" cy="450" r="23" fill="${SKIN_N}"/><rect x="138" y="376" width="30" height="50" rx="5" fill="#4b5b73" stroke="none" transform="rotate(-10 153 408)"/>`)}</g>
<path d="M104 236 Q66 300 78 352 Q180 392 282 352 Q294 300 256 236 Z" fill="#8fae8c" ${st}/>
${g(`${rot(p.head, 180, 300)} translate(0 ${n(p.headY)})`, `<g ${st}><path d="M180 60 Q268 60 280 166 Q286 236 262 280 Q180 306 98 280 Q74 236 80 166 Q92 60 180 60 Z" fill="#8fae8c"/><ellipse cx="180" cy="184" rx="72" ry="80" fill="${SKIN_N}"/></g>
<g fill="none" stroke="#7a9a78" stroke-width="4" stroke-linecap="round"><path d="M100 286 Q180 314 260 286"/><path d="M246 104 Q270 160 266 236"/></g><g fill="#f0a493" opacity="0.55"><ellipse cx="130" cy="216" rx="14" ry="8"/><ellipse cx="230" cy="216" rx="14" ry="8"/></g>
${g(blinkT(p.blink, 186), `${eyes}<g stroke="${INK}" stroke-width="4" stroke-linecap="round"><path d="M140 178 l-9 -6"/><path d="M220 178 l9 -6"/></g>`)}
<g stroke="${INK}" stroke-width="5" stroke-linecap="round" fill="none" transform="translate(0 ${n(-p.brow)})"><path d="M132 ${brows} q16 -8 32 -2"/><path d="M196 ${brows - 2} q16 -6 32 2"/></g>${mouth}`)}`;
  };

  /* ---------------------------------------------------------------- Beni: red kaos, curly hair, sandal jepit */

  const SKIN_B = "#8c5a3c";
  const CURLS = [[80,122],[87,105],[97,90],[110,76],[125,65],[142,57],[161,52],[180,50],[199,52],[218,57],[235,65],[250,76],[263,90],[273,105],[280,122],[130,70],[180,62],[230,70],[150,100],[210,100]];
  const beni = (expr, p) => {
    const st = `stroke="${INK}" stroke-width="6" stroke-linejoin="round"`;
    const kaget = expr === "kaget";
    const brows = kaget ? 142 : 152;
    const mouth = kaget ? gasp(180, 244, p.open) : p.open > 0.1 ? talkMouth(180, 236, 46, p.open) : smile(180, 238);
    return `<ellipse cx="180" cy="950" rx="150" ry="18" fill="#000" opacity="0.12"/>
<g ${st}><rect x="124" y="640" width="48" height="268" rx="20" fill="${SKIN_B}"/><rect x="188" y="640" width="48" height="268" rx="20" fill="${SKIN_B}"/><path d="M100 904 h78 q10 0 10 12 q0 12 -12 12 h-72 q-12 0 -12 -12 q0 -12 8 -12 Z" fill="#2f6fbf"/><path d="M182 904 h78 q8 0 8 12 q0 12 -12 12 h-72 q-12 0 -12 -12 q0 -12 10 -12 Z" fill="#2f6fbf"/><path d="M128 906 l20 -14 l20 14 M192 906 l20 -14 l20 14" fill="none" stroke="#2f6fbf" stroke-width="8"/>
${g(rot(p.armL, 69, 405), `<rect x="46" y="400" width="46" height="190" rx="22" fill="${SKIN_B}" transform="rotate(5 69 400)"/><circle cx="62" cy="600" r="26" fill="${SKIN_B}"/>`)}
${g(rot(p.armR, 291, 405), `<rect x="268" y="400" width="46" height="190" rx="22" fill="${SKIN_B}" transform="rotate(-5 291 400)"/><circle cx="298" cy="600" r="26" fill="${SKIN_B}"/>`)}
<path d="M98 520 L262 520 L272 694 L190 694 L180 620 L170 694 L88 694 Z" fill="#6b7a55"/><path d="M92 290 L40 340 L64 424 L104 404 Z" fill="#d0413a"/><path d="M268 290 L320 340 L296 424 L256 404 Z" fill="#d0413a"/><path d="M90 286 Q180 262 270 286 L276 542 Q180 558 84 542 Z" fill="#d0413a"/><path d="M152 272 q28 26 56 0" fill="none"/></g>
${g(`${rot(p.head, 180, 282)} translate(0 ${n(p.headY)})`, `<g ${st}><rect x="156" y="238" width="48" height="44" fill="${SKIN_B}"/><circle cx="88" cy="190" r="18" fill="${SKIN_B}"/><circle cx="272" cy="190" r="18" fill="${SKIN_B}"/><circle cx="180" cy="178" r="92" fill="${SKIN_B}"/></g>
<g fill="#1d1b1c" ${st}>${CURLS.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="26"/>`).join("")}</g><path d="M90 172 Q86 70 180 58 Q274 70 270 172 Q250 126 180 122 Q110 126 90 172 Z" fill="#1d1b1c"/>
<g stroke="${INK}" stroke-width="6" stroke-linecap="round" fill="none" transform="translate(0 ${n(-p.brow)})"><path d="M124 ${brows} q20 -8 40 -2"/><path d="M196 ${brows - 2} q20 -6 40 2"/></g>
${g(blinkT(p.blink, 190), kaget ? roundEyes(190, 18, 5, 1) : roundEyes(190, 16, 8))}<path d="M180 206 v14" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>${mouth}`)}`;
  };

  const DRAW = { muklis, nisa, beni };
  const SEED = { muklis: 0, nisa: 17, beni: 31 };

  /**
   * Idle: breathing nod, a slow head drift, arms hanging with a little sway, a blink every ~3 s.
   * Talking (talk eases 0..1): the mouth flaps on the voice, the head nods and tilts, the free hand gestures.
   * Kaget: a startle when the actor arrives (brows up, arms flinch out, head pulls back) that settles in ~0.5 s.
   */
  R.pose = (f, { talk = 0, speaking = false, at = 0, who = "muklis", expr = "biasa" }) => {
    const s = SEED[who] ?? 0;
    const k = (f + s * 7) % 97;
    const blink = k === 0 || k === 3 ? 0.5 : k === 1 || k === 2 ? 1 : 0;
    const open = speaking ? 0.25 + 0.75 * Math.abs(Math.sin(f * 0.9 + 1.4 * Math.sin(f * 0.37 + s))) : 0;
    const startle = expr === "kaget" ? 1 - F1.ramp(f, at, 16, F1.expoOut) : 0;
    const gest = talk * (14 + 9 * Math.sin(f / 8 + s));
    return {
      open,
      blink: startle > 0.2 ? 0 : blink,
      head: 1.4 * Math.sin(f / 41 + s) + talk * 3 * Math.sin(f / 11 + s) - 4 * startle,
      headY: 1.5 * Math.sin(f / 18) + talk * 3 * Math.abs(Math.sin(f * 0.21 + s)) - 14 * startle,
      brow: talk * 3 * Math.max(0, Math.sin(f / 13 + s)) + 6 * startle,
      // muklis and beni gesture with the hand on the viewer's right; nisa also waves her phone
      armL: 1.5 * Math.sin(f / 29 + s) + talk * (who === "nisa" ? 0 : 4 + 3 * Math.sin(f / 10 + s)) + 22 * startle,
      armR: -1.5 * Math.sin(f / 31 + s) - gest - 22 * startle,
      phone: talk * 5 * Math.sin(f / 9 + s) - 6 * startle,
    };
  };

  R.svg = (who, expr, pose, w, uid = `${who}-${expr}-${w}`) => {
    const h = Math.round((w * 980) / 360);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 360 980" style="display:block;overflow:visible">${DRAW[who](expr, pose, uid)}</svg>`;
  };
})((globalThis.F1 = globalThis.F1 || {}));
