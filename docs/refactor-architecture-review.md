# Architecture and integration review

Reviewed on 1 November 2026 by the independent C5 architecture reviewer. Scope: the root CLI, configuration and narration precedence, shared runtime and templates, build artifacts, voice/storage interfaces, and preservation of the seven migrated episodes. This reviewer changed only this report during the review phase; implementation fixes were made by their owning workers.

## Decision

The reviewed implementation satisfies the shared-application architecture and has no remaining identified architectural blocker. All seven episodes load from `episodes/<id>`, use the root dependency installation and pipeline, and share one drawing runtime. Generated HyperFrames directories contain the required runtime and media files without copied application tools, per-episode dependencies or Python environments.

This is structural and integration acceptance, **not browser-render fidelity approval**. HyperFrames browser capture remains blocked by this host's loopback network restriction. Matching procedural output, caption instructions and audio bytes do not establish that a newly rendered video looks and sounds identical. Snapshot and full-render verification remain necessary on a host where the renderer can access its local page.

## Independently executed checks

| Check | Result |
|---|---|
| `node scripts/motion.mjs list` | All seven migrated episodes listed with their case numbers and titles |
| `node scripts/motion.mjs validate --all` | All seven valid; 46 scene mappings |
| `node scripts/motion.mjs sync --all --check` after fixes | All seven up to date, exit 0; no synthesis requested |
| `node --test tests/engine.test.mjs tests/voice-storage.test.mjs tests/migration.test.mjs` | 16 tests passed, zero failures in the final review run |
| Effective narration comparison | SHA-256 of `JSON.stringify(loadEpisode(id).narration)` equals the original narration JSON for every episode, preserving authored values and key order |
| Timing isolation | Seven timing instances loaded forward and then backward in one process; earlier instances and their timeline hashes remained unchanged; `globalThis.F1` absent |
| Caption template equivalence | Original and new caption scripts executed in recording VM contexts; all generated clip lines, CSS text and 2,932 GSAP operations matched across seven episodes |
| New episode smoke check | Created a temporary episode, loaded and validated it, rejected an overwrite, and executed its escaped title-card script against the scene contract |
| Chapter-card smoke check | Executed a generated non-narration chapter card with an explicit 45-frame duration; no missing-section/unknown-length error |
| CLI argument guards | Rejected alternate project paths, normal and compact output overrides, unknown switches, simultaneous episode/`--all`, and conflicting still selectors |

The tests use temporary fixtures. They do not perform a real speech-model download or browser render. The new-template integration test builds from an imported synthetic fixture, checks incremental behavior and confirms authored source files remain unchanged.

The independent caption comparison recorded these operation counts: emas 533, ihsg 468, inflasi 188, judol 461, kelas 493, paylater 484 and rupiah 305. This verifies the caption animation instructions and CSS in addition to grouping; it does not simulate Chrome typography or pixels.

The coordinator's `docs/refactor-fidelity.json` was also inspected: it reports 4,155 matching procedural HTML/SVG samples across the 46 scenes, with matching voice-manifest, CSS, timeline and caption-group hashes. The baseline additionally includes extracted frames from the existing seven finished videos. The separate safety review records matching hashes for all 46 imported section recordings and 721 legacy chunk files; those audio comparisons were performed by the safety reviewer.

## Findings resolved during review

| Finding | Resolution and evidence |
|---|---|
| A generated chapter card used `F1.sceneFrames("chapter-N")`, although chapter cards are not voice sections | Shared title-card accepts an explicit duration; build passes the chapter segment length. Independent execution passed. |
| Legacy build referenced missing `kasus.js` | Removed the unused script reference. The legacy authored scenes do not require it. |
| Initial implementation selected a copied legacy cine runtime | Replaced with one parameterized `cine.js`, preserving legacy stage, actor identity, cast entrance and HUD/chip behavior. Procedural baseline comparisons pass. |
| Asset-only differences were absent from `sync --check`, and removed resources could remain staged | Build consumes storage's asset check result. Storage reconciles a fresh selected-media snapshot; generated text files use a managed-file list to remove obsolete entries. |
| Forwarded HyperFrames arguments could select another project or override output | CLI now allows only known long options with known value arity. Managed source/output arguments and positional project selection are rejected. |
| An existing raw render could accidentally be mastered after a redirected render | Each render uses a unique raw path and verifies a nonempty newly created file before mastering. Same-episode work is serialized. |
| Read-only synchronization acquired a lock and then rejected its own lock | `sync --check` executes without the mutation lock and refuses an actually active conflicting operation. All seven checks passed afterward. |
| Source containment checked only lexical traversal | Source resolution now rejects symbolic links along the scoped path as well as escaping relative/absolute references. |
| Speaker defaults inserted modern pitch ranges into episode 01 | Authored speaker definitions now remain complete overrides; defaults fill absent definitions without inserting processing knobs into an existing speaker. Exact effective narration equality was rechecked for every migrated episode. |
| Preserved legacy chunks could be promoted into a shared cache under a conflicting same-name key | Voice implementation retains per-episode legacy caches and includes legacy WAV content provenance when promoting chunks. The safety reviewer found and checked two real divergent legacy-key collisions. |
| Repeated still captures could mix old and new images | Captures now use a unique run directory beneath the selected episode/scene or custom-stills directory. |

The episode 01 default-range finding was caught before rendering: its omitted pitch range means the original generator's `1.0`, not the modern `1.4`/`1.5` settings. The stale-cache error correctly stopped synchronization. The fix preserved its existing narration and recordings; the review did not approve reimporting a changed effective narration to conceal this difference.

## Approved contract refinements

The coordinator confirmed that the user's intended render command performs the complete pipeline. Therefore **`voice` and `render` may generate missing or stale narration**. `sync`, `preview`, `lint`, `check` and `stills` reuse validated voice material and fail when it is unavailable or stale. Existing imported voice material remains a cache hit when its effective narration and implementation fingerprints are unchanged. Documentation must state this distinction; the original design's explicit-voice wording should not imply that render never synthesizes.

Configuration layers are root speaker/default settings, an optional named theme and the episode manifest, followed by authored narration values. An authored speaker definition retains its processing semantics even when optional fields are absent. A new episode can inherit an absent speaker definition. Theme merging supports implemented configuration fields; it is not a promise that arbitrary JSON palette or layout properties alter the drawing runtime.

GSAP 3.15.0 is staged from the pinned HyperFrames package at `lib/vendor/gsap.min.js`. This differs only in generated path from the initial design example. The local version matches the previous CDN version. HyperFrames remains exactly `0.8.210`.

Build and asset files are disposable; imported voice, migration evidence and finished outputs are retained. Files used through dynamically constructed asset paths must be declared explicitly in `config.assets`, because staging can reliably discover only literal references. Shared assets may be hardlinked: update canonical assets atomically, and treat staged assets as read-only. Application source and SFX-retimed scenes use independent generated files rather than writable source hardlinks.

## Remaining verification boundaries

- Browser snapshot and full-render comparisons remain blocked by the host access restriction. Do not present the existing reference frames or procedural hashes as newly rendered pixel matches.
- Fresh installation from the root Node/Python lockfiles has not been independently demonstrated by this reviewer. The reviewed root tools reuse installed dependencies. The safety review describes the recovery precautions and remaining environment checks.
- This review exercised Windows. Paths and subprocess calls are designed for Windows and Linux, but a Linux execution was not available in this session.
- Real concurrent synthesis, interrupted mastering/publication and cross-filesystem hardlink fallback require integration evidence beyond the temporary test fixtures. The lock and replacement mechanisms were inspected, and supported failure cases are tested.
- The coordinator separately reported successful short mastering checks with and without the music bed. This reviewer inspected the preserved mix settings and publication contract but did not independently listen to or render those test clips.

Legacy retirement belongs to the coordinator and remains separate from this review. Preserve the verified source archive, imported recordings and chunks, baseline evidence, existing finished outputs and practical environment recovery material. The presence of the shared architecture does not justify deleting unknown user work or treating failed render verification as a pass.
