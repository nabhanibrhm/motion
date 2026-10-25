import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Captions } from "./components/Captions";
import { CarbonBackground } from "./components/CarbonBackground";
import { ChapterCard } from "./components/ChapterCard";
import { Hud } from "./components/Hud";
import { loadF1Fonts } from "./fonts";
import { sceneRegistry } from "./scenes";
import { sectionSegments, segments } from "./timeline";

export type F1ExplosionProps = { captions: boolean };

const PREMOUNT_FRAMES = 30;
// Captions live in their own top layer, after (and with a higher z-index than) every scene, prop and mascot.
const CAPTION_Z = 100000;

loadF1Fonts();

export const F1Explosion: React.FC<F1ExplosionProps> = ({ captions = true }) => {
  return (
    <AbsoluteFill>
      <CarbonBackground />
      {/* Scene layer: chapter cards and sections. Chapter scenes place their own mascots. */}
      {segments.map((seg) => {
        if (seg.kind === "chapter") {
          return (
            <Sequence key={`chapter-${seg.chapterIndex}`} from={seg.from} durationInFrames={seg.duration} premountFor={PREMOUNT_FRAMES} name={`Chapter ${seg.chapterIndex + 1}`}>
              <ChapterCard index={seg.chapterIndex + 1} title={seg.chapter} />
            </Sequence>
          );
        }
        const { section } = seg;
        const Scene = sceneRegistry[section.id];
        return (
          <Sequence key={section.id} from={seg.from} durationInFrames={seg.duration} premountFor={PREMOUNT_FRAMES} name={section.id}>
            <Audio src={staticFile(section.audio)} />
            {Scene && <Scene section={section} />}
          </Sequence>
        );
      })}
      <Hud />
      {/* Caption layer: always on top of everything above. */}
      {captions && (
        <AbsoluteFill style={{ zIndex: CAPTION_Z, pointerEvents: "none" }}>
          {sectionSegments.map((seg) => (
            <Sequence key={seg.section.id} from={seg.from} durationInFrames={seg.duration} premountFor={PREMOUNT_FRAMES} name={`captions ${seg.section.id}`}>
              <Captions section={seg.section} />
            </Sequence>
          ))}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
