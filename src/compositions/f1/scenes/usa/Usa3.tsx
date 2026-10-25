import { AbsoluteFill } from "remotion";
import { editorial } from "../../../../theme";
import { Sfx } from "../../components/Sfx";
import { useSpeaking, useWordFrame } from "../../components/hooks";
import { Mascot } from "../../components/mascot";
import { BigStat, Logo } from "../../components/photo";
import { SceneProps } from "../../manifest";
import { Heading } from "./kit";

export const Usa3: React.FC<SceneProps> = ({ section }) => {
  const mog = useSpeaking(section, "mog");
  const apple = useWordFrame(section, "Apple");
  const stat = useWordFrame(section, "150-million-dollar-a-year");
  const deal = useWordFrame(section, "deal");

  return (
    <AbsoluteFill style={{ background: editorial.bg }}>
      <Heading kicker="Big tech" headline="Apple moves in" x={96} y={110} w={1000} size={72} at={10} />
      <Logo src="assets/logos/apple.png" height={130} x={150} y={355} enter="pop" at={apple} />
      <Logo src="assets/logos/formula1.png" width={260} x={470} y={355} enter="fade" at={apple + 10} />
      <BigStat prefix="$" value={150} suffix="M" label="a year for US broadcast rights" at={stat} dur={50} x={96} y={450} fontSize={220} />
      <Sfx name="riser" at={stat - 20} volume={0.2} />
      <Sfx name="cash" at={stat + 40} />

      <Mascot
        character="mog" x={1560} y={830} scale={1.15} facing="left" look={{ x: 600, y: 520 }} talking={mog}
        prop={[[0, "phone"], [apple, "none"]]}
        expression={[[0, "neutral"], [stat + 40, "smug"]]}
        gesture={[[0, "idle"], [apple, { gesture: "point", dir: "left" }], [deal + 10, "idle"]]}
        enter="none"
      />
    </AbsoluteFill>
  );
};
