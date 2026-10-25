import { AbsoluteFill, useCurrentFrame } from "remotion";
import { editorial, toon } from "../../../../theme";
import { Mascot } from "../../components/mascot";
import { BigStat } from "../../components/photo";
import { ramp } from "../../components/toon/anim";
import { useSpeaking, useWordFrame } from "../../components/hooks";
import { Sfx } from "../../components/Sfx";
import { SceneProps } from "../../manifest";
import { Bg, Waffle } from "./kit";

/** demo-3 (stat hold, dark): 43% of F1 fans are under 35. */
export const Demo3: React.FC<SceneProps> = ({ section }) => {
  const frame = useCurrentFrame();
  const hit = useWordFrame(section, "43");
  const under = useWordFrame(section, "under");
  const mogTalk = useSpeaking(section, "mog");
  return (
    <AbsoluteFill>
      <Bg dark />
      <Waffle x={150} y={180} size={560} pct={43} at={hit} dur={40} dark />
      <div style={{ position: "absolute", left: 150, top: 760, fontFamily: toon.font.body, fontWeight: 700, fontSize: 24, color: editorial.mutedOnDark, opacity: ramp(frame, hit + 20, 14) }}>Each dot is 1% of all F1 fans</div>
      <BigStat value={43} suffix="%" at={hit} dur={40} x={860} y={180} fontSize={320} color={editorial.accent} />
      <div style={{ position: "absolute", left: 860, top: 540, width: 620, opacity: ramp(frame, under, 14), transform: `translateY(${(1 - ramp(frame, under, 14)) * 18}px)` }}>
        <div style={{ fontFamily: toon.font.display, fontWeight: 800, fontSize: 58, lineHeight: 1.08, color: editorial.white }}>of all F1 fans<br />are under 35</div>
      </div>
      <Mascot
        character="mog"
        x={1650}
        y={830}
        scale={1.1}
        facing="left"
        at={4}
        enter="pop"
        look={{ x: 1100, y: 400 }}
        talking={mogTalk}
        gesture={[[0, "idle"], [hit - 12, { gesture: "point", dir: "left" }]]}
        expression="happy"
      />
      <Sfx name="ding" at={hit + 30} />
    </AbsoluteFill>
  );
};
