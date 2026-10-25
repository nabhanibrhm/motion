import { AbsoluteFill } from "remotion";
import { SceneProps } from "../../manifest";
import { useSpeaking, useWordFrame } from "../../components/hooks";
import { Mascot, StoryBoard } from "../../components/mascot";
import { Sfx } from "../../components/Sfx";
import { Bg, Head, Pill } from "./kit";

/** netflix-4 (light): WEC taps a driver on the story board, BOG asks who to root for, MOG ties personalities to interest. */
export const Netflix4: React.FC<SceneProps> = ({ section }) => {
  const root = useWordFrame(section, "root");
  const watching = useWordFrame(section, "watching");
  const ambition = useWordFrame(section, "ambition");
  const ego = useWordFrame(section, "ego");
  const pressure = useWordFrame(section, "pressure");
  const rivalries = useWordFrame(section, "rivalries");
  const tenth = useWordFrame(section, "tenth");
  const huh = useWordFrame(section, "Huh");
  const mogFirst = useWordFrame(section, "exactly");
  const mogTalking = useSpeaking(section, "mog");
  const bogTalking = useSpeaking(section, "bog");

  const BOARD = { x: 1250, y: 370 };
  const MOGP = { x: 700, y: 640 };

  return (
    <AbsoluteFill>
      <Bg />
      <Head x={96} y={140} w={760} kicker="Not watching cars" kickerAt={watching} lines={[]} />
      <Pill text="Ambition" x={96} y={215} at={ambition} />
      <Pill text="Ego" x={96} y={290} at={ego} />
      <Pill text="Pressure" x={96} y={365} at={pressure} />
      <Pill text="Rivalries" x={96} y={440} at={rivalries} accent />

      <StoryBoard x={BOARD.x} y={BOARD.y} scale={1.4} stand at={0} enter="none" highlight={4} highlightAt={8} />
      <Pill text="P10: fighting to keep his seat" x={BOARD.x - 250} y={BOARD.y + 255} at={tenth} accent size={30} exitAt={huh - 6} />

      {/* BOG asks, MOG answers, BOG reacts; WEC taps the board */}
      <Mascot character="bog" x={400} y={830} scale={0.9} facing="right" look={[[0, { x: BOARD.x, y: BOARD.y }], [mogFirst, { x: MOGP.x, y: MOGP.y }]]} talking={bogTalking}
        gesture={[[0, "idle"], [root, "shrug"], [root + 40, "listen"], [huh - 8, "idle"]]} expression={[[0, "confused"], [huh, "happy"]]} at={0} enter="none" seed="b4" />
      <Mascot character="mog" x={MOGP.x} y={830} scale={0.95} facing="right" look={[[0, { x: 400, y: 640 }], [mogFirst + 60, { x: BOARD.x, y: BOARD.y }], [huh - 10, { x: 400, y: 640 }]]} talking={mogTalking}
        gesture={[[0, "listen"], [mogFirst - 4, "idle"], [rivalries - 10, { gesture: "point", dir: "up-right" }], [rivalries + 40, "idle"], [huh - 6, "listen"]]}
        expression={[[0, "neutral"], [mogFirst - 4, "smug"], [huh - 6, "neutral"]]} at={0} enter="none" />
      <Mascot character="wec" x={1700} y={830} scale={0.9} facing="left" look={{ x: BOARD.x, y: BOARD.y }} talking={false}
        gesture={[[0, { gesture: "point", dir: "up-left" }], [root + 24, "idle"]]} expression="happy" at={0} enter="none" seed="w4" />

      <Sfx name="click" at={8} volume={0.2} />
      <Sfx name="ding" at={tenth} volume={0.18} />
    </AbsoluteFill>
  );
};
