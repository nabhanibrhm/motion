/*
 * Voice timing for the F1 video. Pure functions (no DOM), loaded by the browser (index.html) and by
 * scripts/sync.mjs in Node, so scenes and the generated root/captions/SFX always use the same rules.
 *
 * Data: F1.VOICE (lib/f1/voice.js, generated from src/data/f1-voice.json by `npm run sync`).
 * Word and line times in the data are SECONDS from the start of their section's audio (the lead silence is
 * included, so the first word starts at ~0.2s). Scene code works in FRAMES of its section (frame 0 = section start).
 *
 *   F1.section(id)                       the voice section
 *   F1.wordFrame(S, "billion", occ = 0)  frame the word starts. Matches ignoring case/punctuation; "million" also
 *                                        matches inside "150-million-dollar-a-year". Missing: warns once and falls
 *                                        back to the first spoken frame, clamped into the section.
 *   F1.word(S, "billion", occ = 0)       { start, end } in frames (same fallback)
 *   F1.lines(S) / F1.line(S, i)          { index, speaker, text, start, end } in frames (start = first word)
 *   F1.isSpeaking(S, speaker, f)         true only while that character is actually talking (gaps > 0.25s close
 *                                        the mouth). Lip-sync rule: only the speaking mascot moves its mouth.
 *   F1.at(S, spec)                       a frame from an anchor spec (see below); used by scenes and by the sync
 *                                        script to place SFX <audio> clips.
 *
 * Anchor specs (also the `data-at` attribute of SFX clips):
 *   "120"                 frame 120 of the section
 *   "word:tickets"        start of the word ("word:tickets#1" = 2nd occurrence, "word:tickets:end" = its end)
 *   "line:1"              start of line 1 ("line:1:end" = its last word's end)
 *   any of them + "+12" or "-36": an offset in frames, e.g. "line:1-36", "word:door+4"
 */
(function (F1) {
  const FPS = 30;
  F1.FPS = FPS;

  /* ---------------------------------------------------------------- timeline (was timeline.ts) */

  F1.CHAPTER_CARD_FRAMES = 45;
  /** Extra hold after the final section, on top of its own baked-in tail. */
  F1.OUTRO_TAIL_FRAMES = 30;

  F1.sections = () => F1.VOICE.sections;
  F1.section = (id) => {
    const s = F1.VOICE.sections.find((x) => x.id === id);
    if (!s) throw new Error(`Unknown voice section: ${id}`);
    return s;
  };
  F1.chapterTitle = (id) => (F1.VOICE.chapters.find((c) => c.id === id) || { title: id }).title;

  /**
   * Frame layout, derived entirely from the voice data:
   *   [hook sections] [card][liberty sections] [card][netflix ...] ... [outro sections][tail]
   * A section lasts exactly as long as its mp3 (lead + speech + pauses + tail are baked into the audio), so
   * chapter transitions get: previous tail + chapter card + next lead. The opening chapter starts cold, without a card.
   */
  F1.segments = () => {
    const ids = F1.VOICE.chapters.map((c) => c.id);
    const list = [];
    let cursor = 0;
    let last = "";
    for (const section of F1.VOICE.sections) {
      const chapterIndex = ids.indexOf(section.chapter);
      const chapter = F1.chapterTitle(section.chapter);
      if (section.chapter !== last && chapterIndex > 0) {
        list.push({ kind: "chapter", from: cursor, duration: F1.CHAPTER_CARD_FRAMES, chapterIndex, chapterId: section.chapter, chapter });
        cursor += F1.CHAPTER_CARD_FRAMES;
      }
      last = section.chapter;
      const duration = Math.round(section.duration * FPS);
      list.push({ kind: "section", from: cursor, duration, chapterIndex, chapterId: section.chapter, chapter, section });
      cursor += duration;
    }
    list[list.length - 1].duration += F1.OUTRO_TAIL_FRAMES;
    return { list, total: cursor + F1.OUTRO_TAIL_FRAMES };
  };

  /** Frames a section's scene lasts (its slot; the last one also holds through the outro tail). */
  F1.sceneFrames = (id) => F1.segments().list.find((s) => s.kind === "section" && s.section.id === id).duration;

  /* ---------------------------------------------------------------- words and lines (was hooks.ts) */

  F1.normalizeWord = (w) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  const wordParts = (w) => w.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const allWords = (S) => S.lines.flatMap((l) => l.words);

  const warned = new Set();
  const warnOnce = (key, message) => {
    if (warned.has(key)) return;
    warned.add(key);
    console.warn(message);
  };

  const findWord = (S, word, occurrence) => {
    const target = F1.normalizeWord(word);
    const words = allWords(S);
    const exact = words.filter((w) => F1.normalizeWord(w.word) === target);
    const part = words.filter((w) => !exact.includes(w) && wordParts(w.word).includes(target));
    const loose = words.filter((w) => !exact.includes(w) && !part.includes(w) && target.length > 3 && F1.normalizeWord(w.word).startsWith(target));
    // keep spoken order across the three match tiers
    const hits = words.filter((w) => exact.includes(w) || part.includes(w) || loose.includes(w));
    return { hit: hits[occurrence], count: hits.length };
  };

  const clampFrame = (S, f) => Math.max(0, Math.min(Math.round(S.duration * FPS) - 1, f));
  const fallbackFrame = (S) => clampFrame(S, Math.round(((S.lines[0] && S.lines[0].start) ?? S.lead) * FPS));

  F1.wordFrame = (S, word, occurrence = 0) => {
    const { hit, count } = findWord(S, word, occurrence);
    if (hit) return clampFrame(S, Math.round(hit.start * FPS));
    warnOnce(
      `${S.id}|${F1.normalizeWord(word)}|${occurrence}`,
      `[f1] anchor word "${word}" (occurrence ${occurrence}) not found in section "${S.id}" (${count} match${count === 1 ? "" : "es"}); using the first spoken frame. Check the script or the anchor.`,
    );
    return fallbackFrame(S);
  };

  F1.word = (S, word, occurrence = 0) => {
    const { hit } = findWord(S, word, occurrence);
    const start = F1.wordFrame(S, word, occurrence);
    return { start, end: hit ? clampFrame(S, Math.round(hit.end * FPS)) : start };
  };

  F1.lines = (S) =>
    S.lines.map((l, index) => ({
      index,
      speaker: l.speaker,
      text: l.text,
      start: clampFrame(S, Math.round(l.start * FPS)),
      end: clampFrame(S, Math.round(l.end * FPS)),
    }));

  F1.line = (S, index) => {
    const lines = F1.lines(S);
    const clamped = Math.max(0, Math.min(lines.length - 1, index));
    if (clamped !== index) warnOnce(`${S.id}|line|${index}`, `[f1] line ${index} does not exist in section "${S.id}" (${lines.length} lines); using line ${clamped}.`);
    return lines[clamped];
  };

  const GAP = 0.25; // seconds of silence inside a line that closes the mouth
  const LIP_PRE = 0.04;
  const LIP_POST = 0.1;

  /** True while `speaker` is talking at section frame `f`. */
  F1.isSpeaking = (S, speaker, f) => {
    const t = f / FPS;
    return S.lines.some((l) => {
      if (l.speaker !== speaker || t < l.start - LIP_PRE || t > l.end + LIP_POST) return false;
      for (let i = 0; i < l.words.length - 1; i++) {
        const a = l.words[i];
        const b = l.words[i + 1];
        if (b.start - a.end > GAP && t > a.end + LIP_POST && t < b.start - LIP_PRE) return false;
      }
      return true;
    });
  };

  /* ---------------------------------------------------------------- anchors */

  F1.at = (S, spec) => {
    const m = String(spec).trim().match(/^(.*?)([+-]\d+(?:\.\d+)?)?$/);
    const base = m[1];
    const off = m[2] ? Number(m[2]) : 0;
    if (/^\d+(\.\d+)?$/.test(base)) return Number(base) + off;
    let mm = base.match(/^word:([^#:]+)(?:#(\d+))?(:end)?$/);
    if (mm) {
      const w = F1.word(S, mm[1], mm[2] ? Number(mm[2]) : 0);
      return (mm[3] ? w.end : w.start) + off;
    }
    mm = base.match(/^line:(\d+)(:end)?$/);
    if (mm) {
      const l = F1.line(S, Number(mm[1]));
      return (mm[2] ? l.end : l.start) + off;
    }
    if (base === "" && m[2]) return off;
    throw new Error(`[f1] bad anchor "${spec}" in section ${S.id}`);
  };

  /* ---------------------------------------------------------------- captions (was Captions.tsx) */

  const MAX_WORDS = 8;
  const MERGE_WORDS = 7;
  const endsClause = (w) => /[.!?,;:—–]["”']?$/.test(w.word);
  const endsSentence = (w) => /[.!?]["”']?$/.test(w.word);

  /** Group one line's words into short, balanced captions: split at punctuation, merge short clauses, even out long ones. */
  F1.groupWords = (words) => {
    const clauses = [];
    let cur = [];
    words.forEach((w, i) => {
      cur.push(w);
      if (endsClause(w) || i === words.length - 1) {
        clauses.push(cur);
        cur = [];
      }
    });
    const merged = [];
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

  F1.captionGroups = (S) => S.lines.flatMap((l) => F1.groupWords(l.words).map((words) => ({ speaker: l.speaker, words })));

  const STAT_UNITS = new Set(["percent", "billion", "million"]);
  /** Stat words (digits, percent/billion/million) are drawn in the accent once spoken. */
  F1.isStat = (w) => /^[$£€]?\d/.test(w) || STAT_UNITS.has(F1.normalizeWord(w));
})((globalThis.F1 = globalThis.F1 || {}));
