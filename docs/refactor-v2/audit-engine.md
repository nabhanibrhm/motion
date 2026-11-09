# Engine / infrastructure audit — motion (branch `hyperframes`, WSL)

Read-only audit, 9 Nov 2026. No repo file was edited. Line numbers are as of HEAD `96c7fa8` plus the user's uncommitted HANDOFF/tools/clip changes, which are out of scope.

Key: Impact / Effort / Risk = H, M or L. "Benefit" is the concrete gain.

## 0. Commands actually run

| Command | Result |
|---|---|
| `npm test` | **29/29 pass**, 0 fail, 0 skipped, about 0.6 s (`tests 29 … pass 29 … duration_ms 593`) |
| `node scripts/motion.mjs validate --all` | All 14 valid: inflasi 6, rupiah 6, ihsg 6, paylater 7, judol 7, emas 7, kelas 7, ump 7, sadap 7, ksp 6, diskon 7, hapus 6, krl 7, kerja 8 scenes (0.14 s) |
| `node scripts/motion.mjs sync --all --check` (read-only) | `motion: Voice cache missing or stale for inflasi; run the explicit voice command.` It **stops at the first episode**. |
| `sync hapus/ksp/sadap --check` | All three: `Voice cache missing or stale`. Diagnosis in F1. |
| `git ls-files \| grep pycache` | Nothing. `tools/voice/__pycache__` is **not tracked** (`.gitignore` has `__pycache__/`). |

Nothing was synthesised, rendered or captured.

## 1. Areas that are already sound: do NOT change

- **One shared app, VM-isolated timing** (`src/runtime/timing.mjs:12-17`). A fresh `node:vm` context runs for each episode, with the same timing code in Node and in the browser. This is correct and cheap.
- **Build diffing and atomic writes** (`src/pipeline/build.mjs:84-103`). It keeps a desired-file map and compares content before writing, uses tmp+rename, and keeps a managed-file manifest for deletions. Check mode writes nothing.
- **Asset staging** (`src/pipeline/storage.mjs:125-197`). It hardlinks with a copy fallback, never truncates a linked inode, does a whole-`public/` swap with a backup, and rejects symlinks.
- **Cleanup safety** (`storage.mjs:198-222`). It only deletes exact paths `.cache/build/<id>` and `.cache/stills/<id>`, checks those paths are equal (not just prefixes), rejects symlink ancestors, refuses `--target voice` and is a dry run by default. Nothing can reach `out/`, `out/uploaded/` or `.cache/migration-baseline/`. **`out/uploaded/` cannot be overwritten**: `resultFile` is always `out/<NN>-<id>-short.mp4` (`src/config/episodes.mjs:73`), and no code path writes under `out/uploaded` (grep confirms).
- **Mastering publish** (`src/pipeline/master.mjs:129-147`). Input and output must differ, it does a two-pass loudnorm and stages to a tmp file before rename, and a failure leaves the old output.
- **Cartesia billing cache** (`tools/voice/cartesia.py:182-274`). It keys each line, keeps a committed `cartesia.json` sidecar so the other laptop reuses clips, and refuses to overwrite hand-edited clips. Well designed.
- **CLI size.** `scripts/motion.mjs` is 203 lines and not a monolith. Its argument validation (`:20-60`) is strict and tested. Do not split it into a framework; only move the scaffold data out (F7).
- **`legacy-inflasi` profile.** Only episode 01 uses it, but it costs about 10 branches. Keep it, because removing it changes a posted video.
- **Determinism of the runtime.** There is no `Math.random`, `Date`, timers or CSS animation in `src/runtime`, `src/templates` or any `episodes/*/scenes` (grep). `world.js` uses a seeded hash, and `bed.py` is seeded (`rng = default_rng(7)`).

## 2. Findings (priority order for scaling to 500+ episodes)

### F1. The voice cache key is too broad: unrelated edits mark every episode stale. Impact H, Effort S, Risk M (voice tier)

The evidence is on this laptop: every existing cache (hapus, ksp, sadap) is stale, and none of their voice inputs changed.
- `src/pipeline/voice.mjs:56` puts the **whole-file hash** of `requirements-lock.txt` in the fingerprint. Commit `feb5e26` added `yt-dlp==2026.10.26` for `tools/clip` (not voice), and that invalidated every episode (`deps false` for all three).
- `voice.mjs:56` also hashes `narration` through `effectiveNarration`, which includes **speakers merged from `config/speakers.json` that the episode never uses** (`src/config/episodes.mjs:21-25` fills in missing speakers). ksp and sadap use only `wec`, but their digest includes `mog` and `bog`. Commit `e4d63d7` added Cartesia voice ids for mog/bog, and that invalidated them. I confirmed this by recomputing with the pre-`e4d63d7` config: the digest matches the stored state (`old-config narration match true, current match false`).
- `voice.mjs:54` hashes the whole of `cartesia.py`, so a change to a helper such as `voices` or `samples` invalidates all Cartesia episodes. `voice.mjs:56` hashes the whole of `generate.py`.
- In Python, `GENERATOR_HASH` (the whole `generate.py` file) is part of the Whisper alignment key (`tools/voice/generate.py:135`) and the pitch key (`:232`). Even a comment edit forces Whisper to re-align every line of every episode on the next `voice`.
- Consequence: `sync`, `preview`, `stills` and `lint` refuse stale caches (`voice.mjs:66-67`). So any dependency or tool edit makes every old episode un-previewable until it is re-voiced. At 500 episodes this is hours of Whisper CPU, and with Supertonic it can mean new audio (F5).
- **Fix:**
  - Hash only the speakers that lines actually use, and drop provider sub-blocks that are not relevant to the source.
  - Replace the whole-file hashes with explicit `ALIGN_VERSION`, `PITCH_VERSION` and `ASSEMBLY_VERSION` constants, or with hashes of the output-affecting functions only.
  - Hash the installed versions of the voice-relevant packages only (supertonic, faster-whisper, ctranslate2, praat-parselmouth, numpy, onnxruntime), not the lock file.
  - Bump the fingerprint `version` to 4 once. Chunk caches and Cartesia sidecars make the single re-voice cheap and free of API cost.
  - Also put `tools/clip`-only dependencies in a separate requirements file.
- **Sequencing:** do this **before** any other edit to `generate.py`, such as removing dead code (F9). Otherwise each edit triggers its own mass invalidation.

### F2. Locks and temp dirs are left behind by Ctrl+C or crashes. Impact M, Effort S, Risk L

- `src/pipeline/lock.mjs:115-124` and `voice.mjs:72-74` release locks only in `finally`. Node's default SIGINT handler exits without running `finally`, so interrupting a multi-minute render or voice run leaves `.cache/locks/<id>` and/or `.cache/voice/<id>.lock`. The next command then fails with "busy … inspect and remove". `owner.json` records the pid (`lock.mjs:121`), but nothing checks whether that pid is still alive.
- Evidence of leftovers: an orphan `.cache/voice/sadap-tmp-WS8btc/` (4 Nov, contains `effective-narration.json`) and an orphan `.cache/build/sadap/render-31a6d2d7-….raw.mp4` (38 MB).
- `clean` never lists `.cache/voice/<id>-tmp-*` or `-previous-*` leftovers.
- **Fix:**
  - Add SIGINT/SIGTERM handlers that release the held locks.
  - Treat a lock as stale when `owner.json`'s pid is not alive. `.cache` is per machine, so a pid check is valid.
  - Have `clean` report `<id>-tmp-*` voice temp dirs. They are never valid caches.

### F3. Preview holds the episode lock for its whole session (verify). Impact M, Effort S, Risk L

`motion.mjs:197` runs `hyperframes preview` with a blocking `spawnSync` inside `withEpisodeLock` (`:200`). While Studio runs in the foreground, `sync <id>` in another terminal fails with "busy", and so does `sync --check` (`build.mjs:24`). That blocks the main authoring loop: edit scene, sync, see it in Studio. Fix: release the lock after the build and before launching preview. Preview only reads `.cache/build/<id>`, and a concurrent sync swaps files atomically. Confirm by running preview in the foreground and then `sync`.

### F4. Scene helpers are copy-pasted across episodes, and the templates have no production use. Impact H at scale, Effort S–M, Risk L if applied to new episodes only

- 121 authored scene HTML files make up 934 KB (about 7.7 KB per scene). **All 95 manifest scenes use `file`. No episode uses `title-card` or any `hw-*` template** (manifest survey). The data-driven path built on 7 Nov has no production use yet.
- `DRIFT`, `SWEEP` and `BG` are each defined in 35 scenes across 06, 07, 12, 13 and 14 (`grep "const DRIFT = ("` gives 35, in two textual variants of 27 and 8). `CARD` is in 21 scenes, and the `w = (x, occ) => F1.wordFrame(S, x, occ)` shorthand is in 77.
- **Fix:**
  - Add `F1.world.drift/sweep` (plus a `F1.words.w(S)` shorthand) to `src/runtime/f1/world.js` and use them in new scenes.
  - **Do not rewrite posted episodes' scenes.**
  - Make a template or `hw-*` scene the scaffold default, and track the share of template scenes per new episode.
- At 500 episodes this is the biggest lever against duplicated engine-like code living in content.

### F5. Supertonic synthesis is nondeterministic and its caches are not shared across laptops. Impact M, Effort S, Risk M (voice tier)

`.venv/.../supertonic/core.py:458` calls `np.random.randn(...)` with no seed. `generate.py:217` does not seed before `synthesize`. Voice caches (`.cache/voice/**`) are per laptop and not in git, so any cache miss on the other laptop produces different speech and timings for the same narration. Cartesia episodes avoid this because their clips are committed. On this WSL laptop, episodes 01–08 have no voice cache at all. Fix: seed numpy from the chunk key before each synthesis. New chunks only, so existing cache entries are unaffected.

### F6. Batch commands abort on the first failure, and folder scans are O(n²). Impact M at scale, Effort S, Risk L

- `motion.mjs:169-201` throws out of the `for(const id of ids)` loop. `validate --all`, `sync --all --check` and `render --all` stop at the first bad episode. This was observed: `sync --all --check` reported only inflasi. Fix: continue, collect the results, print a per-episode table and set the exit code.
- `loadEpisode` re-scans `episodes/` on every call (`episodes.mjs:57`). `list`, `--all`, and `createEpisode` (`motion.mjs:92`, `:94`, `:99` load every episode up to three times) are O(n²). Benchmark with 500 synthetic folders: 500 scans took **706 ms** on WSL ext4, and NTFS is several times slower. Fix: memoise the folder scan per process.

### F7. Hardcoded format and series values block reuse. Impact M, Effort M, Risk L

- Scaffolds live in CLI code: `motion.mjs:87` (default categories), `:106-107` (KASUS manifest and narration), `:114-158` (HotWizz Flash skeleton and Indonesian placeholder text). They repeat `config/defaults.json` values (video, audio, loudness) and the hotwizz theme's `wec` voice settings (`F2`, range 1.4). The case prefixes `KASUS #` and `HOTWIZZ #` are hardcoded.
- `validate.mjs:138-142` hardcodes `canonicalVoices={mog:'M1',wec:'F2',bog:'M4'}`, which duplicates `config/speakers.json`. A new series using a different Supertonic voice for `mog` would be rejected.
- The profile list (`validate.mjs:89`) and provider list (`:123`) are inline.
- Caption style is fixed per profile (`src/templates/captions.mjs:46`, `:63-66`, including the lime `#c6f432`). Title card colours and fonts are inline (`title-card.mjs:43`). The HotWizz background `#0d0f16` and its SFX map are inline (`hotwizz.mjs:18`, `:142`). Themes can only set the watermark, profile, voice and audio (`config/themes/hotwizz.json`); the palette is the single global `f1.css`.
- The watermark aspect ratio is hardcoded to the hotwizz logo (`src/runtime/f1/cine.js:64-68`). A `height` option exists, but the validator rejects it (`validate.mjs:95`), so another brand mark with a different aspect cannot be configured.
- `CARTESIA_DEFAULTS` is duplicated (`voice.mjs:15` and `cartesia.py:39`), and so is `respell` (`generate.py:159`, `cartesia.py:167`).
- **Fix:**
  - Move scaffolds into `config/formats/<format>.json` (manifest, narration and script skeleton, case prefix, category), so `new --format hotwizz-flash` needs no CLI edit.
  - Derive canonical voices from `config/speakers.json`.
  - Allow `watermark.height`.
  - Optionally let themes override CSS variables. `core.js:199-256` already reads the palette from CSS variables, so the build could append a theme `:root{}` block. Do this only if more series are planned.

### F8. The manifest and narration schemas are not strict. Impact M, Effort S, Risk L

`validateEpisode` rejects unknown keys for the watermark (`validate.mjs:95`, `:102`), Cartesia (`:128`) and `hw-*` props (`hotwizz.mjs:27`). It does **not** reject unknown top-level, `video`, `audio`, `runtime`, scene or line keys. A typo such as `"bedgain"` or `"temlate"` is silently ignored, and the default applies. `config.assets` (an explicit asset list) is only checked at staging time (`storage.mjs:168-169`), not by `validate`. Validation also does not check duplicate episode numbers across episodes (only `new` does, at `motion.mjs:94`). Fix: an allow-list of keys per object, plus an `--all` cross-episode uniqueness check.

### F9. Obsolete and dead code. Impact L, Effort S, Risk L (except the `generate.py` part, which is M and must wait for F1)

- `scripts/migrate-episodes.mjs` (214 lines), `scripts/retire-legacy.mjs` (138) and `scripts/verify-migration.mjs` (97) hardcode the 7 original ids and `out/Ekonomi_keuangan`. **`verify-migration.mjs` is already broken**: it reads `episodes/<id>` (`:33`), but folders are now `<NN>_<id>`. `tests/migration.test.mjs` and `tests/retirement.test.mjs` (10 of the 29 tests) only exercise these one-time tools.
  - Recommendation: move the scripts and their tests to `scripts/archive/` (or delete them). The receipts remain in `docs/refactor-*.json` and the ZIP in `.cache/migration-baseline/`. HANDOFF line 264 references `migrate-episodes --verify`; update it.
- `importLegacy` in `voice.mjs:83-94` is one-time import code, but `tests/engine.test.mjs:31`, `hotwizz.test.mjs:44` and `voice-storage.test.mjs` use it as their **voice fixture seam**. Replace it with a small test helper that writes a manifest and state before removing it.
- **Keep** `MOTION_LEGACY_CHUNKS` and `legacy-chunks`. They feed the Supertonic cache provenance key (`generate.py:200-205`) for episodes 01–07; removing them would re-synthesise posted voices. `voice.mjs:96` copies the whole `legacy-chunks` dir into tmp on every regeneration; a rename or hardlink would be cheaper.
- The edge-tts path is dead. The validator accepts only `supertonic`, `files` and `cartesia` (`validate.mjs:123`), yet `generate.py:272-318` (`synth`), `:342-381` (`split_boundaries`, `attach_punctuation`), `:259-269` (`write_list`, which writes `voiceover/lines.md` into a temp dir) and the comment at `:37` remain, and `edge-tts==7.3.1` is still in both requirement files.
- `runtimeConfig` emits `captions.maxWords` (`timing.mjs:6`), but `timing.js:174` recomputes it from the profile, so the config value is unused.
- The `timing.js:5` header still cites `scripts/sync.mjs`, `src/data/f1-voice.json` and `npm run sync`.
- `motion.mjs:181` repeats a check that `parseArgs` already makes (`:58`), and `:185` validates the scene id after using it.
- `storage.mjs:219` checks `target === 'voice'`, which `:199` already rejected. The CLI help advertises `--target voice`, which always errors.
- The `libs` load order is hardcoded in `build.mjs:64`, although every file in `src/runtime/f1` is staged (`:33`). A new runtime module needs a build edit.

### F10. There is no automated post-master QA. Impact M, Effort S, Risk L

`masterVideo` returns `inputLoudness` but never measures the output. HANDOFF records results by hand each time, including an out-of-spec one: "06 emas … **-0.1 dBTP — above the -1 target**" (HANDOFF line 77). Fix: after publishing, run one `ebur128`/`ffprobe` pass and print a line (duration, fps, frames, LUFS, true peak, size). Warn when true peak > target or fps ≠ `video.fps`. Also print a notice when `out/uploaded/<same name>` exists, meaning the episode was already posted. That catches accidental re-renders without ever touching `out/uploaded`.

### F11. Disk growth from disposable artefacts. Impact M at scale, Effort S, Risk L

- `render` keeps `render.raw.mp4` in each build dir (`motion.mjs:194`): 34–43 MB each here, about 20–30 GB at 500 episodes.
- A failed master leaves a `render-<uuid>.raw.mp4` (evidence in F2).
- Stills accumulate under `run-<uuid>` (170 MB here).
- `.cache/voice/chunks` is never pruned (154 MB for 3 episodes here).
- Fix: delete the raw file after a successful master unless `--keep-raw` is given. Optionally add a `clean --target stills` age filter. A chunk GC is not needed yet.

### F12. Committed Cartesia WAVs grow the git repo. Impact M at scale, Effort M, Risk M

Tracked `voice-lines` WAVs are 41 MB for 5 episodes (about 8 MB per episode). `.git` is 248 MB. `tighten.py` rewrites clips in place, so each tightening adds new blobs. At 500 episodes that is about 4 GB or more in history. Committing the clips is right for the two-laptop and billing reasons. Options: store **new** clips as FLAC (lossless, roughly half the size; `generate.py` decodes through FFmpeg anyway), or use Git LFS. Do not convert existing clips: their hashes are part of the cache keys.

### F13. `tighten.py` is a manual, non-declarative step. Impact M, Effort M, Risk M (voice tier)

`tools/voice/tighten.py:99-106` rewrites tracked clips in place, non-atomically, and patches the sidecar sha256. The narration does not record that tightening happened or with which settings. When a line is re-synthesised later, it comes back untightened unless someone remembers to run the tool. Fix: declare it per speaker (for example `speakers.mog.cartesia.tighten: {max: 0.12, min: 0.15, db: -35}`) and apply it in `cartesia.py lines` after synthesis, with the settings in the line key. Write through tmp+replace.

### F14. Test gaps. Impact M, Effort S–M, Risk L

The 29 tests cover config merging, VM isolation, incremental build, schema, the lock, CLI parsing, 60 fps, HotWizz templates, Cartesia planning, the voice import and staging. Missing:
- `validate --all` and a **real-episode build smoke test**. No test touches `episodes/`, so a runtime change can break 95 bespoke scenes and `npm test` stays green. Suggested: generalise `verify-migration.mjs`'s VM sampler (`:16-64`), which runs scene scripts and hashes `draw(frame)`, into `motion regress capture|compare`. Feed it validate's synthetic timing (`validate.mjs:148`) so it needs no voice cache and runs the same on both laptops.
- `masterVideo` (no test; it could use an FFmpeg `lavfi` source and skip when FFmpeg is absent).
- Python tests: `align`, `snap_onsets`, `respell` and `tighten` have none.
- The lock's crash and stale behaviour (F2).

### F15. Smaller error-handling gaps. Impact L, Effort S, Risk L

- `voice.mjs:59`: `same()` swallows every error and returns false. A missing `voice-lines` clip, a corrupt `state.json` and a real narration change all show the same "missing or stale" message. Return the reason: which fingerprint field differs.
- `episodes.mjs:65`: a missing theme file raises a raw ENOENT.
- `master.mjs:130` uses `ffmpeg`/`ffprobe` from PATH and ignores the `FFMPEG` env var that `generate.py:33` honours.
- `master.mjs:145`: on EXDEV, `copyFile` writes the output non-atomically. That contradicts the comment at `:143` about sync folders seeing only finished files.
- `hotwizz.mjs:137`: SFX beyond the sixth in one scene share a track index (`Math.min(k,5)`).
- The ID regex is duplicated 6 times in slightly different forms (`episodes.mjs:6`, `voice.mjs:37,45,65`, `storage.mjs:175,201`, `cartesia.py:42`).

## 3. Recommended order

1. **F1** voice key narrowing, with a one-time v4 bump. Do it first, because every later voice-tool edit currently mass-invalidates caches. Opus · high.
2. **F2, F3, F6, F10, F11**: small CLI and pipeline robustness changes. Sonnet · high, except F10 and F11 (mastering), which are Opus · high.
3. **F4**: promote `DRIFT`, `SWEEP` and the word shorthand to the runtime for new scenes. **F14** regression sampler, so the runtime can change safely across hundreds of bespoke scenes.
4. **F7, F8**: format scaffolds in config, a strict schema, and voices derived from config.
5. **F9** dead-code removal, after F1 so it lands with the single invalidation. **F5** Supertonic seed, **F12** FLAC for new clips, **F13** declarative tighten: voice tier, as needed.

Do not change: the overall architecture, the VM timing isolation, staging, cleanup safety, the master publish flow, Cartesia caching, `legacy-inflasi`, or the HyperFrames 0.8.210 pin.
