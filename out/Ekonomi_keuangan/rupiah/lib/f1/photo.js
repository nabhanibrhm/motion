/*
 * Photo kit (port of components/photo): framed photography, logos and stats. `(props, f) => HTML string`.
 * Paths are project-relative: "public/assets/racing/garage_2021.jpg" (F1.asset("assets/...") adds the prefix).
 *
 *   F1.photoLayout(name, { aspect, count })   explicit boxes: card-left | card-right | center | two-up | timeline | collage
 *   F1.PhotoCard({ layout, options, photos, kicker, headline, body, inner, tone, at, stagger, exitAt, exitFrames, enter, push, pushFrames }, f)
 *   F1.Photo({ src, x, y, w, h, fit, focal, at, dur, zoom, dx, dy, desaturate, grain, vignette, overlay, border, radius, enter, enterFrames, exitAt, exitFrames, inner }, f)
 *   F1.Logo / F1.BigStat / F1.LowerThird / F1.ProgressBar / F1.Ring / F1.RaceWipe
 *
 * No full-frame photos: x, y, w, h are required. fit "contain" (default) shows the whole picture; "cover" crops and
 * must name a focal point. The <img> is always in the markup (opacity 0 before it enters), so it never reloads.
 */
(function (F1) {
  const { editorial, toon } = F1.theme;
  const n = F1.n;
  const S = F1.STAGE;

  F1.asset = (src) => (src.startsWith("public/") ? src : `public/${src}`);

  /* ================================================================ layouts */

  const SIZE = { landscape: { w: 880, h: 620 }, portrait: { w: 580, h: 700 }, square: { w: 680, h: 680 } };
  const mascotZone = (x, w, top = 520) => ({ x, y: top, w, h: S.bottom - top, feet: { x: x + w / 2, y: S.feetY } });

  const side = (name, aspect) => {
    const { w, h } = SIZE[aspect];
    const y = Math.round(S.top + (S.bottom - S.top - h) / 2);
    const gutter = 64;
    const photoX = name === "card-left" ? S.left : S.right - w;
    const textX = name === "card-left" ? S.left + w + gutter : S.left;
    const textW = S.right - S.left - w - gutter;
    const text = { x: textX, y, w: textW, h: Math.min(h, 400) };
    return { name, photos: [{ x: photoX, y, w, h }], text, labels: [], mascot: mascotZone(textX, textW, y + text.h + 20), rail: null };
  };

  const LAYOUTS = {
    "card-left": (o) => side("card-left", o.aspect ?? "landscape"),
    "card-right": (o) => side("card-right", o.aspect ?? "landscape"),
    center: () => {
      const w = 960;
      const h = 540;
      return { name: "center", photos: [{ x: (S.width - w) / 2, y: 216, w, h }], text: { x: 240, y: S.top - 14, w: 1440, h: 96 }, labels: [], mascot: mascotZone(S.right - 340, 340, 470), rail: null };
    },
    "two-up": () => {
      const w = 820;
      const h = 540;
      const gap = S.right - S.left - w * 2;
      const y = 140;
      return {
        name: "two-up",
        photos: [
          { x: S.left, y, w, h },
          { x: S.left + w + gap, y, w, h },
        ],
        text: null,
        labels: [
          { x: S.left, y: y + h + 18, w, h: 64 },
          { x: S.left + w + gap, y: y + h + 18, w, h: 64 },
        ],
        mascot: mascotZone(S.width / 2 - 170, 340, 700),
        rail: null,
      };
    },
    timeline: (o) => {
      const cnt = Math.max(2, Math.min(5, o.count ?? 3));
      const gap = 40;
      const w = Math.floor((S.right - S.left - gap * (cnt - 1)) / cnt);
      const h = Math.round(Math.min(w * 0.72, 420));
      const y = 200;
      const photos = Array.from({ length: cnt }, (_, i) => ({ x: S.left + i * (w + gap), y, w, h }));
      const railY = y + h + 40;
      return {
        name: "timeline",
        photos,
        text: { x: S.left, y: S.top - 14, w: S.right - S.left, h: 70 },
        labels: photos.map((p) => ({ x: p.x, y: railY + 28, w: p.w, h: 90 })),
        mascot: mascotZone(S.right - 300, 300, railY + 140),
        rail: { x0: S.left, x1: S.right, y: railY },
      };
    },
    collage: () => ({
      name: "collage",
      photos: [
        { x: 150, y: 140, w: 720, h: 500 },
        { x: 930, y: 140, w: 420, h: 320 },
        { x: 1150, y: 500, w: 480, h: 300 },
      ],
      text: { x: 1410, y: 140, w: S.right - 1410, h: 300 },
      labels: [],
      mascot: mascotZone(150, 700, 650),
      rail: null,
    }),
  };
  F1.photoLayout = (name, options = {}) => LAYOUTS[name](options);
  F1.photoLayouts = LAYOUTS;

  /* ================================================================ Photo */

  const SLANT = 140;
  const BAR_W = [34, 54, 22];
  const BARS_TOTAL = BAR_W[0] + BAR_W[1] + BAR_W[2];
  const BARS = [toon.ink, toon.green, toon.sage];

  F1.Photo = (props, f) => {
    const {
      src,
      x,
      y,
      w: bw,
      h: bh,
      focal = { x: 0.5, y: 0.5 },
      fit = "contain",
      at = 0,
      dur = 150,
      zoom = [1, 1],
      dx = 0,
      dy = 0,
      desaturate = 0,
      grain = 0,
      vignette = 0,
      overlay,
      border = 8,
      radius = 10,
      enter = "fade",
      enterFrames,
      exitAt,
      exitFrames = 10,
      inner,
      style = {},
    } = props;
    if ([x, y, bw, bh].some((v) => v === undefined)) throw new Error(`[f1] Photo ${src}: x, y, w, h are required (no full-frame photos)`);
    const ef = enterFrames ?? (enter.startsWith("race") ? 12 : enter === "clip" ? 20 : 14);
    const gone = exitAt !== undefined && f >= exitAt + exitFrames;

    const p = enter === "none" ? 1 : F1.ramp(f, at, ef, enter === "fade" ? undefined : F1.expoOut);
    const out = exitAt === undefined ? 1 : 1 - F1.ramp(f, exitAt, exitFrames);
    const live = f >= at && !gone;

    // Ken Burns: scale + pan, clamped so the picture always covers the box.
    const k = F1.interpolate(f, [at, at + dur], [0, 1], { ...F1.clamp, easing: F1.glide });
    const s = zoom[0] + (zoom[1] - zoom[0]) * k;
    const fx = focal.x;
    const fy = focal.y;
    const iw = bw - border * 2;
    const ih = bh - border * 2;
    const rise = enter === "rise" ? (1 - p) * 24 : 0;
    const tx = Math.max(-(s - 1) * (1 - fx) * iw, Math.min((s - 1) * fx * iw, dx * k));
    const ty = Math.max(-(s - 1) * (1 - fy) * ih, Math.min((s - 1) * fy * ih, dy * k));
    const settle = enter === "clip" ? 1 + (1 - p) * 0.12 : 1;

    // Entrance mask on the whole card (dropped once finished so the frame shadow is never clipped).
    const wrap = {};
    let bars = "";
    if (p < 1 && enter !== "none" && enter !== "fade" && enter !== "rise") {
      if (enter.startsWith("wipe")) {
        const dir = { "wipe-right": "90deg", "wipe-left": "270deg", "wipe-up": "0deg", "wipe-down": "180deg" }[enter];
        const edge = F1.interpolate(p, [0, 1], [-10, 100]);
        const m = `linear-gradient(${dir}, #000 ${n(edge)}%, transparent ${n(edge + 10)}%)`;
        wrap.WebkitMaskImage = m;
        wrap.maskImage = m;
      } else if (enter === "clip") {
        const v = (1 - p) * 50;
        wrap.clipPath = `inset(${n(v)}% ${n((1 - p) * 6)}% ${n(v)}% ${n((1 - p) * 6)}% round ${Math.max(radius, 6)}px)`;
      } else {
        const left = enter === "race-left";
        const mx = (v) => (left ? bw - v : v);
        const e = p * (bw + SLANT + BARS_TOTAL) - BARS_TOTAL;
        const poly = (a, b) => [`${n(mx(a))},0`, `${n(mx(b))},0`, `${n(mx(b - SLANT))},${bh}`, `${n(mx(a - SLANT))},${bh}`].join(" ");
        wrap.clipPath = `polygon(${poly(-SLANT - 10, e)
          .split(" ")
          .map((pt) => pt.split(",").map((v) => `${v}px`).join(" "))
          .join(", ")})`;
        let a = e;
        bars = BAR_W.map((bwid, i) => {
          const el = `<polygon points="${poly(a, a + bwid)}" fill="${BARS[i]}"/>`;
          a += bwid;
          return el;
        }).join("");
      }
    }

    const ov = overlay === undefined ? null : typeof overlay === "number" ? { flat: overlay } : overlay;
    const grad = ov && "dir" in ov ? { to: { left: "to right", right: "to left", top: "to bottom", bottom: "to top" }[ov.dir], a: ov.opacity ?? 0.7, reach: (ov.reach ?? 0.85) * 100 } : null;
    const gid = F1.uid();

    const outer = F1.css({
      position: "absolute",
      left: x,
      top: y,
      width: bw,
      height: bh,
      opacity: n(live ? (enter === "fade" || enter === "rise" ? p : 1) * out : 0, 3),
      transform: rise ? `translateY(${n(rise)}px)` : undefined,
      ...style,
    });
    const img = F1.css({
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: fit,
      objectPosition: `${fx * 100}% ${fy * 100}%`,
      transformOrigin: `${fx * 100}% ${fy * 100}%`,
      transform: `translate(${n(tx)}px, ${n(ty)}px) scale(${n(s, 4)})`,
      filter: desaturate > 0 ? `saturate(${1 - desaturate}) contrast(${1 + desaturate * 0.08})` : undefined,
    });
    return `<div style="${outer}"><div style="${F1.css({ position: "absolute", inset: 0, ...wrap })}">
${border > 0 ? `<div style="${F1.css({ position: "absolute", inset: 0, background: editorial.white, borderRadius: radius + border * 0.5, boxShadow: `0 0 0 1px ${editorial.rule}, 0 16px 36px ${F1.alpha(editorial.ink, 0.2)}` })}"></div>` : "<!--border-->"}
<div style="${F1.css({ position: "absolute", left: border, top: border, width: iw, height: ih, overflow: "hidden", borderRadius: radius, background: editorial.panel })}">
<div style="position:absolute;inset:0;transform:scale(${n(settle, 4)});transform-origin:${fx * 100}% ${fy * 100}%"><img src="${F1.esc(F1.asset(src))}" alt="" style="${img}"></div>
${vignette > 0 ? `<div style="position:absolute;inset:0;background:radial-gradient(ellipse at center, transparent 45%, ${F1.alpha(editorial.ink, vignette * 0.85)} 100%)"></div>` : "<!--vig-->"}
${ov && "flat" in ov ? `<div style="position:absolute;inset:0;background:${F1.alpha(editorial.ink, ov.flat)}"></div>` : "<!--ov-->"}
${grad ? `<div style="position:absolute;inset:0;background:linear-gradient(${grad.to}, ${F1.alpha(editorial.ink, grad.a)} 0%, ${F1.alpha(editorial.ink, grad.a * 0.55)} ${grad.reach * 0.5}%, ${F1.alpha(editorial.ink, 0)} ${grad.reach}%)"></div>` : "<!--grad-->"}
${
  grain > 0
    ? `<svg width="100%" height="100%" style="position:absolute;inset:0;mix-blend-mode:overlay;opacity:${Math.min(1, grain * 1.6)}"><filter id="pg${gid}"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="${Math.floor(f / 2) % 997}" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#pg${gid})"/></svg>`
    : "<!--grain-->"
}
${inner ? `<div style="position:absolute;inset:0">${inner}</div>` : "<!--inner-->"}
</div></div>
${bars ? `<div style="position:absolute;inset:0;overflow:hidden;pointer-events:none"><svg width="${bw}" height="${bh}" style="position:absolute;inset:0">${bars}</svg></div>` : "<!--bars-->"}</div>`;
  };

  /* ================================================================ PhotoCard */

  F1.PhotoCard = (props, f) => {
    const { layout: name, options = {}, photos, kicker, headline, body, inner, tone = "light", at = 0, stagger = 10, exitAt, exitFrames = 10, enter = "rise", push = false, pushFrames = 180 } = props;
    const L = F1.photoLayout(name, options);
    const dark = tone === "dark";
    const inkText = dark ? editorial.white : editorial.ink;
    const kickText = dark ? editorial.accentOnDark : editorial.accentOnLight;
    const subText = dark ? editorial.mutedOnDark : editorial.muted;
    const railColor = dark ? editorial.mutedOnDark : editorial.rule;
    const pushRange = push === true ? [1, 1.05] : push === false ? undefined : push;

    const textIn = F1.ramp(f, at + 6, 16);
    const out = exitAt === undefined ? 1 : 1 - F1.ramp(f, exitAt, exitFrames);
    const centred = name === "center" || name === "timeline";
    const start = (i) => at + i * stagger + ((photos[i] && photos[i].delay) || 0);
    const hasText = Boolean(inner || headline || kicker || body);

    const rail = L.rail
      ? `<svg width="${F1.STAGE.width}" height="${F1.STAGE.height}" style="position:absolute;inset:0"><line x1="${L.rail.x0}" y1="${L.rail.y}" x2="${n(L.rail.x0 + (L.rail.x1 - L.rail.x0) * F1.ramp(f, at + 4, 28))}" y2="${L.rail.y}" stroke="${railColor}" stroke-width="4" stroke-linecap="round"/>${L.photos
          .slice(0, photos.length)
          .map((b, i) => {
            const on = F1.interpolate(f, [start(i) + 8, start(i) + 18], [0, 1], F1.clamp);
            return `<circle cx="${b.x + b.w / 2}" cy="${L.rail.y}" r="${n(11 * on)}" fill="${editorial.accent}" stroke="${dark ? editorial.ink : editorial.bg}" stroke-width="4"/>`;
          })
          .join("")}</svg>`
      : "<!--rail-->";

    const cards = L.photos
      .slice(0, photos.length)
      .map((b, i) => {
        const item = photos[i];
        const lb = L.labels[i];
        const labelIn = F1.ramp(f, start(i) + 10, 14);
        const photo = F1.Photo(
          { src: item.src, x: b.x, y: b.y, w: b.w, h: b.h, fit: item.fit === "cover" ? "cover" : "contain", focal: item.focal, at: start(i), dur: pushFrames, zoom: item.zoom ?? pushRange, desaturate: item.desaturate, grain: item.grain, vignette: item.vignette, enter, enterFrames: 18 },
          f,
        );
        const label =
          lb && item.label
            ? `<div style="${F1.css({ position: "absolute", left: lb.x, top: lb.y, width: lb.w, opacity: n(labelIn, 3), textAlign: "center", fontFamily: toon.font.display, color: inkText })}"><div style="font-weight:800;font-size:34px;line-height:1.1">${F1.esc(item.label)}</div>${
                item.sub ? `<div style="${F1.css({ fontFamily: toon.font.body, fontWeight: 700, fontSize: 24, color: subText, marginTop: 4 })}">${F1.esc(item.sub)}</div>` : ""
              }</div>`
            : "<!--label-->";
        return `<div>${photo}${label}</div>`;
      })
      .join("");

    let text = "<!--text-->";
    if (L.text && hasText) {
      const t = L.text;
      const def = F1.join(
        kicker && `<div style="${F1.css({ fontFamily: toon.font.body, fontWeight: 800, fontSize: 30, letterSpacing: "0.14em", textTransform: "uppercase", color: kickText, marginBottom: 14 /* v2: 26px, too small on a phone */ })}">${F1.esc(kicker)}</div>`,
        headline && `<div style="${F1.css({ fontFamily: toon.font.display, fontWeight: 800, fontSize: centred ? 64 : 80, lineHeight: 1.04, letterSpacing: "-0.01em" })}">${F1.esc(headline)}</div>`,
        !centred && `<div style="${F1.css({ width: 72, height: 6, borderRadius: 3, background: editorial.accent, margin: "20px 0" })}"></div>`,
        body && `<div style="${F1.css({ fontFamily: toon.font.body, fontWeight: 600, fontSize: 34, lineHeight: 1.3, color: subText })}">${F1.esc(body)}</div>`,
      );
      text = `<div style="${F1.css({
        position: "absolute",
        left: t.x,
        top: t.y,
        width: t.w,
        height: t.h,
        display: "flex",
        flexDirection: "column",
        justifyContent: centred ? "flex-start" : "center",
        alignItems: centred ? "center" : "flex-start",
        textAlign: centred ? "center" : "left",
        opacity: n(textIn, 3),
        transform: `translateY(${n((1 - textIn) * 14)}px)`,
        color: inkText,
      })}">${inner ?? def}</div>`;
    }
    return `<div style="position:absolute;inset:0;opacity:${n(out, 3)};pointer-events:none">${rail}${cards}${text}</div>`;
  };

  /* ================================================================ Logo, BigStat, LowerThird */

  /** A logo drawn with object-fit: contain, never stretched. x,y = centre. Give width OR height. */
  F1.Logo = ({ src, width, height, x = 960, y = 540, enter = "fade", at = 0, frames, exitAt, opacity = 1, style = {} }, f) => {
    const fr = frames ?? (enter === "pop" ? 16 : 18);
    const fade = enter === "none" ? 1 : F1.ramp(f, at, fr, F1.expoOut);
    const pop = enter === "pop" ? F1.popScale(f, at, fr) : 1;
    const out = exitAt === undefined ? 1 : 1 - F1.ramp(f, exitAt, 10);
    const hidden = (f < at && enter !== "none") || out <= 0;
    const box = width !== undefined ? { width } : { height: height ?? 160 };
    const wrap = F1.css({
      position: "absolute",
      left: x,
      top: y,
      ...box,
      transform: `translate(-50%, -50%) scale(${n(pop, 4)}) translateY(${n(enter === "fade" ? (1 - fade) * 18 : 0)}px)`,
      opacity: hidden ? 0 : n(Math.min(1, fade * 3) * out * opacity, 3),
      ...style,
    });
    const img = F1.css({ display: "block", width: width !== undefined ? "100%" : "auto", height: width !== undefined ? "auto" : "100%", objectFit: "contain" });
    return `<div style="${wrap}"><img src="${F1.esc(F1.asset(src))}" alt="" style="${img}"></div>`;
  };

  /** Large editorial statistic: tabular numerals counting 0 -> value with a smaller suffix. */
  F1.BigStat = ({ value, suffix, prefix, decimals = 0, label, at = 0, dur = 45, x = 140, y = 300, align = "left", fontSize = 280, color = toon.green, suffixColor, labelColor = toon.ink, exitAt, style = {} }, f) => {
    const appear = F1.ramp(f, at, 14, F1.expoOut);
    const count = F1.ramp(f, at, dur, F1.expoOut);
    const out = exitAt === undefined ? 1 : 1 - F1.ramp(f, exitAt, 10);
    if (f < at || out <= 0) return "<!--stat-->";
    const shown = (value * count).toFixed(decimals);
    const wrap = F1.css({
      position: "absolute",
      left: x,
      top: y,
      transform: `${align === "center" ? "translateX(-50%) " : ""}translateY(${n((1 - appear) * 28)}px)`,
      opacity: n(appear * out, 3),
      display: "flex",
      flexDirection: "column",
      alignItems: align === "center" ? "center" : "flex-start",
      ...style,
    });
    const row = F1.css({ display: "flex", alignItems: "flex-start", fontFamily: toon.font.display, fontWeight: 800, lineHeight: 0.92, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", color });
    return `<div style="${wrap}"><div style="${row}">${F1.join(
      prefix && `<span style="${F1.css({ fontSize: fontSize * 0.5, marginTop: fontSize * 0.08, marginRight: fontSize * 0.04 })}">${F1.esc(prefix)}</span>`,
      `<span style="font-size:${fontSize}px">${shown}</span>`,
      suffix && `<span style="${F1.css({ fontSize: fontSize * 0.5, marginTop: fontSize * 0.06, marginLeft: fontSize * 0.03, color: suffixColor ?? color })}">${F1.esc(suffix)}</span>`,
    )}</div>${
      label
        ? `<div style="${F1.css({ marginTop: fontSize * 0.08, fontFamily: toon.font.body, fontWeight: 800, fontSize: Math.max(26, fontSize * 0.13), letterSpacing: "0.14em", textTransform: "uppercase", color: labelColor, opacity: n(0.8 * F1.ramp(f, at + 8, 14), 3) })}">${F1.esc(label)}</div>`
        : ""
    }</div>`;
  };

  /** Pill label: dark lower third for photos, or the sage UI-chip variant (`active` = selected). */
  F1.LowerThird = ({ text, sub, variant = "ink", active = false, x = 140, y = 700, anchor = "left", fontSize = 36, at = 0, exitAt }, f) => {
    const inP = F1.ramp(f, at, 16, F1.expoOut);
    const outP = exitAt === undefined ? 0 : F1.ramp(f, exitAt, 10);
    const p = inP * (1 - outP);
    if (f < at || p <= 0.001) return "<!--lower-third-->";
    const ui = variant === "ui";
    const bg = ui ? (active ? toon.green : toon.sage) : toon.ink;
    const fg = ui ? (active ? toon.paper : toon.ink) : toon.paper;
    const padX = Math.round(fontSize * 0.75);
    const padY = Math.round(fontSize * 0.34);
    const reveal = (1 - inP) * 100;
    const wrap = F1.css({
      position: "absolute",
      left: x,
      top: y,
      transform: `translateX(${anchor === "center" ? "-50%" : "0"}) translateX(${n((1 - inP) * -36)}px)`,
      opacity: n(Math.min(1, p * 2) * (1 - outP), 3),
      clipPath: `inset(-20px ${n(reveal)}% -20px 0 round 999px)`,
      filter: ui ? undefined : `drop-shadow(0 10px 18px ${F1.alpha(toon.ink, 0.25)})`,
    });
    const pill = F1.css({
      display: "inline-flex",
      alignItems: "center",
      gap: Math.round(fontSize * 0.45),
      padding: `${padY}px ${padX}px`,
      borderRadius: 999,
      background: bg,
      color: fg,
      fontFamily: toon.font.body,
      fontWeight: 800,
      fontSize,
      lineHeight: 1.1,
      letterSpacing: ui ? "0.01em" : "0.06em",
      textTransform: ui ? "none" : "uppercase",
      whiteSpace: "nowrap",
      boxShadow: ui && !active ? `inset 0 0 0 2px ${toon.sageDeep}` : undefined,
    });
    return `<div style="${wrap}"><div style="${pill}">${F1.join(
      !ui && `<span style="${F1.css({ width: fontSize * 0.28, height: fontSize * 0.28, borderRadius: "50%", background: toon.sage })}"></span>`,
      `<span>${F1.esc(text)}</span>`,
      sub && !ui && `<span style="${F1.css({ fontWeight: 600, opacity: 0.7, letterSpacing: "0.02em", textTransform: "none", fontSize: fontSize * 0.8 })}">${F1.esc(sub)}</span>`,
    )}</div></div>`;
  };

  /* ================================================================ ProgressBar, Ring */

  F1.ProgressBar = ({ pct, at = 0, dur = 40, color = toon.green, track = toon.sage, exitAt, x = 140, y = 500, w = 640, h = 14, label, showValue = false, labelColor = toon.ink }, f) => {
    const appear = F1.ramp(f, at, 10);
    const fill = F1.ramp(f, at + 4, dur, F1.expoOut);
    const out = exitAt === undefined ? 1 : 1 - F1.ramp(f, exitAt, 10);
    if (f < at || out <= 0) return "<!--bar-->";
    const v = pct * fill;
    const head =
      label || showValue
        ? `<div style="${F1.css({ display: "flex", justifyContent: "space-between", marginBottom: 12, fontFamily: toon.font.body, fontWeight: 800, fontSize: 26, letterSpacing: "0.12em", textTransform: "uppercase", color: labelColor })}"><span>${F1.esc(label || "")}</span>${
            showValue ? `<span style="font-variant-numeric:tabular-nums;color:${color}">${Math.round(v)}%</span>` : ""
          }</div>`
        : "";
    return `<div style="${F1.css({ position: "absolute", left: x, top: y, width: w, opacity: n(appear * out, 3) })}">${head}<div style="${F1.css({ width: "100%", height: h, borderRadius: h, background: track, overflow: "hidden" })}"><div style="${F1.css({ width: `${n(Math.max(0, Math.min(100, v)))}%`, height: "100%", borderRadius: h, background: color })}"></div></div></div>`;
  };

  F1.Ring = ({ pct, at = 0, dur = 45, color = toon.green, track = toon.sage, exitAt, x = 960, y = 540, size = 360, stroke, showValue = true, valueColor = toon.ink, inner }, f) => {
    const appear = F1.ramp(f, at, 10);
    const fill = F1.ramp(f, at + 4, dur, F1.expoOut);
    const out = exitAt === undefined ? 1 : 1 - F1.ramp(f, exitAt, 10);
    if (f < at || out <= 0) return "<!--ring-->";
    const sw = stroke ?? size * 0.09;
    const r = (size - sw) / 2;
    const c = 2 * Math.PI * r;
    const v = pct * fill;
    const centre =
      inner ??
      (showValue
        ? `<span style="${F1.css({ fontSize: size * 0.28, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", lineHeight: 1 })}">${Math.round(v)}<span style="font-size:${n(size * 0.15)}px;color:${color}">%</span></span>`
        : "");
    return `<div style="${F1.css({ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, opacity: n(appear * out, 3) })}">
<svg width="${size}" height="${size}" style="position:absolute;inset:0;transform:rotate(-90deg)"><circle cx="${size / 2}" cy="${size / 2}" r="${n(r)}" fill="none" stroke="${track}" stroke-width="${n(sw)}"/><circle cx="${size / 2}" cy="${size / 2}" r="${n(r)}" fill="none" stroke="${color}" stroke-width="${n(sw)}" stroke-linecap="round" stroke-dasharray="${n(c)}" stroke-dashoffset="${n(c * (1 - Math.max(0, Math.min(100, v)) / 100))}"/></svg>
<div style="${F1.css({ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", fontFamily: toon.font.display, fontWeight: 800, color: valueColor })}">${centre}</div></div>`;
  };

  /* ================================================================ RaceWipe */

  const WEIGHTS = [1.2, 0.7, 1.5, 0.9, 1.1, 0.6, 1.4, 0.8, 1.0];
  const COLORS = [toon.ink, toon.green, toon.ink, toon.sage, toon.green, toon.ink, toon.green, toon.sage, toon.ink];

  /** Full-frame race wipe: bars sweep across, covering the frame at `at` (cut there) and leaving the other side. */
  F1.RaceWipe = ({ at, dur = 20, direction = "right", bars = 9, skew = 14 }, f) => {
    const W = F1.STAGE.width;
    const H = F1.STAGE.height;
    const inF = Math.round(dur * 0.5);
    const outF = Math.round(dur * 0.5);
    if (f < at - inF - 1 || f > at + outF + 1) return "<!--wipe-->";
    const total = WEIGHTS.slice(0, bars).reduce((a, b) => a + b, 0);
    const lean = Math.tan((skew * Math.PI) / 180) * H;
    const barW = W + lean + 200;
    const SS = Math.min(6, Math.floor(inF / 2));
    const posAt = (i, fr) => {
      const d = (i * 7) % (SS + 1);
      const enterP = F1.ramp(fr, at - inF + d, inF - 1 - d, F1.expoInOut);
      const leave = F1.ramp(fr, at + 1 + d, outF - d, F1.expoInOut);
      return (enterP - 1 + leave) * barW - (lean / 2 + 100);
    };
    let top = 0;
    const rows = Array.from({ length: bars }, (_, i) => {
      const hRow = (WEIGHTS[i % WEIGHTS.length] / total) * H;
      const y0 = top;
      top += hRow;
      const color = COLORS[i % COLORS.length];
      const x = posAt(i, f);
      const vel = Math.abs(x - posAt(i, f - 1));
      const tail = Math.min(vel * 1.1, 760);
      const streakY = y0 + hRow * (0.25 + (0.5 * ((i * 37) % 10)) / 10);
      return `<div style="position:absolute;left:0;top:${n(y0 - 0.5)}px;width:${W}px;height:${n(hRow + 1)}px;overflow:visible">
<div style="position:absolute;left:${n(x)}px;top:0;width:${n(barW)}px;height:100%;background:${color}"></div>
<div style="position:absolute;left:${n(x - tail)}px;top:0;width:${n(tail)}px;height:100%;background:linear-gradient(90deg, ${F1.alpha(color, 0)}, ${F1.alpha(color, 0.85)})"></div>
<div style="position:absolute;left:${n(x + barW)}px;top:0;width:${n(tail * 0.55)}px;height:100%;background:linear-gradient(90deg, ${F1.alpha(color, 0.8)}, ${F1.alpha(color, 0)})"></div>
<div style="position:absolute;left:${n(x + barW + tail * 0.2)}px;top:${n(streakY - y0 + 14)}px;width:${n(tail * 0.9)}px;height:3px;background:linear-gradient(90deg, ${F1.alpha(toon.paper, 0.5)}, ${F1.alpha(toon.paper, 0)})"></div>
<div style="position:absolute;left:${n(x - tail * 1.5)}px;top:${n(streakY - y0)}px;width:${n(tail * 1.1)}px;height:3px;background:linear-gradient(90deg, ${F1.alpha(toon.paper, 0)}, ${F1.alpha(toon.paper, 0.55)})"></div></div>`;
    }).join("");
    return `<div style="position:absolute;inset:0;overflow:hidden;pointer-events:none;${direction === "left" ? "transform:scaleX(-1)" : ""}"><div style="position:absolute;left:0;top:0;width:${W}px;height:${H}px;transform:skewX(${-skew}deg);transform-origin:50% 50%">${rows}</div></div>`;
  };
})((globalThis.F1 = globalThis.F1 || {}));
