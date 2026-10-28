# Handoff: where things stand (28 Oct 2026)

Written on the Windows machine, to continue tomorrow on the WSL laptop. Branch: **`hyperframes`**. Nothing has been committed since `67c4f07`; the user commits by hand, so never run `git commit`.

## Current work: Indonesian economics short, "Kenapa Harga Nasi Goreng Naik Terus?"

> **The project lives in `out/Ekonomi_keuangan/inflasi/` and is tracked in git.** `.gitignore` now skips only `out/*.mp4`: the F1 videos at the top of `out/` are 117 MB and 214 MB, which is over GitHub's 100 MB limit. `.venv/`, `node_modules/`, `.stills/`, `.hyperframes/` and `voiceover/.cache/` are ignored at any depth and are rebuilt on each machine.

**What it is**
- A faceless channel in Bahasa Indonesia about economics and personal finance. The first video is about inflation, using storyline A, "Detektif Harga".
- A vertical 9:16 short (1080×1920) for TikTok, Shorts and Reels, about 67 s long. The target is 55–65 s.
- The scenes run hook → penjual → bahan → kita → dalang → pelajaran. The last scene mirrors the hook so the short loops.
- It uses the F1 mascots: MOG (calm narrator), BOG (fussy) and WEC (cheerful).
- The facts are sourced from BI and BPS, with the sources table in `script-short.md`:
  - 2025 inflation: 2,92%
  - volatile food: 6,21%
  - 1998 inflation: 77,63%
  - Rp100.000 → Rp74.400 after 10 years at 3%
- **A first full render exists:** `renders/inflasi-short.mp4`, with placeholder edge-tts voices.

**Voice: TTSMaker (ttsmaker.com, free, allows commercial use)**
- `voiceover/generate.py` has a **files mode**. It reads one MP3 per line from `voiceover/lines/<section>-<n>.mp3` and levels the loudness. It then finds each word's timing with faster-whisper ("small", CPU, `language="id"`), matched to the script text.
- Measured against exact edge-tts timings: median error 46 ms, 90% of words within 115 ms. Spelled-out numbers are the weak spot: "dua puluh ribu" is heard as "20.000", so the later words of a number can be up to ~0.5 s off. The first word of each number is accurate.
- `voiceover/lines.md` is the recording checklist: 11 files, each with its speaker and exact text. `voiceover/generate.py voiceover/inflasi.json --list` regenerates it.

**Key files (in `out/Ekonomi_keuangan/inflasi/`)**

| Path | What it is |
|---|---|
| `script-short.md` / `script.md` | Short script with sources / longer first draft |
| `voiceover/inflasi.json` | Lines and speakers. `"source": "files"` switches from edge-tts to the TTSMaker MP3s |
| `voiceover/lines.md`, `voiceover/lines/` | Recording checklist; folder for the 11 MP3s (empty now) |
| `compositions/*.html` | One scene per section, plus `background.html` |
| `lib/f1/kasus.js` | Episode visuals: receipt, stamps, suspect card, notes, icons |
| `lib/f1/*` | F1 kit. Stage size comes from `F1.STAGE` (vertical layout) |
| `scripts/sync.mjs` | Regenerates `index.html`, captions and the SFX timing from the voice data |
| `scripts/stills.mjs` | `node scripts/stills.mjs all\|<section>\|custom --at 1,2` → `.stills/` |

Vertical layout: visuals at y 160–1000, captions at y 1040–1240, mascots with feet at y 1580. Keep the bottom ~15% and the right ~120 px clear for platform buttons.

**Set up on the WSL laptop**
```bash
git switch hyperframes && git pull
cd out/Ekonomi_keuangan/inflasi
sudo apt install ffmpeg python3-venv
python3 -m venv .venv
.venv/bin/pip install edge-tts numpy faster-whisper
npm install
```
- The Whisper "small" model (~460 MB) downloads on the first run.
- If rendering complains about missing browser libraries, install the Chrome dependencies it names.

**Next steps**
1. On ttsmaker.com, pick 3 Indonesian voices, one each for MOG, BOG and WEC. Record the 11 lines in `voiceover/lines.md` and save them as `voiceover/lines/hook-0.mp3` and so on. Note which voice each mascot uses, so it stays the same in future episodes.
2. Add `"source": "files"` to `voiceover/inflasi.json`.
3. Rebuild and render:
   ```bash
   .venv/bin/python voiceover/generate.py voiceover/inflasi.json
   node scripts/sync.mjs
   node scripts/stills.mjs all      # check .stills/ before rendering
   npm run render                   # -> renders/inflasi-short.mp4
   ```
4. Listen for how "THR", "OJK" and "segitu-segitu" are pronounced. If they're wrong, write "Te Ha Er" or "O Je Ka" in TTSMaker; the captions keep the correct spelling. Then check the total length and the timing of SFX and captions.

Gotchas:
- In PowerShell, `npm run stills -- custom --at …` drops `--at`. Call `node scripts/stills.mjs` directly.
- faster-whisper's own audio reader (PyAV) broke on Windows, so `generate.py` decodes the audio with FFmpeg instead.

## Earlier work: Remotion → HyperFrames migration of the F1 video (shelved)

The user chose to start fresh, so this is parked. The notes below are kept for reference. The hook and liberty chapters were ported in commits `74fef08` and `67c4f07`.

Decisions already made:
- **Approach: Hybrid.** Native HyperFrames structure (one sub-composition per voice section, voice + SFX as `<audio>` clips, captions track, chapter card, HUD), and the procedural art (mascots, toon art, photo cards) as framework-free JS in `lib/f1/` that draws from timeline time. Remotion and React both go away.
- **Effort:** the user chose Opus · high for the migration (ai-routing.md would say max).
- **Demo chapter** ("The Demographic Revolution", `demo-1..7`) is ported too, as its own step between netflix and usa.
- **No v2 reference** was available on WSL. On Windows it should be at `D:\Dev\motion\out\f1-explosion-v2.mp4`: copy it into this repo's `out\` and `npm run stills -- <chapter>` pairs every still with the reference automatically.

Done (commits `c9b9f60`, `cb273fc` and the handoff commit):
- HyperFrames skills in `.claude/skills` (hyperframes, hyperframes-cli, hyperframes-registry, media-use, remotion-to-hyperframes).
- Shared parts ported and scored ≥ 8: timeline, captions, mascots MOG/WEC/BOG (same art, same lip-sync rule), photo kit, toon kit (ground, car, grain, motion wrappers), words/tags, SFX timing, chapter card, HUD, background. Sheet: `npm run stills -- shared`.
- Only visual changes vs v2: HUD label 22 → 28 px, photo-card kicker 26 → 30 px (phone readability).
- `.gitattributes` (LF text, binary media), `.gitignore` (node_modules, out, .stills, .venv, voiceover/.cache, .hyperframes), `voiceover/.cache` untracked.
- `requirements.txt`, `"engines": {"node": ">=22"}`, `voiceover/generate.py` finds FFmpeg via `FFMPEG` env or `shutil.which("ffmpeg")`.

Still to do, in order (stop after each chapter with a contact sheet, scores 1–10 on match / phone readability / motion / composition, fix anything under 8, commit):
1. **hook** (`src/compositions/f1/scenes/hook/*` → `compositions/hook-1..4.html`)
2. **liberty**, 3. **netflix**, 4. **demo**, 5. **usa**, 6. **outro**
   - Every `compositions/<section>.html` is a **TEMPORARY placeholder** (photo card + talking mascots) until its chapter is ported.
   - Not ported yet, port when a scene needs them: `toon/Person.tsx`, `toon/Crowd.tsx`, `scenes/*/kit.tsx`, `scenes/hook/bits.tsx` (FeedCard, Chip, Sepia).
7. Rewrite `CLAUDE.md` for HyperFrames (keep the "read ai-routing.md first" line, add an **Environments** section: WSL + Windows/PowerShell setup and render commands, winget for FFmpeg).
8. Rewrite `ai-routing.md` for HyperFrames: same tiers, map the new files (`lib/f1/*`, `compositions/*`, `scripts/*`, `index.html` is generated), keep the deterministic-render rules, and route changes that affect both machines (`.gitattributes`, `requirements.txt`, `engines`, install steps) to Opus · high.
9. Remove Remotion: `remotion`, `@remotion/cli`, `react`, `react-dom`, their `@types`, `typescript` if unused, `remotion.config.ts`, `tsconfig.json`, `src/Root.tsx`, `src/index.ts`, `src/components`, `src/compositions`, `scripts/render.mjs`, and the old npm scripts. Keep `src/data/f1-voice.json`.
10. Render `out/f1-explosion-v3.mp4` (`npm run render:v3`), then push the branch.

## How the HyperFrames project works

| Path | What it is |
|---|---|
| `index.html` | **Generated** root: section hosts, chapter cards, voice `<audio>`, HUD, captions. Never edit by hand. |
| `compositions/<section>.html` | One scene per voice section (hand-written). `window.__timelines["<id>"] = F1.scene("<id>", (f, { S, D }) => markup)`; SFX are `<audio data-at="word:tickets">` clips (sync fills `data-start`). |
| `compositions/chapter-card.html` | Mounted once per chapter with `data-variable-values` (number, title). |
| `compositions/captions.html`, `hud.html` | **Generated.** |
| `lib/f1/f1.css` | Palette groups from `theme.ts` as CSS variables + `@font-face` for `public/fonts`. The single source of colour. |
| `lib/f1/core.js` | Remotion-equivalent maths (`interpolate`, `Easing`, `spring`, `random`), DOM morph, `F1.scene`. |
| `lib/f1/timing.js` | Voice timing, shared by browser and Node: `F1.wordFrame`, `F1.line`, `F1.isSpeaking` (lip-sync), `F1.at` anchors, caption grouping. |
| `lib/f1/mascot.js`, `toon.js`, `photo.js`, `words.js` | Ports of `components/mascot`, `toon`, `photo`, `toon/Words+Tag`. Components are `(props, f) => HTML string`, f = scene frame. |
| `lib/f1/voice.js` | **Generated** from `src/data/f1-voice.json`. |
| `scripts/sync.mjs` | Regenerates everything above from the voice data; run after `npm run voice`. |
| `scripts/hf.mjs`, `scripts/stills.mjs` | Shell-free entry points (sync then the pinned `hyperframes` CLI; contact sheets into `.stills/`). |

Rules learned the hard way:
- Composition scripts run inside a HyperFrames wrapper with a **scoped `window`/`document`**: the scene script must register its own timeline (`window.__timelines[id] = ...`); a file mounted several times finds its root with `document.querySelector('[data-composition-id="<file id>"]')`.
- `data-layer` is a reserved (deprecated) HyperFrames attribute: use `data-f1-layer`.
- Quotes inside inline styles break the attribute: always build styles with `F1.css({...})`.
- GSAP is loaded as `gsap@3.15.0` from jsDelivr: HyperFrames ships that exact version and serves it locally.
- Slow renders on WSL come from HyperFrames' **low-memory profile** (WSL had 7.7 GB < 8 GB threshold → screenshot capture). Try `--no-low-memory-mode` and `--workers 1`/`2`, or give WSL more RAM in `%UserProfile%\.wslconfig`. The Windows laptop may not hit this.

## Commands

```
npm run sync                 # regenerate root / captions / HUD / SFX timing from the voice data
npm run preview              # HyperFrames Studio
npm run lint                 # / npm run check (lint + runtime + layout)
npm run stills -- shared     # contact sheet -> .stills/shared/ (or: hook, liberty, ..., all, custom --at 1,2)
npm run render:v3            # full video -> out/f1-explosion-v3.mp4
npm run voice                # re-generate the voiceover (needs the venv), then npm run sync
```

## Set up the Windows laptop (PowerShell)

```powershell
winget install OpenJS.NodeJS.LTS      # Node 22 or newer (check: node -v)
winget install Gyan.FFmpeg            # then open a new terminal (check: ffmpeg -version)
winget install Python.Python.3.12

git clone https://github.com/nabhanibrhm/motion; cd motion   # or: git fetch; in the existing D:\Dev\motion
git switch hyperframes
npm install
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
npx hyperframes doctor                # FFmpeg, FFprobe, Chrome should pass (whisper/Kokoro/MusicGen are optional)
copy D:\Dev\motion\out\f1-explosion-v2.mp4 out\   # the v2 reference for the stills
npm run stills -- shared
```

If `D:\Dev\motion` is the existing clone with Remotion's `node_modules`, run `npm install` after switching branch.
