import { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { editorial, toon } from "../../../theme";
import { Speaker, VoiceSection, VoiceWord } from "../manifest";
import { normalizeWord } from "./hooks";

/*
 * Captions for one section, editorial look: black text on an #EEEEEE pill, a black speaker chip, and
 * #CB2957 only on stat words (digits, percent/billion/million) which are always 56px+ bold.
 * Contrast: ink on #EEEEEE 18.1:1; #CB2957 on #EEEEEE 4.5:1 (AA, and the text is "large"); not-yet-spoken
 * words are ink at 55% (about #6B6B6B, 4.6:1). White-on-black would be 21:1 for the chip.
 *
 * Layout: the caption band is reserved at bottom centre, y 860..1040 of 1080 (the 8px progress bar sits
 * below it). Keep scene art and mascots out of that band.
 * Stacking: F1Explosion mounts <CaptionLayer/> after every scene, Hud and mascot, with a huge z-index.
 */

export const CAPTION_BAND = { top: 860, bottom: 1040 } as const;

const MAX_WORDS = 8;
const MERGE_WORDS = 7;
const LEAD = 0.05; // seconds a group appears before its first word
const KEEP_GAP = 0.7; // a group stays until the next one if that starts within this many seconds of its end
const SPEAKER_LABEL: Record<Speaker, string> = { mog: "MOG", wec: "WEC", bog: "BOG" };

const endsClause = (w: VoiceWord) => /[.!?,;:—–]["”']?$/.test(w.word);
const endsSentence = (w: VoiceWord) => /[.!?]["”']?$/.test(w.word);

// Group one line's words into short, balanced captions: split at punctuation, merge short clauses, even out long ones.
export const groupWords = (words: VoiceWord[]) => {
  const clauses: VoiceWord[][] = [];
  let cur: VoiceWord[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    if (endsClause(w) || i === words.length - 1) {
      clauses.push(cur);
      cur = [];
    }
  });
  const merged: VoiceWord[][] = [];
  for (const c of clauses) {
    const prev = merged[merged.length - 1];
    if (prev && !endsSentence(prev[prev.length - 1]) && prev.length + c.length <= MERGE_WORDS) prev.push(...c);
    else merged.push([...c]);
  }
  return merged.flatMap((c) => {
    const parts = Math.ceil(c.length / MAX_WORDS);
    const size = Math.ceil(c.length / parts);
    return Array.from({ length: parts }, (_, i) => c.slice(i * size, (i + 1) * size));
  });
};

type Group = { speaker: Speaker; words: VoiceWord[] };

export const captionGroups = (section: VoiceSection): Group[] =>
  section.lines.flatMap((l) => groupWords(l.words).map((words) => ({ speaker: l.speaker, words })));

const STAT_UNITS = new Set(["percent", "billion", "million"]);
const isStat = (w: string) => /^[$£€]?\d/.test(w) || STAT_UNITS.has(normalizeWord(w));

type Props = { section: VoiceSection };

export const Captions: React.FC<Props> = ({ section }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const groups = useMemo(() => captionGroups(section), [section]);
  const gi = groups.reduce((acc, g, i) => (t >= g.words[0].start - LEAD ? i : acc), -1);
  if (gi < 0) return null;
  const { speaker, words } = groups[gi];
  const next = groups[gi + 1];
  const lastEnd = words[words.length - 1].end;
  const linger = next && next.words[0].start - lastEnd < KEEP_GAP;
  const outAnim = linger ? 1 : interpolate(t, [lastEnd + 0.35, lastEnd + 0.6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (outAnim === 0) return null;
  const groupFrame = frame - Math.round((words[0].start - LEAD) * fps);
  const inAnim = interpolate(groupFrame, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: CAPTION_BAND.top,
        height: CAPTION_BAND.bottom - CAPTION_BAND.top,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 220px",
      }}
    >
      <div
        style={{
          maxWidth: 1480,
          padding: "12px 36px 16px",
          borderRadius: 40,
          background: editorial.bg,
          color: editorial.ink,
          border: `3px solid ${editorial.ink}`,
          fontFamily: toon.font.body,
          fontWeight: 800,
          fontSize: 56,
          lineHeight: 1.18,
          textAlign: "center",
          boxShadow: `0 6px 0 ${editorial.ink}`,
          opacity: inAnim * outAnim,
          transform: `translateY(${interpolate(inAnim, [0, 1], [12, 0])}px)`,
        }}
      >
        <span
          style={{
            display: "inline-block",
            verticalAlign: "middle",
            marginRight: 20,
            padding: "3px 14px 4px",
            borderRadius: 999,
            background: editorial.ink,
            color: editorial.white,
            fontSize: 26,
            letterSpacing: "0.14em",
            lineHeight: 1.2,
            position: "relative",
            top: -3,
          }}
        >
          {SPEAKER_LABEL[speaker]}
        </span>
        {words.map((w, i) => {
          const spoken = t >= w.start;
          return (
            <span key={i} style={{ color: spoken && isStat(w.word) ? editorial.accent : editorial.ink, opacity: spoken ? 1 : 0.55 }}>
              {w.word}
              {i < words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};
