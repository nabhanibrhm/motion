import { AbsoluteFill } from "remotion";
import { editorial } from "../../../../theme";
import { useLine, useSpeaking, useWordFrame } from "../../components/hooks";
import { Mascot, TripMap } from "../../components/mascot";
import { SceneProps } from "../../manifest";
import { Heading } from "./kit";

export const Usa1: React.FC<SceneProps> = ({ section }) => {
  const mog = useSpeaking(section, "mog");
  const bog = useSpeaking(section, "bog");
  const failed = useWordFrame(section, "failed");
  const market = useWordFrame(section, "market");
  const bogLine = useLine(section, 1);
  const MAP = { x: 960, y: 500 };

  return (
    <AbsoluteFill style={{ background: editorial.bg }}>
      <Heading kicker="The United States" headline="F1's missing market" x={96} y={110} w={1100} size={72} at={8} />
      <div style={{ position: "absolute", left: 540, top: 716, width: 840, height: 34, borderRadius: 8, background: editorial.panel, borderTop: `4px solid ${editorial.rule}` }} />
      <TripMap x={MAP.x} y={MAP.y} scale={1.15} at={4} />

      <Mascot
        character="mog" x={330} y={830} scale={1.05} facing="right" look={{ x: MAP.x, y: MAP.y }} talking={mog}
        expression={[[0, "neutral"], [failed, "confused"], [market + 20, "neutral"]]}
        gesture={[[0, "idle"], [failed - 6, { gesture: "point", dir: "right" }], [market + 14, "idle"]]}
        enter="none"
      />
      <Mascot
        character="wec" x={1520} y={830} scale={0.95} facing="left" look={{ x: 330, y: 560 }} talking={false} gesture="listen" prop="tickets"
        expression={[[0, "neutral"], [failed, "confused"]]} at={14} enter="walk-right"
      />
      <Mascot
        character="bog" x={1730} y={830} scale={0.9} facing="left" look={{ x: 330, y: 560 }} talking={bog}
        gesture={[[0, "listen"], [bogLine.start - 6, "shrug"], [bogLine.end + 10, "listen"]]}
        expression={[[0, "neutral"], [bogLine.start - 6, "confused"]]} at={22} enter="walk-right"
      />
    </AbsoluteFill>
  );
};
