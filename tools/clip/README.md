# wizzclip

Turn a 16:9 stream VOD into vertical (1080x1920, 30 fps) YouTube Shorts clips for the Wizz Clip channel.

## Setup
```powershell
# uses the motion root .venv (faster-whisper + yt-dlp from requirements-lock.txt)
.venv\Scripts\python -m pip install -r requirements-lock.txt   # from the repo root
```
Needs `ffmpeg`/`ffprobe` on PATH (with libass). Whisper runs on CPU (int8, model `small`; change with `find --model`).
Run everything from the repo root as `.venv\Scripts\python tools/clip/wizzclip.py ...` (shortened to `python` below).

## 5-minute workflow
```powershell
# 0. one-time per streamer: grab a frame, measure the facecam rect (1920x1080 pixels), save a preset
python tools/clip/wizzclip.py fetch <url> --from 01:20:00 --to 01:50:00 --name zeus
python tools/clip/wizzclip.py frame zeus --at 60
python tools/clip/wizzclip.py streamer add zeus --facecam 0,0,480,270 --credit "@zeus"
# 1. rank candidate moments (writes .cache/clips/zeus/candidates.json)
python tools/clip/wizzclip.py find zeus --lang id --top 10
# 2. cut the one you like -> out/clips/zeus-01.mp4 (+ editable .cache/clips/zeus/clip-01.srt)
python tools/clip/wizzclip.py cut zeus --start 00:12:31 --end 00:13:05 --streamer zeus --title "POLISI KEJAR DIA!"
```
Layouts (`--layout`): `stack` (facecam top 38%, gameplay below; needs `--streamer`), `blur` (full 16:9 over a blurred copy), `full` (center crop 9:16).
Other options: `--mute 12-18.5,40-44` (seconds from clip start), `--srt file.srt`, `--out name`.
`find`/`cut` times accept seconds, `MM:SS` or `HH:MM:SS`. Keywords live in `config/keywords.json`.

## Notes
- Only clip creators whose campaign or permission allows it.
- Mute licensed in-game radio music with `--mute` (Content ID risk).
- To translate an English clip: edit `.cache/clips/<slug>/clip-NN.srt` (translate the text, keep the timings), then re-run `cut` with `--srt .cache/clips/<slug>/clip-NN.srt`.
- Captions: 3 words per line, current word yellow. Audio normalised to -14 LUFS / -1 dBTP (two-pass).
- Scratch goes to `.cache/clips/<slug>/`, finished clips to `out/clips/` (both git-ignored; `out/` syncs to Google Drive).
