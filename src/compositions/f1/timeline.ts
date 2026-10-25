import { FPS } from "../../theme";
import { ChapterId, chapterTitle, manifest, VoiceSection } from "./manifest";

/*
 * Frame layout, derived entirely from src/data/f1-voice.json:
 *   [hook sections] [card][liberty sections] [card][netflix ...] ... [outro sections][tail]
 * A section lasts exactly as long as its mp3 (lead + speech + pauses + tail are baked into the audio),
 * so chapter transitions get: previous tail + chapter card + next lead (~1.7s of calm).
 * The opening chapter starts cold, without a card.
 */

export const CHAPTER_CARD_FRAMES = 45;
/** Extra hold after the final section, on top of its own baked-in tail. */
export const OUTRO_TAIL_FRAMES = 30;

export type ChapterSegment = {
  kind: "chapter";
  from: number;
  duration: number;
  chapterIndex: number;
  chapterId: ChapterId;
  /** Display title. */
  chapter: string;
};

export type SectionSegment = {
  kind: "section";
  from: number;
  duration: number;
  chapterIndex: number;
  chapterId: ChapterId;
  /** Display title. */
  chapter: string;
  section: VoiceSection;
};

export type Segment = ChapterSegment | SectionSegment;

export const chapterIds = manifest.chapters.map((c) => c.id);

const build = () => {
  const list: Segment[] = [];
  let cursor = 0;
  let lastChapter: ChapterId | "" = "";
  for (const section of manifest.sections) {
    const chapterIndex = chapterIds.indexOf(section.chapter);
    const chapter = chapterTitle(section.chapter);
    if (section.chapter !== lastChapter && chapterIndex > 0) {
      list.push({ kind: "chapter", from: cursor, duration: CHAPTER_CARD_FRAMES, chapterIndex, chapterId: section.chapter, chapter });
      cursor += CHAPTER_CARD_FRAMES;
    }
    lastChapter = section.chapter;
    const duration = Math.round(section.duration * FPS);
    list.push({ kind: "section", from: cursor, duration, chapterIndex, chapterId: section.chapter, chapter, section });
    cursor += duration;
  }
  list[list.length - 1].duration += OUTRO_TAIL_FRAMES;
  return { list, total: cursor + OUTRO_TAIL_FRAMES };
};

const built = build();

export const segments = built.list;
export const sectionSegments = segments.filter((s): s is SectionSegment => s.kind === "section");
export const TOTAL_FRAMES = built.total;

/** First frame and length of each chapter (cards included), for chapter-level logic. */
export const chapterBounds = chapterIds.map((id, i) => {
  const own = segments.filter((s) => s.chapterIndex === i);
  const from = own[0].from;
  const last = own[own.length - 1];
  return { id, title: chapterTitle(id), from, to: last.from + last.duration };
});

// Segment playing at a global frame.
export const segmentAt = (frame: number) =>
  [...segments].reverse().find((s) => frame >= s.from) ?? segments[0];

export const segmentStart = (sectionId: string) =>
  segments.find((s) => s.kind === "section" && s.section.id === sectionId)?.from ?? 0;
