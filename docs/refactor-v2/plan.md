# Refactor v2 plan (approved by lead; architect: Opus high)

Repo: /home/nabhan-smma/dev/personal/motion (branch hyperframes, WSL). Audits: scratchpad/audit-engine.md, scratchpad/audit-scenes.md (same folder as this file).
Global rules: no commits; never edit HANDOFF.md or tools/clip/** ; never write out/ or out/uploaded/ ; never delete voice caches; never run plain `voice` on Supertonic episodes (01-08); never call the Cartesia API; never run render/stills/voice on real episodes unless your task says so (coordinator does those). Edit only files you own. Run only your own tests plus `npm test`; report commands actually run and results. HyperFrames stays 0.8.210. No timers/wall-clock/unseeded random/CSS animation in runtime.
Note: `.cache/migration-baseline/` does not exist on this laptop.

## Facts verified by architect
- cartesia.py `cmd_lines` (229-274) calls the API only when `todo` non-empty; dry run for diskon/krl/kerja = all lines unchanged, 0 credits. BUT it always rewrites voice-lines/cartesia.json at the end (272-274) — verify/offline must not write it, and it should skip the rewrite when nothing changed.
- generate.py has one committed version (1f67202, sha256 7905da790a3bc097f182e4bf5dcaeeddc163afc998a00ed50834cf4ed4539422). All cached alignment `file-*` and pitch `pitch-*` records here are keyed with that GENERATOR_HASH. Supertonic `st2-*` keys never included it.
- Voice manifest `speakers` block is not read by runtime/templates.
- Strict schema must accept legacy keys: top-level `theme`, narration `comment`, speaker `voice`/`rate`/`pitch`, `say`, speaker `cartesia.speed`. All 94 scenes use only {id,file}.

## A. Contracts

### 1. Voice state v4 (T1)
state.json = { version: 4,
  inputs: { source,
    narration: sha256(canonical({source, chapters, defaults,
      sections:[{id, chapter, lines:[{speaker, text, after?}]}],
      say? (supertonic only), cartesia? (effective options minus dictionary path),
      dictionary? (cartesia only: entries whose lowercased text occurs in the episode lines or cartesia.say),
      speakers (USED speakers only, provider sub-block only: supertonic | cartesia) })),
    versions: {assembly, align, pitch?} from tools/voice/versions.json (pitch only for supertonic),
    packages: {name: pin} for faster-whisper, ctranslate2, numpy (+ supertonic, onnxruntime, praat-parselmouth for supertonic) parsed from requirements-lock.txt,
    whisper: <model>, sources: {clip: sha256} (files/cartesia only) },
  outputs: { manifest: sha256, files: {rel: sha256} },
  restamp?: {from: 3, mode: 'reproduced'|'adopted', at: ISO} }
- Dropped from key: comment, unused speakers, yt-dlp pin, whole-file hashes of cartesia.py/generate.py.
- same(ctx) -> {ok, reasons:[...]}; check-only errors name differing fields.
- versions.json: {"assembly":1,"align":1,"pitch":1,"guard":{"align":"<sha>","pitch":"<sha>","assembly":"<sha>"}} — guard = hashes of the output-affecting function groups; a test fails if those functions change without bumping.
- generate.py: ALIGN_TAG / PITCH_TAG replace GENERATOR_HASH in file-*/pitch-* keys. LEGACY_GENERATOR_HASHES = ("7905da79…full",): on miss under new key, look up old key and atomically copy to new name. Env MOTION_NO_SYNTH=1 fails before any Supertonic synthesis; MOTION_NO_MODELS=1 fails on any Supertonic/Whisper/PSOLA miss. Seed Supertonic per chunk `np.random.seed(int(key,16) % 2**32)` right before synthesize (new chunks only).
- Must NOT touch output-affecting logic: align, span, snap_onsets, speech_bounds, transcribe args, PSOLA body, build_section, level, encode, decode, manifest writer. Leave edge-tts code alone.
- cartesia.py `lines --verify`: no writes, exit 3 if any line not current; skip sidecar rewrite when unchanged.
- CLI flags: `voice <id> --offline` (Cartesia verify behaviour; local cache reuse OK; Supertonic gets MOTION_NO_SYNTH). `voice <id> --restamp`: reproduce into tmp with no network + MOTION_NO_MODELS, require tmp manifest (minus `speakers`) deep-equal existing and every section mp3 byte-equal, then write only new state.json (keep manifest+audio bytes). `voice <id> --adopt`: for legacy caches that can't be reproduced: verify outputs against old state (manifest+mp3 hashes), manifest sections/chapters/line speakers/marker-stripped texts equal current narration, used speakers' provider settings in manifest.speakers equal current; stamp v4 with restamp.mode='adopted'. --force incompatible with --restamp/--adopt/--offline.
- ensureVoice(ctx,{generate, force, checkOnly, offline=false, restamp=false, adopt=false, importLegacy}) -> {manifest, manifestPath, cacheHit, restamped?}. importLegacy stays (test seam).

### 2. Scene wrapper (T5)
Scene entry: { "id":"cek", "file":"scenes/cek.js", "bg":"#dfe8ee", "sfx":[{"at":"word:empat"|"empat"|"0", "file":"click", "vol":0.22}] }
- `.js` file = wrapped scene; `.html` keeps today's contract; bg/sfx rejected on .html and template scenes.
- Build emits <template>, <link f1.css>, #root style with background bg (default #000), #root and -art layer, one `<audio data-hf-media-start-basis="local" data-start="0" id="<scene>-sfx-<k>" class="clip" src="public/sfx/<file>.wav" data-at=… data-track-index="${20+index*16+k}" data-volume=vol>` per entry (k<16), then `<script>(()=>{const scene=(render,opts)=>{window.__timelines["ID"]=F1.scene("ID",render,opts);};\nBODY\n})();</script></template>`. Existing data-at rewrite fills data-start. (Match the exact skeleton the current .html scenes use — read several.)
- Export compositionSource(ctx, scene, index) from build.mjs; used by build and regress harness.
- Validator for .js: exactly one `scene(` call; validate sfx (anchor, file exists in shared or episode sfx/, vol 0..1); scan `w("x"[, n])` calls and "word:…"/"line:…" literals as anchors.

### 3. Runtime additions (T4) — additive only
- core.js: F1.PAL = Object.freeze({...DEFAULT_PAL, ...(F1.CONFIG?.palette||{})}); F1.fmt.id(v,d=0) = String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g,".") and for d>0 grouped integer + "," + toFixed(d) decimals; F1.fmt.rp(v,d)= "Rp"+id; F1.countUp(f,at,frames,from,to,ease=F1.expoOut); F1.sceneCtx(id,S,D) -> {S,D,id,n,w:(x,o=0)=>F1.wordFrame(S,x,o),C:F1.cine,W:F1.world,PAL:F1.PAL,FONT:{mono:"'JetBrains Mono', monospace",osw:"Oswald, sans-serif"}}; F1.scene uses it (existing {S,D} destructuring unaffected).
- Palette keys (fixed): bg, paper, ink, muted, source, red, accent, teal, tealDark, drift, haze. Defaults warm-desk: #f6efe1, #fffaf0, #2a2a2e, #6f6a66, #8a6f55, #c0392b, #c6f432; teal #3d7480, tealDark #2f6a6e, drift #8fd0d2, haze #c4d3dd. PALETTE_KEYS exported from src/runtime/timing.mjs; test asserts equals core.js DEFAULT_PAL keys.
- timing.mjs runtimeConfig emits palette only when set (watermark precedent); case passes through (case.name -> C.CASE.name).
- world.js: W.drift(f,{seed,count,y0,y1,color,a}) and W.sweep(f,{color,a,y0,y1}) byte-identical output to the pasted copies; W.checklist(f,{x,y,w,title?,items:[{t,s?,src?}],ticks:[frame],tone:'paper'|'dark',size=38,check?}) -> HTML.
- cine.js: C.card(f,{at,x,y,w,kicker,big,sub?,src?,tone,bigSize}); C.verdict(f,S,{at:'word:ditutup'|frame,bg=PAL.bg,top=360,gap=28,stamp='KASUS DITUTUP',name=C.CASE.name,slogan?,ask:{cue,kicker,big,sub?},source=true}) renders "${C.CASE.id} · ${name}"; C.cover(f,S,{at=lastLine.end+4,bg,stamp=C.CASE.id,lines:[{t,size?,accent?}],accent=PAL.red,art?}) z 50 inside y 240-1680. Continuous in f, no f%N.
- hotwizz-kit.js: use F1.world.drift/sweep, identical output.

### 4. Config (T5, formats T6)
- episode.json adds runtime.case.name, runtime.palette (PALETTE_KEYS, #rrggbb), runtime.watermark.height allowed, scene bg/sfx.
- config/themes/warm-desk.json and transit.json = {"runtime":{"palette":{…}}} (transit values from ep 13/14 scenes).
- Strict schema: allow-list per object (top, video, runtime, case, watermark, pulse, palette, audio, loudness, scene, sfx entry, narration, speaker, supertonic, cartesia, defaults, chapter, section, line); unknown keys fail with did-you-mean; include legacy keys.
- Canonical Supertonic voices from config/speakers.json, not hardcoded.
- validateEpisodes(ctxs): unique numbers and ids across episodes.
- Episode folder scan memoised per repoRoot with resetEpisodeCache().
- Formats (T6): config/formats/<name>/format.json {category, theme?, case:{prefix, counter:'number'|{theme}}, episode, narration} + config/formats/<name>/files/**; substitute {{id}} {{number}} {{title}} {{category}} {{caseId}} in parsed strings; case.steps = scene count. Formats: default (= today's new, byte-identical), hotwizz-flash (= --flash, byte-identical), kasus (new: .js wrapped scenes, theme, case.name, sfx in manifest, vonis.js using C.verdict + C.cover, Cartesia mog/wec/bog). `new <id> --format <name>`; --flash alias.

### 5. Regression harness (T3) scripts/regress.mjs — no voice cache needed
- capture <id>|--all --label L --timing synthetic|voice [--force]; compare <id>|--all --label L --timing …[--dump]; stills <id> --label L; stills-compare <id> --base A --after B [--ssim 0.9995].
- Synthetic timing from narration: 0.32 s/word (min 0.6 s/line) + defaults lead/tail/gaps; deterministic.
- Sample frames: 0,1,8,14,D/2,D-1, each word start ±1; for 60 fps also +0.5 at 0, D/2, first word start.
- Record per scene draw() output hashes, captionsHash, timelineHash; sourceHash informational.
- Output .cache/regress/<L>/…  (clean never touches it).
- Generalise the VM sampler in scripts/verify-migration.mjs.

### 6. Output safety (T2)
- measureMedia(path) -> {duration,fps,frames,lufs,truePeak,lra,size} via ffprobe + ebur128=peak=true. masterVideo returns {…, measured}. Honour FFMPEG/FFPROBE env. On EXDEV copy to tmp in output dir then rename. clean reports .cache/voice/<id>-tmp-* and -previous-* leftovers, never deletes. Mix graph unchanged.

## Stages
0 coordinator snapshots (done). 1: T1,T2,T3 parallel → Review A (Opus high) → 1b coordinator restamp/offline/baselines. 2: T4,T5 parallel → Gate 2. 3: T6,T7 parallel → Gate 3. 4: coordinator renders (krl 60fps, kerja 30fps, --no-master + manual master into .cache/regress/render/; never diskon/ump; never out/) → Review B. 5: T8 docs.

Deferred: DRIFT/SWEEP dedupe in 06/07; skeleton→.js migration of posted scenes; cover/hw-cover unification; ep-specific kits (CAL/ICON/BADGE, trains, bars); dead runtime pruning; migration-script archive/edge-tts/importLegacy removal; raw deletion, FLAC, declarative tighten, per-line dictionary key, requirements split; toLocaleString and f%2 in posted 01/02.
