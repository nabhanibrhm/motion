import { AbsoluteFill, useVideoConfig } from "remotion";
import { toon } from "../../../theme";
import { useWordFrame } from "../components/hooks";
import { Enter } from "../components/toon/Motion";
import { Person, Pose } from "../components/toon/Person";
import { Words } from "../components/toon/Words";
import { SceneProps } from "../manifest";

const POSES: Pose[] = ["wave", "idle", "think", "point", "cheer"];
const TOPS = [toon.sky, toon.mint, toon.amber, toon.pink, toon.lilac];

// Stand-in scene in the illustrated style: Words on the left (last line highlighted), a friendly Person on the right.
export const placeholder = (text: string, keyword: string): React.FC<SceneProps> => {
  const h = [...text].reduce((a, c) => a + c.charCodeAt(0), 0);
  const Scene: React.FC<SceneProps> = ({ section }) => {
    const { durationInFrames } = useVideoConfig();
    const hit = useWordFrame(section, keyword);
    const lines = text.split("\n");
    const highlight = lines[lines.length - 1].split(" ");
    return (
      <AbsoluteFill>
        <Words lines={lines} highlight={highlight} at={Math.max(4, hit - 8)} stagger={9} exitAt={durationInFrames - 14} />
        <Enter at={Math.max(2, hit - 14)} from="right" dist={70} frames={20} exitAt={durationInFrames - 14}>
          <Person
            x={1420}
            y={770}
            size={1.15}
            seed={h % 7}
            skin={toon.skins[h % 5]}
            hair={(["short", "long", "bun", "curly"] as const)[h % 4]}
            hairColor={Object.values(toon.hairs)[h % 6]}
            top={TOPS[h % TOPS.length]}
            pose={POSES[h % POSES.length]}
            expression="smile"
            facing="left"
          />
        </Enter>
      </AbsoluteFill>
    );
  };
  return Scene;
};
