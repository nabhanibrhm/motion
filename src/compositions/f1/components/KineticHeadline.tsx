import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { toon } from "../../../theme";
import { normalizeWord } from "./hooks";

type Props = {
  text: string; // "\n" starts a new line
  highlight?: string | string[]; // words rendered in `highlightColor`
  fontSize?: number;
  delay?: number;
  stagger?: number;
  variant?: "slam" | "slide";
  color?: string;
  highlightColor?: string; // default: editorial accent
  align?: "left" | "center" | "right";
  exitAt?: number; // frame to start fading out (over 8 frames)
};

const justify = { left: "flex-start", center: "center", right: "flex-end" } as const;

// Words slam (scale-down) or slide (from the left) in with springs. Flat colours, chunky display font.
export const KineticHeadline: React.FC<Props> = ({
  text,
  highlight = [],
  fontSize = 120,
  delay = 0,
  stagger = 5,
  variant = "slam",
  color = toon.cream,
  highlightColor = toon.green,
  align = "center",
  exitAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const marked = (Array.isArray(highlight) ? highlight : [highlight]).map(normalizeWord);
  const opacity =
    exitAt === undefined
      ? 1
      : interpolate(frame, [exitAt, exitAt + 8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  let n = 0;

  return (
    <div
      style={{
        opacity,
        fontFamily: toon.font.display,
        fontWeight: 800,
        fontSize,
        lineHeight: 1.02,
        letterSpacing: "-0.01em",
        textAlign: align,
        color,
      }}
    >
      {text.split("\n").map((line, li) => (
        <div key={li} style={{ display: "flex", flexWrap: "wrap", gap: `0 ${fontSize * 0.25}px`, justifyContent: justify[align] }}>
          {line.split(" ").map((word, wi) => {
            const p = spring({
              frame: frame - delay - n++ * stagger,
              fps,
              config: { damping: variant === "slam" ? 11 : 16, mass: 0.6, stiffness: 160 },
            });
            const transform =
              variant === "slam"
                ? `scale(${interpolate(p, [0, 1], [1.7, 1])})`
                : `translateX(${interpolate(p, [0, 1], [-fontSize * 1.2, 0])}px)`;
            return (
              <span
                key={wi}
                style={{
                  display: "inline-block",
                  opacity: Math.min(1, p * 2),
                  transform,
                  color: marked.includes(normalizeWord(word)) ? highlightColor : undefined,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
