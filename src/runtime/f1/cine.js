/**
 * Cinematic kit (since 1 Nov 2026, from the "Cinematic Design" canvas): full-bleed illustrated scenes, a slow
 * camera push-in, the human cast (Muklis, Nisa, Beni) as flat SVG cut-outs, a dark HUD card top left, black tags.
 * Every value comes from the frame number, so renders are deterministic.
 *
 *   C.stage(f, D, bg, { zoom, ox, oy, shots, whip })  background html inside a camera that pushes in by `zoom` over
 *                                         the scene, or re-frames on beats with `shots` (see C.camera); `whip` (default
 *                                         on) swings the scene in from the right with motion blur over its first frames
 *                                         With `runtime.watermark` set (theme), stage also draws one big centred logo over
 *                                         `bg` (inside the camera) with mix-blend-mode: lighten, so it only lifts the dark
 *                                         ground and never shows over photos, text or cards brighter than the mark.
 *                                         Scenes that do not call C.stage get no watermark.
 *   C.progress(f, { step, label })        the case-progress strip at the top: "KASUS #07 · <label>" over one segment
 *                                         per scene (C.CASE); the current segment fills as the scene opens
 *   C.vignette(alpha, at, inner)          radial darkening over the scene
 *   C.cast(S, f, roles)                   roles[i] = actor props for voice line i; each line's actor holds the frame
 *                                         from just before its line until the next line's actor takes over
 *   C.actor(f, props)                     one cut-out: { src, x (centre), y (top), w, at, out, talking, dim }
 *   C.hud(f, { at, kicker, big, sub, src, w })  the timestamp-style card at x 72, y 250; `src` adds a small
 *                                         "Sumber: …" line (every figure on screen carries one)
 *   C.chip(f, { at, text })               a small dark label at the same spot
 *   C.tag(f, { at, x, y, rot, text })     a black price/fact tag that pops in
 *   C.stamp(f, { at, x, y, rot, text })   a rubber stamp that slams down (red ink, scales 2.2 -> 1)
 *   C.card(f, { at, x, y, w, kicker, big, sub, src, tone, bigSize })   the sourced card (kicker, big text, optional sub and
 *                                         "Sumber:" line); tone 'paper' (default) or 'dark'; `rot`, `dir` (slide in from
 *                                         the side) and `extra` (html) are optional
 *   C.verdict(f, S, { at, ask, slogan, ... })  the case-closing screen: paper, the KASUS DITUTUP stamp slamming on `at`,
 *                                         "<case id> · <case name>", an optional slogan, the question card on ask.cue and
 *                                         "SUMBER LENGKAP DI DESKRIPSI". Anchors are a frame or a spec ("word:ditutup")
 *   C.cover(f, S, { lines, ... })         the title-only TikTok cover card, z 50, over the outro tail (default: 4 frames
 *                                         after the last spoken word); its content stays inside y 240-1680
 * Colours come from F1.PAL (runtime.palette), read when the helper runs.
 */
(function (F1) {
  const n = F1.n;
  const legacy = F1.CONFIG?.profile === "legacy-inflasi";
  const C = (F1.cine = {});
  C.ACCENT = "#C6F432";
  // puppets from lib/f1/rig.js (public/cast/*.svg are the static originals); a string src is drawn as an <img>
  C.CAST = {
    muklis: { who: "muklis", expr: "biasa" },
    muklisSenyum: { who: "muklis", expr: "senyum" },
    nisa: { who: "nisa", expr: "biasa" },
    nisaKaget: { who: "nisa", expr: "kaget" },
    beni: { who: "beni", expr: "biasa" },
    beniKaget: { who: "beni", expr: "kaget" },
  };

  /**
   * The camera. Without `shots` it pushes in by `zoom` over the whole scene. With shots = [{ at, scale, ox, oy, ease }]
   * it re-frames on beats: each shot starts at frame `at` (a hard cut, or a move over `ease` frames) and keeps
   * pushing in by `zoom` until the next one, so the picture never sits still.
   */
  C.camera = (f, D, { zoom = 0.06, ox = 50, oy = 55, shots = null } = {}) => {
    if (!shots) return { s: 1 + zoom * Math.min(1, f / D), ox, oy };
    let i = 0;
    while (i + 1 < shots.length && f >= shots[i + 1].at) i++;
    const sh = { scale: 1, ox, oy, ease: 0, ...shots[i] };
    const end = i + 1 < shots.length ? shots[i + 1].at : D;
    const push = 1 + zoom * Math.min(1, Math.max(0, f - sh.at) / Math.max(1, end - sh.at));
    let s = sh.scale * push;
    let x = sh.ox;
    let y = sh.oy;
    if (i > 0 && sh.ease > 0) {
      const prev = { scale: 1, ox, oy, ...shots[i - 1] };
      const p = F1.ramp(f, sh.at, sh.ease, F1.expoOut);
      s = prev.scale * (1 + zoom) + (s - prev.scale * (1 + zoom)) * p;
      x = prev.ox + (x - prev.ox) * p;
      y = prev.oy + (y - prev.oy) * p;
    }
    return { s, ox: x, oy: y };
  };
  // The logo's aspect ratio (viewBox 800x128 in assets/shared/brand/hotwizz-logo.svg); other ratios can be set via height.
  // `pulse` {period s, scale, glow}: a steady heartbeat from the frame number only (smooth sine), scaling the mark up to
  // `scale` and swinging its brightness by +-`glow` around `opacity`. Without `pulse` the mark is static.
  C.watermark = (f, { src, opacity = 0.2, width = 920, height = null, pulse = null }) => {
    const h = height ?? Math.round((width * 128) / 800);
    const p = pulse ? 0.5 + 0.5 * Math.sin((2 * Math.PI * f) / Math.max(1, pulse.period * 30) - Math.PI / 2) : 0;
    const bright = pulse ? opacity * (1 + pulse.glow * (2 * p - 1)) : opacity;
    const scale = pulse ? 1 + pulse.scale * p : 1;
    // lighten keeps the brighter of (logo, backdrop) per channel: brightness() dims the logo to a faint tone that
    // only beats the dark ground, so photos, white cards and text stay untouched without any layering in the scene
    return `<img src="public/${src}" alt="" style="${F1.css({ position: "absolute", left: n((1080 - width) / 2), top: n(960 - h / 2), width, height: h, mixBlendMode: "lighten", filter: `brightness(${n(bright, 3)})`, transform: pulse ? `scale(${n(scale, 4)})` : null, pointerEvents: "none" })}">`;
  };
  C.stage = (f, D, bg, opts = {}) => {
    const cam = C.camera(f, D, opts);
    if (legacy) return `<div style="${F1.css({ position: "absolute", inset: 0, transformOrigin: `${n(cam.ox)}% ${n(cam.oy)}%`, transform: `scale(${n(cam.s, 4)})` })}">${bg}</div>`;
    // whip-pan in: the previous scene "swings out" because this one arrives from the right, blurred
    const w = opts.whip === false ? 1 : F1.ramp(f, 0, 9, F1.expoOut);
    const whip = w < 1 ? ` translateX(${n((1 - w) * 260)}px)` : "";
    return `<div style="${F1.css({ position: "absolute", inset: 0, transformOrigin: `${n(cam.ox)}% ${n(cam.oy)}%`, transform: `scale(${n(cam.s, 4)})${whip}`, filter: w < 1 ? `blur(${n((1 - w) * 14, 2)}px)` : "none" })}">${bg}${F1.CONFIG?.watermark ? C.watermark(f, F1.CONFIG.watermark) : ""}</div>`;
  };

  C.vignette = (alpha = 0.5, at = "50% 55%", inner = 45) =>
    `<div style="position:absolute;inset:0;background:radial-gradient(ellipse 75% 60% at ${at}, rgba(0,0,0,0) ${inner}%, rgba(0,0,0,${alpha}) 100%)"></div>`;

  // uid keeps the batik pattern id unique across scenes: every scene lives in the same page, and a duplicate id
  // resolves to the copy in a hidden scene, which leaves Muklis as a bare outline
  C.actor = (f, { src, x = 540, y = 1200, w = 380, at = 0, out = null, talking = false, talk = talking ? 1 : 0, dim = 1, uid = `${x}-${y}-${w}` }) => {
    if (f < at - 1 || (out !== null && f > out + 8)) return "";
    const inP = F1.ramp(f, at, 14, F1.expoOut);
    const outP = out === null ? 0 : F1.ramp(f, out, 8);
    const breathe = 1 + 0.008 * Math.sin(f / 18);
    const bob = -Math.abs(Math.sin(f * 0.5)) * 3 * talk;
    const sway = 0.7 * Math.sin(f / 45 + x / 97);
    const style = F1.css({
      position: "absolute",
      left: n(x - w / 2),
      top: n(y + (1 - inP) * 70 + bob),
      width: w,
      height: "auto",
      opacity: n(inP * (1 - outP), 3),
      transformOrigin: "50% 100%",
      transform: `rotate(${n(sway, 3)}deg) scaleY(${n(breathe, 4)})`,
      filter: dim === 1 ? "none" : `brightness(${dim})`,
    });
    if (typeof src === "string") return `<img src="${src}" alt="" style="${style}">`;
    const pose = F1.rig.pose(f, { talk, speaking: talking, at, who: src.who, expr: src.expr });
    return `<div style="${style}">${F1.rig.svg(src.who, src.expr, pose, w, legacy ? `${src.expr}-${x}-${y}-${w}` : `${src.expr}-${uid}`)}</div>`;
  };

  C.cast = (S, f, roles) =>
    roles
      .map((r, i) => {
        if (!r) return "";
        const line = F1.line(S, i);
        const nextIdx = roles.findIndex((x, j) => j > i && x);
        // the previous actor fades out over 8 frames while the next rises in, so the frame is never empty
        const at = i === 0 ? r.at ?? 0 : line.start - (legacy ? 4 : 12);
        const out = nextIdx < 0 ? null : F1.line(S, nextIdx).start - 12;
        const who = S.lines[i].speaker;
        // talk eases in and out over ~8 frames (and leads the voice a little) so gestures never snap
        let talk = 0;
        for (let k = -5; k <= 2; k++) talk += F1.isSpeaking(S, who, f + k) ? 1 / 8 : 0;
        return C.actor(f, { ...r, at, out, uid: `${S.id}-${i}`, talking: F1.isSpeaking(S, who, f), talk: talk * talk * (3 - 2 * talk) });
      })
      .join("");

  const mono = "'JetBrains Mono', monospace";
  C.CASE = F1.CONFIG.case;
  C.progress = (f, { step, label }) => {
    const fill = F1.ramp(f, 4, 20, F1.easeOut);
    const seg = Array.from({ length: C.CASE.steps }, (_, i) => {
      const p = i + 1 < step ? 1 : i + 1 === step ? fill : 0;
      return `<div style="position:relative;width:58px;height:8px;border-radius:4px;background:rgba(255,255,255,0.22);overflow:hidden"><div style="position:absolute;left:0;top:0;bottom:0;width:${n(58 * p)}px;background:${C.ACCENT}"></div></div>`;
    }).join("");
    return `<div style="${F1.css({ position: "absolute", left: 72, top: 140, padding: "12px 18px 14px", borderRadius: 12, background: "rgba(18,18,22,0.86)", display: "flex", flexDirection: "column", gap: 10 })}">
<div style="font-family:${mono};font-weight:700;font-size:20px;letter-spacing:2px;color:#fff">${C.CASE.id} <span style="color:${C.ACCENT}">· ${label}</span></div><div style="display:flex;gap:6px">${seg}</div></div>`;
  };
  C.hud = (f, { at = 4, kicker, big, sub, src = "", w = 470, bigSize = 72 }) => {
    const p = F1.ramp(f, at, 14, F1.expoOut);
    if (p <= 0) return "";
    return `<div style="${F1.css({ position: "absolute", left: n(72 - (1 - p) * 60), top: legacy ? 210 : 250, width: w, padding: "20px 26px", borderRadius: 16, background: "rgba(18,18,22,0.86)", opacity: n(p, 3), display: "flex", flexDirection: "column", gap: 6 })}">
<div style="font-family:${mono};font-weight:700;font-size:22px;letter-spacing:2px;color:#ff5a5f">● ${kicker}</div>
<div style="font-family:${mono};font-weight:700;font-size:${bigSize}px;line-height:1.05;color:#fff">${big}</div>
<div style="font-family:${mono};font-weight:500;font-size:22px;letter-spacing:1px;color:#c9c6c0">${sub}</div>${!legacy && src ? `<div style="font-family:${mono};font-weight:500;font-size:17px;letter-spacing:0.5px;color:#8d8a84;margin-top:4px">Sumber: ${src}</div>` : ""}</div>`;
  };

  C.chip = (f, { at = 4, text }) => {
    const p = F1.ramp(f, at, 12, F1.expoOut);
    if (p <= 0) return "";
    return `<div style="${F1.css({ position: "absolute", left: n(72 - (1 - p) * 40), top: legacy ? 210 : 250, padding: "12px 22px", borderRadius: 10, background: "rgba(18,18,22,0.86)", opacity: n(p, 3), fontFamily: "Oswald, sans-serif", fontWeight: 600, fontSize: 30, letterSpacing: 3, color: "#f5d27a" })}">${text}</div>`;
  };

  C.tag = (f, { at, x, y, rot = 0, text, size = 30, light = false }) => {
    const p = F1.ramp(f, at, 10, F1.expoOut);
    if (p <= 0) return "";
    return `<div style="${F1.css({
      position: "absolute",
      left: x,
      top: y,
      padding: light ? "10px 18px" : "6px 14px",
      borderRadius: light ? 10 : 8,
      background: light ? "#f6efe1" : "#111",
      border: light ? "4px solid #111" : "none",
      color: light ? "#111" : "#fff",
      fontFamily: "Oswald, sans-serif",
      fontWeight: 600,
      fontSize: size,
      opacity: n(p, 3),
      transform: `rotate(${rot}deg) scale(${n(0.6 + 0.4 * p, 3)})`,
    })}">${text}</div>`;
  };

  C.stamp = (f, { at, x, y, rot = -8, text, color = "#c0392b", size = 56 }) => {
    const p = F1.ramp(f, at, 8, F1.expoOut);
    if (p <= 0) return "";
    return `<div style="${F1.css({
      position: "absolute",
      left: x,
      top: y,
      padding: "8px 22px",
      border: `6px solid ${color}`,
      borderRadius: 12,
      background: "rgba(246,239,225,0.55)",
      color,
      fontFamily: "Oswald, sans-serif",
      fontWeight: 600,
      fontSize: size,
      letterSpacing: 5,
      opacity: n(p, 3),
      transform: `rotate(${rot}deg) scale(${n(2.2 - 1.2 * p, 3)})`,
    })}">${text}</div>`;
  };

  /* ---------------------------------------------------------------- kit: card, verdict, cover */

  const OSW = "Oswald, sans-serif";
  /** An anchor given as a frame number or a spec string ("word:ditutup", "line:1-12"). */
  const frameOf = (S, spec) => (typeof spec === "string" ? F1.at(S, spec) : spec);
  const lastLine = (S) => F1.line(S, S.lines.length - 1);

  C.card = (f, { at, x, y, w, kicker = "", big, sub = "", src = "", tone = "paper", bigSize = 48, rot = 0, dir = 0, extra = "", kc = null }) => {
    const p = F1.ramp(f, at, 12, F1.expoOut);
    if (p <= 0) return "";
    const P = F1.PAL;
    const dark = tone === "dark";
    return `<div style="${F1.css({ position: "absolute", left: x, top: y, width: w, boxSizing: "border-box", padding: "16px 24px 16px", borderRadius: 16, background: dark ? P.ink : P.paper, border: `5px solid ${dark ? P.paper : P.ink}`, boxShadow: "0 8px 0 rgba(42,42,46,0.18)", opacity: n(p, 3), transform: `translate(${n(dir * 50 * (1 - p))}px, ${n(dir ? 0 : 36 * (1 - p))}px) rotate(${rot}deg)` })}">
${kicker ? `<div style="font-family:${mono};font-weight:700;font-size:20px;letter-spacing:2px;color:${kc || (dark ? P.accent : P.teal)}">${kicker}</div>` : ""}<div style="font-family:${OSW};font-weight:700;font-size:${bigSize}px;line-height:1.08;color:${dark ? "#fff" : P.ink};margin-top:4px">${big}</div>${sub ? `<div style="font-family:${mono};font-weight:500;font-size:21px;letter-spacing:1px;color:${dark ? "#d3dde3" : P.muted};margin-top:6px">${sub}</div>` : ""}${extra}${src ? `<div style="font-family:${mono};font-weight:500;font-size:16px;color:${dark ? "#9fb0ba" : P.source};margin-top:8px">Sumber: ${src}</div>` : ""}</div>`;
  };

  /**
   * The closing screen. at: when the stamp slams (frame or spec). ask: { cue, kicker, big, sub?, hot? } is the question
   * card; hot = [{ t, at, color }] colours the first occurrence of the word `t` inside `big` from frame `at` on (an anchor).
   * slogan: html for the paper card under the stamp, `<b>..</b>` becomes the accent highlighter. source: true (the line
   * shows 24 frames after the question card), false, or a frame/spec.
   */
  C.verdict = (f, S, { at, bg = null, top = 360, gap = 28, stamp = "KASUS DITUTUP", name = C.CASE.name, slogan = null, ask = null, source = true }) => {
    const P = F1.PAL;
    const t0 = frameOf(S, at);
    const paper = F1.ramp(f, t0 - 6, 8);
    if (paper <= 0) return "";
    const slam = F1.ramp(f, t0, 8, F1.expoOut);
    const label = name ? `${C.CASE.id} · ${name}` : C.CASE.id;
    let sloganHtml = "";
    if (slogan) {
      const sp = F1.ramp(f, t0 + 16, 12, F1.expoOut);
      const html = String(slogan).replace(/<b>/g, `<span style="background:${C.ACCENT};padding:0 12px;border-radius:10px">`).replace(/<\/b>/g, "</span>");
      sloganHtml = `<div style="${F1.css({ marginTop: 6, padding: "18px 38px", borderRadius: 18, background: P.paper, border: `6px solid ${P.ink}`, textAlign: "center", opacity: n(sp, 3), transform: `translateY(${n(30 * (1 - sp))}px) rotate(-1.5deg)` })}"><div style="font-family:${OSW};font-weight:700;font-size:58px;line-height:1.2;letter-spacing:2px;color:${P.ink}">${html}</div></div>`;
    }
    let askHtml = "";
    let cue = t0;
    if (ask) {
      cue = frameOf(S, ask.cue);
      const ap = F1.ramp(f, cue, 12, F1.expoOut);
      let big = ask.big;
      for (const h of ask.hot || []) {
        const lit = F1.ramp(f, frameOf(S, h.at), 6) > 0;
        big = big.replace(h.t, `<span style="color:${lit ? h.color || C.ACCENT : "#fff"}">${h.t}</span>`);
      }
      askHtml = `<div style="${F1.css({ marginTop: 14, padding: "24px 40px", borderRadius: 20, background: P.ink, textAlign: "center", opacity: n(ap, 3), transform: `translateY(${n(30 * (1 - ap))}px)` })}"><div style="font-family:${mono};font-weight:700;font-size:24px;letter-spacing:2px;color:#ff5a5f">● ${ask.kicker}</div><div style="font-family:${OSW};font-weight:600;font-size:58px;line-height:1.15;color:#fff">${big}</div>${ask.sub ? `<div style="font-family:${mono};font-weight:500;font-size:22px;letter-spacing:1px;color:#c9c6c0;margin-top:4px">${ask.sub}</div>` : ""}</div>`;
    }
    let srcHtml = "";
    if (source) {
      const sp = F1.ramp(f, source === true ? cue + 24 : frameOf(S, source), 10, F1.expoOut);
      srcHtml = `<div style="font-family:${mono};font-weight:500;font-size:20px;letter-spacing:1px;color:${P.muted};opacity:${n(sp, 3)}">SUMBER LENGKAP DI DESKRIPSI</div>`;
    }
    return `<div style="${F1.css({ position: "absolute", inset: 0, background: bg || P.bg, opacity: n(paper, 3) })}"></div>
<div style="${F1.css({ position: "absolute", left: 0, right: 0, top, display: "flex", flexDirection: "column", alignItems: "center", gap, opacity: n(paper, 3) })}">
<div style="${F1.css({ padding: "12px 30px", border: `6px solid ${P.red}`, borderRadius: 12, transform: `rotate(-6deg) scale(${n(2.2 - 1.2 * slam, 3)})`, opacity: n(slam, 3), fontFamily: OSW, fontWeight: 600, fontSize: 72, letterSpacing: 6, color: P.red, whiteSpace: "nowrap" })}">${stamp}</div>
<div style="font-family:${mono};font-weight:500;font-size:26px;letter-spacing:2px;color:${P.muted}">${label}</div>${sloganHtml}${askHtml}${srcHtml}</div>`;
  };

  /**
   * The TikTok cover card: full-bleed backdrop (z 50) with a rotated case stamp and the title. Content is centred in
   * y 240-1680 (the 3:4 crop of the profile grid). lines = [{ t, size = 118, accent?, color?, mt? }]; `accent` text follows
   * `t` inside a highlighter pill (background = the cover's `accent`, default PAL.red). art: svg/html shown below the title.
   */
  C.cover = (f, S, { at = null, bg = null, stamp = C.CASE.id, lines = [], accent = null, art = "", gap = 34 }) => {
    const P = F1.PAL;
    const cv = F1.ramp(f, at === null ? lastLine(S).end + 4 : frameOf(S, at), 5);
    if (cv <= 0) return "";
    const pill = accent || P.red;
    const rows = lines
      .map((l) => {
        const text = l.t ? F1.esc(l.t) : "";
        const hl = l.accent ? `${text ? " " : ""}<span style="display:inline-block;line-height:1.1;color:#fff;background:${pill};padding:0 18px;border-radius:16px">${F1.esc(l.accent)}</span>` : "";
        return `<div style="${F1.css({ fontSize: l.size || 118, color: l.color || null, marginTop: l.mt || null })}">${text}${hl}</div>`;
      })
      .join("");
    return `<div style="${F1.css({ position: "absolute", inset: 0, zIndex: 50, boxSizing: "border-box", padding: "240px 40px", overflow: "hidden", background: bg || P.bg, opacity: n(cv, 3), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap })}">
<div style="${F1.css({ padding: "10px 26px", border: `6px solid ${P.red}`, borderRadius: 12, transform: "rotate(-5deg)", fontFamily: OSW, fontWeight: 600, fontSize: 52, letterSpacing: 6, color: P.red, whiteSpace: "nowrap" })}">${F1.esc(stamp)}</div>
<div style="${F1.css({ textAlign: "center", fontFamily: OSW, fontWeight: 700, color: P.ink, lineHeight: 1.04, letterSpacing: 2 })}">${rows}</div>${art}</div>`;
  };

})((globalThis.F1 = globalThis.F1 || {}));
