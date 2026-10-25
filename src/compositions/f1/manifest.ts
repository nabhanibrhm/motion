import data from "../../data/f1-voice.json";

/*
 * Typed view of src/data/f1-voice.json (written by voiceover/generate.py).
 * All line/word times are SECONDS relative to the start of their section's audio (the lead silence is
 * included, so the first word starts at ~0.2s). `Section.start` is the offset on the narration-only
 * timeline; the video's real frame positions come from timeline.ts.
 */

export type Speaker = "mog" | "wec" | "bog";
export const SPEAKERS: readonly Speaker[] = ["mog", "wec", "bog"];

export type ChapterId = "hook" | "liberty" | "netflix" | "demo" | "usa" | "outro";

/** One spoken word; `word` keeps its punctuation (e.g. "club.\""). */
export type VoiceWord = { word: string; start: number; end: number };

/** One utterance by one speaker (the unit scenes should key beats and lip-sync on). */
export type VoiceLine = { speaker: Speaker; text: string; start: number; end: number; words: VoiceWord[] };

/** Legacy flat word (`text` alias of `word`), kept so old cue code keeps compiling. */
export type LegacyWord = VoiceWord & { text: string };

export type VoiceSection = {
  id: string;
  chapter: ChapterId;
  /** Seconds on the narration-only timeline (no chapter cards). */
  start: number;
  /** Seconds; includes the lead and tail silence baked into the mp3. */
  duration: number;
  lead: number;
  tail: number;
  /** Path for staticFile(). */
  audio: string;
  text: string;
  lines: VoiceLine[];
  /** @deprecated flat list of every word in the section; prefer `lines`. */
  words: LegacyWord[];
};

export type ChapterInfo = { id: ChapterId; title: string };

export type VoiceManifest = {
  speakers: Record<Speaker, { voice: string; rate: string; pitch: string }>;
  chapters: ChapterInfo[];
  total: number;
  sections: VoiceSection[];
};

/** Beat/line model shared by hooks, captions and scenes: a line positioned in frames of its section. */
export type LineTiming = { index: number; speaker: Speaker; text: string; start: number; end: number };

export type SceneProps = { section: VoiceSection };

type RawSection = Omit<VoiceSection, "words">;

const raw = data as unknown as Omit<VoiceManifest, "sections"> & { sections: RawSection[] };

export const manifest: VoiceManifest = {
  ...raw,
  sections: raw.sections.map((s) => ({
    ...s,
    words: s.lines.flatMap((l) => l.words.map((w) => ({ ...w, text: w.word }))),
  })),
};

export const chapterTitle = (id: ChapterId) => manifest.chapters.find((c) => c.id === id)?.title ?? id;

export const getSection = (id: string) => {
  const section = manifest.sections.find((s) => s.id === id);
  if (!section) throw new Error(`Unknown voice section: ${id}`);
  return section;
};
