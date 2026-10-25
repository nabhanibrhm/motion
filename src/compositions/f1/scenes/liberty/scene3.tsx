import { AbsoluteFill } from "remotion";
import { SceneProps } from "../../manifest";
import { Mascot, VelvetDoor } from "../../components/mascot";
import { useLine, useSpeaking, useWordFrame } from "../../components/hooks";
import { Backdrop, Head } from "./kit";

/** Dark scene: no behind-the-scenes posts. WEC presses an eye to the closed door and gives up. */
export const Liberty3: React.FC<SceneProps> = ({ section }) => {
  const mog = useSpeaking(section, "mog");
  const wec = useSpeaking(section, "wec");
  const social = useWordFrame(section, "Social");
  const wl = useLine(section, 1);
  return (
    <AbsoluteFill>
      <Backdrop dark />
      <Head x={140} y={150} w={780} kicker="The rule" headline="No behind-the-scenes footage" size={76} dark at={social} />
      <VelvetDoor x={1300} y={830} scale={1} enter="none" />
      <Mascot character="mog" x={330} scale={1.15} facing="right" enter="none" talking={mog} look={[[0, "auto"], [wl.start - 4, { x: 1660, y: 600 }]]} gesture={[[0, "idle"], [social + 20, { gesture: "point", dir: "right" }], [social + 70, "idle"]]} />
      <Mascot character="bog" x={880} scale={0.95} enter="none" facing="right" look={{ x: 330, y: 560 }} gesture="listen" expression="confused" />
      <Mascot character="wec" x={1660} scale={0.9} enter="none" facing="left" talking={wec} look={{ x: 1300, y: 600 }} gesture={[[0, "peek"], [wl.end - 10, "shrug"]]} expression={[[0, "neutral"], [wl.end - 10, "confused"]]} />
    </AbsoluteFill>
  );
};
