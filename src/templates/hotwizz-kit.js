/**
 * HotWizz Flash scene kit (browser side). Inlined by src/templates/hotwizz.mjs into every hw-* composition, so the
 * shared runtime and index.html stay unchanged. Defined once per page as F1.hw; every composition calls
 * F1.hw.draw(type, f, ctx, props) from its F1.scene render.
 *
 * Rules kept here: every value comes from the (possibly fractional, 60 fps) timeline frame f; no f % N, no timers,
 * no randomness except F1.world.hash; art stays between the progress strip (y 140) and y 1440, so the caption band
 * (y ~1480-1650) and the right ~120 px stay clear. Props arrive validated and normalised (cues are F1.at anchor specs
 * or null, photos are "public/..." paths or null).
 */
if (!F1.hw) {
  F1.hw = (() => {
    const n = F1.n;
    const esc = F1.esc;
    const RED = "#ff2d3d", YEL = "#ffd23f", ORG = "#ff7a1a", INK = "#0d0f16", GREY = "#9aa3b8";
    const CARD = "rgba(27,33,50,0.94)";
    const mono = "'JetBrains Mono', monospace";
    const osw = "Oswald, sans-serif";
    const X0 = 72, WIDE = 888; // content column: x 72..960 (right 120 px clear)

    /** Escape, then *accent* -> coloured span and \n -> line break. */
    const rich = (s, color = YEL) =>
      esc(s)
        .replace(/\*(.+?)\*/g, (_, t) => `<span style="color:${color}">${t}</span>`)
        .replace(/\n/g, "<br>");
    const plain = (s) => String(s).replace(/\*/g, "");
    /** Largest font size (even px, max..min) whose estimated wrapped text fits w x h. cw = average glyph width in em. */
    const fit = (text, w, h, max, min, { lh = 1.08, cw = 0.5, wrap = true } = {}) => {
      const lines = plain(text).split("\n");
      for (let s = max; s > min; s -= 2) {
        const rows = lines.reduce((a, l) => a + (wrap ? Math.max(1, Math.ceil((l.length * cw * s * 1.1) / w)) : 1), 0);
        const widest = Math.max(...lines.map((l) => l.length * cw * s));
        if (rows * s * lh <= h && (wrap || widest <= w)) return s;
      }
      return min;
    };
    /** Anchor spec -> frame, or the fallback when the prop had no cue. */
    const cue = (S, spec, fallback) => (spec === null || spec === undefined ? fallback : F1.at(S, spec));
    /** Default reveal frames when no cue is given: evenly through the first 70% of the scene. */
    const spread = (D, i, count, from = 6) => Math.round(from + (i * D * 0.7) / Math.max(1, count));
    const show = (p, dy = 30) => `opacity:${n(Math.min(1, p), 3)};transform:translateY(${n((1 - Math.min(1, p)) * dy)}px)`;

    // plain background: gradient + scanlines (no drifting dots or red light sweep since 10 Nov 2026, user request)
    const bg = () =>
      `<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 40% 40%,#1b2133 0%,${INK} 70%)"></div>` +
      `<div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,0.025) 0 2px,transparent 2px 6px)"></div>`;

    /** Scene frame: camera stage (with theme watermark), vignette, case-progress strip, then overlays (not zoomed). */
    const frame = (f, D, p, body, { whip = true, overlay = "" } = {}) =>
      F1.join(
        F1.cine.stage(f, D, bg(f, p.seed) + body, { whip, zoom: 0.025, ox: 50, oy: 48 }),
        F1.cine.vignette(0.35, "50% 50%", 50),
        F1.cine.progress(f, { step: p.step, label: esc(p.label) }),
        overlay,
      );

    const kicker = (text, color = RED) =>
      `<div style="font-family:${mono};font-weight:700;font-size:26px;letter-spacing:3px;color:${color};white-space:nowrap">● ${esc(text)}</div>`;
    const sourceLine = (text, size = 21) =>
      text ? `<div style="font-family:${mono};font-weight:500;font-size:${size}px;letter-spacing:0.5px;line-height:1.3;color:${GREY}">Sumber: ${esc(text)}</div>` : "";
    const credit = (text, x, y, w, a = 0.7) =>
      text ? `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;opacity:${a};font-family:${mono};font-weight:500;font-size:18px;line-height:1.3;color:#fff">Foto: ${esc(text)}</div>` : "";

    /** Identical treatment for every person: same frame, same grade; a silhouette when there is no photo. */
    const silhouette = () =>
      `<svg width="100%" height="100%" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0"><rect width="300" height="400" fill="#232a3d"/><circle cx="150" cy="150" r="66" fill="#3a4256"/><path d="M10 400 Q10 270 95 252 Q150 290 205 252 Q290 270 290 400 Z" fill="#3a4256"/></svg>`;
    const person = (o, x, y, w, h, glow = 0) =>
      `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:18px;overflow:hidden;background:#1b2132;border:5px solid rgba(255,255,255,0.85);box-sizing:border-box;box-shadow:0 0 ${n(20 + glow)}px rgba(255,45,61,0.45)">${
        o.photo
          ? `<img src=${JSON.stringify(o.photo)} alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 22%;filter:saturate(0.9) contrast(1.05)">`
          : silhouette()
      }</div>`;

    const T = {};

    /* ---------------------------------------------------------------- hw-hook: frame 0 = the hook's claim + person */
    T.hook = (f, { S, D }, p) => {
      const C = F1.cine;
      const at = cue(S, p.cue, null);
      const pulse = 0.5 + 0.5 * Math.sin(f / 5);
      const pop = at === null ? 1 : 1 + 0.06 * Math.sin(Math.PI * F1.ramp(f, at, 14));
      const hs = fit(p.headline, WIDE, 280, 150, 64, { lh: 1.0, wrap: false, cw: 0.56 });
      const cs = fit(p.claim, WIDE, 150, 74, 38, { lh: 1.08, cw: 0.48 });
      const P = p.person;
      const PX = X0, PY = 900, PW = 360, PH = 480, RX = 456, RW = 504;
      const ns = fit(P.name, RW, 230, 84, 40, { lh: 1.02, cw: 0.56 });
      const body =
        // person card first so its <img> keeps its DOM slot from frame 0
        person(P, PX, PY, PW, PH, 10 * pulse) +
        credit(P.credit, X0, PY + PH + 12, WIDE) +
        `<div style="position:absolute;left:${X0}px;top:250px;width:${WIDE}px;height:84px;background:${RED};display:flex;align-items:center;justify-content:space-between;padding:0 28px;box-sizing:border-box;box-shadow:0 0 ${n(24 + 14 * pulse)}px rgba(255,45,61,0.55)">
<div style="font-family:${osw};font-weight:700;font-size:56px;letter-spacing:8px;color:#fff;white-space:nowrap"><span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:#fff;margin-right:18px;opacity:${n(0.5 + 0.5 * pulse, 2)}"></span>${esc(p.kicker)}</div>
<div style="font-family:${mono};font-weight:700;font-size:26px;letter-spacing:3px;color:${INK};background:${YEL};padding:6px 14px;border-radius:6px;white-space:nowrap">${esc(F1.cine.CASE.id)}</div></div>
<div style="position:absolute;left:${X0}px;top:350px;width:${WIDE}px;height:530px;display:flex;flex-direction:column;align-items:flex-start;gap:16px">
<div style="font-family:${osw};font-weight:700;font-size:${hs}px;line-height:1.0;letter-spacing:2px;color:#fff;white-space:nowrap;text-transform:uppercase;text-shadow:0 6px 0 rgba(0,0,0,0.5);transform-origin:0 60%;transform:scale(${n(pop, 3)})">${rich(p.headline)}</div>
<div style="width:120px;height:8px;background:${ORG};flex:none"></div>
<div style="font-family:${osw};font-weight:700;font-size:${cs}px;line-height:1.08;letter-spacing:1px;color:#fff;text-transform:uppercase;text-shadow:0 5px 0 rgba(0,0,0,0.5)">${rich(p.claim, ORG)}</div>
${p.tag ? `<div style="padding:6px 16px;background:${YEL};border-radius:6px;font-family:${mono};font-weight:700;font-size:26px;letter-spacing:3px;color:${INK};white-space:nowrap">${esc(p.tag)}</div>` : ""}</div>
<div style="position:absolute;left:${RX}px;top:${PY + 10}px;width:${RW}px;display:flex;flex-direction:column;gap:14px">
${P.status ? `<div style="align-self:flex-start;padding:6px 14px;background:${ORG};border-radius:6px;font-family:${mono};font-weight:700;font-size:24px;letter-spacing:3px;color:${INK}">${esc(P.status)}</div>` : ""}
<div style="font-family:${osw};font-weight:700;font-size:${ns}px;line-height:1.02;letter-spacing:1px;color:#fff;text-transform:uppercase">${rich(P.name)}</div>
${P.role ? `<div style="font-family:${mono};font-weight:500;font-size:26px;line-height:1.3;color:#c9c6c0">${esc(P.role)}</div>` : ""}</div>` +
        (p.stamp ? C.stamp(f, { at: cue(S, p.stamp.cue, 0), x: RX, y: PY + PH - 110, rot: -7, text: esc(p.stamp.text), size: 54, color: RED }) : "");
      return frame(f, D, p, body, { whip: false });
    };

    /* ---------------------------------------------------------------- hw-resmi: 2-4 confirmed facts with sources */
    T.resmi = (f, { S, D }, p) => {
      const items = p.items;
      const top = 430, bottom = 1440, gap = 22;
      const h = Math.floor((bottom - top - gap * (items.length - 1)) / items.length);
      const ats = items.map((it, i) => cue(S, it.cue, spread(D, i, items.length)));
      let active = -1;
      ats.forEach((a, i) => { if (f >= a) active = i; });
      const ts = Math.min(...items.map((it) => fit(it.text, 740, h - 92, 54, 28, { lh: 1.12, cw: 0.46 })));
      const rows = items.map((it, i) => {
        const y = top + i * (h + gap);
        const r = F1.ramp(f, ats[i], 14, F1.expoOut);
        const slot = `<div style="position:absolute;left:${X0}px;top:${y}px;width:${WIDE}px;height:${h}px;border-radius:16px;border:3px dashed rgba(255,255,255,0.16);box-sizing:border-box"></div>`;
        if (r <= 0) return slot;
        const hot = i === active;
        return `${slot}<div style="position:absolute;left:${X0}px;top:${y}px;width:${WIDE}px;height:${h}px;${show(r)};">
<div style="position:absolute;inset:0;border-radius:16px;background:${CARD};border-left:12px solid ${hot ? YEL : "rgba(255,255,255,0.75)"};box-shadow:0 0 ${hot ? 26 : 0}px rgba(255,210,63,0.25)"></div>
<div style="position:absolute;left:30px;top:24px;width:58px;height:58px;border-radius:50%;background:${hot ? YEL : "#fff"};display:flex;align-items:center;justify-content:center;font-family:${osw};font-weight:700;font-size:36px;color:${INK}">${i + 1}</div>
<div style="position:absolute;left:112px;top:22px;width:740px;height:${h - 92}px;display:flex;align-items:center;font-family:${osw};font-weight:600;font-size:${ts}px;line-height:1.12;color:#fff"><div>${rich(it.text)}</div></div>
<div style="position:absolute;left:112px;bottom:18px;width:740px">${sourceLine(it.source)}</div></div>`;
      });
      const body =
        `<div style="position:absolute;left:${X0}px;top:258px;width:${WIDE}px">${kicker(p.kicker)}<div style="font-family:${osw};font-weight:700;font-size:96px;line-height:1.05;letter-spacing:3px;color:#fff;white-space:nowrap">${rich(p.title)}</div></div>` +
        rows.join("");
      return frame(f, D, p, body);
    };

    /* ---------------------------------------------------------------- hw-split: RESMI vs BELUM JELAS, equal columns */
    T.split = (f, { S, D }, p) => {
      const sides = [p.left, p.right];
      const count = Math.max(p.left.items.length, p.right.items.length);
      const order = [...p.left.items.map((it, i) => [0, i]), ...p.right.items.map((it, i) => [1, i])];
      const ats = sides.map((s, k) => s.items.map((it, i) => cue(S, it.cue, spread(D, order.findIndex(([a, b]) => a === k && b === i), order.length))));
      const CW = 432, GAP = 24, top = p.headline ? 480 : 330, headH = 96, itemTop = top + headH + 18, bottom = p.source ? 1396 : 1440;
      const ih = Math.floor((bottom - itemTop - 16 * (count - 1)) / count);
      const ts = Math.min(...sides.flatMap((s) => s.items.map((it) => fit(it.text, CW - 92, ih - (it.source ? 74 : 40), 46, 26, { lh: 1.1, cw: 0.46 }))));
      const col = (s, k) => {
        const x = X0 + k * (CW + GAP);
        const headCol = k === 0 ? "#ffffff" : YEL; // both neutral (never red), same size and type
        const hp = F1.ramp(f, 2, 14, F1.expoOut);
        const head = `<div style="position:absolute;left:${x}px;top:${top}px;width:${CW}px;height:${headH}px;border-radius:14px;background:${headCol};display:flex;align-items:center;justify-content:center;${show(hp, 20)};font-family:${osw};font-weight:700;font-size:${fit(s.title, CW - 40, 80, 60, 30, { wrap: false })}px;letter-spacing:3px;color:${INK};white-space:nowrap">${esc(s.title)}</div>`;
        const items = s.items.map((it, i) => {
          const y = itemTop + i * (ih + 16);
          const r = F1.ramp(f, ats[k][i], 14, F1.expoOut);
          const slot = `<div style="position:absolute;left:${x}px;top:${y}px;width:${CW}px;height:${ih}px;border-radius:14px;border:3px dashed rgba(255,255,255,0.14);box-sizing:border-box"></div>`;
          if (r <= 0) return slot;
          const mark = k === 0
            ? `<div style="position:absolute;left:22px;top:24px;width:36px;height:36px;border-radius:8px;background:#fff"></div>`
            : `<div style="position:absolute;left:22px;top:18px;width:36px;height:44px;font-family:${osw};font-weight:700;font-size:44px;line-height:44px;text-align:center;color:${YEL}">?</div>`;
          return `${slot}<div style="position:absolute;left:${x}px;top:${y}px;width:${CW}px;height:${ih}px;${show(r, 24)}">
<div style="position:absolute;inset:0;border-radius:14px;background:${CARD};border:3px solid ${k === 0 ? "rgba(255,255,255,0.55)" : "rgba(255,210,63,0.55)"};box-sizing:border-box"></div>${mark}
<div style="position:absolute;left:74px;top:18px;width:${CW - 92}px;height:${ih - (it.source ? 70 : 36)}px;display:flex;align-items:center;font-family:${osw};font-weight:600;font-size:${ts}px;line-height:1.1;color:#fff"><div>${rich(it.text)}</div></div>
${it.source ? `<div style="position:absolute;left:74px;bottom:14px;width:${CW - 92}px">${sourceLine(it.source, 18)}</div>` : ""}</div>`;
        });
        return head + items.join("");
      };
      const body =
        `<div style="position:absolute;left:${X0}px;top:258px;width:${WIDE}px">${kicker(p.kicker)}${
          p.headline ? `<div style="font-family:${osw};font-weight:700;font-size:${fit(p.headline, WIDE, 150, 72, 40, { lh: 1.04, cw: 0.52 })}px;line-height:1.04;letter-spacing:2px;color:#fff;text-transform:uppercase">${rich(p.headline)}</div>` : ""
        }</div>` +
        col(p.left, 0) +
        col(p.right, 1) +
        (p.source ? `<div style="position:absolute;left:${X0}px;top:1404px;width:${WIDE}px">${sourceLine(p.source, 19)}</div>` : "");
      return frame(f, D, p, body);
    };

    /* ---------------------------------------------------------------- hw-quote: attributed quote card */
    T.quote = (f, { S, D }, p) => {
      const P = p.person;
      const at = cue(S, p.cue, 6);
      const PX = X0, PY = 300, PW = 300, PH = 400, RX = 400, RW = 560;
      const pin = F1.ramp(f, 0, 14, F1.expoOut);
      const q = F1.ramp(f, at, 16, F1.expoOut);
      const ns = fit(P.name, RW, 210, 76, 38, { lh: 1.02, cw: 0.5 });
      const qs = fit(p.quote, 800, 470, 68, 32, { lh: 1.16, cw: 0.45 });
      const body =
        person(P, PX, PY, PW, PH) +
        credit(P.credit, PX, PY + PH + 10, WIDE) +
        `<div style="position:absolute;left:${RX}px;top:${PY + 6}px;width:${RW}px;display:flex;flex-direction:column;gap:14px;${show(pin, 20)}">
${kicker(p.kicker)}
<div style="font-family:${osw};font-weight:700;font-size:${ns}px;line-height:1.02;letter-spacing:1px;color:#fff;text-transform:uppercase">${rich(P.name)}</div>
${P.role ? `<div style="font-family:${mono};font-weight:500;font-size:25px;line-height:1.3;color:#c9c6c0">${esc(P.role)}</div>` : ""}</div>
<div style="position:absolute;left:${X0}px;top:770px;width:${WIDE}px;height:560px;${show(q, 30)}">
<div style="position:absolute;inset:0;border-radius:20px;background:${CARD};border-left:12px solid ${YEL}"></div>
<div style="position:absolute;left:30px;top:-26px;font-family:${osw};font-weight:700;font-size:170px;line-height:170px;color:${YEL}">“</div>
<div style="position:absolute;left:54px;top:70px;width:800px;height:470px;display:flex;align-items:center;font-family:${osw};font-weight:600;font-size:${qs}px;line-height:1.16;color:#fff"><div>${rich(p.quote)}</div></div></div>
<div style="position:absolute;left:${X0}px;top:1350px;width:${WIDE}px;${show(q, 10)}">${sourceLine(p.date ? `${p.source}, ${p.date}` : p.source)}</div>`;
      return frame(f, D, p, body);
    };

    /* ---------------------------------------------------------------- hw-number: big number + caption + source */
    const parseNum = (v) => {
      const m = /^([^\d]*)(\d[\d.]*(?:,\d+)?)(.*)$/.exec(String(v));
      if (!m) return null;
      const dec = m[2].includes(",") ? m[2].split(",")[1].length : 0;
      return { pre: m[1], post: m[3], dec, value: Number(m[2].replace(/\./g, "").replace(",", ".")) };
    };
    const fmt = (x, dec) => {
      const [i, d] = x.toFixed(dec).split(".");
      return i.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (d ? `,${d}` : "");
    };
    T.number = (f, { S, D }, p) => {
      const at = cue(S, p.cue, 6);
      const r = F1.ramp(f, at, 26, F1.expoOut);
      const num = p.countUp ? parseNum(p.value) : null;
      const shown = num ? `${num.pre}${fmt(num.value * r, num.dec)}${num.post}` : p.value;
      const vs = fit(p.value, WIDE, 320, 300, 90, { lh: 1, wrap: false, cw: 0.52 });
      const ls = fit(p.caption, WIDE, 260, 66, 34, { lh: 1.1, cw: 0.47 });
      const land = F1.ramp(f, at + 22, 10, F1.backOut);
      const body =
        `<div style="position:absolute;left:${X0}px;top:258px;width:${WIDE}px">${kicker(p.kicker)}</div>
<div style="position:absolute;left:${X0}px;top:420px;width:${WIDE}px;height:560px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;opacity:${n(Math.min(1, r * 3), 3)}">
<div style="font-family:${osw};font-weight:700;font-size:${vs}px;line-height:1;letter-spacing:2px;color:#fff;white-space:nowrap;text-shadow:0 8px 0 rgba(0,0,0,0.5);transform:scale(${n(1 + 0.05 * Math.sin(Math.PI * Math.min(1, Math.max(0, land))), 3)})">${esc(shown)}</div>
${p.unit ? `<div style="margin-top:18px;padding:6px 30px;border-radius:14px;background:${RED};font-family:${osw};font-weight:700;font-size:${fit(p.unit, WIDE - 60, 100, 84, 36, { wrap: false })}px;letter-spacing:4px;color:#fff;white-space:nowrap;text-transform:uppercase">${esc(p.unit)}</div>` : ""}</div>
<div style="position:absolute;left:${X0}px;top:1010px;width:${WIDE}px;height:280px;display:flex;align-items:center;justify-content:center;text-align:center;${show(F1.ramp(f, at + 10, 16, F1.expoOut), 24)};font-family:${osw};font-weight:600;font-size:${ls}px;line-height:1.1;color:#fff"><div>${rich(p.caption)}</div></div>
<div style="position:absolute;left:${X0}px;top:1330px;width:${WIDE}px;text-align:center;${show(F1.ramp(f, at + 16, 14), 10)}">${sourceLine(p.source)}</div>`;
      return frame(f, D, p, body);
    };

    /* ---------------------------------------------------------------- hw-cover: end card, then title-only cover */
    const STYLES = {
      kicker: (t) => `<span style="font-family:${mono};font-weight:700;font-size:34px;letter-spacing:8px;color:${ORG}">${rich(t)}</span>`,
      big: (t) => `<div style="font-family:${osw};font-weight:700;font-size:${fit(t, 880, 200, 92, 44, { lh: 1.08 })}px;line-height:1.08;letter-spacing:2px;color:#fff;text-transform:uppercase">${rich(t, YEL)}</div>`,
      text: (t) => `<div style="font-family:${osw};font-weight:600;font-size:${fit(t, 880, 160, 60, 34, { lh: 1.12, cw: 0.46 })}px;line-height:1.12;color:#fff">${rich(t, YEL)}</div>`,
      chip: (t) => `<span style="display:inline-block;padding:8px 32px;border-radius:14px;border:5px solid ${RED};background:rgba(255,45,61,0.14);font-family:${osw};font-weight:700;font-size:50px;letter-spacing:3px;color:#fff;white-space:nowrap">${rich(t)}</span>`,
      cta: (t) => `<span style="display:inline-block;padding:8px 40px;border-radius:14px;background:${YEL};font-family:${osw};font-weight:700;font-size:52px;letter-spacing:4px;color:${INK};white-space:nowrap">${esc(plain(t))}</span>`,
    };
    T.cover = (f, { S, D }, p) => {
      const lines = p.lines;
      const ats = lines.map((l, i) => cue(S, l.cue, spread(D, i, lines.length, 2)));
      const lastEnd = S && S.lines.length ? F1.line(S, S.lines.length - 1).end : D - 30;
      const cAt = cue(S, p.coverAt, Math.min(lastEnd + 4, D - 24));
      const items = lines
        .map((l, i) => {
          const r = Math.min(1, F1.ramp(f, ats[i] - 2, 12, F1.backOut));
          return `<div style="text-align:center;opacity:${n(Math.max(0, r), 3)};transform:translateY(${n((1 - r) * 30)}px) scale(${n(0.92 + 0.08 * r, 3)})">${STYLES[l.style](l.text)}</div>`;
        })
        .join("");
      const fp = F1.ramp(f, (ats.length ? ats[ats.length - 1] : 0) + 8, 14, F1.expoOut);
      const body =
        `<div style="position:absolute;left:100px;top:300px;width:880px;height:1120px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px">${items}
<div style="opacity:${n(fp, 3)};text-align:center"><span style="font-family:${mono};font-weight:700;font-size:26px;letter-spacing:3px;color:${GREY};white-space:nowrap">${esc(p.footer)}</span></div></div>`;
      // Title-only cover over the tail (TikTok "Select cover"); everything inside the centred 3:4 crop, y 240-1680.
      const cv = F1.ramp(f, cAt, 5);
      const c = p.cover;
      const cp = c.person;
      const ts = fit(c.title, 880, cp ? 400 : 520, cp ? 112 : 124, 60, { lh: 1.04, cw: 0.56 });
      // optional face (cover.person): same frame and grade as every other person card, credit along the bottom
      const face = cp ? `<div style="position:relative;width:300px;height:400px;flex:none">${person(cp, 0, 0, 300, 400)}</div>` : "";
      const faceCredit = cp && cp.credit ? `<div style="position:absolute;left:0;right:0;bottom:250px;text-align:center;opacity:0.6;font-family:${mono};font-weight:500;font-size:18px;color:#fff">Foto: ${esc(cp.credit)}</div>` : "";
      const overlay =
        cv <= 0
          ? ""
          : `<div style="position:absolute;inset:0;z-index:50;background:radial-gradient(ellipse 80% 55% at 50% 48%,#1b2132 0%,${INK} 80%);opacity:${n(cv, 3)};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${cp ? 30 : 40}px">${face}
<div style="padding:10px 26px;border:6px solid ${RED};border-radius:12px;transform:rotate(-5deg);font-family:${osw};font-weight:600;font-size:52px;letter-spacing:6px;color:${RED};white-space:nowrap">${esc(c.stamp)}</div>
<div style="width:900px;text-align:center;font-family:${osw};font-weight:700;font-size:${ts}px;line-height:1.04;letter-spacing:2px;color:#fff;text-transform:uppercase">${rich(c.title)}</div>
${c.chip ? `<div style="padding:6px 34px;border-radius:16px;background:${RED};font-family:${osw};font-weight:700;font-size:${fit(c.chip, 860, 110, 84, 40, { wrap: false })}px;letter-spacing:3px;color:#fff;white-space:nowrap;text-transform:uppercase">${esc(plain(c.chip))}</div>` : ""}${faceCredit}</div>`;
      return frame(f, D, p, body, { overlay });
    };

    const draw = (type, f, ctx, p) => T[type](f, ctx, p);
    return { draw, fit, rich, cue, parseNum, fmt, T };
  })();
}
