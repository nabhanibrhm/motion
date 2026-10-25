import { AbsoluteFill } from "remotion";
import { SceneProps } from "../../manifest";
import { useSpeaking, useWordFrame } from "../../components/hooks";
import { Mascot } from "../../components/mascot";
import { Sfx } from "../../components/Sfx";
import { Car, LIVERIES } from "../../components/toon";
import { editorial, toon } from "../../../../theme";
import { Bg, Head, Pill, Reveal } from "./kit";

const COLS = 4;
const ROWS = 5;
const PANEL = { x: 800, y: 130, w: 1024, h: 480 };

/** netflix-2 (light): before 2019 it was just engineering. Twenty identical cars on a chart; BOG squints at them. */
export const Netflix2: React.FC<SceneProps> = ({ section }) => {
  const before = useWordFrame(section, "Before");
  const twenty = useWordFrame(section, "twenty");
  const cars = useWordFrame(section, "cars");
  const aero = useWordFrame(section, "aerodynamics");
  const tire = useWordFrame(section, "tire");
  const counted = useWordFrame(section, "counted");
  const zero = useWordFrame(section, "zero");
  const bogFirst = useWordFrame(section, "Yeah");
  const mogTalking = useSpeaking(section, "mog");
  const bogTalking = useSpeaking(section, "bog");

  const BOG = { x: 1330, y: 700 };
  const PANEL_MID = { x: PANEL.x + PANEL.w / 2, y: PANEL.y + PANEL.h / 2 };

  return (
    <AbsoluteFill>
      <Bg />
      <Head x={96} y={150} w={640} kicker="Before 2019" kickerAt={before} lines={[{ text: "Twenty", at: twenty }, { text: "identical cars", at: twenty + 6 }]} size={84} />
      <Pill text="Aerodynamics" x={96} y={420} at={aero} />
      <Pill text="Tyre degradation" x={96} y={486} at={tire} />
      <Pill text="0 reasons to care" x={96} y={420} at={zero} accent />

      {/* chart panel with twenty identical cars */}
      <Reveal at={twenty - 14} style={{ position: "absolute", left: PANEL.x, top: PANEL.y, width: PANEL.w, height: PANEL.h, background: editorial.white, borderRadius: 24, boxShadow: `0 0 0 2px ${editorial.rule}` }}>
        <div style={{ position: "absolute", right: 28, top: 16, fontFamily: toon.font.body, fontWeight: 800, fontSize: 26, letterSpacing: "0.12em", color: editorial.muted }}>THE GRID</div>
      </Reveal>
      {Array.from({ length: COLS * ROWS }, (_, i) => {
        const c = i % COLS;
        const r = Math.floor(i / COLS);
        const x = PANEL.x + 140 + c * 248;
        const y = PANEL.y + 110 + r * 84;
        return (
          <Reveal key={i} at={twenty - 6 + Math.round(i * 2.4)} dy={10} style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080 }}>
            <Car livery={LIVERIES.sky} number={0} speed={0} size={170} x={x} y={y} shadow={false} />
          </Reveal>
        );
      })}

      {/* MOG explains, BOG squints, then answers */}
      <Mascot character="mog" x={400} y={830} scale={1} facing="right" look={[[0, { x: PANEL_MID.x, y: PANEL_MID.y }], [bogFirst - 6, { x: BOG.x, y: BOG.y }]]}
        talking={mogTalking} gesture={[[0, "idle"], [twenty - 6, { gesture: "point", dir: "up-right" }], [cars + 30, "idle"], [bogFirst - 4, "listen"]]}
        expression={[[0, "neutral"], [bogFirst, "happy"]]} at={0} enter="none" />
      <Mascot character="bog" x={BOG.x} y={830} scale={0.8} facing="left" look={{ x: PANEL_MID.x, y: PANEL_MID.y }} talking={bogTalking}
        gesture={[[0, "idle"], [zero - 6, "shrug"], [zero + 40, "idle"]]} expression={[[0, "neutral"], [twenty + 40, "confused"], [counted, "confused"]]} at={0} enter="none" seed="b2" />

      <Sfx name="pop" at={twenty} />
      <Sfx name="click" at={aero} volume={0.18} />
      <Sfx name="click" at={tire} volume={0.18} />
    </AbsoluteFill>
  );
};
