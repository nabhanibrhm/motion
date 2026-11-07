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

### Cartesia voice (`narration.source: "cartesia"`)

`voice <id>` (and `render`) synthesise each line through the Cartesia API into `episodes/<NN>_<id>/voice-lines/<section>-<i>.wav`, then align them exactly like `source: "files"`. Put `CARTESIA_API_KEY=...` in the git-ignored root `.env` (each machine needs its own). Billing is one credit per character; the CLI prints the estimate before calling the API. Each clip's cache key (spoken text, voice, model, language, speed, sample rate, dictionary content) is recorded in `voice-lines/cartesia.json`, so only changed lines are re-synthesised; commit the clips with that file. `voice <id> --force` re-synthesises and re-bills every line. A clip in `voice-lines/` that the provider did not make stops the run instead of being overwritten.

```json
{
  "source": "cartesia",
  "cartesia": { "model": "sonic-3.6", "language": "id-ID", "speed": 1, "dictionary": "config/cartesia-pronunciation.json", "say": {} },
  "speakers": { "wec": { "cartesia": { "voice": "f3b7c445-d015-40f7-a665-9595e0bc0c90" } } }
}
```

The `cartesia` block and each speaker's `cartesia.voice` are optional: defaults are the values shown, and voice ids come from `config/speakers.json` (Nisa/`wec` = Intan; Muklis/`mog` and Beni/`bog` stay `null` until chosen, and the provider stops if a speaker without an id has a line). Top-level `say` is for Supertonic and is ignored; `cartesia.say` respells whole words before synthesis. `[pause]` markers are dropped as in files mode. The pronunciation dictionary is a JSON array of `{"text", "pronunciation"}` (IPA as `<<k|a|ʔ|ɛ|r|ˈ|ɛ|l>>` or sounds-like text); it is uploaded once per content as `motion-<hash>` and passed as `pronunciation_dict_id`; `"dictionary": null` turns it off.

Helpers: `.venv/Scripts/python tools/voice/cartesia.py voices [--gender masculine]` lists Indonesian voices; `... samples [--gender masculine] [--limit 4]` writes one sample per voice to `%TEMP%/motion-cartesia-samples/` (about 120 credits each); `... dict` prints the dictionary id.

For batch commands that support it, use `--all`, for example `node scripts/motion.mjs validate --all` or `node scripts/motion.mjs render --all`. Inspect cleanup targets before executing cleanup:

```powershell
node scripts/motion.mjs clean <id>
node scripts/motion.mjs clean <id> --dry-run --target build
node scripts/motion.mjs clean <id> --execute --target build
```

Build and still caches can be removed explicitly. Voice caches are valuable generated speech and are always protected; the CLI rejects `clean --target voice`. Migration evidence and original source archive under `.cache/migration-baseline/` are not cleanup targets.

## Current production set

The seven finished outputs are `01-inflasi-short.mp4` through `07-kelas-short.mp4` under `out/`. Review status and episode-specific notes are in [HANDOFF.md](HANDOFF.md). Before publishing, include the full sources list from the episode's `script-short.md` in the video description.
