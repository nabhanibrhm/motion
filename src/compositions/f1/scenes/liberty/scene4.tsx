import { AbsoluteFill } from "remotion";
import { SceneProps } from "../../manifest";
import { Mascot } from "../../components/mascot";
import { BigStat, Logo } from "../../components/photo";
import { Sfx } from "../../components/Sfx";
import { useSpeaking, useWordFrame } from "../../components/hooks";
import { editorial, toon } from "../../../../theme";
import { Backdrop, Reveal } from "./kit";

/** Stat hold: Liberty Media joined to the F1 logo, then $8 billion settles and stays readable. */
export const Liberty4: React.FC<SceneProps> = ({ section }) => {
  const mog = useSpeaking(section, "mog");
  const liberty = useWordFrame(section, "Liberty");
  const bought = useWordFrame(section, "bought");
  const eight = useWordFrame(section, "8");
  return (
    <AbsoluteFill>
      <Backdrop />
      <Reveal at={liberty} style={{ left: 140, top: 150, fontFamily: toon.font.display, fontWeight: 800, fontSize: 92, letterSpacing: "-0.02em", color: editorial.ink, lineHeight: 1 }}>
        Liberty<span style={{ color: editorial.muted, fontWeight: 600 }}> Media</span>
      </Reveal>
      <Reveal at={bought} style={{ left: 760, top: 150, fontFamily: toon.font.display, fontWeight: 800, fontSize: 80, color: editorial.accentOnLight, lineHeight: 1.05 }}>+</Reveal>
      <Logo src="assets/logos/formula1.png" width={380} x={1010} y={190} at={bought} enter="fade" />
      <BigStat prefix="$" value={8} suffix=" billion" label="Liberty Media buys Formula 1" at={eight - 10} dur={40} x={140} y={330} fontSize={270} />
      <Sfx name="cash" at={eight} />
      <Mascot character="mog" x={1480} scale={1.15} facing="left" talking={mog} gesture={[[0, "idle"], [eight, { gesture: "point", dir: "left" }], [eight + 70, "idle"]]} />
      <Mascot character="bog" x={1740} scale={0.85} enter="none" facing="left" look={{ x: 1480, y: 560 }} gesture="listen" expression={[[0, "neutral"], [eight + 20, "surprised"]]} />
    </AbsoluteFill>
  );
};
