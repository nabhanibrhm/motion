/**
 * Cinematic kit (since 1 Nov 2026, from the "Cinematic Design" canvas): full-bleed illustrated scenes, a slow
 * camera push-in, the human cast (Muklis, Nisa, Beni) as flat SVG cut-outs, a dark HUD card top left, black tags.
 * Every value comes from the frame number, so renders are deterministic.
 *
 *   C.stage(f, D, bg, { zoom, ox, oy, shots, whip })  background html inside a camera that pushes in by `zoom` over
 *                                         the scene, or re-frames on beats with `shots` (see C.camera); `whip` (default
 *                                         on) swings the scene in from the right with motion blur over its first frames
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
  C.stage = (f, D, bg, opts = {}) => {
    const cam = C.camera(f, D, opts);
    if (legacy) return `<div style="${F1.css({ position: "absolute", inset: 0, transformOrigin: `${n(cam.ox)}% ${n(cam.oy)}%`, transform: `scale(${n(cam.s, 4)})` })}">${bg}</div>`;
    // whip-pan in: the previous scene "swings out" because this one arrives from the right, blurred
    const w = opts.whip === false ? 1 : F1.ramp(f, 0, 9, F1.expoOut);
    const whip = w < 1 ? ` translateX(${n((1 - w) * 260)}px)` : "";
    return `<div style="${F1.css({ position: "absolute", inset: 0, transformOrigin: `${n(cam.ox)}% ${n(cam.oy)}%`, transform: `scale(${n(cam.s, 4)})${whip}`, filter: w < 1 ? `blur(${n((1 - w) * 14, 2)}px)` : "none" })}">${bg}</div>`;
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
})((globalThis.F1 = globalThis.F1 || {}));
