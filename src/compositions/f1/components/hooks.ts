import { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { getSection, LineTiming, Speaker, VoiceSection } from "../manifest";

export type { LineTiming, Speaker } from "../manifest";

/*
 * Timing hooks for scenes. A scene runs inside its own <Sequence>, so every frame below is RELATIVE
 * TO THE SECTION (frame 0 = start of the section's audio, which begins with ~0.2s of lead silence).
 * Times come from src/data/f1-voice.json (voiceover/generate.py); re-generate and everything follows.
 *
 *   useWordFrame(section, "billion", occurrence = 0) -> number
 *       Frame at which the word starts. Matches ignoring case/punctuation; "million" also matches inside
 *       "150-million-dollar-a-year". If the word is not spoken (script changed) it does NOT throw: it
 *       console.warns once per section/word and returns the first spoken frame, clamped into the section.
 *   useWord(section, "billion", occurrence = 0) -> { start, end }          (frames, same fallback)
 *   useLine(section, index) -> { index, speaker, text, start, end }        (frames; start = first word,
 *       end = last word). `index` is the line's position in section.lines (see the generate.py log).
 *       An out-of-range index warns once and clamps to the nearest line.
 *   useLines(section) -> LineTiming[]                                       every line of the section
 *   useSpeaking(section, speaker) -> boolean
 *       True only while that character is actually talking (word gaps over ~0.25s close the mouth).
 *       Use it for lip-sync / "talk" state; listeners get false, so they never flap their mouths.
 *
 * Pure (non-hook) versions: wordFrame, lineFrames, isSpeaking. `Speaker` is "mog" | "wec" | "bog".
 */

export const normalizeWord = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

const warned = new Set<string>();
const warnOnce = (key: string, message: string) => {
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(message);
};

const allWords = (section: VoiceSection) => section.lines.flatMap((l) => l.words);

const wordParts = (w: string) => w.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);

const findWord = (section: VoiceSection, word: string, occurrence: number) => {
  const target = normalizeWord(word);
  const words = allWords(section);
  const exact = words.filter((w) => normalizeWord(w.word) === target);
  const part = words.filter((w) => !exact.includes(w) && wordParts(w.word).includes(target));
  const loose = words.filter((w) => !exact.includes(w) && !part.includes(w) && target.length > 3 && normalizeWord(w.word).startsWith(target));
  // keep spoken order across the three match tiers
  const hits = words.filter((w) => exact.includes(w) || part.includes(w) || loose.includes(w));
  return { hit: hits[occurrence], count: hits.length };
};

const clampFrame = (section: VoiceSection, frame: number, fps: number) =>
  Math.max(0, Math.min(Math.round(section.duration * fps) - 1, frame));

const fallbackFrame = (section: VoiceSection, fps: number) => clampFrame(section, Math.round((section.lines[0]?.start ?? section.lead) * fps), fps);

/** Section-relative frame at which `word` starts (non-fatal: warns once and falls back, see top of file). */
export const wordFrame = (section: VoiceSection, word: string, fps: number, occurrence = 0) => {
  const { hit, count } = findWord(section, word, occurrence);
  if (hit) return clampFrame(section, Math.round(hit.start * fps), fps);
  warnOnce(
    `${section.id}|${normalizeWord(word)}|${occurrence}`,
    `[f1] anchor word "${word}" (occurrence ${occurrence}) not found in section "${section.id}" (${count} match${count === 1 ? "" : "es"}); using the first spoken frame. Check the script or the anchor.`,
  );
  return fallbackFrame(section, fps);
};

export const useWordFrame = (section: VoiceSection, word: string, occurrence = 0) => {
  const { fps } = useVideoConfig();
  return wordFrame(section, word, fps, occurrence);
};

export const useWord = (section: VoiceSection, word: string, occurrence = 0) => {
  const { fps } = useVideoConfig();
  const { hit } = findWord(section, word, occurrence);
  const start = wordFrame(section, word, fps, occurrence);
  return { start, end: hit ? clampFrame(section, Math.round(hit.end * fps), fps) : start };
};

export const lineFrames = (section: VoiceSection, fps: number): LineTiming[] =>
  section.lines.map((l, index) => ({
    index,
    speaker: l.speaker,
    text: l.text,
    start: clampFrame(section, Math.round(l.start * fps), fps),
    end: clampFrame(section, Math.round(l.end * fps), fps),
  }));

export const useLines = (section: VoiceSection) => {
  const { fps } = useVideoConfig();
  return useMemo(() => lineFrames(section, fps), [section, fps]);
};

export const useLine = (section: VoiceSection, index: number): LineTiming => {
  const lines = useLines(section);
  const clamped = Math.max(0, Math.min(lines.length - 1, index));
  if (clamped !== index) {
    warnOnce(`${section.id}|line|${index}`, `[f1] line ${index} does not exist in section "${section.id}" (${lines.length} lines); using line ${clamped}.`);
  }
  return lines[clamped];
};

const GAP = 0.25; // seconds of silence inside a line that closes the mouth
const LIP_PRE = 0.04;
const LIP_POST = 0.1;

/** True while `speaker` is talking at section-relative time `t` (seconds). */
export const isSpeaking = (section: VoiceSection, speaker: Speaker, t: number) =>
  section.lines.some((l) => {
    if (l.speaker !== speaker || t < l.start - LIP_PRE || t > l.end + LIP_POST) return false;
    for (let i = 0; i < l.words.length - 1; i++) {
      const a = l.words[i];
      const b = l.words[i + 1];
      if (b.start - a.end > GAP && t > a.end + LIP_POST && t < b.start - LIP_PRE) return false;
    }
    return true;
  });

export const useSpeaking = (section: VoiceSection, speaker: Speaker) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame(); // relative to the surrounding Sequence, i.e. the section
  return isSpeaking(section, speaker, frame / fps);
};

export const useSection = (id: string) => getSection(id);
