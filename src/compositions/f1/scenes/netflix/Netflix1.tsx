import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SceneProps } from "../../manifest";
import { useSpeaking, useWordFrame } from "../../components/hooks";
import { Mascot } from "../../components/mascot";
import { Logo, expoOut } from "../../components/photo";
import { Sfx } from "../../components/Sfx";
import { ramp } from "../../components/toon";
import { editorial, toon } from "../../../../theme";
import { Bg, Reveal } from "./kit";

/** netflix-1 (dark): "Drive to Survive" title treatment with the small Netflix logo; WEC carries in the story board. */
export const Netflix1: React.FC<SceneProps> = ({ section }) => {
  const frame = useCurrentFrame();
  const rocket = useWordFrame(section, "rocket");
  const drive = useWordFrame(section, "Drive");
  const survive = useWordFrame(section, "Survive");
  const mogTalking = useSpeaking(section, "mog");

  const title = (text: string, at: number, top: number, accent = false) => (
    <div style={{ position: "absolute", left: 96, top, opacity: ramp(frame, at, 10), transform: `translateX(${(1 - ramp(frame, at, 16, expoOut)) * 40}px)`, fontFamily: toon.font.display, fontWeight: 800, fontSize: 160, lineHeight: 0.96, letterSpacing: "-0.01em", color: accent ? editorial.accentOnDark : editorial.white }}>
      {text}
    </div>
  );

  return (
    <AbsoluteFill>
      <Bg dark />
      <Logo src="assets/logos/netflix.png" width={170} x={96 + 85} y={178} at={rocket - 6} enter="fade" />
      <Reveal at={rocket - 2} style={{ position: "absolute", left: 96, top: 232 }}>
        <div style={{ fontFamily: toon.font.body, fontWeight: 800, fontSize: 28, letterSpacing: "0.16em", textTransform: "uppercase", color: editorial.mutedOnDark }}>The real rocket fuel</div>
      </Reveal>
      {title("DRIVE", drive - 6, 300)}
      {title("TO SURVIVE", survive - 6, 470, true)}
      <div style={{ position: "absolute", left: 100, top: 660, height: 6, width: 560 * ramp(frame, survive + 8, 20, expoOut), background: editorial.accent }} />

      {/* WEC carries the framed story board in from the right, proud; MOG narrates from the left */}
      <Mascot character="wec" x={1450} y={830} scale={1.6} facing="left" look="viewer" gesture="idle" prop="storyboard" expression={[[0, "happy"]]} at={0} enter="walk-right" enterFrames={44} talking={false} seed="w1" />
      <Mascot character="mog" x={1050} y={830} scale={0.8} facing="right" look={{ x: 1000, y: 500 }} talking={mogTalking} gesture="idle" at={0} enter="none" />
      <Sfx name="swoosh-soft" at={4} />
      <Sfx name="ding" at={drive - 4} volume={0.2} />
    </AbsoluteFill>
  );
};
