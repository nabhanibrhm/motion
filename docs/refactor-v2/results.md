# Refactor v2: delegation and verification record (9 Nov 2026, WSL laptop)

Plan and contracts: [plan.md](plan.md). Audits with file:line evidence: [audit-engine.md](audit-engine.md), [audit-scenes.md](audit-scenes.md). Nothing was committed during the refactor.

## Delegation (actual runs; Max effort never used)

| Task | Model / effort | Owned files | Result |
|---|---|---|---|
| Audit: engine, pipeline, voice | Opus 5.5 / high | read-only | audit-engine.md |
| Audit: scene duplication | Sonnet 5.5 / high | read-only | audit-scenes.md |
| Architecture and task plan | Opus 5.5 / high | read-only | plan.md |
| T1 voice cache key v4, restamp/adopt/offline, seeding | Opus 5.5 / high | src/pipeline/voice.mjs, tools/voice/{generate,cartesia}.py, tools/voice/versions.json, voice flags in scripts/motion.mjs, voice tests | done; fixed Review A H1/H2/M1/L2/L3/L6 |
| T2 master QA and output safety | Opus 5.5 / high | src/pipeline/{master,storage}.mjs, tests/master-storage.test.mjs | done |
| T3 regression harness | Sonnet 5.5 / high | scripts/regress.mjs, tests/regress.test.mjs | done |
| Review A: voice, deps, cache, cleanup, output safety | Opus 5.5 / high | read-only | OK for restamp/offline after fixes |
| T4 runtime helpers | Sonnet 5.5 / high | src/runtime/**, src/templates/hotwizz-kit.js, tests/runtime-helpers.test.mjs | done |
| T5 config, strict schema, scene wrapper, palette themes | Sonnet 5.5 / high | src/config/**, src/pipeline/build.mjs, src/templates/scene-wrapper.mjs, config/themes/{warm-desk,transit}.json, scripts/regress.mjs, schema/wrapper tests | done |
| T6 CLI, formats, batch, signals, locks | Sonnet 5.5 / high | scripts/motion.mjs, src/pipeline/lock.mjs, config/formats/**, CLI tests, scaffold goldens | done |
| T7 DRIFT/SWEEP dedupe in posted 12, 13, 14 | Sonnet 5.5 / high | episodes/12_hapus, 13_krl, 14_kerja scenes | done, pixel-identical |
| Review B: architecture and fidelity | Opus 5.5 / high | read-only | accept with fixes (no Critical/High) |
| Fix: voice lock, lock race, platform | Opus 5.5 / high | src/pipeline/{voice,lock}.mjs, tests/lock.test.mjs | done |
| Fix: CLI exit code, schema file paths, kasus safe zone, placeholder warning | Sonnet 5.5 / high | scripts/motion.mjs, src/config/validate.mjs, config/formats/kasus/**, tests | done |
| T8 docs | Haiku 5.5 / default | README.md, CLAUDE.md, ai-routing.md, docs/refactor-design.md, HANDOFF.md | this pass |

Coordinator (Opus 5.5): snapshots, restamp/offline voice runs, baselines, gates, renders.

## Verification (commands actually run)

- Start: `npm test` 29/29, `validate --all` 14 valid, HyperFrames 0.8.210.
- End: `npm test` **96/96** (16 test files), `validate --all` 14 ok, HyperFrames 0.8.210.
- Voice: `voice sadap|ksp|hapus --restamp` -> "restamped (reproduced)"; audio and manifest bytes identical to backup (sha256). `voice diskon|krl|kerja --offline` with a dead HTTPS proxy and no API key: 17/19/14 lines unchanged, 0 credits, ~35-46 s local alignment each, no file under episodes/ changed. Narration lengths match the existing masters (130.0, 123.8, 104.3, 80.5, 155.6, 110.7 s).
- `sync --all --check`: 6 ok (sadap ksp hapus diskon krl kerja), 8 "voice cache missing" (01-08 have no cache on this laptop).
- Markup regression (`scripts/regress.mjs`, every scene's draw() at sampled frames, captions, timeline, SFX): baseline `base` captured before any runtime change; final compare synthetic timing 14/14 PASS (94 scenes, 10,116 samples), real voice timing 6/6 PASS.
- Pixel regression: baseline stills captured twice (noise floor: identical). After Stage 2 all 104 stills of 6 episodes byte-identical (framemd5). After the 12-14 dedupe, 55 stills of hapus/krl/kerja identical. Final spot check ksp 15/15 and kerja 19/19 identical.
- Lint: 0 errors for the 6 cached episodes.
- Representative renders (`render --no-master`, then masterVideo into `.cache/regress/render/`, never `out/`): krl 60 fps, 9,336 frames, 155.61 s, -14.0 LUFS, -1.0 dBTP, LRA 2.8, render 480 s; kerja 30 fps, 3,322 frames, 110.74 s, -14.0 LUFS, -1.0 dBTP, LRA 2.2, render 173 s. 10 render frames vs baseline stills: SSIM 0.985-0.993.
- Invariants: `out/` and `out/uploaded/` sha256 unchanged; voice cache bytes unchanged; chunk cache only gained files; tools/clip unchanged; no leftover locks.

## Measured code changes

- 42 tracked files changed (+1,349 / -322), plus new files: scripts/regress.mjs, src/templates/scene-wrapper.mjs, tools/voice/versions.json, config/formats/{default,hotwizz-flash,kasus}, config/themes/{warm-desk,transit}.json, 9 new test files, scaffold goldens.
- Posted episodes 12-14: 21 scenes, net -49 lines (pasted DRIFT/SWEEP removed).
- New `kasus` episode: 4 wrapped `.js` scenes, no engine code copied.

## Blocked / not verified here

- Pixel and render checks for 01-08: no voice cache on this laptop (Supertonic would make new takes). Markup-verified only.
- `--adopt` / `--adopt-structural` on real legacy caches: tested on fixtures only.
- Windows laptop: not run.
- `.cache/migration-baseline/` does not exist on this laptop.
