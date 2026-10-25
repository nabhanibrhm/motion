import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Sfx } from "../../components/Sfx";
import { useLines, useSpeaking, useWordFrame } from "../../components/hooks";
import { Mascot, VelvetDoor } from "../../components/mascot";
import { SceneProps } from "../../manifest";
import { editorial, toon } from "../../../../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const Y = 830;
const BOG = { x: 390, y: 600 };
const WEC = { x: 940, y: 600 };
const MOG = { x: 1440, y: 600 };

/** The opening door returns, wide open. BOG asks, WEC has the tickets, MOG takes the front row. */
export const Outro2: React.FC<SceneProps> = ({ section }) => {
  const f = useCurrentFrame();
  const [l0, l1, l2, l3] = useLines(section);
  const two = useWordFrame(section, "two");
  const bogTalk = useSpeaking(section, "bog");
  const wecTalk = useSpeaking(section, "wec");
  const mogTalk = useSpeaking(section, "mog");
  const badge = interpolate(f, [two, two + 14], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ background: editorial.bg }}>
      <div style={{ position: "absolute", left: 96, top: Y, width: 1728, height: 4, background: editorial.rule }} />
      <VelvetDoor x={390} y={Y} scale={1.1} openAt={0} rope={false} />

      <Mascot
        character="bog" x={BOG.x} y={Y} scale={1.0} at={0} enter="none"
        facing={[[0, "front"], [l0.end + 6, "right"]]}
        look={[[0, "viewer"], [l0.end + 6, WEC], [l3.start, MOG]]}
        talking={bogTalk}
        gesture={[[0, "idle"], [l0.end + 6, "listen"], [l2.start, { gesture: "point", dir: "right" }], [l2.end + 6, "listen"]]}
        expression={[[0, "confused"], [l1.start + 8, "surprised"], [l2.start, "confused"], [l3.start + 30, "happy"]]}
      />
      <Mascot
        character="wec" x={WEC.x} y={Y} scale={1.15} at={0} enter="none" facing="left"
        look={[[0, BOG], [l3.start, MOG]]}
        talking={wecTalk}
        prop="tickets"
        gesture={[[0, "hold"], [l1.start - 4, "cheer"], [l1.end + 10, "idle"]]}
        expression={[[0, "neutral"], [l1.start - 4, "happy"]]}
      />
      <Mascot
        character="mog" x={MOG.x} y={Y} scale={1.2} at={0} enter="none" facing="left"
        look={[[0, BOG], [l1.start, WEC], [l2.start, BOG], [l3.start + 40, "viewer"]]}
        talking={mogTalk}
        gesture={[[0, "listen"], [l3.start, "shrug"], [l3.end + 4, "idle"]]}
        expression={[[0, "neutral"], [l3.start, "smug"]]}
      />

      <div
        style={{
          position: "absolute", left: 800, top: 250, opacity: badge, transform: `translateY(${(1 - badge) * 14}px)`,
          fontFamily: toon.font.display, fontWeight: 800, fontSize: 64, color: editorial.ink, lineHeight: 1,
        }}
      >
        <span style={{ color: editorial.accentOnLight }}>2</span> tickets
        <div style={{ width: 130 * badge, height: 8, borderRadius: 4, background: editorial.accent, marginTop: 14 }} />
      </div>
      <Sfx name="pop" at={two} volume={0.25} />
    </AbsoluteFill>
  );
};
