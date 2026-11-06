# Handoff: production status (6 Nov 2026)

Commit only when requested. Before changes, read `ai-routing.md` and route by the current shared-module responsibilities there.

## Claude: start here

**The shared application is implemented, all seven original episodes are migrated, and episodes 08 (`ump`), 09 (`sadap`) and 10 (`ksp`) were produced on it end to end. Continue from it; do not repeat the migration or copy an old episode project.** The branch is `hyperframes` (refactor committed as `1f67202`, later work on top), pushed to `origin/hyperframes` up to this handoff. Preserve existing modified and untracked work.

**Changed on 6 Nov 2026 (WSL machine, no code changes):**
- **06 `emas` was posted on the morning of 6 Nov**, a day earlier than planned; it had 19 views after 30 minutes. Pre-post check of the master: -14.0 LUFS, true peak -0.1 dBTP from one moment at about 0:22 (every other second is below -0.5 dB), and no clipping. The caption `out/caption/06-emas.txt` was posted unchanged; its figures match the rewritten narration. Ask for 24-hour analytics on 06 and 07 (average watch time, completion rate, For You share, first-3-second drop-off) before making the 60 fps KSP format standard.
- **Windows machine to do:** move `out/06-emas-short.mp4` to `out/uploaded/`. Google Drive's "Other computers" copy is a one-way backup, so it was not changed from this machine.
- This WSL `out/` now mirrors the Windows layout. 06, 08 and 11 and every caption were copied from `G:\Other computers\My Laptop\out` (reachable from WSL only through `powershell.exe`; G: is not mounted). 06, 09 and 10 are in `out/uploaded/`, 08 and 11 are in `out/`, and all captions are in `out/caption/` (HotWizz keeps the `<NN>-<id>-caption.txt` file name).
- **Cartesia:** the user plans to generate the voice with Cartesia, but no clips were found on Drive. They go into files mode: `episodes/<NN>_<id>/voice-lines/<section>-<i>.mp3|wav`, each clip reading its line exactly as written, with `narration.source: "files"`. Back up an existing master before re-rendering. 06 was posted with the Supertonic voice and is not re-voiced.
- This machine has no voice cache for `emas`; `sync emas` reports it missing. Re-rendering 06 here would synthesize new Supertonic takes.

**Changed on 5 Nov 2026 evening (Windows machine):**
- **06 `emas` rewritten in KSP pacing and rendered at 60 fps** (`out/06-emas-short.mp4` on this machine only: 1080×1920, 60 fps, 8,034 frames, 133.9 s, -14.0 LUFS, **-0.1 dBTP** — above the -1 target, listen for distortion). Ready for 7 Nov.
  - Hook is one Nisa line ("Emas yang katanya paling aman sudah turun hampir dua puluh persen dari rekor Januari… Masih yakin emas itu aman?"); Beni's hook line and cast entry were removed and the KASUS #06 stamp moved to "Masih". Every other line is 11–17+ words with no `[pause]`; line counts and scene cue words were kept, so all 101 anchors resolve. Facts unchanged; `script-short.md` matches.
  - "2,5 TAHUN" settled: spoken "lebih dari dua setengah tahun", label "> 2,5 TAHUN" (Aug 2020 → Mar 2023 ≈ 2.6 years).
  - DRIFT/SWEEP background motion in all 7 scenes (same helpers as 07); `video.fps: 60`; the bed loops to the end.
  - Prices are from 30 Oct; recheck the Antam price before posting if wanted.
- **New rules (user, 5 Nov):** (1) frame 0 must show the hook's claim/number — 07's opening still showed the old "GAJI NAIK" payslip; (2) every video ends with a **title-only cover card** over the last ~1 s (outro tail, after the final word) so it can be chosen in TikTok's "Select cover". 06's is the `cover` overlay in `episodes/06_emas/scenes/pelajaran.html` (KASUS stamp, title in Oswald 118 px, key number on a red chip, inside the centred 3:4 crop y 240–1680). Not yet a shared runtime helper.
- **07 `kelas` early numbers (5 Nov evening):** 939 views, about 489 of them TikTok "platform support" bonus views, 13 likes, 0 comments; not shadow-banned. Analytics (watch time, For You share) hadn't appeared yet. `07-kelas-short.mp4` is now in `out/uploaded/` on this machine.
- **VoiceStudio test (local app, OmniVoice backend at `%APPDATA%\OmniVoice`):** its Supertonic 3 engine can't clone (`supports_cloning = False`), so the "Test female" profile came out male; full OmniVoice needs ~6 GB VRAM and timed out on this laptop's 2 GB MX250. Use the OmniVoice GGUF engine or a stronger machine. The user then made one WAV per character; they were split by Whisper word timings into `episodes/06_emas/voice-lines/<section>-<i>.mp3` (16 files, committed). With `narration.source: "files"` they align (122.3 s, all cues resolve) but are faster/less even than Supertonic (6.5 vs 5.9 syl/s). **Known problems:** `pelajaran-0` (Muklis's last line) is cut off mid-"OJK" — needs a re-take; Whisper heard "emas" as "mas" three times in Muklis's file; Beni says "jawaban" not "jawabanmu". The committed narration stays `source: "supertonic"` (matches the rendered master); switch to `files` only to test the recordings, and render that test to a different filename first so the Supertonic master isn't overwritten.
- Cartesia (cloud TTS) was discussed as the hardware-free option; Indonesian support is unconfirmed, cloning likely needs the Pro plan, and the free tier is non-commercial.

**Changed on 5 Nov 2026 (WSL machine, no code changes):**
- **07 `kelas` was posted the morning of 5 Nov** and reached about 900 views within hours. The user hasn't yet checked how long viewers watch or whether views come from the For You page. Ask for both before 06 goes up, to judge whether the 60 fps KSP format should become standard.
- **06 Emas stays on 7 Nov** (advised not to post early while 07 is still climbing). Done the evening of 5 Nov: re-rendered with the KSP pacing, 60 fps, looping bed and the "> 2,5 TAHUN" label (see above). 06 exists only on the Windows machine's `out/`.
- **Listyo check (5 Nov): no hard development, no HOTWIZZ #03.** Since #02: Yusril said there was "keinginan melumpuhkan Presiden" (Kompas, 4 Nov 15:36). That is a minister's reading; police still haven't stated a motive, so "motif belum diungkap" holds if it's attributed to police. Liputan6 alone reports that politicians, journalists and businesspeople were also tapped, so leave it out until a second outlet confirms it. "SU" is a witness, not a suspect. Nothing yet from Listyo or a lawyer, no praperadilan filing, no new suspects.
- **Trending research (5 Nov) for the next KASUS (#10):** recommended **PPN 11% on sanitary pads** (viral since 25 Oct; DJP says it isn't a "menstruation tax"; the DPR and Komnas Perempuan are pushing for an exemption). Other candidates: Q3-2026 GDP (BPS, 5 Nov 11.00 WIB; consensus 5.20%), the rupiah strengthening to about Rp18.070. Rejected: the foaming-tea protest story (names a brand, BPOM results pending) and "Prabowo Tidak Sendiri" (one-sided politics).
- **Cartesia voice clone (exploring):** the user is setting up a voice clone on cartesia.ai (Models → Voices → Clone; whether clones speak Indonesian is unconfirmed). There's no integration yet; to try it, use files mode (`voice-lines/<section>-<i>.mp3|wav`, narration source `files`). A direct API provider would need a change in `tools/voice/generate.py`. The current TTS is Supertonic 1.3.1 (M1 Muklis, F2 Nisa, M4 Beni), with faster-whisper 1.2.1 for alignment.
- (Resolved 6 Nov: this WSL `out/` now has `out/uploaded/` holding 06, 09 and 10.)

**Changed on 4 Nov 2026 (WSL machine):**
- New channel line **HotWizz** (breaking news, category `Berita`, theme `config/themes/hotwizz.json`, single narrator Nisa / `wec`, Supertonic F2, speed 1, range 1.4). Case ids are `HOTWIZZ #NN`, not KASUS.
  - **#01 `sadap`** (ep 09): "Eks Kapolri Ditahan: Diduga Sadap Presiden", 130.0 s. Published; passed 40k views.
  - **#02 `ksp`** (ep 10): "Listyo Dicopot dari KSP: Sadapannya ke Mana?", 123.8 s, -14.0 LUFS / -1.0 dBTP. Facts rechecked about 15:00 WIB on 4 Nov. Published on 4 Nov.
  - Captions are in `out/caption/<NN>-<id>-caption.txt` (git-ignored): sources by outlet and date, no URLs, photo credits, hashtags `#HotWizz #listyosigitprabowo #fyp #trending #polri`.
- **Neutrality rules for HotWizz** (see each `script-short.md`): every person is "tersangka" with praduga tak bersalah; equal card and photo treatment for both political sides; contested readings are attributed (e.g. Istana's "mengarah ke makar" beside Yusril's "pasal makar tidak digunakan"); a claim needs two outlets or it is dropped. Photos are Wikimedia Commons (public domain or CC BY-SA, credited); use a silhouette when none is found.
- **Voice pacing rule:** the user wants an even pace, above all in the hook. Supertonic rushes short chunks, so write narration with **no `[pause]` markers**, keep the hook as one chunk, use few commas (full stops and colons are fine). Measure syllables/sec per chunk after `voice` and re-punctuate outliers (ep 10 spread about 3.4%, ep 09 was 13.7%). Verify proper nouns with Whisper; add `say` entries (ep 10 uses `Letjen`→`let-jen`, `update`→`apdet`, `Nasution`→`nasutiyon`).
- **No baked music for HotWizz:** ep 10 sets `audio.bed: null`; the user adds a TikTok sound at upload. If they link a TikTok sound, check whether it is a "suara asli" with speech before using it.
- **Theme watermark:** `runtime.watermark` in a theme (src, opacity, width, pulse {period, scale, glow}) draws one big centred logo on every scene via `C.watermark` in `src/runtime/f1/cine.js` (lighten blend, sine pulse from the frame). Validated in `src/config/validate.mjs`; test in `tests/engine.test.mjs` (21/21 pass). HotWizz uses the text-only logo `assets/shared/brand/hotwizz-logo.svg`. It is theme-wide, so re-rendering ep 09 would now include it.
- `master.mjs` now converts voice and bed to stereo fltp before mixing the bed (since ep 09).
- On WSL, render with `node scripts/motion.mjs render <id> -- --no-low-memory-mode --workers 2` (screenshot capture is slow otherwise).

**Changed on the Windows machine (2–4 Nov 2026):**
- **Episode 11 `diskon`** ("Diskon 11.11: Hemat atau Boros?", KASUS #09) is rendered: `out/11-diskon-short.mp4`, 84.2 s, -14.0 LUFS / -0.8 dBTP, lint 0 errors. Its caption is `out/caption/11-diskon.txt`. Publish before 11 Nov; the promo terms it cites run until 12 Nov. It was first numbered 09 and was renumbered to 11 to avoid colliding with `09_sadap`.
  - **Editorial rules:** no bank, marketplace, shop or brand appears on screen, and marketplaces read "e-commerce" everywhere. The cart is a labelled simulation. 11.11 is not Harbolnas (10–16 Dec 2026). The caption still names BRI as the source of the example promo terms; the user hasn't said whether to change it to "promo bank".
- **TikTok took down KASUS 05 (judol)** for a Community Guidelines violation. The automated appeal was rejected. Rule from now on: censor sensitive words in captions, hashtags and on-screen text (`j*dol`, `j*di`, `pinj*l`), and never open a video, cover or caption with a sales pitch for a harmful product. Do not re-upload 05; a reworked version can go up after the strike expires (around early Feb 2027).
- **Upload status and plan (user, 4 Nov; updated 5 Nov):** 01–04, 07 (posted the morning of 5 Nov), 09 and 10 are on TikTok (09 and 10 passed 100k views); 05 was removed. Plan: 06 Emas was posted on 6 Nov (moved up from 7 Nov), 9 Nov 11 Diskon (recheck its promo terms on 8–9 Nov). Hold 08 until it is fixed. HOTWIZZ #03 only on a hard development; the 4 Nov evening check found commentary only.
- **07 `kelas` rewritten in KSP pacing and re-rendered** (`out/07-kelas-short.mp4`, 117.6 s, -14.1 LUFS; the old master is at `.cache/backup/07-kelas-short.before-ksp-pacing.mp4`). The new hook is one Nisa chunk ("Sembilan setengah juta orang turun kelas…"). Beni's lines were lengthened, and Nisa's questions in `siapa` and `kalau` were folded into Muklis's lines; those two scenes' cast lists now have only Muklis, since a cast entry without a matching line blanks the scene. Per-line pace spread fell from 24.8% to 7.7%. Facts are unchanged. Still to check by ear: "informal" and "lalu terus" (Whisper misheard them) and the bed restart at 1:15. The hook art still shows the old payslip; a "9,5 JUTA TURUN KELAS" card was offered.
- **KSP pacing rule applies to KASUS too:** no line under about 12 words, the hook as one chunk, no `[pause]`, few commas, and measure per-line syllables/s after `voice`, aiming for a spread under 10%.
- **Music bed now loops:** `src/pipeline/master.mjs` adds `-stream_loop -1` before the bed input; `atrim` and the 1.5 s fade still cut it to the video length. A synthetic 110 s test kept the bed level at 40–100 s, and `npm test` passes 21/21. Every future bedded render loops; already-posted videos keep the cutoff until re-rendered.
- **07 `kelas` is now 60 fps with background motion** (`out/07-kelas-short.mp4`: 1080×1920, 60 fps, 7,055 frames, 117.6 s, -14.1 LUFS; the 30 fps KSP version is at `.cache/backup/07-kelas-short.30fps-ksp.mp4`). Every scene got two subtle, frame-driven background helpers, DRIFT (bokeh) and SWEEP (light band), at opacity 0.12–0.3, clear of the caption band. Ask the user whether the motion is visible enough on a phone.
- **60 fps is opt-in per episode** (`video.fps: 60`). `validate.mjs` accepts 30 or 60. `build.mjs` keeps all frame↔second maths at `F1.FPS` (30) and writes the episode fps only to the root `data-fps`. Scenes get a fractional `f`, so avoid `f % N` and unrounded `f` indexes. The 30 fps build of `rupiah` was byte-identical before and after the change, and `npm test` passes 22/22. 60 fps renders take about twice as long.
- **`out/` is split by upload status:** `out/` holds finished videos not posted yet (06, 08, 11), and `out/uploaded/` holds posted ones (01–05, 07, 09, 10). On the Windows machine, `07-kelas-short.mp4` still has to be moved to `out/uploaded/` after the 5 Nov post. Renders still write to `out/`; move a video after the user posts it.
- **`CLAUDE.md` rules added:** "commit it" means update HANDOFF.md, commit, then push. There is also a two-laptop rule: pull first, check the highest episode number, and on conflicts compare both versions and show the user before using the work laptop's push as the reference.
- **Fresh renders of 02–07 match the originals:** duration Δ 0.00 s, -14.1 LUFS both, mean SSIM ≥ 0.997, no second below 0.99, 0 ms audio offset. Results are in `out/compare/REPORT.md` with side-by-side frames. 01 was not re-rendered.
- **KASUS captions** for 01–08 are in `out/caption/NN-<id>.txt`: a `KASUS N - Judul` title, a hook line, the sources, the disclaimer and exactly five hashtags starting `#KasusKita #fyp`. HotWizz captions use the laptop's `out/<NN>-<id>-caption.txt` naming.
- **yt-dlp** is installed for the Windows user (Python 3.12, not in `.venv`); run it as `py -3.12 -m yt_dlp`. Use it to pull YouTube subtitles for research, and trace any figure back to its primary source.
- **YouTube plans (not implemented):** [docs/youtube-longform-design.md](docs/youtube-longform-design.md) adds a 16:9 format; [docs/youtube-compilation-design.md](docs/youtube-compilation-design.md) plans one video combining the eight KASUS shorts, inspired by a format study of two reference videos. Both need user decisions first.

**Changed earlier (1 Nov 2026, Windows machine):**

**Changed this session (1 Nov 2026):**
- Episode folders are `episodes/<NN>_<id>/` (e.g. `01_inflasi`). The loader checks the prefix against the manifest `number`; commands, caches and outputs still use the bare id. `new` creates prefixed folders. Voice caches are path-independent and stayed valid.
- Finished videos go straight into `out/` (no `result/` subfolder). Mastering now stages its temp file beside the raw render in `.cache/build/<id>/`, so `out/` only ever holds finished files.
- `out/` is synced by **Google Drive for Desktop** (Computers › My Computer › out). Every render uploads automatically; don't put scratch files in `out/`.
- The ideas board is `content_idea/PIPELINE.md` (now in Bahasa Indonesia, with a fact audit of ideas 1–10 and four new ideas #11–14).
- **Browser rendering works on this machine.** `stills` and a full mastered `render` succeeded for `ump`; the earlier loopback denial was an environment limit of the previous host.

Read [CLAUDE.md](CLAUDE.md), the **Claude** routing section of [ai-routing.md](ai-routing.md), and [docs/refactor-report.md](docs/refactor-report.md) before continuing. The report records actual delegated work, verification, and limitations. [docs/refactor-design.md](docs/refactor-design.md) describes shared interfaces; [README.md](README.md) is the operating guide. Codex model names and switching instructions do not apply to Claude.

| Responsibility | Authoritative location |
|---|---|
| CLI and dependencies | `scripts/motion.mjs`, root `package.json` / `package-lock.json`, root `.venv`, `requirements-lock.txt` |
| Episode metadata, narration, citations, unique artwork | `episodes/<NN>_<id>/episode.json`, `narration.json`, `script-short.md`, `scenes/`, optional `assets/` |
| Configuration and speaker defaults | `src/config/`, `config/defaults.json`, `config/speakers.json`, optional `config/themes/` |
| Shared F1 drawing/timing and scene templates | `src/runtime/`, `src/templates/` |
| Build, voice/cache, storage, mastering | `src/pipeline/`, `tools/voice/` |
| Shared fonts, sound, cast, music | `assets/shared/` |
| Disposable served projects and snapshots | `.cache/build/<id>/`, `.cache/stills/<id>/` |
| Preserved speech and migration recovery | `.cache/voice/`, `.cache/migration-baseline/` |
| Finished mastered videos | `out/<NN>-<id>-short.mp4` (not uploaded yet), `out/uploaded/` (posted) |

The active IDs are `inflasi`, `rupiah`, `ihsg`, `paylater`, `judol`, `emas`, `kelas`, `ump`, `sadap`, `ksp`, and `diskon`, each in an `episodes/<NN>_<id>/` folder (e.g. `episodes/01_inflasi/`); commands still take the bare id. Category is manifest metadata, not a parent directory. The old `out/Ekonomi_keuangan/` application sources and duplicate installations have been retired and the folder is gone: its four historical renders and `inflasi/debug.log` now live under `.cache/migration-baseline/legacy-out/Ekonomi_keuangan/`, and the ideas board moved to `content_idea/PIPELINE.md`.

Keep HyperFrames pinned to **0.8.210** and preserve the HTML/GSAP/F1 stack. Generated projects include local GSAP and referenced assets within the served root. Edit authored source and rebuild; do not patch generated HTML or staged assets. New episodes need configuration, narration, and unique artwork, without copied engines or separate dependency installations.

## Next actions for Claude

1. Run `git status --short` and read the current task before editing. The migration baseline's status snapshot is historical; do not reset or clean the current tree.
2. **HotWizz follow-ups:** if the Listyo case moves (motive, new suspects, Listyo's statement, charges changed), a #03 follows the same pattern: send the script first, recheck news just before building, rebuild facts table S1–Sn in `script-short.md`. Check `episodes/10_ksp/script-short.md` "Do not use" before reusing any claim.
3. **Music bed cutoff: fixed in `master.mjs` (4 Nov).** Existing masters made before the fix still lose music after 75 s: 03–06, 08, 09 and 11. Re-render a video only when the user asks; listen for an audible restart at the loop point (75 s) and add a crossfade if needed.
4. **Episode 11 `diskon` (KASUS #09) is done** (see above). If the user changes anything, rebuild from `episodes/11_diskon/`. It was rendered before the bed-loop fix, so its music stops at 75 s; re-render it before 9 Nov if the user wants music to the end.
5. **UMP (08) fixes before publishing:** the board's audit asks to separate the regional minimum wage from an individual raise. The hook currently goes from "UMP naik 8%" to Nisa's "Gaji naik delapan persen…"; adjust the hook and add one line that UMP is a minimum, then regenerate voice and re-render. Also swap in October inflation (BPS release 2 Nov) or the official UMP 2027 figure if available; `episodes/08_ump/script-short.md` "Before rendering" lists every number to recompute.
6. **IHSG (03) is already on TikTok:** MSCI's 15 Oct 2026 consultation (Emerging → Standalone, decision by end of June 2027) is a proposal, not a downgrade; update the script context (board idea 2).
7. Fresh-render fidelity of 02–07 is verified (see above). Only 01 (inflasi, `legacy-inflasi` profile) remains to re-render and compare the same way. Back up `out/01-inflasi-short.mp4` first, because `render` overwrites it.
8. **YouTube:** once the user settles the open decisions in the two YouTube design docs, start Phase 1 (format contract) as routed there.
9. For new production work, use the root `new` command, then edit the manifest, narration, sources, and custom scenes. Never recreate per-episode dependencies, voice tools, or shared asset libraries.
10. Keep editorial approval for episodes 05–11 separate from technical approval. Preserve the review notes below.

Use the CLI's scoped dry run for routine cleanup. Never delete all of `.cache/`: it also contains imported speech and archived copies of retired untracked source.

## Finished episodes and outputs

Eleven mastered outputs exist, all on the Windows machine (synced to Google Drive). Unposted: 08 and 11 in `out/`. Posted: the rest, in `out/uploaded/` (05 was removed by TikTok). This WSL checkout has 08 and 11 in `out/` and 06, 09 and 10 in `out/uploaded/`:

| File | Episode | Length |
|---|---|---:|
| `01-inflasi-short.mp4` | Kenapa Harga Nasi Goreng Naik Terus? | 71.5 s |
| `02-rupiah-short.mp4` | Rupiah Tembus Rp18.000 (KASUS #02) | 59.3 s |
| `03-ihsg-short.mp4` | IHSG Anjlok 10% Sehari: Apa Itu MSCI? (KASUS #03) | 97.2 s |
| `04-paylater-short.mp4` | Paylater: Gratis Bunga atau Jebakan? (KASUS #04) | 99.3 s |
| `05-judol-short.mp4` | Judol Lewat QRIS (KASUS #05) | 94.8 s |
| `06-emas-short.mp4` | Emas Katanya Aman, Kok Turun 20%? (KASUS #06), 60 fps KSP pacing (5 Nov) | 133.9 s |
| `07-kelas-short.mp4` | Kelas Menengah Hilang ke Mana? (KASUS #07) | 99.4 s |
| `08-ump-short.mp4` | Gaji Naik 8%, Kok Tetap Kurang? (KASUS #08) | 101.8 s |
| `09-sadap-short.mp4` | Eks Kapolri Ditahan: Diduga Sadap Presiden (HOTWIZZ #01) | 130.0 s |
| `10-ksp-short.mp4` | Listyo Dicopot dari KSP: Sadapannya ke Mana? (HOTWIZZ #02) | 123.8 s |
| `11-diskon-short.mp4` | Diskon 11.11: Hemat atau Boros? (KASUS #09), Windows machine only | 84.2 s |

Episodes 03–08 were made 80–100 seconds long at the user's request (08 runs slightly over; cut one Muklis line if needed). 01–07 predate the refactor; on the previous host their re-render attempts failed at the loopback page, so those files are the original masters. 08 is the first fresh render from the shared pipeline: 1080×1920, 30 fps, -14.0 LUFS, -0.8 dBTP true peak (slightly over the -1 target after AAC encoding).

## Review and editorial notes

**Review of episodes 05–08 is still pending.**

- **UMP (08):** Nisa leads (about two thirds of the words, at the user's request); Muklis adds facts and the OJK-seminar quote; Beni asks. The 8% raise is a labelled simulation inside the union's 7,5–9,5% proposal; "≈ 4,7%" uses simple subtraction (exact 4,57%) and is labelled "perkiraan sederhana". Every on-screen figure has a source line. Scenes were written by seven Sonnet scene agents (one per scene, using the matching `07_kelas` scene as reference) and corrected over three rounds of stills; captions sit at roughly y 1480–1650, so keep scene art out of that band.

- **Judol:** no site, game, or app is named; the loss example is labeled “simulasi ilustrasi, asumsi RTP 90%”; Healing119, 119 ext. 8 stays on the end card; counters show “Rp-” until the number is spoken.
- **Emas:** settled 5 Nov: spoken "lebih dari dua setengah tahun", label "> 2,5 TAHUN". No purchase-tax rate is stated because sources disagree.
- **Kelas:** 2025 figures are labeled “data BPS, diolah Mandiri Institute”; the savings scene shows both the falling average balance and LPS's counterpoint that totals still grow.

Before publishing, include the full sources list from each episode's `script-short.md` in its description. The IHSG episode should be published before the MSCI review on 11 Nov 2026.

## Current architecture and commands

There is one root Node installation, one root Python environment, and one shared runtime. Episode authoring is in `episodes/<NN>_<id>/`; manifests live in `episode.json`; narration is `narration.json`; scene files are under `scenes/`. `src/config/` loads and validates episode manifests, `src/runtime/` holds the shared drawing and timing code, `src/templates/` provides shared templates, and `src/pipeline/` builds, stages assets, prepares voice, and masters output. The `scripts/motion.mjs` CLI is the entry point. See `docs/refactor-design.md` for contracts.

From the repository root, the workflow is:

1. `node scripts/motion.mjs validate <id>`
2. `node scripts/motion.mjs voice <id>` to generate or reuse voice when needed (`--force` explicitly regenerates)
3. `node scripts/motion.mjs sync <id>` (requires a valid voice cache; never synthesizes)
4. `node scripts/motion.mjs preview <id>`, `lint <id>`, and `stills <id> all` for review
5. `node scripts/motion.mjs render <id>` for a fresh mastered output at `out/<NN>-<id>-short.mp4`

`voice` prepares or reuses speech; title-only or unrelated visual changes do not require regeneration. `render` ensures missing or stale voice is generated/reused automatically before building. `sync`, `preview`, `stills`, `lint`, and `check` require a valid voice cache and never synthesize. For files mode, episode recordings go under `episodes/<NN>_<id>/voice-lines/`. Use the root CLI and environments; retirement of the old per-episode applications is complete.

Examples (the `new` command is illustrative; it would create `episodes/12_contoh/`):

```powershell
node scripts/motion.mjs new contoh --title "Judul video" --category Ekonomi_keuangan --number 12
node scripts/motion.mjs validate --all
node scripts/motion.mjs preview inflasi
node scripts/motion.mjs stills inflasi --at 1,10,30
node scripts/motion.mjs check inflasi
node scripts/motion.mjs render --all
node scripts/motion.mjs clean inflasi --dry-run
```

Episode manifests currently validate a fixed 1080×1920, 30 fps format and runtime profile `modern` or `legacy-inflasi`. Category is descriptive and does not filter the episode list. A named theme file under `config/themes/` can set supported runtime/case/audio/voice defaults; arbitrary palettes are not configurable. Output names derive from episode number and id. `out/` contains finished mastered videos only; diagnostics go to `.cache/stills/<id>/`.

## Compatibility rules future changes must preserve

- Inflasi retains `legacy-inflasi` cinematic behavior and four-word original captions. Other episodes retain six-word dark-box captions and modern cinematic behavior. Case numbers and progress counts come from configuration, not episode-name branches in shared code.
- Preserve original narration, `say` pronunciation replacements, speaker speed/pitch range, pauses, holds, section tails, word anchors, lip-sync, camera cues, and SFX timing. Captions display original text, not `say`. Speaker IDs `mog` / `wec` / `bog` remain compatible with Muklis / Nisa / Beni.
- Explicit authored speaker definitions are authoritative, including omitted optional fields. Do not inject modern pitch-range defaults into inflasi. Narration section order must agree with scene order.
- Inflasi's original mastering has no music bed. Later episodes retain their configured bed and processing. Mastering uses two-pass -14 LUFS / -1 dBTP processing on a fresh raw render, then publishes atomically. Do not master an already-mastered output again.
- Timing evaluation uses a fresh context per episode. Keep state isolated and animations deterministic from the timeline/frame; avoid wall-clock timers, CSS animations, and unseeded randomness.
- Declare dynamically referenced assets in the manifest's `assets` list; literal references are discovered during staging. Custom HTML/JS scenes preserve distinctive artwork; the shared `title-card` template supports new scenes without engine edits.
- Respect dependency-aware voice/alignment keys, atomic writes, and episode locks. Serialize expensive generation/rendering unless resources justify concurrency. Cleanup preserves voice caches and final videos; `--target voice` is rejected.

## Setup and environment verification

On a fresh checkout, install once at the repository root. FFmpeg and ffprobe must also be available on `PATH` for audio decoding, mastering, and media inspection.

```powershell
npm ci
py -3.12 -m venv .venv
.venv\Scripts\python -m pip install -r requirements-lock.txt
```

A fresh `npm ci` was attempted but could not complete offline in this environment. The exact already-installed root Node dependencies were reused. Python 3.12 `pip check` passed. The first voice run may need to download Supertonic/Whisper model data.

## Verification limits

**Passed:** clean builds followed by sync succeeded for all seven episodes; all seven HyperFrames lint checks passed with zero errors. Final source verification covered 7 episodes, 119 outputs, and 361 asset maps. Twenty integrated tests passed (21 since the watermark test, 4 Nov) (4 retirement, 6 engine, 6 migration, 4 voice). Legacy retirement is complete; see `docs/refactor-retirement.json` for its measured scope.

**Update (1 Nov 2026, this machine):** `stills` and a full mastered `render` work here; episode 08 was rendered successfully. Lint for 08 reports 0 errors (one caption-density warning, same as the others). The blocked result below applies to the previous host and to the seven original episodes, which have not yet been re-rendered.

**Blocked (previous host):** all seven raw render attempts failed with status 1 at the denied local HyperFrames loopback page (`net::ERR_NETWORK_ACCESS_DENIED`). No fresh full videos were produced, and SHA-256 checks confirmed the seven existing mastered outputs were unchanged. These are not render/fidelity passes. The independent master smoke check ran two synthetic 8-second audio trials to the -14 LUFS target and confirmed a copied video stream was unchanged; this does not establish full episode output equivalence.

The migration archive contains 583 entries, passed CRC validation, and is 35,912,040 bytes. Legacy retirement removed 106 paths containing 73,875 files (3,359,383,760 gross payload bytes). Seven interpreter stubs (224 files, 21,264,875 bytes total) are preserved under `.cache/migration-baseline/environments/<episode>/`; the 721 imported voice files, four old renders, `inflasi/debug.log`, archive, and seven final output videos remain preserved. Gross payload size is not a net free-space measurement.

The reconciled baseline inventory is in `docs/refactor-inventory.json`; its preserved raw broad audit is `.cache/migration-baseline/inventory-full.json`. Comparable logical production workspace bytes fell from 3.87 GB to 1.33 GB, a net reduction of 2.54 GB (about 2.37 GiB); exact measurement scope and byte counts are in `docs/refactor-disk-usage.json`. Baseline snapshots and recovery material are in `.cache/migration-baseline/`. Legacy app engines and duplicate dependencies have been retired after verification. Keep the source archive, imported speech caches, environment stubs, four old episode renders, and `inflasi/debug.log`; the coordinator preserved these for recovery. Existing modified and untracked working-tree files are intentional work and must not be reset or removed.

## Migration recovery and regression checks

Original source is archived in `.cache/migration-baseline/legacy-source.zip`, with hashes in `source-hashes.json`. Baseline drawing data, video metadata, and captured frames live beside it. Recover into a separate directory and inspect before restoring files over current authored content. Restoring interpreter stubs alone does not reconstruct removed dependencies.

`node scripts/migrate-episodes.mjs --verify` checks the migration receipt/archive after retirement; normal migration requires original sources to be restored first. `node scripts/verify-migration.mjs` compared shared behavior with captured baselines, but it reads the retired `out/Ekonomi_keuangan/` sources and bare `episodes/<id>/` folders, so it no longer runs as-is; treat its recorded results in `docs/` as the evidence. Do not rerun one-time retirement or overwrite baselines during routine authoring. Use `npm test` for the integrated regression suite.

Procedural comparisons matched 4,155 HTML/SVG frame samples across all 46 scenes; independent review also matched 2,932 caption GSAP operations and caption markup/styles. Original section audio and imported legacy cache files were hash-checked. These checks establish source/timeline preservation, not pixel equivalence from fresh browser renders. See `docs/refactor-fidelity.json`, `docs/refactor-architecture-review.md`, and `docs/refactor-safety-review.md` for evidence.

Fresh online installation and Linux/WSL execution have not been verified. Browser loopback denial and the HyperFrames history-write permission error remain environment limitations; do not upgrade the stack or claim successful full renders to bypass that evidence. Ignoring generated files does not untrack files already in Git.

## Earlier production notes retained

- The previous handoff recorded no commit since `43d6376`; its detailed captured working-tree state is preserved in `.cache/migration-baseline/git-status.txt`. That snapshot predates the shared-pipeline refactor and is not a statement of the current tree.
- The earlier question about whether to ignore `out/` is resolved in the current root `.gitignore`. The four legacy per-episode renders remain preserved after retirement.
- The prior `PIPELINE.md` (now `content_idea/PIPELINE.md`) status said cases #2–#6 were still marked “in production” pending approval to change their board state. That editorial update remains a separate user-review decision.
- An audio pass was proposed but not started: Openverse was available for episode-specific SFX and licensed music; the “Real SFX Claude Skill” was not found; the installed Earshot plugin was for Claude Code event sounds rather than video sound effects. If that work resumes, confirm the intended SFX tool before proceeding.
- Remaining ideas on the board: #7 PHK/dana darurat, #9 cabai, #10 BI Rate, and the new #11 Diskon 11.11, #12 biaya QRIS, #13 penyamaran identitas, #14 rumah subsidi. The board's recommended order is 11 → 12 → 13 → 14. The next KASUS case number is #09; the next HotWizz is #03.
- TikTok/Shorts covers: none are made yet. A cover frame can be exported with `stills <id> --at <s>`; a dedicated 1080×1920 cover per episode (title centred for the 3:4 profile crop) was offered but not requested.
