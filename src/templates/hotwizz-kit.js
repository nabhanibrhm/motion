/**
 * HotWizz Flash scene kit (browser side). Inlined by src/templates/hotwizz.mjs into every hw-* composition, so the
 * shared runtime and index.html stay unchanged. Defined once per page as F1.hw; every composition calls
 * F1.hw.draw(type, f, ctx, props) from its F1.scene render.
 *
 * Look (minimal redesign, 11 Nov 2026, user request): near-black ground, off-white type, ONE red for the key word or
 * fact; no yellow/orange, no navy cards. Photos are black-and-white, except the person quoted (hw-quote) in colour.
 * Interest comes from motion that feels "handled": a search bar that types and clicks, a highlighter sweep, ticked
 * checkboxes, a toggle that is tapped and snaps back to "?", monoline illustrations that draw themselves (hw-art),
 * and a story-style progress strip whose current segment fills across the whole scene.
 * The Indonesian flag is always solid #e70011 over #ffffff (never themed).
 *
 * Rules kept here: every value comes from the (possibly fractional, 60 fps) timeline frame f; no f % N, no timers,
 * no randomness; art stays between the progress strip (y 140) and y 1440, so the caption band (y ~1480-1650) and the
 * right ~120 px stay clear. Props arrive validated and normalised (cues are F1.at anchor specs or null, photos are
 * "public/..." paths or null).
 */
if (!F1.hw) {
  F1.hw = (() => {
    const n = F1.n;
    const esc = F1.esc;
    const BG = "#0b0b0c", TX = "#f2efe9", MU = "#8b8a86", DIM = "#5a5955", LN = "#2a2a2c", RED = "#ff2d3d";
    const FLAG_R = "#e70011", FLAG_W = "#ffffff";
    const mono = "'JetBrains Mono', monospace";
    const osw = "Oswald, sans-serif";
    const X0 = 72, WIDE = 888; // content column: x 72..960 (right 120 px clear)
    const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
    const lerp = (a, b, x) => a + (b - a) * x;
    const ramp = (f, at, d, e) => F1.ramp(f, at, d, e);

    /** Escape, then *accent* -> red span and \n -> line break. */
    const rich = (s, color = RED) =>
      esc(s)
        .replace(/\*(.+?)\*/g, (_, t) => `<span style="color:${color}">${t}</span>`)
        .replace(/\n/g, "<br>");
    /** *accent* -> words with a red underline drawn to u (0..1). */
    const underline = (s, u) =>
      esc(s)
        .replace(/\*(.+?)\*/g, (_, t) => `<span style="position:relative;white-space:nowrap">${t}<span style="position:absolute;left:0;bottom:-6px;height:7px;width:${n(100 * cl(u), 2)}%;background:${RED}"></span></span>`)
        .replace(/\n/g, "<br>");
    /** *accent* -> red highlighter sweeps, the k-th one at progress hs[k] (0..1). */
    const highlight = (s, hs) => {
      let k = 0;
      return esc(s)
        .replace(/\*(.+?)\*/g, (_, t) => {
          const w = cl(hs[k++] ?? 1);
          return `<span style="background:linear-gradient(${RED},${RED}) no-repeat 0 88%/${n(100 * w, 2)}% 84%;-webkit-box-decoration-break:clone;box-decoration-break:clone;padding:0 6px">${t}</span>`;
        })
        .replace(/\n/g, "<br>");
    };
    const accents = (s) => (String(s).match(/\*(.+?)\*/g) || []).map((x) => x.length - 2);
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
    const show = (p, dy = 30) => `opacity:${n(cl(p), 3)};transform:translateY(${n((1 - cl(p)) * dy)}px)`;
    /** Decaying horizontal shake (px) starting at `at`. */
    const shake = (f, at, len = 9, amp = 9) => (f > at && f < at + len ? Math.sin((f - at) * 2.2) * amp * (1 - (f - at) / len) : 0);

    // plain ground + faint scanlines
    const bg = () =>
      `<div style="position:absolute;inset:0;background:${BG}"></div>` +
      `<div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,0.018) 0 2px,transparent 2px 5px)"></div>`;

    /** Story-style progress strip: done segments white, the current one fills red across the whole scene. */
    const strip = (f, D, p) => {
      const CASE = F1.cine.CASE;
      const fill = cl(f / Math.max(1, D - 1));
      const seg = Array.from({ length: CASE.steps }, (_, i) => {
        const w = i + 1 < p.step ? 1 : i + 1 === p.step ? fill : 0;
        return `<div style="flex:1;height:5px;border-radius:3px;background:${LN};overflow:hidden"><div style="width:${n(100 * w, 2)}%;height:100%;background:${i + 1 === p.step ? RED : TX}"></div></div>`;
      }).join("");
      return `<div style="position:absolute;left:${X0}px;top:140px;width:${WIDE}px">
<div style="font-family:${mono};font-weight:600;font-size:22px;letter-spacing:3px;color:${MU};white-space:nowrap">${esc(CASE.id)} <span style="color:${TX}">· ${esc(p.label)}</span></div>
<div style="display:flex;gap:8px;margin-top:14px">${seg}</div></div>`;
    };

    /** Scene frame: camera stage, progress strip, then overlays (not zoomed). */
    const frame = (f, D, p, body, { whip = true, overlay = "" } = {}) =>
      F1.join(F1.cine.stage(f, D, bg() + body, { whip, zoom: 0.02, ox: 50, oy: 48 }), F1.cine.vignette(0.25, "50% 50%", 55), strip(f, D, p), overlay);

    const kicker = (text, color = MU) =>
      `<div style="font-family:${mono};font-weight:600;font-size:26px;letter-spacing:3px;color:${color};white-space:nowrap"><span style="color:${RED}">●</span> ${esc(text)}</div>`;
    const sourceLine = (text, size = 21) =>
      text ? `<div style="font-family:${mono};font-weight:500;font-size:${size}px;letter-spacing:0.5px;line-height:1.3;color:${MU}">Sumber: ${esc(text)}</div>` : "";
    const credit = (text, x, y, w, align = "left") =>
      text ? `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;text-align:${align};font-family:${mono};font-weight:500;font-size:17px;line-height:1.3;color:${DIM}">Foto: ${esc(text)}</div>` : "";

    /** Identical treatment for every person: same frame, same grade; a silhouette when there is no photo. */
    const silhouette = () =>
      `<svg width="100%" height="100%" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0"><rect width="300" height="400" fill="#1c1c1e"/><circle cx="150" cy="150" r="66" fill="#3a3a3d"/><path d="M10 400 Q10 270 95 252 Q150 290 205 252 Q290 270 290 400 Z" fill="#3a3a3d"/></svg>`;
    const GRADE_BW = "grayscale(1) contrast(1.12) brightness(0.95)";
    const person = (o, x, y, w, h, { bw = true, radius = 28, push = 1, clip = 1, pos = "50% 20%", border = "none" } = {}) =>
      `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${radius}px;overflow:hidden;background:#1c1c1e;border:${border};box-sizing:border-box;clip-path:inset(0 0 ${n(100 * (1 - clip), 2)}% 0 round ${radius}px)">${
        o.photo
          ? `<img src=${JSON.stringify(o.photo)} alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${pos};filter:${bw ? GRADE_BW : "saturate(0.95) contrast(1.05)"};transform:scale(${n(push, 4)})">`
          : silhouette()
      }</div>`;

    /** Red outline stamp that slams in (scale 1.7 -> 1) at `at`. */
    const stampBox = (f, at, text, x, y, size = 56, rot = -7) => {
      const p = ramp(f, at, 6);
      if (p <= 0) return "";
      return `<div style="position:absolute;left:${x}px;top:${y}px;padding:6px 22px;border:6px solid ${RED};border-radius:12px;font-family:${osw};font-weight:700;font-size:${size}px;letter-spacing:4px;color:${RED};white-space:nowrap;opacity:${n(cl(p * 2), 3)};transform:rotate(${rot}deg) scale(${n(lerp(1.7, 1, p * p), 3)});transform-origin:50% 50%">${esc(text)}</div>`;
    };
    const cursor = (x, y, s = 1) =>
      `<svg style="position:absolute;left:${n(x)}px;top:${n(y)}px;transform:scale(${n(s, 3)});transform-origin:0 0" width="54" height="70" viewBox="0 0 27 35"><path d="M2 2 L2 28 L9 21 L14 33 L19 31 L14 19 L24 19 Z" fill="${TX}" stroke="${BG}" stroke-width="2" stroke-linejoin="round"/></svg>`;
    const ripple = (f, at, x, y) => {
      const p = ramp(f, at, 14);
      if (p <= 0 || p >= 1) return "";
      const r = lerp(20, 110, 1 - Math.pow(1 - p, 3));
      return `<div style="position:absolute;left:${n(x - r)}px;top:${n(y - r)}px;width:${n(2 * r)}px;height:${n(2 * r)}px;border-radius:50%;border:4px solid ${TX};opacity:${n(0.7 * (1 - p), 3)}"></div>`;
    };
    const finger = (x, y, press, a) =>
      `<div style="position:absolute;left:${n(x - 34)}px;top:${n(y - 34)}px;width:68px;height:68px;border-radius:50%;opacity:${n(a, 3)};background:rgba(242,239,233,${n(0.55 + 0.3 * press, 3)});transform:scale(${n(1 - 0.18 * press, 3)});box-shadow:0 0 0 10px rgba(242,239,233,0.12)"></div>`;
    const check = (p, size = 56, color = BG) =>
      `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5 L9.5 18 L20 6.5" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${n(1 - cl(p), 3)}"/></svg>`;

    const T = {};

    /* ---------------------------------------------------------------- hw-hook: search bar -> result (photo + claim) */
    T.hook = (f, { S, D }, p) => {
      const at = cue(S, p.cue, null);
      const P = p.person;
      const t0 = p.introCover ? 21 : 0;
      const q = p.search ? String(p.search) : "";
      const typeAt = t0 + 2, typeLen = Math.max(10, q.length * 0.9), sentAt = typeAt + typeLen + 7;
      const live = !!(q || p.introCover); // without either, everything is already visible at frame 0
      const resAt = q ? sentAt + 2 : t0 - 9;
      const R = (d, len, e = F1.expoOut) => (live ? ramp(f, resAt + d, len, e) : 1);
      let top = "";
      if (q) {
        const bar = ramp(f, Math.max(0, t0 - 8), 9, F1.expoOut);
        const k = Math.floor(cl((f - typeAt) / typeLen) * q.length);
        const sent = f >= sentAt;
        const caret = sent ? 0 : f > typeAt && f < typeAt + typeLen ? 1 : Math.sin(f / 2.4) > 0 ? 1 : 0;
        top =
          `<div style="position:absolute;left:${X0}px;top:232px;width:${WIDE}px;height:104px;border-radius:52px;border:3px solid ${sent ? RED : TX};box-sizing:border-box;display:flex;align-items:center;padding:0 40px;gap:26px;opacity:${n(bar, 3)};transform:scaleX(${n(lerp(0.6, 1, bar), 3)});transform-origin:0 50%">
<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="${TX}" stroke-width="2.6" style="flex:none"><circle cx="10" cy="10" r="7"/><path d="M15.5 15.5 L22 22"/></svg>
<div style="font-family:${mono};font-weight:500;font-size:${fit(q, 720, 60, 44, 28, { wrap: false, cw: 0.6 })}px;color:${TX};white-space:nowrap">${esc(q.slice(0, k))}<span style="display:inline-block;width:4px;height:48px;background:${RED};vertical-align:-8px;margin-left:6px;opacity:${caret}"></span></div></div>`;
        const cm = ramp(f, sentAt - 14, 13, F1.easeOut), press = ramp(f, sentAt - 1, 1) * (1 - ramp(f, sentAt + 1, 3));
        const ca = ramp(f, sentAt - 16, 4) * (1 - ramp(f, sentAt + 14, 10));
        if (ca > 0) top += `<div style="opacity:${n(ca, 3)}">${cursor(lerp(990, 870, cm), lerp(780, 268, cm), 1 - 0.15 * press)}</div>`;
        top += ripple(f, sentAt, 890, 286);
      } else {
        top = `<div style="position:absolute;left:${X0}px;top:250px;width:${WIDE}px;${show(R(0, 10), 16)}"><div style="font-family:${mono};font-weight:700;font-size:34px;letter-spacing:5px;color:${TX};white-space:nowrap"><span style="color:${RED}">●</span> ${esc(p.kicker)}</div></div>`;
      }
      const PY = 380, PH = 620;
      const label = [q ? p.kicker : null, p.tag].filter(Boolean).join(" · ");
      const hs = fit(p.headline, WIDE, 270, 136, 64, { lh: 1.0, wrap: false, cw: 0.5 });
      const cs = fit(p.claim, WIDE, 120, 60, 34, { lh: 1.1, cw: 0.46 });
      const pop = at === null ? 1 : 1 + 0.05 * Math.sin(Math.PI * ramp(f, at, 12));
      const ns = fit(P.name, 760, 110, 52, 30, { lh: 1.04, cw: 0.5 });
      const body =
        // person card first so its <img> keeps its DOM slot from frame 0
        person(P, X0, PY, WIDE, PH, { clip: R(0, 14), push: 1 + 0.06 * cl((f - Math.max(0, resAt)) / Math.max(1, D)) }) +
        `<div style="position:absolute;left:${X0}px;top:${PY}px;width:${WIDE}px;height:${PH}px;border-radius:28px;background:linear-gradient(180deg,rgba(11,11,12,0) 45%,rgba(11,11,12,0.88));opacity:${n(R(0, 14), 3)}"></div>
<div style="position:absolute;left:${X0 + 36}px;top:${PY}px;width:780px;height:${PH - 34}px;display:flex;flex-direction:column;justify-content:flex-end;gap:8px;${show(R(6, 10), 16)}">
<div style="font-family:${osw};font-weight:700;font-size:${ns}px;line-height:1.04;color:${TX};text-transform:uppercase">${esc(plain(P.name))}</div>
${P.role ? `<div style="font-family:${mono};font-weight:500;font-size:23px;color:#c9c6c0">${esc(P.role)}</div>` : ""}
${label ? `<div style="margin-top:6px;font-family:${mono};font-weight:600;font-size:24px;letter-spacing:3px;color:${TX};white-space:nowrap"><span style="color:${RED}">●</span> ${esc(label)}</div>` : ""}</div>` +
        (P.status ? `<div style="position:absolute;left:${X0 + 30}px;top:${PY + 28}px;padding:6px 14px;border-radius:8px;background:${TX};font-family:${mono};font-weight:700;font-size:24px;letter-spacing:3px;color:${BG};${show(R(6, 10), 10)}">${esc(P.status)}</div>` : "") +
        `<div style="opacity:${n(R(6, 10), 3)}">${credit(P.credit, X0 + 300, PY + 14, WIDE - 330, "right")}</div>` +
        `<div style="position:absolute;left:${X0 - 4}px;top:1030px;width:${WIDE + 8}px;font-family:${osw};font-weight:700;font-size:${hs}px;line-height:1.0;letter-spacing:1px;color:${TX};white-space:nowrap;text-transform:uppercase;transform-origin:0 60%;transform:scale(${n(pop, 3)})">${plain(p.headline)
          .split("\n")
          .map((l, i) => `<div style="${show(R(8 + 5 * i, 11, F1.backOut), 60)}">${rich(p.headline.split("\n")[i])}</div>`)
          .join("")}</div>
<div style="position:absolute;left:${X0}px;top:${1030 + Math.ceil(hs * plain(p.headline).split("\n").length) + 28}px;width:${WIDE}px;font-family:${osw};font-weight:500;font-size:${cs}px;line-height:1.1;color:${TX};${show(R(20, 10), 20)}">${underline(p.claim, live ? ramp(f, resAt + 28, 14, F1.easeOut) : 1)}</div>` +
        (p.stamp ? stampBox(f, cue(S, p.stamp.cue, 0), p.stamp.text, 600, PY + 60, 54) : "") +
        top;
      // introCover: hold the cover card (= the last frame) for ~0.5 s, then fade to the hook layout over 6 frames
      const overlay = p.introCover ? coverCard(p.introCover, 1 - F1.ramp(f, 15, 6)) : "";
      return frame(f, D, p, body, { whip: false, overlay });
    };

    /* ---------------------------------------------------------------- hw-resmi: 2-4 confirmed facts, ticked */
    T.resmi = (f, { S, D }, p) => {
      const items = p.items;
      const top = 470, bottom = 1440;
      const h = Math.min(290, Math.floor((bottom - top) / items.length));
      const ats = items.map((it, i) => cue(S, it.cue, spread(D, i, items.length)));
      let active = -1;
      ats.forEach((a, i) => { if (f >= a) active = i; });
      const ts = Math.min(...items.map((it) => fit(it.text, 760, h - 96, 60, 30, { lh: 1.12, cw: 0.46 })));
      const rows = items.map((it, i) => {
        const r = ramp(f, ats[i], 10, F1.expoOut);
        if (r <= 0) return "";
        const tick = ramp(f, ats[i] + 5, 8, F1.easeOut), b = ramp(f, ats[i] + 3, 10, F1.backOut);
        const hot = i === active;
        return `<div style="position:absolute;left:${X0}px;top:${top + i * h}px;width:${WIDE}px;height:${h}px;border-top:2px solid ${LN};${show(r, 40)}">
<div style="position:absolute;left:0;top:30px;width:84px;height:84px;border-radius:16px;background:${TX};display:flex;align-items:center;justify-content:center;transform:scale(${n(lerp(0.6, 1, b), 3)})">${check(tick)}</div>
<div style="position:absolute;left:120px;top:24px;width:760px;height:${h - 96}px;display:flex;align-items:center;font-family:${osw};font-weight:500;font-size:${ts}px;line-height:1.12;color:${hot ? TX : "#c9c6c0"}"><div>${rich(it.text)}</div></div>
<div style="position:absolute;left:120px;bottom:22px;width:760px">${sourceLine(it.source)}</div></div>`;
      });
      const tp = ramp(f, 0, 10, F1.expoOut);
      const body =
        `<div style="position:absolute;left:${X0}px;top:250px;width:${WIDE}px;${show(tp, 20)}">${kicker(p.kicker)}<div style="margin-top:8px;font-family:${osw};font-weight:700;font-size:${fit(p.title, WIDE, 120, 104, 56, { wrap: false })}px;line-height:1.05;letter-spacing:1px;color:${TX};white-space:nowrap;text-transform:uppercase">${rich(p.title)}</div></div>` +
        rows.join("");
      return frame(f, D, p, body);
    };

    /* ---------------------------------------------------------------- hw-split: RESMI vs BELUM JELAS (or two sides) */
    T.split = (f, { S, D }, p) => {
      // RESMI/BELUM JELAS gets ticks vs red "?"; any other pair (two parties) gets the same neutral mark on both sides
      const facts = p.left.title === "RESMI" && p.right.title === "BELUM JELAS";
      const tg = p.toggle;
      const rows = [...p.left.items.map((it) => [0, it]), ...p.right.items.map((it) => [1, it])];
      const ats = rows.map(([, it], i) => cue(S, it.cue, spread(D, i, rows.length, tg ? 84 : 6)));
      const headTop = 250;
      const hs = p.headline ? fit(p.headline, WIDE, 200, 96, 48, { lh: 1.02, cw: 0.5 }) : 0;
      const hRows = p.headline ? Math.max(1, Math.ceil((plain(p.headline).length * 0.5 * hs * 1.1) / WIDE)) + (plain(p.headline).match(/\n/g) || []).length : 0;
      const afterHead = headTop + 46 + Math.ceil(hs * 1.02 * hRows) + 40;
      const tgTop = afterHead, listTop = tg ? afterHead + 190 : afterHead + 10, bottom = p.source ? 1396 : 1440;
      const h = Math.min(260, Math.floor((bottom - listTop) / rows.length));
      const ts = Math.min(...rows.map(([, it]) => fit(it.text, 760, h - 92, 58, 28, { lh: 1.12, cw: 0.46 })));
      let html = "";
      if (tg) {
        const a = ramp(f, 10, 10, F1.expoOut);
        const toL = ramp(f, 30, 10, F1.easeOut), toR = ramp(f, 46, 15, F1.easeOut), home = ramp(f, 66, 10, F1.backOut);
        const span = 156;
        let kx = -span * toL;
        kx = lerp(kx, span, toR);
        kx = lerp(kx, 0, home);
        const side = kx < -40 ? "L" : kx > 40 ? "R" : "";
        const sx = shake(f, 75, 11, 10);
        const lab = (s, on) => `<div style="width:220px;text-align:${on === "L" ? "left" : "right"};font-family:${osw};font-weight:700;font-size:${fit(s, 220, 70, 54, 30, { wrap: false })}px;color:${side === on ? TX : MU};white-space:nowrap;text-transform:uppercase">${esc(s)}</div>`;
        html += `<div style="position:absolute;left:${X0}px;top:${tgTop}px;width:${WIDE}px;height:120px;display:flex;align-items:center;justify-content:space-between;opacity:${n(a, 3)}">${lab(tg.left, "L")}
<div style="position:relative;width:420px;height:120px;border-radius:60px;border:4px solid ${side ? TX : RED};box-sizing:border-box;transform:translateX(${n(sx)}px)"><div style="position:absolute;left:${n(152 + kx)}px;top:2px;width:108px;height:108px;border-radius:50%;background:${side ? TX : RED};display:flex;align-items:center;justify-content:center;font-family:${osw};font-weight:700;font-size:72px;line-height:1;color:${BG}">${side ? "" : "?"}</div></div>${lab(tg.right, "R")}</div>`;
        const fa = ramp(f, 22, 6) * (1 - ramp(f, 64, 8));
        if (fa > 0) {
          const press = ramp(f, 27, 3) * (1 - ramp(f, 62, 3));
          html += finger(540 + (f < 66 ? kx : 0), tgTop + 60 + lerp(60, 0, ramp(f, 22, 6, F1.easeOut)), press, fa);
        }
        html += ripple(f, 28, 540, tgTop + 60);
      }
      html += rows
        .map(([k, it], i) => {
          const r = ramp(f, ats[i], 10, F1.expoOut);
          if (r <= 0) return "";
          const b = ramp(f, ats[i] + 3, 10, F1.backOut), tick = ramp(f, ats[i] + 5, 8, F1.easeOut);
          const sideTitle = k === 0 ? p.left.title : p.right.title;
          const box = facts
            ? k === 0
              ? `background:${TX}">${check(tick)}`
              : `border:4px solid ${RED};box-sizing:border-box;font-family:${osw};font-weight:700;font-size:58px;color:${RED}"><span style="display:inline-block;transform:scale(${n(b, 3)})">?</span>`
            : `border:4px solid ${TX};box-sizing:border-box;font-family:${osw};font-weight:700;font-size:72px;line-height:1;padding-top:22px;color:${TX}">“`;
          return `<div style="position:absolute;left:${X0}px;top:${listTop + i * h}px;width:${WIDE}px;height:${h}px;border-top:2px solid ${LN};${show(r, 40)}">
<div style="position:absolute;left:0;top:30px;width:84px;height:84px;border-radius:16px;display:flex;align-items:center;justify-content:center;transform:scale(${n(lerp(0.6, 1, b), 3)});${box}</div>
<div style="position:absolute;left:120px;top:24px;width:760px;height:${h - 92}px;display:flex;align-items:center;font-family:${osw};font-weight:500;font-size:${ts}px;line-height:1.12;color:${TX}"><div>${rich(it.text)}</div></div>
<div style="position:absolute;left:120px;bottom:20px;width:760px;font-family:${mono};font-weight:500;font-size:21px;letter-spacing:1px;color:${MU};white-space:nowrap;overflow:hidden">${esc(sideTitle)}${it.source ? ` · ${esc(it.source)}` : ""}</div></div>`;
        })
        .join("");
      const tp = ramp(f, 0, 10, F1.expoOut);
      const words = p.headline ? p.headline.split(/(?<=\s)/) : [];
      const body =
        `<div style="position:absolute;left:${X0}px;top:${headTop}px;width:${WIDE}px">${`<div style="${show(tp, 16)}">${kicker(p.kicker)}</div>`}${
          p.headline
            ? `<div style="margin-top:10px;font-family:${osw};font-weight:700;font-size:${hs}px;line-height:1.02;letter-spacing:1px;color:${TX};text-transform:uppercase">${words
                .map((w, i) => `<span style="display:inline-block;white-space:pre;${show(ramp(f, 2 + 3 * i, 9, F1.backOut), 50)}">${rich(w)}</span>`)
                .join("")}</div>`
            : ""
        }</div>` +
        html +
        (p.source ? `<div style="position:absolute;left:${X0}px;top:1404px;width:${WIDE}px">${sourceLine(p.source, 19)}</div>` : "");
      return frame(f, D, p, body);
    };

    /* ---------------------------------------------------------------- hw-quote: colour portrait + highlighter */
    T.quote = (f, { S, D }, p) => {
      const P = p.person;
      const at = cue(S, p.cue, 6);
      const pin = ramp(f, 0, 12, F1.expoOut);
      const q = ramp(f, at, 12, F1.expoOut);
      const ns = fit(P.name, 640, 150, 66, 36, { lh: 1.04, cw: 0.5 });
      const qs = fit(p.quote, WIDE, 620, 84, 40, { lh: 1.22, cw: 0.44 });
      // each *accent* gets a red highlighter sweep, one after another, from 14 frames after the quote lands
      let t = at + 14;
      const hs = accents(p.quote).map((len) => {
        const d = 10 + len * 0.6, v = ramp(f, t, d, F1.easeOut);
        t += d + 4;
        return v;
      });
      const body =
        person(P, X0, 240, 200, 200, { bw: false, radius: 100, pos: "50% 18%", border: `4px solid ${TX}` }) +
        `<div style="position:absolute;left:310px;top:250px;width:650px;${show(pin, 20)}">${kicker(p.kicker)}
<div style="margin-top:10px;font-family:${osw};font-weight:700;font-size:${ns}px;line-height:1.04;color:${TX};text-transform:uppercase">${esc(plain(P.name))}</div>
${P.role ? `<div style="margin-top:8px;font-family:${mono};font-weight:500;font-size:23px;line-height:1.3;color:#c9c6c0">${esc(P.role)}</div>` : ""}</div>
<div style="position:absolute;left:${X0}px;top:470px;font-family:${osw};font-weight:700;font-size:220px;line-height:1;color:${RED};${show(q, 20)}">“</div>
<div style="position:absolute;left:${X0}px;top:660px;width:${WIDE}px;height:620px;font-family:${osw};font-weight:500;font-size:${qs}px;line-height:1.22;color:${TX};${show(q, 30)}">${highlight(p.quote, hs)}</div>
<div style="position:absolute;left:${X0}px;top:1312px;width:${WIDE}px;height:2px;background:${LN};opacity:${n(q, 3)}"></div>
<div style="position:absolute;left:${X0}px;top:1334px;width:${WIDE}px;${show(q, 10)}">${sourceLine(p.date ? `${p.source}, ${p.date}` : p.source)}${P.credit ? `<div style="margin-top:6px;font-family:${mono};font-weight:500;font-size:17px;color:${DIM}">Foto: ${esc(P.credit)}</div>` : ""}</div>`;
      return frame(f, D, p, body);
    };

    /* ---------------------------------------------------------------- hw-number: odometer number + caption + source */
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
      const r = ramp(f, at, 26, F1.expoOut);
      const num = p.countUp ? parseNum(p.value) : null;
      const shown = num ? `${num.pre}${fmt(num.value * r, num.dec)}${num.post}` : p.value;
      const vs = fit(p.value, WIDE, 320, 300, 90, { lh: 1, wrap: false, cw: 0.52 });
      const ls = fit(p.caption, WIDE, 260, 66, 34, { lh: 1.1, cw: 0.47 });
      const land = ramp(f, at + 22, 10, F1.backOut), line = ramp(f, at + 24, 12, F1.easeOut);
      const body =
        `<div style="position:absolute;left:${X0}px;top:250px;width:${WIDE}px;${show(ramp(f, 0, 10, F1.expoOut), 16)}">${kicker(p.kicker)}</div>
<div style="position:absolute;left:${X0}px;top:420px;width:${WIDE}px;height:560px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;opacity:${n(cl(r * 3), 3)}">
<div style="font-family:${osw};font-weight:700;font-size:${vs}px;line-height:1;letter-spacing:2px;color:${TX};white-space:nowrap;font-variant-numeric:tabular-nums;transform:scale(${n(1 + 0.05 * Math.sin(Math.PI * cl(land)), 3)})">${esc(shown)}</div>
<div style="width:${n(420 * line)}px;height:8px;background:${RED};margin-top:16px"></div>
${p.unit ? `<div style="margin-top:20px;font-family:${osw};font-weight:700;font-size:${fit(p.unit, WIDE - 60, 100, 84, 36, { wrap: false })}px;letter-spacing:4px;color:${RED};white-space:nowrap;text-transform:uppercase">${esc(p.unit)}</div>` : ""}</div>
<div style="position:absolute;left:${X0}px;top:1010px;width:${WIDE}px;height:280px;display:flex;align-items:center;justify-content:center;text-align:center;${show(ramp(f, at + 10, 16, F1.expoOut), 24)};font-family:${osw};font-weight:500;font-size:${ls}px;line-height:1.1;color:${TX}"><div>${rich(p.caption)}</div></div>
<div style="position:absolute;left:${X0}px;top:1330px;width:${WIDE}px;text-align:center;${show(ramp(f, at + 16, 14), 10)}">${sourceLine(p.source)}</div>`;
      return frame(f, D, p, body);
    };

    /* ---------------------------------------------------------------- hw-art: monoline illustration that draws itself */
    // Every icon: viewBox 0 0 800 580, off-white strokes, one red detail; d(k) = draw progress of the k-th stroke.
    const S_ = `fill="none" stroke="${TX}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"`;
    const R_ = `fill="none" stroke="${RED}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"`;
    const dr = (p) => `pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${n(1 - cl(p), 3)}"`;
    const flag = (f, at, x, y0, y1) => {
      const p = ramp(f, at, 18, F1.easeOut), y = lerp(y0, y1, p), a = n(cl(p * 3), 3);
      return `<rect x="${x}" y="${n(y)}" width="70" height="22" fill="${FLAG_R}" opacity="${a}"/><rect x="${x}" y="${n(y + 22)}" width="70" height="22" fill="${FLAG_W}" opacity="${a}"/>`;
    };
    const ICONS = {
      istana: (f, d) => {
        let cols = "";
        for (let i = 0; i < 8; i++) cols += `<line ${S_} x1="${150 + i * 72}" y1="300" x2="${150 + i * 72}" y2="470" ${dr(d(3 + i))}/>`;
        return `<line ${S_} x1="20" y1="520" x2="780" y2="520" ${dr(d(0))}/><path ${S_} d="M90 520 V500 H710 V520 M110 500 V482 H690 V500" ${dr(d(1))}/><path ${S_} d="M120 482 V470 H680 V482" ${dr(d(2))}/>${cols}
<path ${S_} d="M110 300 H690 V272 H110 Z" ${dr(d(11))}/><path ${S_} d="M130 272 L400 170 L670 272" ${dr(d(12))}/><circle ${S_} cx="400" cy="232" r="18" ${dr(d(13))}/><line ${S_} x1="400" y1="170" x2="400" y2="40" ${dr(d(13))}/>${flag(f, 33, 402, 150, 44)}`;
      },
      dpr: (f, d) =>
        `<line ${S_} x1="20" y1="520" x2="780" y2="520" ${dr(d(0))}/><path ${S_} d="M80 520 V380 H720 V520" ${dr(d(1))}/><path ${S_} d="M60 380 H740" ${dr(d(2))}/>
${[0, 1, 2, 3, 4, 5, 6].map((i) => `<line ${S_} x1="${150 + i * 83}" y1="400" x2="${150 + i * 83}" y2="500" ${dr(d(3 + i * 0.5))}/>`).join("")}
<path ${S_} d="M170 380 Q290 190 400 300" ${dr(d(7))}/><path ${S_} d="M630 380 Q510 190 400 300" ${dr(d(7.5))}/><path ${S_} d="M220 380 Q300 260 400 330 Q500 260 580 380" ${dr(d(8.5))}/>
<line ${S_} x1="700" y1="380" x2="700" y2="150" ${dr(d(9))}/>${flag(f, 32, 702, 270, 154)}`,
      gavel: (f, d) => {
        const sw = f < 30 ? lerp(28, 42, ramp(f, 15, 15, F1.easeOut)) : lerp(42, 0, Math.pow(ramp(f, 30, 5), 2));
        const hit = ramp(f, 35, 10), sh = shake(f, 35, 7, 6);
        const lines = [[-1, -0.5], [-1, 0.15], [1, -0.5], [1, 0.15]]
          .map(([dx, dy]) => {
            const r0 = 90 + 50 * (1 - Math.pow(1 - hit, 3)), r1 = r0 + 55;
            return `<line ${R_} x1="${n(385 + dx * r0)}" y1="${n(440 + dy * r0)}" x2="${n(385 + dx * r1)}" y2="${n(440 + dy * r1)}" opacity="${hit > 0 ? n(1 - hit, 3) : 0}"/>`;
          })
          .join("");
        return `<g transform="translate(0 ${n(sh)})"><line ${S_} x1="80" y1="520" x2="720" y2="520" ${dr(d(0))}/><path ${S_} d="M300 520 V470 Q300 450 320 450 H580 Q600 450 600 470 V520" ${dr(d(1))}/>
<g transform="rotate(${n(sw, 2)} 680 340)" opacity="${n(ramp(f, 9, 6), 3)}"><path ${S_} stroke-width="14" d="M440 362 L680 340"/><rect ${S_} x="330" y="276" width="110" height="170" rx="16" transform="rotate(-5 385 361)"/><line ${S_} x1="334" y1="320" x2="442" y2="311"/><line ${S_} x1="342" y1="410" x2="450" y2="401"/></g>${lines}</g>`;
      },
      dokumen: (f, d) => {
        let rows = "";
        for (let i = 0; i < 6; i++) {
          const w = [180, 270, 230, 270, 270, 150][i], a = ramp(f, 13 + i * 2, 9, F1.easeOut);
          if (a > 0) rows += `<line ${S_} stroke-width="4" x1="270" y1="${190 + i * 46}" x2="${n(270 + w * a)}" y2="${190 + i * 46}"/>`;
        }
        return `<path ${S_} d="M230 80 H500 L570 150 V520 H230 Z" ${dr(d(0))}/><path ${S_} d="M500 80 V150 H570" ${dr(d(1))}/>${rows}<circle ${R_} cx="490" cy="460" r="30" ${dr(d(4))}/>`;
      },
      "kotak-suara": (f, d) => {
        const drop = ramp(f, 28, 12, F1.easeOut);
        return `<line ${S_} x1="80" y1="520" x2="720" y2="520" ${dr(d(0))}/><path ${S_} d="M220 250 H580 V520 H220 Z" ${dr(d(1))}/><path ${S_} d="M220 250 L300 190 H660 L580 250 M660 190 V460 L580 520" ${dr(d(2))}/>
<path ${S_} d="M340 222 H500" stroke-width="10" ${dr(d(3))}/><g opacity="${n(cl(ramp(f, 22, 4)) * (1 - ramp(f, 40, 4)), 3)}" transform="translate(0 ${n(lerp(0, 130, drop))})"><path ${S_} d="M370 40 H470 V200 H370 Z" fill="${BG}"/><path ${R_} d="M390 110 L415 135 L455 85"/></g>
<path ${S_} d="M330 340 H470 M330 390 H430" ${dr(d(5))}/>`;
      },
      uang: (f, d) =>
        `<line ${S_} x1="80" y1="520" x2="720" y2="520" ${dr(d(0))}/>
${[0, 1, 2].map((i) => `<rect ${S_} x="${170 + i * 24}" y="${300 - i * 60}" width="420" height="200" rx="18" fill="${BG}" ${dr(d(1 + i))}/>`).join("")}
<circle ${S_} cx="428" cy="280" r="52" ${dr(d(4))}/><text x="428" y="300" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="58" fill="${RED}" opacity="${n(ramp(f, 22, 6), 3)}">Rp</text>
<path ${S_} d="M260 200 H300 M556 360 H596" ${dr(d(5))}/>`,
      hp: (f, d) => {
        const bub = (i, y, w) => {
          const p = ramp(f, 20 + i * 7, 8, F1.backOut);
          return p > 0 ? `<g transform="translate(400 ${y}) scale(${n(p, 3)}) translate(-400 ${-y})" opacity="${n(cl(p), 3)}"><rect ${S_} x="${400 - w / 2}" y="${y - 30}" width="${w}" height="60" rx="18" stroke-width="4"/></g>` : "";
        };
        const badge = ramp(f, 40, 8, F1.backOut);
        return `<rect ${S_} x="270" y="40" width="260" height="500" rx="36" ${dr(d(0))}/><line ${S_} x1="360" y1="76" x2="440" y2="76" ${dr(d(1))}/>${bub(0, 170, 190)}${bub(1, 260, 150)}${bub(2, 350, 200)}
<circle cx="520" cy="52" r="${n(26 * badge, 2)}" fill="${RED}"/>`;
      },
      kalender: (f, d) => {
        let cells = "";
        for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) cells += `<rect ${S_} stroke-width="3" x="${208 + c * 66}" y="${232 + r * 66}" width="46" height="46" rx="8" ${dr(d(2 + (r * 6 + c) * 0.18))}/>`;
        return `<rect ${S_} x="180" y="120" width="440" height="420" rx="26" ${dr(d(0))}/><line ${S_} x1="180" y1="200" x2="620" y2="200" ${dr(d(1))}/><path ${S_} d="M280 90 V150 M520 90 V150" ${dr(d(1))}/>${cells}
<circle ${R_} cx="${208 + 3 * 66 + 23}" cy="${232 + 1 * 66 + 23}" r="44" ${dr(ramp(f, 30, 12, F1.easeOut))}/>`;
      },
    };
    T.art = (f, { S, D }, p) => {
      const at = cue(S, p.cue, 27);
      const d = (k) => ramp(f, 1 + k * 2, 15, F1.easeOut);
      const icon = ICONS[p.art] || ICONS.dokumen;
      const push = 1 + 0.04 * cl(f / Math.max(1, D));
      const st = p.stamp ? ramp(f, at + 9, 6) : 0;
      const stamp = st > 0
        ? `<g transform="translate(400 330) rotate(-12) scale(${n(lerp(1.8, 1, st * st), 3)})" opacity="${n(cl(st * 2), 3)}"><rect x="${-(plain(p.stamp).length * 21 + 50)}" y="-58" width="${plain(p.stamp).length * 42 + 100}" height="116" rx="12" fill="${BG}" fill-opacity="0.6" stroke="${RED}" stroke-width="10"/><text x="0" y="22" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="62" letter-spacing="4" fill="${RED}">${esc(plain(p.stamp))}</text></g>`
        : "";
      const sx = p.stamp ? shake(f, at + 15, 7, 5) : 0;
      const hs = fit(p.headline, WIDE, 270, 120, 56, { lh: 1.02, cw: 0.5 });
      const hl = p.headline.split("\n");
      const body =
        `<div style="position:absolute;left:96px;top:250px;width:888px;height:640px;transform:translateX(${n(sx)}px) scale(${n(push, 4)});transform-origin:50% 80%"><svg width="888" height="640" viewBox="0 0 800 580">${icon(f, d)}${stamp}</svg></div>
<div style="position:absolute;left:${X0}px;top:912px;font-family:${mono};font-weight:600;font-size:18px;letter-spacing:2px;color:${DIM}">ILUSTRASI</div>
<div style="position:absolute;left:${X0}px;top:960px;width:${WIDE}px;${show(ramp(f, at - 6, 9, F1.expoOut), 20)}">${kicker(p.kicker)}</div>
<div style="position:absolute;left:${X0 - 4}px;top:1004px;width:${WIDE + 8}px;font-family:${osw};font-weight:700;font-size:${hs}px;line-height:1.02;letter-spacing:1px;color:${TX};text-transform:uppercase">${hl
          .map((l, i) => `<div style="${show(ramp(f, at + 4 * i, 11, F1.backOut), 50)}">${rich(l)}</div>`)
          .join("")}</div>` +
        (p.sub ? `<div style="position:absolute;left:${X0}px;top:${1004 + Math.ceil(hs * 1.02 * hl.length) + 26}px;width:${WIDE}px;font-family:${osw};font-weight:500;font-size:${fit(p.sub, WIDE, 70, 52, 30, { wrap: false, cw: 0.46 })}px;color:${TX};white-space:nowrap;${show(ramp(f, at + 12, 10), 20)}">${rich(p.sub)}</div>` : "") +
        (p.source ? `<div style="position:absolute;left:${X0}px;top:1404px;width:${WIDE}px;${show(ramp(f, at + 16, 10), 10)}">${sourceLine(p.source, 19)}</div>` : "");
      return frame(f, D, p, body);
    };

    /* ---------------------------------------------------------------- hw-cover: end card, then title-only cover */
    const STYLES = {
      kicker: (t) => `<span style="font-family:${mono};font-weight:600;font-size:34px;letter-spacing:8px;color:${MU}">${rich(t)}</span>`,
      big: (t) => `<div style="font-family:${osw};font-weight:700;font-size:${fit(t, 880, 200, 96, 44, { lh: 1.06 })}px;line-height:1.06;letter-spacing:1px;color:${TX};text-transform:uppercase">${rich(t)}</div>`,
      text: (t) => `<div style="font-family:${osw};font-weight:500;font-size:${fit(t, 880, 160, 60, 34, { lh: 1.12, cw: 0.46 })}px;line-height:1.12;color:${TX}">${rich(t)}</div>`,
      chip: (t) => `<span style="display:inline-block;padding:8px 32px;border-radius:14px;border:4px solid ${TX};font-family:${osw};font-weight:700;font-size:50px;letter-spacing:3px;color:${TX};white-space:nowrap">${rich(t)}</span>`,
      cta: (t) => `<span style="display:inline-block;padding:8px 40px;border-radius:14px;background:${TX};font-family:${osw};font-weight:700;font-size:52px;letter-spacing:4px;color:${BG};white-space:nowrap">${esc(plain(t))}</span>`,
    };
    /** Title-only cover card (z 50, over everything, inside the centred 3:4 crop y 240-1680) at opacity cv; shared by
     * hw-cover's tail and hw-hook's introCover. Big B&W face (when cover.person), outlined episode number, one red word. */
    const coverCard = (c, cv) => {
      if (cv <= 0) return "";
      const cp = c.person;
      const m = /#\s*\d+/.exec(String(c.stamp));
      const num = m ? m[0].replace(/\s+/g, "") : String(c.stamp);
      const brand = m ? String(c.stamp).slice(0, m.index).trim() : "";
      const label = [brand, c.chip ? plain(c.chip) : null].filter(Boolean).join(" · ");
      const ts = fit(c.title, 900, cp ? 400 : 560, cp ? 150 : 170, 64, { lh: 0.98, cw: 0.5 });
      const titleTop = cp ? 1100 : 760;
      const face = cp
        ? `<div style="position:absolute;left:0;top:0;width:1080px;height:1200px;overflow:hidden">${
            cp.photo ? `<img src=${JSON.stringify(cp.photo)} alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 18%;filter:${GRADE_BW}">` : silhouette()
          }</div><div style="position:absolute;left:0;top:0;width:1080px;height:1200px;background:linear-gradient(180deg,rgba(11,11,12,0.55) 0%,rgba(11,11,12,0) 26%,rgba(11,11,12,0) 55%,${BG} 100%)"></div>`
        : "";
      const numHtml = cp
        ? `<div style="position:absolute;left:690px;top:830px;width:270px;text-align:right;font-family:${osw};font-weight:700;font-size:170px;line-height:1;color:transparent;-webkit-text-stroke:4px ${TX}">${esc(num)}</div>`
        : `<div style="position:absolute;left:${X0}px;top:330px;font-family:${osw};font-weight:700;font-size:340px;line-height:1;color:transparent;-webkit-text-stroke:5px ${TX}">${esc(num)}</div>`;
      return `<div style="position:absolute;inset:0;z-index:50;background:${BG};opacity:${n(cv, 3)}">${face}${numHtml}
${label ? `<div style="position:absolute;left:${X0}px;top:${titleTop - 50}px;font-family:${mono};font-weight:600;font-size:28px;letter-spacing:3px;color:${TX};white-space:nowrap"><span style="color:${RED}">●</span> ${esc(label)}</div>` : ""}
<div style="position:absolute;left:${X0 - 4}px;top:${titleTop}px;width:900px;font-family:${osw};font-weight:700;font-size:${ts}px;line-height:0.98;letter-spacing:1px;color:${TX};text-transform:uppercase">${rich(c.title)}</div>
${cp && cp.credit ? `<div style="position:absolute;left:${X0}px;top:1610px;font-family:${mono};font-weight:500;font-size:18px;color:${DIM}">Foto: ${esc(cp.credit)}</div>` : ""}</div>`;
    };
    T.cover = (f, { S, D }, p) => {
      const lines = p.lines;
      const ats = lines.map((l, i) => cue(S, l.cue, spread(D, i, lines.length, 2)));
      const lastEnd = S && S.lines.length ? F1.line(S, S.lines.length - 1).end : D - 30;
      const cAt = cue(S, p.coverAt, Math.min(lastEnd + 4, D - 24));
      const items = lines
        .map((l, i) => {
          const r = Math.min(1, ramp(f, ats[i] - 2, 12, F1.backOut));
          return `<div style="text-align:center;opacity:${n(Math.max(0, r), 3)};transform:translateY(${n((1 - r) * 30)}px) scale(${n(0.92 + 0.08 * r, 3)})">${STYLES[l.style](l.text)}</div>`;
        })
        .join("");
      const fp = ramp(f, (ats.length ? ats[ats.length - 1] : 0) + 8, 14, F1.expoOut);
      const body =
        `<div style="position:absolute;left:100px;top:300px;width:880px;height:1120px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px">${items}
<div style="opacity:${n(fp, 3)};text-align:center"><span style="font-family:${mono};font-weight:600;font-size:26px;letter-spacing:3px;color:${MU};white-space:nowrap">${esc(p.footer)}</span></div></div>`;
      // Title-only cover over the tail (TikTok "Select cover"); everything inside the centred 3:4 crop, y 240-1680.
      const cv = ramp(f, cAt, 5);
      // loop: the tail is the hook's frame 0 (whole frame, own progress strip), so the replay starts where it ended
      if (p.loopHook)
        return frame(f, D, p, body, { overlay: cv <= 0 ? "" : `<div style="position:absolute;inset:0;z-index:50;overflow:hidden;background:${BG};opacity:${n(cv, 3)}">${T.hook(0, { S: null, D }, p.loopHook)}</div>` });
      const overlay = coverCard(p.cover, cv);
      return frame(f, D, p, body, { overlay });
    };

    const draw = (type, f, ctx, p) => T[type](f, ctx, p);
    return { draw, fit, rich, cue, parseNum, fmt, T, ICONS };
  })();
}
