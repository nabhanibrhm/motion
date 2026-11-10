# motion

Bahasa Indonesia short videos (14 episodes so far), generated through one shared HyperFrames application. Episode source lives in `episodes/<NN>_<id>/`; generated HyperFrames projects and diagnostic stills live under `.cache/`; finished mastered videos go to `out/`.

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

Run the test suite with `npm test` (root only). It includes a guard test that fails when voice output-affecting code changes without a matching bump in `tools/voice/versions.json`.

In the current refactor environment, a fresh `npm ci` could not complete because network access was unavailable. The existing root Node dependencies matched the lockfile and were reused; Python 3.12 `pip check` passed.

## Episodes

List configured episodes and validate their manifests:

```powershell
node scripts/motion.mjs list
node scripts/motion.mjs validate --all
```

`validate --all` also checks that episode ids and numbers are unique across episodes.

### Creating an episode

Create a starter episode with a lowercase id and title. The CLI chooses the next available episode number unless `--number` is supplied:

```powershell
node scripts/motion.mjs new umumnya --title "Topik Episode Berikutnya" --category Ekonomi_keuangan --number 8
```

`new` builds from a format folder in `config/formats/<name>/` (`format.json` plus a `files/` tree; `{{id}}`, `{{number}}`, `{{title}}`, `{{category}}`, `{{caseId}}` and `{{steps}}` are substituted):

| Option | Result |
|---|---|
| (none) or `--format default` | One shared title-card scene, `modern` runtime. Output is unchanged from earlier versions. |
| `--format hotwizz-flash` or `--flash` | HotWizz Flash skeleton: hotwizz theme, Nisa (`wec`) on Cartesia, five `hw-*` scenes (see "HotWizz Flash"). `--flash` and `--format hotwizz-flash` are the same; do not combine `--flash` with another format. |
| `--format kasus` | KASUS explainer: four wrapped `.js` scenes (`hook`, `fakta`, `sisi`, `vonis`), `transit` theme, narrators `mog`, `wec`, `bog` on Cartesia, case verdict and cover. Category `Hukum`. Set the case name in `runtime.case.name` (the scaffold has the placeholder `GANTI NAMA KASUS`). |

Case numbers differ by format. Plain `new` (default format) sets `runtime.case.id` to `KASUS #<episode number>`. The `kasus` format uses the next free `KASUS #NN` (highest existing KASUS number plus one). `--flash` numbers `HOTWIZZ #NN` by counting existing hotwizz-theme episodes. Check the printed case id after creating an episode.

The manifest's `category` is descriptive; episode listing is not filtered by category. Edit `episodes/<NN>_<id>/episode.json`, `narration.json`, `script-short.md`, and authored scene files under `scenes/`. Each narration section needs a matching scene entry in the same order. Episode numbers produce output names such as `08-umumnya-short.mp4`.

### Scenes

Each manifest scene entry chooses one implementation:

```json
{ "id": "cek", "file": "scenes/cek.html" }
{ "id": "cek", "file": "scenes/cek.js", "bg": "#dfe8ee", "sfx": [{ "at": "word:empat", "file": "click", "vol": 0.22 }] }
{ "id": "hook", "template": "title-card", "props": { "title": "Example" } }
```

- **`.html`**: hand-written HyperFrames scene, the original contract (`F1.scene`, `F1.at`, `data-at` anchors).
- **`.js`**: wrapped scene. The file holds only the scene body and one `scene((f, ctx) => markup, opts?)` call; the build wraps it in the same composition skeleton as `.html` scenes. Optional `bg` (`#rrggbb`, default `#000000`) sets the scene background. Optional `sfx` is a list of `{at, file, vol}`: `at` is an anchor (`word:x`, `line:N`, a bare word, or a frame number), `file` is a sound in `assets/shared/sfx/` or the episode's `sfx/` folder (no extension), `vol` is 0 to 1. Each entry becomes an audio clip on the scene's timeline; at most 16 per scene.
- **template**: a shared template from `src/templates/registry.mjs`.

`bg` and `sfx` are rejected on `.html` and template scenes. Validation checks that a `.js` file has exactly one `scene(` call, that every `sfx` file exists, and that cue anchors refer to words or lines that exist in the narration.

### Themes and palette

`runtime.palette` overrides the colours the runtime uses. It takes only these keys, each a `#rrggbb` value: `bg`, `paper`, `ink`, `muted`, `source`, `red`, `accent`, `teal`, `tealDark`, `drift`, `haze`. Unset keys keep the defaults. Scenes read the merged palette as `F1.PAL` (also passed as `PAL` in `F1.sceneCtx`).

A manifest may name a theme file under `config/themes/<name>.json` with the top-level `theme` key. Themes set supported values such as `runtime.palette`, `runtime.case` and audio/voice defaults. Bundled themes: `hotwizz` (HotWizz Flash), `transit` and `warm-desk` (palette sets). The output size is still fixed at 1080×1920, and the palette cannot add keys.

The episode's `runtime.case.name` is shown on the verdict and cover cards through `C.CASE.name`.

### Runtime and helpers

The current renderer supports 1080×1920 at 30 fps (default) or 60 fps (opt-in with `video.fps: 60`, currently episodes 06, 07, 12 and 13). At 60 fps, scenes receive a fractional `f` in 30-fps timeline frames; never use `f % N`, integer-frame triggers or `f` as an array index without rounding.

Runtime profiles are `modern` and `legacy-inflasi`. Add episode-specific assets in `episodes/<NN>_<id>/assets/`; they override shared assets at matching paths in `assets/shared/`. List additional assets that are not discovered from scene references in the manifest's `assets` array, using paths relative to the asset root.

Shared helpers available to scenes (`src/runtime/f1/`, `src/templates/hotwizz-kit.js`):

| Helper | Use |
|---|---|
| `F1.PAL` | Frozen palette (see "Themes and palette"). |
| `F1.fmt.id(v, d)`, `F1.fmt.rp(v, d)` | Indonesian number format: `1.234.567`, decimals with a comma (`1.234,50`), and `Rp1.234`. |
| `F1.countUp(f, at, frames, from, to, ease)` | Value easing from `from` to `to`; round it yourself for integers. |
| `F1.sceneCtx(id, S, D)` | Context passed to `F1.scene`'s render: `{ S, D, id, n, w, C, W, PAL, FONT }`. |
| `C.card(f, {at, x, y, w, kicker, big, sub, src, tone, bigSize})` | Sourced card. |
| `C.verdict(f, S, {at, bg, top, gap, stamp, name, slogan, ask, source})` | Case-closing screen; the stamp (default `KASUS DITUTUP`) lands on `at` (default `word:ditutup`). Shows `C.CASE.id · name`. |
| `C.cover(f, S, {at, bg, stamp, lines, accent, art, gap})` | Title-only cover card (z 50, inside y 240-1680), placed after the last line by default. |
| `W.checklist(f, {x, y, w, title, items, ticks, tone, size, check})` | Card whose items slide in and get ticked. |
| `W.drift(f, {seed, count, y0, y1, color, a})`, `W.sweep(f, {color, a, y0, y1})` | Background light motes and light beam (byte-identical to the former copies in HotWizz/posted scenes). |

Helpers are pure functions of the frame. Do not use `Math.random`, timers, or CSS transitions/animations.

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

### Voice cache (state v4)

The voice cache lives in `.cache/voice/<id>/` (`manifest.json`, `state.json`, section audio). `state.json` is version 4. Its key covers the canonical narration content (text, speakers, chapters, defaults, and only the speakers the episode uses, with their provider settings), the versions in `tools/voice/versions.json`, the pinned voice packages from `requirements-lock.txt`, the Whisper model, and clip hashes for `files`/`cartesia` sources. Comments, unused speakers, the yt-dlp pin and whole-file hashes of the Python tools are no longer part of the key.

A cache stamped v3 (or older) is stale. `render` will regenerate it, and a Supertonic episode will then be re-synthesised. To avoid that, re-key the cache first with one of these flags (each runs `voice <id>` and never bills Cartesia unless you omit the offline flags):

| Flag | Use it when | What it does |
|---|---|---|
| `voice <id> --restamp` | Default for an older cache. | Reproduces the cache offline from its existing caches. If the result is byte-identical (manifest without `speakers`, every section mp3), it writes only the new `state.json` and keeps the audio. It refuses when anything differs. |
| `voice <id> --adopt` | Restamp refuses and the cache cannot be regenerated. | Verifies the manifest and mp3 hashes against the old state and that the manifest matches the current narration (sections, chapters, speakers, marker-stripped texts, provider settings). Stamps v4 with `restamp.mode: 'adopted'`. |
| `voice <id> --adopt-structural` | Files or Cartesia episodes only, and `--adopt` cannot match. | Adopts when the layout rebuilt from the clips matches the manifest. |
| `voice <id> --offline` | You need the cache updated from local data only. | Local caches only: no Cartesia API calls, no Supertonic synthesis. It fails with a message when a Cartesia line has no local clip; run without `--offline` for that. |

`--force` cannot be combined with `--restamp`, `--adopt`, `--adopt-structural` or `--offline`. Only one of these flags may be used at a time.

### Batch runs and render output

`--all` works with `validate`, `voice`, `sync`, `lint`, `check`, `render` and `clean`. A failing episode does not stop the run. A per-episode table follows, and the exit code is 1 if any episode failed.

`render` prints a QA line for the mastered file: duration, fps, frame count, integrated loudness (LUFS), true peak (dBTP), loudness range (LRA) and size. It warns when the measured loudness is more than 1 LU from the target. If `out/uploaded/<same name>` already exists, it prints an "already posted" notice and leaves that file untouched. Never master into `out/uploaded/`.

### Cleanup

```powershell
node scripts/motion.mjs clean <id>
node scripts/motion.mjs clean <id> --dry-run --target build
node scripts/motion.mjs clean <id> --execute --target build
```

`clean` is a dry run by default and lists the build and still paths it would remove. It also lists stale voice temporary files (`.cache/voice/<id>-tmp-*` and `-previous-*` leftovers) as "stale voice temp (not removed)"; these are reported only and never deleted by `clean`. Voice caches are always protected, and the CLI rejects `clean --target voice`. Regression captures under `.cache/regress/` are not cleanup targets either.

### Regression harness

`scripts/regress.mjs` replaces `scripts/verify-migration.mjs` for scene checks. It needs no voice cache for the markup checks and writes under `.cache/regress/<label>/`:

```powershell
node scripts/regress.mjs capture <id>|--all --label base [--timing synthetic|voice] [--force]
node scripts/regress.mjs compare <id>|--all --label after [--timing synthetic|voice] [--dump]
node scripts/regress.mjs stills <id> --label after [--times-from base]
node scripts/regress.mjs stills-compare <id> --base base --after after [--ssim 0.9995]
```

- `capture` and `compare` record each scene's draw output hashes at sampled frames, plus caption and timeline hashes. `--timing synthetic` derives timings from the narration (deterministic, no voice needed). `--timing voice` uses the voice cache.
- `stills` captures motion stills and needs a valid voice cache. `stills-compare` compares two label sets by SSIM.
- Use `--dump` with `compare` to write the differing samples for inspection.

## Cartesia voice (`narration.source: "cartesia"`)

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

## HotWizz Flash (breaking news in ≤30 minutes)

A Flash episode is 45–60 s (6–7 lines), one narrator (Nisa, `wec`, Cartesia), 30 fps, no baked bed, and has **no hand-drawn scenes**: every scene is a shared `hw-*` template filled from `episode.json` props (`src/templates/hotwizz.mjs`, browser kit `src/templates/hotwizz-kit.js`). Neutrality rules from HANDOFF.md still apply: two outlets per claim, equal card/photo treatment for every side, attributed readings, "tersangka" + praduga tak bersalah.

News-day recipe (times from an approved script):

1. **Scaffold (1 min).** `git pull`, check the highest episode number on `origin`, then `node scripts/motion.mjs new <id> --title "Judul" --flash`. This writes the hotwizz theme, `HOTWIZZ #NN` (counted from existing hotwizz episodes), `audio.bed: null`, 30 fps, `narration.source: "cartesia"` with speaker `wec`, and five scenes: `hook` (hw-hook), `resmi` (hw-resmi), `belum` (hw-split), `kutipan` (hw-quote, optional) and `penutup` (hw-cover). Plain `new` without `--flash` is unchanged.
2. **Narration + sources (5 min).** One line per section in `narration.json` (hook as one chunk, no `[pause]`, few commas; keep `after: 1.2` on the last line for the cover). Sources table S1–Sn in `script-short.md`. To drop the quote, delete the `kutipan` scene and section and set `runtime.case.steps` to 4; to add a number card, add an `hw-number` scene with a matching section.
3. **Photos (5 min, optional).** Put graded 450×600 crops in `assets/shared/people/<slug>.jpg` (rules in `assets/shared/people/README.md`), set `person.photo` and `person.credit`. Without a photo use `"photo": null` for the silhouette, for everyone in the video.
4. **Fill props (8 min)** and `node scripts/motion.mjs validate <id>`. Validation names unknown props, missing photos, photos without credit and cue words not in the narration.
5. **Voice (2–3 min, Cartesia credits).** `node scripts/motion.mjs voice <id>`.
6. **Stills (≈1 min).** `node scripts/motion.mjs stills <id> --at 0,<a few times>,<last second>`; frame 0 must show the claim, the last second the cover. `sync` takes <1 s and 15 stills about 13 s.
7. **Render (5–8 min)** `node scripts/motion.mjs render <id>`, then caption in `out/caption/`.

### Retention rules (from `rans`, 10 Nov 2026)

`rans` held its hook, then viewers left at 0:14 (average watch 14 s of 83 s, 3.7% full) during a setup line over an empty table; `hapus` showed the same late-post drop. Every HotWizz (and KASUS hook) follows these:

1. **Freshness gate.** Post within about 12 h of the story breaking. If it would go up later than about 12–18 h, skip it or find a new angle (a response, a new number).
2. **Shock fact by second 5.** The hook line carries the most specific, surprising fact (a number on a named thing, e.g. "Rp575 juta untuk Instagram Story"), not only the headline total. Frame 0 shows it.
3. **No setup line after the hook.** The line after the hook is already a number, a name or a concrete fact on screen; never a "who researched what" line. Attribution ("temuan ICW", "kata polisi") goes in the kicker, tag or source line, not in its own spoken sentence.
4. **Something new on screen every ~3 s.** No scene sits on an empty or placeholder layout for more than ~3 s; the first card or row lands on the line's first word.
5. **45–60 s, 6–7 lines.** Cut background lines first; the caption carries the detail and the full sources.
6. **Check stills at 0, 5 and 10 s** before rendering: each must show a different concrete fact.
7. After posting, record views at 1 h and 2 h plus average watch time and % full; under ~200 views at 2 h means no push.

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

Finished outputs are `out/<NN>-<id>-short.mp4` (not posted yet) and `out/uploaded/` (posted). Review status and episode-specific notes are in [HANDOFF.md](HANDOFF.md). Before publishing, include the full sources list from the episode's `script-short.md` in the video description.

Engineering contracts and the refactor v2 record: [docs/refactor-design.md](docs/refactor-design.md) and [docs/refactor-v2/results.md](docs/refactor-v2/results.md).
