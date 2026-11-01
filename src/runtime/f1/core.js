/*
 * Core of the F1 drawing library (browser). Replaces what the Remotion version got from `remotion`:
 *
 *   F1.interpolate, F1.Easing, F1.spring, F1.random   same maths as Remotion (spring physics, mulberry32 random),
 *                                                     so motion and blink timing match the old video
 *   F1.ramp, F1.popScale, F1.wave, F1.pulse, ...      the toon/anim helpers
 *   F1.theme                                          palette read from the CSS variables in lib/f1/f1.css
 *   F1.css, F1.esc                                    markup helpers for components that return HTML/SVG strings
 *   F1.morph(el, html)                                patch el's children to match html (keeps <img> elements alive)
 *   F1.scene(id, render, opts)                        run a scene: one paused GSAP timeline that redraws its layer(s)
 *
 * Determinism: everything is a function of the frame. No Date, Math.random, timers or CSS animation.
 * Components are plain functions `(props, f) => string` where f is the frame of the containing scene.
 */
(function (F1) {
  const FPS = 30;
  F1.FPS = FPS;

  /* ================================================================ easing (Remotion / React Native Easing) */

  const bezier = (x1, y1, x2, y2) => {
    const A = (a1, a2) => 1 - 3 * a2 + 3 * a1;
    const B = (a1, a2) => 3 * a2 - 6 * a1;
    const C = (a1) => 3 * a1;
    const calc = (t, a1, a2) => ((A(a1, a2) * t + B(a1, a2)) * t + C(a1)) * t;
    const slope = (t, a1, a2) => 3 * A(a1, a2) * t * t + 2 * B(a1, a2) * t + C(a1);
    const tForX = (x) => {
      let t = x;
      for (let i = 0; i < 8; i++) {
        const s = slope(t, x1, x2);
        if (Math.abs(s) < 1e-6) break;
        t -= (calc(t, x1, x2) - x) / s;
      }
      if (t >= 0 && t <= 1 && Math.abs(calc(t, x1, x2) - x) < 1e-6) return t;
      let lo = 0;
      let hi = 1;
      t = x;
      for (let i = 0; i < 40; i++) {
        const v = calc(t, x1, x2);
        if (Math.abs(v - x) < 1e-7) break;
        if (v < x) lo = t;
        else hi = t;
        t = (lo + hi) / 2;
      }
      return t;
    };
    return (x) => (x <= 0 ? 0 : x >= 1 ? 1 : calc(tForX(x), y1, y2));
  };

  F1.Easing = {
    linear: (t) => t,
    quad: (t) => t * t,
    cubic: (t) => t * t * t,
    poly: (n) => (t) => Math.pow(t, n),
    sin: (t) => 1 - Math.cos((t * Math.PI) / 2),
    circle: (t) => 1 - Math.sqrt(1 - t * t),
    exp: (t) => Math.pow(2, 10 * (t - 1)),
    back: (s = 1.70158) => (t) => t * t * ((s + 1) * t - s),
    bezier,
    in: (f) => f,
    out: (f) => (t) => 1 - f(1 - t),
    inOut: (f) => (t) => (t < 0.5 ? f(t * 2) / 2 : 1 - f((1 - t) * 2) / 2),
  };
  F1.Easing.ease = bezier(0.42, 0, 1, 1);

  /* ================================================================ interpolate (Remotion semantics) */

  F1.clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };

  F1.interpolate = (input, inRange, outRange, opts = {}) => {
    const { easing = (t) => t, extrapolateLeft = "extend", extrapolateRight = "extend" } = opts;
    let i = 1;
    for (; i < inRange.length - 1; ++i) if (inRange[i] >= input) break;
    i -= 1;
    const inMin = inRange[i];
    const inMax = inRange[i + 1];
    const outMin = outRange[i];
    const outMax = outRange[i + 1];
    let x = input;
    if (x < inMin) {
      if (extrapolateLeft === "identity") return x;
      if (extrapolateLeft === "clamp") x = inMin;
    }
    if (x > inMax) {
      if (extrapolateRight === "identity") return x;
      if (extrapolateRight === "clamp") x = inMax;
    }
    if (outMin === outMax) return outMin;
    let r = inMax === inMin ? (x <= inMin ? 0 : 1) : (x - inMin) / (inMax - inMin);
    r = easing(r);
    return outMin + r * (outMax - outMin);
  };

  /* ================================================================ spring (damped harmonic oscillator, Remotion defaults) */

  /**
   * F1.spring({ frame, fps?, config: { damping = 10, mass = 1, stiffness = 100 }, from = 0, to = 1 })
   * Same closed form Remotion uses: before frame 0 it returns `from`.
   */
  F1.spring = ({ frame, fps = FPS, config = {}, from = 0, to = 1 }) => {
    const { damping = 10, mass = 1, stiffness = 100 } = config;
    if (frame <= 0) return from;
    const t = frame / fps;
    const zeta = damping / (2 * Math.sqrt(stiffness * mass));
    const w0 = Math.sqrt(stiffness / mass);
    const x0 = 1;
    let x;
    if (zeta < 1) {
      const w1 = w0 * Math.sqrt(1 - zeta * zeta);
      const env = Math.exp(-zeta * w0 * t);
      x = 1 - env * (((zeta * w0 * x0) / w1) * Math.sin(w1 * t) + x0 * Math.cos(w1 * t));
    } else if (zeta === 1) {
      x = 1 - Math.exp(-w0 * t) * (x0 + w0 * x0 * t);
    } else {
      const w2 = w0 * Math.sqrt(zeta * zeta - 1);
      const env = Math.exp(-zeta * w0 * t);
      x = 1 - (env * (zeta * w0 * x0 * Math.sinh(w2 * t) + w2 * x0 * Math.cosh(w2 * t))) / w2;
    }
    return from + (to - from) * x;
  };

  /* ================================================================ random (Remotion's mulberry32) */

  const mulberry32 = (a) => {
    let t = a + 0x6d2b79f5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const hashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  };
  /** Deterministic 0..1 for a string or number seed. */
  F1.random = (seed) => (typeof seed === "number" ? mulberry32(seed * 10000000000) : mulberry32(hashCode(String(seed))));

  /* ================================================================ anim helpers (toon/anim.ts) */

  F1.easeOut = F1.Easing.out(F1.Easing.cubic);
  F1.backOut = F1.Easing.out(F1.Easing.back(1.7));
  /** Fast-out, long settle: the signature ease of the photo kit. */
  F1.expoOut = bezier(0.16, 1, 0.3, 1);
  F1.expoInOut = bezier(0.7, 0, 0.2, 1);
  /** Gentle glide for Ken Burns moves. */
  F1.glide = F1.Easing.inOut(F1.Easing.sin);

  /** 0 -> 1 progress starting at frame `at`, lasting `frames`. */
  F1.ramp = (f, at, frames = 12, easing = F1.easeOut) => F1.interpolate(f, [at, at + frames], [0, 1], { ...F1.clamp, easing });
  /** Pop scale: 0 -> ~1.1 -> 1 with overshoot. */
  F1.popScale = (f, at, frames = 14) => F1.ramp(f, at, frames, F1.backOut);
  /** Sine in [-1, 1] with a period in seconds; `phase` in cycles. */
  F1.wave = (t, period, phase = 0) => Math.sin(Math.PI * 2 * (t / period + phase));
  F1.pulse = (t, period, phase = 0) => 0.5 + 0.5 * F1.wave(t, period, phase);
  F1.driftPx = (t, pxPerSec = -2) => t * pxPerSec;
  F1.clamp01 = (n) => Math.min(1, Math.max(0, n));
  F1.lerp = (a, b, t) => a + (b - a) * t;

  /* ================================================================ timed values (mascot/timed.ts) */

  /** A value, or a list of [frame, value] steps; a step holds until the next. */
  F1.isTimeline = (v) => Array.isArray(v) && v.length > 0 && Array.isArray(v[0]) && typeof v[0][0] === "number";
  F1.sample = (v, f) => {
    if (!F1.isTimeline(v)) return { value: v, since: Math.max(0, f), at: 0 };
    const steps = [...v].sort((a, b) => a[0] - b[0]);
    let i = 0;
    for (let k = 0; k < steps.length; k++) if (steps[k][0] <= f) i = k;
    return { value: steps[i][1], since: Math.max(0, f - steps[i][0]), prev: i > 0 ? steps[i - 1][1] : undefined, at: steps[i][0] };
  };
  F1.stepFrames = (v) => (F1.isTimeline(v) ? v.map((s) => s[0]) : []);
  /** Talking: true, false, or [start, end) frame ranges -> frames since the active range began, or -1. */
  F1.talkFrameAt = (talking, f, at = 0) => {
    if (talking === true) return Math.max(0, f - at);
    if (!talking) return -1;
    for (const [a, b] of talking) if (f >= a && f < b) return f - a;
    return -1;
  };

  /* ================================================================ colour */

  const parse = (hex) => {
    let h = hex.replace("#", "");
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };
  const hex2 = (n) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, "0");
  /** Mix two #rrggbb colours; t=0 gives a, t=1 gives b. */
  F1.mix = (a, b, t) => {
    const [r1, g1, b1] = parse(a);
    const [r2, g2, b2] = parse(b);
    return `#${hex2(r1 + (r2 - r1) * t)}${hex2(g1 + (g2 - g1) * t)}${hex2(b1 + (b2 - b1) * t)}`;
  };
  /** "#rrggbb" + alpha 0..1 -> "#rrggbbaa". */
  F1.alpha = (hex, a) => `${hex}${Math.round(F1.clamp01(a) * 255).toString(16).padStart(2, "0")}`;

  /* ================================================================ theme (from the CSS variables) */

  const cssVar = (name) => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
    if (!v) throw new Error(`[f1] missing CSS variable --${name} (is lib/f1/f1.css linked before core.js?)`);
    return v.toLowerCase();
  };
  const group = (prefix, names) => Object.fromEntries(names.map((n) => [n.replace(/-([a-z])/g, (_, c) => c.toUpperCase()), cssVar(`${prefix}-${n}`)]));

  const editorial = group("editorial", ["ink", "accent", "panel", "bg", "white", "accent-on-dark", "accent-on-light", "muted", "muted-on-dark", "rule"]);
  const mascot = group("mascot", ["ink", "deep", "cream", "sage", "sage-deep", "green", "mog", "cheek", "mouth", "tongue"]);
  const objects = {
    liveries: group("objects-livery", ["red", "amber", "mint", "sky", "pink", "lilac"]),
    skins: [1, 2, 3, 4, 5].map((i) => cssVar(`objects-skin-${i}`)),
    hairs: group("objects-hair", ["black", "brown", "auburn", "blonde", "grey", "white", "pink", "blue"]),
    ...group("objects", ["suit", "shoe", "asphalt", "paper", "wood", "velvet", "brass"]),
    old: group("objects-old", ["ground", "ground-deep", "tan", "cream", "red", "amber"]),
  };
  const brand = group("brand", ["f1", "netflix", "youtube", "instagram", "tiktok", "tiktok-pink", "apple", "ferrari", "mercedes", "red-bull"]);
  const chart = {
    highlight: editorial.accent,
    series: [1, 2, 3, 4, 5].map((i) => cssVar(`chart-series-${i}`)),
    muted: cssVar("chart-muted"),
    grid: editorial.panel,
    label: editorial.muted,
  };
  const font = { display: cssVar("font-display"), body: cssVar("font-body"), title: cssVar("font-title"), hand: cssVar("font-hand") };
  const doodle = group("doodle", ["paper", "ink", "coral", "coral-soft", "coral-light", "ice", "ice-deep", "butter", "mint", "grey", "muted", "night"]);
  // Legacy flat-kit names used throughout the scenes (values come from the groups above).
  const toon = {
    paper: editorial.white,
    sage: editorial.panel,
    sageDeep: editorial.rule,
    green: editorial.accent, // primary accent (name is historical)
    ink: editorial.ink,
    forest: "#0a0a0a",
    accentText: editorial.accentOnLight,
    accentOnDark: editorial.accentOnDark,
    ground: editorial.bg,
    groundAlt: editorial.panel,
    groundDeep: "#1a1a1a",
    red: objects.liveries.red,
    redText: "#b3261e",
    amber: objects.liveries.amber,
    mint: objects.liveries.mint,
    sky: objects.liveries.sky,
    pink: objects.liveries.pink,
    lilac: objects.liveries.lilac,
    cream: editorial.ink, // TEXT colour on the light ground
    muted: editorial.muted,
    skins: objects.skins,
    hairs: objects.hairs,
    shoe: objects.shoe,
    suit: objects.suit,
    old: { ground: objects.old.ground, groundDeep: objects.old.groundDeep, tan: objects.old.tan, cream: objects.old.cream, red: objects.old.red, amber: objects.old.amber },
    font,
  };
  F1.theme = { editorial, mascot, objects, brand, chart, toon, font, doodle };
  F1.shade = (c, amount = 0.2) => F1.mix(c, toon.groundDeep, amount);
  F1.tint = (c, amount = 0.2) => F1.mix(c, toon.paper, amount);

  /* ================================================================ markup */

  const UNITLESS = new Set(["opacity", "zIndex", "fontWeight", "lineHeight", "flex", "flexGrow", "flexShrink", "order", "zoom", "scale"]);
  /** React-style style object -> css text (numbers get px except unitless props). */
  F1.css = (style) =>
    Object.entries(style)
      .filter(([, v]) => v !== undefined && v !== null && v !== false)
      .map(([k, v]) => {
        const prop = k.startsWith("--") ? k : k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`).replace(/^webkit-/, "-webkit-");
        const val = typeof v === "number" && !UNITLESS.has(k) ? `${v}px` : String(v).replace(/"/g, "'");
        return `${prop}:${val}`;
      })
      .join(";");
  F1.esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  /** Join fragments, dropping null / false / undefined (like React children). */
  F1.join = (...parts) => parts.flat(Infinity).filter((p) => p !== null && p !== undefined && p !== false && p !== "").join("");
  /** Ids for clip paths etc.: unique per scene and stable for a given render order (React's useId). */
  let uidPrefix = "f1";
  let uidCount = 0;
  F1.uidScope = (scope) => {
    uidPrefix = String(scope).replace(/[^a-zA-Z0-9]/g, "");
    uidCount = 0;
  };
  F1.uid = () => `${uidPrefix}u${uidCount++}`;
  /** Round for attributes (keeps markup short and stable). */
  F1.n = (v, d = 2) => (Number.isFinite(v) ? +v.toFixed(d) : 0);

  /* ================================================================ morph: patch DOM to match markup */

  const tpl = document.createElement("template");
  const patchAttrs = (a, b) => {
    for (let i = a.attributes.length - 1; i >= 0; i--) {
      const name = a.attributes[i].name;
      if (!b.hasAttribute(name)) a.removeAttribute(name);
    }
    for (const { name, value } of b.attributes) if (a.getAttribute(name) !== value) a.setAttribute(name, value);
  };
  const patchChildren = (from, to) => {
    const next = [...to.childNodes];
    for (let i = 0; i < next.length; i++) {
      const n = next[i];
      const o = from.childNodes[i];
      if (!o) from.appendChild(n);
      else if (o.nodeType !== n.nodeType || o.nodeName !== n.nodeName) from.replaceChild(n, o);
      else if (o.nodeType === 1) {
        patchAttrs(o, n);
        patchChildren(o, n);
      } else if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue;
    }
    while (from.childNodes.length > next.length) from.removeChild(from.lastChild);
  };
  /** Make `el`'s children match `html`, reusing existing nodes (so images never reload). */
  F1.morph = (el, html) => {
    tpl.innerHTML = html;
    patchChildren(el, tpl.content);
  };

  /* ================================================================ scenes */

  const ready = (key, promise) => {
    window.__hf = window.__hf || {};
    window.__hf.buildReady = window.__hf.buildReady || {};
    window.__hf.buildReady[key] = promise;
  };
  const decodeAll = (root) =>
    Promise.all([...root.querySelectorAll("img")].map((img) => (img.decode ? img.decode().catch(() => undefined) : undefined)));

  /**
   * Build a scene's paused timeline. `render(f, ctx)` returns the markup of the procedural layer `#<id>-art`, or an
   * object { art, top, ... } for several layers `#<id>-art`, `#<id>-top` ... (interleave them with native elements by
   * z-index). ctx = { S (voice section or null), D (scene length in frames), id }.
   *   opts.frames  scene length for compositions that are not voice sections
   *   opts.build   (tl, ctx) => add native GSAP tweens to the same timeline
   *   opts.root    for a file mounted several times: its mount root (layers are then [data-f1-layer="art"] inside it)
   * Returns the timeline; the scene script registers it last, so HyperFrames maps it to the right mount:
   *   window.__timelines["hook-1"] = F1.scene("hook-1", (f, { S, D }) => ...);
   * (Composition scripts get a scoped `window`/`document`; this library does not, so it never registers itself.)
   */
  let sceneCount = 0;
  F1.scene = (id, render, opts = {}) => {
    const S = F1.VOICE && F1.VOICE.sections.some((s) => s.id === id) ? F1.section(id) : null;
    const D = opts.frames ?? (S ? F1.sceneFrames(id) : 0);
    if (!D) throw new Error(`[f1] scene ${id}: unknown length (pass opts.frames)`);
    const ctx = { S, D, id };
    const scope = `${id}_${sceneCount++}`;
    const layers = {};
    const layer = (key) => {
      if (!(key in layers)) {
        layers[key] = opts.root ? opts.root.querySelector(`[data-f1-layer="${key}"]`) : document.getElementById(`${id}-${key}`);
        if (!layers[key]) throw new Error(`[f1] scene ${id}: missing layer element ${opts.root ? `[data-f1-layer="${key}"]` : `#${id}-${key}`}`);
      }
      return layers[key];
    };
    const p = { f: 0 };
    const draw = () => {
      const f = Math.round(p.f * 1000) / 1000;
      F1.uidScope(scope);
      const out = render(f, ctx);
      if (typeof out === "string") F1.morph(layer("art"), out);
      else for (const [key, html] of Object.entries(out)) F1.morph(layer(key), html || "");
    };
    const tl = gsap.timeline({ paused: true });
    tl.to(p, { f: D, duration: D / FPS, ease: "none", onUpdate: draw }, 0);
    if (opts.build) opts.build(tl, ctx);
    draw();
    ready(`f1-${scope}`, decodeAll(opts.root || layer("art").parentElement || document.body));
    return tl;
  };
})((globalThis.F1 = globalThis.F1 || {}));
