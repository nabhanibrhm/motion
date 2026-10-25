import { AbsoluteFill } from "remotion";
import { editorial } from "../../../../theme";
import { Sfx } from "../../components/Sfx";
import { useLine, useSpeaking, useWordFrame } from "../../components/hooks";
import { Mascot } from "../../components/mascot";
import { Photo, PhotoCard } from "../../components/photo";
import { SceneProps } from "../../manifest";
import { Heading } from "./kit";

export const Usa4: React.FC<SceneProps> = ({ section }) => {
  const mog = useSpeaking(section, "mog");
  const movie = useWordFrame(section, "movie");
  const second = useLine(section, 1);
  const swap = second.start - 14;

  return (
    <AbsoluteFill style={{ background: editorial.ink }}>
      {/* Beat 1: Hollywood meets Formula 1, over two action cards */}
      <Photo src="assets/racing/usgp_action_1.jpg" x={96} y={130} w={700} h={394} fit="cover" focal={{ x: 0.5, y: 0.55 }} at={4} enter="rise" exitAt={swap} exitFrames={10} />
      <Photo src="assets/racing/usgp_action_2.jpg" x={190} y={562} w={700} h={266} fit="cover" focal={{ x: 0.55, y: 0.65 }} at={14} enter="rise" exitAt={swap} exitFrames={10} />
      <Heading kicker="The movie" headline="Hollywood meets Formula 1" x={1000} y={170} w={820} size={78} tone="dark" at={movie - 10} exitAt={swap} />
      <Sfx name="shutter" at={4} />

      {/* Beat 2: restrained collage, lots of empty space */}
      <PhotoCard
        layout="collage"
        tone="dark"
        at={swap + 6}
        stagger={12}
        photos={[
          { src: "assets/circuits/miami_gp.jpg", fit: "cover", focal: { x: 0.5, y: 0.5 } },
          { src: "assets/circuits/las_vegas_gp.jpg", fit: "cover", focal: { x: 0.5, y: 0.5 } },
          { src: "assets/racing/usgp_action_1.jpg", fit: "cover", focal: { x: 0.5, y: 0.55 } },
        ]}
        kicker="Media"
        headline="Every layer"
      />

      <Mascot
        character="mog" x={1560} y={830} scale={1.0} facing="left" look={{ x: 600, y: 400 }} talking={mog}
        expression={[[0, "happy"], [swap, "smug"]]}
        gesture={[[0, "idle"], [movie - 8, { gesture: "point", dir: "left" }], [swap - 20, "idle"]]}
        enter="none" exitAt={swap} exitFrames={8}
      />
      <Mascot
        character="mog" x={500} y={830} scale={0.6} facing="right" look={{ x: 1300, y: 300 }} talking={mog} expression="smug"
        gesture="idle" at={swap + 30} enter="pop" seed="b"
      />
    </AbsoluteFill>
  );
};
