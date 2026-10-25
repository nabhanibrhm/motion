import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SceneProps } from "../../manifest";
import { useSpeaking, useWordFrame } from "../../components/hooks";
import { Mascot } from "../../components/mascot";
import { Logo, Photo, expoOut } from "../../components/photo";
import { Sfx } from "../../components/Sfx";
import { ramp } from "../../components/toon";
import { editorial, toon } from "../../../../theme";
import { Bg, Reveal } from "./kit";

const W = 640;
const H = 440;
const Y = 210;
const MAX_X = 300;
const LEWIS_X = 980;

const Label: React.FC<{ name: string; sub: string; x: number; at: number }> = ({ name, sub, x, at }) => (
  <Reveal at={at} dy={10} style={{ position: "absolute", left: x, top: Y + H + 22, width: W }}>
    <div style={{ fontFamily: toon.font.display, fontWeight: 800, fontSize: 44, color: editorial.ink, lineHeight: 1.05 }}>{name}</div>
    <div style={{ fontFamily: toon.font.body, fontWeight: 700, fontSize: 28, color: editorial.muted, marginTop: 4 }}>{sub}</div>
  </Reveal>
);

/** netflix-5 (light): a framed two-up of Max and Lewis, then "lap times" gives way to "stories". */
export const Netflix5: React.FC<SceneProps> = ({ section }) => {
  const frame = useCurrentFrame();
  const drive = useWordFrame(section, "Drive");
  const max = useWordFrame(section, "Max");
  const lewis = useWordFrame(section, "Lewis");
  const lap = useWordFrame(section, "lap");
  const stories = useWordFrame(section, "stories");
  const line2 = useWordFrame(section, "realized");
  const mogTalking = useSpeaking(section, "mog");

  return (
    <AbsoluteFill>
      <Bg />
      <Logo src="assets/logos/netflix.png" width={120} x={1740} y={150} at={drive} enter="fade" />
      <Reveal at={drive} exitAt={line2 - 10} style={{ position: "absolute", left: 96, top: 128 }}>
        <div style={{ fontFamily: toon.font.body, fontWeight: 800, fontSize: 28, letterSpacing: "0.16em", textTransform: "uppercase", color: editorial.muted }}>Drive to Survive</div>
      </Reveal>

      {/* two-up: Max (very wide source, so contain keeps the face) and Lewis */}
      <Photo src="assets/people/max_verstappen_2021.jpg" x={MAX_X} y={Y} w={W} h={H} at={max - 10} enter="rise" border={10} radius={16} fit="contain" />
      <Photo src="assets/people/lewis_hamilton_2021.jpg" x={LEWIS_X} y={Y} w={W} h={H} at={lewis - 10} enter="rise" border={10} radius={16} fit="cover" focal={{ x: 0.42, y: 0.5 }} />
      <Label name="Max Verstappen" sub="Red Bull, car 33" x={MAX_X} at={max + 4} />
      <Label name="Lewis Hamilton" sub="Mercedes" x={LEWIS_X} at={lewis + 4} />

      {/* headline: lap times out, stories in */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 112, textAlign: "center", opacity: ramp(frame, line2 - 4, 12), fontFamily: toon.font.display, fontWeight: 800, fontSize: 72, color: editorial.ink }}>
        <span style={{ position: "relative", display: "inline-block", color: editorial.muted }}>
          Lap times
          <div style={{ position: "absolute", left: 0, top: "54%", height: 8, borderRadius: 4, background: editorial.accent, width: `${ramp(frame, lap, 14, expoOut) * 100}%` }} />
        </span>
        <span style={{ display: "inline-block", margin: "0 28px", color: editorial.muted }}>/</span>
        <span style={{ display: "inline-block", color: editorial.accent, opacity: ramp(frame, stories - 2, 12), transform: `translateY(${(1 - ramp(frame, stories - 2, 14, expoOut)) * 16}px)` }}>Stories</span>
      </div>

      <Mascot character="mog" x={150} y={830} scale={0.95} facing="right" look={{ x: 640, y: 420 }} talking={mogTalking}
        gesture={[[0, "idle"], [max - 6, { gesture: "point", dir: "up-right" }], [max + 50, "idle"], [lewis - 6, { gesture: "point", dir: "up-right" }], [lewis + 50, "idle"]]}
        expression={[[0, "neutral"], [stories, "smug"]]} at={0} enter="none" />
      <Mascot character="bog" x={1770} y={830} scale={0.9} facing="left" look={{ x: 1300, y: 420 }} talking={false}
        gesture="listen" expression={[[0, "neutral"], [lewis, "happy"]]} at={0} enter="none" seed="b5" />

      <Sfx name="shutter" at={max - 8} volume={0.2} />
      <Sfx name="shutter" at={lewis - 8} volume={0.2} />
      <Sfx name="ding" at={stories} volume={0.18} />
    </AbsoluteFill>
  );
};
