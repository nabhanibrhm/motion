import { AbsoluteFill } from "remotion";
import { SceneProps } from "../../manifest";
import { Mascot, VelvetDoor } from "../../components/mascot";
import { Sfx } from "../../components/Sfx";
import { useSpeaking, useWordFrame } from "../../components/hooks";
import { Backdrop, Head } from "./kit";

/** BOG meets the closed door; WEC tiptoes up and peeks through the keyhole while MOG sets the scene. */
export const Liberty1: React.FC<SceneProps> = ({ section }) => {
  const mog = useSpeaking(section, "mog");
  const bernie = useWordFrame(section, "Bernie");
  const year = useWordFrame(section, "2017");
  return (
    <AbsoluteFill>
      <Backdrop />
      <Head x={140} y={150} w={760} kicker="Before 2017" headline="A door that stayed shut" at={year} />
      <VelvetDoor x={1300} y={830} scale={1} enter="slide-right" enterFrames={22} />
      <Sfx name="swoosh-soft" at={0} />
      <Mascot character="mog" x={330} scale={1.15} facing="right" talking={mog} gesture={[[0, "idle"], [bernie - 6, { gesture: "point", dir: "right" }], [bernie + 40, "idle"]]} />
      <Mascot character="bog" x={880} scale={0.95} at={14} enter="walk-right" facing="right" look={{ x: 1300, y: 500 }} gesture="listen" expression={[[0, "neutral"], [120, "confused"]]} />
      <Mascot character="wec" x={1660} scale={0.9} at={60} enter="pop" facing="left" look={{ x: 1300, y: 600 }} gesture={[[0, "idle"], [100, "peek"]]} expression="happy" />
    </AbsoluteFill>
  );
};
