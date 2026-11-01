# AI model routing

**Provider scope:** Claude agents follow the Claude mapping below. ChatGPT/Codex agents follow the Codex mapping. Shared project rules apply to both providers. Explicit user instructions and host capabilities take precedence.

Before changing files, identify the targets and use the lowest approved tier covering their actual responsibility. Raise the tier if scope or risk expands.

The repository uses one shared HyperFrames application. Episode authoring is in `episodes/<id>/`; shared media is in `assets/shared/`; engine source is under `src/`; generated projects and stills are under `.cache/`; finished videos are in `out/result/`. The old projects under `out/Ekonomi_keuangan/<id>/` are retained legacy/import material, not the active authoring workflow.

Rendering is timeline-driven. Avoid wall-clock animation, CSS transitions, timers, and unseeded randomness. Voice timing, captions, lip-sync, and SFX share timing data. Financial claims require sourcing in `episodes/<id>/script-short.md`.

## Claude models and effort

| Model | Effort | Use for |
|---|---|---|
| **Haiku 5.5** | default | Routine docs, unchanged-fact copy, literal color or asset changes |
| **Sonnet 5.5** | medium | One scene's art, local styling, bounded read-only runtime investigation |
| **Sonnet 5.5** | high | Shared runtime, timing/layout, templates, CLI, config/schema, episode migration |
| **Opus 5.5** | high | Voice synthesis/alignment/cache, mastering/audio, dependencies, new claims, unexplained render failures |
| **Opus 5.5** | max | Architecture, migration strategy/cutover, stack/engine changes, difficult integration |

Use the host's model controls for Claude. If a required tier is unavailable, explain the limitation; do not claim a model switch that did not happen.

## Claude routing map

| Responsibility / paths | Model / effort |
|---|---|
| Routine docs, `README.md`, `CLAUDE.md`, `HANDOFF.md`, this file, `.gitignore`, unchanged-fact copy | Haiku / default |
| One authored scene `episodes/<id>/scenes/<scene>.html`, local art or styling | Sonnet / medium |
| Shared browser runtime `src/runtime/**`; templates `src/templates/**`; CLI, config/schema, staging/build orchestration in `scripts/motion.mjs`, `src/config/**`, `src/pipeline/build.mjs` | Sonnet / high |
| Voice tools/cache/alignment, mastering/audio, dependencies, Python environment, storage and cleanup safety: `tools/voice/**`, `src/pipeline/voice.mjs`, `master.mjs`, `storage.mjs`, root manifests and lockfiles | Opus / high |
| New financial facts or claims in episode scripts, narration, captions or scenes; unexplained preview/render failures | Opus / high |
| Whole-project architecture, config/API contracts, engine or TTS changes, migration cutover and rollback | Opus / max |

### Legacy path reference

These are historical paths inside retained episode folders. Use them for read-only investigation or approved import work; do not treat them as active authoring targets.

| Historical responsibility | Legacy path | Current location |
|---|---|---|
| Scene HTML | `out/Ekonomi_keuangan/<id>/compositions/` | `episodes/<id>/scenes/` |
| Drawing kit and timing | `out/Ekonomi_keuangan/<id>/lib/f1/` | `src/runtime/` |
| Voice generator and cache | `out/Ekonomi_keuangan/<id>/voiceover/` | `tools/voice/` and `.cache/voice/` |
| Sync/master scripts | `out/Ekonomi_keuangan/<id>/scripts/` | Root CLI and `src/pipeline/` |
| Per-episode dependencies | Per-episode manifests, `.venv/`, `node_modules/` | Root package and Python environment |

## ChatGPT / Codex routing

The model IDs and tiers below describe this repository's routing policy. They do not promise public picker names, API availability, pricing, or equal capabilities across vendors. Follow the host's exact delegation arguments; never invent model IDs or claim a model/effort was used when unavailable.

| Tier | Claude counterpart | Codex model ID | Reasoning effort | Assignment |
|---|---|---|---|---|
| C1 | Haiku 5.5 | `gpt-6-luna` | `low` | Routine docs, inventory, unchanged-fact copy, ignore rules, literal asset changes |
| C2 | Sonnet 5.5 medium | `gpt-6.1-sol` | `medium` | One scene, local art/styling, bounded read-only runtime investigation |
| C3 | Sonnet 5.5 high | `gpt-6.1-sol` | `high` | Shared runtime, timing/layout, templates, config/schema, CLI and episode migrations |
| C4 | Opus 5.5 high | `gpt-6.1-terra` | `high` | Voice/cache, mastering/audio, dependencies, cleanup safety, new factual claims |
| C5 | Opus 5.5 max | `gpt-6-astra` | `xhigh` | Architecture, migration strategy, engine changes, difficult integration and final review |

### Codex routing map

| Responsibility / paths | Tier |
|---|---|
| Routine docs, `README.md`, `CLAUDE.md`, `HANDOFF.md`, this file, `.gitignore`, unchanged-fact copy | C1 |
| One `episodes/<id>/scenes/<scene>.html`, local art or styling | C2 |
| `src/runtime/**`, `src/templates/**`, root CLI, config/schema, episode manifests and migrations, build orchestration | C3 |
| `tools/voice/**`, voice/cache/alignment, audio mastering, root dependency manifests/locks, storage/cleanup safety, new factual claims | C4 |
| Architecture, cross-module contracts, engine or TTS changes, cutover/rollback, final integration and fidelity review | C5 |

Route by responsibility, not file extension. A documentation edit that changes architecture or factual claims inherits the higher tier. Legacy paths under `out/Ekonomi_keuangan/<id>/` remain read-only except for explicitly assigned migration/import work.

### Delegation protocol

For substantial multi-part work when delegation is available, assign the smallest coherent tasks without splitting a sensitive change so narrowly that its risk disappears. State each task's tier, model/effort, owned files, dependencies, and acceptance checks before dispatch. Keep shared files under one owner; give each worker exclusive write ownership, and communicate interface changes to dependent workers before they proceed.

For Codex delegation in this host, set `fork_turns: "none"` when overriding a model and pass `model` and `reasoning_effort` using the tool's supported arguments. Example:

```js
spawn_agent({
  task_name: "runtime_worker",
  fork_turns: "none",
  model: "gpt-6.1-sol",
  reasoning_effort: "high",
  message: "Repository: D:/Dev/motion. Tier C3. Own src/runtime/f1/core.js only. Follow docs/refactor-design.md; do not modify shared manifests. Report commands and results."
})
```

1. Read this file and inspect the working tree before assigning work. For architecture work, the coordinator owns the C5 architect role if already operating at C5; otherwise assign the C5 architecture task before implementation starts.
2. Workers share the workspace; do not assume branch/worktree isolation. Reserve concurrency for the coordinator and independent review. Serialize expensive voice synthesis and full renders unless resource constraints have been checked.
3. Keep voice/cache/dependency and cleanup safety at C4 or higher. These reviews require an independent C4 review at `xhigh`; final integration/fidelity review requires C5 at `xhigh`.
4. If a tier/model/effort is unavailable, report that limitation. Use an available same-or-higher tier where the host supports it; never silently downgrade or claim unavailable delegation. If delegation is unavailable, explain briefly and proceed sequentially where capable.
5. Return changed files, rationale, commands actually run, results, and unresolved risks. Report blocked browser/render checks as blocked, not passed. Reviewers report findings first and do not edit a worker's owned files until ownership transfers.

Assignment tiers remain: inventory and workflow documentation C1; architecture C5; CLI/runtime and migrations C3; voice/cache/dependencies and asset cleanup C4; independent voice/dependency/cleanup review C4 at `xhigh`; final architecture/fidelity review C5 at `xhigh`.

## Rules that apply to both providers

- Keep HyperFrames pinned exactly at `0.8.210` unless an intentional upgrade is approved and verified.
- Animate from the timeline. Do not add CSS transitions/animations, timers, wall-clock time, or unseeded randomness.
- Never hand-edit generated files under `.cache/build/<id>/`; edit source/config and regenerate.
- Preserve Supertonic-3 voice identity: MOG `M1`, WEC `F2`, BOG `M4`. Files mode uses episode recordings under `voice-lines/`.
- Keep the lower ~15% and right ~120 px of the 1080×1920 frame clear of UI overlays.
- Add a source in the episode script for each financial figure or claim. Investment topics retain “Bukan saran investasi”.
- The current output format is fixed at 1080×1920, 30 fps. Profiles are `modern` and `legacy-inflasi`; arbitrary palettes are not configurable.
- `render` ensures missing or stale voice is generated/reused. `sync`, `preview`, `stills`, `lint`, and `check` never synthesize and require a valid voice cache. `clean` is dry-run by default; voice caches cannot be cleaned, including through an explicit target.
- Finished outputs are `out/result/<NN>-<id>-short.mp4`; diagnostic frames are under `.cache/stills/<id>/`. Old per-episode `renders/` folders are legacy.
- Commit only when the user asks, and never add a Claude co-author line.
