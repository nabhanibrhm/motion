import { SceneProps } from "../manifest";
import { placeholder } from "./placeholder";
import { scenes as demo } from "./demo";
import { scenes as hook } from "./hook";
import { scenes as liberty } from "./liberty";
import { scenes as netflix } from "./netflix";
import { scenes as outro } from "./outro";
import { scenes as usa } from "./usa";

/*
 * Scene contract (keep stable; each chapter file is rewritten independently):
 * - A chapter file exports `scenes: Record<sectionId, React.FC<SceneProps>>`.
 * - A scene gets `{ section: VoiceSection }` (see ../manifest) and is rendered inside its own
 *   Sequence: useCurrentFrame() is 0 at section start, durationInFrames = voice + padding
 *   (the last scene also holds through the outro tail).
 * - The section <Audio> is added by F1Explosion; scenes render visuals only. Captions are drawn by F1Explosion in a
 *   top layer ABOVE every scene and mascot; keep art out of the caption band (y 860..1040, bottom centre).
 * - Sync beats to narration with the hooks in ../components/hooks (see the comment block at its top):
 *   useWordFrame(section, "word", occ?), useLine(section, i), useLines(section), useSpeaking(section, "mog"|"wec"|"bog").
 *   Missing anchors only console.warn (once) and fall back to the first spoken frame.
 * - Sound effects: <Sfx name="pop" at={frame}/> from ../components/Sfx (no music).
 * - Frame-driven animation only (useCurrentFrame/interpolate/spring); no CSS transitions, Date or Math.random.
 *
 * Look: warm, flat, friendly illustration (see ../components/toon/README.md for every prop).
 * - The persistent <Ground/> (calm plum, soft glow, floating particles) is underneath, so scenes stay
 *   transparent unless they cover it on purpose (e.g. <Ground tone="old"/> or <Grain/> for 2010 flashbacks).
 * - Layout: text in a LEFT column (x = 140, width 820) via <Words/>, illustration on the RIGHT half
 *   (x 1000..1840). Keep the bottom 300 px clear for captions (art feet / cars at y <= 780).
 * - Life: nothing is ever static. People/Driver/Suit/Crowd/Car idle by themselves; Words and art drift
 *   -2 px/s (<Words/> does it for you; wrap other art in <Drift/>).
 * - Entrances: text fades in from the right (<Words/> does it: opacity + 26 px, ~12 frames, staggered);
 *   illustrations ease in with <Enter from="right" dist={70} frames={20}/>; small objects pop with
 *   overshoot via <Pop at={frame}/>. Cut-away/diagram moments use <CutEdge/>, <Leader/> and <Tag/>.
 * - Colours: `toon` tokens from src/theme.ts (cream text, red/amber/mint/sky accents, `toon.old` for flashbacks).
 *
 *   import { Words, Enter, Person, Pop, Tag } from "../components/toon";
 *   const Scene: React.FC<SceneProps> = ({ section }) => {
 *     const hit = useWordFrame(section, "billion");
 *     return (
 *       <AbsoluteFill>
 *         <Words kicker="2009" lines={["A *billionaire's*", "playground"]} sub="Doors shut." at={6} />
 *         <Enter at={10} from="right" dist={70} frames={20}>
 *           <Person x={1420} y={770} size={1.15} pose="wave" facing="left" />
 *         </Enter>
 *         <Tag text="$$$" x={1560} y={260} at={hit} />
 *       </AbsoluteFill>
 *     );
 *   };
 */
const chapterScenes: Record<string, React.FC<SceneProps>> = {
  ...hook,
  ...liberty,
  ...netflix,
  ...demo,
  ...usa,
  ...outro,
};

/** Every v2 section id (src/data/f1-voice.json), in playing order. */
export const sectionIds = [
  "hook-1", "hook-2", "hook-3", "hook-4",
  "liberty-1", "liberty-2", "liberty-3", "liberty-4", "liberty-5", "liberty-6",
  "netflix-1", "netflix-2", "netflix-3", "netflix-4", "netflix-5",
  "demo-1", "demo-2", "demo-3", "demo-4", "demo-5", "demo-6", "demo-7",
  "usa-1", "usa-2", "usa-3", "usa-4",
  "outro-1", "outro-2", "outro-3",
] as const;

/*
 * TEMPORARY bridge: v2 ids that also existed in v1 (hook-1..3, liberty-1..4, netflix-1..3, demo-1..3, usa-1..2,
 * outro-1..2) keep their old scene for now; new ids borrow the closest one below. Anything a chapter file exports
 * under an id wins automatically; delete the alias entry when you add the real scene.
 */
const legacyAlias: Record<string, string> = {
  "hook-4": "hook-3",
  "liberty-5": "liberty-3", "liberty-6": "liberty-4",
  "netflix-4": "netflix-3", "netflix-5": "netflix-3",
  "demo-4": "demo-2", "demo-5": "demo-2", "demo-6": "demo-3", "demo-7": "demo-3",
  "usa-3": "usa-2", "usa-4": "usa-2",
  "outro-3": "outro-2",
};

export const sceneRegistry: Record<string, React.FC<SceneProps>> = Object.fromEntries(
  sectionIds.map((id) => [id, chapterScenes[id] ?? chapterScenes[legacyAlias[id]] ?? placeholder("Scene\ncoming up", "")]),
);
