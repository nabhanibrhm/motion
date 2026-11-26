#!/usr/bin/env node
// Wizz Clip news/fact video: text-only 9:16 (1080x1920, 30 fps) rendered with the repo's pinned HyperFrames.
//
//   node tools/wizzclip/news/render.mjs list
//   node tools/wizzclip/news/render.mjs build   <id>                  stage .cache/wizzclip/news/<id>/ (no render)
//   node tools/wizzclip/news/render.mjs check   <id>                  build + hyperframes check
//   node tools/wizzclip/news/render.mjs stills  <id> [--at 0,5,10]    build + PNGs in .cache/wizzclip/news/<id>/stills/
//   node tools/wizzclip/news/render.mjs preview <id>                  build + hyperframes preview
//   node tools/wizzclip/news/render.mjs render  <id> [--quality draft|looks|delivery] [--out name] [--force] [--no-master]
//
// Authored data: tools/wizzclip/news/<id>/news.json (see news.schema in this header's neighbour template/).
// Generated output (never hand-edit): .cache/wizzclip/news/<id>/. Finished video: out/wizzclip/news-<id>.mp4
// (an existing output is never overwritten without --force). Audio is loudnormed to -14 LUFS / -1 dBTP like the rest of the repo.
//
// news.json fields
//   title     cover title; *word* = Volt accent
//   category  "GAMING" | "SPORT"          kind  "BERITA" | "FAKTA" | "CERITA" (story recap)
//   beats[]   { text (*word* = Volt accent), big?, image?, sub?, seconds, sfx? , subAt? }
//             text: main line (Audex). big: huge number/time (Volt). image: path (repo-root or news dir relative).
//             video: { src, start, dim?, focusX? } muted footage behind the beat (pre-cut to .cache/.../clips, video only).
//               src repo-root relative; start = seconds into the source; dim = Ink overlay opacity (default 0.55); focusX 0..1 = horizontal crop (default 0.5);
//               zoom 1..2 (default 1) scales past full height and crops at focusY 0..1 (default 0.5), e.g. zoom 1.15 + focusY 0.2 hides burned-in subtitles.
//             split: { top: {src,start,speed?,dim?,focusX?,win?}, bottom: {...}, labels?: [top, bottom] }  two stacked halves
//               (1080x960 each), label pill on each, text on an Ink box over the seam. speed 0.25..1 slows a short shot
//               (0.5 = half speed: a 1.2 s shot fills 2.4 s); win = clean shot length in SOURCE seconds. No big/image/video with split.
//             sub: one small mono line, appears subAt seconds into the beat (default ~45% of the beat, max 2.4 s).
//             sfx: file name (no extension) in assets/shared/sfx, played at the cut into this beat; false = none.
//   sources[] outlet names (shown as "SUMBER: a, b")
//   music     { src, volume }  default assets/shared/music/bed.mp3 at 0.35 (pre-loudnorm)
//   sfxDefault (cut sound, default "whoosh"), sfxVolume (default 0.5), coverSfx (default "pop")
//   coverVideo { src, start, dim?, focusX? }  same, behind the cover card (default dim 0.68)
//   coverSplit { top, bottom, labels? }  split footage behind the cover card instead (default dim 0.55; labels shown)
//   splitLabels [top, bottom]  default labels for split beats (default ["DULU", "SEKARANG"])
//   audio     false = output has no audio track (you add the soundtrack in TikTok/YouTube); music and sfx are skipped at mastering
//   placeholder  true = the build prints a PLACEHOLDER warning
//   music     false = no music bed (sfxDefault/coverSfx false = no sfx)
//   narration { speaker: "wec", say?: {WORD: respelling}, speed?, tail? }  voice-over (Cartesia, costs credits):
//             each beat's say: "text" is one line, voiced by `voice <id>` into <id>/voice/b<i>-0.wav (committed, cached);
//             a voiced beat lasts max(seconds ?? 2, clip + tail) (tail default 0.3 s) and the clip starts at the cut.
//   voice <id> [--dry-run]  synthesise changed narration lines (prints the credit cost first with --dry-run)
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { masterVideo, masterQa } from '../../../src/pipeline/master.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../..');
const W = 1080, H = 1920, FPS = 30, COVER = 1.2, ZONE_W = 846, SEAM_PAD = 22, SEAM_W = 816;
const C = { ink: '#0E0F12', graphite: '#1A1C21', mist: '#8C9099', paper: '#F4F3EF', volt: '#E6FC29' };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const r3 = n => +n.toFixed(3);

// ---------- fonts / text fitting (real Audex advances via fontkit, which ships with hyperframes) ----------
let audex = null;
try { audex = createRequire(import.meta.url)('fontkit').openSync(join(ROOT, 'tools/wizzclip/fonts/Audex-Regular.ttf')); } catch { /* fall back to an estimate */ }
const em = s => audex ? audex.layout(s).advanceWidth / audex.unitsPerEm : s.length * 0.56;
const plain = s => s.replace(/\*/g, '');
function wrap(text, size, width = ZONE_W) {
  const lines = []; let cur = '';
  for (const w of plain(text).split(/\s+/)) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && em(next) * size > width) { lines.push(cur); cur = w; } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}
function fit(text, max, min, maxLines, width = ZONE_W) {
  for (let s = max; s >= min; s -= 2) { const l = wrap(text, s, width); if (l.length <= maxLines && l.every(x => em(x) * s <= width)) return { size: s, lines: l.length }; }
  return { size: min, lines: wrap(text, min, width).length, overflow: true };
}
const accent = s => esc(s).replace(/\*([^*]+)\*/g, '<span class="vo">$1</span>');

// ---------- video segments ----------
function parseVideo(v, label, defDim, need) {
  if (!v) return null;
  need(typeof v.src === 'string' && v.src, `${label}.src is required`);
  const src = resolve(ROOT, v.src);
  need(existsSync(src), `${label}.src not found: ${v.src} (footage is not in git; fetch/copy it to that path first)`);
  const start = Number(v.start ?? 0), dim = Number(v.dim ?? defDim), focusX = Number(v.focusX ?? 0.5);
  need(Number.isFinite(start) && start >= 0, `${label}.start must be seconds >= 0`);
  need(dim >= 0 && dim <= 1, `${label}.dim must be 0..1`);
  need(focusX >= 0 && focusX <= 1, `${label}.focusX must be 0..1`);
  const speed = Number(v.speed ?? 1);
  need(speed >= 0.25 && speed <= 1, `${label}.speed must be 0.25..1`);
  const zoom = Number(v.zoom ?? 1), focusY = Number(v.focusY ?? 0.5);
  need(zoom >= 1 && zoom <= 2, `${label}.zoom must be 1..2`);
  need(focusY >= 0 && focusY <= 1, `${label}.focusY must be 0..1`);
  return { src, start, dim, focusX, speed, zoom, focusY, win: v.win === undefined ? null : Number(v.win) };
}
function parseSplit(s, label, defDim, need, defLabels) {
  const labels = s.labels ?? defLabels ?? ['DULU', 'SEKARANG'];
  need(Array.isArray(labels) && labels.length === 2 && labels.every(x => typeof x === 'string' && x.trim()), `${label}.labels must be two strings`);
  need(s.top && s.bottom, `${label} needs top and bottom`);
  return { top: parseVideo(s.top, `${label}.top`, defDim, need), bottom: parseVideo(s.bottom, `${label}.bottom`, defDim, need), labels };
}
const tool = (bin, args) => { const r = spawnSync(bin, args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }); if (r.error) throw r.error; if (r.status !== 0) throw new Error(`${bin} failed: ${r.stderr.slice(-1500)}`); return r.stdout; };
// Pre-cut one segment: video only (-an: source audio is never used), 30 fps, exact frame count, cover-cropped to 1080x1920,
// short GOP so seeks are cheap. Cached by a hash of its parameters in <build>/clips/.
function cutClip(v, dur, clipsDir, label, w = W, h = H) {
  const srcDur = Number(tool('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', v.src]).trim());
  const speed = v.speed ?? 1, need = dur * speed;
  if (!(v.start + need <= srcDur - 0.05)) throw new Error(`${label}: needs ${v.start}s + ${r3(need)}s but ${basename(v.src)} is only ${srcDur.toFixed(2)}s long`);
  // full-frame cuts keep their old cache key; split halves and slowed shots get their own
  const zoom = v.zoom ?? 1, focusY = v.focusY ?? 0.5;
  const key = createHash('sha1').update(JSON.stringify(w === W && h === H && speed === 1 && zoom === 1 ? [v.src, statSync(v.src).size, v.start, dur, v.focusX, 'v2'] : [v.src, statSync(v.src).size, v.start, dur, v.focusX, speed, w, h, zoom, focusY, 'v4'])).digest('hex').slice(0, 12);
  const file = join(clipsDir, `${key}.mp4`);
  if (existsSync(file)) return file;
  mkdirSync(clipsDir, { recursive: true });
  // full frame: scale to 1920 high, crop at focusX. Split half (1080x960): cover-fit, crop the overflow at focusX, centred
  // vertically. speed < 1 = slow motion (setpts before fps, so frames are repeated, not blended).
  // zoom > 1 (full frame only) scales past 1920 high and crops at focusY, e.g. zoom 1.15 + focusY 0.2 hides burned-in subtitles.
  const ZH = Math.round(H * zoom / 2) * 2;
  const fitVf = w === W && h === H ? `scale=-2:${ZH}:flags=lanczos,crop=${W}:${H}:(iw-${W})*${v.focusX}:(ih-${H})*${focusY}`
    : `scale=w='max(${w},iw*${h}/ih)':h='max(${h},ih*${w}/iw)':flags=lanczos,crop=${w}:${h}:(iw-${w})*${v.focusX}:(ih-${h})/2`;
  const vf = `${speed !== 1 ? `setpts=PTS/${speed},` : ''}${fitVf},fps=${FPS},setsar=1,format=yuv420p`;
  const tmp = file + '.part.mp4';
  tool('ffmpeg', ['-hide_banner', '-nostdin', '-y', '-loglevel', 'error', '-ss', String(v.start), '-i', v.src, '-an', '-sn', '-vf', vf, '-frames:v', String(Math.round(dur * FPS)),
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '20', '-g', '6', '-keyint_min', '6', '-sc_threshold', '0', '-movflags', '+faststart', tmp]);
  renameSync(tmp, file);
  return file;
}

// ---------- load + validate ----------
function load(id) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id || '')) throw new Error(`Invalid id "${id}" (lowercase letters, digits, dashes)`);
  const file = join(HERE, id, 'news.json');
  if (!existsSync(file)) throw new Error(`Missing ${file}`);
  const d = JSON.parse(readFileSync(file, 'utf8'));
  const warn = [];
  const need = (c, m) => { if (!c) throw new Error(`${id}/news.json: ${m}`); };
  need(typeof d.title === 'string' && d.title.trim(), 'title is required');
  need(['GAMING', 'SPORT'].includes(d.category), 'category must be GAMING or SPORT');
  need(['BERITA', 'FAKTA', 'CERITA'].includes(d.kind), 'kind must be BERITA, FAKTA or CERITA');
  need(Array.isArray(d.beats) && d.beats.length >= 2 && d.beats.length <= 18, 'beats must hold 2 to 18 entries');
  const music = d.music === false ? null : { src: 'assets/shared/music/bed.mp3', volume: 0.35, ...(d.music || {}) };
  const sfxDefault = d.sfxDefault === undefined ? 'whoosh' : d.sfxDefault;
  const narr = d.narration || null;
  if (narr) need(typeof narr.speaker === 'string' && narr.speaker, 'narration.speaker is required');
  const beats = d.beats.map((b, i) => {
    const n = `beats[${i}]`;
    need(typeof b.text === 'string' && b.text.trim(), `${n}.text is required`);
    let voice = null;
    if (b.say !== undefined) {
      need(narr, `${n}.say needs a top-level narration block`);
      need(typeof b.say === 'string' && b.say.trim(), `${n}.say must be text`);
      const wav = join(HERE, id, 'voice', `b${i}-0.wav`);
      need(existsSync(wav), `${n}.say has no voice clip yet: run "node tools/wizzclip/news/render.mjs voice ${id}"`);
      const rate = Number(b.rate ?? 1);
      need(rate >= 0.8 && rate <= 1.25, `${n}.rate must be 0.8 to 1.25`);
      const dur = Number(tool('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav]).trim()) / rate;
      voice = { wav, dur, rate };
      b = { ...b, seconds: r3(Math.max(Number(b.seconds ?? 2), dur + Number(narr.tail ?? 0.3))) };
    }
    need(Number(b.seconds) >= 2 && Number(b.seconds) <= 12, `${n}.seconds must be 2 to 12`);
    if (b.big && /\*/.test(b.text)) warn.push(`${n}: has "big" (Volt), so *accent* in text is shown Paper (one Volt use per screen)`);
    let image = null;
    if (b.image) {
      image = [resolve(ROOT, b.image), resolve(HERE, id, b.image)].find(existsSync);
      need(image, `${n}.image not found: ${b.image}`);
    }
    const video = parseVideo(b.video, `${n}.video`, 0.55, need);
    let split = null;
    if (b.split) {
      need(!b.big && !b.image && !b.video, `${n}: split cannot be combined with big, image or video`);
      split = parseSplit(b.split, `${n}.split`, 0.12, need, d.splitLabels);
      for (const [k, v] of [['top', split.top], ['bottom', split.bottom]])
        if (v.win && Number(b.seconds) * v.speed > v.win + 0.05) warn.push(`${n}.split.${k} needs ${r3(Number(b.seconds) * v.speed)}s of source but its clean shot (win) is ${v.win}s: it crosses a cut`);
    }
    if (b.video?.win && Number(b.seconds) > Number(b.video.win) + 0.05) warn.push(`${n} lasts ${b.seconds}s but its clean shot (video.win) is ${b.video.win}s: it crosses a cut`);
    const sfxName = b.sfx === undefined ? (i === 0 ? false : sfxDefault) : b.sfx;
    return { ...b, i, seconds: Number(b.seconds), image, video, split, sfxName, voice };
  });
  const coverVideo = parseVideo(d.coverVideo, 'coverVideo', 0.68, need);
  need(!(d.coverVideo && d.coverSplit), 'use coverVideo or coverSplit, not both');
  const coverSplit = d.coverSplit ? parseSplit(d.coverSplit, 'coverSplit', 0.55, need, d.splitLabels) : null;
  const total = r3(beats.reduce((s, b) => s + b.seconds, 0) + COVER);
  if (narr ? (total < 25 || total > 60) : (total < 25 || total > 45)) warn.push(`total ${total}s is outside the usual ${narr ? '30-55' : '32-38'} s`);
  if (d.placeholder) warn.push('PLACEHOLDER content: replace the beats in news.json before posting');
  return { id, file, d, beats, coverVideo, coverSplit, music, total, warn, sfxDefault };
}

// ---------- stage a build ----------
function stage(ctx) {
  const { id, d, beats, coverVideo, coverSplit, music, total } = ctx;
  const out = join(ROOT, '.cache/wizzclip/news', id);
  const put = (rel, text) => { const p = join(out, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, text, 'utf8'); };
  const copy = (src, rel) => { const p = join(out, rel); mkdirSync(dirname(p), { recursive: true }); copyFileSync(src, p); };
  // generated files are rewritten each build; stills/ and raw renders are kept
  for (const sub of ['assets', 'lib']) rmSync(join(out, sub), { recursive: true, force: true });
  copy(join(ROOT, 'tools/wizzclip/fonts/Audex-Regular.ttf'), 'assets/fonts/Audex-Regular.ttf');
  copy(join(ROOT, 'assets/shared/fonts/JetBrainsMono-VF.ttf'), 'assets/fonts/JetBrainsMono-VF.ttf');
  const gsap = join(ROOT, 'node_modules/hyperframes/dist/vendor/npm/gsap@3.15.0/dist/gsap.min.js');
  if (!existsSync(gsap)) throw new Error('Pinned HyperFrames local GSAP 3.15.0 is missing; run npm ci');
  copy(gsap, 'lib/gsap.min.js');
  copy(join(HERE, 'template/news.js'), 'lib/news.js');
  const musicSrc = music ? resolve(ROOT, music.src) : null;
  if (music && !existsSync(musicSrc)) throw new Error(`Music not found: ${music.src}`);
  if (music) copy(musicSrc, `assets/music/${basename(musicSrc)}`);

  // timing
  let t = 0;
  const plan = beats.map(b => {
    const start = r3(t); t += b.seconds;
    const text = b.split ? fit(b.text, 72, 48, 3, SEAM_W) : b.big ? fit(b.text, 88, 56, 3) : b.image ? fit(b.text, 84, 56, 3) : fit(b.text, 108, 60, 5);
    const subAt = b.subAt ?? r3(Math.min(2.4, b.seconds * 0.45));
    return { i: b.i, start, dur: b.seconds, vid: !!b.video, split: !!b.split, img: !!b.image, big: !!b.big, sub: !!b.sub, subAt, text };
  });
  const coverStart = r3(t);
  const sw = []; // build-time overflow warnings
  plan.forEach(p => { if (p.text.overflow) sw.push(`beats[${p.i}].text does not fit even at ${p.text.size}px: shorten it`); });

  // video backgrounds: pre-cut segments, staged as assets/clips/*.mp4
  const clipsDir = join(out, 'clips'), usedClips = new Set();
  const vidHTML = (key, v, dur, label) => {
    if (!v) return '';
    const rel = `assets/clips/${key}.mp4`;
    const f = cutClip(v, dur, clipsDir, label); usedClips.add(basename(f)); copy(f, rel);
    return `<div class="b-vid" id="${key}-vid"><video id="${key}-video" class="clip" data-start="0" data-duration="${dur}" data-track-index="0" src="${rel}" muted playsinline></video></div><div class="b-dim" style="opacity:${v.dim}"></div>`;
  };
  // split: two 1080x960 halves, each with its own dim; label pills at the outer edge of each half
  const halfHTML = (key, part, v, dur, label) => {
    const rel = `assets/clips/${key}-${part}.mp4`;
    const f = cutClip(v, dur, clipsDir, label, W, H / 2); usedClips.add(basename(f)); copy(f, rel);
    return `<div class="sp-half sp-${part}"><div class="sp-vid" id="${key}-${part}"><video id="${key}-${part}-video" class="clip" data-start="0" data-duration="${dur}" data-track-index="${part === 'top' ? 0 : 1}" src="${rel}" muted playsinline></video></div><div class="sp-dim" style="opacity:${v.dim}"></div></div>`;
  };
  const splitHTML = (key, s, dur, label) => !s ? '' : halfHTML(key, 'top', s.top, dur, `${label}.top`) + halfHTML(key, 'bottom', s.bottom, dur, `${label}.bottom`)
    + `<div class="sp-seam"></div><div class="sp-label sp-l-top">${esc(s.labels[0])}</div><div class="sp-label sp-l-bot">${esc(s.labels[1])}</div>`;
  const bgs = beats.map((b, i) => b.split ? splitHTML(`b${i}`, b.split, plan[i].dur, `beats[${i}].split`) : vidHTML(`b${i}`, b.video, plan[i].dur, `beats[${i}].video`));
  const coverBg = coverSplit ? splitHTML('cv', coverSplit, COVER, 'coverSplit') : vidHTML('cv', coverVideo, COVER, 'coverVideo');
  if (existsSync(clipsDir)) for (const f of readdirSync(clipsDir)) if (!usedClips.has(f)) rmSync(join(clipsDir, f), { force: true }); // drop stale cuts
  const bigFit = s => Math.min(300, Math.floor(ZONE_W / em(s)));
  const zones = beats.map((b, i) => {
    const p = plan[i];
    if (b.split) { // the line sits on an Ink box centred on the seam (y 960)
      const boxH = Math.round(p.text.lines * p.text.size * 1.08 + 2 * SEAM_PAD);
      return `<div class="sp-zone" id="b${i}-zone" style="top:${Math.round(H / 2 - boxH / 2)}px"><div class="b-text sp-text" id="b${i}-text" style="font-size:${p.text.size}px">${accent(b.text)}</div></div>`;
    }
    let inner = '';
    if (b.image) { const rel = `assets/img/b${i}${extname(b.image).toLowerCase()}`; copy(b.image, rel); inner += `<div class="b-img" id="b${i}-img"><img id="b${i}-pic" src="${rel}" alt="" /></div>`; }
    if (b.big) { const s = bigFit(plain(b.big)); if (s < 90) sw.push(`beats[${i}].big is too wide (${b.big})`); inner += `<div class="b-big" id="b${i}-big" style="font-size:${s}px">${esc(b.big)}</div>`; }
    const textHTML = b.big ? esc(plain(b.text)) : accent(b.text);
    inner += `<div class="b-text" id="b${i}-text" style="font-size:${p.text.size}px">${textHTML}</div>`;
    if (b.sub) inner += `<div class="b-sub${b.video ? ' pill' : ''}" id="b${i}-sub">${esc(b.sub)}</div>`;
    return `<div class="zone" id="b${i}-zone">${inner}</div>`;
  });

  const title = fit(d.title, 150, 84, 5);
  if (title.overflow) sw.push(`cover title does not fit at ${title.size}px: shorten it`);
  const mark = cls => `<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true"><polygon points="20,80 36,80 56,20 40,20" fill="${C.paper}"/><polygon points="46,80 62,80 82,20 66,20" fill="${C.volt}"/></svg>`;
  const chipText = `${d.category} · ${d.kind}`;
  const segs = beats.map((_, i) => `<div class="seg"><i id="pf-${i}"></i></div>`).join('');
  const sources = (d.sources || []).length ? `SUMBER: ${d.sources.join(', ')}` : '';

  const audio = [];
  if (music) audio.push(`  <audio id="music" src="assets/music/${basename(musicSrc)}" data-start="0" data-duration="${total}" data-track-index="10" data-volume="${music.volume}" data-fade-out="1.5"></audio>`);
  const sfxVol = d.sfxVolume ?? 0.5, sfxUsed = new Set(); let tr = 11;
  beats.forEach((b, i) => {
    if (!b.voice) return;
    const rel = `assets/voice/b${i}.wav`;
    if (b.voice.rate === 1) copy(b.voice.wav, rel);
    else { mkdirSync(join(out, 'assets/voice'), { recursive: true }); tool('ffmpeg', ['-v', 'error', '-y', '-i', b.voice.wav, '-af', `atempo=${b.voice.rate}`, join(out, rel)]); }
    audio.push(`  <audio id="vo-${i}" src="${rel}" data-start="${plan[i].start}" data-duration="${r3(b.voice.dur)}" data-track-index="${tr++}" data-volume="1"></audio>`);
  });
  const addSfx = (name, at, label) => {
    if (!name) return;
    const f = join(ROOT, 'assets/shared/sfx', `${name}.wav`);
    if (!existsSync(f)) throw new Error(`sfx not found: assets/shared/sfx/${name}.wav (${label})`);
    if (!sfxUsed.has(name)) { copy(f, `assets/sfx/${name}.wav`); sfxUsed.add(name); }
    audio.push(`  <audio id="sfx-${label}" src="assets/sfx/${name}.wav" data-start="${r3(Math.max(0, at))}" data-track-index="${tr++}" data-volume="${sfxVol}"></audio>`);
  };
  beats.forEach((b, i) => addSfx(b.sfxName, plan[i].start - 0.12, `beat${i + 1}`));
  addSfx(d.coverSfx === undefined ? 'pop' : d.coverSfx, coverStart, 'cover');

  const [baseCss, sceneCss] = readFileSync(join(HERE, 'template/news.css'), 'utf8')
    .replace(/__INK__/g, C.ink).replace(/__GRAPHITE__/g, C.graphite).replace(/__MIST__/g, C.mist).replace(/__PAPER__/g, C.paper).replace(/__VOLT__/g, C.volt)
    .split('/* ==SCENE==');
  const sceneStyle = '/*' + (sceneCss || '').replace(/^[^\n]*\n/, '\n');

  // each scene is a sub-composition: <template> with styles, markup and its own paused timeline
  const scene = (sid, inner, script) => `<template>
<style>
${sceneStyle}
</style>
<div id="root" data-composition-id="${sid}" data-width="${W}" data-height="${H}">
${inner}
</div>
<script>
window.__timelines = window.__timelines || {};
window.__timelines["${sid}"] = ${script};
</script>
</template>
`;
  const host = (sid, start, dur, track, z) => `  <div id="${sid}" data-composition-id="${sid}" data-composition-src="compositions/${sid}.html" data-start="${start}" data-duration="${dur}" data-track-index="${track}" data-track-kind="graphics" data-width="${W}" data-height="${H}" style="z-index:${z}"></div>`;
  const hosts = [];
  beats.forEach((b, i) => {
    const p = plan[i], sid = `beat-${i + 1}`;
    put(`compositions/${sid}.html`, scene(sid, bgs[i] + zones[i], `NEWS.beat(${JSON.stringify({ i, dur: p.dur, vid: p.vid, split: p.split, img: p.img, big: p.big, sub: p.sub, subAt: p.subAt })})`));
    hosts.push(host(sid, p.start, p.dur, 1, 1));
  });
  put('compositions/cover.html', scene('cover', `<div class="cover">${coverBg}<div class="zone cv-zone">
<div class="chip cv-chip" id="cv-chip">${esc(chipText)}</div>
<div class="cv-title" id="cv-title" style="font-size:${title.size}px">${accent(d.title)}</div>
<div class="brand cv-brand" id="cv-brand">${mark('mark')}<span class="wm">wizz<b>clip</b></span></div>
</div></div>`, `NEWS.cover(${COVER}, ${!!coverVideo}, ${!!coverSplit})`));
  hosts.push(host('cover', coverStart, COVER, 2, 2));
  put('compositions/chrome.html', scene('chrome', `<div id="cut"></div>
<div id="hdr" class="brand">${mark('mark')}<span class="wm">wizz<b>clip</b></span></div>
<div id="chip" class="chip">${esc(chipText)}</div>
<div id="prog">${segs}</div>
${sources ? `<div id="src">${esc(sources)}</div>` : ''}`, `NEWS.chrome(${JSON.stringify({ beats: plan.map(({ i, start, dur }) => ({ i, start, dur })), coverStart, total })})`));
  hosts.push(host('chrome', 0, total, 3, 10));

  put('lib/plan.json', JSON.stringify({ id, total, coverStart, plan }, null, 2) + '\n');
  put('index.html', `<!doctype html>
<!-- GENERATED by tools/wizzclip/news/render.mjs from ${id}/news.json. Do not edit. -->
<html lang="id"><head><meta charset="UTF-8" /><meta name="viewport" content="width=${W}, height=${H}" /><title>${esc(plain(d.title))}</title>
<style>
${baseCss}
[data-composition-id="news"] { position: relative; width: ${W}px; height: ${H}px; overflow: hidden; }
</style>
<script src="lib/gsap.min.js"></script>
<script src="lib/news.js"></script>
</head><body>
<div id="root" data-composition-id="news" data-start="0" data-duration="${total}" data-fps="${FPS}" data-width="${W}" data-height="${H}">
  <div id="bg"></div>
${hosts.join('\n')}
${audio.join('\n')}
</div>
<script>window.__timelines = window.__timelines || {}; window.__timelines["news"] = gsap.timeline({ paused: true }).to({}, { duration: ${total} }, 0);</script>
</body></html>
`);
  put('hyperframes.json', JSON.stringify({ paths: { blocks: 'compositions', components: 'compositions/components', assets: 'assets' }, media: { autoProxy: true } }, null, 2) + '\n');
  return { out, warn: [...ctx.warn, ...sw], plan, coverStart };
}

// ---------- CLI ----------
function hf() {
  const pkgPath = createRequire(join(ROOT, 'package.json')).resolve('hyperframes/package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  if (pkg.version !== '0.8.210') throw new Error(`Expected HyperFrames 0.8.210, found ${pkg.version}`);
  return join(dirname(pkgPath), typeof pkg.bin === 'string' ? pkg.bin : pkg.bin.hyperframes);
}
function run(args, cwd) {
  const r = spawnSync(process.execPath, [hf(), ...args], { cwd, stdio: 'inherit' });
  if (r.status !== 0) throw new Error(`hyperframes ${args[0]} failed (exit ${r.status})`);
}
function parse(argv) {
  const pos = [], o = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) { const k = a.slice(2); const nx = argv[i + 1]; if (nx !== undefined && !nx.startsWith('--') && !['force', 'no-master'].includes(k)) { o[k] = nx; i++; } else o[k] = true; } else pos.push(a);
  }
  return { pos, o };
}

const { pos, o } = parse(process.argv.slice(2));
const [cmd, id] = pos;
try {
  if (cmd === 'list') {
    for (const e of readdirSync(HERE, { withFileTypes: true })) if (e.isDirectory() && existsSync(join(HERE, e.name, 'news.json'))) console.log(e.name);
  } else if (cmd === 'voice') {
    // One narration line per beat with "say", voiced by the repo's cached Cartesia provider (tools/voice/cartesia.py).
    if (!/^[a-z0-9][a-z0-9-]*$/.test(id || '')) throw new Error(`Invalid id "${id}"`);
    const d = JSON.parse(readFileSync(join(HERE, id, 'news.json'), 'utf8'));
    const narr = d.narration;
    if (!narr?.speaker) throw new Error(`${id}/news.json has no narration.speaker`);
    const known = JSON.parse(readFileSync(join(ROOT, 'config/speakers.json'), 'utf8'))[narr.speaker]?.cartesia;
    if (!known?.voice) throw new Error(`config/speakers.json has no Cartesia voice for "${narr.speaker}"`);
    const sections = d.beats.map((b, i) => b.say ? { id: `b${i}`, lines: [{ speaker: narr.speaker, text: b.say }] } : null).filter(Boolean);
    if (!sections.length) throw new Error('no beat has "say"');
    const vdir = join(HERE, id, 'voice'); mkdirSync(vdir, { recursive: true });
    const nfile = join(vdir, 'narration.json');
    const nj = { source: 'cartesia', cartesia: { ...(narr.say ? { say: narr.say } : {}) },
      speakers: { [narr.speaker]: { cartesia: { ...known, ...(narr.speed ? { speed: narr.speed } : {}) } } }, sections };
    writeFileSync(nfile, JSON.stringify(nj, null, 1) + '\n', 'utf8');
    const py = join(ROOT, process.platform === 'win32' ? '.venv/Scripts/python.exe' : '.venv/bin/python');
    const r = spawnSync(py, [join(ROOT, 'tools/voice/cartesia.py'), 'lines', nfile, '--lines', vdir, '--cache', join(ROOT, '.cache/wizzclip/voice-cache'), ...(o['dry-run'] ? ['--dry-run'] : [])], { cwd: ROOT, stdio: 'inherit' });
    if (r.status !== 0) throw new Error(`cartesia.py failed (exit ${r.status})`);
  } else if (['build', 'check', 'stills', 'preview', 'render'].includes(cmd)) {
    const ctx = load(id);
    const b = stage(ctx);
    console.log(`${id}: staged ${b.out} (${ctx.total} s, ${ctx.beats.length} beats + cover at ${b.coverStart} s)`);
    for (const w of b.warn) console.log(`  warning: ${w}`);
    if (cmd === 'check') run(['check', ...(o.json ? ['--json'] : [])], b.out);
    if (cmd === 'preview') run(['preview'], b.out);
    if (cmd === 'stills') {
      const mid = r3(ctx.total / 2);
      const at = o.at ? String(o.at) : [0, 5, 10, mid, r3(ctx.total - 0.05)].join(',');
      const dest = join(b.out, 'stills'); mkdirSync(dest, { recursive: true });
      run(['snapshot', '--at', at, '--no-end', '--keep', '-o', dest], b.out);
      console.log(`stills in ${dest}`);
    }
    if (cmd === 'render') {
      const name = typeof o.out === 'string' ? o.out.replace(/\.mp4$/i, '') : `news-${id}`;
      if (!/^[A-Za-z0-9._-]+$/.test(name)) throw new Error('Invalid --out name');
      const result = join(ROOT, 'out/wizzclip', `${name}.mp4`);
      const silent = JSON.parse(readFileSync(join(HERE, id, 'news.json'), 'utf8')).audio === false;
      if (existsSync(result) && !o.force) throw new Error(`${result} exists; pass --force to overwrite`);
      const raw = join(b.out, `render-${process.pid}.raw.mp4`);
      run(['render', '--quality', typeof o.quality === 'string' ? o.quality : 'looks', '-o', raw], b.out);
      if (!existsSync(raw) || statSync(raw).size === 0) throw new Error('HyperFrames did not create the raw render');
      if (o['no-master']) { console.log(`${id}: raw ${raw}`); }
      else if (silent) {
        if (existsSync(result)) rmSync(result);
        const ff = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-map', '0:v:0', '-c:v', 'copy', '-an', '-movflags', '+faststart', result], { stdio: 'inherit' });
        if (ff.status !== 0) throw new Error('ffmpeg failed while stripping audio');
        console.log(`${id}: ${result} (no audio: "audio": false)`);
        rmSync(raw, { force: true });
      }
      else {
        if (existsSync(result)) rmSync(result);
        const m = await masterVideo({ input: raw, output: result, bedPath: null, integrated: -14, truePeak: -1 });
        const qa = await masterQa(m.measured, { output: result, fps: FPS, integrated: -14, truePeak: -1 });
        console.log(`${id}: ${result}\n  ${qa.line}`);
        for (const w of qa.warnings) console.log(`  warning: ${w}`);
        rmSync(raw, { force: true });
      }
    }
  } else {
    console.log('Usage: node tools/wizzclip/news/render.mjs <list|build|check|stills|preview|render> <id> [--at t,t] [--quality q] [--out name] [--force] [--no-master]');
    process.exit(cmd ? 1 : 0);
  }
} catch (e) { console.error(`error: ${e.message}`); process.exit(1); }
