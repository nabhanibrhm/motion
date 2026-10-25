import { AbsoluteFill, Img, staticFile } from "remotion";
import { SceneProps } from "../../manifest";
import { Mascot, VelvetDoor } from "../../components/mascot";
import { Photo } from "../../components/photo";
import { Sfx } from "../../components/Sfx";
import { useLine, useSpeaking, useWordFrame } from "../../components/hooks";
import { editorial, toon } from "../../../../theme";
import { AppTile, Backdrop, Reveal } from "./kit";

/** Dark scene: the open door. WEC films, social tiles and a garage card show BOG the new world. */
export const Liberty6: React.FC<SceneProps> = ({ section }) => {
  const wec = useSpeaking(section, "wec");
  const mog = useSpeaking(section, "mog");
  const bog = useSpeaking(section, "bog");
  const l1 = useLine(section, 1);
  const l2 = useLine(section, 2);
  const l3 = useLine(section, 3);
  const phone = useWordFrame(section, "phone");
  const yt = useWordFrame(section, "YouTube");
  const ig = useWordFrame(section, "Instagram");
  const tt = useWordFrame(section, "TikTok");
  const garage = useWordFrame(section, "garage");
  const WEC = { x: 300, y: 600 };
  const MOG = { x: 1230, y: 600 };
  const DOOR = { x: 1580, y: 500 };
  return (
    <AbsoluteFill>
      <Backdrop dark />
      <VelvetDoor x={1590} y={830} scale={1} enter="none" openAt={0} rope={false}>
        <Img src={staticFile("assets/racing/garage_2021.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "40% 50%" }} />
      </VelvetDoor>
      <AppTile app="youtube" x={520} y={140} at={yt} exitAt={l3.start - 6} />
      <AppTile app="instagram" x={720} y={140} at={ig} exitAt={l3.start - 6} />
      <AppTile app="tiktok" x={920} y={140} at={tt} exitAt={l3.start - 6} />
      <Photo src="assets/racing/garage_2021_b.jpg" x={560} y={350} w={480} h={250} fit="cover" focal={{ x: 0.5, y: 0.5 }} at={garage - 20} exitAt={l3.start - 6} enter="rise" />
      <Reveal at={l3.start} style={{ left: 520, top: 200, width: 760 }}>
        <div style={{ fontFamily: toon.font.display, fontWeight: 700, fontSize: 52, color: editorial.mutedOnDark, textDecoration: "line-through", lineHeight: 1.1 }}>Closed-door society</div>
        <div style={{ fontFamily: toon.font.display, fontWeight: 800, fontSize: 84, color: editorial.white, lineHeight: 1.04, marginTop: 20 }}>Always-on reality show</div>
        <div style={{ width: 72, height: 6, borderRadius: 3, background: editorial.accent, marginTop: 22 }} />
      </Reveal>
      <Sfx name="click" at={phone + 30} />
      <Mascot character="wec" x={300} scale={1.1} enter="none" facing="right" talking={wec} look={[[0, "auto"], [l1.start - 4, MOG]]}
        prop={[[0, "none"], [phone + 10, "phone"]]} gesture={[[0, "idle"], [phone + 10, "cheer"], [l1.start + 90, "idle"]]} expression="surprised" />
      <Mascot character="mog" x={1230} scale={0.95} enter="none" facing="left" talking={mog} look={[[0, WEC], [l2.start - 4, { x: 880, y: 600 }]]}
        gesture={[[0, "listen"], [l1.start - 4, { gesture: "point", dir: "up-left" }], [l1.end, "idle"], [l2.start, "listen"], [l3.start - 4, "idle"]]} />
      <Mascot character="bog" x={880} scale={0.75} at={l1.end - 10} enter="walk-right" facing="right" talking={bog} look={[[0, MOG], [l2.start - 4, DOOR]]}
        gesture={[[0, "listen"], [l2.start, "startle"], [l2.end, "listen"]]} expression={[[0, "happy"], [l2.start, "surprised"], [l2.end, "happy"]]} />
    </AbsoluteFill>
  );
};
