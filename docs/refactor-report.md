# Shared video pipeline: implementation and verification

The seven episodes now use one root Node application, one root Python environment, one shared drawing/timing runtime, and a shared asset library. Episode folders contain authored manifests, narration, scripts, and custom scene artwork. New episodes start from a shared title-card template without copying application code or installing dependencies.

## Architecture

| Location | Responsibility |
|---|---|
| `scripts/motion.mjs` | Root command interface |
| `src/config/` and `config/` | Manifest validation, defaults, themes and speaker defaults |
| `src/runtime/` | Shared F1 drawing, cinematic profiles and isolated timing instances |
| `src/templates/` | Shared background, captions and title-card templates |
| `src/pipeline/` | Build orchestration, voice reuse/generation, asset staging, locks and mastering |
| `tools/voice/` | Shared Python synthesis/alignment and music-bed generation |
| `episodes/<id>/` | Authored content; custom scene extensions preserve existing artwork |
| `assets/shared/` | One authoritative copy of common fonts, licenses, cast, SFX and music |
| `.cache/build/<id>/` | Disposable served HyperFrames project, with only referenced assets |
| `.cache/voice/<id>/` | Imported or regenerated speech, timing and cache provenance |
| `.cache/migration-baseline/` | Protected recovery archive and regression baselines |
| `out/result/` | Existing and future successfully mastered final videos |

HyperFrames remains pinned to **0.8.210**. GSAP **3.15.0** is staged locally from that package. Inflation retains its older cinematic/caption profile and no music bed; the other six retain their modern profile and music mix. Authored speaker records remain authoritative, including deliberately omitted processing options.

## Delegated work actually used

| Work | Model | Effort |
|---|---|---|
| Inventory and documentation | `gpt-6-luna` | low |
| Architecture and independent integration review | `gpt-6-astra` | xhigh |
| Shared CLI/runtime/config/templates | `gpt-6.1-sol` | high |
| All seven episode migrations | `gpt-6.1-sol` | high |
| Voice, storage, mastering, dependencies and retirement tooling | `gpt-6.1-terra` | high |
| Independent voice/storage/mastering review | `gpt-6.1-terra` | xhigh |

Workers had separate write ownership. The architect settled the interfaces before implementation; independent reviewers reported defects to the owners. Resolved defects included legacy speaker defaults altering pitch, stale staged assets, conflicting speech-cache filenames, shared decode temporary files, chapter-card duration, source-path containment, and render-output override risks.

## Migration and fidelity

The final integrated suite passed **20/20 tests** after legacy retirement. All seven manifest checks, read-only synchronization checks, archived migration checks and procedural comparisons passed again using only the shared application. The root Python environment also passed `pip check` after retirement.

| Episode | Number | Scenes | Migration | Lint | Browser check / render |
|---|---:|---:|---|---|---|
| inflasi | 01 | 6 | Migrated | 0 errors | Blocked by host |
| rupiah | 02 | 6 | Migrated | 0 errors | Blocked by host |
| ihsg | 03 | 6 | Migrated | 0 errors | Blocked by host |
| paylater | 04 | 7 | Migrated | 0 errors | Blocked by host |
| judol | 05 | 7 | Migrated | 0 errors | Blocked by host |
| emas | 06 | 7 | Migrated | 0 errors | Blocked by host |
| kelas | 07 | 7 | Migrated | 0 errors | Blocked by host |

- All 46 custom scenes, seven narration files and eight authored script documents were copied byte-for-byte. Shared assets deduplicate 293 original copies into 42 files; all eight font license files are preserved. The shared background matches all seven originals.
- The migration receipt records 361 original-to-target mappings and 119 output hashes, with hashes binding the original source archive and baseline. The migration tool checks existing targets before writing and refuses modified targets.
- All **4,155** sampled procedural HTML/SVG drawing outputs match the original runtime. Timeline data, voice manifests, caption grouping and shared CSS also match.
- The independent architect compared **2,932** caption GSAP operations, caption clip markup and style text across all seven episodes; they match the originals.
- All **46** imported section MP3s and **721** imported cache files match their originals by SHA-256. Title-only metadata changes preserve the voice cache in all seven episodes.
- Cleanup followed by rebuilding all seven disposable projects succeeded, without regenerating narration.
- Synthetic eight-second mastering with and without music produced **-14.0 LUFS**, preserved the video stream hash and duration, and left the input unchanged. A missing music input did not replace a previously valid output.

These checks establish source, procedural and audio-processing preservation. They are **not browser pixel comparisons or a claim that fresh full videos rendered successfully**.

## Disk usage and recovery

| Measurement | Before | After |
|---|---:|---:|
| Production workspace, including dependencies, outputs and retained recovery material | 3.87 GB | 1.33 GB |
| Active Node and Python dependencies | 3.07 GB | 0.44 GB |

The measured **net reduction is 2.54 GB (about 2.37 GiB)**. Retirement removed 3,359,383,760 logical bytes from 106 bounded legacy paths after source/archive/voice verification and dependency metadata checks. Net savings account for the new shared application, one retained dependency installation, imported speech and recovery artifacts. These are logical file sizes, not filesystem allocation/free-space measurements; unchanged Git history, reference videos and agent skills are excluded from both sides. See `refactor-disk-usage.json` for exact bytes and scope.

No copied application engines or dependency installations remain in the old episode directories. The seven small Python interpreter/script recovery bundles were moved into `.cache/migration-baseline/environments/`; the only active environment is the root `.venv`. Four old renders (169,158,934 bytes total) and the existing debug log remain in their original directories. They were intentionally retained and are not included as reclaimed space.

The original source ZIP passed CRC verification (583 entries, 35,912,040 bytes). Imported speech and the recovery archive remain protected from ordinary cleanup. The large raw inventory capture is retained at `.cache/migration-baseline/inventory-full.json`; the concise inventory report stays in `docs/`. To inspect or restore original sources, extract the ZIP into a separate recovery directory first. Remigration requires restoring the original source tree; routine authoring and rendering do not.

## Rendering and installation boundaries

Every episode passed manifest validation and HyperFrames lint; existing density/overlap warnings remain. All seven browser checks and all seven full raw-render attempts failed because Chrome could not access the local HyperFrames server (`net::ERR_NETWORK_ACCESS_DENIED` on localhost/127.0.0.1). The render attempts compiled and processed audio but produced no captured video frames. HyperFrames also could not write its default history outside the workspace. All seven existing final video hashes remained unchanged.

A fresh offline `npm ci` was blocked by an incomplete npm package cache. The root installation reuses the already installed exact HyperFrames dependency tree. The root Python environment imports the required libraries and passes `pip check`; its pinned dependency files were recorded from the existing installation. Clean online installation and Linux execution remain unverified.

The initial manifest version supports 1080x1920 at 30 fps and two existing visual profiles. Named themes merge implemented configuration fields; arbitrary palette/layout JSON does not automatically alter custom artwork. Computed asset paths must be declared in the manifest's `assets` array. Custom HTML/JS scene extensions remain available for unique artwork.

## Commands

```powershell
node scripts/motion.mjs list
node scripts/motion.mjs new phk --title "Judul video" --category Ekonomi_keuangan --number 08
node scripts/motion.mjs validate phk
node scripts/motion.mjs voice phk
node scripts/motion.mjs sync phk
node scripts/motion.mjs preview phk
node scripts/motion.mjs render phk
node scripts/motion.mjs render --all
node scripts/motion.mjs clean phk --dry-run
```

Edit the starter narration, source citations and scene parameters before production. `voice` and `render` may synthesize missing/stale narration. Other build/check commands require a valid existing voice cache. Cleanup protects imported speech, recovery evidence and final videos. Rendering publishes a mastered output only after a fresh raw render succeeds.

See `README.md`, `refactor-architecture-review.md`, `refactor-safety-review.md`, `refactor-fidelity.json`, `refactor-checks.json` and `refactor-renders.json` for implementation and verification details. No commit or push was made.
