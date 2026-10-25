import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { editorial, toon } from "../../../theme";
import { backOut, clamp, ramp } from "./toon/anim";
import { Car } from "./toon/Car";

type Props = { index: number; title: string };

const ROAD_Y = 790;

// Editorial chapter card: black ground, accent chapter number, white title, an accent rule and a little car
// driving it in. Calm fade in/out (no iris wipe). Small text uses the contrast-checked light grey, never small pink on black.
export const ChapterCard: React.FC<Props> = ({ index, title }) => {
  const frame = useCurrentFrame();
  const { width, durationInFrames: D } = useVideoConfig();
  const fade = Math.min(ramp(frame, 0, 8), 1 - ramp(frame, D - 10, 10));

  const num = ramp(frame, 4, 16, backOut);
  const name = ramp(frame, 12, 14);
  const kick = ramp(frame, 4, 12);

  const carX = interpolate(frame, [3, 40], [-380, width + 380], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const ruleW = Math.max(0, carX - 230);

  return (
    <AbsoluteFill style={{ background: editorial.ink, opacity: fade }}>
      <div style={{ position: "absolute", left: 140, top: 150, width: 1400 }}>
        <div
          style={{
            fontFamily: toon.font.body,
            fontWeight: 800,
            fontSize: 32,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: editorial.mutedOnDark,
            opacity: kick,
            transform: `translateX(${(1 - kick) * 26}px)`,
          }}
        >
          Chapter
        </div>
        <div
          style={{
            fontFamily: toon.font.display,
            fontWeight: 800,
            fontSize: 330,
            lineHeight: 0.95,
            color: editorial.accent, // 330 px: large text, 4.0:1 on black is fine
            letterSpacing: "-0.02em",
            opacity: Math.min(1, num * 3),
            transform: `scale(${num})`,
            transformOrigin: "0% 60%",
          }}
        >
          {String(index).padStart(2, "0")}
        </div>
        <div
          style={{
            fontFamily: toon.font.display,
            fontWeight: 800,
            fontSize: 112,
            lineHeight: 1.04,
            letterSpacing: "-0.01em",
            color: editorial.white,
            opacity: name,
            transform: `translateX(${(1 - name) * 26}px)`,
          }}
        >
          {title}
        </div>
      </div>

      {/* accent rule + hairline trailing the car */}
      <div style={{ position: "absolute", left: 0, top: ROAD_Y, width: ruleW, height: 14, background: editorial.accent }} />
      <div style={{ position: "absolute", left: 0, top: ROAD_Y + 26, width: ruleW, height: 4, background: editorial.white, opacity: 0.85 }} />
      <Car x={carX} y={ROAD_Y + 4} size={520} speed={1} number={index} livery={{ main: toon.red, secondary: toon.paper }} shadow={false} />
    </AbsoluteFill>
  );
};
