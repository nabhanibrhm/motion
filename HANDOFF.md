# Handoff: where things stand (28 Oct 2026)

The F1 video (Remotion and its HyperFrames port) was deleted on 31 Oct 2026; it survives only in git history before that date. Commit only when the user asks, and never add a Claude co-author line.

## Current work: Indonesian economics short, "Kenapa Harga Nasi Goreng Naik Terus?"

> **The project lives in `out/Ekonomi_keuangan/inflasi/` and is tracked in git.** `.gitignore` skips `out/*.mp4`, so large finished videos at the top of `out/` stay out of git (GitHub's limit is 100 MB per file). `.venv/`, `node_modules/`, `.stills/`, `.hyperframes/` and `voiceover/.cache/` are ignored at any depth and are rebuilt on each machine.

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
| `lib/f1/*` | Shared drawing kit (mascots, toon art, photo cards, timing) inherited from the F1 video. Stage size comes from `F1.STAGE` (vertical layout) |
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
