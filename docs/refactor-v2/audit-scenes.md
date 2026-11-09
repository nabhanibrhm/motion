# Scene duplication audit (read-only), branch `hyperframes`

Scope: 94 scene files, 11,052 lines, 14 episodes (`episodes/<NN>_<id>/scenes/*.html`), plus `src/runtime/f1/*.js`, `src/templates/*`.
All numbers below were measured with grep/diff/python line comparison. "Dup lines" = lines that would disappear (redundant copies), not total occurrences.

## Ranking (dup lines x share of future episodes that benefit)

| # | Pattern | Dup lines (removable) | Copies | Future benefit | Score |
|---|---|---|---|---|---|
| 1 | Scene skeleton (`<template>/<link>/<style>#root/<div root>/<div -art>`) + `<audio>` SFX tags | 1204 skeleton + 530 audio = 1734 | 94 scenes | every episode | ~1730 |
| 2 | Pasted per-episode kits (ep14 68-line kit x8, ep13 three kits, 07/06 smaller) | ~770 | 8+3+2+2+... | generic parts only (CARD, CAL, ICON, BADGE, palette): ~half of future eps | ~385 |
| 3 | Scene prelude consts (`n`, `C`, `W`, `w()`, `mono`, `osw`, `INK`, `RED`) | ~380 | 94 | every episode | ~380 |
| 4 | DRIFT/SWEEP ambient helpers (+ 70 call lines) | 36 copies x 3 lines = ~105 defs + 70 calls = ~175 (~31 KB of text) | 35 scenes + hotwizz-kit | every bespoke episode since 06 | ~140 |
| 5 | Verdict end card (KASUS DITUTUP + case line + ask card + "SUMBER LENGKAP DI DESKRIPSI") | ~130 | 12 scenes | every episode | ~130 |
| 6 | Checklist card with ticking items | ~115 | 8 scenes | ~60% of episodes | ~70 |
| 7 | Title-only TikTok cover card | ~38 (+ 4 comment pairs) | 4 scenes | every episode (since 06) | ~38 |
| 8 | Raw "Sumber:" text lines | 79 one-liners (0 net line savings, ~10 KB) | 54 scenes | every episode | consistency only |
| 9 | Number formatters (`fmt`/`rp`/`idr`) | ~19 | 19 scenes | every episode | ~19 |
| 10 | Train/transit art (13 krl: 3 variants) | ~219 in ep13 | 7 scenes | low (episode art) | low |

Already shared and well used (do not touch): `C.hud` (95 calls), `C.progress` (88), `C.stage`/`C.vignette` (94), `C.cast` (75), `C.stamp` (39), `C.chip` (19), `W.dust` (37), `W.row` (17), `W.person` (9), `F1.wordFrame` (77), `F1.line`.

---

## 1. Scene skeleton + SFX tags (highest value)

Every one of the 94 scenes has the same head. Measured: exactly one `<style>` block in all 94; 93 are `#root { position:absolute; inset:0; background:X; overflow:hidden; }` (1 minified, identical), only `X` varies. Remaining skeleton is `<template>`, `<link f1.css>`, `<div id=root data-composition-id=ID data-width=1080 data-height=1920>`, `<div id=ID-art class=f1-layer>`, `</div>`, `<script>`. Skeleton = 1204 lines total (84 per 6-scene episode up to 112 for ep14; 72 scenes use the 8-line style, 21 the 3-line variant).

`<audio>` tags: 530 lines in 94 of 94 scenes (avg 5.6, max 10 per scene). All 530 have the identical shape `<audio data-hf-media-start-basis="local" data-start=X id=X class="clip" src=public/sfx/F data-at=ANCHOR data-track-index=N data-volume=V></audio>`. `data-start` is a placeholder that sync rewrites; `id` is `<scene>-sfx-<name>`; `data-track-index` is hand numbered (no collisions found in any scene, but hand-maintained). Anchor forms: 427 `word:x`, 69 `0`, 11 `word:x+N`, 11 `word:x#N`, 10 `word:x-N`. SFX files: pop-in 159, swoosh-soft 79, stamp 72, click 57, ding-num 52, tick 26, ding 24, whoosh 20, rest 41.

Locations: skeleton = lines 2 to (first `<script>` line - 1) of each scene; audio lines sit inside it. Example ranges: `episodes/14_kerja/scenes/cek.html:2-26`, `episodes/13_krl/scenes/vonis.html:2-26`, `episodes/06_emas/scenes/pelajaran.html:2-~30`.

Variation: root bg color only; audio list content only.

Proposed shared form: data-driven wrapper in the build (the hotwizz template already does exactly this for `hw-*`: it renders `#root`, `-art` layer and `<audio data-at>` from props). Add optional manifest fields so `file` scenes keep working:
```json
{ "id": "cek", "file": "scenes/cek.html", "bg": "#dfe8ee",
  "sfx": [ {"at":"0","file":"swoosh-soft","vol":0.22}, {"at":"word:empat","file":"click","vol":0.25} ] }
```
Generator (src/pipeline, next to where `renderHotwizz` builds `audio`) emits root/art/audio with auto `data-track-index` (e.g. 20+k as hotwizz does) and `src/config/episodes.mjs` validates anchors (it already validates template anchors). The scene file then contains only the `<script>` body (about 12 fewer lines + N fewer audio lines each) and no id typos. Back-compat: if a scene file still contains its own `<template>`, use it as today. sync already rewrites `data-start`; with manifest SFX it can skip file mutation entirely.

## 2. Pasted per-episode kits

### 2a. 14_kerja: byte-identical 68-line kit in all 8 scenes
md5 of the block (palette consts through `const IC`, excluding DRIFT/SWEEP lines) is identical in all 8 files: `episodes/14_kerja/scenes/`
`alihdaya.html:26-93, cek.html:25-92, cuti.html:24-91, hook.html:22-89, kontrak.html:24-91, sisi.html:22-89, status.html:23-90, vonis.html:22-89`.
8 x 68 = 544 lines, 476 redundant. Contents: palette (`INK RED TEAL TEAL2 PAPER`), `mono`/`osw`, DRIFT/SWEEP, `CARD` (sourced paper card: kicker, big, sub, "Sumber:" line), `BADGE` (= `C.tag` clone), `CAL` (month grid with red rings/teal fills), `ICON` dict + `IC`. Usage per scene is partial: CARD used in 6/8, CAL in 3/8, IC in 4/8, so most scenes carry dead helpers. Variation between copies: 0.

Proposed: promote to shared runtime. `C.card(f,{at,x,y,w,kicker,big,sub,src,tone:'paper'|'dark'})` (extend `C.hud`, same kicker/big/sub/src signature; `C.hud` is the dark variant, CARD is the paper variant, only bg/colors/shadow differ), `C.badge` = `C.tag` with `bg` param, `W.calendar` and `W.icon(name,...)` into `world.js` (or a new `src/runtime/f1/kit.js`).

### 2b. 13_krl
- `batal.html:34-94`, `inka.html:35-95`, `sisi.html:37-97`: identical 61-line block (`mix`, `CLOTH`, `TRAIN` with riders/ghost, `RAIL`, `SPARKS`, `CARD`, `SRC`, `OSW`). diff = 0 lines (excluding DRIFT/SWEEP). 122 redundant.
- `hitung.html:29-64` and `vonis.html:29-64`: identical 36 lines (`TRAIN`, `RAIL`). 36 redundant.
- `hook.html:25-86` and `padat.html:26-87`: identical ~61 lines (`SILC`, `BUST`, `CAR`, `TRAIN`, `RAIL`, `SKY`); diverge only from the next helper (GHOST vs CARD). ~61 redundant.
Total ~219. Three different train implementations for one subject, so a single `W.trainset(f,{cars,riders,packed,ghost,wheel,sway,...})` is possible but visually risky (see "unique artwork" below). Cheaper first step: move each pasted block into one `episodes/13_krl/` shared include or `W.*` and keep the three looks as variants.

### 2c. Smaller
- 07_kelas `angka.html:27-66` / `kalau.html` staircase kit (STEPS, STAIRS, guy, slot, crowd; the file says "same in angka and kalau"), ~40 lines x2; people kit (`SKIN/CLOTH/KINDS/pick/look`) also in `siapa.html` (3 copies x ~5 lines).
- 06_emas `GOLD` bar helper in `harga.html`, `hook.html`, `kenapa.html`, `pelajaran.html` (4 x ~8 lines, includes the gold-bar `<path>` lines).
- 12_hapus `BG` in `belum.html:113` / `siapa.html`, REC-blink HUD in 09/10/12 hooks (4 near-copies).

## 3. Scene prelude consts (measured)
`const n = F1.n` 94/94, `const C = F1.cine` 94/94, `const W = F1.world` 55, `const w = (x, occ=0) => F1.wordFrame(S, x, occ)` 77 (three signatures: 56 `o`, 20 `occ`, 1 single-arg), `const mono = ...JetBrains Mono` 43 (plus 16 `${mono}` styled variants), `const osw` 17, `const INK = "#2a2a2e"` 61, `const RED` 36 (values `#d0413a`, `#c0392b`, `#ff2d3d` differ per episode). ~380 lines.
Proposed: extend the `F1.scene` ctx (currently `{S, D, id}`) to also pass `{n, w, C, W, mono, osw, PAL}`; `PAL` from `runtime.palette` in episode.json (see 6). One line saves 4-6 lines per scene.

## 4. DRIFT / SWEEP ambient motion
Defined verbatim in 35 scenes: all of 06 (7), 07 (7), 12 (6), 13 (7), 14 (8), and a 36th copy inside `src/templates/hotwizz-kit.js:43-50`. After normalising `F1.n(` vs `n(` the 35 DRIFT lines and 35 SWEEP lines are identical (27 use `F1.n`, 8 in ep07 use bare `n`). Each scene calls each exactly once in its `BG` (35 DRIFT calls, 35 SWEEP calls). DRIFT `count` param: 7 (25 times), 8 (7), 6 (3).
Locations (comment+DRIFT+SWEEP) e.g. `06_emas: harga:45-47 hook:55-57 jangka:72-74 kalau:53-55 kenapa:35-37 pelajaran:66-68 spread:46-48`; `07_kelas: angka:74-76 gaji:37-39 hook:62-64 kalau:118-120 kenapa:54-56 pelajaran:54-56 siapa:38-40`; `12_hapus: belum:19-21 hapus:22-24 hook:26-28 penutup:20-22 sasaran:19-21 siapa:19-21`; `13_krl: batal:31-33 hitung:107-109 hook:85-86 inka:32-34 padat:86-87 sisi:34-36 vonis:98-100`; `14_kerja: alihdaya:33-34 cek:32-33 cuti:31-32 hook:29-30 kontrak:31-32 sisi:29-30 status:30-31 vonis:29-30`.
Variation: 0 in code; only call args differ (seed, y0/y1, color, alpha).
Proposed: `W.drift(f,opts)` and `W.sweep(f,opts)` in `src/runtime/f1/world.js` (it already has `W.dust`, `W.steam`; the file header says "pure function of the frame", fits), and have `hotwizz-kit.js` call them instead of its own copy. Optionally `C.stage(..., {ambient:{drift:{...},sweep:{...}}})` to remove the 70 call lines too. Note both are continuous in f (sin of f), so the 60 fps contract is already respected; keep it that way.

## 5. Verdict end card (KASUS DITUTUP)
12 scenes: one per episode's last content scene. Ranges: `01_inflasi/pelajaran.html:~51-56` (black card, `#ff5a5f` stamp), `02_rupiah/pelajaran.html:45-56`, `03_ihsg:53-64`, `04_paylater:58-70`, `05_judol:107-119`, `06_emas:80-100`, `07_kelas:65-74`, `08_ump:70-79`, `11_diskon:93-101`, `13_krl/vonis.html:116-135`, `14_kerja/vonis.html:112-118`. ~130 lines.
The shared structure is exact: `paper = ramp(f, ditutup-6, 8)`, `slam = ramp(f, ditutup, 8, expoOut)`, `ask = ramp(f, cue, 12, expoOut)`; full-bleed paper bg; column at `top` N; stamp div (`padding 12-14px 30px`, `6px solid #c0392b`, `rotate(-6deg) scale(2.2-1.2*slam)`, Oswald 600 72px ls 6); mono line `KASUS #NN · NAME` (26px, `#6f6a66`); dark `#2a2a2e` ask card (red mono kicker 24px + Oswald 600 58-64px + optional sub); mono `SUMBER LENGKAP DI DESKRIPSI` 20px. The inline stamp expression `scale(${n(2.2 - 1.2 * ...)})` appears 12 times (11 verdict scenes + `05_judol/qris.html`) even though `C.stamp` exists; `C.stamp` is absolutely positioned and the verdict stamp is in flex flow, which is why it was re-implemented.
Variation: paper bg (`#f6efe1` warm 9x, `#eaf1f5` transit, black), column `top` (262-470), gap (22-34), stamp text (KASUS DITUTUP / ...SEMENTARA), case name (hard-coded: NASI GORENG, RUPIAH, IHSG, ..., KRL), an optional slogan block (13 only), ask card text, which word is the cue.
Proposed: `C.verdict(f, S, { at:'ditutup', bg, top, stamp:'KASUS DITUTUP', name:'KRL', slogan?, ask:{cue,kicker,big,sub?}, source:true })` in `cine.js` (case id is already `C.CASE.id`; add `runtime.case.name` to episode.json so "KASUS #07 · KELAS MENENGAH" is not retyped). Also let `C.stamp` take `flow:true`.

## 6. Checklist card with ticks
8 scenes: `02_rupiah/pelajaran.html:24-32`, `03_ihsg:24-37`, `04_paylater:~28-38`, `06_emas:34-67`, `07_kelas:27-45`, `08_ump:26-43`, `13_krl/vonis.html:65-72`, `11_diskon/pelajaran.html:43-69` (compare card, partial). ~115 lines. Same mechanics in all: `p = ramp(f, ticks[i]-2, 10, expoOut)`, row slides 20 px and fades `0.25+0.75p`, white 56-62 px box with a stroke-dasharray tick path drawn on `p`, Oswald label. Variation: card size/position/rx, title text, item font size (34-42), per-item subtext and `Sumber:` line (07, 06, 08), check colour (`#4e8a4f` vs INK on `#c6f432`), dasharray (60/64/80).
Proposed: `W.checklist(f, {x,y,w,title,items:[{t,s?,src?}],ticks,tone})` in `world.js`/new kit, ticks passed as frames (`w('panik')`).
Combined option (see section 1 manifest approach): one `checklist-verdict` template that also draws the room/desk backdrop presets.

## 7. Title-only cover card
4 scenes: `06_emas/pelajaran.html:98-108`, `12_hapus/penutup.html:90-99`, `13_krl/vonis.html:133-144`, `14_kerja/vonis.html:116-125`. Identical frame logic: `cv = ramp(f, lastLine.end + 4, 5)`, `zIndex 50`, full-bleed bg, centred flex column with `gap 30-40`, a rotated `6px` stamp chip `KASUS #NN` (Oswald 600, 52px, ls 6, rotate -5deg), title block (Oswald 700, lh 1.04, ls 2, sizes 118/124/128 px, last line with a highlighted accent span: `#d0413a` or TEAL2 pill, padding 0 18px, radius 16), optional svg motif (gold bar 06, train 13). Comment text "stays inside the centred 3:4 crop (y 240-1680)" is copy-pasted too. 12 uses `HOTWIZZ #03` plus a red pill instead of the highlight span.
Variation: bg (flat `#f1e7d3`/`#dfe8ee`/radial dark), title lines and sizes, accent colour, art svg, which `F1.line(S,N)` index is last (2, 1, 0).
Proposed: `C.cover(f, S, {bg, stamp, color, lines:[{t,size,accent?,pill?}], art?, lineIndex:'last'})` in `cine.js`. `hw-cover` already implements this for flash episodes (`cover {title, stamp?, chip?}`, "starts 4 frames after the last word, inside the 3:4 crop"); the bespoke episodes just do not use it. Easiest consolidation: have `hw-cover` and `C.cover` share one function in `hotwizz-kit.js` -> move to runtime, theme via palette. The "last line" index should be computed (`S.lines.length-1`) instead of hand-typed.

## 8. "Sumber:" / footer lines
79 raw lines (not counting HTML-comment mentions) in 54 scenes; plus 113 `src:` params on `C.hud` (already shared). Raw lines are single `<text>`/`<div>` in JetBrains Mono, weight 500, size 17 (29x), 16 (13+10 css), 15-21 (rest), fill `#8a6f55` (15), `#6f6a66` (15), `#5f6a72` (3), plus ~5 other greys. Per episode: 03:4, 04:3, 05:7, 06:8, 07:8, 08:9, 09:3, 10:3, 11:7, 12:5, 13:11, 14:21. Unrelated but notable: `SUMBER LENGKAP DI DESKRIPSI` hard-coded 15 times in 9 files and `hw-cover` has its own footer.
Proposed: `F1.source(x,y,text,{anchor,color,size,opacity})` returning svg text, and `C.hud`-style html variant, with a default tone from `PAL`. Saves no lines but enforces one size, and lets validation extract source strings from the DOM to compare against `script-short.md` (a "source table S1-Sn" check like the Flash one). Low priority.

## 9. Number formatting
Thousands-separator copies: `String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")` in 14 scenes (04: hook, nol, telat; 05: kalau, skala; 06: harga, jangka, kalau, spread; 07: kalau; 08: hitung; 11: struk, keranjang, pelajaran), `toFixed(d).replace(".", ",")` in 07 (angka, gaji, kalau), 08 riil, 05 skala. `toLocaleString("id-ID")` in 01 dalang and 02 rekor (depends on Chromium ICU data; deterministic per machine but differs from the regexp copies). Proposed `F1.fmt.id(v,d)` and `F1.fmt.rp(v)` in `core.js`, and a `F1.countUp(f, at, frames, from, to)` ramp (counters are just `Math.round(X*pct)` in 05 korban, 09 ironi, 10 pecat, 04 hook). `hw-number` already has `countUp`.

## Candidate patterns that are NOT real duplication
- Timeline cards: only 07 `angka`, 07 `kalau`, 13 `batal` use step/staircase/timeline styles, all different artwork. Day counter is a one-off in 10 `pecat`.
- Comparison/dilemma cards: each episode builds its own (ep13 `sisi`, ep14 `sisi`, 11 `cek`, 12 `belum`); structure differs. `hw-split` already covers the flash case. Not worth a helper beyond CARD (2a).
- Stat counters/bars: four different bar helpers (07 gaji `BAR`, 07 kenapa `BARS`, 08 riil `COL`, 13 inka `BARS`, ~10-15 lines each, different geometry). Possible `W.bar` but weak.
- HUD labels: `C.hud`/`C.chip`/`C.tag` already exist and are used (95/19 times). The only HUD duplication is 14's CARD/BADGE clones (2a).
- KASUS/HOTWIZZ stamp: shared `C.stamp` used 39x; the 12 inline copies are the verdict card (5).
- hotwizz-kit pasted into scenes: no. `hotwizz-kit.js` is inlined once per hw-* composition only (generated cache), and no episode copies it. The kit has its own DRIFT/SWEEP clone (4).

## Dead shared runtime (informational)
Zero references in any scene or template: `F1.Photo`, `F1.PhotoCard`, `F1.Words`, `F1.Leader`, `F1.Logo`, `F1.BigStat`, `F1.LowerThird`, `F1.ProgressBar`, `F1.Ring`, `F1.RaceWipe`, `F1.Mascot` + VelvetDoor/Tickets/StoryBoard/TripMap, `F1.FeedCard`/`Chip`/`Sepia`/`Solid` (bits.js), `F1.Grain`, `F1.spring`, `F1.morph`, `F1.driftPx`, `F1.random` (outside runtime). That is `photo.js` 475 + `mascot.js` 854 + `words.js` 180 + `bits.js` 65 = 1574 lines shipped into every generated project, plus parts of `toon.js` (265) and `F1.theme`. `rig.js` is used only via `C.actor`. Consider pruning or documenting as optional; cheap to verify before deleting.

## Palette variables (transit palette and others)
Palette is declared as per-scene JS consts, not CSS vars: `INK "#2a2a2e"` in 61 scenes (13 episodes, global top hex, 139 uses), `RED` 36 scenes with three different values (`#d0413a` in 13/14/06 hook, `#c0392b` in 02-11 stamps, `#ff2d3d` in 12). 13_krl and 14_kerja share 11 hexes: `#dfe8ee` (bg, 14 vs 57 uses), `#f3f7fa` (20/18), `#5f7683`, `#2a2a2e`, `#d0413a`, `#8fd0d2` (DRIFT colour), `#b3bcc3`, `#3d7480` TEAL, `#2f6a6e` TEAL2, `#c4d3dd`, `#ff5a5f`; together 109 of 363 (13) and 135 of 205 (14) hex literals. `15` scenes in 13/14 declare `#root` bg `#dfe8ee`. Other global repeated colours: `#c0392b` 129 uses (10 eps), `#fffaf0` 99, `#0d0f16` 70 (09/10/12 hotwizz), `#f6efe1` 33, `#fff3cf` 32.
Proposed: `runtime.palette` (named: `ink, red, accent, paper, bg, tealDark...`) in episode.json, exposed as `F1.PAL` and as `--pal-*` CSS vars on `#root`; named themes ("transit", "warm-desk", "hotwizz") in `src/config`. The design doc already allows "named config themes may set supported runtime/case/audio/voice values", so this fits as a theme field. Two real-world clusters exist today: warm desk (`#f6efe1`, `#e2d6c3`, `#c0392b`, `#8a6f55`: eps 02-08, 11) and transit (13/14).

---

## Scenes that should stay custom (unique artwork)
Keep bespoke; they carry story-specific drawing and are not repeated:
- All 14 `hook` scenes (distinct visuals each; 08/11 hooks share a 13-line phone/desk backdrop: `08_ump/hook.html` vs `11_diskon/hook.html`, only that backdrop could move to a `W.phone`).
- 01: `penjual`, `bahan`, `kita`, `dalang`; 02: `rekor`, `untung`, `dampak`, `kalau`; 03: `anjlok`, `asing`, `msci`, `kalau` (charts); 04: `slik`, `skala`, `telat`, `nol`, `aturan`; 05: `bandar`, `qris`, `korban`, `skala`, `kalau`; 06: `harga`, `spread`, `jangka`, `kalau`, `kenapa` (gold-bar art; GOLD helper shared across 4 though); 07: `angka`, `kalau` (staircase crowd), `gaji`, `kenapa`, `siapa`; 08: `gaya`, `hitung`, `inflasi`, `kabar`, `riil`; 09: `modus`, `versi`, `kubu`, `ironi`, `kabar`; 10: `kemana`, `istana`, `polri`, `pecat`; 11: `struk`, `keranjang`, `cek`, `syarat`, `kenapa`; 12: `hapus`, `siapa`, `belum`, `sasaran`; 13: `padat`, `batal`, `inka`, `hitung`, `sisi`; 14: `alihdaya`, `cuti`, `kontrak`, `status`, `sisi`, `cek`.
- Closing scenes (`pelajaran`/`vonis`/`penutup`) have unique backdrops (room, dawn platform, calendar, mattress, law card) but their *foreground* (checklist, verdict, cover) is shared -> split foreground into helpers (5, 6, 7), keep the backdrop art.
- Hotwizz-theme bespoke eps 09/10/12 (19 scenes, 2076 lines) predate the `hw-*` templates. README says Flash episodes have no hand-drawn scenes; any future HotWizz item should use the templates. 09/10/12 hooks share the REC-blink HUD and the `repeating-linear-gradient` scanline overlay (09/10/12 penutup, ~12 shared lines each) which `hotwizz-kit.js` already contains in `bg`.

---

## Determinism / 60 fps hazards (all measured)

episode.json fps: 60 for `06_emas`, `07_kelas`, `12_hapus`, `13_krl`; 30 for the rest (01-05, 08-11, 14). `09_sadap`, `10_ksp`, `12_hapus` set `theme: "hotwizz"`; ep12 is hotwizz but 60 fps and hand-drawn (README says Flash = 30 fps; 12 is not a Flash episode).

- Wall clock: none. `Date`, `performance.now`, `requestAnimationFrame`, `setTimeout/Interval` have zero hits in scenes, `src/runtime/f1/*.js`, `src/templates/*`.
- `Math.random`: zero hits anywhere (only comments in `core.js:12`, `world.js:4`). Scenes use `F1.world.hash` / `F1.random(seed)`. Clean.
- CSS animation/transition/@keyframes: zero hits in scenes, runtime js, `f1.css`, templates. Clean. (Scenes use `filter:blur(...)` and `mix-blend-mode` statically only.)
- 60 fps scenes (06, 07, 12, 13): no `f % N`, no integer-frame triggers (`f === N`), no `[f]` array indexing, no `Math.floor(f)`/`Math.round(f)`. Only wrap-around motion is continuous sawtooth: `12_hapus/hook.html:93` `(f*0.6)%260`, `13_krl/inka.html:111` `(i*40+f*2.2)%1040`, `13_krl/hook.html:75` and `padat.html:76` `((k*52+off)%1248)`. Fractional f only shifts the sawtooth smoothly, so these are 60-fps safe. DRIFT/SWEEP are sin(f) based and also safe.
- Runtime: `core.js F1.scene` rounds f to 3 decimals (`:355`) and renders per timeline frame; `timing.js` rounds to integer frames at the single point of conversion (`Math.round(x*FPS)`); `toon.js:56 Math.floor(f/2)` (F1.Grain, unused) and `mascot.js:36 Math.floor(frame/PERIOD)` (blink, unused) are floor-based and fractional-safe.
- Latent hazards, only in 30 fps episodes (would flicker wrongly if one is ever rendered at 60): `f % 2` flicker `01_inflasi/dalang.html:39` and `02_rupiah/rekor.html:50` (`f>3&&f<9&&f%2`: at fractional f it is truthy for every non-even f), `(f - x) % 3 === 1` stutter `01_inflasi/hook.html:48` and `02_rupiah/hook.html:51` (at fractional f it never equals 1 except on integers). Parity blinks `Math.floor(f/N)%2` (03 anjlok:33, 09 hook:35, 09 versi:93, 10 hook:40, 10 kemana:55) are fractional-safe. `01_inflasi/penjual.html:24` `(f % TOSS)/TOSS` is continuous, safe.
- `toLocaleString("id-ID")` in `01_inflasi/dalang.html:66`, `02_rupiah/rekor.html:82`: deterministic but ICU-dependent in headless Chromium (WSL vs Windows laptop could differ). Replace with a regexp formatter (`F1.fmt`, section 9).
- No scene reads `F1.FPS`/assumes 30 except `cine.js:69` pulse (`pulse.period * 30`), a hard-coded 30 for a timeline-frame period; that is correct because timeline frames stay 30/s at 60 fps.

## Suggested order
1. Manifest-driven skeleton + `sfx` list (pattern 1): 1734 lines, universal, zero visual risk, hotwizz path already proves the generator.
2. `W.drift`/`W.sweep` into `world.js` (4): mechanical, byte-identical, also fixes the kit copy.
3. `C.verdict` + `C.cover` + `W.checklist` (5, 7, 6) with `runtime.case.name`: ~285 lines and it makes the case-closing sequence data, which is what every new episode re-types.
4. Promote ep14 kit generics (`C.card`, `W.calendar`, `W.icon`) and ctx destructure (`n,w,C,W,PAL`) (2a, 3, palette).
5. Defer 13_krl train unification (10) and bar-chart helpers.
