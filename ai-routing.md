# AI model routing

> **AI AGENT INSTRUCTION:** Whenever a new change request is received, you must first read this file, identify the target files for the request, and switch to the cheapest approved model listed below before writing any code.

This repo makes faceless short videos in Bahasa Indonesia with HyperFrames: HTML
scenes animated by GSAP timelines, rendered frame by frame to MP4 in headless
Chrome. Each video is a self-contained project in `out/<topic>/<video>/`; the current
one is `out/Ekonomi_keuangan/inflasi/`. There is no server and no stored data.

What *can* go wrong is quiet and only shows up at render time:
- An animation that depends on wall-clock time, CSS transitions or `Math.random()` instead of the timeline. It previews fine and flickers in the render.
- A change to the voice alignment or to the shared timing helpers that shifts every caption, lip-sync and SFX after it.
- Facts that are wrong. This is a finance channel, so a wrong number is a credibility problem, not a typo.

The tiers below are weighted for that. The toolchain, the voice pipeline and the shared timing and layout plumbing route high however small the diff is. Copy wording, colours and one scene's art route low. Facts get checked against a source at every tier.

## Models and effort

| Model | Effort | Use for |
|---|---|---|
| **Haiku 5.5** | default | Docs, caption/line wording that keeps the facts, SFX swaps, colour values |
| **Sonnet 5.5** · medium | medium | One scene (`compositions/<section>.html`) and its art, a new icon or prop in the episode kit |
| **Sonnet 5.5** · high | high | Shared timing and layout (`lib/f1/core.js`, `timing.js`, `F1.STAGE`), `scripts/sync.mjs`, voice config structure, a new video project, anything spanning three or more files |
| **Opus 5.5** · high | high | The voice generator and word alignment (`voiceover/generate.py`), dependencies and lockfiles, a render that fails with no known cause, new facts or figures in a script |
| **Opus 5.5** · max | xhigh / max | A HyperFrames major upgrade, switching the TTS engine, cloud rendering, a stack or architecture change |

**How to switch.**
- **Session:** if the current model or effort is higher than needed, say so in one line and ask the user to switch with `/model`. If it's lower, stop and ask for the higher one before writing code.
- **Subagents:** set `model` (`haiku`, `sonnet` or `opus`) and `effort` on the agent call to match the table. Delegating cheap work this way is preferred over switching the whole session.

---

## Routing map

Paths are relative to a video project (e.g. `out/Ekonomi_keuangan/inflasi/`) unless they start at the repo root. Where several rows match a file, the first one wins.

### Opus 5.5

| Path / pattern | Effort | Why |
|---|---|---|
| `package.json` `dependencies` / `devDependencies`, `package-lock.json`, the Python packages in `.venv` | high | `hyperframes` is pinned to an **exact version** (no `^`). The CLI, its bundled GSAP and the render engine move together, and a bump can change how every frame renders. |
| `voiceover/generate.py`: alignment, onset snapping, loudness, the cache key | high | Every word timing comes from here, so captions, lip-sync and SFX all shift with it. Changing the alignment logic needs a bump to the cache salt, or stale timings get reused. |
| New facts, figures or claims in `script*.md`, `voiceover/*.json` or on-screen text | high | This is financial content. Every number needs a source in the script's sources table, and investment wording keeps the "Bukan saran investasi" disclaimer. |
| A render or snapshot that fails or hangs with no known cause | high | Usually Chrome or FFmpeg, memory (WSL's low-memory mode) or a non-deterministic scene, not the line in the stack trace. |
| HyperFrames major upgrade, a new TTS engine | max | |
| Cloud rendering, replacing a stack piece | max | |

### Sonnet 5.5 · high

| Path / pattern |
|---|
| `scripts/sync.mjs`: generates `index.html`, `compositions/captions.html`, `lib/f1/voice.js` and the SFX `data-start` values |
| `lib/f1/core.js` (`F1.scene`, interpolate/spring, the DOM morph) and `lib/f1/timing.js` (word frames, lip-sync, caption grouping) |
| `F1.STAGE` and the layout constants: canvas size, the caption band, mascot feet, the safe zones for platform buttons |
| Structure of `voiceover/<video>.json`: speakers, sections, `"source"`, pause markers (wording inside existing lines is Haiku) |
| Shared drawing kit used by every scene: `lib/f1/mascot.js`, `toon.js`, `photo.js`, `words.js`, `bits.js`, `f1.css`, and the doodle pen/`Card`/`Stepper`/`Title` in `kasus.js` |
| `compositions/frame.html` (persistent title + stepper over every scene) |
| `hyperframes.json`, `package.json` `scripts`, `scripts/hf.mjs`, `scripts/stills.mjs` |
| A new video project under `out/<topic>/<video>/` (copying the kit, voice config, sync settings) |

### Sonnet 5.5 · medium

| Path / pattern |
|---|
| One scene, `compositions/<section>.html`: its art, its GSAP timeline and its SFX `<audio data-at=…>` anchors |
| The episode kit `lib/f1/kasus.js`: a new icon, stamp or prop used by one or two scenes (keep the doodle rules: ink pen, pastel fill, coral accent, ASCII-only Luckiest Guy text) |
| `compositions/background.html` styling |
| Re-encoding or a new format for audio/images in `public/` |

### Haiku 5.5

| Path / pattern |
|---|
| `**/*.md`: `CLAUDE.md`, `HANDOFF.md`, this file, `voiceover/lines.md` (or regenerate it with `--list`) |
| Wording of an existing line or caption that keeps every fact and number the same |
| Swapping a file in `public/sfx/` or `public/fonts/` for one of the same kind |
| Colour values in `lib/f1/f1.css` (a new variable or a change to how colours are wired is Sonnet · high) |
| `.gitignore`, `.gitattributes`, a `package.json` `version` bump on its own |

**Generated, don't edit by hand:** `index.html`, `compositions/captions.html`, `lib/f1/voice.js`, `src/data/<video>-voice.json`, `public/voice/**`, `voiceover/.cache/`, `.stills/`, `renders/`, `node_modules/`, `.venv/`. Change the source (voice config, `generate.py`, `sync.mjs`) and regenerate.

---

## Cross-tier rules

1. **Highest wins.** A request touching several rows runs at the highest model and effort among them.
2. **Route on files, not wording.** List the target files first. "Make the stamp bounce more" is Sonnet · medium (one scene). "Make captions show 3 words instead of 5" is Sonnet · high (`timing.js`, every scene).
3. **The kind of change can only raise the level.**
   - Anything that changes **what gets installed** (a version, the lockfile, a Python package, the Node version): **Opus**.
   - Anything that changes **voice timing or timing for more than one scene** (alignment, `sync.mjs`, caption grouping, section order, pause markers): at least **Sonnet · high**.
   - Anything that could make rendering **non-deterministic** (`Date`, `Math.random()`, CSS animations or transitions, timers, fonts or media not loaded before capture): at least **Sonnet · high**.
   - Anything that changes **output size or format** (canvas size, aspect ratio, fps, codec, the platform safe zones): at least **Sonnet · high**.
   - Any **new fact or number** shown or spoken: **Opus · high**, with the source added to the script's sources table.
4. **Paired files go together.** A line in `voiceover/<video>.json` and the scene whose `data-at` anchors use its words; a kit piece in `kasus.js` and the scenes that draw it; `package.json` and `package-lock.json`. Do them in one batch, at the higher of the two rows.
5. **Scope grows, stop.** If the work needs a higher row mid-task, say so and continue only at that level.
6. **Read-only work drops one level.** Questions, searches and explanations: Haiku, or Sonnet · medium for Opus areas. No code written.
7. **Reviews match the code**, one level up for Opus areas (high → xhigh).
8. **Unsure, go one level up** and say why in one line.

## Rules that outrank this file

These apply at every tier:

- **`hyperframes` stays pinned exactly.** Upgrade it on purpose, then re-check stills and do a full render. Never run `npm audit fix --force`.
- **Animate from the timeline only.** Scenes draw from the frame through `F1.scene` and GSAP timelines. No CSS transitions or animations, timers, wall-clock time or unseeded randomness.
- **Never hand-edit generated files.** After any voice change, run the generator, then `node scripts/sync.mjs`, then check stills.
- **Voice files come from TTSMaker** (`"source": "files"`, one MP3 per line in `voiceover/lines/`). Each mascot keeps the same voice across episodes. edge-tts is only a placeholder.
- **Keep the platform safe zones clear:** the bottom ~15% and the right ~120 px of the 1080×1920 frame.
- **Facts carry sources.** Each figure (BI, BPS, OJK …) is listed in the script's sources table. Investment talk keeps "Bukan saran investasi".
- **Before handing off:** `npm run lint` with no errors, and stills checked (`node scripts/stills.mjs all`). A dependency change also needs a fresh install and a full render.
- **Check frames go to `.stills/` or `%TEMP%\motion-stills\`.** Finished videos go to the project's `renders/` only.
- **Commit only when the user asks**, and never add a Claude co-author line.

---

_Re-derived on 31 Oct 2026 for the HyperFrames short-video projects. It replaces the Remotion version written on 23 Oct 2026._
