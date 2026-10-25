import { AbsoluteFill } from "remotion";
import { Mascot } from "../../components/mascot";
import { PhotoCard } from "../../components/photo";
import { useLine, useSpeaking, useWordFrame } from "../../components/hooks";
import { Sfx } from "../../components/Sfx";
import { SceneProps } from "../../manifest";
import { Bg } from "./kit";

/** demo-7 (dark): WEC admits it is not just cars; MOG lands the lifestyle point over a crowd card. */
export const Demo7: React.FC<SceneProps> = ({ section }) => {
  const mog = useLine(section, 1);
  const coming = useWordFrame(section, "coming");
  const lifestyle = useWordFrame(section, "lifestyle");
  const wecTalk = useSpeaking(section, "wec");
  const mogTalk = useSpeaking(section, "mog");

  return (
    <AbsoluteFill>
      <Bg dark />
      <PhotoCard
        layout="center"
        tone="dark"
        photos={[{ src: "assets/crowds/usgp_quali_grandstand.jpg", fit: "cover", focal: { x: 0.5, y: 0.5 } }]}
        kicker="Gen Z"
        headline="More than a race weekend"
        at={4}
        push
      />
      <Mascot
        character="wec"
        x={260}
        y={830}
        scale={0.95}
        facing="right"
        at={0}
        enter="fade"
        look={[[0, { x: 960, y: 480 }], [mog.start, { x: 1650, y: 600 }]]}
        talking={wecTalk}
        gesture={[[0, "idle"], [coming - 14, "shrug"], [mog.start - 10, "listen"]]}
        expression={[[0, "surprised"], [mog.start, "happy"]]}
      />
      <Mascot
        character="mog"
        x={1650}
        y={830}
        scale={1.0}
        facing="left"
        at={8}
        enter="pop"
        look={[[0, { x: 260, y: 600 }], [mog.start - 8, { x: 960, y: 480 }]]}
        talking={mogTalk}
        gesture={[[0, "listen"], [mog.start - 4, "idle"], [lifestyle - 10, { gesture: "point", dir: "left" }]]}
        expression="neutral"
      />
      <Sfx name="swoosh-soft" at={6} volume={0.15} />
    </AbsoluteFill>
  );
};
