import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { Background } from "../components/Background";
import { colors, fonts } from "../theme";

export type ExplainerProps = {
  title: string;
  points: string[];
  cta: string;
};

const TITLE_FRAMES = 90;
const POINT_FRAMES = 75;
const CTA_FRAMES = 90;

export const explainerDuration = (pointCount: number) =>
  TITLE_FRAMES + pointCount * POINT_FRAMES + CTA_FRAMES;

// Scale type off the shorter side so the same scenes work in 16:9 and 9:16.
const useUnit = () => {
  const { width, height } = useVideoConfig();
  return Math.min(width, height) / 100;
};

// Fade a scene out over its last frames so cuts feel smooth.
const useExitOpacity = (duration: number) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [duration - 12, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

const TitleScene: React.FC<{ title: string }> = ({ title }) => {
  const u = useUnit();
  const frame = useCurrentFrame();
  const lineWidth = interpolate(frame, [20, 50], [0, 30 * u], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 8 * u, opacity: useExitOpacity(TITLE_FRAMES) }}>
      <AnimatedText text={title} fontSize={9 * u} color={colors.text} fontFamily={fonts.heading} />
      <div style={{ marginTop: 4 * u, height: 0.8 * u, width: lineWidth, borderRadius: u, background: `linear-gradient(90deg, ${colors.accent}, ${colors.accent2})` }} />
    </AbsoluteFill>
  );
};

const PointScene: React.FC<{ index: number; text: string }> = ({ index, text }) => {
  const u = useUnit();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 10 } });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 5 * u, padding: 8 * u, opacity: useExitOpacity(POINT_FRAMES) }}>
      <div
        style={{
          width: 18 * u,
          height: 18 * u,
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: colors.surface,
          border: `${0.5 * u}px solid ${colors.accent}`,
          color: colors.accent2,
          fontFamily: fonts.heading,
          fontWeight: 800,
          fontSize: 8 * u,
          transform: `scale(${pop})`,
        }}
      >
        {index + 1}
      </div>
      <AnimatedText text={text} fontSize={7 * u} color={colors.text} fontFamily={fonts.body} fontWeight={600} delay={8} />
    </AbsoluteFill>
  );
};

const CtaScene: React.FC<{ cta: string }> = ({ cta }) => {
  const u = useUnit();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 12 } });
  const pulse = 1 + Math.sin(frame / 6) * 0.02 * Math.min(1, frame / 30);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          transform: `scale(${scale * pulse})`,
          padding: `${3 * u}px ${8 * u}px`,
          borderRadius: 10 * u,
          background: `linear-gradient(90deg, ${colors.accent}, ${colors.accent2})`,
          color: colors.text,
          fontFamily: fonts.heading,
          fontWeight: 800,
          fontSize: 7 * u,
          boxShadow: `0 ${2 * u}px ${8 * u}px ${colors.accent}66`,
        }}
      >
        {cta}
      </div>
    </AbsoluteFill>
  );
};

export const Explainer: React.FC<ExplainerProps> = ({ title, points, cta }) => {
  return (
    <AbsoluteFill>
      <Background />
      <Sequence durationInFrames={TITLE_FRAMES} name="Title">
        <TitleScene title={title} />
      </Sequence>
      {points.map((point, i) => (
        <Sequence key={i} from={TITLE_FRAMES + i * POINT_FRAMES} durationInFrames={POINT_FRAMES} name={`Point ${i + 1}`}>
          <PointScene index={i} text={point} />
        </Sequence>
      ))}
      <Sequence from={TITLE_FRAMES + points.length * POINT_FRAMES} durationInFrames={CTA_FRAMES} name="CTA">
        <CtaScene cta={cta} />
      </Sequence>
    </AbsoluteFill>
  );
};
