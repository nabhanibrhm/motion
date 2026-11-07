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

## HotWizz Flash (breaking news in ≤30 minutes)

A Flash episode is 45–70 s, one narrator (Nisa, `wec`, Cartesia), 30 fps, no baked bed, and has **no hand-drawn scenes**: every scene is a shared `hw-*` template filled from `episode.json` props (`src/templates/hotwizz.mjs`, browser kit `src/templates/hotwizz-kit.js`). Neutrality rules from HANDOFF.md still apply: two outlets per claim, equal card/photo treatment for every side, attributed readings, "tersangka" + praduga tak bersalah.

News-day recipe (times from an approved script):

1. **Scaffold (1 min).** `git pull`, check the highest episode number on `origin`, then `node scripts/motion.mjs new <id> --title "Judul" --flash`. This writes the hotwizz theme, `HOTWIZZ #NN` (counted from existing hotwizz episodes), `audio.bed: null`, 30 fps, `narration.source: "cartesia"` with speaker `wec`, and five scenes: `hook` (hw-hook), `resmi` (hw-resmi), `belum` (hw-split), `kutipan` (hw-quote, optional) and `penutup` (hw-cover). Plain `new` without `--flash` is unchanged.
2. **Narration + sources (5 min).** One line per section in `narration.json` (hook as one chunk, no `[pause]`, few commas; keep `after: 1.2` on the last line for the cover). Sources table S1–Sn in `script-short.md`. To drop the quote, delete the `kutipan` scene and section and set `runtime.case.steps` to 4; to add a number card, add an `hw-number` scene with a matching section.
3. **Photos (5 min, optional).** Put graded 450×600 crops in `assets/shared/people/<slug>.jpg` (rules in `assets/shared/people/README.md`), set `person.photo` and `person.credit`. Without a photo use `"photo": null` for the silhouette, for everyone in the video.
4. **Fill props (8 min)** and `node scripts/motion.mjs validate <id>`. Validation names unknown props, missing photos, photos without credit and cue words not in the narration.
5. **Voice (2–3 min, Cartesia credits).** `node scripts/motion.mjs voice <id>`.
6. **Stills (≈1 min).** `node scripts/motion.mjs stills <id> --at 0,<a few times>,<last second>`; frame 0 must show the claim, the last second the cover. `sync` takes <1 s and 15 stills about 13 s.
7. **Render (5–8 min)** `node scripts/motion.mjs render <id>`, then caption in `out/caption/`.

Template props (`*text*` marks an accent colour, `\n` a line break; a cue is a spoken word, or `word:x#1`, `line:0`, `line:0:end`, `word:x+6`, or a frame number; without cues items reveal evenly; every template also takes `label` (progress strip text), `step`, `sfx: false`):

| Template | Props |
|---|---|
| `hw-hook` | `headline`, `claim`, `person {name, role?, status?, photo?, credit?}`, `kicker?` (bar, default UPDATE), `tag?`, `cue?` (headline pop), `stamp? {text, cue}` (beside the name, never on a face). Everything is visible at frame 0. |
| `hw-resmi` | `items` 2–4 × `{text, source, cue?}`, `title?` (YANG RESMI), `kicker?` |
| `hw-split` | `left {title? = RESMI, items 1–4 × {text, source?, cue?}}`, `right {title? = BELUM JELAS, items}`, `headline?`, `source?`, `kicker?`. Both columns have the same size and style. |
| `hw-quote` | `person`, `quote`, `source`, `date?`, `cue?`, `kicker?` |
| `hw-number` | `value` (e.g. `"20.980"`, `"Rp1,5 T"`), `caption`, `source`, `unit?`, `cue?`, `countUp?` (default true), `kicker?` |
| `hw-cover` | `cover {title, chip?, stamp? = case id}`, `lines` 0–6 × `{text, cue?, style? big|text|kicker|chip|cta}`, `footer?`, `coverAt?`. The title-only cover starts 4 frames after the last word, inside the 3:4 crop. |

```json
"scenes": [
  { "id": "hook", "template": "hw-hook", "props": { "headline": "NAMA TOKOH\n*KLAIM UTAMA*", "claim": "Kata sumber: *angka* atau klaim", "tag": "KATA POLISI", "person": { "name": "Nama Tokoh", "role": "Jabatan", "photo": "people/nama-tokoh.jpg", "credit": "Pemotret via Wikimedia Commons (CC BY-SA 4.0)" }, "cue": "klaim" } },
  { "id": "resmi", "template": "hw-resmi", "props": { "items": [ { "text": "Fakta *pertama*", "source": "Kompas, detik (7 Nov)", "cue": "pertama" }, { "text": "Fakta kedua", "source": "Antara, CNN Indonesia", "cue": "kedua" } ] } },
  { "id": "belum", "template": "hw-split", "props": { "left": { "items": [ { "text": "Yang dikonfirmasi", "source": "Kompas" } ] }, "right": { "items": [ { "text": "Alasan belum dijelaskan", "cue": "alasan" } ] } } },
  { "id": "kutipan", "template": "hw-quote", "props": { "person": { "name": "Nama", "role": "Jabatan", "photo": null }, "quote": "Kutipan persis.", "source": "Kompas", "date": "7 Nov 2026" } },
  { "id": "penutup", "template": "hw-cover", "props": { "lines": [ { "text": "INGAT", "style": "kicker" }, { "text": "*PRADUGA* TAK BERSALAH" }, { "text": "FOLLOW UNTUK UPDATE", "style": "cta", "cue": "follow" } ], "cover": { "title": "NAMA TOKOH\n*KLAIM UTAMA*", "chip": "INI YANG RESMI" } } }
]
```

## Current production set

The seven finished outputs are `01-inflasi-short.mp4` through `07-kelas-short.mp4` under `out/`. Review status and episode-specific notes are in [HANDOFF.md](HANDOFF.md). Before publishing, include the full sources list from the episode's `script-short.md` in the video description.
