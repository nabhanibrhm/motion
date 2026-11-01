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
})((globalThis.F1 = globalThis.F1 || {}));
