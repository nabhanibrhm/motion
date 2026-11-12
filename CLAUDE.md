# motion

Faceless short videos in Bahasa Indonesia, generated with HyperFrames 0.8.210, GSAP, Node.js 22+, and Python 3.12. **Read `HANDOFF.md` first.** For changes, read `ai-routing.md` and follow its provider-specific routing guidance.

One shared application and runtime serve all episodes. Authored episode data lives in `episodes/<NN>_<id>/`; shared assets are in `assets/shared/`; generated projects and stills are under `.cache/`; mastered finished videos are in `out/`: renders land in `out/` (finished, not uploaded yet), and when the user says a video is posted, Claude moves it to `out/uploaded/` (check first; never overwrite a file in `out/uploaded/`); captions live in `out/caption/`.

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
node scripts/motion.mjs new <id> --title "Title" --format kasus
```

See [README.md](README.md) for setup and the episode workflow. Create a starter episode with `node scripts/motion.mjs new <id> --title "Title" --category <category> [--number <n>] [--format default|hotwizz-flash|kasus]`; `--format kasus` is the KASUS series (next free case number). The manifest's `category` is currently descriptive; episode listing is not filtered by category. The CLI owns output naming from the episode number and id. Episode folders are named `<NN>_<id>` (e.g. `01_inflasi`); the prefix must match the manifest `number`, and commands, caches and outputs use the bare id (`render inflasi`, `.cache/voice/inflasi/`, `out/01-inflasi-short.mp4`).

Source data belongs in `episodes/<NN>_<id>/episode.json`, `narration.json`, `script-short.md`, and `scenes/`. Shared runtime and orchestration live under `src/runtime/`, `src/pipeline/`, `src/config/`, and `src/templates/`. Generated HyperFrames files under `.cache/build/<id>/` are disposable output; do not hand-edit generated copies.

The only supported video size is 1080×1920, at 30 fps (default) or 60 fps (opt-in with `video.fps: 60`, currently episodes 06, 07, 12 and 13). At 60 fps, scenes and the runtime still work in 30-fps timeline frames and receive a fractional `f`, so never use `f % N`, integer-frame triggers or `f` as an array index without rounding. Runtime profiles are `modern` and `legacy-inflasi`. `runtime.palette` accepts only the fixed key set (`bg`, `paper`, `ink`, `muted`, `source`, `red`, `accent`, `teal`, `tealDark`, `drift`, `haze`, each `#rrggbb`), and named config themes may set palette, case and audio/voice values; new palette keys and output dimensions are not supported. See [docs/refactor-design.md](docs/refactor-design.md) for the current contracts and [docs/refactor-inventory.json](docs/refactor-inventory.json) for the captured before-state inventory.

Do not install dependencies separately in episode folders. Install Node dependencies once at the root with `npm ci` and use the root `.venv` with `requirements-lock.txt` for voice tooling. Do not delete `.cache/migration-baseline/`, imported voice caches, or authored source as routine cleanup. Commit only when requested; do not add a Claude co-author line. When the user says "commit it", do three steps in this order: update `HANDOFF.md` with what changed, commit, then push to `origin`.

The user works from two laptops (Windows and a WSL work laptop) that share source only through GitHub; `out/` is not in git. Pull before starting work and check the highest episode number on `origin` before creating an episode. Before pushing, fetch and rebase if the other laptop pushed; on conflicts, compare both versions first and show the user what differs; use the work laptop's latest push as the reference only after that comparison, keeping anything from this side that the laptop version lacks.

`render` ensures missing or stale voice is generated/reused. `sync`, `preview`, `stills`, `lint`, and `check` require a valid voice cache and never synthesize. Cleanup is dry-run by default; `--dry-run` makes that explicit and `--execute` performs the displayed cleanup. Voice caches cannot be selected for cleanup.

## Content rules

These apply to every episode. Details and examples are in README "Retention rules" (HotWizz Flash section) and "KASUS casefile look".

- **Sources:** every claim needs two independent outlets or the primary text (UU, putusan), recorded in `script-short.md`. Otherwise drop it or attribute it ("kata …", "dikabarkan"). Keep a law's conditions and exceptions. Intent is not the official act ("niat mundur", not "resmi mundur").
- **Wording:** neutral and attributed. Never name platforms or companies ("e-commerce", "aplikasi"). Censor sensitive words, with no gambling-style hooks. Investment topics carry "Bukan saran investasi"; legal topics carry "bukan nasihat hukum".
- **Hook:** frame 0 shows the hook's claim or number, and the shock fact lands by second 5. No setup line after the hook (attribution goes in the kicker/tag), and something new on screen every ~3 s. Check stills at 0, 5 and 10 s (three different facts) and the last frame before rendering.
- **Length and shape:** HotWizz runs 45–60 s with 6–7 lines and posts within ~12 h of the story. Keep procedure explainers to one line or an on-screen beat (news viewers leave there). Put the comment question where most viewers still are, not only at the end.
- **Cover:** every video ends on a title cover card for the last ~1 s; it is the TikTok cover. The cover shows the subject's photo: the named person for HotWizz (`hw-cover` `cover.person`, credited in the caption), or the subject object shown large for KASUS. HotWizz loops: `introCover: true`, so frame 0 equals the last frame.
- **Voice:** never end a narration line on a spoken number (aligner bug). Write numbers as words and use the `say` map for acronyms. Cartesia costs credits, so voice only with the user's go-ahead and re-voice only the changed lines.
- **Look:** HotWizz uses the minimal look (near-black, off-white, one red, B&W photos except the person quoted; the flag is always `#e70011` over `#ffffff`). KASUS uses the casefile look (theme `casefile`; red only for stamps, pen marks and strikes). Keep the lower ~15% and the right ~120 px clear.
- **Caption:** at most 700 characters (count it before handing it over; emoji and hashtags count). Keep the sources line short (notice + outlet names), plus the disclaimer and the comment question.
- **Posting:** 1–2 posts a day, at least 3–4 h apart, never while another video is spiking. Record views at 1 h and 2 h plus average watch time and % full.

## Voice code

After editing voice code (`tools/voice/**`, `src/pipeline/voice.mjs`), run `npm test`; its guard test fails when output-affecting code changes without a bump. Bump `tools/voice/versions.json` only when the user asks for it.
