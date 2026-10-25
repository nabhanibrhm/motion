import { AbsoluteFill, useCurrentFrame } from "remotion";
import { editorial } from "../../../../theme";
import { Sfx } from "../../components/Sfx";
import { useLine, useSpeaking, useWordFrame } from "../../components/hooks";
import { Mascot, TripMap, US_CITIES } from "../../components/mascot";
import { Photo } from "../../components/photo";
import { SceneProps } from "../../manifest";
import { CardLabel, Heading } from "./kit";

const MAP = { x: 960, y: 500 };

export const Usa2: React.FC<SceneProps> = ({ section }) => {
  const frame = useCurrentFrame();
  const mog = useSpeaking(section, "mog");
  const wec = useSpeaking(section, "wec");
  const bog = useSpeaking(section, "bog");
  const austin = useWordFrame(section, "Austin");
  const miami = useWordFrame(section, "Miami");
  const vegas = useWordFrame(section, "Vegas");
  const road = useWordFrame(section, "Road");
  const wecLine = useLine(section, 1);
  const bogLine = useLine(section, 2);
  const swap = road - 14; // map leaves, cards arrive
  const c0 = swap + 6;

  return (
    <AbsoluteFill style={{ background: editorial.bg }}>
      {/* Phase 1: the map, three pins */}
      <Heading kicker="Today" headline="Three US races" x={96} y={110} w={1100} size={72} at={4} exitAt={swap} />
      {frame < swap + 8 && <div style={{ position: "absolute", left: 540, top: 716, width: 840, height: 34, borderRadius: 8, background: editorial.panel, borderTop: `4px solid ${editorial.rule}` }} />}
      <TripMap
        x={MAP.x} y={MAP.y} scale={1.15} enter="none" exitAt={swap} exitFrames={10}
        pins={[
          { ...US_CITIES.austin, at: austin + 4 },
          { ...US_CITIES.miami, at: miami + 4 },
          { ...US_CITIES.vegas, at: vegas + 4 },
        ]}
      />
      <Sfx name="click" at={austin + 4} />
      <Sfx name="pop" at={miami + 4} />
      <Sfx name="pop" at={vegas + 4} />

      {/* Phase 2: three city cards */}
      <Photo src="assets/racing/usgp_start_2021.jpg" x={96} y={150} w={340} h={604} fit="cover" focal={{ x: 0.5, y: 0.5 }} at={c0} enter="rise" enterFrames={18} />
      <Photo src="assets/circuits/miami_gp.jpg" x={500} y={150} w={560} h={420} fit="cover" focal={{ x: 0.5, y: 0.5 }} at={c0 + 10} enter="rise" enterFrames={18} />
      <Photo src="assets/circuits/las_vegas_gp.jpg" x={1100} y={150} w={560} h={420} fit="cover" focal={{ x: 0.5, y: 0.5 }} at={c0 + 20} enter="rise" enterFrames={18} />
      <Sfx name="swoosh-soft" at={c0} />
      <CardLabel x={96} y={768} w={340} text="Austin" sub="since 2012" at={c0 + 12} />
      <CardLabel x={500} y={586} w={560} text="Miami" sub="since 2022" at={c0 + 22} />
      <CardLabel x={1100} y={586} w={560} text="Las Vegas" sub="since 2023" at={c0 + 32} />

      {/* Phase 1 mascots: WEC tickets Austin, BOG pins Miami, MOG marks Vegas */}
      <Mascot
        character="mog" x={330} y={830} scale={1.05} facing="right" look={{ x: MAP.x, y: MAP.y }} talking={mog} expression="happy"
        gesture={[[0, "idle"], [vegas - 6, { gesture: "point", dir: "right" }], [vegas + 50, "idle"]]} enter="none" exitAt={swap} exitFrames={8}
      />
      <Mascot
        character="wec" x={1520} y={830} scale={0.95} facing="left" look={{ x: MAP.x, y: MAP.y }} talking={false} prop="tickets" expression="happy"
        gesture={[[0, "listen"], [austin - 8, { gesture: "point", dir: "left" }], [austin + 40, "listen"]]} enter="none" exitAt={swap} exitFrames={8}
      />
      <Mascot
        character="bog" x={1730} y={830} scale={0.9} facing="left" look={{ x: MAP.x, y: MAP.y }} talking={false} expression="neutral"
        gesture={[[0, "listen"], [miami - 8, { gesture: "point", dir: "left" }], [miami + 40, "listen"]]} enter="none" exitAt={swap} exitFrames={8}
      />

      {/* Phase 2 mascots stand under the cards (below the label rows) */}
      <Mascot
        character="wec" x={700} y={830} scale={0.62} facing="right" look={{ x: 1340, y: 740 }} talking={wec} prop="tickets" expression="happy"
        at={swap + 10} enter="pop" gesture={[[0, "cheer"], [wecLine.end, "idle"]]}
      />
      <Mascot
        character="bog" x={1340} y={830} scale={0.62} facing="left" look={{ x: 700, y: 740 }} talking={bog} expression="happy"
        at={swap + 18} enter="pop" gesture={[[0, "listen"], [bogLine.start - 4, "shrug"], [bogLine.end + 8, "idle"]]}
      />
    </AbsoluteFill>
  );
};
