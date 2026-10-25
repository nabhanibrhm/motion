import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { editorial, toon } from "../../../../theme";
import { useLine, useSpeaking, useWordFrame } from "../../components/hooks";
import { Mascot } from "../../components/mascot";
import { Sfx } from "../../components/Sfx";
import { ramp } from "../../components/toon/anim";
import { SceneProps } from "../../manifest";
import { Chip, Ground } from "./bits";

export const Hook4: React.FC<SceneProps> = ({ section }) => {
  const frame = useCurrentFrame();
  const wecLine = useLine(section, 1);
  const go = useLine(section, 2);
  const elitism = useWordFrame(section, "elitism");
  const engineering = useWordFrame(section, "engineering");
  const brand = useWordFrame(section, "brand");
  const mogTalk = useSpeaking(section, "mog");
  const wecTalk = useSpeaking(section, "wec");
  const hIn = ramp(frame, 6, 18);
  const goLook = go.start + 10;

  return (
    <AbsoluteFill>
      <Ground color={editorial.ink} />
      <div style={{ position: "absolute", left: 0, width: 1920, top: 130, textAlign: "center", opacity: hIn, transform: `translateY(${(1 - hIn) * 16}px)` }}>
        <div style={{ fontFamily: toon.font.body, fontWeight: 800, fontSize: 28, letterSpacing: "0.16em", textTransform: "uppercase", color: editorial.accentOnDark }}>The big question</div>
        <div style={{ fontFamily: toon.font.display, fontWeight: 800, fontSize: 120, color: editorial.white, marginTop: 10 }}>How did F1 get here?</div>
      </div>
      <Chip text="Elitism" x={330} y={400} at={elitism} strike={elitism + 24} bg="#1B1B1B" color={editorial.white} border="#555" />
      <Chip text="Complex engineering" x={640} y={400} at={engineering} strike={engineering + 30} bg="#1B1B1B" color={editorial.white} border="#555" />
      <Chip text="Biggest entertainment brand" x={1150} y={400} at={brand - 6} bg={editorial.accent} color={editorial.white} border={editorial.accent} />

      <Mascot character="bog" x={470} y={830} scale={0.95} at={0} enter="none" facing="right"
        look="right" gesture="listen" expression={[[0, "confused"], [wecLine.end, "happy"]]} talking={false} />
      <Mascot character="mog" x={960} y={830} scale={1.1} at={0} enter="none"
        facing={[[0, "front"], [goLook, "right"]]}
        look={[[0, "viewer"], [wecLine.start - 4, "right"], [wecLine.end, "viewer"]]}
        gesture={[[0, "idle"], [go.start, { gesture: "point", dir: "right" }], [go.end + 40, "idle"]]}
        expression={[[0, "neutral"], [go.start, "smug"]]} talking={mogTalk} />
      <Mascot character="wec" x={1450} y={830} scale={1.0} at={0} enter="none"
        facing={[[0, "left"], [goLook, "right"]]}
        look="left"
        prop="tickets"
        gesture={[[0, "idle"], [wecLine.start - 4, "cheer"], [wecLine.end + 10, "idle"], [go.start + 8, "wave"]]}
        expression="happy" talking={wecTalk} />
      <Sfx name="pop" at={wecLine.start} volume={0.2} />
      <Sfx name="swoosh-soft" at={go.start + 6} />
    </AbsoluteFill>
  );
};
