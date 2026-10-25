import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Sfx } from "../../components/Sfx";
import { useLine, useSpeaking, useWordFrame } from "../../components/hooks";
import { Mascot, VelvetDoor } from "../../components/mascot";
import { Logo } from "../../components/photo";
import { SceneProps } from "../../manifest";
import { editorial } from "../../../../theme";
import { Headline } from "./Text";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const Y = 830;
const MOG_X = 1560;

/** Dark summary beat with MOG, then the light end card with all three mascots. Holds through the tail. */
export const Outro3: React.FC<SceneProps> = ({ section }) => {
  const f = useCurrentFrame();
  const people = useWordFrame(section, "people");
  const digital = useWordFrame(section, "digital");
  const circus = useWordFrame(section, "greatest");
  const final = useLine(section, 1);
  const mogTalk = useSpeaking(section, "mog");
  const swap = final.start - 14; // light end card begins just before the last line
  const reveal = Easing.inOut(Easing.cubic)(interpolate(f, [swap, swap + 26], [0, 1], clamp));
  const radius = 250 + reveal * 2300;

  return (
    <AbsoluteFill style={{ background: editorial.ink }}>
      {/* light spotlight behind MOG grows into the end-card ground */}
      <div style={{ position: "absolute", left: MOG_X - radius, top: 590 - radius, width: radius * 2, height: radius * 2, borderRadius: "50%", background: editorial.bg }} />

      <Headline kicker="What changed" lines={["The people", "beneath the helmets"]} x={140} y={240} w={1000} at={Math.max(0, people - 4)} exitAt={digital - 14} dark size={84} />
      <Headline kicker="What changed" lines={["The digital age"]} x={140} y={240} w={1000} at={digital - 2} exitAt={circus - 14} dark size={84} />
      <Headline kicker="The result" lines={["The greatest", "traveling circus", "on Earth"]} x={140} y={200} w={1000} at={circus - 2} exitAt={swap - 4} dark size={84} />

      <Mascot
        character="mog" x={MOG_X} y={Y} scale={1.0} at={0} enter="none"
        facing={[[0, "left"], [final.start - 20, "front"]]}
        look="viewer"
        talking={mogTalk}
        gesture={[[0, "idle"], [circus, "cheer"], [circus + 50, "idle"]]}
        expression={[[0, "neutral"], [circus, "happy"]]}
      />

      {/* end card (light): open door, headline, all three mascots */}
      <VelvetDoor x={210} y={Y} scale={0.85} openAt={0} rope={false} at={swap + 10} enter="fade" />
      <Headline kicker="Formula 1" lines={["Everyone gets", "a front-row seat."]} x={420} y={250} w={700} at={final.start} size={66} />
      <Logo src="assets/logos/formula1.png" height={44} x={420 + 90} y={600} at={final.start + 24} />
      <Mascot character="bog" x={1110} y={Y} scale={0.95} at={swap + 14} enter="pop" facing="front" look="viewer" gesture="wave" expression="happy" talking={false} />
      <Mascot character="wec" x={1335} y={Y} scale={0.95} at={swap + 20} enter="pop" facing="front" look="viewer" prop="tickets" gesture="hold" expression="happy" talking={false} />
      <Sfx name="swoosh-soft" at={swap} volume={0.2} />
      <Sfx name="ding" at={final.end - 6} volume={0.2} />
    </AbsoluteFill>
  );
};
