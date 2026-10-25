import { AbsoluteFill, useCurrentFrame } from "remotion";
import { editorial, toon } from "../../../../theme";
import { Mascot } from "../../components/mascot";
import { Logo, Photo, PhotoCard, photoLayout } from "../../components/photo";
import { ramp } from "../../components/toon/anim";
import { useLine, useSpeaking, useWordFrame } from "../../components/hooks";
import { Sfx } from "../../components/Sfx";
import { SceneProps } from "../../manifest";
import { Bg } from "./kit";

/** demo-6: fashion / lifestyle (Hamilton card), then the F1 Academy sponsors and crowds. */
export const Demo6: React.FC<SceneProps> = ({ section }) => {
  const frame = useCurrentFrame();
  const second = useLine(section, 1);
  const swap = second.start - 8;
  const charlotte = useWordFrame(section, "Charlotte");
  const elemis = useWordFrame(section, "Elemis");
  const academy = useWordFrame(section, "Academy");
  const concerts = useWordFrame(section, "concerts");
  const mogTalk = useSpeaking(section, "mog");
  const lay = photoLayout("card-left");
  const mogX = lay.mascot.feet.x;
  const bOn = frame >= swap;
  const elemisA = ramp(frame, elemis, 14);
  const concertsA = ramp(frame, concerts - 8, 14);

  return (
    <AbsoluteFill>
      <Bg />
      <PhotoCard
        layout="card-left"
        photos={[{ src: "assets/people/lewis_hamilton_2021.jpg" }]}
        kicker="Beyond the track"
        headline="Fashion, lifestyle and pop culture"
        at={4}
        exitAt={swap}
        exitFrames={10}
      />

      {bOn && (
        <>
          {/* left column: sponsors, then crowds */}
          <div style={{ position: "absolute", left: 140, top: 100, fontFamily: toon.font.body, fontWeight: 800, fontSize: 26, letterSpacing: "0.16em", textTransform: "uppercase", color: editorial.accentOnLight, opacity: ramp(frame, swap + 4, 14) }}>
            Beauty meets the grid
          </div>
          <Logo src="assets/logos/f1_academy.png" width={340} x={140 + 170} y={225} enter="fade" at={academy - 10} />
          <Logo src="assets/logos/charlotte_tilbury.png" width={440} x={140 + 220} y={345} enter="fade" at={charlotte - 4} />
          <div style={{ position: "absolute", left: 140, top: 395, fontFamily: toon.font.display, fontWeight: 800, fontSize: 64, letterSpacing: "0.04em", color: editorial.ink, opacity: elemisA, transform: `translateY(${(1 - elemisA) * 16}px)` }}>Elemis</div>
          <Photo src="assets/crowds/usgp_modern_fans.jpg" x={140} y={520} w={427} h={320} fit="cover" focal={{ x: 0.5, y: 0.55 }} enter="rise" at={concerts - 10} />
          <div style={{ position: "absolute", left: 610, top: 640, width: 360, fontFamily: toon.font.display, fontWeight: 800, fontSize: 40, lineHeight: 1.1, color: editorial.ink, opacity: concertsA }}>Season launches now fill stadiums</div>
          <Photo src="assets/racing/f1_academy_silverstone.jpg" x={1020} y={130} w={700} h={455} enter="rise" at={swap + 6} />
          <Sfx name="shutter" at={swap + 8} volume={0.15} />
          <Sfx name="pop" at={charlotte} />
          <Sfx name="pop" at={elemis} />
        </>
      )}

      <Mascot
        character="mog"
        x={mogX}
        y={830}
        scale={0.85}
        facing="left"
        at={6}
        enter="pop"
        look={bOn ? { x: 1370, y: 360 } : { x: 520, y: 420 }}
        talking={mogTalk}
        gesture={[[0, "idle"], [14, { gesture: "point", dir: "left" }], [swap - 20, "idle"], [second.start + 20, { gesture: "point", dir: "up" }]]}
        expression="happy"
      />
    </AbsoluteFill>
  );
};
