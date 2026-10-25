import { AbsoluteFill } from "remotion";
import { SceneProps } from "../../manifest";
import { useSpeaking, useWordFrame } from "../../components/hooks";
import { Mascot, StoryBoard } from "../../components/mascot";
import { Sfx } from "../../components/Sfx";
import { Bg, Head, Pill } from "./kit";

/** netflix-3 (dark): Netflix focused on the humans. WEC lists ego, pressure and rivalries next to the story board. */
export const Netflix3: React.FC<SceneProps> = ({ section }) => {
  const netflix = useWordFrame(section, "Netflix");
  const humans = useWordFrame(section, "humans");
  const ego = useWordFrame(section, "ego");
  const pressure = useWordFrame(section, "pressure");
  const rivalries = useWordFrame(section, "rivalries");
  const soap = useWordFrame(section, "soap");
  const mogTalking = useSpeaking(section, "mog");
  const wecTalking = useSpeaking(section, "wec");

  const BOARD = { x: 1180, y: 380 };

  return (
    <AbsoluteFill>
      <Bg dark />
      <Head x={96} y={150} w={780} dark kicker="Netflix changed the formula" kickerAt={netflix} lines={[{ text: "Less engineering.", at: humans - 24 }, { text: "More humans.", at: humans, accent: true }]} size={88} />
      <Pill text="Ego" x={96} y={470} at={ego} dark />
      <Pill text="Pressure" x={230} y={470} at={pressure} dark />
      <Pill text="Rivalries" x={470} y={470} at={rivalries} accent />

      <StoryBoard x={BOARD.x} y={BOARD.y} scale={1.35} stand at={4} enter="slide-right" highlight={1} highlightAt={rivalries} />

      <Mascot character="mog" x={420} y={830} scale={0.85} facing="right" look={[[0, { x: BOARD.x, y: BOARD.y }], [200, { x: 1650, y: 600 }]]} talking={mogTalking}
        gesture={[[0, "idle"], [humans - 4, { gesture: "point", dir: "up-right" }], [humans + 50, "idle"], [200, "listen"]]} expression={[[0, "neutral"], [210, "happy"]]} at={0} enter="none" />
      <Mascot character="wec" x={1660} y={830} scale={1.05} facing="left" look={[[0, "viewer"], [200, { x: BOARD.x, y: BOARD.y }]]} talking={wecTalking}
        gesture={[[0, "listen"], [ego - 6, { gesture: "point", dir: "up-left" }], [soap + 20, "cheer"], [soap + 70, "idle"]]} expression={[[0, "neutral"], [ego - 8, "happy"]]} at={0} enter="none" seed="w3" />

      <Sfx name="swoosh-soft" at={4} />
      <Sfx name="pop" at={ego} />
      <Sfx name="pop" at={pressure} />
      <Sfx name="pop" at={rivalries} />
    </AbsoluteFill>
  );
};
