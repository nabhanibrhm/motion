import { AbsoluteFill, useCurrentFrame } from "remotion";
import { chart, editorial, toon } from "../../../../theme";
import { Mascot } from "../../components/mascot";
import { ramp } from "../../components/toon/anim";
import { useSpeaking, useWordFrame } from "../../components/hooks";
import { Sfx } from "../../components/Sfx";
import { SceneProps } from "../../manifest";
import { Bg, Heading } from "./kit";

const BASE = 760; // chart baseline y
const PX = 11; // px per year (axis starts at 0)
const BX = 330;
const BW = 220;

/** demo-2 (stat hold): average fan age bar grows to 36, drops to 32 and holds. */
export const Demo2: React.FC<SceneProps> = ({ section }) => {
  const frame = useCurrentFrame();
  const drop = useWordFrame(section, "plummeted");
  const to32 = useWordFrame(section, "32");
  const mogTalk = useSpeaking(section, "mog");
  const grow = ramp(frame, 8, Math.max(14, drop - 10));
  const fall = ramp(frame, drop, Math.max(22, to32 - drop + 8));
  const value = 36 * grow - 4 * fall;
  const shown = Math.round(value);
  const barTop = BASE - value * PX;
  const settled = fall >= 1;
  const labelOn = ramp(frame, drop + 6, 14);

  return (
    <AbsoluteFill>
      <Bg />
      <Heading x={140} y={112} w={1100} kicker="Average fan age" lines={["Getting younger"]} size={72} at={2} />
      <div style={{ position: "absolute", left: 200, top: BASE, width: 780, height: 3, background: editorial.ink, opacity: ramp(frame, 0, 10) }} />
      {[10, 20, 30, 40].map((t) => (
        <div key={t} style={{ position: "absolute", left: 200, top: BASE - t * PX, width: 780, height: 2, background: chart.grid, opacity: ramp(frame, 0, 10) }}>
          <span style={{ position: "absolute", left: -56, top: -16, fontFamily: toon.font.body, fontWeight: 700, fontSize: 24, color: editorial.muted }}>{t}</span>
        </div>
      ))}
      {/* ghost line at 36 */}
      <div style={{ position: "absolute", left: BX - 30, top: BASE - 36 * PX, width: BW + 60, height: 0, borderTop: `3px dashed ${editorial.muted}`, opacity: ramp(frame, drop - 4, 10) }}>
        <span style={{ position: "absolute", left: BW + 80, top: -18, fontFamily: toon.font.body, fontWeight: 800, fontSize: 28, color: editorial.muted, whiteSpace: "nowrap" }}>was 36</span>
      </div>
      <div style={{ position: "absolute", left: BX, top: barTop, width: BW, height: BASE - barTop, background: settled ? chart.highlight : chart.muted, borderRadius: "8px 8px 0 0" }} />
      <div
        style={{
          position: "absolute",
          left: BX,
          top: barTop + 14,
          width: BW,
          textAlign: "center",
          fontFamily: toon.font.display,
          fontWeight: 800,
          fontSize: 86,
          color: settled ? editorial.white : editorial.ink,
          fontVariantNumeric: "tabular-nums",
          opacity: ramp(frame, 8, 10),
        }}
      >
        {shown}
      </div>
      {/* big read-out */}
      <div style={{ position: "absolute", left: 1000, top: 250, opacity: labelOn }}>
        <div style={{ fontFamily: toon.font.display, fontWeight: 800, fontSize: 200, lineHeight: 0.95, color: editorial.ink, letterSpacing: "-0.03em" }}>
          36<span style={{ color: editorial.muted, margin: "0 24px" }}>{"→"}</span>
          <span style={{ color: editorial.accent }}>32</span>
        </div>
        <div style={{ marginTop: 18, fontFamily: toon.font.body, fontWeight: 800, fontSize: 34, letterSpacing: "0.12em", textTransform: "uppercase", color: editorial.ink }}>average fan age</div>
      </div>

      <Mascot
        character="mog"
        x={1560}
        y={830}
        scale={1.0}
        facing="left"
        at={6}
        enter="pop"
        look={{ x: BX + BW / 2, y: BASE - 300 }}
        talking={mogTalk}
        gesture={[[0, "idle"], [drop - 10, { gesture: "point", dir: "left" }]]}
        expression="neutral"
      />
      <Mascot character="bog" x={1770} y={830} scale={0.7} facing="left" at={12} enter="pop" look={{ x: 1560, y: 600 }} gesture="listen" expression={[[0, "neutral"], [to32 + 10, "surprised"]]} />
      <Sfx name="tick" at={drop} />
      <Sfx name="ding" at={to32 + 6} />
    </AbsoluteFill>
  );
};
