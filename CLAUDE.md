# motion

Faceless short videos in Bahasa Indonesia, built with HyperFrames (HTML/GSAP rendered to video), Node 22. **Read `HANDOFF.md` first.**

**Before any change request, read `ai-routing.md`** and route to the model it names.

Each video is a self-contained project under `out/<topic>/<video>/` with its own `package.json`, `.venv` and `lib/f1/` drawing kit. The current one is `out/Ekonomi_keuangan/inflasi/`: a 9:16 short about inflation with the mascots MOG, WEC and BOG.

## Commands (run inside the video's folder)

- `.venv/bin/python voiceover/generate.py voiceover/inflasi.json` (Windows: `.venv\Scripts\python`): builds the voice. Set `"source": "files"` to use TTSMaker MP3s from `voiceover/lines/`
- `node scripts/sync.mjs`: re-times the scenes, captions and SFX from the voice data
- `npm run preview`: HyperFrames Studio
- `node scripts/stills.mjs all|<section>|custom --at 1,2`: still frames → `.stills/`
- `npm run lint` / `npm run check`
- `npm run render`: → `renders/inflasi-short.mp4`

Debug frames go to `.stills/` or `%TEMP%\motion-stills\`. `renders/` is for finished videos only.
