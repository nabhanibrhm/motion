import { AbsoluteFill, useCurrentFrame } from "remotion";
import { chart, editorial, toon } from "../../../../theme";
import { Mascot } from "../../components/mascot";
import { ramp } from "../../components/toon/anim";
import { useLine, useSpeaking, useWordFrame } from "../../components/hooks";
import { Sfx } from "../../components/Sfx";
import { SceneProps } from "../../manifest";
import { Bg, Heading } from "./kit";

const CH = { x: 520, y: 270, w: 760, h: 480 };

/** demo-1: MOG steps up to an unlabelled chart; BOG guesses; MOG proposes checking. */
export const Demo1: React.FC<SceneProps> = ({ section }) => {
  const frame = useCurrentFrame();
  const bog = useLine(section, 1);
  const check = useLine(section, 2);
  const shift = useWordFrame(section, "shifts");
  const mogTalk = useSpeaking(section, "mog");
  const bogTalk = useSpeaking(section, "bog");
  const ghost = [0.35, 0.6, 0.45, 0.8, 0.55];
  const mogLook = { x: CH.x + CH.w / 2, y: CH.y + CH.h / 2 };
  const checked = ramp(frame, check.start, 10);

  return (
    <AbsoluteFill>
      <Bg />
      <Heading x={140} y={112} w={1200} kicker="Who is watching?" lines={["The audience changed"]} size={64} at={4} />
      {/* scaffold chart: no numbers until MOG checks */}
      <div
        style={{
          position: "absolute",
          left: CH.x,
          top: CH.y,
          width: CH.w,
          height: CH.h,
          background: editorial.white,
          borderRadius: 14,
          boxShadow: "0 12px 40px rgba(0,0,0,0.10)",
          opacity: ramp(frame, 6, 14),
          border: `3px solid ${checked > 0.01 ? editorial.accent : editorial.rule}`,
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ position: "absolute", left: 40, right: 40, top: 60 + i * 110, height: 2, background: chart.grid }} />
        ))}
        {ghost.map((g, i) => {
          const grow = ramp(frame, shift - 6 + i * 5, 24);
          return <div key={i} style={{ position: "absolute", left: 70 + i * 135, width: 90, bottom: 60, height: (CH.h - 120) * g * grow, background: chart.muted, borderRadius: "6px 6px 0 0" }} />;
        })}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: toon.font.display,
            fontWeight: 800,
            fontSize: 220,
            color: editorial.accent,
            opacity: ramp(frame, bog.start - 6, 12) * (1 - checked),
          }}
        >
          ?
        </div>
      </div>

      <Mascot
        character="bog"
        x={260}
        y={830}
        scale={0.95}
        facing="right"
        at={0}
        enter="fade"
        look={[[0, mogLook], [bog.start, "front"], [check.start, { x: 1430, y: 520 }]]}
        talking={bogTalk}
        gesture={[[0, "listen"], [bog.start - 4, "shrug"], [bog.end, "listen"]]}
        expression={[[0, "confused"], [bog.start, "smug"], [bog.end + 10, "neutral"]]}
      />
      <Mascot
        character="mog"
        x={1430}
        y={830}
        scale={1.1}
        facing="left"
        at={10}
        enter="pop"
        look={[[0, mogLook], [bog.start, { x: 260, y: 600 }], [check.start - 4, mogLook]]}
        talking={mogTalk}
        gesture={[[0, "idle"], [shift - 20, { gesture: "point", dir: "left" }], [bog.start - 6, "listen"], [check.start - 4, { gesture: "point", dir: "left" }]]}
        expression="neutral"
      />
      <Mascot
        character="wec"
        x={1740}
        y={830}
        scale={0.8}
        facing="left"
        at={16}
        enter="pop"
        look={[[0, mogLook], [bog.start, { x: 260, y: 600 }], [check.start, mogLook]]}
        gesture="listen"
        expression={[[0, "happy"], [bog.start, "confused"], [check.start, "happy"]]}
      />
      <Sfx name="pop" at={14} />
      <Sfx name="click" at={check.start} />
    </AbsoluteFill>
  );
};
