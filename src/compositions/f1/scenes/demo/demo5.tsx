import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { editorial, toon } from "../../../../theme";
import { Mascot } from "../../components/mascot";
import { clamp, ramp } from "../../components/toon/anim";
import { useSpeaking, useWordFrame } from "../../components/hooks";
import { Sfx } from "../../components/Sfx";
import { SceneProps } from "../../manifest";
import { ArcRing, Bg, Heading } from "./kit";

/** demo-5 (stat hold): women make up 42% of F1's global audience. */
export const Demo5: React.FC<SceneProps> = ({ section }) => {
  const frame = useCurrentFrame();
  const biggest = useWordFrame(section, "biggest");
  const hit = useWordFrame(section, "42");
  const mogTalk = useSpeaking(section, "mog");
  const num = Math.round(42 * interpolate(frame, [hit, hit + 45], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) }));
  const lab = ramp(frame, hit + 10, 14);

  return (
    <AbsoluteFill>
      <Bg />
      <Heading x={940} y={110} w={800} kicker="The biggest shift" lines={["The female fanbase"]} size={72} at={biggest - 4} />
      <ArcRing cx={480} cy={450} r={230} pct={42} at={hit} thick={64}>
        <div style={{ fontFamily: toon.font.display, fontWeight: 800, fontSize: 190, color: editorial.accent, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
          {num}
          <span style={{ fontSize: 100 }}>%</span>
        </div>
      </ArcRing>
      <div style={{ position: "absolute", left: 940, top: 330, width: 780, opacity: lab, transform: `translateY(${(1 - lab) * 18}px)` }}>
        <div style={{ fontFamily: toon.font.display, fontWeight: 800, fontSize: 64, lineHeight: 1.06, color: editorial.ink }}>
          <span style={{ color: editorial.accentOnLight }}>42% women</span>
          <br />
          of F1's global audience
        </div>
      </div>

      <Mascot
        character="mog"
        x={1640}
        y={830}
        scale={1.05}
        facing="left"
        at={4}
        enter="pop"
        look={{ x: 480, y: 450 }}
        talking={mogTalk}
        gesture={[[0, "idle"], [hit - 16, { gesture: "point", dir: "left" }]]}
        expression="neutral"
      />
      <Mascot character="bog" x={1280} y={830} scale={0.8} facing="left" at={10} enter="pop" look={[[0, { x: 1640, y: 600 }], [hit, { x: 480, y: 450 }]]} gesture="listen" expression={[[0, "neutral"], [hit + 20, "surprised"], [hit + 70, "happy"]]} />
      <Sfx name="ding" at={hit + 36} />
    </AbsoluteFill>
  );
};
