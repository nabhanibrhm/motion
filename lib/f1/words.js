/*
 * Text and labels (port of toon/Words.tsx and toon/Tag.tsx). `(props, f) => HTML string`.
 *
 *   F1.Words({ kicker, lines, sub, highlight, highlightColor, kickerColor, at, stagger, startAt, wordStagger,
 *              exitAt, x = 140, width = 820, fontSize = 104, subSize = 44, valign, top, drift = -2 }, f)
 *       left-column text block: kicker, headline lines, sub lines, each fading in from the right.
 *       Wrap a phrase in *stars* to highlight it. The headline shrinks so the longest line fits the column.
 *   F1.Tag({ text, x, y, at, point, variant, fontSize, labelWidth }, f)    flat label with optional leader line
 *   F1.Leader({ from, to, at, frames, color, width, dot }, f)              thin leader line (full-frame svg)
 *   F1.CutEdge({ x, y, w, h, at, frames, color }, f)                       dashed cut-away outline
 */
(function (F1) {
  const { toon } = F1.theme;
  const n = F1.n;
  const COLORS = { accent: toon.green, red: toon.redText, amber: "#b26a00", mint: "#1e8a68", sky: "#2a6fb8" };
  const CAPTION_ZONE = 300;

  const tokenise = (line) => {
    const out = [];
    let marked = false;
    for (const part of line.split(/(\*)/)) {
      if (part === "*") {
        marked = !marked;
        continue;
      }
      for (const w of part.split(/\s+/).filter(Boolean)) out.push({ word: w, marked });
    }
    return out;
  };

  F1.Words = (props, f) => {
    const {
      kicker,
      lines,
      sub,
      highlight = [],
      highlightColor = "accent",
      kickerColor = toon.accentText,
      at = 0,
      stagger = 8,
      startAt,
      wordStagger = 0,
      exitAt,
      x = 140,
      width = 820,
      fontSize = 104,
      subSize = 44,
      valign = "center",
      top = 150,
      drift = -2,
      style = {},
    } = props;
    const t = f / F1.FPS;
    const headLines = Array.isArray(lines) ? lines : lines.split("\n");
    const subLines = sub === undefined ? [] : Array.isArray(sub) ? sub : [sub];
    const marks = (Array.isArray(highlight) ? highlight : [highlight]).map(F1.normalizeWord);
    const hl = COLORS[highlightColor] ?? highlightColor;
    const longest = Math.max(...headLines.map((l) => l.replace(/\*/g, "").length), 1);
    const fit = Math.min(fontSize, Math.max(52, width / (longest * 0.54)));

    let idx = 0;
    const nextStart = () => {
      const i = idx++;
      return (startAt && startAt[i]) ?? at + i * stagger;
    };
    const enter = (s) => {
      const p = F1.ramp(f, s, 12);
      return { opacity: n(p, 3), transform: `translateX(${n((1 - p) * 26)}px)` };
    };
    const out = exitAt === undefined ? 1 : 1 - F1.ramp(f, exitAt, 8);
    const justify = valign === "center" ? "center" : valign === "top" ? "flex-start" : "flex-end";
    const kickerStart = kicker ? nextStart() : 0;
    const lineStarts = headLines.map(() => nextStart());
    const subStarts = subLines.map(() => nextStart());

    const kick = kicker
      ? `<div style="${F1.css({ ...enter(kickerStart), fontFamily: toon.font.body, fontSize: 32, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: kickerColor, marginBottom: 18 })}">${F1.esc(kicker)}</div>`
      : "";
    const heads = headLines
      .map((line, li) => {
        const spans = tokenise(line)
          .map((tk, wi) => {
            const lit = tk.marked || marks.includes(F1.normalizeWord(tk.word));
            return `<span style="${F1.css({ display: "inline-block", marginRight: "0.26em", color: lit ? hl : undefined, ...enter(lineStarts[li] + wi * wordStagger) })}">${F1.esc(tk.word)}</span>`;
          })
          .join("");
        return `<div style="${F1.css({ fontFamily: toon.font.display, fontSize: n(fit), lineHeight: 1.04, fontWeight: 800, letterSpacing: "-0.01em", color: toon.cream })}">${spans}</div>`;
      })
      .join("");
    const subs = subLines
      .map(
        (line, si) =>
          `<div style="${F1.css({ ...enter(subStarts[si]), fontFamily: toon.font.body, fontSize: subSize, lineHeight: 1.3, fontWeight: 500, color: F1.mix(toon.cream, toon.ground, 0.28), marginTop: si === 0 ? 26 : 4 })}">${F1.esc(line)}</div>`,
      )
      .join("");
    const wrap = F1.css({
      position: "absolute",
      left: x,
      top: 0,
      width,
      height: 1080 - CAPTION_ZONE,
      display: "flex",
      flexDirection: "column",
      justifyContent: justify,
      paddingTop: valign === "top" ? top : 0,
      paddingBottom: valign === "bottom" ? 40 : 0,
      boxSizing: "border-box",
      opacity: n(out, 3),
      transform: `translateX(${n(t * drift)}px)`,
      ...style,
    });
    return `<div style="${wrap}">${kick}${heads}${subs}</div>`;
  };

  /* ================================================================ Tag, Leader, CutEdge */

  F1.Leader = ({ from, to, at = 0, frames = 14, color = F1.mix(toon.cream, toon.ground, 0.3), width = 3, dot = true }, f) => {
    const p = F1.ramp(f, at, frames);
    const dp = F1.popScale(f, at, 10);
    return `<svg width="1920" height="1080" style="position:absolute;inset:0;pointer-events:none;overflow:visible"><path d="M ${n(from.x)} ${n(from.y)} L ${n(to.x)} ${n(to.y)}" pathLength="1" stroke="${color}" stroke-width="${width}" stroke-linecap="round" fill="none" stroke-dasharray="1 1" stroke-dashoffset="${n(1 - p, 4)}"/>${
      dot ? `<circle cx="${n(from.x)}" cy="${n(from.y)}" r="${n(7 * dp)}" fill="${color}"/>` : ""
    }</svg>`;
  };

  const VARIANTS = {
    light: { bg: toon.paper, fg: toon.ink },
    red: { bg: toon.green, fg: toon.paper },
    amber: { bg: toon.amber, fg: toon.ink },
    dark: { bg: toon.ink, fg: toon.paper },
  };

  F1.Tag = ({ text, x, y, at = 0, point, variant = "light", fontSize = 34, labelWidth }, f) => {
    const t = f / F1.FPS;
    const v = VARIANTS[variant];
    const padX = 22;
    const w = labelWidth ?? text.length * fontSize * 0.55 + padX * 2;
    const h = fontSize * 1.22 + 18;
    const bob = F1.wave(t, 2.5, x * 0.003) * 2;
    const s = F1.popScale(f, at, 12);
    let leader = "<!--leader-->";
    if (point) {
      const dx = point.x - x;
      const dy = point.y - y;
      const k = Math.min(dx === 0 ? Infinity : w / 2 / Math.abs(dx), dy === 0 ? Infinity : h / 2 / Math.abs(dy));
      leader = F1.Leader({ from: point, to: { x: x + dx * k, y: y + dy * k }, at: Math.max(0, at - 10), frames: 12 }, f);
    }
    const style = F1.css({
      position: "absolute",
      left: n(x - w / 2),
      top: n(y - h / 2 + bob),
      width: n(w),
      height: n(h),
      borderRadius: 16,
      background: v.bg,
      color: v.fg,
      fontFamily: toon.font.body,
      fontWeight: 800,
      fontSize,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      whiteSpace: "nowrap",
      boxShadow: `0 6px 0 ${toon.ink}33, inset 0 0 0 3px ${variant === "light" ? toon.sageDeep : "transparent"}`,
      transform: `scale(${n(s, 4)})`,
      opacity: n(Math.min(1, s * 4), 3),
      visibility: s <= 0.001 ? "hidden" : "visible",
    });
    return `${leader}<div style="${style}">${F1.esc(text)}</div>`;
  };

  F1.CutEdge = ({ x, y, w, h, at = 0, frames = 16, color = toon.cream }, f) => {
    const p = F1.ramp(f, at, frames);
    const off = n(-f * 0.4);
    const shape =
      h === undefined
        ? `<circle cx="${x}" cy="${y}" r="${w / 2}" fill="none" stroke="${color}" stroke-width="4" stroke-dasharray="14 12" stroke-dashoffset="${off}"/>`
        : `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="28" fill="none" stroke="${color}" stroke-width="4" stroke-dasharray="14 12" stroke-dashoffset="${off}"/>`;
    return `<svg width="1920" height="1080" style="position:absolute;inset:0;pointer-events:none;overflow:visible;opacity:${n(p, 3)}">${shape}</svg>`;
  };
})((globalThis.F1 = globalThis.F1 || {}));
