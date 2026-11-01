/*
 * Flat illustration kit (port of components/toon). Components are `(props, f) => HTML string`, f = scene frame.
 *
 *   F1.Ground({ tone, color, glow, glowColor, glowX, glowY, particles, particleColor, seed }, f)
 *       calm solid ground + soft glow + slow floating particles. tone: plum (#EEEEEE) | alt | deep | ink | old
 *   F1.Grain({ opacity = 0.14, sepia = true, seed = 1 }, f)          film grain + sepia wash for 2010 flashbacks
 *   F1.Car({ livery, number, speed, size, facing, x, y, ... }, f)     side-view F1 car; x = wheelbase centre, y = ground
 *   F1.CarTop / F1.Track / F1.SpeedLines / F1.Exhaust                 diagram pieces
 *   F1.Enter({ at, from, dist, frames, exitAt }, f, inner)            fade + slide entrance wrapper
 *   F1.Pop({ at, frames, origin, exitAt }, f, inner)                  overshoot scale-in wrapper
 *   F1.Drift({ px = -2, py = 0 }, f, inner)                           slow constant drift wrapper
 */
(function (F1) {
  const { toon } = F1.theme;
  const n = F1.n;
  const W = F1.STAGE.width;
  const H = F1.STAGE.height;

  /* ================================================================ Ground */

  const TONES = {
    plum: { bg: toon.ground, glow: "#f8f8f8", dot: toon.ink },
    alt: { bg: toon.sage, glow: "#e8e8e8", dot: toon.ink },
    deep: { bg: toon.ink, glow: "#1f1f1f", dot: toon.paper },
    ink: { bg: toon.ink, glow: "#1f1f1f", dot: toon.paper },
    old: { bg: toon.old.ground, glow: "#ebdfc6", dot: toon.old.cream },
  };

  F1.Ground = ({ tone = "plum", color, glow = 0.5, glowColor, glowX = 0.72, glowY = 0.5, particles = 26, particleColor, seed = 1 } = {}, f) => {
    const t = f / F1.FPS;
    const p = TONES[tone];
    const bg = color ?? p.bg;
    const gc = glowColor ?? (color ? F1.mix(color, toon.paper, 0.1) : p.glow);
    const dot = particleColor ?? p.dot;
    const dots = Array.from({ length: particles }, (_, i) => {
      const r = 3 + F1.random(`gr-${seed}-${i}`) * 9;
      const speed = 6 + F1.random(`gs-${seed}-${i}`) * 14; // px per second, upward
      const span = H + 80;
      const y = ((((F1.random(`gy-${seed}-${i}`) * span - t * speed) % span) + span) % span) - 40;
      const x = F1.random(`gx-${seed}-${i}`) * W + Math.sin(t * (0.5 + F1.random(`gw-${seed}-${i}`) * 0.6) + i) * 18 - t * 2;
      const tw = 0.5 + 0.5 * Math.sin(t * (0.8 + F1.random(`gt-${seed}-${i}`)) + i * 2.1);
      const o = 0.04 + 0.09 * tw * (0.4 + F1.random(`go-${seed}-${i}`) * 0.6);
      return `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${dot}" opacity="${n(o, 3)}"/>`;
    }).join("");
    const glowDiv =
      glow > 0
        ? `<div style="position:absolute;inset:0;background:radial-gradient(ellipse 55% 70% at ${glowX * 100}% ${glowY * 100}%, ${gc} 0%, ${F1.mix(bg, gc, 0.45)} 55%, ${bg} 100%);opacity:${Math.min(1, glow * 1.6)}"></div>`
        : "<!--glow-->";
    return `<div style="position:absolute;inset:0;background-color:${bg};overflow:hidden">${glowDiv}<svg width="${W}" height="${H}" style="position:absolute;inset:0">${dots}</svg></div>`;
  };

  /* ================================================================ Grain */

  /** Soft film grain (re-rolled ~15x per second) with an optional sepia wash and vignette for old-era moments. */
  F1.Grain = ({ opacity = 0.14, sepia = true, seed = 1 } = {}, f) => {
    const step = Math.floor(f / 2);
    const noiseSeed = Math.floor(F1.random(seed * 100000 + step) * 1000);
    const flicker = 0.94 + F1.random(seed * 7 + step * 3) * 0.06;
    const id = F1.uid();
    return `<div style="position:absolute;inset:0;pointer-events:none;opacity:${n(flicker, 3)}">
${sepia ? `<div style="position:absolute;inset:0;background:${toon.old.tan};mix-blend-mode:multiply;opacity:0.4"></div>` : "<!--sepia-->"}
<svg width="100%" height="100%" style="position:absolute;inset:0;mix-blend-mode:overlay;opacity:${n(opacity * 3, 3)}"><filter id="grain-${id}"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="${noiseSeed}" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#grain-${id})"/></svg>
<div style="position:absolute;inset:0;background:radial-gradient(ellipse at center, transparent 55%, ${toon.ink}55 100%)"></div></div>`;
  };

  /* ================================================================ Motion wrappers */

  /** Fade + slide entrance (ease-out). Text: from "right", dist 26, 12 frames; illustrations: larger dist/frames. */
  F1.Enter = ({ at = 0, from = "right", dist = 26, frames = 12, exitAt, style = {} } = {}, f, inner) => {
    const p = F1.ramp(f, at, frames);
    const out = exitAt === undefined ? 1 : 1 - F1.ramp(f, exitAt, 8);
    const d = (1 - p) * dist;
    const tx = from === "right" ? d : from === "left" ? -d : 0;
    const ty = from === "down" ? d : from === "up" ? -d : 0;
    return `<div style="${F1.css({ ...style, opacity: n(p * out, 3), transform: `translate(${n(tx)}px, ${n(ty)}px)` })}">${inner}</div>`;
  };

  /** Scales in with an overshoot (back-ease ~1.7) at frame `at`. */
  F1.Pop = ({ at = 0, frames = 14, origin = "50% 50%", exitAt, style = {} } = {}, f, inner) => {
    const s = F1.popScale(f, at, frames);
    const out = exitAt === undefined ? 1 : 1 - F1.ramp(f, exitAt, 8);
    const scale = s * out;
    return `<div style="${F1.css({ ...style, transformOrigin: origin, transform: `scale(${n(scale, 4)})`, opacity: n(Math.min(1, s * 4) * out, 3), visibility: scale <= 0.001 ? "hidden" : "visible" })}">${inner}</div>`;
  };

  /** Slow constant drift of its children (default -2 px/s horizontally). */
  F1.Drift = ({ px = -2, py = 0, style = {} } = {}, f, inner) => {
    const t = f / F1.FPS;
    return `<div style="${F1.css({ ...style, transform: `translate(${n(F1.driftPx(t, px))}px, ${n(F1.driftPx(t, py))}px)` })}">${inner}</div>`;
  };

  /* ================================================================ Car */

  F1.LIVERIES = {
    red: { main: toon.red, secondary: toon.paper },
    amber: { main: toon.amber, secondary: toon.groundDeep },
    mint: { main: toon.mint, secondary: toon.groundDeep },
    sky: { main: toon.sky, secondary: toon.paper },
    pink: { main: toon.pink, secondary: toon.groundDeep },
    old: { main: toon.old.red, secondary: toon.old.cream },
  };
  const DARK = "#1E2127";

  const arc = (r, a0, a1) => {
    const p = (a) => `${(Math.cos((a * Math.PI) / 180) * r).toFixed(2)} ${(Math.sin((a * Math.PI) / 180) * r).toFixed(2)}`;
    return `M ${p(a0)} A ${r} ${r} 0 0 1 ${p(a1)}`;
  };

  const Wheel = ({ cx, cy, r, angle, mark }) =>
    `<g transform="translate(${cx} ${cy})"><circle r="${r}" fill="#16181C"/><circle r="${n(r * 0.9)}" fill="#272A30"/><g transform="rotate(${n(angle % 360, 2)})">
<path d="${arc(r * 0.76, 10, 120)}" fill="none" stroke="${mark}" stroke-width="${n(r * 0.1)}" stroke-linecap="round"/>
<path d="${arc(r * 0.76, 190, 230)}" fill="none" stroke="${mark}" stroke-width="${n(r * 0.1)}" stroke-linecap="round" opacity="0.6"/>
<circle r="${n(r * 0.56)}" fill="#DADADA"/><circle r="${n(r * 0.46)}" fill="#33373E"/>
${[0, 1, 2, 3, 4].map((i) => `<rect x="${n(-r * 0.07)}" y="${n(-r * 0.46)}" width="${n(r * 0.14)}" height="${n(r * 0.46)}" rx="${n(r * 0.07)}" fill="#DADADA" transform="rotate(${i * 72})"/>`).join("")}
<circle r="${n(r * 0.13)}" fill="#9A9CA2"/><circle cx="${n(r * 0.34)}" cy="0" r="${n(r * 0.045)}" fill="#9A9CA2"/></g></g>`;

  /** Horizontal streaks that stream past (frame-driven). Returns an <svg>. */
  F1.SpeedLines = ({ width = 600, height = 200, count = 9, color = toon.cream, speed = 1, seed = 1, toward = "left", style = "" } = {}, f) => {
    const rects = Array.from({ length: count }, (_, i) => {
      const len = width * (0.18 + F1.random(`sl${seed}-${i}`) * 0.3);
      const v = (22 + F1.random(`sv${seed}-${i}`) * 26) * speed;
      const span = width + len;
      const k = ((((F1.random(`sx${seed}-${i}`) * span - f * v) % span) + span) % span) / span;
      const px = toward === "left" ? k * span - len : width - k * span;
      const fade = Math.min(1, k * 4) * Math.min(1, (1 - k) * 4);
      const y = (i + 0.5 + (F1.random(`sy${seed}-${i}`) - 0.5) * 0.6) * (height / count);
      return `<rect x="${n(px)}" y="${n(y - 2.5)}" width="${n(len)}" height="5" rx="2.5" fill="${color}" opacity="${n(0.4 * fade, 3)}"/>`;
    }).join("");
    return `<svg width="${width}" height="${height}" style="overflow:visible;display:block;${style}">${rects}</svg>`;
  };

  /** Little puffs drifting out of an exhaust / tyre smoke, looping. */
  F1.Exhaust = ({ puffs = 6, color = toon.cream, size = 1, speed = 1, style = "" } = {}, f) => {
    const t = (f / F1.FPS) * speed;
    const cs = Array.from({ length: puffs }, (_, i) => {
      const k = (t * 1.1 + i / puffs) % 1;
      return `<circle cx="${n(-k * 220)}" cy="${n(-k * 26 + Math.sin(k * 7 + i * 2) * 8)}" r="${n(6 + k * 26)}" fill="${color}" opacity="${n(0.36 * (1 - k), 3)}"/>`;
    }).join("");
    return `<svg width="${260 * size}" height="${120 * size}" viewBox="-240 -60 260 120" style="overflow:visible;display:block;${style}">${cs}</svg>`;
  };

  const CW = 640;
  const CH = 230;
  const GROUND_Y = 210;

  /** Modern flat F1 car, side view (nominal 640x230, nose right). x = centre of the wheelbase, y = ground line. */
  F1.Car = ({ livery = F1.LIVERIES.red, number = 1, speed = 0, size = 640, facing = "right", helmetColor = toon.paper, tyre = toon.red, speedLines, dust, shadow = true, x, y, style = {} } = {}, f) => {
    const { main, secondary } = livery;
    const k = size / CW;
    const dir = facing === "right" ? 1 : -1;
    const spin = f * 11 * speed;
    const vib = (F1.wave(f / 30, 0.09) * 1.1 + F1.wave(f / 30, 0.23, 0.3) * 0.7) * speed + F1.wave(f / 30, 0.1) * 0.35;
    const showLines = speedLines ?? speed > 0.3;
    const showDust = dust ?? speed > 0.2;
    const sidepod = F1.tint(main, 0.1);
    const anchor = (facing === "right" ? 340 : CW - 340) * k;
    const pos = x !== undefined || y !== undefined ? { position: "absolute", left: n((x ?? 0) - anchor), top: n((y ?? 0) - GROUND_Y * k) } : {};
    const svgStyle = F1.css({ overflow: "visible", display: "block", ...pos, ...style });
    const num = String(number);
    return `<svg width="${n(CW * k)}" height="${n(CH * k)}" viewBox="0 0 ${CW} ${CH}" style="${svgStyle}">
<g${facing === "left" ? ` transform="translate(${CW} 0) scale(-1 1)"` : ""}>
${shadow ? `<ellipse cx="340" cy="${GROUND_Y + 3}" rx="300" ry="9" fill="${toon.groundDeep}" opacity="0.35"/>` : ""}
${showLines ? `<g transform="translate(-330 20)">${F1.SpeedLines({ width: 420, height: 180, count: 8, speed: 0.6 + speed, seed: 3 }, f)}</g>` : ""}
${showDust ? `<g transform="translate(110 200)">${F1.Exhaust({ puffs: 5, size: 1, speed: 0.6 + speed, color: F1.mix(toon.ink, toon.ground, 0.8) }, f)}</g>` : ""}
<g transform="translate(0 ${n(vib, 3)})">
<rect x="92" y="104" width="12" height="46" rx="3" fill="${DARK}"/>
<path d="M 52 68 L 112 64 L 116 112 L 62 120 Z" fill="${F1.shade(main, 0.22)}" stroke="${F1.shade(main, 0.22)}" stroke-width="4" stroke-linejoin="round"/>
<path d="M 46 58 L 122 55 L 122 66 L 46 70 Z" fill="${secondary}" stroke="${secondary}" stroke-width="3" stroke-linejoin="round"/>
<path d="M 56 92 L 116 90 L 116 97 L 56 99 Z" fill="${DARK}"/><path d="M 100 142 L 72 160 L 100 166 Z" fill="${DARK}"/>
<g stroke="${DARK}" stroke-width="5" stroke-linecap="round"><path d="M 150 160 L 214 138 M 150 160 L 206 124"/><path d="M 510 166 L 452 146 M 510 166 L 440 134"/></g>
<rect x="104" y="154" width="430" height="16" rx="7" fill="${DARK}"/>
<path d="M 100 160 L 102 108 C 130 102 176 90 220 70 L 262 58 C 280 60 288 80 306 92 L 348 96 C 420 100 500 114 580 128 C 606 132 622 138 624 146 C 622 154 600 158 580 158 L 330 160 Z" fill="${main}"/>
<path d="M 100 160 L 104 142 C 200 150 400 146 574 150 L 574 158 L 330 160 Z" fill="#000" opacity="0.14"/>
<path d="M 118 112 C 160 104 200 90 244 72" fill="none" stroke="${F1.tint(main, 0.28)}" stroke-width="6" stroke-linecap="round" opacity="0.7"/>
<path d="M 380 110 L 580 140 L 582 149 L 384 121 Z" fill="${secondary}"/>
<path d="M 186 160 C 190 130 206 112 232 106 C 290 94 366 98 410 110 C 428 116 434 140 432 160 Z" fill="${sidepod}"/>
<path d="M 222 130 C 280 120 342 120 414 130 L 418 140 C 342 132 280 132 216 142 Z" fill="${secondary}"/>
<path d="M 186 160 L 192 146 L 426 146 L 432 160 Z" fill="#000" opacity="0.12"/><ellipse cx="420" cy="134" rx="10" ry="21" fill="${DARK}"/>
<ellipse cx="308" cy="92" rx="42" ry="10" fill="${DARK}"/><circle cx="304" cy="80" r="18" fill="${helmetColor}"/>
<path d="M 308 72 Q 324 73 322 84 L 308 87 Z" fill="#17191D"/><path d="M 292 70 Q 298 64 306 63" fill="none" stroke="${main}" stroke-width="5" stroke-linecap="round"/>
<path d="M 276 96 Q 306 99 346 97 L 346 106 L 276 106 Z" fill="${main}"/><ellipse cx="266" cy="74" rx="6" ry="12" fill="${DARK}"/><circle cx="346" cy="90" r="5" fill="${secondary}"/>
<path d="M 349 97 L 341 74 C 322 58 290 58 272 68 M 272 68 L 264 88" fill="none" stroke="#17191D" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="545" y="148" width="9" height="22" rx="3" fill="${DARK}"/><rect x="516" y="168" width="128" height="9" rx="4.5" fill="${secondary}"/>
<rect x="538" y="160" width="100" height="6" rx="3" fill="${F1.shade(main, 0.3)}"/>
<path d="M 614 150 L 640 150 L 642 180 L 610 180 Z" fill="${main}" stroke="${main}" stroke-width="4" stroke-linejoin="round"/>
<path d="M 618 158 L 636 158 L 637 172 L 617 172 Z" fill="#000" opacity="0.14"/>
<circle cx="450" cy="126" r="15" fill="${toon.paper}"/>
<text x="450" y="126" text-anchor="middle" dominant-baseline="central"${facing === "left" ? ` transform="translate(900 0) scale(-1 1)"` : ""} font-family="${F1.esc(toon.font.display)}" font-weight="800" font-size="${num.length > 1 ? 17 : 22}" fill="${toon.groundDeep}">${F1.esc(num)}</text>
${Wheel({ cx: 150, cy: 160, r: 50, angle: spin * dir, mark: tyre })}
${Wheel({ cx: 510, cy: 166, r: 44, angle: spin * 1.13 * dir, mark: tyre })}
</g></g></svg>`;
  };

  /* ================================================================ top-down car and track */

  const TOP_W = 240;
  const TOP_H = 90;

  F1.CarTopArt = ({ livery = F1.LIVERIES.red, helmetColor = toon.paper } = {}) =>
    `<g transform="translate(${-TOP_W / 2} ${-TOP_H / 2})"><g fill="#16181C"><rect x="34" y="0" width="40" height="24" rx="9"/><rect x="34" y="66" width="40" height="24" rx="9"/><rect x="168" y="4" width="32" height="20" rx="8"/><rect x="168" y="66" width="32" height="20" rx="8"/></g>
<rect x="2" y="8" width="20" height="74" rx="6" fill="${livery.secondary}"/><rect x="14" y="8" width="6" height="74" rx="3" fill="#000" opacity="0.18"/>
<path d="M 22 38 L 60 32 C 90 24 134 26 156 38 L 214 41 Q 228 45 214 49 L 156 52 C 134 64 90 66 60 58 L 22 52 Z" fill="${livery.main}"/>
<path d="M 70 40 C 110 38 160 40 214 43 L 214 47 C 160 50 110 52 70 50 Z" fill="${livery.secondary}"/>
<rect x="206" y="4" width="22" height="82" rx="7" fill="${livery.secondary}"/><rect x="222" y="4" width="6" height="82" rx="3" fill="#000" opacity="0.18"/>
<circle cx="112" cy="45" r="10" fill="${helmetColor}"/><path d="M 118 40 Q 124 45 118 50 Z" fill="#17191D"/></g>`;

  F1.CarTop = ({ livery, size = 240, angle = 0, x, y } = {}) => {
    const k = size / TOP_W;
    const pos = x !== undefined || y !== undefined ? F1.css({ position: "absolute", left: n((x ?? 0) - size / 2), top: n((y ?? 0) - (TOP_H * k) / 2) }) : "";
    return `<svg width="${size}" height="${n(TOP_H * k)}" viewBox="0 0 ${TOP_W} ${TOP_H}" style="overflow:visible;display:block;${pos}"><g transform="translate(${TOP_W / 2} ${TOP_H / 2}) rotate(${n(angle)})">${F1.CarTopArt({ livery })}</g></svg>`;
  };

  /** Position + heading on a closed track for progress `u` (wraps at 1). */
  F1.trackPoint = (shape, u, width, height) => {
    const fn = (v) => {
      const th = Math.PI * 2 * v;
      const a = width / 2 - 70;
      const b = height / 2 - 70;
      if (shape === "oval") {
        const k = 2.7;
        const c = Math.cos(th);
        const s = Math.sin(th);
        return { x: width / 2 + a * Math.sign(c) * Math.abs(c) ** (2 / k), y: height / 2 + b * Math.sign(s) * Math.abs(s) ** (2 / k) };
      }
      const r = 1 + 0.2 * Math.cos(3 * th + 0.6) + 0.12 * Math.sin(2 * th + 1) + 0.05 * Math.cos(5 * th);
      return { x: width / 2 + a * 0.92 * r * Math.cos(th), y: height / 2 + b * 0.92 * r * Math.sin(th) };
    };
    const p = fn(u);
    const q = fn(u + 0.002);
    return { x: p.x, y: p.y, angle: (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI };
  };

  /** Closed race-track diagram with top-down cars moving along it (`cars[i].progress` from the frame). */
  F1.Track = ({ width = 900, height = 560, shape = "circuit", draw = 1, cars = [], lane = 46, asphalt = toon.groundAlt, kerbs = true, startLine = true, x, y } = {}) => {
    const N = 220;
    let d = "";
    for (let i = 0; i < N; i++) {
      const p = F1.trackPoint(shape, i / N, width, height);
      d += `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
    }
    d += "Z";
    const start = F1.trackPoint(shape, 0, width, height);
    const dash = `${draw} 2`;
    const pos = x !== undefined || y !== undefined ? F1.css({ position: "absolute", left: n((x ?? 0) - width / 2), top: n((y ?? 0) - height / 2) }) : "";
    const flag =
      startLine && draw >= 1
        ? `<g transform="translate(${n(start.x)} ${n(start.y)}) rotate(${n(start.angle)})">${Array.from({ length: 6 }, (_, r) =>
            [0, 1].map((c) => `<rect x="${-8 + c * 8}" y="${n(-lane / 2 + (r * lane) / 6)}" width="8" height="${n(lane / 6)}" fill="${(r + c) % 2 ? toon.paper : toon.groundDeep}"/>`).join(""),
          ).join("")}</g>`
        : "";
    const carsSvg = cars
      .map((c) => {
        const p = F1.trackPoint(shape, ((c.progress % 1) + 1) % 1, width, height);
        const s = (c.size ?? 72) / TOP_W;
        return `<g transform="translate(${n(p.x)} ${n(p.y)}) rotate(${n(p.angle)}) scale(${n(s, 4)})">${F1.CarTopArt({ livery: c.livery ?? F1.LIVERIES.red })}</g>`;
      })
      .join("");
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow:visible;display:block;${pos}">
${kerbs ? `<path d="${d}" pathLength="1" fill="none" stroke="${toon.paper}" stroke-width="${lane + 12}" stroke-linejoin="round" stroke-dasharray="${dash}" opacity="0.9"/>` : ""}
${kerbs && draw >= 1 ? `<path d="${d}" pathLength="1" fill="none" stroke="${toon.red}" stroke-width="${lane + 12}" stroke-linejoin="round" stroke-dasharray="0.012 0.012"/>` : ""}
<path d="${d}" pathLength="1" fill="none" stroke="${asphalt}" stroke-width="${lane}" stroke-linejoin="round" stroke-dasharray="${dash}"/>
<path d="${d}" pathLength="1" fill="none" stroke="${toon.cream}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="0.012 0.012" opacity="${draw >= 1 ? 0.35 : 0}"/>
${flag}${carsSvg}</svg>`;
  };
})((globalThis.F1 = globalThis.F1 || {}));
