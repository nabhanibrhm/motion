import { Audio, Sequence, staticFile } from "remotion";

/*
 * Sound effects synthesised by voiceover/sfx.py (public/sfx/*.wav, peaks at -6.2 dBFS).
 * Usage inside a scene: <Sfx name="pop" at={useWordFrame(section, "tickets")} />
 * `at` is a frame relative to the surrounding Sequence (the scene/section). The default volume (0.25) keeps
 * effects under the speech; raise it only for sparse hero sounds. No music in this video.
 */
export type SfxName =
  | "whoosh" // 0.6s air sweep: big slide-ins, wipes, scene changes
  | "swoosh-soft" // 0.5s gentler sweep: props, cards and photo frames sliding in
  | "pop" // 0.16s bubble pop: small objects, labels, pins appearing
  | "click" // 0.07s UI click: toggles, phone taps, highlights
  | "ding" // 1.0s bell: a reveal or a correct answer
  | "tick" // 0.05s soft tick: counters, list items, chart bars stepping
  | "riser" // 1.0s rising sweep: build-up before a big number or reveal
  | "door-open" // 0.95s soft creak: the velvet-rope door swinging open
  | "cash" // 0.9s ratchet plus two chimes: money stats
  | "shutter"; // 0.25s double camera click: photo cards, flash moments

export const SFX_NAMES: readonly SfxName[] = ["whoosh", "swoosh-soft", "pop", "click", "ding", "tick", "riser", "door-open", "cash", "shutter"];

type Props = { name: SfxName; at: number; volume?: number };

export const Sfx: React.FC<Props> = ({ name, at, volume = 0.25 }) => (
  <Sequence from={Math.max(0, Math.round(at))} layout="none" name={`sfx ${name}`}>
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);
