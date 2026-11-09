# Shared HyperFrames pipeline contract

This document records the implementation contract agreed for the seven-episode refactor on 1 November 2026. It describes the intended interfaces; verification results belong in the migration verification report. HyperFrames remains exactly `0.8.210`, with the existing 1080 × 1920, 30 fps output and Supertonic-3 voices.

## Source and generated files

There is one repository application, one Node dependency installation, one Python environment and one drawing runtime. An episode owns its narration, configuration, bespoke scenes, research script and unique assets. Its generated HyperFrames directory is a staging area, without a package manifest, dependency installation, Python environment or copy of the application tools.

| Path | Role |
|---|---|
| `scripts/motion.mjs` | Root command-line entry point |
| `src/config/episodes.mjs` | Episode loading, validation, defaults and absolute path resolution |
| `src/runtime/f1/` | Shared browser drawing and timing runtime |
| `src/templates/` | Shared root, caption, background and optional scene templates |
| `src/pipeline/` | Build, staging, voice and mastering orchestration |
| `tools/voice/` | Shared Python synthesis, alignment and music tools |
| `assets/shared/` | Shared fonts, sound effects, cast artwork and music |
| `episodes/<NN>_<id>/episode.json` | Episode manifest |
| `episodes/<NN>_<id>/narration.json` | Existing narration JSON, preserving its data |
| `episodes/<NN>_<id>/scenes/` | Authored HTML scene extensions |
| `episodes/<NN>_<id>/script-short.md` | Original script and source attribution |
| `episodes/<NN>_<id>/assets/` | Optional assets overriding matching shared relative paths |
| `episodes/<NN>_<id>/voice-lines/` | Optional recorded lines for files mode |
| `.cache/build/<id>/` | Generated and staged HyperFrames project |
| `.cache/voice/<id>/` | Verified narration manifest, section audio and state |
| `.cache/voice/chunks/` | Shared synthesis and alignment cache |
| `.cache/stills/<id>/` | Diagnostic snapshots |
| `.cache/migration-baseline/` | Migration evidence and preserved original material |
| `out/` | Finished videos only |

The generated project preserves the current URL layout: `index.html`, `hyperframes.json`, `compositions/*.html`, `lib/f1/*.js`, `lib/f1/f1.css` and `public/**`. This keeps existing scene URLs and the CSS font paths working. Source scenes are never rewritten during synchronization; their generated copies receive updated SFX timing attributes.

## Episode manifest, version 1

```json
{
  "schemaVersion": 1,
  "id": "kelas",
  "number": 7,
  "title": "Kelas Menengah Hilang ke Mana?",
  "category": "Ekonomi_keuangan",
  "narration": "narration.json",
  "script": "script-short.md",
  "video": { "width": 1080, "height": 1920, "fps": 30 },
  "runtime": {
    "profile": "modern",
    "case": { "id": "KASUS #07", "steps": 7 }
  },
  "scenes": [
    { "id": "hook", "file": "scenes/hook.html" }
  ],
  "audio": {
    "bed": "music/bed.mp3",
    "bedGain": 0.3,
    "loudness": { "integrated": -14, "truePeak": -1, "range": 11 }
  }
}
```

The example abbreviates `scenes`; a real manifest contains exactly one entry for every narration section in narration order. Section IDs and episode IDs are validated identifiers. Referenced source files must resolve inside the episode directory; reject absolute paths, path traversal and links escaping that root. The loader derives the output filename from `number` and `id`, rather than accepting arbitrary final-output paths.

`runtime.profile` is `modern` or `legacy-inflasi`. Its purpose is preserving two real existing variants in one implementation. `runtime.case` provides the case label and progress-strip segment count. Version 1 validates the existing fixed canvas and frame rate, rather than pretending every drawing routine already supports arbitrary dimensions.

`audio.bed` is a path relative to the generated `public/` directory, or `null` to omit music. Presence of a shared bed does not enable music by itself. In the inspected tree, episode 01 has no music bed and its master script performs loudness normalization only; episodes 02–07 mix the bed. This differs from the blanket statement in the older handoff.

## Narration and timing

The narration schema stays compatible with the existing generator:

```text
source: supertonic | files | edge-tts
say?: map of original words to speech-only pronunciation replacements
speakers: map keyed by mog, wec, bog
  supertonic: { voice, speed?, range? }
  existing fallback voice/rate/pitch fields remain supported
chapters: [{ id, title }]
defaults: { lead, tail, gapSameSpeaker, gapNewSpeaker,
            firstLead, chapterLead, chapterEndTail }
sections: [{ id, chapter, lines: [{ speaker, text, after? }] }]
```

Migration copies each existing narration JSON without changing wording, numbers, pause markers, speaker parameters, pronunciation replacements or timing defaults. `[pause seconds]` and `[hold seconds]` retain their current interpretation. The episode ID is explicitly supplied to the shared generator; naming every source file `narration.json` must not rename audio namespaces to `voice/narration/`.

The generated voice manifest retains its current shape:

```text
{ speakers, chapters, total,
  sections: [{ id, chapter, start, duration, lead, tail,
               audio: "voice/<episode-id>/<section-id>.mp3", text,
               lines: [{ speaker, text, start, end,
                         words: [{ word, start, end }] }] }] }
```

Word and line times are seconds relative to the section audio, including lead silence. Section `start` is on the narration-only timeline. The shared timing runtime converts these values into frames, inserts existing chapter cards, and retains the final hold. Do not infer scene timing from nominal script lengths or round differently during migration.

## Runtime isolation and visual variants

Every browser document initializes a fresh `F1` object before loading the shared scripts:

```js
globalThis.F1 = { CONFIG: episode.runtime, VOICE: voiceManifest };
```

`F1.CONFIG` is exactly the runtime configuration object. `timing.js` and `cine.js` use that object, retaining the existing browser `F1` interface used by authored scenes. The remaining drawing modules remain shared. Configuration is not stored in a mutable process-wide singleton.

Node builds create an independent `node:vm` context for each timing instance and evaluate the shared timing IIFE inside it with `{ F1: { CONFIG, VOICE } }`. Reassigning `globalThis.F1` and then importing one shared module repeatedly is incorrect: Node caches the module, so later episodes can retain the first episode's closures or lack timing methods. A fresh VM context avoids both global state leakage and cache-busting import tricks. All-episode builds must also work when episodes are built in a different order within one process.

Inspection found the shared `f1` files byte-identical across episodes except `timing.js` and `cine.js`. The six modern cine files differ only in case metadata and its comment. Keep the following behavior switches explicit in the single implementation:

| Behavior | `legacy-inflasi` | `modern` |
|---|---|---|
| Caption group and merge limit | 4 words | 6 words |
| Caption band | y 960, height 280 | y 1496, height 136 |
| Caption typography | Montserrat 900, 86 px, uppercase, outline | Montserrat 800, 46 px, sentence case, dark box |
| Caption entrance | Scale 0.82 to 1, existing back easing | Rise 14 px, existing power easing |
| Active word treatment | Existing gray-to-white/lime transition | Lime active-word background, then white/lime text |
| Stage whip | Absent | Existing 9-frame whip unless disabled by scene |
| Later actor entrance | Line start minus 4 frames | Line start minus 12 frames |
| Actor pattern ID | Existing expression/position/size identity | Existing section/line identity |
| HUD and chip y | 210 | 250 |
| Case progress and stamp | Unused by migrated scenes | Existing helpers and configured case metadata |

Keep the original timing functions, caption lead/linger rules, interpolation and rounding. Preserving the legacy actor identity during this refactor is deliberate; unrelated visual corrections can follow separately. The legacy unused `kasus.js` and `frame.html` are preserved in migration material but need not become active scene sources.

## Scene extension and shared templates

Existing episodes keep their bespoke art as HTML scene extensions. Their `F1.scene`, `F1.at`, `C.cast`, HTML/SVG content and `data-at` anchors remain the authoring interface. Shared root, background and captions are generated once by common templates. Modern/legacy caption differences are template parameters or branches, not seven copies of the synchronization script.

Each scene entry chooses exactly one implementation:

```json
{ "id": "hook", "file": "scenes/hook.html" }
```

or, for a reusable built-in scene supported by the template registry:

```json
{ "id": "hook", "template": "title-card", "props": { "title": "Example" } }
```

The registry is `src/templates/registry.mjs`: `title-card` plus the HotWizz Flash templates `hw-hook`, `hw-resmi`, `hw-split`, `hw-quote`, `hw-number` and `hw-cover` (`src/templates/hotwizz.mjs`, props listed in README "HotWizz Flash"). Each validates its props and cue anchors in `validateEpisode` and renders a composition that inlines `src/templates/hotwizz-kit.js`. The `new` command may scaffold an episode using the reusable template, or the five-scene Flash skeleton with `--flash`. New bespoke scenes can choose `file` without modifying the CLI or shared runtime. Validate unknown template names and missing section mappings before attempting to render. A template must produce the same HyperFrames composition contract and use frame-based animation.

Synchronization reads authored HTML, updates anchored audio start times in memory, and writes its generated composition. It must not hardlink a scene source and then mutate the link. No build operation edits `episodes/`.

## Module boundaries

`loadEpisode(id, { repoRoot } = {})` in `src/config/episodes.mjs` returns the following context, with all filesystem paths absolute and independent of shell working directory:

```js
{
  repoRoot, episodeDir, id, config, narration,
  paths: {
    buildDir, voiceDir, voiceManifest, voiceState, chunkCacheDir,
    sharedAssetsDir, episodeAssetsDir, stillsDir,
    rawRenderFile, resultFile
  }
}
```

`voiceManifest` and `voiceState` are `manifest.json` and `state.json` inside `voiceDir`. Audio lives at `voiceDir/voice/<id>/*.mp3`. `rawRenderFile` is `buildDir/render.raw.mp4`; `resultFile` is the absolute finished-output path.

| Module / export | Contract |
|---|---|
| `src/pipeline/build.mjs`: `buildEpisode(ctx, {check=false}={})` | Produces or checks the staged project and returns `{buildDir, changed, timing}`. Checking must not write source or generated files. |
| `src/pipeline/voice.mjs`: `ensureVoice(ctx, {generate=false, force=false, importLegacy=null}={})` | Returns `{manifest, manifestPath, cacheHit}`. Build/check callers verify existing material without synthesis; explicit voice and render operations may generate missing or stale voice. `importLegacy` is an absolute old project path. |
| `src/pipeline/storage.mjs`: `stageFile(source, destination, {mutable=false}={})` | Stages an immutable file by hardlink when safe, with copy fallback; mutable files are copies. |
| `src/pipeline/storage.mjs`: `stageAssets(ctx)` | Stages shared assets, episode overrides and selected episode audio; returns a staging summary. |
| `src/pipeline/master.mjs`: `masterVideo({input, output, bedPath=null, bedGain=.3, integrated=-14, truePeak=-1, range=11})` | Masters fresh raw input into a different output, preserving the input and publishing only after success. |

The `voice` command explicitly prepares or forces voice generation. `render` also ensures missing or stale voice automatically before its build. `sync`, `preview`, `stills`, `lint`, and `check` call the build in check-only voice mode and never synthesize; they report a missing/stale cache. The voice adapter owns cache validity, Python interpreter selection and subprocess invocation; the build module consumes the validated voice manifest. No caller reconstructs voice cache keys.

## Voice cache and import

Import the original section MP3s and timing manifests for all seven episodes before legacy removal. Byte-for-byte audio preservation is the migration baseline; changing directory structure must not synthesize speech again. Store hashes for the narration inputs, manifest and every section audio file in state, together with the cache algorithm/version information needed to recognize valid material.

Import the legacy chunk caches as well. Their raw Supertonic chunks, pitch-expanded chunks and word alignment records are valuable incremental work. Preserve old keys when their behavior is unchanged; new cache records must distinguish synthesis settings, pronunciation, pitch processing, alignment/model versions and assembly parameters. Never silently reuse timing metadata after changing alignment logic. Colliding filenames with different content need explicit handling rather than last-writer-wins copying.

The root voice command and render operation reuse valid imported material. When narration changes, render regenerates voice before building; sync and preview report that voice regeneration is needed and do not use stale timings. Explicit regeneration may reuse unchanged chunks. Files mode includes recording content in its cache identity. Models and synthesizers should load only if a real cache miss requires them.

Ordinary cleanup removes generated builds and stills, not voice caches or migration baselines. Imported speech can contain synthesis variation that is not reproducible from text alone; it must not be casually treated as disposable. Any explicit speech-cache purge must make that scope visible.

## Asset staging and HyperFrames invocation

Shared asset selection is based on content and relative paths. An episode override wins for the same relative path. Preserve unique files and provenance. Hash-identical common fonts, SFX, cast images and beds are stored once in shared assets; different same-name files stay as episode overrides.

Staging uses file hardlinks for immutable assets when the source and destination filesystem permit it. Fall back to copying on cross-device or permission failures. Do not require Windows symlink privileges or directory junctions. Do not follow unexpected links while scanning, staging or cleaning. Generated HTML and files that downstream tools can edit use independent copies or atomic writes.

Never truncate a hardlinked destination to refresh it: that also changes the canonical source. Compare content, create the replacement separately, and replace the destination entry. Writes to canonical shared sources likewise must not modify an inode shared with active build files. Staging state must account for deletions and changed overlays so removed files do not remain active accidentally.

The installed HyperFrames CLI accepts a positional project directory for preview, lint and snapshot. Its static server resolves URLs under the supplied project root and rejects paths escaping that root. Therefore serve the generated `.cache/build/<id>` project and stage every referenced file underneath it. Do not rely on `../../assets` URLs escaping the served directory.

Resolve the HyperFrames bin from the root package installation, execute it with `process.execPath`, pass arguments as an array with `shell:false`, and use absolute project/output paths. Both Windows and Linux must work without shell-specific command chaining. The Node and Python commands should resolve paths from their modules or explicit context, never the invocation directory.

The installed HyperFrames package supplies GSAP 3.15.0 at `dist/vendor/npm/gsap@3.15.0/dist/gsap.min.js`, matching the current CDN script version. Stage this local file as `lib/vendor/gsap.min.js` to avoid a runtime CDN dependency without changing the animation library version. The generated `index.html` loads that path. Keep the existing font files local.

## Rendering and mastering

Render a fresh raw file under the build directory. Master that file once into a temporary final file and publish to `out/<NN>-<id>-short.mp4` only after FFmpeg succeeds. Never use an already mastered finished video as input, and reject identical input/output paths. A failed render or master leaves the previous finished video intact.

The six modern episodes retain the original mix graph: 48 kHz resampling, bed gain 0.3, trim to the video, 1.5-second fade-out, voice/SFX sidechain compression with threshold 0.015, ratio 5, attack 40 ms and release 400 ms, then unnormalized summing. All seven retain the current two-pass loudness target of -14 LUFS, -1 dBTP and LRA 11, video stream copy, 48 kHz AAC at 192 kb/s. Episode 01 skips bed mixing.

## Root CLI

The common entry point is `node scripts/motion.mjs <command> [episode-id]`. Root npm aliases may forward to it. Commands are `list`, `new`, `validate`, `voice`, `sync`, `preview`, `lint`, `check`, `stills`, `render` and `clean`; applicable batch commands accept `--all`. `new` accepts `--title`, optional `--number`, and optional descriptive `--category`. `clean` is a dry run by default; `--execute` performs the listed cleanup and `--dry-run` explicitly requests the preview. Process expensive synthesis and render batches sequentially by default.

`sync` builds generated artifacts; `preview`, `lint`, `check`, `stills` and `render` build first and share the same episode context. `voice` is the explicit synthesis/import command; `render` also generates or reuses voice when the cache is missing or stale. `sync`, `preview`, `lint`, `check`, and `stills` require a valid voice cache and never synthesize. `stills` supports section selection and explicit timestamps and writes diagnostics outside `out/`. `clean` reports its exact managed paths and does not select legacy source trees or finished outputs.

## Migration ownership and gates

| Owner | Exclusive responsibility |
|---|---|
| Architect | This contract and design review |
| Engine worker | Root CLI, config loader/schema, shared runtime, templates and build orchestration |
| Voice/storage worker | Shared Python voice tools, voice/cache adapter, storage, mastering, root dependency files and environment setup |
| Migration worker | All seven episode source folders and shared asset population after the contract is frozen; no shared-engine edits |
| Coordinator | Baseline evidence, verification scripts/reports, integration, source archive and legacy retirement |

Existing modified and untracked work is input to the migration, not debris. Preserve the actual working-tree versions, including modified package/master files and all five untracked newer episodes. Do not restore from git, reset the worktree, commit or remove old folders as part of an unreviewed bulk cleanup.

| Number | ID | Profile | Sections | Bed |
|---|---|---|---:|---|
| 01 | inflasi | legacy-inflasi | 6 | None |
| 02 | rupiah | modern | 6 | Existing bed |
| 03 | ihsg | modern | 6 | Existing bed |
| 04 | paylater | modern | 7 | Existing bed |
| 05 | judol | modern | 7 | Existing bed |
| 06 | emas | modern | 7 | Existing bed |
| 07 | kelas | modern | 7 | Existing bed |

Retirement proceeds only after source/archive and audio preservation have been verified. Archive authored originals and unique inputs before removing old app trees; preserve old finished renders until explicitly covered by the authorized cleanup. Default cleanup never discovers targets by recursively searching for names such as `node_modules` outside explicit managed roots.

On Windows, resolve and validate every recursive cleanup target under its intended root and reject junction/reparse escapes. Use one implementation or shell end to end. An inventory report alone is not permission to delete unknown or changed material. Baseline hashes and counts should be checked again immediately before retirement.

Acceptance checks include all seven manifests loading, narration and source-content preservation, identical imported audio hashes, identical section durations and timeline frames, captions/SFX equivalence for each profile, all-episode builds in different orders, repeat builds without unnecessary writes, staging copy fallback, files-mode and cache invalidation checks, zero HyperFrames lint errors, snapshot comparison and a full render where the environment supports them. Final-output files must remain unchanged until intentionally replaced by successful fresh renders.

Renderer failures caused by host access controls are reported as limitations, not passing fidelity evidence. During initial baseline attempts in this session, the installed renderer could not access its loopback page (`net::ERR_NETWORK_ACCESS_DENIED`) and also encountered a cache-directory permission error. Offline extraction from existing finished MP4s can preserve reference frames, but does not prove a new browser render matches. Structural/timing tests and audio hashes remain useful while rendering is blocked; the verification report must distinguish those checks from visual sign-off.

## v2 contracts (Nov 2026)

The v2 refactor (9 Nov 2026) hardened the shared engine without changing the output format. Full plan, audits and verification: [docs/refactor-v2/plan.md](refactor-v2/plan.md), [audit-engine.md](refactor-v2/audit-engine.md), [audit-scenes.md](refactor-v2/audit-scenes.md) and [results.md](refactor-v2/results.md). Where this section and the v1 text above differ, this section wins. Output stays HyperFrames 0.8.210 at 1080 × 1920; the frame rate is 30 fps by default, with 60 fps opt-in through `video.fps: 60`.

### Voice state v4

- `state.json` is `{ version: 4, inputs, outputs, restamp? }`. `inputs` holds: the narration digest (canonical source, chapters, defaults, sections, Supertonic `say` or Cartesia effective options, the dictionary entries the episode uses, and only the speakers the episode uses); the versions in `tools/voice/versions.json` (`assembly`, `align`, `pitch` for Supertonic, `cartesia`); pinned packages from `requirements-lock.txt`; the Whisper model; and clip hashes for `files`/`cartesia` sources.
- Excluded from the key: `comment` fields, unused speakers, the yt-dlp pin, and whole-file hashes of `tools/voice/cartesia.py` and `generate.py`.
- `tools/voice/versions.json` holds a `guard` hash for each output-affecting function group (align, pitch, assembly, cartesia). `npm test` fails when those functions change without a version bump.
- Cache keys use `ALIGN_TAG`/`PITCH_TAG` instead of the generator file hash. A miss under a new key falls back to the legacy key and copies the record atomically. `MOTION_NO_SYNTH=1` fails before any Supertonic synthesis; `MOTION_NO_MODELS=1` fails on any Supertonic, Whisper or PSOLA cache miss. Supertonic chunks are seeded from their key before synthesis.
- Re-keying: `--restamp` (reproduce offline, keep the cache if byte-identical), `--adopt` (narration digest and outputs match, stamped `restamp.mode: 'adopted'`), `--adopt-structural` (files/Cartesia only), `--offline` (no Cartesia API, no Supertonic synthesis). `--force` cannot combine with them. Details: README "Voice cache (state v4)".
- `ensureVoice` returns `{manifest, manifestPath, cacheHit, restamped?}`. Build, sync, preview, lint, check and stills only verify the cache and never synthesize.

### Scene wrapper

- A manifest scene is `.html` (the original contract), `.js` (wrapped), or a template. Wrapped scenes have `bg` and `sfx: [{at, file, vol}]`; both are rejected on `.html` and template scenes.
- A `.js` file contains one `scene((f, ctx) => markup, opts?)` call. The build (`compositionSource` in `src/pipeline/build.mjs`, also used by the regression harness) emits the same composition skeleton as hand-written scenes. Each SFX entry becomes one `<audio>` clip on track `20 + index*16 + k`.
- Validation checks the call count, SFX anchors and files, and volume range. Scene source is never rewritten. Only generated copies receive resolved `data-start` values.
- Migrating posted `.html` scenes to `.js` is deferred.

### Runtime additions

Additive only. Existing scenes keep working.

- `F1.PAL`: frozen palette, `DEFAULT_PAL` merged with `F1.CONFIG.palette`. Fixed keys: `bg`, `paper`, `ink`, `muted`, `source`, `red`, `accent`, `teal`, `tealDark`, `drift`, `haze` (`PALETTE_KEYS` in `src/runtime/timing.mjs`; a test keeps it equal to `DEFAULT_PAL`).
- `runtimeConfig` emits `palette` only when it is set, so default output is unchanged. `runtime.case.name` passes through as `C.CASE.name`.
- `F1.fmt.id`, `F1.fmt.rp`, `F1.countUp`, `F1.sceneCtx(id, S, D)` (returns `{S, D, id, n, w, C, W, PAL, FONT}`).
- `W.drift`, `W.sweep` (byte-identical to the former pasted copies), `W.checklist`.
- `C.card`, `C.verdict`, `C.cover`: continuous in `f`, no `f % N`.
- Themes in `config/themes/`: `warm-desk` and `transit` (palette sets), plus `hotwizz`.

### Config and schema

- Strict per-object allow-lists for the manifest (`top`, `video`, `runtime`, `case`, `watermark`, `palette`, `audio`, `loudness`, `scene`, `sfx`, `narration`, `speaker`, `supertonic`, `cartesia`, `defaults`, `chapter`, `section`, `line`). Unknown keys fail with a "did you mean" suggestion. Legacy keys are accepted: top-level `theme`, narration `comment`, speaker `voice`/`rate`/`pitch`, `say`, and speaker `cartesia.speed`.
- Supertonic voices come from `config/speakers.json`.
- `validateEpisodes` requires unique ids and numbers across episodes. The episode-folder scan is memoised per repository root; `resetEpisodeCache()` clears it.

### Formats

- `config/formats/<name>/format.json` (`category`, optional `theme`, `case: {prefix, counter}`, `episode`, `narration`) and `config/formats/<name>/files/**`. `{{id}}`, `{{number}}`, `{{title}}`, `{{category}}`, `{{caseId}}` and `{{steps}}` are substituted in parsed strings and file contents. Symlinks in a format are rejected.
- Case counters: `number` (the episode number), `max` (highest existing prefix number plus one), or `{theme}` (count of episodes with that theme plus one).
- Shipped formats: `default` (plain `new`), `hotwizz-flash` (`--flash`), `kasus` (`--format kasus`, four wrapped `.js` scenes with case verdict and cover).

### Regression harness

- `scripts/regress.mjs` supersedes `scripts/verify-migration.mjs` for scene checks. It records each scene's draw output hashes at sampled frames (0, 1, 8, 14, D/2, D-1, and each word start ±1; for 60 fps also +0.5 at 0, D/2 and the first word), plus caption and timeline hashes. Output goes to `.cache/regress/<label>/`, which `clean` never touches.
- Commands: `capture`, `compare`, `stills`, `stills-compare`. `--timing synthetic` derives timings from the narration (0.32 s per word, minimum 0.6 s per line, plus defaults); it needs no voice cache.

### Output safety

- `measureMedia` reads duration, fps, frames, integrated loudness, true peak, LRA and size with ffprobe and `ebur128`. `masterVideo` returns `measured`. `FFMPEG` and `FFPROBE` environment variables are honoured.
- On cross-device rename (EXDEV), the output is copied to a hidden temp in the output folder, then renamed there. The mix graph is unchanged.
- `render` prints the QA line and an "already posted" notice when `out/uploaded/<name>` exists; it never writes to `out/uploaded/`.
- `clean` reports `.cache/voice/<id>-tmp-*` and `-previous-*` leftovers as stale and does not remove them.

### Deferred (not done in v2)

- DRIFT/SWEEP dedupe in episodes 06 and 07 (12, 13 and 14 are done).
- Skeleton-to-`.js` migration of posted scenes.
- Unifying cover and HotWizz cover (`cover` and `hw-cover`).
- Episode-specific kits (CAL, ICON, BADGE, trains, bars).
- Pruning dead runtime code.
- Archiving the migration scripts and removing edge-tts and `importLegacy`.
- Raw deletion, FLAC output, declarative tighten, per-line dictionary key, and a requirements split.
- `toLocaleString` and `f % 2` in posted episodes 01 and 02.
