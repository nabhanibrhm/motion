import { Composition } from "remotion";
import { Explainer, explainerDuration } from "./compositions/Explainer";
import { F1Explosion } from "./compositions/f1/F1Explosion";
import { TOTAL_FRAMES } from "./compositions/f1/timeline";
import { FPS } from "./theme";

const defaultProps = {
  title: "Your idea, in motion",
  points: ["Explain the problem", "Show the solution", "Call to action"],
  cta: "Learn more",
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 16:9 landscape explainer */}
      <Composition
        id="Explainer"
        component={Explainer}
        durationInFrames={explainerDuration(defaultProps.points.length)}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
      />
      {/* 9:16 vertical cut of the same story for Reels / TikTok / Shorts */}
      <Composition
        id="Short"
        component={Explainer}
        durationInFrames={explainerDuration(defaultProps.points.length)}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={defaultProps}
      />
      {/* ~4.5 min narrated F1 explainer; length comes from the voiceover manifest */}
      <Composition
        id="F1Explosion"
        component={F1Explosion}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ captions: true }}
      />
    </>
  );
};
