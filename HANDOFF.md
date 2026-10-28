# Handoff — where things stand (28 Oct 2026)

Written on the WSL machine to continue on the Windows laptop. Branch: **`hyperframes`** (main still has the working Remotion version).
Read `ai-routing.md` before any change (it still describes Remotion; it gets rewritten at the end of the migration).

## Two open threads

### 1. Remotion → HyperFrames migration of the F1 video (paused, half done)

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

### 2. A brand-new video (not started)

Agreed so far: **new folder** (its own repo next to this one), **16:9 YouTube 1920×1080**, **reuse the F1 look and the mascots** (copy `lib/f1/` and `public/fonts`). Default sound unless told otherwise: MOG/WEC/BOG dialogue with edge-tts, captions with speaker tags, synthesized SFX, no music.
**Still needed from the user:** the topic (and what a viewer should remember) and the rough length. Then: three storylines in words for the user to pick, before building.

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
