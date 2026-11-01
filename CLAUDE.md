# motion

Faceless short videos in Bahasa Indonesia, generated with HyperFrames 0.8.210, GSAP, Node.js 22+, and Python 3.12. **Read `HANDOFF.md` first.** For changes, read `ai-routing.md` and follow its provider-specific routing guidance.

One shared application and runtime serve all episodes. Authored episode data lives in `episodes/<id>/`; shared assets are in `assets/shared/`; generated projects and stills are under `.cache/`; mastered finished videos are in `out/result/`.

## Commands

Run commands from the repository root:

```powershell
node scripts/motion.mjs list
node scripts/motion.mjs validate --all
node scripts/motion.mjs voice <id>
node scripts/motion.mjs sync <id>
node scripts/motion.mjs preview <id>
node scripts/motion.mjs lint <id>
node scripts/motion.mjs stills <id> all
node scripts/motion.mjs render <id>
node scripts/motion.mjs clean <id>
```

See [README.md](README.md) for setup and the episode workflow. Create a starter episode with `node scripts/motion.mjs new <id> --title "Title" --category <category> [--number <n>]`. The manifest's `category` is currently descriptive; episode listing is not filtered by category. The CLI owns output naming from the episode number and id.

Source data belongs in `episodes/<id>/episode.json`, `narration.json`, `script-short.md`, and `scenes/`. Shared runtime and orchestration live under `src/runtime/`, `src/pipeline/`, `src/config/`, and `src/templates/`. Generated HyperFrames files under `.cache/build/<id>/` are disposable output; do not hand-edit generated copies.

The only supported video format is 1080×1920 at 30 fps. Runtime profiles are `modern` and `legacy-inflasi`; named config themes may set supported runtime/case/audio/voice values, but arbitrary palettes and output dimensions are not supported. See [docs/refactor-design.md](docs/refactor-design.md) for the current contracts and [docs/refactor-inventory.json](docs/refactor-inventory.json) for the captured before-state inventory.

Do not install dependencies separately in episode folders. Install Node dependencies once at the root with `npm ci` and use the root `.venv` with `requirements-lock.txt` for voice tooling. Do not delete `.cache/migration-baseline/`, imported voice caches, or authored source as routine cleanup. Commit only when requested; do not add a Claude co-author line.

`render` ensures missing or stale voice is generated/reused. `sync`, `preview`, `stills`, `lint`, and `check` require a valid voice cache and never synthesize. Cleanup is dry-run by default; `--dry-run` makes that explicit and `--execute` performs the displayed cleanup. Voice caches cannot be selected for cleanup.
