/**
 * Living environment for the cinematic scenes: extras who walk (legs and arms swing, the body bobs), rows of them
 * crossing the frame at their own speed, steam and floating dust. All of it is SVG markup that goes inside a scene's
 * background <svg>, a pure function of the frame (pseudo-random values come from a seeded hash, never Math.random).
 *
 *   W.person(f, { x, y, s, kind, cloth, skin, pants, phase, amp })   one extra, feet at (x, y); kind: man | peci |
 *                                        hijab | old | kid. amp 0 stands still, 1 walks.
 *   W.row(f, { y, s, count, seed, speed, dir, freeze, span, time })  a row of extras crossing and wrapping around;
 *                                        from frame `freeze` they slow down and stop (the street "goes quiet");
 *                                        `time` (default f) warps their clock, to speed a crowd up without a jump
 *   W.steam(f, { x, y, n, rise, size })  puffs rising and fading
 *   W.dust(f, { x, y, w, h, n, seed })   motes drifting in a light beam
 *   W.drift(f, { seed, count, y0, y1, color, a })   big soft light motes wandering between y0 and y1 (background only)
 *   W.sweep(f, { color, a, y0, y1 })     a blurred light beam sliding slowly across the frame (background only)
 *   W.checklist(f, { x, y, w, title, items, ticks, tone, size, check })   a card whose items slide in and get ticked
 *                                        at the frames in `ticks`; items = [{ t, s?, src?, color? }]
 */
(function (F1) {
  const n = F1.n;
  const W = (F1.world = {});
  const INK = "#2a2a2e";
  W.hash = (k) => {
    const v = Math.sin(k * 12.9898 + 78.233) * 43758.5453;
    return v - Math.floor(v);
  };
  const pick = (arr, h) => arr[Math.floor(h * arr.length) % arr.length];

  const CLOTH = ["#c2463b", "#3f78b5", "#5fae7a", "#d9a441", "#7fa88a", "#b5523b", "#4e6a8f", "#e2b6c0", "#8a6f55", "#e9e2d3", "#5d6b74", "#c98a6a"];
  const SKIN = ["#c68a5e", "#a8724c", "#8c5a3c", "#d9a07a", "#b98058"];
  const PANTS = ["#34363c", "#2f3440", "#3b3a40", "#4f4a44", "#23262d"];
  const HIJAB = ["#8fae8c", "#e2b6c0", "#d9a441", "#4e6a8f", "#b5523b", "#e9e2d3", "#7a6a9a"];
  const KINDS = ["man", "man", "hijab", "hijab", "peci", "old", "kid", "man", "hijab"];

  W.person = (f, { x, y, s = 1, kind = "man", cloth = "#3f78b5", skin = "#a8724c", pants = "#34363c", veil = "#8fae8c", phase = 0, amp = 1 }) => {
    const leg = 22 * amp * Math.sin(phase);
    const arm = -18 * amp * Math.sin(phase);
    const bob = -3 * amp * Math.abs(Math.cos(phase));
    // hands sit at the end of each swinging arm (66 px from the shoulder)
    const sa = Math.sin((arm * Math.PI) / 180);
    const ca = Math.cos((arm * Math.PI) / 180);
    const st = `stroke="${INK}" stroke-width="4" stroke-linejoin="round"`;
    const legs = `<g ${st} fill="${pants}"><rect x="-17" y="-52" width="15" height="52" rx="6" transform="rotate(${n(leg, 1)} -9 -48)"/><rect x="2" y="-52" width="15" height="52" rx="6" transform="rotate(${n(-leg, 1)} 9 -48)"/></g>`;
    const arms = `<g ${st} fill="${cloth}"><rect x="-37" y="-142" width="13" height="66" rx="6" transform="rotate(${n(arm, 1)} -30 -138)"/><rect x="24" y="-142" width="13" height="66" rx="6" transform="rotate(${n(-arm, 1)} 30 -138)"/></g><g fill="${skin}" ${st}><circle cx="${n(-30 - 64 * sa)}" cy="${n(-138 + 64 * ca)}" r="8"/><circle cx="${n(30 + 64 * sa)}" cy="${n(-138 + 64 * ca)}" r="8"/></g>`;
    const eyes = `<g fill="#1d1b1c"><circle cx="-8" cy="-176" r="3.5"/><circle cx="8" cy="-176" r="3.5"/></g>`;
    let body;
    let head;
    if (kind === "hijab") {
      body = `<path d="M-30 -40 Q-30 -150 0 -154 Q30 -150 30 -40 Z" fill="${cloth}" ${st}/>`;
      head = `<path d="M-33 -170 Q-34 -212 0 -212 Q34 -212 33 -170 L36 -124 Q0 -110 -36 -124 Z" fill="${veil}" ${st}/><ellipse cx="0" cy="-174" rx="19" ry="22" fill="${skin}" ${st}/>${eyes}`;
    } else {
      const hair =
        kind === "peci"
          ? `<path d="M-22 -194 L-20 -216 H20 L22 -194 Z" fill="#1d1b1c" ${st}/>`
          : `<path d="M-27 -180 Q-26 -208 0 -208 Q26 -208 27 -180 Q14 -194 0 -192 Q-16 -194 -27 -180 Z" fill="${kind === "old" ? "#cfcac2" : "#1d1b1c"}" ${st}/>`;
      body = `<rect x="-27" y="-152" width="54" height="108" rx="20" fill="${cloth}" ${st}/>`;
      head = `<circle cx="0" cy="-178" r="27" fill="${skin}" ${st}/>${hair}${eyes}`;
    }
    const k = kind === "kid" ? 0.68 : 1;
    return `<g transform="translate(${n(x)} ${n(y + bob)}) scale(${n(s * k, 3)})">${legs}${arms}${body}${head}</g>`;
  };

  /** Distance walked by frame f at `v` px/frame, easing to a stop from frame `freeze`. */
  const travel = (f, v, freeze) => (freeze == null || f < freeze ? v * f : v * (freeze + 7 * (1 - Math.exp(-(f - freeze) / 7))));
  const ampAt = (f, freeze) => (freeze == null || f < freeze ? 1 : Math.exp(-(f - freeze) / 5));

  W.row = (f, { y, s = 1, count = 8, seed = 1, speed = 1.6, dir = 0, freeze = null, span = 1080, pad = 120, bob = 10, time = f }) => {
    const total = span + pad * 2;
    const people = [];
    for (let i = 0; i < count; i++) {
      const h = (j) => W.hash(seed * 97 + i * 13 + j);
      const d = dir || (h(1) < 0.5 ? -1 : 1);
      const v = d * speed * (0.7 + 0.6 * h(2));
      const x0 = (i + 0.3 * h(3)) * (total / count);
      const raw = x0 + travel(time, v, freeze);
      const x = (((raw % total) + total) % total) - pad;
      const steps = Math.abs(travel(time, v, freeze)) / (14 * s);
      people.push({
        y: y + bob * (h(4) - 0.5),
        svg: (yy) =>
          W.person(f, {
            x,
            y: yy,
            s,
            kind: pick(KINDS, h(5)),
            cloth: pick(CLOTH, h(6)),
            skin: pick(SKIN, h(7)),
            pants: pick(PANTS, h(8)),
            veil: pick(HIJAB, h(9)),
            phase: steps + 6 * h(10),
            amp: ampAt(time, freeze),
          }),
      });
    }
    return people
      .sort((a, b) => a.y - b.y)
      .map((p) => p.svg(p.y))
      .join("");
  };

  W.steam = (f, { x, y, count = 5, period = 54, rise = 220, size = 26, alpha = 0.32 }) => {
    let out = "";
    for (let k = 0; k < count; k++) {
      const t = (((f + (k * period) / count) % period) + period) % period / period;
      const px = x + 22 * Math.sin(t * 5 + k * 1.7);
      out += `<circle cx="${n(px)}" cy="${n(y - rise * t)}" r="${n(size * (0.6 + 1.2 * t))}" fill="#f4efe6" opacity="${n(alpha * Math.sin(Math.PI * t), 3)}"/>`;
    }
    return `<g style="filter:blur(6px)">${out}</g>`;
  };

  W.dust = (f, { x, y, w, h, count = 26, seed = 3, color = "#fff6dc", alpha = 0.5 }) => {
    let out = "";
    for (let i = 0; i < count; i++) {
      const r = (j) => W.hash(seed * 31 + i * 7 + j);
      const px = x + w * ((r(1) + 0.002 * f * (r(2) - 0.5) + 0.02 * Math.sin(f / (40 + 30 * r(3)) + i)) % 1);
      const py = y + h * ((((r(4) - 0.0012 * f * (0.5 + r(5))) % 1) + 1) % 1);
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(f / (25 + 20 * r(6)) + i));
      out += `<circle cx="${n(px)}" cy="${n(py)}" r="${n(2 + 3 * r(7), 1)}" fill="${color}" opacity="${n(alpha * tw, 3)}"/>`;
    }
    return out;
  };

  /**
   * Ambient motion for the backdrop (SVG, goes inside the background <svg>). Both are sines of f, so they stay smooth at
   * fractional frames (60 fps). Their output is byte-identical to the DRIFT / SWEEP copies pasted in the 06-14 scenes.
   */
  W.drift = (f, { seed, count, y0, y1, color, a }) =>
    `<g fill="${color}" opacity="${a}">${Array.from({ length: count }, (_, i) => { const h = (k) => W.hash(seed + i * 5 + k); return `<circle cx="${n(60 + 960 * h(1) + 26 * Math.sin(f * 0.035 * (0.6 + h(2)) + h(3) * 6.28), 1)}" cy="${n(y0 + (y1 - y0) * h(4) + 34 * Math.sin(f * 0.026 * (0.6 + h(5)) + h(6) * 6.28), 1)}" r="${n(8 + 18 * h(7), 1)}"/>`; }).join("")}</g>`;
  W.sweep = (f, { color, a, y0, y1 }) =>
    `<g style="filter:blur(26px)" opacity="${n(a * (0.65 + 0.35 * Math.sin(f * 0.021)), 3)}" transform="translate(${n(-260 + 1000 * (0.5 + 0.5 * Math.sin(f * 0.0175)), 1)} 0)"><polygon points="0,${y0} 200,${y0} 100,${y1} -100,${y1}" fill="${color}"/></g>`;

  /**
   * Checklist card (HTML, absolutely positioned: put it in a scene's background html or an overlay). Item i slides 20 px
   * and fades in from `0.25` to full as its tick is drawn, starting 2 frames before ticks[i]; an item without a tick frame
   * is shown ticked. tone 'paper' is a light card with a green tick; 'dark' is an ink card with an accent tick.
   * items[i] = { t: label, s: small mono line, src: "Sumber:" line, color: label colour }.
   */
  W.checklist = (f, { x = 90, y = 330, w = 900, title = "", items = [], ticks = [], tone = "paper", size = 38, check = null, bg = null }) => {
    const P = F1.PAL;
    const dark = tone === "dark";
    const ink = dark ? "#fff" : P.ink;
    const tick = check || (dark ? P.accent : "#4e8a4f");
    const box = Math.round(size * 1.5);
    const mono = "'JetBrains Mono', monospace";
    const osw = "Oswald, sans-serif";
    const rows = items
      .map((it, i) => {
        const p = Number.isFinite(ticks[i]) ? F1.ramp(f, ticks[i] - 2, 10, F1.expoOut) : 1;
        const d = Math.round(box * 1.1);
        const mark =
          p > 0
            ? `<path d="M${n(box * 0.2)} ${n(box * 0.52)} L${n(box * 0.42)} ${n(box * 0.76)} L${n(box * 0.8)} ${n(box * 0.24)}" stroke="${tick}" stroke-width="${n(box * 0.16, 1)}" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${d}" stroke-dashoffset="${n(d * (1 - p), 2)}"/>`
            : "";
        const sub = it.s ? `<div style="font-family:${mono};font-weight:700;font-size:${Math.round(size * 0.52)}px;color:${dark ? "#c9c6c0" : "#6b5f52"};margin-top:2px">${it.s}</div>` : "";
        const src = it.src ? `<div style="font-family:${mono};font-weight:500;font-size:16px;color:${dark ? "#9fb0ba" : P.source};margin-top:4px">Sumber: ${it.src}</div>` : "";
        return `<div style="${F1.css({ display: "flex", alignItems: "center", gap: 24, marginTop: i ? 20 : 0, opacity: n(0.25 + 0.75 * p, 3), transform: `translateX(${n(-20 * (1 - p))}px)` })}"><svg width="${box}" height="${box}" viewBox="0 0 ${box} ${box}" style="flex:none"><rect x="3" y="3" width="${box - 6}" height="${box - 6}" rx="10" fill="${dark ? "rgba(255,255,255,0.1)" : "#fff"}" stroke="${ink}" stroke-width="5"/>${mark}</svg><div><div style="font-family:${osw};font-weight:600;font-size:${size}px;letter-spacing:1px;line-height:1.1;color:${it.color || ink}">${it.t}</div>${sub}${src}</div></div>`;
      })
      .join("");
    const head = title ? `<div style="font-family:${osw};font-weight:600;font-size:${Math.round(size * 1.05)}px;letter-spacing:4px;color:${ink};margin-bottom:26px">${title}</div>` : "";
    return `<div style="${F1.css({ position: "absolute", left: x, top: y, width: w, boxSizing: "border-box", padding: "34px 40px 36px", borderRadius: 22, background: bg || (dark ? P.ink : P.paper), border: `6px solid ${dark ? P.paper : P.ink}` })}">${head}${rows}</div>`;
  };

})((globalThis.F1 = globalThis.F1 || {}));
