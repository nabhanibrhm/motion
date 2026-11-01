# motion

Seven Bahasa Indonesia short videos, generated through one shared HyperFrames application. Episode source lives in `episodes/<NN>_<id>/`; generated HyperFrames projects and diagnostic stills live under `.cache/`; finished mastered videos go to `out/`.

## Setup

Requirements: Node.js 22+, Python 3.12, and FFmpeg/ffprobe available on `PATH` for voice audio decoding, mastering, and media inspection. Install the Node dependencies once at the repository root.

```powershell
npm ci
py -3.12 -m venv .venv
.venv\Scripts\python -m pip install -r requirements-lock.txt
```

On Linux, use the matching Python 3.12 tools and activate the root environment:

```bash
npm ci
python3.12 -m venv .venv
.venv/bin/python -m pip install -r requirements-lock.txt
```

The Python lock is `requirements-lock.txt`; `requirements.txt` lists the direct dependencies. Voice synthesis also downloads Supertonic and Whisper model data on first use. If an episode was migrated, its original generated voice files and cache are reused when valid. If no valid voice cache exists, `voice` or `render` generates it. Voice files mode can use recordings under that episode's `voice-lines/` folder.

In the current refactor environment, a fresh `npm ci` could not complete because network access was unavailable. The existing root Node dependencies matched the lockfile and were reused; Python 3.12 `pip check` passed.

## Episodes

List configured episodes and validate their manifests:

```powershell
node scripts/motion.mjs list
node scripts/motion.mjs validate --all
```

Create a starter episode with a lowercase id and title. The CLI chooses the next available episode number unless `--number` is supplied:

```powershell
node scripts/motion.mjs new umumnya --title "Topik Episode Berikutnya" --category Ekonomi_keuangan --number 8
```

The starter manifest uses the selected descriptive category, the shared title-card scene, and the `modern` runtime profile. The category does not filter the episode list. Edit `episodes/<NN>_<id>/episode.json`, `narration.json`, `script-short.md`, and authored scene files under `scenes/`. Each narration section needs a matching scene entry in the same order. Episode numbers produce output names such as `08-umumnya-short.mp4`.

The current renderer supports 1080×1920 at 30 fps, with `modern` and `legacy-inflasi` visual profiles. A manifest may name a theme file under `config/themes/<name>.json`; the loader merges supported config values such as runtime profile/case, audio, and voice defaults. Arbitrary palette controls are not implemented. Add episode-specific assets in `episodes/<NN>_<id>/assets/`; they override shared assets at matching paths in `assets/shared/`. List additional assets that are not discovered from scene references in the manifest's `assets` array, using paths relative to the asset root.

## Voice, build, review, and render

```powershell
node scripts/motion.mjs voice <id>
node scripts/motion.mjs sync <id>
node scripts/motion.mjs preview <id>
node scripts/motion.mjs lint <id>
node scripts/motion.mjs stills <id> all
node scripts/motion.mjs render <id>
```

`voice` explicitly generates or reuses speech. `render` automatically ensures missing or stale voice before building. `sync`, preview, lint, still capture, and check require a valid voice cache and never synthesize. `sync` builds the disposable `.cache/build/<id>/` project. Stills go under `.cache/stills/<id>/`. Render produces a fresh raw video in the build cache and masters it into `out/<NN>-<id>-short.mp4`. Existing finished outputs are replaced only after a successful render/master operation.

For batch commands that support it, use `--all`, for example `node scripts/motion.mjs validate --all` or `node scripts/motion.mjs render --all`. Inspect cleanup targets before executing cleanup:

```powershell
node scripts/motion.mjs clean <id>
node scripts/motion.mjs clean <id> --dry-run --target build
node scripts/motion.mjs clean <id> --execute --target build
```

Build and still caches can be removed explicitly. Voice caches are valuable generated speech and are always protected; the CLI rejects `clean --target voice`. Migration evidence and original source archive under `.cache/migration-baseline/` are not cleanup targets.

## Current production set

The seven finished outputs are `01-inflasi-short.mp4` through `07-kelas-short.mp4` under `out/`. Review status and episode-specific notes are in [HANDOFF.md](HANDOFF.md). Before publishing, include the full sources list from the episode's `script-short.md` in the video description.
