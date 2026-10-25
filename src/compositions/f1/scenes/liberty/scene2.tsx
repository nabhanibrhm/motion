import { AbsoluteFill } from "remotion";
import { SceneProps } from "../../manifest";
import { Mascot } from "../../components/mascot";
import { PhotoCard, photoLayout } from "../../components/photo";
import { useLine, useSpeaking, useWordFrame } from "../../components/hooks";
import { editorial, toon } from "../../../../theme";
import { Backdrop, Chip, Reveal } from "./kit";

/** Bernie portrait card with the three pillars of exclusivity; BOG asks if the door was just closed. */
export const Liberty2: React.FC<SceneProps> = ({ section }) => {
  const text = photoLayout("card-left", { aspect: "portrait" }).text!;
  const mog = useSpeaking(section, "mog");
  const bog = useSpeaking(section, "bog");
  const ask = useLine(section, 1).start;
  const tv = useWordFrame(section, "TV");
  const watch = useWordFrame(section, "watch");
  const scarcity = useWordFrame(section, "scarcity");
  const mx = 1010;
  const bx = 1560;
  return (
    <AbsoluteFill>
      <Backdrop />
      <PhotoCard layout="card-left" options={{ aspect: "portrait" }} photos={[{ src: "assets/people/bernie_ecclestone.jpg" }]} tone="light" at={4}>
        <div style={{ fontFamily: toon.font.body, fontWeight: 800, fontSize: 26, letterSpacing: "0.14em", textTransform: "uppercase", color: editorial.accentOnLight, marginBottom: 14 }}>Bernie Ecclestone</div>
        <div style={{ fontFamily: toon.font.display, fontWeight: 800, fontSize: 80, lineHeight: 1.04 }}>Rich, but exclusive</div>
        <div style={{ width: 72, height: 6, borderRadius: 3, background: editorial.accent, margin: "20px 0" }} />
        <div style={{ height: 190 }} />
      </PhotoCard>
      <Reveal at={tv} style={{ left: text.x, top: text.y + 235 }}><Chip text="Expensive TV packages" /></Reveal>
      <Reveal at={watch} style={{ left: text.x, top: text.y + 305 }}><Chip text="Luxury watch sponsors" /></Reveal>
      <Reveal at={scarcity} style={{ left: text.x, top: text.y + 375 }}><Chip text="Artificial scarcity" /></Reveal>
      <Mascot character="mog" x={mx} scale={0.95} facing="right" look={[[0, "auto"], [ask - 4, { x: bx, y: 600 }]]} talking={mog} gesture={[[0, "idle"], [ask - 6, "listen"]]} />
      <Mascot character="bog" x={bx} scale={0.95} facing="left" look={{ x: mx, y: 600 }} talking={bog} gesture={[[0, "listen"], [ask, "shrug"], [ask + 50, "listen"]]} expression="confused" />
    </AbsoluteFill>
  );
};
