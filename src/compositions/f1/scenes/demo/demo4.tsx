import { AbsoluteFill, useCurrentFrame } from "remotion";
import { chart, editorial, toon } from "../../../../theme";
import { Mascot } from "../../components/mascot";
import { ramp } from "../../components/toon/anim";
import { useLine, useSpeaking, useWordFrame } from "../../components/hooks";
import { Sfx } from "../../components/Sfx";
import { SceneProps } from "../../manifest";
import { Bg, Heading } from "./kit";

const DOOR_W = 300;
const DOOR_H = 440;
const DOOR_TOP = 260;

const Door: React.FC<{ x: number; color: string; label: string; at: number; openAt: number }> = ({ x, color, label, at, openAt }) => {
  const frame = useCurrentFrame();
  const a = ramp(frame, at, 14);
  const open = ramp(frame, openAt, 22);
  return (
    <div style={{ position: "absolute", left: x, top: DOOR_TOP + (1 - a) * 24, width: DOOR_W, opacity: a }}>
      {/* doorway with light behind */}
      <div style={{ position: "relative", width: DOOR_W, height: DOOR_H, borderRadius: `${DOOR_W / 2}px ${DOOR_W / 2}px 8px 8px`, background: `linear-gradient(180deg, ${editorial.white} 40%, ${color}44)`, border: `8px solid ${color}`, overflow: "hidden", boxSizing: "border-box" }}>
        {/* door leaf, hinged on the left */}
        <div style={{ position: "absolute", inset: 0, background: color, transformOrigin: "left center", transform: `scaleX(${1 - open * 0.8})` }}>
          <div style={{ position: "absolute", right: 26, top: DOOR_H / 2, width: 20, height: 20, borderRadius: "50%", background: editorial.white, opacity: 1 - open }} />
        </div>
      </div>
      <div style={{ marginTop: 22, textAlign: "center", fontFamily: toon.font.display, fontWeight: 800, fontSize: 46, color: editorial.ink }}>{label}</div>
    </div>
  );
};

/** demo-4: WEC lists different reasons to watch, each behind its own door; BOG gets it. */
export const Demo4: React.FC<SceneProps> = ({ section }) => {
  const frame = useCurrentFrame();
  const bog = useLine(section, 1);
  const drivers = useWordFrame(section, "drivers");
  const strategy = useWordFrame(section, "strategy");
  const atmos = useWordFrame(section, "atmosphere");
  const door = useWordFrame(section, "door");
  const wecTalk = useSpeaking(section, "wec");
  const bogTalk = useSpeaking(section, "bog");
  const [c1, c2, c3] = chart.series.slice(0, 3);
  const doorLook = { x: 900, y: 450 };

  return (
    <AbsoluteFill>
      <Bg />
      <Heading x={140} y={112} w={1200} kicker="Not one kind of fan" lines={["Different reasons, different doors"]} size={58} at={4} />
      <Door x={520} color={c1} label="Drivers" at={drivers - 8} openAt={door + 6} />
      <Door x={860} color={c2} label="Strategy" at={strategy - 8} openAt={door + 12} />
      <Door x={1200} color={c3} label="Atmosphere" at={atmos - 8} openAt={door + 18} />
      <div style={{ position: "absolute", left: 520, top: 800, fontFamily: toon.font.body, fontWeight: 700, fontSize: 24, color: editorial.muted, opacity: ramp(frame, door + 24, 14) * (1 - ramp(frame, bog.start, 10)) }} />

      <Mascot
        character="wec"
        x={290}
        y={830}
        scale={1.05}
        facing="right"
        at={0}
        enter="fade"
        look={[[0, doorLook], [bog.start - 30, { x: 1760, y: 600 }], [bog.start, { x: 1760, y: 600 }]]}
        talking={wecTalk}
        gesture={[[0, "idle"], [drivers - 6, { gesture: "point", dir: "up-right" }], [door + 30, { gesture: "point", dir: "right" }], [bog.start - 6, "listen"]]}
        expression="happy"
      />
      <Mascot
        character="bog"
        x={1730}
        y={830}
        scale={0.9}
        facing="left"
        at={6}
        enter="pop"
        look={[[0, { x: 290, y: 600 }], [door + 20, doorLook], [bog.start - 10, { x: 290, y: 600 }]]}
        talking={bogTalk}
        gesture={[[0, "listen"], [bog.start - 4, "idle"]]}
        expression={[[0, "confused"], [door + 40, "neutral"], [bog.start, "happy"]]}
      />
      <Sfx name="pop" at={drivers} />
      <Sfx name="pop" at={strategy} />
      <Sfx name="pop" at={atmos} />
      <Sfx name="door-open" at={door + 4} volume={0.2} />
    </AbsoluteFill>
  );
};
