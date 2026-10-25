import { CSSProperties } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { toon } from "../../../../theme";
import { normalizeWord } from "../hooks";
import { mix } from "./color";
import { ramp } from "./anim";

export type WordsProps = {
  /** Small uppercase letter-spaced line above the headline. */
  kicker?: string;
  /** Headline: array of lines, or one string where "\n" breaks lines. Wrap a phrase in *stars* to highlight it. */
  lines: string[] | string;
  /** Soft sans lines under the headline. */
  sub?: string | string[];
  /** Words (case/punctuation-insensitive) rendered in the highlight colour. */
  highlight?: string | string[];
  /** "accent" | "red" | "amber" | "mint" | "sky" (text-safe on light) or any css colour (default "accent"). */
  highlightColor?: string;
  kickerColor?: string;
  /** Scene frame at which the first element starts to enter. */
  at?: number;
  /** Frames between consecutive elements (kicker, each line, each sub line). Default 8. */
  stagger?: number;
  /** Explicit start frames for each element in order [kicker?, ...lines, ...sub]; overrides at/stagger. */
  startAt?: number[];
  /** Extra frames between words of the same line (0 = the whole line enters together). */
  wordStagger?: number;
  /** Scene frame at which the whole block fades out (over 8 frames). */
  exitAt?: number;
  /** Left edge in px (default 140). */
  x?: number;
  /** Column width in px (default 820). */
  width?: number;
  /** Headline font size (default 104). Auto-shrinks if a line would not fit the column. */
  fontSize?: number;
  subSize?: number;
  /** "center" (default) centres the block in the area above the caption zone, "top"/"bottom" pin it. */
  valign?: "center" | "top" | "bottom";
  /** Top offset in px when valign is "top". */
  top?: number;
  /** Drift in px/s (default -2). */
  drift?: number;
  style?: CSSProperties;
};

const COLORS: Record<string, string> = { accent: toon.green, red: toon.redText, amber: "#B26A00", mint: "#1E8A68", sky: "#2A6FB8" };
const CAPTION_ZONE = 300;

type Tok = { word: string; marked: boolean };

// Splits a line into word tokens, honouring *starred* highlight spans.
const tokenise = (line: string): Tok[] => {
  const out: Tok[] = [];
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

// Left-column text block: kicker, headline lines and sub lines, each fading in from the right.
export const Words: React.FC<WordsProps> = ({
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
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const t = frame / fps;
  const headLines = Array.isArray(lines) ? lines : lines.split("\n");
  const subLines = sub === undefined ? [] : Array.isArray(sub) ? sub : [sub];
  const marks = (Array.isArray(highlight) ? highlight : [highlight]).map(normalizeWord);
  const hl = COLORS[highlightColor] ?? highlightColor;

  // Shrink the headline so the longest line fits the column.
  const longest = Math.max(...headLines.map((l) => l.replace(/\*/g, "").length), 1);
  const fit = Math.min(fontSize, Math.max(52, width / (longest * 0.54)));

  let idx = 0;
  const nextStart = () => {
    const i = idx++;
    return startAt?.[i] ?? at + i * stagger;
  };
  const enter = (s: number) => {
    const p = ramp(frame, s, 12);
    return { opacity: p, transform: `translateX(${(1 - p) * 26}px)` };
  };

  const out = exitAt === undefined ? 1 : 1 - ramp(frame, exitAt, 8);
  const justify = valign === "center" ? "center" : valign === "top" ? "flex-start" : "flex-end";

  const kickerStart = kicker ? nextStart() : 0;
  const lineStarts = headLines.map(() => nextStart());
  const subStarts = subLines.map(() => nextStart());

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 0,
        width,
        height: height - CAPTION_ZONE,
        display: "flex",
        flexDirection: "column",
        justifyContent: justify,
        paddingTop: valign === "top" ? top : 0,
        paddingBottom: valign === "bottom" ? 40 : 0,
        boxSizing: "border-box",
        opacity: out,
        transform: `translateX(${t * drift}px)`,
        ...style,
      }}
    >
      {kicker && (
        <div
          style={{
            ...enter(kickerStart),
            fontFamily: toon.font.body,
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: kickerColor,
            marginBottom: 18,
          }}
        >
          {kicker}
        </div>
      )}
      {headLines.map((line, li) => {
        const toks = tokenise(line);
        return (
          <div key={li} style={{ fontFamily: toon.font.display, fontSize: fit, lineHeight: 1.04, fontWeight: 800, letterSpacing: "-0.01em", color: toon.cream }}>
            {toks.map((tk, wi) => {
              const lit = tk.marked || marks.includes(normalizeWord(tk.word));
              return (
                <span key={wi} style={{ display: "inline-block", marginRight: "0.26em", color: lit ? hl : undefined, ...enter(lineStarts[li] + wi * wordStagger) }}>
                  {tk.word}
                </span>
              );
            })}
          </div>
        );
      })}
      {subLines.map((line, si) => (
        <div
          key={si}
          style={{
            ...enter(subStarts[si]),
            fontFamily: toon.font.body,
            fontSize: subSize,
            lineHeight: 1.3,
            fontWeight: 500,
            color: mix(toon.cream, toon.ground, 0.28),
            marginTop: si === 0 ? 26 : 4,
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
};
