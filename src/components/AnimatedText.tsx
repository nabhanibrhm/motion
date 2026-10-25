import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  text: string;
  fontSize: number;
  color: string;
  fontFamily: string;
  fontWeight?: number;
  delay?: number;
  stagger?: number;
};

// Word-by-word spring reveal: each word rises and fades in.
export const AnimatedText: React.FC<Props> = ({
  text,
  fontSize,
  color,
  fontFamily,
  fontWeight = 700,
  delay = 0,
  stagger = 4,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: `0 ${fontSize * 0.28}px`,
        fontSize,
        color,
        fontFamily,
        fontWeight,
        lineHeight: 1.1,
        textAlign: "center",
      }}
    >
      {words.map((word, i) => {
        const progress = spring({
          frame: frame - delay - i * stagger,
          fps,
          config: { damping: 14, mass: 0.6 },
        });
        const y = interpolate(progress, [0, 1], [fontSize * 0.6, 0]);
        return (
          <span key={i} style={{ display: "inline-block", opacity: progress, transform: `translateY(${y}px)` }}>
            {word}
          </span>
        );
      })}
    </div>
  );
};
