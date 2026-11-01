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

The `new` command may scaffold an episode using the reusable template. New bespoke scenes can choose `file` without modifying the CLI or shared runtime. Validate unknown template names and missing section mappings before attempting to render. A template must produce the same HyperFrames composition contract and use frame-based animation.

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
