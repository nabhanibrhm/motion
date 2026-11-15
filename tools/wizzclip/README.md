# wizzclip

Turn a 16:9 stream VOD into vertical (1080x1920, 30 fps) YouTube Shorts clips for the Wizz Clip channel.

## Setup
```powershell
# uses the motion root .venv (faster-whisper + yt-dlp from requirements-lock.txt)
.venv\Scripts\python -m pip install -r requirements-lock.txt   # from the repo root
```
Needs `ffmpeg`/`ffprobe` on PATH (with libass). Whisper runs on CPU (int8, model `small`; change with `find --model`).
Run everything from the repo root as `.venv\Scripts\python tools/wizzclip/wizzclip.py ...` (shortened to `python` below).

## 5-minute workflow
```powershell
# 0. one-time per streamer: grab a frame, measure the facecam rect (1920x1080 pixels), save a preset
python tools/wizzclip/wizzclip.py fetch <url> --from 01:20:00 --to 01:50:00 --name zeus
python tools/wizzclip/wizzclip.py frame zeus --at 60
python tools/wizzclip/wizzclip.py streamer add zeus --facecam 0,0,480,270 --credit "@zeus"
# 1. rank candidate moments (writes .cache/wizzclip/zeus/candidates.json)
python tools/wizzclip/wizzclip.py find zeus --lang id --top 10
# 2. cut the one you like -> out/wizzclip/zeus-01.mp4 (+ editable .cache/wizzclip/zeus/clip-01.srt)
python tools/wizzclip/wizzclip.py cut zeus --start 00:12:31 --end 00:13:05 --streamer zeus --title "POLISI KEJAR DIA!"
```
Layouts (`--layout`): `stack` (facecam top 38%, gameplay below; needs `--streamer`), `blur` (full 16:9 over a blurred copy), `full` (center crop 9:16).
Other options: `--mute 12-18.5,40-44` (seconds from clip start), `--srt file.srt`, `--out name`.
`find`/`cut` times accept seconds, `MM:SS` or `HH:MM:SS`. Keywords live in `config/keywords.json`.

## Notes
- Only clip creators whose campaign or permission allows it.
- Mute licensed in-game radio music with `--mute` (Content ID risk).
- To translate an English clip: edit `.cache/wizzclip/<slug>/clip-NN.srt` (translate the text, keep the timings), then re-run `cut` with `--srt .cache/wizzclip/<slug>/clip-NN.srt`.
- Look (Wizz Clip brand, `cut` only): font Audex Regular (`fonts/Audex-Regular.ttf`, OFL, one weight, no bold/italic; libass `fontsdir` points at `tools/wizzclip/fonts`, so no system install on Windows or WSL). Colours: Ink `#0E0F12` (hook box, credit pill), Graphite `#1A1C21`, Mist `#8C9099` (credit text), Paper `#F4F3EF` (captions, hook text), Volt `#E6FC29` (the one accent: current karaoke word, hook key word, short cut line under the hook). Captions are 3 words per line; the hook (first 3 s) is Paper text on an Ink rounded box, and `--title "KALAH *SEKALI* NGAMUK"` turns `*words*` Volt; "SUMBER: @credit" is Mist on an Ink pill at the bottom. No burned-in channel name or brand mark: upload `out/design/wizz-clip-watermark.png` as the YouTube video watermark instead. Audio normalised to -14 LUFS / -1 dBTP (two-pass).
- Scratch goes to `.cache/wizzclip/<slug>/`, finished clips to `out/wizzclip/` (both git-ignored; `out/` syncs to Google Drive).

## Campaign recipes
Paid clipping campaigns (MotionKlip) use tracked recipes instead of `cut`: `recipes/<name>.json` holds the source (slug + YouTube id/section), the ffmpeg filter graph with its timings, the `.ass` subtitle file and the output name. Their `.ass` files use the Wizz Clip brand look (Audex, Paper text with Ink outline, Paper-on-Ink title box, Volt as the one accent word), so they stay reproducible without any system font.
```powershell
python tools/wizzclip/wizzclip.py recipe                        # list recipes
python tools/wizzclip/wizzclip.py recipe kof-clip1-orochi-iori  # -> out/wizzclip/kof-clip1-orochi-iori.mp4
python tools/wizzclip/wizzclip.py recipe windah-streamchart-clip1 --out _test   # test render under another name
```
- Run from the repo root. Sources come from `.cache/wizzclip/<slug>/source.mp4`; if missing, the command prints the exact `fetch` call (kof-windah: full video `x2cS00dnpYc`; windah-streamchart: `iMqt1bgNrLk` section `00:30:40`-`00:32:20`, whose local time is absolute minus 1840 s).
- An existing output is never overwritten without `--force`.
- Fonts: a recipe's `fontsdir` (repo-relative) is passed to libass; the brand recipes use `tools/wizzclip/fonts` (Audex, committed). A recipe without `fontsdir` falls back to `.cache/wizzclip/_fonts/` (proprietary fonts such as Arial Black / Impact; never commit them), and the command stops with a clear error if a font listed in `fonts` is missing.
- **Caption rule (all Wizz Clip posts): at most 5 hashtags.** Campaign clips use exactly the campaign's required hashtags in its order (KOF 5, Streamchart 4); if a campaign ever requires more than 5, ask before posting.
- Campaign assets live in `campaigns/motionklip/` (watermark, Streamcharts images). `campaigns/motionklip/campaign.json` records the rules: CPM, minimum and maximum claimable views, required hashtags in exact order, and the rules for all campaigns (MotionKlip watermark on every upload, footage only from the brief, no AI auto-clippers, no paid views, keep videos up, claim once per video via the campaign's Google Form after the minimum views).
- Before the brand restyle (Arial Black / Impact look) the recipes reproduced the then-finished clips bit-for-bit in video (SSIM 1.0); the filter graph, timings and encode settings are unchanged, only the subtitle styling differs.
