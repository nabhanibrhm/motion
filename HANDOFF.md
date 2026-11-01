# Handoff: where things stand (1 Nov 2026)

The F1 video (Remotion and its HyperFrames port) was deleted on 31 Oct 2026; it survives only in git history before that date. Commit only when the user asks, and never add a Claude co-author line.

## Status at a glance

- **Episode 01 is done:** "Kenapa Harga Nasi Goreng Naik Terus?" in `out/Ekonomi_keuangan/inflasi/`. It's 9:16, 71.5 s, mastered to −14 LUFS, final file `renders/inflasi-short.mp4`, and `npm run lint` shows 0 errors.
- **Next episode: #1, "Rupiah Tembus Rp18.000: Siapa yang Untung?"** The backup is #3 (Paylater). #2 (IHSG/MSCI) and #8 (UMP 2027) have November deadlines. The details are in `out/Ekonomi_keuangan/PIPELINE.md`.
- **Before scripting,** recheck every figure against the official BPS, BI, OJK and PPATK releases, and put each one in the script's sources table.
- **Sending the render:** the send-file limit is 30 MB, so send a compressed copy (`ffmpeg -i renders/inflasi-short.mp4 -c:v libx264 -crf 24 -c:a copy <copy>.mp4`, written outside `renders/`).

**Known gaps in episode 01**
- **Length:** 71.5 s is over the 60 s Shorts limit.
- **Speaker changes:** no one is on screen for about 0.25 s at each change.
- **Leftover files:** `lib/f1/kasus.js` and `compositions/frame.html` are no longer used.
- **Routing doc:** `ai-routing.md` doesn't list `cine.js`, `rig.js` or `world.js` yet.
- **Open comment:** the cut-off hijab comment on the canvas's Karakter artboard is still open.

## Current work: Indonesian economics short, "Kenapa Harga Nasi Goreng Naik Terus?"

> **The project lives in `out/Ekonomi_keuangan/inflasi/` and is tracked in git.** `.gitignore` skips `out/*.mp4`, so large finished videos at the top of `out/` stay out of git (GitHub's limit is 100 MB per file). `.venv/`, `node_modules/`, `.stills/`, `.hyperframes/` and `voiceover/.cache/` are ignored at any depth and are rebuilt on each machine.

**What it is**
- A faceless channel in Bahasa Indonesia about economics and personal finance. The first video is about inflation, using storyline A, "Detektif Harga".
- A vertical 9:16 short (1080×1920) for TikTok, Shorts and Reels, 71.5 s long. The target is 55–60 s (the Shorts limit is 60 s).
- The scenes run hook → penjual → bahan → kita → dalang → pelajaran, ending on a black "KASUS DITUTUP" end card.
- The cast are people since 1 Nov 2026: **Muklis** (calm narrator, batik, glasses), **Nisa** (cheerful, hijab, phone) and **Beni** (ordinary guy who gets surprised easily, red kaos, sandal jepit). In the voice config they keep the speaker ids `mog`, `wec` and `bog`.
- The facts are sourced from BI and BPS, with the sources table in `script-short.md`:
  - 2025 inflation: 2,92%
  - volatile food: 6,21%
  - 1998 inflation: 77,63%
  - Rp100.000 → Rp74.400 after 10 years at 3%
- **Next episodes:** `out/Ekonomi_keuangan/PIPELINE.md` holds 10 researched working titles with status (next: the rupiah at Rp18.000).
- **The current render** `renders/inflasi-short.mp4` (71.5 s, −14 LUFS) uses the Supertonic-3 voices below.

**Voice: Supertonic-3 (since 31 Oct 2026, local, free, OpenRAIL-M allows commercial use)**
- `"source": "supertonic"` in `voiceover/inflasi.json`. `generate.py` synthesises every line on the CPU (`pip install supertonic`; the model, ~400 MB, downloads to `~/.cache/supertonic3` on first run) and times the words with faster-whisper, as in files mode.
- **Fixed voices per mascot (keep them across episodes):** MOG `M1` (speed 0.8), WEC `F2` (speed 0.9), BOG `M4` (speed 0.9). M2 and M3 were too heavy for MOG, and speeds of 0.85 and up too fast. Presets are F1–F5 and M1–M5; set them under each speaker's `supertonic` key.
- Chosen over TTSMaker, ElevenLabs (free plan bans commercial use), VoiceStudio's OmniVoice (non-commercial licence) and VoxCPM2 (needs a bigger GPU than the MX250).

**Fallback voice: TTSMaker (ttsmaker.com, free, allows commercial use)**
- `voiceover/generate.py` has a **files mode**. It reads one MP3 per line from `voiceover/lines/<section>-<n>.mp3` and levels the loudness. It then finds each word's timing with faster-whisper ("small", CPU, `language="id"`), matched to the script text.
- Measured against exact edge-tts timings: median error 46 ms, 90% of words within 115 ms. Spelled-out numbers are the weak spot: "dua puluh ribu" is heard as "20.000", so the later words of a number can be up to ~0.5 s off. The first word of each number is accurate.
- `voiceover/lines.md` is the recording checklist: 11 files, each with its speaker and exact text. `voiceover/generate.py voiceover/inflasi.json --list` regenerates it.

**Key files (in `out/Ekonomi_keuangan/inflasi/`)**

| Path | What it is |
|---|---|
| `script-short.md` / `script.md` | Short script with sources / longer first draft |
| `voiceover/inflasi.json` | Lines and speakers. `"source"`: `"supertonic"` (current), `"files"` (TTSMaker MP3s) or `"edge-tts"` |
| `voiceover/lines.md`, `voiceover/lines/` | Recording checklist and folder for files mode only (empty now) |
| `compositions/*.html` | One scene per section, plus `background.html` |
| `lib/f1/cine.js` | Cinematic kit (current look): camera with per-word `shots` (cuts and moves), vignette, cast per voice line, HUD card, chip, tags |
| `lib/f1/rig.js` | Puppet rig for Muklis, Nisa and Beni: lip-sync, blinks, head nods, hand gestures, startle on shocked poses |
| `lib/f1/world.js` | Living environment: walking extras (`W.row`, can freeze on a word), steam, dust |
| `public/cast/*.svg` | Static originals of Muklis, Nisa and Beni from the "Cinematic Design" canvas (the video draws them with `rig.js`) |
| `lib/f1/kasus.js`, `compositions/frame.html` | The previous doodle kit and stepper overlay; no longer used by the scenes (frame.html is not hosted) |
| `lib/f1/*` | Shared drawing kit (mascots, toon art, photo cards, timing) inherited from the F1 video. Stage size comes from `F1.STAGE` (vertical layout) |
| `scripts/sync.mjs` | Regenerates `index.html`, captions and the SFX timing from the voice data |
| `scripts/stills.mjs` | `node scripts/stills.mjs all\|<section>\|custom --at 1,2` → `.stills/` |

Design language (since 1 Nov 2026): cinematic, after hendi.insight's "Dajjal" TikToks, designed on the Claude Design canvas "Cinematic Design" (https://claude.ai/artifact/MgcwRMKQPMWSBqEEWH39Qu).
- **Scenes.** Full-bleed flat illustrations in a muted earthy palette (warung at night, market stalls, Lebaran crowd, dark spotlight, bedroom), a slow camera push-in, a vignette. The speaking character stands in front, cropped at the waist (feet off-screen, y ≈ 1200).
- **Captions.** Karaoke: up to 4 words (`MAX_WORDS` 4 in `timing.js`), Montserrat 900 caps 86 px with an 11 px black outline and a drop shadow, centred at y 960–1240. Upcoming words are grey, each turns white as it is spoken; the keyword (a number, else the last word) turns lime `#C6F432`.
- **Motion.** Inspired by cookie_spookiee's TikToks: the camera re-frames on key words every few seconds, extras walk, and the world reacts to the words (the street freezes on "Siapa", items hop as they are named, a sprout grows on "tumbuh"). Characters are puppets that talk, blink and gesture.
- **HUD.** A dark card top left (x 72, y 210) in JetBrains Mono: red-dot kicker, one big value, a small line. Black Oswald tags for prices and facts.
- **End.** Black end card with a red "KASUS DITUTUP" stamp from the word "ditutup".
- **Safe zones.** Keep the bottom ~15% and the right ~120 px free of text.

Previous design language (31 Oct 2026, now replaced): doodle look after @Ror_Fly's recipe explainer.
- **Pen and colour.** One near-black ink pen with a subtle 6 fps line boil (an SVG displacement filter, `K.pen`/`K.sk`); the mascots get an ink contour (`K.inked`). Warm paper `#fbf7f2`, pastel fills and one coral accent `#e2546b`. The tokens are `--doodle-*` in `lib/f1/f1.css`.
- **Type.** Luckiest Guy for outlined titles and numbers (ASCII only: no `×`, `≥`, `→` or `…`). Patrick Hand for hand-written labels. Nunito Sans for captions.
- **Layout.** A persistent `compositions/frame.html` holds the "KASUS NASI GORENG" title (y 140–290) and the suspect stepper PENJUAL BAHAN KITA DALANG VONIS (y 350–450). Below that, the evidence object sits at x 60–520 and the info card (`K.Card`: kicker, big number, label, note, progress bar) at x 540–960, both within y 480–1000. Captions sit at y 1040–1240 and the mascots' feet at y 1580.
- **Dark scene.** Only dalang goes dark; the frame and card invert there.
- **Safe zones.** Keep the bottom ~15% and the right ~120 px clear.

**Set up on the WSL laptop**
```bash
git switch hyperframes && git pull
cd out/Ekonomi_keuangan/inflasi
sudo apt install ffmpeg python3-venv
python3 -m venv .venv
.venv/bin/pip install edge-tts numpy faster-whisper supertonic==1.3.1
npm install
```
- The Whisper "small" model (~460 MB) downloads on the first run.
- If rendering complains about missing browser libraries, install the Chrome dependencies it names.

**Next steps**
1. Episode #1 (rupiah): recheck the figures, write `script-short.md` with its sources table, then set up a new project under `out/Ekonomi_keuangan/` by copying the inflasi kit. Keep the same Supertonic voices.
2. Episode 01 (optional): close the known gaps listed at the top, mainly trimming it under 60 s.
3. To rebuild and render any episode (shown for inflasi):
   ```bash
   .venv/bin/python voiceover/generate.py voiceover/inflasi.json
   node scripts/sync.mjs
   node scripts/stills.mjs all      # check .stills/ before rendering
   npm run render                   # -> renders/inflasi-short.mp4
   ```
4. To change a voice, edit its `supertonic` preset or `speed` in the voice config. For TTSMaker instead, record the lines in `voiceover/lines.md` into `voiceover/lines/` and set `"source": "files"`.
5. Listen for how "THR", "OJK" and "segitu-segitu" are pronounced. If they're wrong, respell them in the line text (e.g. "Te Ha Er", "O Je Ka"); note the captions use the same text, so a respelling shows on screen too. Then check the total length and the timing of SFX and captions.

Gotchas:
- In PowerShell, `npm run stills -- custom --at …` drops `--at`. Call `node scripts/stills.mjs` directly.
- faster-whisper's own audio reader (PyAV) broke on Windows, so `generate.py` decodes the audio with FFmpeg instead.
