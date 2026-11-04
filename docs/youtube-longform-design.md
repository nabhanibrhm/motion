# YouTube long-form (16:9) design

Status: **plan, not implemented** (2 Nov 2026). Nothing here changes the current 9:16 pipeline until a phase below is approved.

## Goal

Add a second output format to the shared pipeline: horizontal **1920×1080, 30 fps** episodes of about **6–10 minutes** for YouTube. The 9:16 shorts (TikTok / YouTube Shorts) keep working unchanged and stay byte-for-byte reproducible (verified for 02–07 in `out/compare/REPORT.md`).

Non-goals: arbitrary sizes, a second engine, per-episode dependencies, or upgrading HyperFrames from 0.8.210.

## Content format: "Berkas Kasus"

The long version extends the KASUS format instead of inventing a new show. The same cast (Muklis, Nisa, Beni), voices and visual language are used, but one case gets space for evidence.

| Part | Length | Purpose |
|---|---|---|
| Cold open | 0:00–0:30 | The hook from the short, then the case title card |
| Bukti 1–4 (chapters) | 1–2 min each | One question per chapter: what happened, why, who is hit, who gains |
| Simulasi | ~1 min | The worked example (labelled ilustrasi), with the numbers on screen |
| Yang bisa kita lakukan | ~1 min | Practical steps, each with a source |
| Kasus ditutup | ~20 s | Verdict, comment question, subscribe |

At the current voice speed (~2,8 words/s) 8 minutes is about **1.300 spoken words**, so roughly 5× a short. Each chapter is one `narration.json` section and one scene file, so a long episode has about 8 scenes instead of 6–7, but each scene runs longer and needs more beats (camera moves, B-roll panels, charts) to hold attention.

A long episode can share research and sources with its short but **not scene files**: vertical art does not recompose to 16:9. Plan to author a long episode and cut its short from the same script, not the reverse.

## Format contract

Add a `format` field to the episode manifest. It replaces the free `video` block; size is derived from it.

```json
{ "format": "short-9x16" }   // 1080×1920, default, today's behaviour
{ "format": "long-16x9" }    // 1920×1080
```

| | `short-9x16` | `long-16x9` |
|---|---|---|
| Size / fps | 1080×1920 / 30 | 1920×1080 / 30 |
| Output | `out/NN-<id>-short.mp4` | `out/NN-<id>-long.mp4` |
| Captions | Burned in, 6 words, dark box at y≈1480–1650 | Burned in, larger line length (~10 words), lower third; also export `.srt` |
| Stage (`F1.STAGE`) | Cast below, art above | Cast on one side, art/evidence panel on the other |
| Loudness | -14 LUFS / -1 dBTP | same |
| Music bed | Looped, configured gain | same, loop must cover 10 min |

Manifests without `format` stay `short-9x16`, so existing episodes need no edit.

## Pipeline changes (where the 1080×1920 assumption lives)

| Location | Today | Change |
|---|---|---|
| `src/config/validate.mjs:13` | Rejects anything but 1080×1920 | Accept the two named formats only |
| `config/defaults.json`, `scripts/motion.mjs:96` (`new`) | Hard-coded size | `new --format long-16x9`; size from a format table in `src/config/` |
| `src/runtime/f1/mascot.js:528` `F1.STAGE` | One vertical stage | Stage table per format; runtime reads the active one |
| `src/runtime/f1/world.js:62` `row(... span=1080)` | Vertical width | Default `span` from stage width |
| `src/templates/captions.mjs` | 1080×1920 defaults | Geometry per format; landscape line length and position |
| `src/templates/title-card.mjs`, `background.html` | `data-width="1080" data-height="1920"` | Filled from the format |
| Episode scenes `episodes/*/scenes/*.html` | Hard-coded vertical layout | Unchanged; new long episodes author landscape scenes |
| `src/pipeline/master.mjs` | Fine | Check bed loop length and two-pass time on 10-min audio |
| New: chapters + subtitles | — | After `sync`, write `chapters.txt` (YouTube timestamps from scene starts) and `<id>.srt` from the word alignment into `.cache/build/<id>/`; publish next to the video in `out/` |

Voice: no engine change expected. Longer narration means more sections, and the cache is already per section. Supertonic and Whisper alignment on ~1.300 words must be timed in the pilot.

## Phases and routing (per `ai-routing.md`)

| Phase | Work | Model / effort |
|---|---|---|
| 0 | This document; agree the format and the pilot topic | — |
| 1 | Format contract: manifest field, validation, format table, `new --format`, output naming | Contract review Opus / max, implementation Sonnet / high |
| 2 | Runtime and templates: per-format `F1.STAGE`, `world.row` span, captions and title-card geometry | Sonnet / high |
| 3 | Regression gate: `npm test`, lint all 8 episodes, re-render one short (02) and confirm SSIM ≈ 1 against `out/` | Sonnet / high; failures Opus / high |
| 4 | Pilot long episode: script and new facts | Opus / high |
| 5 | Pilot scenes, one agent per scene | Sonnet / medium each |
| 6 | Voice, render, mastering check on 8–10 min output; chapters/SRT export | Opus / high |
| 7 | YouTube upload kit: title, description with chapters and sources, tags, thumbnail (1280×720 still) | Haiku |

Phases 1–3 are the framework; 4–7 are the first episode on it. The first planned use is the compilation in [youtube-compilation-design.md](youtube-compilation-design.md). It needs Phases 1–3, skips 4–5 because it reuses the eight finished shorts, and adds a step that composites finished videos into the 16:9 frame. The pilot should reuse an existing case with good sources (e.g. 02 rupiah or 07 kelas) so research cost stays low.

## Open decisions

1. Target length: 6–8 min or 8–12 min (affects word count, scenes and render time).
2. Pilot topic: expand an existing case or make a new one.
3. Captions: burned-in for all, or YouTube CC from the `.srt` only.
4. Thumbnail style: a still from the video, or a dedicated `thumbnail.html` per episode.
5. Music: current bed looped, or a longer licensed track.

## Risks

- **Render time and storage:** a 10-min 1080p render is roughly 6× a short; outputs of ~250–400 MB land in Google Drive via `out/`.
- **Scene authoring cost:** the largest effort is landscape art, not code; budget agents accordingly.
- **Regression:** shared runtime edits can shift the shorts. Phase 3 gates every change with the re-render comparison.
