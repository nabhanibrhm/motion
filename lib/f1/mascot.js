/*
 * Mascots MOG, WEC and BOG (port of components/mascot). Same artwork, poses, expressions and lip-sync rules.
 *
 *   F1.Mascot({ character, x, y, scale, facing, look, talking, gesture, pointDir, prop, expression,
 *               at, enter, enterFrames, exitAt, exit, exitFrames, seed, zIndex }, f)  -> HTML string
 *
 * `f` is the scene frame. facing / look / gesture / expression / prop take a value or a [[frame, value], ...]
 * timeline (value holds until the next step; arms blend over 8 frames). `talking` is true/false or
 * [[start, end), ...] frame ranges: THE MOUTH MOVES ONLY THEN. Pass F1.isSpeaking(S, "mog", f) so only the
 * speaking mascot talks; listeners get false. Idle is only a blink and slow breathing.
 *
 * Set pieces (all take x y scale at exitAt exitFrames enter enterFrames; enter: fade | pop | slide-left | slide-right | none):
 *   F1.VelvetDoor({ x, y, scale, openAt, openFrames = 26, rope = true, inner }, f)
 *   F1.Tickets({ x, y, scale = 2, count = 2, angle }, f)
 *   F1.StoryBoard({ x, y, scale, cols = 3, rows = 2, highlight, highlightAt, stand, inner }, f)
 *   F1.TripMap({ x, y, scale, pins: [{ ...F1.US_CITIES.austin, at }], unfoldFrames = 22 }, f)
 */
(function (F1) {
  const { mascot: M, editorial, objects } = F1.theme;
  const n = F1.n;
  const clamp01 = F1.clamp01;
  const lerp = F1.lerp;

  /* ================================================================ parts.tsx */

  // Every character is drawn in this box with feet on y = FEET_Y, so switching state never moves the baseline.
  const VIEW = { x: -20, y: 0, w: 440, h: 480 };
  const FEET_Y = 462;
  const INK = M.ink;
  const SW = 5;

  /** 0..1 blink amount; a periodic, slightly irregular blink derived from the frame. */
  const blinkAmount = (frame, seed) => {
    const PERIOD = 104;
    const DUR = 7;
    const k0 = Math.floor(frame / PERIOD);
    for (let k = k0 - 1; k <= k0; k++) {
      const start = k * PERIOD + 20 + F1.random(`${seed}-blink-${k}`) * 52;
      const d = frame - start;
      if (d >= 0 && d < DUR) return 1 - Math.abs((d / DUR) * 2 - 1);
    }
    return 0;
  };

  /** 0..1 mouth opening for a stylised talk loop: a syllable-like pulse with varied heights. */
  const talkAmount = (stateFrame, fps, seed) => {
    const t = (stateFrame / fps) * 4.2;
    const syl = Math.floor(t);
    const p = t - syl;
    const height = 0.5 + 0.5 * F1.random(`${seed}-syl-${syl}`);
    return Math.sin(Math.PI * p) ** 0.8 * height;
  };

  const Eye = ({ id, cx, cy, rx, ry, pr, look, lid, lidTilt = 0, lidFill, scale = 1 }) => {
    const rX = rx * scale;
    const rY = ry * scale;
    const px = cx + look[0] * rX * 0.42;
    const py = cy + look[1] * rY * 0.42;
    const lidY = cy - rY + lid * 2 * rY;
    return `<g><defs><clipPath id="${id}"><ellipse cx="${cx}" cy="${cy}" rx="${n(rX)}" ry="${n(rY)}"/></clipPath></defs>
<ellipse cx="${cx}" cy="${cy}" rx="${n(rX)}" ry="${n(rY)}" fill="${M.cream}"/>
<g clip-path="url(#${id})">
<circle cx="${n(px)}" cy="${n(py)}" r="${n(pr)}" fill="${M.deep}"/>
<circle cx="${n(px - pr * 0.32)}" cy="${n(py - pr * 0.36)}" r="${n(pr * 0.34)}" fill="${M.cream}"/>
<circle cx="${n(px + pr * 0.38)}" cy="${n(py + pr * 0.42)}" r="${n(pr * 0.14)}" fill="${M.cream}" opacity="0.85"/>
${
  lid > 0.01
    ? `<path d="M ${n(cx - rX - 4)} ${n(cy - rY - 6)} L ${n(cx + rX + 4)} ${n(cy - rY - 6)} L ${n(cx + rX + 4)} ${n(lidY + lidTilt)} L ${n(cx - rX - 4)} ${n(lidY - lidTilt)} Z" fill="${lidFill}"/>
<line x1="${n(cx - rX - 4)}" y1="${n(lidY - lidTilt)}" x2="${n(cx + rX + 4)}" y2="${n(lidY + lidTilt)}" stroke="${INK}" stroke-width="4.5"/>`
    : ""
}</g>
<ellipse cx="${cx}" cy="${cy}" rx="${n(rX)}" ry="${n(rY)}" fill="none" stroke="${INK}" stroke-width="${SW}"/></g>`;
  };

  /** Small curved brow above an eye. `raise` lifts it (px), `tilt` rotates the inner end up/down. */
  const Brow = ({ cx, cy, w, raise = 0, tilt = 0 }) =>
    `<path d="M ${n(cx - w / 2)} ${n(cy - raise + tilt)} Q ${cx} ${n(cy - raise - 9)} ${n(cx + w / 2)} ${n(cy - raise - tilt)}" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`;

  const Cheek = ({ cx, cy, rx = 24, ry = 18 }) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${M.cheek}" opacity="0.62"/>`;

  const Teeth = ({ x, y, teeth, size = 1 }) => {
    if (teeth === "none") return "";
    const tw = 15 * size;
    const th = 17 * size;
    const rect = (rx) => `<rect x="${n(rx)}" y="${n(y)}" width="${tw}" height="${th}" rx="3" fill="${M.cream}" stroke="${INK}" stroke-width="3.5"/>`;
    if (teeth === "one") return rect(x - 3);
    return rect(x - tw - 0.5) + rect(x + 0.5);
  };

  const Mouth = ({ cx, cy, w, kind, amt = 0, teeth, hMax = 40, idKey = "" }) => {
    if (kind === "o") {
      return `<g><ellipse cx="${cx}" cy="${cy + 6}" rx="${n(w * 0.2)}" ry="${n(w * 0.26)}" fill="${M.mouth}" stroke="${INK}" stroke-width="4.5"/><ellipse cx="${cx}" cy="${cy + 14}" rx="${n(w * 0.11)}" ry="${n(w * 0.09)}" fill="${M.tongue}" opacity="0.35"/></g>`;
    }
    if (kind === "smirk") {
      const x0 = cx - w / 2;
      const x1 = cx + w / 2;
      return `<path d="M ${n(x0 + 4)} ${cy + 6} Q ${cx} ${cy + 12} ${n(x1)} ${cy - 7}" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`;
    }
    if (kind === "hmm") {
      const x0 = cx - w * 0.3;
      return `<path d="M ${n(x0)} ${cy + 3} Q ${n(x0 + w * 0.15)} ${cy - 5} ${n(x0 + w * 0.3)} ${cy + 2} T ${n(x0 + w * 0.6)} ${cy + 1}" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`;
    }
    if (kind === "open" && amt > 0.06) {
      const h = 8 + amt * hMax;
      const x0 = cx - w / 2;
      const x1 = cx + w / 2;
      const id = `mclip-${idKey}`;
      const d = `M ${n(x0)} ${cy} Q ${cx} ${cy + 7} ${n(x1)} ${cy} C ${n(x1 - w * 0.06)} ${n(cy + h * 1.15)} ${n(x0 + w * 0.06)} ${n(cy + h * 1.15)} ${n(x0)} ${cy} Z`;
      return `<g><defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><path d="${d}" fill="${M.mouth}"/>
<g clip-path="url(#${id})"><ellipse cx="${cx}" cy="${n(cy + h * 0.95)}" rx="${n(w * 0.26)}" ry="${n(h * 0.42)}" fill="${M.tongue}" opacity="0.55"/></g>
${Teeth({ x: cx, y: cy + 1, teeth })}<path d="${d}" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/></g>`;
    }
    // closed line with teeth hanging under it
    return `<g>${Teeth({ x: cx, y: cy + 1, teeth })}<path d="M ${n(cx - w / 2)} ${cy} Q ${cx} ${cy + 7} ${n(cx + w / 2)} ${cy}" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/></g>`;
  };

  const Arm = ({ from, to, bend, w = 32, fill, finger = true }) => {
    const d = bend ? `M ${n(from[0])} ${n(from[1])} Q ${n(bend[0])} ${n(bend[1])} ${n(to[0])} ${n(to[1])}` : `M ${n(from[0])} ${n(from[1])} L ${n(to[0])} ${n(to[1])}`;
    const dx = to[0] - (bend ? bend[0] : from[0]);
    const dy = to[1] - (bend ? bend[1] : from[1]);
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    return `<g stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="${d}" stroke="${INK}" stroke-width="${w + 2 * SW}"/><path d="${d}" stroke="${fill}" stroke-width="${w}"/>${
      finger
        ? `<path d="M ${n(to[0] + ux * 2 - uy * 7)} ${n(to[1] + uy * 2 + ux * 7)} l ${n(ux * 6)} ${n(uy * 6)} M ${n(to[0] + ux * 2 + uy * 7)} ${n(to[1] + uy * 2 - ux * 7)} l ${n(ux * 6)} ${n(uy * 6)}" stroke="${INK}" stroke-width="3" opacity="0.7"/>`
        : ""
    }</g>`;
  };

  /** Little "!" ticks radiating from the head. */
  const SurpriseTicks = ({ cx, cy, r, stateFrame }) => {
    const appear = clamp01(stateFrame / 5);
    const pulse = 0.82 + 0.18 * Math.sin(stateFrame * 0.9);
    const lines = [-150, -118, -90, -62, -30].map((a, i) => {
      const rad = (a * Math.PI) / 180;
      const inner = r * (i % 2 === 0 ? 1.0 : 1.08);
      const len = (i % 2 === 0 ? 20 : 28) * pulse * appear;
      return `<line x1="${n(cx + Math.cos(rad) * inner)}" y1="${n(cy + Math.sin(rad) * inner)}" x2="${n(cx + Math.cos(rad) * (inner + len))}" y2="${n(cy + Math.sin(rad) * (inner + len))}"/>`;
    });
    return `<g stroke="${INK}" stroke-width="5" stroke-linecap="round" opacity="${n(appear, 3)}">${lines.join("")}</g>`;
  };

  /** Thought trail: three dots growing up toward the top-right, popping in one after another. */
  const ThinkDots = ({ x, y, stateFrame }) => {
    const dots = [
      { dx: 0, dy: 0, r: 6 },
      { dx: 20, dy: -22, r: 9 },
      { dx: 46, dy: -50, r: 13 },
    ];
    const cs = dots.map((d, i) => {
      const s = clamp01((stateFrame - 4 - i * 5) / 6);
      const bob = Math.sin(stateFrame * 0.12 + i * 1.3) * 2.5;
      return `<circle cx="${x + d.dx}" cy="${n(y + d.dy + bob)}" r="${n(d.r * s)}" opacity="${n(s, 3)}"/>`;
    });
    return `<g fill="${M.cream}" stroke="${INK}" stroke-width="4">${cs.join("")}</g>`;
  };

  /** Faint mottled texture: dark specks clipped by the caller's group. */
  const Mottle = ({ spots, fill = INK, opacity = 0.16 }) =>
    `<g fill="${fill}" opacity="${opacity}">${spots.map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${n(r * 0.82)}"/>`).join("")}</g>`;

  const GroundShadow = ({ cx = 200, rx = 150 }) => `<ellipse cx="${cx}" cy="${FEET_Y + 2}" rx="${rx}" ry="13" fill="${INK}" opacity="0.14"/>`;

  /* ================================================================ props.tsx */

  const OUT = "#1A1A1A"; // prop outline: neutral near-black, same weight as the mascot line work
  const PSW = 4;

  /** One ticket, origin at its bottom-centre. 64 x 36 units. */
  const TicketArt = ({ stub = editorial.accent, w = 64, h = 36 } = {}) =>
    `<g stroke-linejoin="round"><rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="5" fill="${objects.paper}" stroke="${OUT}" stroke-width="${PSW}"/>
<path d="M ${-w / 2 + 5} ${-h + 1} h ${n(w * 0.26 - 5)} v ${h - 2} h ${n(-(w * 0.26 - 5))} a4 4 0 0 1 -4 -4 v ${-(h - 10)} a4 4 0 0 1 4 -4 z" fill="${stub}"/>
<path d="M ${n(-w / 2 + w * 0.26)} ${-h + 3} v ${h - 6}" stroke="${OUT}" stroke-width="2" stroke-dasharray="3 3"/>
<g fill="${OUT}" opacity="0.75"><rect x="${n(-w / 2 + w * 0.26 + 7)}" y="${-h + 9}" width="${n(w * 0.42)}" height="4" rx="2"/><rect x="${n(-w / 2 + w * 0.26 + 7)}" y="${-h + 18}" width="${n(w * 0.3)}" height="4" rx="2"/></g></g>`;

  /** A fan of tickets, origin at the hand (pivot at the bottom). */
  const TicketsArt = ({ count = 2 } = {}) => {
    const stubs = [editorial.accent, objects.liveries.sky, objects.liveries.amber];
    const spread = count > 1 ? 26 : 0;
    return `<g>${Array.from({ length: count }, (_, i) => {
      const a = count > 1 ? -spread / 2 + (spread / (count - 1)) * i : 0;
      return `<g transform="translate(0 -4) rotate(${n(a)})"><g transform="translate(0 -6)">${TicketArt({ stub: stubs[i % stubs.length] })}</g></g>`;
    }).join("")}</g>`;
  };

  /** Back of a phone held up to film, origin at the hand (bottom of the phone). */
  const PhoneArt = () =>
    `<g stroke-linejoin="round"><rect x="-24" y="-86" width="48" height="92" rx="9" fill="#23262D" stroke="${OUT}" stroke-width="${PSW}"/><rect x="-17" y="-79" width="22" height="24" rx="7" fill="#15171B"/><circle cx="-10" cy="-72" r="5" fill="#3B4350" stroke="#0A0A0A" stroke-width="1.5"/><circle cx="1" cy="-62" r="4" fill="#3B4350" stroke="#0A0A0A" stroke-width="1.5"/><circle cx="-10" cy="-72" r="1.8" fill="#8FB8E8"/></g>`;

  /** Folded map, origin at its centre. */
  const MapArt = ({ w = 156, h = 108 } = {}) => {
    const x0 = -w / 2;
    const y0 = -h / 2;
    return `<g stroke-linejoin="round" stroke-linecap="round"><rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="6" fill="${objects.paper}" stroke="${OUT}" stroke-width="${PSW}"/>
<path d="M ${x0 + 8} ${y0 + 8} h 46 l 12 18 l -20 22 l -38 -4 z" fill="${objects.liveries.sky}" opacity="0.5"/>
<path d="M ${n(x0 + w * 0.55)} ${y0 + 10} l 40 10 l 8 30 l -30 20 l -22 -18 z" fill="${objects.liveries.mint}" opacity="0.5"/>
<path d="M ${x0 + 24} ${y0 + h - 22} Q ${x0 + 60} ${y0 + 40} ${n(x0 + w * 0.62)} ${n(y0 + h * 0.5)} T ${x0 + w - 22} ${y0 + 24}" fill="none" stroke="${editorial.accent}" stroke-width="4" stroke-dasharray="1 9"/>
<path d="M ${n(x0 + w / 3)} ${y0 + 2} v ${h - 4} M ${n(x0 + (w * 2) / 3)} ${y0 + 2} v ${h - 4}" stroke="${OUT}" stroke-width="2" opacity="0.35"/>
<circle cx="${x0 + w - 24}" cy="${y0 + 24}" r="7" fill="${editorial.accent}" stroke="${OUT}" stroke-width="3"/></g>`;
  };

  const TILE_SKIN = [objects.skins[0], objects.skins[2], objects.skins[4], objects.skins[1], objects.skins[3], objects.skins[2]];
  const TILE_HELMET = [objects.liveries.red, objects.liveries.sky, objects.liveries.amber, objects.liveries.mint, objects.liveries.lilac, objects.liveries.pink];

  /** One driver "portrait" tile (abstract bust: helmet, face, shoulders), origin at its top-left. */
  const DriverTile = ({ w, h, i, highlight = 0 }) => {
    const cx = w / 2;
    return `<g><rect width="${n(w)}" height="${n(h)}" rx="4" fill="${editorial.panel}"/>
<path d="M ${n(w * 0.12)} ${n(h)} Q ${n(w * 0.14)} ${n(h * 0.68)} ${n(cx)} ${n(h * 0.66)} Q ${n(w * 0.86)} ${n(h * 0.68)} ${n(w * 0.88)} ${n(h)} Z" fill="${TILE_HELMET[i % 6]}"/>
<circle cx="${n(cx)}" cy="${n(h * 0.4)}" r="${n(w * 0.2)}" fill="${TILE_SKIN[i % 6]}"/>
<path d="M ${n(cx - w * 0.22)} ${n(h * 0.38)} a ${n(w * 0.22)} ${n(w * 0.22)} 0 0 1 ${n(w * 0.44)} 0 q ${n(-w * 0.22)} ${n(-h * 0.06)} ${n(-w * 0.44)} 0 z" fill="${TILE_HELMET[(i + 2) % 6]}"/>
${highlight > 0 ? `<rect x="1.5" y="1.5" width="${n(w - 3)}" height="${n(h - 3)}" rx="4" fill="none" stroke="${editorial.accent}" stroke-width="4" opacity="${n(highlight, 3)}"/>` : ""}</g>`;
  };

  /** Framed story board of driver portraits, origin at its centre. `highlight` = tile index to ring (or -1). */
  const BoardArt = ({ w = 156, h = 116, cols = 3, rows = 2, highlight = -1, highlightAmount = 1 } = {}) => {
    const pad = Math.max(8, w * 0.07);
    const gap = Math.max(4, w * 0.03);
    const tw = (w - pad * 2 - gap * (cols - 1)) / cols;
    const th = (h - pad * 2 - gap * (rows - 1)) / rows;
    const tiles = Array.from(
      { length: cols * rows },
      (_, i) => `<g transform="translate(${n((i % cols) * (tw + gap))} ${n(Math.floor(i / cols) * (th + gap))})">${DriverTile({ w: tw, h: th, i, highlight: i === highlight ? highlightAmount : 0 })}</g>`,
    ).join("");
    return `<g stroke-linejoin="round"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="6" fill="${objects.wood}" stroke="${OUT}" stroke-width="${PSW}"/>
<rect x="${n(-w / 2 + pad / 2)}" y="${n(-h / 2 + pad / 2)}" width="${n(w - pad)}" height="${n(h - pad)}" rx="3" fill="${editorial.white}"/>
<g transform="translate(${n(-w / 2 + pad)} ${n(-h / 2 + pad)})">${tiles}</g></g>`;
  };

  /* ================================================================ Figure.tsx */

  const lerp2 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

  /** Big held props (map, story board) sit with the hands at `from.y + HOLD_DY`. */
  const HOLD_DY = 46;
  const BIG_W = { map: 156, storyboard: 150 };

  /** Settled hand target for one arm in a pose (the caller blends between poses). */
  const handFor = (spec, side, pose, o) => {
    const arm = side === "L" ? spec.armL : spec.armR;
    const sg = side === "L" ? -1 : 1;
    const len = Math.hypot(arm.hang[0] - arm.from[0], arm.hang[1] - arm.from[1]);
    const [fx, fy] = arm.from;
    const f = o.poseFrame;
    const hang = [arm.hang[0] - sg * o.wob * 1.5, arm.hang[1]];
    const rest = { to: hang, bend: mid(arm.from, hang) };
    const at = (to, bend) => ({ to, bend: bend || mid(arm.from, to) });
    const big = o.prop === "map" || o.prop === "storyboard";
    const bigW = o.prop === "map" ? BIG_W.map : BIG_W.storyboard;

    if (pose === "hold" && o.prop !== "none") {
      if (big) {
        const cxm = (spec.armL.from[0] + spec.armR.from[0]) / 2;
        return at([cxm + sg * (bigW / 2 - 6), fy + HOLD_DY], [fx - sg * 6, fy + 34]);
      }
      if (side === "R") {
        if (o.prop === "tickets") return at([fx - 14, fy - 62], [fx + 34, fy - 22]);
        return at([fx - 8, spec.head.cy + 6], [fx + 42, fy - 34]); // phone, raised to film
      }
      return rest;
    }
    switch (pose) {
      case "listen":
        return at([hang[0] - sg * 16, hang[1] - 14]);
      case "point": {
        const rad = (o.angle * Math.PI) / 180;
        const active = Math.abs(Math.cos(rad)) < 0.2 ? "R" : Math.cos(rad) < 0 ? "L" : "R";
        if (side !== active) return rest;
        const r = len * 1.38;
        const w = Math.sin(f * 0.25) * 2.5;
        return at([fx + Math.cos(rad) * r + w * Math.sin(rad), fy + Math.sin(rad) * r - w * Math.cos(rad)]);
      }
      case "wave":
        if (side !== "R") return rest;
        return at([fx + sg * 10 + Math.sin(f * 0.42) * 22, fy - len * 1.32], [fx + sg * 44, fy - len * 0.5]);
      case "cheer": {
        const ph = side === "L" ? 1.5 : 0;
        return at([fx + sg * 34 + Math.sin(f * 0.3 + ph) * 5, fy - len * 1.4 + Math.cos(f * 0.3 + ph) * 5], [fx + sg * 38, fy - len * 0.55]);
      }
      case "startle":
        return at([fx + sg * 40, fy - 62 + Math.sin(f * 1.3) * Math.max(0, 1 - f / 25) * 4]);
      case "think":
        if (side !== "R") return rest;
        return at([spec.mouth.cx + spec.mouth.w * 0.55, spec.mouth.cy + 38], [fx + 6, fy + 62]);
      case "shrug": {
        const lift = 8 * Math.sin(Math.PI * clamp01(f / 16));
        return at([fx + sg * len * 1.05, fy - len * 0.1 - lift], [fx + sg * len * 0.5, fy + len * 0.5]);
      }
      case "peek": {
        const active = o.turn < 0 ? "L" : "R";
        if (side !== active) return rest;
        return at([spec.head.cx + sg * spec.head.r * 0.78, spec.head.cy + 6], [fx + sg * 50, fy - 20]);
      }
      default:
        if (o.talking && side === "R") return at([hang[0] + 10, hang[1] - 26 + Math.sin(o.talkFrame * 0.26) * 7]); // small speaking hand
        return rest;
    }
  };

  const Figure = (spec, p) => {
    const { frame, fps, seed = "", pose, poseFrame, prevPose, blend, pointAngle, expr, exprFrame, talking, talkFrame, look, turn, prop } = p;
    const uid = F1.uid();
    const t = frame / fps;
    const sway = Math.sin(t * Math.PI * 2 * 0.55);
    const surprised = expr === "surprised" || pose === "startle";
    const jiggle = talking ? Math.sin(talkFrame * 0.55) * 0.5 : surprised ? Math.sin(exprFrame * 1.3) * Math.max(0, 1 - exprFrame / 25) : 0;
    const ctx = { sway, jiggle };
    const thinking = pose === "think";
    const confused = expr === "confused" || (thinking && expr === "neutral");

    /* eyes */
    const blink = blinkAmount(frame, spec.id + seed);
    const baseLid = surprised ? 0 : expr === "smug" ? Math.max(spec.lid, 0.42) : confused ? spec.lid * 0.35 : spec.lid;
    const lid = baseLid + (1 - baseLid) * blink;
    const eyeScale = surprised ? 1.1 : 1;
    const drift = [Math.sin(t * 0.9) * 0.1, Math.cos(t * 0.7) * 0.06];
    const rad = (pointAngle * Math.PI) / 180;
    const eyeLook = (i) => {
      if (look) return look;
      if (pose === "point") return [Math.cos(rad) * 0.9, Math.sin(rad) * 0.5];
      if (thinking) return [-0.4 - 0.1 * i, -0.95];
      if (surprised) return [0.05, -0.02];
      if (confused) return [0.35, -0.6];
      return [spec.idleLook[i][0] + drift[0], spec.idleLook[i][1] + drift[1]];
    };
    const pScale = surprised ? 0.72 : 1;

    /* mouth */
    const m = spec.mouth;
    const baseOpen = m.baseOpen ?? 0;
    let kind = baseOpen > 0 ? "open" : "line";
    let amt = baseOpen;
    if (talking) {
      kind = "open";
      amt = Math.max(baseOpen * 0.35, talkAmount(talkFrame, fps, spec.id + seed));
    } else if (surprised) kind = "o";
    else if (confused) kind = "hmm";
    else if (expr === "smug") kind = "smirk";
    else if (expr === "happy") {
      kind = "open";
      amt = Math.max(baseOpen, 0.34);
    }

    /* brows */
    const browRaise = (i) => {
      if (surprised) return 14 + Math.max(0, 6 - exprFrame);
      if (confused) return i === 1 ? 11 : -1;
      if (expr === "smug") return i === 1 ? 7 : -3;
      if (expr === "happy") return 4;
      if (pose === "listen") return 3;
      return 0;
    };
    const browTilt = (i) => (confused && i === 0 ? 3 : expr === "smug" && i === 0 ? 2 : 0);

    /* arms: blend from the previous pose to the current one */
    const wob = Math.sin(t * Math.PI * 2 * 0.6);
    const base = { angle: pointAngle, turn, prop, talking, talkFrame, wob };
    const cur = (side) => handFor(spec, side, pose, { ...base, poseFrame });
    const old = (side) => (prevPose ? handFor(spec, side, prevPose, { ...base, poseFrame: 30 }) : cur(side));
    const hand = (side) => {
      const a = old(side);
      const b = cur(side);
      return { to: lerp2(a.to, b.to, blend), bend: lerp2(a.bend, b.bend, blend) };
    };
    const L = hand("L");
    const R = hand("R");

    /* face turn (fakes a head turn by sliding and narrowing the face group) */
    const cx = spec.head.cx;
    const faceT = `translate(${n(turn * 13)} 0) translate(${cx} 0) scale(${n(1 - 0.06 * Math.abs(turn), 4)} 1) translate(${-cx} 0)`;

    const holding = pose === "hold" && prop !== "none";
    const bigProp = holding && (prop === "map" || prop === "storyboard");
    const smallHeld = prop === "tickets" || prop === "phone"; // small props follow the right hand in any pose
    const cxm = (spec.armL.from[0] + spec.armR.from[0]) / 2;
    const holdY = spec.armR.from[1] + HOLD_DY;

    return `<svg viewBox="${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}" width="100%" height="100%" style="display:block;overflow:visible">
${GroundShadow({ rx: spec.shadowRx })}${spec.back(ctx)}${spec.body}
<g transform="${faceT}">
${spec.cheeks.map(Cheek).join("")}
${Eye({ id: `${spec.id}-eL${uid}`, ...spec.eyeL, pr: spec.eyeL.pr * pScale, look: eyeLook(0), lid, lidTilt: spec.lidTilt, lidFill: spec.lidFill, scale: eyeScale })}
${Eye({ id: `${spec.id}-eR${uid}`, ...spec.eyeR, pr: spec.eyeR.pr * pScale, look: eyeLook(1), lid, lidTilt: -(spec.lidTilt ?? 0), lidFill: spec.lidFill, scale: eyeScale })}
${(spec.brows || []).map((b, i) => Brow({ ...b, raise: browRaise(i), tilt: browTilt(i) })).join("")}
${Mouth({ cx: m.cx, cy: m.cy, w: m.w, kind, amt, teeth: m.teeth, hMax: m.hMax, idKey: `${spec.id}${uid}` })}
</g>
${bigProp ? `<g transform="translate(${cxm} ${holdY - 8})">${prop === "map" ? MapArt({ w: BIG_W.map }) : BoardArt({ w: BIG_W.storyboard, h: 112 })}</g>` : ""}
${Arm({ from: spec.armL.from, to: L.to, bend: L.bend, w: spec.armW, fill: spec.armFill })}
${Arm({ from: spec.armR.from, to: R.to, bend: R.bend, w: spec.armW, fill: spec.armFill })}
${smallHeld ? `<g transform="translate(${n(R.to[0])} ${n(R.to[1] + 6)})">${prop === "tickets" ? TicketsArt() : PhoneArt()}</g>` : ""}
${spec.front ? spec.front(ctx) : ""}
${surprised ? SurpriseTicks({ cx: spec.head.cx, cy: spec.head.cy, r: spec.head.r, stateFrame: exprFrame }) : ""}
${thinking ? ThinkDots({ x: spec.dots.x, y: spec.dots.y, stateFrame: poseFrame }) : ""}
</svg>`;
  };

  /* ================================================================ Mog.tsx, Wec.tsx, Bog.tsx */

  const bodyBlock = (id, path, fill, mottles) =>
    `<g><defs><clipPath id="${id}-body"><path d="${path}"/></clipPath></defs><path d="${path}" fill="${fill}"/><g clip-path="url(#${id}-body)">${mottles}</g>`;

  const MOG_BODY = "M200 112 C292 112 350 175 354 262 C358 348 350 408 308 438 C270 464 130 464 92 438 C50 408 42 348 46 262 C50 175 108 112 200 112Z";
  const MOG = {
    id: "mog",
    lidFill: M.mog,
    armFill: M.mog,
    armW: 34,
    eyeL: { cx: 146, cy: 218, rx: 42, ry: 38, pr: 24 },
    eyeR: { cx: 258, cy: 224, rx: 37, ry: 34, pr: 21 },
    idleLook: [
      [0.35, 0.5],
      [0.1, 0.5],
    ],
    lid: 0.36,
    lidTilt: 3,
    brows: [
      { cx: 144, cy: 164, w: 36 },
      { cx: 264, cy: 174, w: 32 },
    ],
    cheeks: [
      { cx: 98, cy: 284, rx: 28, ry: 21 },
      { cx: 308, cy: 290, rx: 28, ry: 21 },
    ],
    mouth: { cx: 203, cy: 288, w: 58, teeth: "two", hMax: 38 },
    armL: { from: [66, 316], hang: [56, 384] },
    armR: { from: [334, 316], hang: [344, 384] },
    head: { cx: 200, cy: 215, r: 150 },
    dots: { x: 318, y: 120 },
    shadowRx: 150,
    back: ({ sway }) => `<g>
<g fill="${M.mog}" stroke="${INK}" stroke-width="${SW}"><ellipse cx="126" cy="448" rx="46" ry="16"/><ellipse cx="274" cy="448" rx="46" ry="16"/></g>
<g stroke="${INK}" stroke-width="3.5" stroke-linecap="round" opacity="0.8"><path d="M118 456 v-9 M133 457 v-9 M148 455 v-8 M252 455 v-8 M267 457 v-9 M282 456 v-9"/></g>
<g fill="${M.mog}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round" transform="translate(0 20) rotate(${n(sway * 3, 3)} 200 96)">
<path d="M197 100 C170 90 160 76 156 60 C180 62 196 78 202 100Z"/><path d="M203 100 C230 88 240 72 246 58 C222 62 206 78 199 100Z"/><path d="M193 100 C184 72 190 50 202 38 C214 52 216 76 207 100Z"/></g></g>`,
    body: `${bodyBlock(
      "mog",
      MOG_BODY,
      M.mog,
      Mottle({ spots: [[100, 200, 7], [92, 310, 5], [300, 165, 6], [312, 350, 7], [150, 125, 5], [255, 118, 4], [80, 400, 6]], opacity: 0.2 }) +
        Mottle({ spots: [[250, 330, 5], [320, 215, 4], [130, 340, 4]], fill: M.cream, opacity: 0.12 }),
    )}<ellipse cx="200" cy="392" rx="70" ry="52" fill="${M.sage}" stroke="${INK}" stroke-width="4"/><path d="${MOG_BODY}" fill="none" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/></g>`,
  };

  const WEC_BODY = "M200 100 C258 100 292 154 295 228 C298 290 308 350 298 405 C290 445 248 458 200 458 C152 458 110 445 102 405 C92 350 102 290 105 228 C108 154 142 100 200 100Z";
  const WEC = {
    id: "wec",
    lidFill: M.cream,
    armFill: M.cream,
    armW: 30,
    eyeL: { cx: 155, cy: 205, rx: 38, ry: 36, pr: 21 },
    eyeR: { cx: 250, cy: 222, rx: 33, ry: 32, pr: 19 },
    idleLook: [
      [0.55, -0.35],
      [0.5, -0.3],
    ],
    lid: 0,
    cheeks: [
      { cx: 124, cy: 262, rx: 22, ry: 17 },
      { cx: 280, cy: 272, rx: 22, ry: 17 },
    ],
    mouth: { cx: 214, cy: 288, w: 76, teeth: "one", hMax: 34, baseOpen: 0.5 },
    armL: { from: [108, 322], hang: [104, 386] },
    armR: { from: [292, 322], hang: [296, 386] },
    head: { cx: 200, cy: 200, r: 130 },
    dots: { x: 318, y: 112 },
    shadowRx: 135,
    back: ({ sway, jiggle }) => `<g>
<g transform="rotate(${n(sway * 2.5 + jiggle * 2, 3)} 262 140)"><path d="M252 128 C300 116 338 162 348 232 C356 292 350 338 324 342 C300 345 296 296 290 250 C286 214 270 180 250 168Z" fill="${M.mog}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/></g>
<g transform="rotate(${n(-sway * 3 - jiggle * 3, 3)} 140 150)"><path d="M158 142 C122 92 78 50 36 44 C6 40 -6 74 20 98 C46 120 86 128 118 166 Z" fill="${M.mog}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/></g>
<g fill="${M.cream}" stroke="${INK}" stroke-width="${SW}"><ellipse cx="148" cy="450" rx="44" ry="14"/><ellipse cx="254" cy="450" rx="44" ry="14"/></g>
<g stroke="${INK}" stroke-width="3.5" stroke-linecap="round" opacity="0.8"><path d="M136 458 v-8 M152 458 v-8 M242 458 v-8 M258 458 v-8"/></g></g>`,
    body: `${bodyBlock("wec", WEC_BODY, M.cream, Mottle({ spots: [[128, 330, 8], [140, 395, 6], [278, 360, 7], [250, 420, 5], [270, 160, 5], [140, 150, 4]], fill: M.sage, opacity: 0.9 }))}<path d="${WEC_BODY}" fill="none" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/></g>`,
    front: ({ sway }) =>
      `<g fill="${M.cream}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round" transform="rotate(${n(sway * 4, 3)} 214 104)"><path d="M212 104 C204 92 206 82 212 74 C220 82 220 94 216 104Z"/><path d="M208 106 C196 100 190 92 190 84 C202 86 210 94 212 106Z"/><path d="M216 106 C228 100 236 92 238 84 C226 84 218 94 214 106Z"/></g>`,
  };

  const BOG_BODY =
    "M130 152 C170 144 235 144 275 152 C330 162 350 202 350 262 L350 340 C350 380 335 400 300 402 L105 402 C70 400 55 380 55 340 L55 262 C55 202 75 162 130 152Z";
  const BOG = {
    id: "bog",
    lidFill: M.sageDeep,
    armFill: M.sageDeep,
    armW: 32,
    eyeL: { cx: 150, cy: 252, rx: 45, ry: 44, pr: 25 },
    eyeR: { cx: 274, cy: 262, rx: 29, ry: 28, pr: 16 },
    idleLook: [
      [-0.3, -0.3],
      [0.35, -0.25],
    ],
    lid: 0,
    brows: [
      { cx: 148, cy: 196, w: 30 },
      { cx: 276, cy: 216, w: 24 },
    ],
    cheeks: [
      { cx: 100, cy: 306, rx: 24, ry: 18 },
      { cx: 326, cy: 314, rx: 24, ry: 18 },
    ],
    mouth: { cx: 210, cy: 320, w: 112, teeth: "two", hMax: 36 },
    armL: { from: [64, 296], hang: [56, 372] },
    armR: { from: [342, 296], hang: [350, 372] },
    head: { cx: 200, cy: 250, r: 150 },
    dots: { x: 322, y: 118 },
    shadowRx: 150,
    back: ({ sway }) => `<g>
<g fill="${M.green}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"><path d="M104 392 L106 446 C106 456 118 462 134 462 C152 462 160 456 158 446 L156 392Z"/><path d="M250 392 L248 446 C246 456 254 462 272 462 C288 462 300 456 300 446 L302 392Z"/></g>
<g fill="${M.green}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round" transform="rotate(${n(sway * 2.5, 3)} 205 150)"><path d="M160 156 C140 138 148 112 172 114 C170 92 214 84 224 110 C248 104 262 130 244 156Z"/></g>
<path d="M206 112 C204 126 206 138 210 146 M180 128 C186 134 190 140 192 146 M232 126 C228 134 226 140 226 146" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" opacity="0.55"/></g>`,
    body: `${bodyBlock(
      "bog",
      BOG_BODY,
      M.sageDeep,
      Mottle({ spots: [[90, 205, 7], [320, 190, 6], [330, 365, 7], [80, 380, 6], [215, 380, 5], [250, 180, 4]], opacity: 0.14 }) +
        Mottle({ spots: [[130, 170, 7], [300, 330, 5]], fill: M.cream, opacity: 0.3 }),
    )}<path d="${BOG_BODY}" fill="none" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/></g>`,
  };

  const FIGURES = { mog: MOG, wec: WEC, bog: BOG };

  /* ================================================================ Mascot.tsx */

  F1.MASCOT_W = 260; // width at scale 1 (px)
  const HEIGHT_RATIO = VIEW.h / VIEW.w;
  const FEET_FRAC = 462 / VIEW.h; // feet sit at 96% of the figure box
  F1.STAGE = { width: 1920, height: 1080, left: 96, right: 1824, top: 110, bottom: 830, feetY: 830, captionTop: 860, captionBottom: 1040 };

  const DIR = { right: 0, left: 180, up: -90, down: 90, "up-right": -35, "up-left": -145, "down-right": 35, "down-left": 145 };
  const dirAngle = (d) => (typeof d === "number" ? d : DIR[d]);
  const turnOf = (fc) => (fc === "left" ? -1 : fc === "right" ? 1 : 0);
  const TILT_POSE = { think: -3, listen: 2, peek: 5 };
  const TILT_EXPR = { confused: -3, smug: 2 };
  const easeOutC = (t) => 1 - (1 - clamp01(t)) ** 3;
  const quadOut = F1.Easing.out(F1.Easing.quad);
  const quadIn = F1.Easing.in(F1.Easing.quad);

  F1.Mascot = (props, frame) => {
    const {
      character,
      x: xIn,
      y = F1.STAGE.feetY,
      scale = 1,
      facing = "front",
      look = "auto",
      talking = false,
      gesture = "idle",
      pointDir,
      prop = "none",
      expression = "neutral",
      at = 0,
      enter,
      enterFrames,
      exitAt,
      exit = "fade",
      exitFrames,
      seed = "",
      zIndex,
    } = props;
    const fps = F1.FPS;
    const width = 1920;
    const x = xIn ?? width / 2;
    const w = F1.MASCOT_W * scale;
    const h = w * HEIGHT_RATIO;
    const enterKind = enter ?? (at > 0 ? "pop" : "none");
    const inFrames = enterFrames ?? (enterKind.startsWith("walk") ? 40 : enterKind === "pop" ? 14 : 12);
    const outFrames = exitFrames ?? (exit.startsWith("walk") ? 36 : 10);

    if (frame < at) return "<!--mascot-->";
    if (exitAt !== undefined && frame >= exitAt + outFrames) return "<!--mascot-->";

    /* entrance / exit */
    const f0 = frame - at;
    const pIn = enterKind === "none" ? 1 : clamp01(f0 / inFrames);
    const qOut = exitAt === undefined ? 0 : clamp01((frame - exitAt) / outFrames);
    const walkIn = enterKind.startsWith("walk") && pIn < 1;
    const walkOut = exit.startsWith("walk") && qOut > 0 && qOut < 1;
    const edge = w / 2 + 70;
    let offX = 0;
    let hop = 0;
    let walkTurn = null;
    let walkLean = 0;
    if (walkIn) {
      const from = enterKind === "walk-left" ? -edge : width + edge;
      offX = (from - x) * (1 - quadOut(pIn));
      hop = -Math.abs(Math.sin(f0 * 0.5)) * 8 * scale * Math.min(1, (1 - pIn) * 5);
      walkTurn = enterKind === "walk-left" ? 1 : -1;
      walkLean = walkTurn * 3 * Math.min(1, (1 - pIn) * 5);
    }
    if (walkOut) {
      const to = exit === "walk-left" ? -edge : width + edge;
      offX = (to - x) * quadIn(qOut);
      hop = -Math.abs(Math.sin((frame - (exitAt ?? 0)) * 0.5)) * 8 * scale;
      walkTurn = exit === "walk-left" ? -1 : 1;
      walkLean = walkTurn * 3;
    }
    const popS = enterKind === "pop" ? F1.spring({ frame: f0, fps, config: { damping: 12, stiffness: 180, mass: 0.7 } }) : 1;
    const exitPop = exit === "pop" && exitAt !== undefined ? F1.interpolate(qOut, [0, 1], [1, 0.6]) : 1;
    const fadeIn = enterKind === "fade" ? pIn : enterKind === "pop" ? clamp01(f0 / 4) : 1;
    const fadeOut = exit === "fade" || exit === "pop" ? 1 - qOut : 1;
    const opacity = fadeIn * fadeOut;
    const appear = enterKind === "pop" ? lerp(0.35, 1, popS) : 1;

    /* facing -> turn (smooth), look -> pupil vector */
    const fs = F1.sample(facing, frame);
    const turnCur = turnOf(fs.value);
    const turnPrev = fs.prev === undefined ? turnCur : turnOf(fs.prev);
    const facingTurn = lerp(turnPrev, turnCur, easeOutC(fs.since / 10));
    const walkW = walkTurn === null ? 0 : walkIn ? clamp01((1 - pIn) * 6) : 1;
    const turn = lerp(facingTurn, walkTurn ?? 0, walkW);

    const bodyMidY = y - h * 0.55;
    const lookVec = (l) => {
      if (typeof l === "object" && l !== null) return [Math.max(-1, Math.min(1, (l.x - x) / 300)), Math.max(-0.8, Math.min(0.8, (l.y - bodyMidY) / 260))];
      switch (l) {
        case "left":
          return [-0.9, 0.1];
        case "right":
          return [0.9, 0.1];
        case "up":
          return [0, -0.8];
        case "down":
          return [0, 0.7];
        case "front":
        case "viewer":
          return [0, 0.05];
        default:
          return turnCur === 0 ? null : [turnCur * 0.9, 0.1];
      }
    };
    const ls = F1.sample(look, frame);
    const lc = lookVec(ls.value);
    const lp = ls.prev === undefined ? lc : lookVec(ls.prev);
    const lb = easeOutC(ls.since / 6);
    const IDLE = [0.3, 0.15];
    const lookOut = lc === null && lp === null ? null : [lerp((lp || IDLE)[0], (lc || IDLE)[0], lb), lerp((lp || IDLE)[1], (lc || IDLE)[1], lb)];

    /* expression */
    const es = F1.sample(expression, frame);

    /* effective pose from gesture + prop, with the last change and the pose it came from */
    const propAt = (fr) => F1.sample(prop, fr).value;
    const effective = (fr) => {
      const g = F1.sample(gesture, fr).value;
      const spec = typeof g === "string" ? { gesture: g, dir: undefined } : g;
      const pr = propAt(fr);
      const pose = spec.gesture === "idle" && pr !== "none" ? "hold" : spec.gesture;
      const faceDir = turnOf(F1.sample(facing, fr).value);
      const dir = spec.dir ?? pointDir ?? (faceDir < 0 ? "left" : "right");
      const angle = pose === "point" ? dirAngle(dir) : 0;
      return { pose, angle, key: `${pose}|${pose === "point" ? angle : ""}|${pose === "hold" ? pr : ""}` };
    };
    const cur = effective(frame);
    const marks = [...F1.stepFrames(gesture), ...F1.stepFrames(prop)].filter((mk) => mk <= frame).sort((a, b) => b - a);
    let changeAt = -1;
    let prevPose;
    for (const mk of marks) {
      const before = effective(mk - 1);
      if (before.key !== effective(mk).key) {
        changeAt = mk;
        prevPose = before.pose;
        break;
      }
    }
    const poseFrame = changeAt >= 0 ? frame - changeAt : Math.max(0, frame - (marks.length ? Math.min(...marks) : 0));
    const blend = changeAt >= 0 ? easeOutC(poseFrame / 8) : 1;

    /* talking */
    const tf = F1.talkFrameAt(talking, frame, at);
    const isTalking = tf >= 0;

    /* body motion: breathing only, plus the lean of peek / tilt of listen, think, confused, smug */
    const breath = Math.sin((frame / fps) * Math.PI * 2 * 0.62);
    const bScaleY = 1 + breath * 0.012;
    const bScaleX = 1 - breath * 0.006;
    const poseTilt = lerp(prevPose ? TILT_POSE[prevPose] ?? 0 : TILT_POSE[cur.pose] ?? 0, TILT_POSE[cur.pose] ?? 0, blend);
    const sgn = turn < 0 ? -1 : 1;
    const tilt = poseTilt * (cur.pose === "peek" || prevPose === "peek" ? sgn : 1) + (TILT_EXPR[es.value] ?? 0) * easeOutC(es.since / 8) + walkLean;
    const lean = cur.pose === "peek" ? 10 * sgn * scale * blend : 0;

    const style = F1.css({
      position: "absolute",
      left: n(x - w / 2),
      top: n(y - h * FEET_FRAC),
      width: n(w),
      height: n(h),
      opacity: n(opacity, 3),
      zIndex,
      pointerEvents: "none",
      filter: `drop-shadow(0 4px 5px ${editorial.ink}40)`,
      transformOrigin: `50% ${n(FEET_FRAC * 100)}%`,
      transform: `translate(${n(offX + lean)}px, ${n(hop)}px) rotate(${n(tilt, 3)}deg) scale(${n(appear * exitPop * bScaleX, 4)}, ${n(appear * exitPop * bScaleY, 4)})`,
    });
    return `<div style="${style}">${Figure(FIGURES[character], {
      frame,
      fps,
      seed,
      pose: cur.pose,
      poseFrame,
      prevPose,
      blend,
      pointAngle: cur.angle,
      expr: es.value,
      exprFrame: es.since,
      talking: isTalking,
      talkFrame: Math.max(0, tf),
      look: lookOut,
      turn,
      prop: propAt(frame),
    })}</div>`;
  };

  /* ================================================================ sets.tsx */

  const cubicOut = F1.Easing.out(F1.Easing.cubic);
  const cubicInOut = F1.Easing.inOut(F1.Easing.cubic);

  /** Shared entrance/exit wrapper for set pieces: returns a placeholder outside the piece's lifetime. */
  const Piece = ({ x, y, w, h, originY = 1, scale, at = 0, exitAt, exitFrames = 10, enter = "fade", enterFrames }, f, inner) => {
    if (f < at || (exitAt !== undefined && f >= exitAt + exitFrames)) return "<!--piece-->";
    const ef = enterFrames ?? (enter.startsWith("slide") ? 28 : enter === "pop" ? 14 : 12);
    const p = enter === "none" ? 1 : clamp01((f - at) / ef);
    const out = exitAt === undefined ? 1 : 1 - F1.ramp(f, exitAt, exitFrames);
    let dx = 0;
    let s = 1;
    if (enter === "slide-left" || enter === "slide-right") {
      const from = enter === "slide-left" ? -(w * scale) / 2 - 100 : 1920 + (w * scale) / 2 + 100;
      dx = (from - x) * (1 - cubicOut(p));
    }
    if (enter === "pop") s = 0.4 + 0.6 * F1.spring({ frame: f - at, config: { damping: 13, stiffness: 170, mass: 0.7 } });
    const style = F1.css({
      position: "absolute",
      left: n(x - (w * scale) / 2),
      top: n(y - h * scale * originY),
      width: n(w * scale),
      height: n(h * scale),
      opacity: n((enter === "none" || enter.startsWith("slide") ? 1 : Math.min(1, p * 2.5)) * out, 3),
      transform: `translateX(${n(dx)}px) scale(${n(s, 4)})`,
      transformOrigin: `50% ${n(originY * 100)}%`,
      pointerEvents: "none",
    });
    return `<div style="${style}">${inner}</div>`;
  };

  const DOOR = { w: 300, h: 560 };
  const OPENING = { x: 40, y: 70, w: 220, h: 440 };
  const FLOOR = 520;

  /** Tall velvet door with brass posts and a rope; swings open at `openAt`, light spills out. `inner` = HTML inside the doorway. */
  F1.VelvetDoor = ({ x, y, scale = 1, openAt, openFrames = 26, rope = true, inner, ...timing }, f) => {
    const o = openAt === undefined ? 0 : cubicInOut(F1.ramp(f, openAt, openFrames, (t) => t));
    const sx = Math.cos(o * 1.38); // leaf foreshortens as it swings
    const skew = -o * 7;
    const { x: ox, y: oy, w: ow, h: oh } = OPENING;
    const light = o;
    const lg = F1.uid();
    const post = (px) => `<g><ellipse cx="${px}" cy="${FLOOR}" rx="26" ry="7" fill="#1A1A1A" opacity="0.18"/>
<path d="M ${px - 22} ${FLOOR} q 0 -10 22 -10 q 22 0 22 10 z" fill="${objects.brass}" stroke="#1A1A1A" stroke-width="4" stroke-linejoin="round"/>
<rect x="${px - 6}" y="${FLOOR - 190}" width="12" height="180" fill="${objects.brass}" stroke="#1A1A1A" stroke-width="4"/>
<circle cx="${px}" cy="${FLOOR - 198}" r="13" fill="${objects.brass}" stroke="#1A1A1A" stroke-width="4"/></g>`;
    const pL = 10;
    const pR = DOOR.w - 10;
    const ropeSag = 34 + o * 150;
    const ropeY = FLOOR - 190;
    const svgStyle = "position:absolute;inset:0;overflow:visible";
    const studs = [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => `<circle cx="${ox + 60 + c * 50}" cy="${oy + 220 + r * 55}" r="4.5" fill="#000" opacity="0.28"/>`)).join("");
    const html = `<svg viewBox="0 0 ${DOOR.w} ${DOOR.h}" width="100%" height="100%" style="${svgStyle}">
<rect x="${ox - 16}" y="${oy - 16}" width="${ow + 32}" height="${oh + 32}" rx="8" fill="${objects.wood}" stroke="#1A1A1A" stroke-width="5"/>
<rect x="${ox}" y="${oy}" width="${ow}" height="${oh}" fill="#2A1520"/>
<defs><linearGradient id="vd-${lg}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6DC"/><stop offset="1" stop-color="#FFD98A"/></linearGradient></defs>
<rect x="${ox}" y="${oy}" width="${ow}" height="${oh}" fill="url(#vd-${lg})" opacity="${n(light, 3)}"/>
<path d="M ${ox} ${oy + oh} L ${ox + ow} ${oy + oh} L ${ox + ow + 70} ${FLOOR + 20} L ${ox - 70} ${FLOOR + 20} Z" fill="#FFE9A8" opacity="${n(0.55 * light, 3)}"/></svg>
${inner ? `<div style="position:absolute;left:${ox}px;top:${oy}px;width:${ow}px;height:${oh}px;overflow:hidden;opacity:${n(light, 3)}">${inner}</div>` : "<!--door-inner-->"}
<svg viewBox="0 0 ${DOOR.w} ${DOOR.h}" width="100%" height="100%" style="${svgStyle}">
<g transform="translate(${ox} 0) skewY(${n(skew, 3)}) scale(${n(sx, 4)} 1) translate(${-ox} 0)">
<rect x="${ox}" y="${oy}" width="${ow}" height="${oh}" fill="${objects.velvet}" stroke="#1A1A1A" stroke-width="5"/>
<g fill="none" stroke="#000" stroke-opacity="0.28" stroke-width="3"><rect x="${ox + 22}" y="${oy + 28}" width="${ow - 44}" height="150" rx="4"/><rect x="${ox + 22}" y="${oy + 200}" width="${ow - 44}" height="200" rx="4"/></g>
${studs}
<rect x="${ox + ow - 52}" y="${oy + 205}" width="28" height="50" rx="14" fill="${objects.brass}" stroke="#1A1A1A" stroke-width="3.5"/>
<circle cx="${ox + ow - 38}" cy="${oy + 224}" r="5.5" fill="#1A1A1A"/><path d="M ${ox + ow - 38} ${oy + 224} l -4 20 h 8 z" fill="#1A1A1A"/>
<circle cx="${ox + ow - 38}" cy="${oy + 190}" r="9" fill="${objects.brass}" stroke="#1A1A1A" stroke-width="3.5"/></g>
<rect x="-30" y="${FLOOR}" width="${DOOR.w + 60}" height="6" rx="3" fill="#1A1A1A" opacity="0.12"/>
${post(pL)}${post(pR)}
${rope ? `<path d="M ${pL} ${ropeY - 4} Q ${(pL + pR) / 2} ${n(ropeY + ropeSag)} ${pR} ${ropeY - 4}" fill="none" stroke="${objects.velvet}" stroke-width="9" stroke-linecap="round" opacity="${n(1 - F1.interpolate(o, [0.5, 1], [0, 1], F1.clamp), 3)}"/>` : ""}
</svg>`;
    return Piece({ x, y, w: DOOR.w, h: DOOR.h, originY: FLOOR / DOOR.h, scale, ...timing }, f, html);
  };

  /** Race tickets lying or floating on the stage. x,y = bottom pivot of the fan. */
  F1.Tickets = ({ x, y, scale = 2, count = 2, angle = 0, ...timing }, f) =>
    Piece(
      { x, y, w: 110, h: 90, originY: 1, scale, ...timing },
      f,
      `<svg viewBox="-55 -90 110 90" width="100%" height="100%" style="overflow:visible;transform:rotate(${angle}deg);transform-origin:50% 100%">${TicketsArt({ count })}</svg>`,
    );

  /** Framed board of driver portraits. x,y = centre; 420x300 at scale 1. */
  F1.StoryBoard = ({ x, y, scale = 1, cols = 3, rows = 2, highlight, highlightAt = 0, stand = false, inner, ...timing }, f) => {
    const W = 420;
    const H = 300;
    const extra = stand ? 70 : 0;
    const hl = highlight === undefined ? 0 : F1.ramp(f, highlightAt, 10);
    const legs = stand
      ? `<g stroke="#1A1A1A" stroke-width="5" stroke-linecap="round" fill="none"><path d="M -90 ${H / 2} L -120 ${H / 2 + 66}" stroke="${objects.wood}"/><path d="M 90 ${H / 2} L 120 ${H / 2 + 66}" stroke="${objects.wood}"/></g>`
      : "";
    return Piece(
      { x, y, w: W, h: H + extra, originY: 0.5 * (H / (H + extra)), scale, ...timing },
      f,
      `<svg viewBox="${-W / 2} ${-H / 2} ${W} ${H + extra}" width="100%" height="100%" style="overflow:visible">${legs}${BoardArt({ w: W, h: H, cols, rows, highlight: highlight ?? -1, highlightAmount: hl })}</svg>${
        inner ? `<div style="position:absolute;inset:0">${inner}</div>` : ""
      }`,
    );
  };

  const MAP = { w: 600, h: 360 };
  // A simplified outline of the contiguous US (stylised, not cartographic).
  const US_PATH =
    "M38 38 L190 32 L330 34 L360 50 L400 46 L430 66 L470 52 L520 30 L560 28 L566 62 L540 100 L530 150 L510 200 L505 250 L520 300 L505 332 L480 318 L455 262 L420 262 L390 285 L345 292 L300 314 L268 306 L250 275 L215 262 L190 270 L120 255 L80 235 L52 195 L40 150 L34 100 Z";

  /** Pin positions on the TripMap as 0..1 fractions (u across, v down) for the three US races. */
  F1.US_CITIES = {
    austin: { u: 318 / 600, v: 268 / 360, label: "Austin" },
    miami: { u: 500 / 600, v: 318 / 360, label: "Miami" },
    vegas: { u: 120 / 600, v: 185 / 360, label: "Las Vegas" },
  };

  /** Stylised US map that unfolds, then pins drop on it one by one with a label chip. x,y = centre; 600x360 at scale 1. */
  F1.TripMap = ({ x, y, scale = 1, pins = [], unfoldFrames = 22, ...timing }, f) => {
    const at = timing.at ?? 0;
    const u = cubicOut(F1.ramp(f, at, unfoldFrames, (t) => t));
    const pinHtml =
      u >= 1
        ? pins
            .map((p) => {
              if (f < p.at) return "<!--pin-->";
              const k = F1.spring({ frame: f - p.at, config: { damping: 11, stiffness: 200, mass: 0.6 } });
              const color = p.color ?? editorial.accent;
              return `<div style="position:absolute;left:${n(p.u * MAP.w)}px;top:${n(p.v * MAP.h)}px;width:0;height:0">
<svg width="60" height="80" viewBox="-30 -70 60 80" style="position:absolute;left:-30px;top:-70px;overflow:visible;transform:translateY(${n((1 - k) * -50)}px);opacity:${n(Math.min(1, k * 3), 3)}"><path d="M0 8 C-18 -16 -20 -26 -20 -34 A20 20 0 1 1 20 -34 C20 -26 18 -16 0 8 Z" fill="${color}" stroke="#1A1A1A" stroke-width="4" stroke-linejoin="round"/><circle cx="0" cy="-34" r="7.5" fill="${editorial.white}"/></svg>
<div style="${F1.css({ position: "absolute", left: 0, top: 16, transform: "translateX(-50%)", whiteSpace: "nowrap", padding: "4px 14px", borderRadius: 999, background: editorial.white, boxShadow: `0 0 0 2px ${editorial.rule}`, fontFamily: F1.theme.font.body, fontWeight: 800, fontSize: 24, color: editorial.ink, opacity: n(Math.min(1, k * 2), 3) })}">${F1.esc(p.label)}</div></div>`;
            })
            .join("")
        : "<!--pins-->";
    const inner = `<div style="position:absolute;inset:0;transform:scaleY(${n(0.08 + 0.92 * u, 4)});opacity:${n(Math.min(1, u * 3), 3)};transform-origin:50% 50%">
<svg viewBox="0 0 ${MAP.w} ${MAP.h}" width="100%" height="100%" style="overflow:visible"><rect x="0" y="0" width="${MAP.w}" height="${MAP.h}" rx="10" fill="${objects.paper}" stroke="#1A1A1A" stroke-width="5"/>
<path d="M ${MAP.w / 3} 4 V ${MAP.h - 4} M ${(MAP.w * 2) / 3} 4 V ${MAP.h - 4}" stroke="#1A1A1A" stroke-opacity="0.18" stroke-width="3"/>
<path d="${US_PATH}" fill="${objects.liveries.mint}" fill-opacity="0.35" stroke="#1A1A1A" stroke-opacity="0.55" stroke-width="3" stroke-linejoin="round"/></svg></div>${pinHtml}`;
    return Piece({ x, y, w: MAP.w, h: MAP.h, originY: 0.5, scale, ...timing, enter: "none" }, f, inner);
  };

  // Shared art for scenes that draw props by hand.
  F1.mascotArt = { TicketArt, TicketsArt, PhoneArt, MapArt, BoardArt, DriverTile };
})((globalThis.F1 = globalThis.F1 || {}));
