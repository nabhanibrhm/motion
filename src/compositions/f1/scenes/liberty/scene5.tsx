import { AbsoluteFill } from "remotion";
import { SceneProps } from "../../manifest";
import { Mascot, VelvetDoor } from "../../components/mascot";
import { Sfx } from "../../components/Sfx";
import { useLine, useSpeaking, useWordFrame } from "../../components/hooks";
import { editorial, toon } from "../../../../theme";
import { Backdrop, Head, Reveal } from "./kit";

const Card: React.FC<{ label: string; sub: string; hot?: boolean }> = ({ label, sub, hot }) => (
  <div style={{ width: 800, padding: "22px 32px", borderRadius: 16, background: hot ? editorial.white : editorial.panel, borderLeft: `10px solid ${hot ? editorial.accent : editorial.muted}`, fontFamily: toon.font.display }}>
    <div style={{ fontWeight: 800, fontSize: 54, color: editorial.ink, lineHeight: 1.05 }}>{label}</div>
    <div style={{ fontFamily: toon.font.body, fontWeight: 700, fontSize: 30, color: editorial.muted, marginTop: 6 }}>{sub}</div>
  </div>
);

/** Branding problem versus untold stories, then MOG pushes the same door open. */
export const Liberty5: React.FC<SceneProps> = ({ section }) => {
  const mog = useSpeaking(section, "mog");
  const branding = useWordFrame(section, "branding");
  const stories = useWordFrame(section, "stories");
  const second = useLine(section, 1).start;
  const media = useWordFrame(section, "media");
  const tore = useWordFrame(section, "tore");
  const open = tore - 4;
  return (
    <AbsoluteFill>
      <Backdrop />
      <Reveal at={branding - 6} exitAt={second - 8} style={{ left: 140, top: 170 }}><Card label="A branding problem" sub="The weak spot" /></Reveal>
      <Reveal at={stories - 6} exitAt={second - 8} style={{ left: 140, top: 350 }}><Card hot label="The greatest untold stories" sub="The hidden asset" /></Reveal>
      <Head x={140} y={150} w={820} kicker="Liberty's plan" headline="A global media company" at={Math.max(media - 6, second + 6)} />
      <VelvetDoor x={1580} y={830} scale={1} enter="slide-left" enterFrames={22} openAt={open} openFrames={28} />
      <Sfx name="door-open" at={open} volume={0.35} />
      <Mascot character="mog" x={1200} scale={1.1} facing="right" talking={mog} gesture={[[0, "idle"], [tore - 14, { gesture: "point", dir: "right" }], [tore + 50, "idle"]]} />
      <Mascot character="bog" x={880} scale={0.9} facing="right" look={[[0, { x: 1200, y: 560 }], [open, { x: 1580, y: 500 }]]} gesture="listen" expression={[[0, "neutral"], [open + 10, "surprised"]]} />
    </AbsoluteFill>
  );
};
