# Handoff: production status (4 Nov 2026, evening)

Commit only when requested. Before changes, read `ai-routing.md` and route by the current shared-module responsibilities there.

## Claude: start here

**The shared application is implemented, all seven original episodes are migrated, and episodes 08 (`ump`), 09 (`sadap`) and 10 (`ksp`) were produced on it end to end. Continue from it; do not repeat the migration or copy an old episode project.** The branch is `hyperframes` (refactor committed as `1f67202`, later work on top), pushed to `origin/hyperframes` up to this handoff. Preserve existing modified and untracked work.

**Changed this session (4 Nov 2026, WSL machine):**
- New channel line **HotWizz** (breaking news, category `Berita`, theme `config/themes/hotwizz.json`, single narrator Nisa / `wec`, Supertonic F2, speed 1, range 1.4). Case ids are `HOTWIZZ #NN`, not KASUS.
  - **#01 `sadap`** (ep 09): "Eks Kapolri Ditahan: Diduga Sadap Presiden", 130.0 s. Published; passed 40k views.
  - **#02 `ksp`** (ep 10): "Listyo Dicopot dari KSP: Sadapannya ke Mana?", 123.8 s, -14.0 LUFS / -1.0 dBTP. Facts rechecked about 15:00 WIB on 4 Nov. Published on 4 Nov.
  - Captions are in `out/<NN>-<id>-caption.txt` (git-ignored): sources by outlet and date, no URLs, photo credits, hashtags `#HotWizz #listyosigitprabowo #fyp #trending #polri`.
- **Neutrality rules for HotWizz** (see each `script-short.md`): every person is "tersangka" with praduga tak bersalah; equal card and photo treatment for both political sides; contested readings are attributed (e.g. Istana's "mengarah ke makar" beside Yusril's "pasal makar tidak digunakan"); a claim needs two outlets or it is dropped. Photos are Wikimedia Commons (public domain or CC BY-SA, credited); use a silhouette when none is found.
- **Voice pacing rule:** the user wants an even pace, above all in the hook. Supertonic rushes short chunks, so write narration with **no `[pause]` markers**, keep the hook as one chunk, use few commas (full stops and colons are fine). Measure syllables/sec per chunk after `voice` and re-punctuate outliers (ep 10 spread about 3.4%, ep 09 was 13.7%). Verify proper nouns with Whisper; add `say` entries (ep 10 uses `Letjen`→`let-jen`, `update`→`apdet`, `Nasution`→`nasutiyon`).
- **No baked music for HotWizz:** ep 10 sets `audio.bed: null`; the user adds a TikTok sound at upload. If they link a TikTok sound, check whether it is a "suara asli" with speech before using it.
- **Theme watermark:** `runtime.watermark` in a theme (src, opacity, width, pulse {period, scale, glow}) draws one big centred logo on every scene via `C.watermark` in `src/runtime/f1/cine.js` (lighten blend, sine pulse from the frame). Validated in `src/config/validate.mjs`; test in `tests/engine.test.mjs` (21/21 pass). HotWizz uses the text-only logo `assets/shared/brand/hotwizz-logo.svg`. It is theme-wide, so re-rendering ep 09 would now include it.
- `master.mjs` now converts voice and bed to stereo fltp before mixing the bed (since ep 09).
- On WSL, render with `node scripts/motion.mjs render <id> -- --no-low-memory-mode --workers 2` (screenshot capture is slow otherwise).

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
| Finished mastered videos | `out/<NN>-<id>-short.mp4` |

The active IDs are `inflasi`, `rupiah`, `ihsg`, `paylater`, `judol`, `emas`, `kelas`, `ump`, `sadap`, and `ksp`, each in an `episodes/<NN>_<id>/` folder (e.g. `episodes/01_inflasi/`); commands still take the bare id. Category is manifest metadata, not a parent directory. The old `out/Ekonomi_keuangan/` application sources and duplicate installations have been retired and the folder is gone: its four historical renders and `inflasi/debug.log` now live under `.cache/migration-baseline/legacy-out/Ekonomi_keuangan/`, and the ideas board moved to `content_idea/PIPELINE.md`.

Keep HyperFrames pinned to **0.8.210** and preserve the HTML/GSAP/F1 stack. Generated projects include local GSAP and referenced assets within the served root. Edit authored source and rebuild; do not patch generated HTML or staged assets. New episodes need configuration, narration, and unique artwork, without copied engines or separate dependency installations.

## Next actions for Claude

1. Run `git status --short` and read the current task before editing. The migration baseline's status snapshot is historical; do not reset or clean the current tree.
2. **HotWizz follow-ups:** if the Listyo case moves (motive, new suspects, Listyo's statement, charges changed), a #03 follows the same pattern: send the script first, recheck news just before building, rebuild facts table S1–Sn in `script-short.md`. Check `episodes/10_ksp/script-short.md` "Do not use" before reusing any claim.
3. **Known bug, music bed cutoff:** `assets/shared/music/bed.mp3` is 75.0 s and `masterVideo` does not loop it, so any bedded episode longer than 75 s loses music after 75 s (ep 03–08 run 94–102 s; ep 09 at 130 s). Fix by looping the bed input (e.g. `-stream_loop -1` before the bed `-i`) and re-check the 1.5 s fade-out. Not yet fixed.
4. **Next KASUS episode: idea #11 "Diskon 11.11"** (board brief in `content_idea/PIPELINE.md`; editorial window 2–10 Nov 2026, so it is time-critical). Would be KASUS #09 (episode number 11). Recheck sources S11/S12 at production time.
5. **UMP (08) fixes before publishing:** the board's audit asks to separate the regional minimum wage from an individual raise. The hook currently goes from "UMP naik 8%" to Nisa's "Gaji naik delapan persen…"; adjust the hook and add one line that UMP is a minimum, then regenerate voice and re-render. Also swap in October inflation (BPS release 2 Nov) or the official UMP 2027 figure if available; `episodes/08_ump/script-short.md` "Before rendering" lists every number to recompute.
6. **IHSG (03) before publishing:** MSCI's 15 Oct 2026 consultation (Emerging → Standalone, decision by end of June 2027) is a proposal, not a downgrade; update the script context (board idea 2).
7. Re-render the seven original episodes on this machine and compare scene boundaries, captions, SFX moments, duration, audio sync and loudness against the preserved baselines and existing outputs. Fresh-render fidelity of 01–07 is still unverified.
8. For new production work, use the root `new` command, then edit the manifest, narration, sources, and custom scenes. Never recreate per-episode dependencies, voice tools, or shared asset libraries.
9. Keep editorial approval for episodes 05–08 separate from technical approval. Preserve the review notes below.

Use the CLI's scoped dry run for routine cleanup. Never delete all of `.cache/`: it also contains imported speech and archived copies of retired untracked source.

## Finished episodes and outputs

Ten mastered outputs exist. 01–08 are in `out/` on the Windows machine (synced to Google Drive); this WSL checkout's `out/` holds only 09 and 10:

| File | Episode | Length |
|---|---|---:|
| `01-inflasi-short.mp4` | Kenapa Harga Nasi Goreng Naik Terus? | 71.5 s |
| `02-rupiah-short.mp4` | Rupiah Tembus Rp18.000 (KASUS #02) | 59.3 s |
| `03-ihsg-short.mp4` | IHSG Anjlok 10% Sehari: Apa Itu MSCI? (KASUS #03) | 97.2 s |
| `04-paylater-short.mp4` | Paylater: Gratis Bunga atau Jebakan? (KASUS #04) | 99.3 s |
| `05-judol-short.mp4` | Judol Lewat QRIS (KASUS #05) | 94.8 s |
| `06-emas-short.mp4` | Emas Katanya Aman, Kok Turun 20%? (KASUS #06) | 99.8 s |
| `07-kelas-short.mp4` | Kelas Menengah Hilang ke Mana? (KASUS #07) | 99.4 s |
| `08-ump-short.mp4` | Gaji Naik 8%, Kok Tetap Kurang? (KASUS #08) | 101.8 s |
| `09-sadap-short.mp4` | Eks Kapolri Ditahan: Diduga Sadap Presiden (HOTWIZZ #01) | 130.0 s |
| `10-ksp-short.mp4` | Listyo Dicopot dari KSP: Sadapannya ke Mana? (HOTWIZZ #02) | 123.8 s |

Episodes 03–08 were made 80–100 seconds long at the user's request (08 runs slightly over; cut one Muklis line if needed). 01–07 predate the refactor; on the previous host their re-render attempts failed at the loopback page, so those files are the original masters. 08 is the first fresh render from the shared pipeline: 1080×1920, 30 fps, -14.0 LUFS, -0.8 dBTP true peak (slightly over the -1 target after AAC encoding).

## Review and editorial notes

**Review of episodes 05–08 is still pending.**

- **UMP (08):** Nisa leads (about two thirds of the words, at the user's request); Muklis adds facts and the OJK-seminar quote; Beni asks. The 8% raise is a labelled simulation inside the union's 7,5–9,5% proposal; "≈ 4,7%" uses simple subtraction (exact 4,57%) and is labelled "perkiraan sederhana". Every on-screen figure has a source line. Scenes were written by seven Sonnet scene agents (one per scene, using the matching `07_kelas` scene as reference) and corrected over three rounds of stills; captions sit at roughly y 1480–1650, so keep scene art out of that band.

- **Judol:** no site, game, or app is named; the loss example is labeled “simulasi ilustrasi, asumsi RTP 90%”; Healing119, 119 ext. 8 stays on the end card; counters show “Rp-” until the number is spoken.
- **Emas:** the on-screen "2,5 TAHUN" matches the spoken line, but Aug 2020 to Mar 2023 is closer to &asymp;2.6 years. Offer to change the label to "2,5". No purchase-tax rate is stated because sources disagree.
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

Examples (the `new` command is illustrative; it would create `episodes/09_diskon/`):

```powershell
node scripts/motion.mjs new diskon --title "Judul video" --category Ekonomi_keuangan --number 9
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
