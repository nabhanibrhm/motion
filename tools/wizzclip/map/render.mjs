#!/usr/bin/env node
// Wizz Clip map explainer: a camera tour over an illustrated map, one official clip per place, recap, cover.
// 1080x1920, 30 fps, rendered with the repo's pinned HyperFrames 0.8.210, Wizz Clip look (Ink/Paper/Volt, Audex).
//
//   node tools/wizzclip/map/render.mjs fetch  <id>                 download the footage listed in <id>/video.json
//   node tools/wizzclip/map/render.mjs build  <id>                 stage .cache/wizzclip/map/<id>/
//   node tools/wizzclip/map/render.mjs stills <id> [--at 0,5,10]   build + PNGs in .cache/wizzclip/map/<id>/stills/
//   node tools/wizzclip/map/render.mjs render <id> [--force] [--quality looks]   -> out/wizzclip/<video.json out>.mp4
//
// Authored data in tools/wizzclip/map/<id>/: video.json (texts, timings, footage urls), map.svg + places.json
// (from make_map.py). Generated files under .cache/wizzclip/map/<id>/ are disposable.
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { masterVideo, masterQa } from '../../../src/pipeline/master.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../..');
const W = 1080, H = 1920, FPS = 30;
const C = { ink: '#0E0F12', graphite: '#1A1C21', mist: '#8C9099', paper: '#F4F3EF', volt: '#E6FC29' };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const accent = s => esc(s).replace(/\*([^*]+)\*/g, '<span class="vo">$1</span>');
const plain = s => s.replace(/\*/g, '');
const r3 = n => +n.toFixed(3);
const tool = (bin, args) => { const r = spawnSync(bin, args, { encoding: 'utf8', maxBuffer: 64 << 20 }); if (r.error) throw r.error; if (r.status !== 0) throw new Error(`${bin} failed: ${(r.stderr || '').slice(-1500)}`); return r.stdout; };


function load(id) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id || '')) throw new Error(`Invalid id "${id}"`);
  const dir = join(HERE, id);
  const v = JSON.parse(readFileSync(join(dir, 'video.json'), 'utf8'));
  const pj = JSON.parse(readFileSync(join(dir, 'places.json'), 'utf8'));
  for (const p of v.places) if (!pj.places[p.key]) throw new Error(`places.json has no "${p.key}"`);
  return { id, dir, v, map: pj };
}

// 1 s source loop -> half speed, then ping-pong (forward + reversed) = a seamless 4 s card clip, 1280x720
function cardClip(src, outFile) {
  if (existsSync(outFile) && statSync(outFile).mtimeMs > statSync(src).mtimeMs) return;
  mkdirSync(dirname(outFile), { recursive: true });
  tool('ffmpeg', ['-v', 'error', '-y', '-i', src, '-filter_complex',
    '[0:v]setpts=2*PTS,fps=30,scale=1280:-2:flags=lanczos,crop=1280:720,setsar=1,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1:a=0,format=yuv420p[v]',
    '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-g', '6', '-keyint_min', '6', '-sc_threshold', '0', '-movflags', '+faststart', outFile]);
}
function still(src, outFile) {
  if (existsSync(outFile)) return;
  mkdirSync(dirname(outFile), { recursive: true });
  tool('ffmpeg', ['-v', 'error', '-y', '-ss', '0.5', '-i', src, '-frames:v', '1', '-vf', 'scale=480:320:force_original_aspect_ratio=increase,crop=320:320', outFile]);
}

function stage(ctx) {
  const { id, v, map } = ctx;
  const out = join(ROOT, '.cache/wizzclip/map', id);
  const put = (rel, text) => { const p = join(out, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, text, 'utf8'); };
  const copy = (src, rel) => { const p = join(out, rel); mkdirSync(dirname(p), { recursive: true }); copyFileSync(src, p); };
  rmSync(join(out, 'lib'), { recursive: true, force: true });
  copy(join(ROOT, 'tools/wizzclip/fonts/Audex-Regular.ttf'), 'assets/fonts/Audex-Regular.ttf');
  copy(join(ROOT, 'assets/shared/fonts/JetBrainsMono-VF.ttf'), 'assets/fonts/JetBrainsMono-VF.ttf');
  const gsap = join(ROOT, 'node_modules/hyperframes/dist/vendor/npm/gsap@3.15.0/dist/gsap.min.js');
  if (!existsSync(gsap)) throw new Error('Pinned HyperFrames local GSAP 3.15.0 is missing; run npm ci');
  copy(gsap, 'lib/gsap.min.js');
  const musicSrc = v.music ? resolve(ROOT, v.music.src) : null;
  if (musicSrc) copy(musicSrc, 'assets/music/bed.mp3');
  for (const s of ['whoosh', 'pop', 'swoosh-soft']) copy(join(ROOT, 'assets/shared/sfx', `${s}.wav`), `assets/sfx/${s}.wav`);
  // camera framings (map px -> screen): overview/recap show the whole map, places zoom in
  const OV = map.overview, THUMB = map.thumbs || {}, u = 1 / OV.z; // u = map px per screen px at the overview
  const mapImg = resolve(ROOT, map.image);
  if (!existsSync(mapImg)) throw new Error(`map image missing: ${map.image} (run: node tools/wizzclip/map/render.mjs fetch ${id})`);
  copy(mapImg, 'assets/map.jpg');

  // timings
  const T = {}; let t = 0;
  T.hook = [0, v.hook.seconds]; t += v.hook.seconds;
  T.ov = [t, v.overview.seconds]; t += v.overview.seconds;
  T.places = v.places.map(() => { const s = [r3(t), v.placeSeconds]; t += v.placeSeconds; return s; });
  T.recap = [r3(t), v.recap.seconds]; t += v.recap.seconds;
  T.cover = [r3(t), v.cover]; t += v.cover;
  const total = r3(t);

  // footage
  const fdir = resolve(ROOT, v.footage.dir);
  const media = [], thumbs = [];
  v.places.forEach((p, i) => {
    const src = join(fdir, `${p.key}.mp4`);
    if (!existsSync(src)) throw new Error(`footage missing: ${src} (run: node tools/wizzclip/map/render.mjs fetch ${id})`);
    cardClip(src, join(out, `assets/clips/${p.key}.mp4`));
    still(src, join(out, `assets/thumbs/${p.key}.jpg`));
    const [s, d] = T.places[i];
    // clip runs from 0.3 s before its place (under the incoming card wipe) to the end of the place
    const cs = r3(Math.max(0, s - 0.3)), cd = r3(d + (s - cs));
    media.push(`<div class="card" id="card-${i}"><video id="vid-${i}" class="clip" src="assets/clips/${p.key}.mp4" data-start="${cs}" data-duration="${cd}" data-track-index="${i}" muted playsinline></video><div class="card-cr">GAMBAR: ROCKSTAR GAMES</div></div>`);
  });

  // map overlay (map px): rings, pins, labels, recap thumbs
  const P = map.places;
  const rings = v.places.map((p, i) => { const q = P[p.key]; return `<g id="ring-${i}" class="ring"><ellipse class="ro" cx="${q.x}" cy="${q.y}" rx="${q.r[0]}" ry="${q.r[1]}"/><ellipse class="rf" cx="${q.x}" cy="${q.y}" rx="${q.r[0]}" ry="${q.r[1]}"/></g>`; }).join('');
  const pins = v.places.map((p, i) => { const q = P[p.key]; return `<g id="pin-${i}" class="pin" style="transform-origin:${q.x}px ${q.y}px"><circle cx="${q.x}" cy="${q.y}" r="${r3(10 * u)}" class="pin-o"/><circle cx="${q.x}" cy="${q.y}" r="${r3(4.5 * u)}" class="pin-i"/></g>`; }).join('');
  const labels = v.places.map((p, i) => { const q = P[p.key]; const side = q.label || (q.x > map.width * 0.6 ? 'left' : 'right');
    const [lx, ly, anchor] = side === 'below' ? [q.x, q.y + 52 * u, 'middle'] : side === 'above' ? [q.x, q.y - 24 * u, 'middle'] : side === 'left' ? [q.x - 18 * u, q.y + 14 * u, 'end'] : [q.x + 18 * u, q.y + 14 * u, 'start'];
    return `<text id="lab-${i}" class="lab" x="${r3(lx)}" y="${r3(ly)}" text-anchor="${anchor}">${esc(q.name)}</text>`; }).join('');
  const vc = v.places.findIndex(p => p.key === 'vice-city');
  const [sx0, sy0, sw0, sh0] = map.strike;
  const hookLabel = `<g id="hk-lab"><rect id="hk-strike" x="${sx0}" y="${sy0 - sh0 / 2}" width="${sw0}" height="${sh0}" rx="${sh0 / 2}" class="strike"/></g>`;
  const thumbHTML = v.places.map((p, i) => { const [x, y] = THUMB[p.key] || [P[p.key].x, P[p.key].y]; return `<div class="thumb" data-layout-allow-overflow id="th-${i}" style="left:${r3(x - 90 * u)}px;top:${r3(y - 90 * u)}px"><img src="assets/thumbs/${p.key}.jpg" alt=""/><div class="th-lab">${esc(P[p.key].name)}</div></div>`; }).join('');
  const thumbLines = v.places.map((p, i) => { const [x, y] = THUMB[p.key] || [P[p.key].x, P[p.key].y]; const q = P[p.key]; return `<line id="tl-${i}" class="tline" x1="${q.x}" y1="${q.y}" x2="${x}" y2="${y}"/>`; }).join('');

  const placeUI = v.places.map((p, i) => `<div class="pl" id="pl-${i}"><div class="pl-count">LOKASI ${String(i + 1).padStart(2, '0')} / ${String(v.places.length).padStart(2, '0')}</div><div class="pl-name">${esc(P[p.key].name)}</div><div class="pl-tag">${esc(p.tag)}</div></div><div class="line-pill" id="pll-${i}">${esc(p.line)}</div>`).join('\n');
  const mark = `<svg class="mark" viewBox="0 0 100 100" aria-hidden="true"><polygon points="20,80 36,80 56,20 40,20" fill="${C.paper}"/><polygon points="46,80 62,80 82,20 66,20" fill="${C.volt}"/></svg>`;

  const cam = (x, y, z, sy) => ({ x: r3(540 - x * z), y: r3(sy - y * z), scale: z });
  const ov = cam(OV.cx, OV.cy, OV.z, OV.sy);
  const shots = v.places.map(p => { const q = P[p.key]; return cam(q.x, q.y, q.zoom, map.placeSy); });
  const hook0 = cam(map.hook.cx, map.hook.cy, map.hook.z, map.hook.sy);
  const plan = { T, total, ov, shots, hook0, n: v.places.length, vc };

  const audio = [];
  if (musicSrc) audio.push(`<audio id="music" src="assets/music/bed.mp3" data-start="0" data-duration="${total}" data-track-index="10" data-volume="${v.music.volume}" data-fade-out="1.5"></audio>`);
  let tr = 11;
  const sfx = (name, at, vol = v.music ? 0.3 : 0.6) => audio.push(`<audio id="sfx-${tr}" src="assets/sfx/${name}.wav" data-start="${r3(Math.max(0, at))}" data-track-index="${tr++}" data-volume="${vol}"></audio>`);
  sfx('whoosh', T.ov[0] - 0.12);
  sfx('pop', T.ov[0] + 0.45);
  T.places.forEach(([s]) => sfx('whoosh', s - 0.12));
  sfx('swoosh-soft', T.recap[0] - 0.1);
  sfx('pop', T.cover[0]);

  put('index.html', `<!doctype html>
<!-- GENERATED by tools/wizzclip/map/render.mjs from ${id}/video.json. Do not edit. -->
<html lang="id"><head><meta charset="UTF-8" /><meta name="viewport" content="width=${W}, height=${H}" /><title>${esc(plain(v.title))}</title>
<style>
@font-face { font-family: "Audex"; src: url("assets/fonts/Audex-Regular.ttf") format("truetype"); }
@font-face { font-family: "JetBrains Mono"; src: url("assets/fonts/JetBrainsMono-VF.ttf") format("truetype"); font-weight: 100 800; }
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: ${C.ink}; }
body { font-family: "Audex", sans-serif; color: ${C.paper}; font-synthesis: none; }
#root { position: relative; width: ${W}px; height: ${H}px; overflow: hidden; background: ${C.ink}; }
.vo { color: ${C.volt}; }
#cam { position: absolute; left: 0; top: 0; width: ${map.width}px; height: ${map.height}px; transform-origin: 0 0; }
#cam > img { position: absolute; left: 0; top: 0; width: ${map.width}px; height: ${map.height}px;${map.clip ? ` clip-path: inset(${map.clip[1]}px ${map.width - map.clip[2]}px ${map.height - map.clip[3]}px ${map.clip[0]}px);` : ''} }
#cam > svg { position: absolute; left: 0; top: 0; overflow: visible; }
.ring .rf { fill: rgba(230,252,41,0.18); stroke: ${C.volt}; stroke-width: 5; stroke-dasharray: 14 10; vector-effect: non-scaling-stroke; }
.ring .ro { fill: none; stroke: ${C.ink}; stroke-width: 11; vector-effect: non-scaling-stroke; opacity: 0.55; }
.pin-o { fill: ${C.ink}; stroke: ${C.paper}; stroke-width: ${r3(3.5 * u)}; } .pin-i { fill: ${C.volt}; }
.lab { font-family: "Audex"; font-size: ${r3(40 * u)}px; fill: ${C.paper}; paint-order: stroke; stroke: ${C.ink}; stroke-width: ${r3(9 * u)}px; stroke-linejoin: round; }
.strike { fill: ${C.volt}; stroke: ${C.ink}; stroke-width: 3; }
.tline { stroke: ${C.ink}; stroke-width: 4; stroke-dasharray: 8 8; vector-effect: non-scaling-stroke; }
.thumb { position: absolute; width: ${r3(180 * u)}px; height: ${r3(180 * u)}px; }
.thumb img { width: 100%; height: 100%; border-radius: 50%; border: ${r3(6 * u)}px solid ${C.paper}; object-fit: cover; display: block; }
.th-lab { position: absolute; left: 50%; top: ${r3(186 * u)}px; transform: translateX(-50%); white-space: nowrap; font-size: ${r3(42 * u)}px; color: ${C.paper}; padding: ${r3(4 * u)}px ${r3(12 * u)}px; border-radius: ${r3(10 * u)}px; background: ${C.ink}; }
#shade { position: absolute; inset: 0; background: linear-gradient(${C.ink} 0px, ${C.ink} 300px, rgba(14,15,18,0) 520px); }
#hdr { position: absolute; left: 72px; top: 192px; display: flex; align-items: center; gap: 14px; }
.mark { width: 60px; height: 60px; display: block; }
.wm { font-size: 54px; line-height: 1; } .wm b { font-weight: 400; color: ${C.volt}; }
.chip { font-family: "JetBrains Mono", monospace; font-weight: 500; font-size: 28px; line-height: 1; color: ${C.paper}; background: ${C.graphite}; padding: 15px 22px; border-radius: 10px; white-space: nowrap; }
#chip { position: absolute; right: 120px; top: 194px; }
#src { position: absolute; left: 84px; top: 282px; font-family: "JetBrains Mono", monospace; font-size: 24px; color: ${C.mist}; }
.box { position: absolute; left: 84px; width: 846px; background: ${C.ink}; border-radius: 18px; padding: 26px 30px; }
#hk-title { top: 340px; font-size: 92px; line-height: 1.04; }
.line-pill { position: absolute; left: 84px; top: 1500px; max-width: 846px; width: fit-content; padding: 16px 26px 12px; border-radius: 14px; background: ${C.ink}; font-size: 52px; line-height: 1.05; white-space: nowrap; }
#ov-box { position: absolute; left: 84px; top: 1080px; width: 380px; height: 480px; background: ${C.ink}; border-radius: 16px; }
#ov-big { position: absolute; left: 112px; top: 1100px; font-size: 280px; line-height: 1; color: ${C.volt}; }
#ov-line { position: absolute; left: 112px; top: 1380px; font-size: 52px; line-height: 1.06; width: 330px; }
.card { position: absolute; left: 84px; top: 380px; width: 846px; height: 476px; border-radius: 20px; overflow: hidden; background: ${C.graphite}; border: 4px solid ${C.paper}; }
.card video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.card-cr { position: absolute; left: 14px; bottom: 14px; font-family: "JetBrains Mono", monospace; font-size: 20px; color: ${C.mist}; background: ${C.ink}; padding: 6px 10px; border-radius: 8px; }
.pl { position: absolute; left: 84px; top: 330px; width: 846px; height: 900px; }
.pl-count { position: absolute; left: 0; top: -2px; font-family: "JetBrains Mono", monospace; font-weight: 500; font-size: 26px; color: ${C.mist}; display: none; }
.pl-name { position: absolute; left: 0; top: 556px; font-size: 104px; line-height: 1; white-space: nowrap; paint-order: stroke; text-shadow: 0 0 18px ${C.ink}, 0 0 6px ${C.ink}; }
.pl-tag { position: absolute; left: 0; top: 680px; font-family: "JetBrains Mono", monospace; font-weight: 500; font-size: 30px; color: ${C.ink}; background: ${C.paper}; padding: 12px 18px; border-radius: 10px; white-space: nowrap; }
#count { position: absolute; left: 84px; top: 334px; font-family: "JetBrains Mono", monospace; font-weight: 500; font-size: 28px; color: ${C.paper}; }
#count b { font-weight: 500; color: ${C.volt}; }
#rc-line { top: 330px; font-size: 76px; line-height: 1.04; }
#rc-q { position: absolute; left: 84px; top: 1150px; width: 390px; font-size: 60px; line-height: 1.06; color: ${C.volt}; background: ${C.ink}; padding: 22px 26px; border-radius: 16px; }
#cover { position: absolute; inset: 0; background: rgba(14,15,18,0.86); }
.ring, .pin, .lab, .thumb, .tline, #ov-box, #ov-big, #ov-line, .card, .pl, .line-pill:not(#hk-line), #rc-line, #rc-q, #cover, #count { opacity: 0; visibility: hidden; }
#cv-title { position: absolute; left: 84px; top: 640px; width: 846px; font-size: 140px; line-height: 1.02; }
#cv-chip { position: absolute; left: 84px; top: 540px; }
#cv-brand { position: absolute; left: 60px; top: 1120px; display: flex; align-items: center; gap: 20px; }
#cv-brand .mark { width: 120px; height: 120px; } #cv-brand .wm { font-size: 108px; }
</style>
<script src="lib/gsap.min.js"></script>
</head><body>
<div id="root" data-composition-id="map" data-start="0" data-duration="${total}" data-fps="${FPS}" data-width="${W}" data-height="${H}">
<div id="cam"><img src="assets/map.jpg" alt="" data-layout-ignore/><svg viewBox="0 0 ${map.width} ${map.height}" width="${map.width}" height="${map.height}">
<g id="tlines">${thumbLines}</g>${rings}${pins}<g id="labs">${labels}</g>${hookLabel}</svg>
${thumbHTML}</div>
<div id="shade"></div>
<div id="hdr">${mark}<span class="wm">wizz<b>clip</b></span></div>
<div id="chip" class="chip">${esc(v.chip)}</div>
<div id="src" data-layout-ignore>${esc(v.credit)}</div>
<div class="box" id="hk-title">${accent(v.hook.title)}</div>
<div class="line-pill" id="hk-line">${esc(v.hook.line)}</div>
<div id="ov-box"></div><div id="ov-big">${esc(v.overview.big)}</div>
<div id="ov-line">${esc(v.overview.line)}</div>
${media.join('\n')}
${placeUI}
<div id="count"></div>
<div class="box" id="rc-line">${esc(v.recap.line)}</div>
<div id="rc-q">${esc(v.recap.question)}</div>
<div id="cover"><div id="cv-chip" class="chip">${esc(v.chip)}</div><div id="cv-title">${accent(v.title)}</div><div id="cv-brand">${mark}<span class="wm">wizz<b>clip</b></span></div></div>
${audio.join('\n')}
</div>
<script>
(function () {
  var P = ${JSON.stringify(plan)};
  var E = "power3.out", tl = gsap.timeline({ paused: true });
  var hide = function (sel, at) { tl.set(sel, { autoAlpha: 0 }, at); };
  var show = function (sel, at) { tl.set(sel, { autoAlpha: 1 }, at); };
  var wipeIn = function (sel, at, d) { tl.fromTo(sel, { clipPath: "inset(-10% 100% -10% -2%)", x: -30 }, { clipPath: "inset(-10% -4% -10% -2%)", x: 0, duration: d || 0.36, ease: E, immediateRender: false }, at); };
  var fadeOut = function (sel, at) { tl.to(sel, { autoAlpha: 0, duration: 0.16, ease: "power2.in" }, at); };
  // initial state (frame 0 = hook, fully visible)
  tl.set("#cam", P.hook0, 0);
  tl.set("#hk-strike", { scaleX: 0, transformOrigin: "100% 50%", transformBox: "fill-box" }, 0);
  // hook: slow push, strike VICE CITY, then pull out to the whole map
  var h = P.T.hook;
  tl.to("#cam", { scale: P.hook0.scale * 1.04, x: P.hook0.x - 30, y: P.hook0.y - 40, duration: h[1] - 0.6, ease: "none" }, 0);
  tl.to("#hk-strike", { scaleX: 1, duration: 0.3, ease: "power2.out" }, 1.25);
  fadeOut("#hk-title, #hk-line, #hk-lab", h[1] - 0.2);
  tl.to("#cam", { x: P.ov.x, y: P.ov.y, scale: P.ov.scale, duration: 0.75, ease: "power2.inOut" }, h[1] - 0.25);
  // overview: big 6, pins and labels pop in
  var o = P.T.ov[0];
  tl.fromTo("#ov-box", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, immediateRender: false }, o + 0.3);
  tl.fromTo("#ov-big", { autoAlpha: 0, scale: 0.6, transformOrigin: "0% 50%" }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "back.out(2)", immediateRender: false }, o + 0.35);
  wipeIn("#ov-line", o + 0.5);
  show("#ov-line", o + 0.5);
  for (var i = 0; i < P.n; i++) {
    tl.fromTo("#pin-" + i, { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: 0.25, ease: "back.out(2.5)", immediateRender: false }, o + 0.5 + i * 0.16);
    tl.fromTo("#lab-" + i, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, immediateRender: false }, o + 0.58 + i * 0.16);
  }
  fadeOut("#ov-box, #ov-big, #ov-line, #labs .lab", P.T.places[0][0] - 0.25);
  // places
  for (var k = 0; k < P.n; k++) {
    var s = P.T.places[k][0], d = P.T.places[k][1], sh = P.shots[k];
    tl.to("#cam", { x: sh.x, y: sh.y, scale: sh.scale, duration: 0.7, ease: "power2.inOut" }, s - 0.3);
    tl.to("#cam", { scale: sh.scale * 1.05, x: sh.x - (540 - sh.x) * 0.0 - 27, y: sh.y - 66, duration: d - 0.5, ease: "none" }, s + 0.4);
    tl.to(".pin", { autoAlpha: 0.3, duration: 0.2 }, s - 0.3);
    tl.to("#pin-" + k, { autoAlpha: 1, duration: 0.2 }, s - 0.3);
    tl.fromTo("#ring-" + k, { autoAlpha: 0, scale: 0.7, transformOrigin: "50% 50%", transformBox: "fill-box" }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(1.8)", immediateRender: false }, s + 0.1);
    tl.set("#count", { innerHTML: "LOKASI <b>" + String(k + 1).padStart(2, "0") + "</b> / " + String(P.n).padStart(2, "0") }, s - 0.05);
    if (k === 0) tl.fromTo("#count", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, immediateRender: false }, s - 0.05);
    tl.fromTo("#card-" + k, { autoAlpha: 1, clipPath: "inset(0% 100% 0% 0% round 20px)" }, { clipPath: "inset(0% 0% 0% 0% round 20px)", duration: 0.42, ease: E, immediateRender: false }, s - 0.2);
    show("#pl-" + k, s);
    tl.fromTo("#pl-" + k + " .pl-name", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.32, ease: E, immediateRender: false }, s + 0.05);
    tl.fromTo("#pl-" + k + " .pl-tag", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.28, ease: E, immediateRender: false }, s + 0.18);
    wipeIn("#pll-" + k, s + 0.9); show("#pll-" + k, s + 0.9);
    var end = s + d;
    fadeOut("#pl-" + k + ", #pll-" + k + ", #ring-" + k, end - 0.22);
    if (k < P.n - 1) tl.set("#card-" + k, { autoAlpha: 0 }, end + 0.25);
    else fadeOut("#card-" + k + ", #count", end - 0.22);
  }
  // recap: whole map, thumbs on leader lines, line + question
  var r = P.T.recap[0];
  tl.to("#cam", { x: P.ov.x, y: P.ov.y, scale: P.ov.scale, duration: 0.7, ease: "power2.inOut" }, r - 0.3);
  tl.to(".pin", { autoAlpha: 1, duration: 0.2 }, r - 0.2);
  wipeIn("#rc-line", r + 0.1); show("#rc-line", r + 0.1);
  for (var j = 0; j < P.n; j++) {
    tl.fromTo("#tl-" + j, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, immediateRender: false }, r + 0.3 + j * 0.12);
    tl.fromTo("#th-" + j, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: "back.out(2)", immediateRender: false }, r + 0.3 + j * 0.12);
  }
  tl.fromTo("#rc-q", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: E, immediateRender: false }, r + 1.3);
  // cover
  var c = P.T.cover[0];
  fadeOut("#rc-line, #rc-q, #hdr, #chip, #src, .thumb, .tline", c - 0.18);
  tl.fromTo("#cover", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.18, immediateRender: false }, c - 0.1);
  tl.fromTo("#cv-title", { clipPath: "inset(-8% 100% -12% -2%)", x: -44 }, { clipPath: "inset(-8% -4% -12% -2%)", x: 0, duration: 0.36, ease: E, immediateRender: false }, c + 0.02);
  tl.fromTo("#cv-chip, #cv-brand", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.28, ease: E, immediateRender: false }, c + 0.1);
  tl.to({}, { duration: P.total }, 0);
  window.__timelines = window.__timelines || {};
  window.__timelines["map"] = tl;
})();
</script>
</body></html>
`);
  put('hyperframes.json', JSON.stringify({ paths: { blocks: 'compositions', components: 'compositions/components', assets: 'assets' }, media: { autoProxy: true } }, null, 2) + '\n');
  return { out, total, T };
}

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

const argv = process.argv.slice(2), o = {}, pos = [];
for (let i = 0; i < argv.length; i++) { const a = argv[i]; if (a.startsWith('--')) { const k = a.slice(2); if (['force'].includes(k)) o[k] = true; else o[k] = argv[++i]; } else pos.push(a); }
const [cmd, id] = pos;
try {
  if (cmd === 'fetch') {
    const { v, map } = load(id); const dir = resolve(ROOT, v.footage.dir); mkdirSync(dir, { recursive: true });
    const mi = resolve(ROOT, map.image);
    if (!existsSync(mi)) { mkdirSync(dirname(mi), { recursive: true }); tool('curl', ['-sSfL', '-A', 'Mozilla/5.0', '-o', mi, map.url]); console.log('got map'); } else console.log('have map');
    for (const [k, u] of Object.entries(v.footage.urls)) {
      const f = join(dir, `${k}.mp4`);
      if (existsSync(f)) { console.log(`have ${k}`); continue; }
      tool('curl', ['-sSfL', '-A', 'Mozilla/5.0', '-o', f, u]); console.log(`got ${k}`);
    }
  } else if (['build', 'stills', 'check', 'render'].includes(cmd)) {
    const ctx = load(id); const b = stage(ctx);
    console.log(`${id}: staged ${b.out} (${b.total} s)`);
    if (cmd === 'check') run(['check'], b.out);
    if (cmd === 'stills') {
      const at = o.at || [0, 3.6, 6.2, 9.6, 26.4, r3(b.total - 0.05)].join(',');
      const dest = join(b.out, 'stills'); mkdirSync(dest, { recursive: true });
      run(['snapshot', '--at', at, '--no-end', '--keep', '-o', dest], b.out);
      console.log(`stills in ${dest}`);
    }
    if (cmd === 'render') {
      const name = ctx.v.out || `map-${id}`;
      const result = join(ROOT, 'out/wizzclip', `${name}.mp4`);
      if (existsSync(result) && !o.force) throw new Error(`${result} exists; pass --force`);
      const raw = join(b.out, `render-${process.pid}.raw.mp4`);
      run(['render', '--quality', o.quality || 'looks', '-o', raw], b.out);
      if (existsSync(result)) rmSync(result);
      if (!ctx.v.music) {
        // no music bed: loudnorm would blow the mostly-silent sfx track up to -14 LUFS, so keep the sfx at their mixed
        // level and only cap the peaks (-1.5 dBFS); the user adds the soundtrack on the platform
        tool('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-c:v', 'copy', '-af', 'alimiter=limit=0.84:level=false:attack=2:release=60,aresample=48000', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', result]);
        rmSync(raw, { force: true });
        console.log(`${id}: ${result} (no music bed; sfx only, not loudness-normalised)`);
        process.exit(0);
      }
      // whoosh/pop transients over the quiet bed push the true peak over -1 dBTP after loudnorm: limit the raw mix first
      const lim = raw.replace(/\.raw\.mp4$/, '.lim.mp4');
      tool('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-c:v', 'copy', '-af', 'alimiter=limit=0.3:level=false:attack=2:release=60', '-c:a', 'pcm_s16le', lim.replace(/\.mp4$/, '.mov')]);
      rmSync(raw, { force: true }); renameSync(lim.replace(/\.mp4$/, '.mov'), raw.replace(/\.mp4$/, '.mov'));
      const m = await masterVideo({ input: raw.replace(/\.mp4$/, '.mov'), output: result, bedPath: null, integrated: -14, truePeak: -1 });
      rmSync(raw.replace(/\.mp4$/, '.mov'), { force: true });
      const qa = await masterQa(m.measured, { output: result, fps: FPS, integrated: -14, truePeak: -1 });
      console.log(`${id}: ${result}\n  ${qa.line}`);
      for (const w of qa.warnings) console.log(`  warning: ${w}`);
      rmSync(raw, { force: true });
    }
  } else {
    console.log('Usage: node tools/wizzclip/map/render.mjs <fetch|build|check|stills|render> <id> [--at t,t] [--force]');
    process.exit(cmd ? 1 : 0);
  }
} catch (e) { console.error(`error: ${e.message}`); process.exit(1); }
