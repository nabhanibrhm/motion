// Compare deterministic scene output and timing to a pre-migration baseline.
// This verifies drawing markup; it is not a substitute for browser pixel review.
import { readFileSync, existsSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baselineDir = join(root, '.cache/migration-baseline');
const capture = process.argv.includes('--capture');
const json = path => JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const libraries = ['timing.js', 'core.js', 'mascot.js', 'toon.js', 'photo.js', 'words.js', 'bits.js', 'kasus.js', 'rig.js', 'world.js', 'cine.js'];

function context(libDir, voice, runtime) {
  const css = readFileSync(join(libDir, 'f1.css'), 'utf8');
  const vars = Object.fromEntries([...css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(m => [m[1], m[2].trim()]));
  const warnings = [];
  const c = vm.createContext({
    F1: { VOICE: voice, CONFIG: runtime }, window: { __timelines: {} },
    document: { documentElement: {}, createElement: () => ({}) },
    getComputedStyle: () => ({ getPropertyValue: name => vars[name] ?? '' }),
    console: { warn: message => warnings.push(message), log() {}, error() {} },
  });
  for (const file of libraries) if (existsSync(join(libDir, file))) vm.runInContext(readFileSync(join(libDir, file), 'utf8'), c, { filename: file, timeout: 5000 });
  return { c, warnings };
}

function sampleEpisode(id, legacy) {
  const old = join(root, 'out/Ekonomi_keuangan', id);
  const episode = join(root, 'episodes', id);
  const config = legacy ? null : json(join(episode, 'episode.json'));
  const voicePath = legacy ? join(old, `src/data/${id}-voice.json`) : join(root, `.cache/voice/${id}/manifest.json`);
  const voice = json(voicePath);
  const libDir = legacy ? join(old, 'lib/f1') : join(root, 'src/runtime/f1');
  const { c, warnings } = context(libDir, voice, config?.runtime);
  const sceneDefs = {};
  c.F1.scene = (sectionId, draw, options = {}) => {
    sceneDefs[sectionId] = { draw, options };
    return {};
  };
  const scenes = [];
  for (const section of voice.sections) {
    const sceneConfig = config?.scenes.find(s => s.id === section.id);
    const file = legacy ? join(old, `compositions/${section.id}.html`) : join(episode, sceneConfig.file);
    const html = readFileSync(file, 'utf8');
    for (const script of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)) vm.runInContext(script[1], c, { filename: `${id}/${section.id}`, timeout: 5000 });
    const def = sceneDefs[section.id];
    if (!def) throw new Error(`No drawing callback for ${id}/${section.id}`);
    const D = c.F1.sceneFrames(section.id);
    const frames = new Set([0, 1, 8, 14, Math.round(D / 2), D - 1]);
    for (const line of section.lines) {
      for (const word of line.words) {
        const at = Math.round(word.start * c.F1.FPS);
        for (const offset of [-1, 0, 1]) if (at + offset >= 0 && at + offset < D) frames.add(at + offset);
      }
    }
    const samples = [];
    for (const frame of [...frames].sort((a, b) => a - b)) {
      c.F1.uidScope(section.id);
      samples.push({ frame, hash: hash(def.draw(frame, { S: section, D, id: section.id })) });
    }
    scenes.push({ id: section.id, frames: D, sourceHash: hash(html), samples, captionsHash: hash(c.F1.captionGroups(section)) });
  }
  return { id, voiceHash: hash(voice), cssHash: hash(readFileSync(join(libDir, 'f1.css'))), timelineHash: hash(c.F1.segments()), scenes, warnings };
}

mkdirSync(baselineDir, { recursive: true });
const baselinePath = join(baselineDir, 'drawing-baseline.json');
if (capture) {
  if (existsSync(baselinePath)) throw new Error('Baseline already exists; refusing to overwrite it.');
  const ids = readdirSync(join(root, 'out/Ekonomi_keuangan')).filter(id => existsSync(join(root, `out/Ekonomi_keuangan/${id}/src/data/${id}-voice.json`)));
  const baseline = ids.map(id => sampleEpisode(id, true));
  writeFileSync(baselinePath, JSON.stringify(baseline, null, 2));
  console.log(`Captured ${baseline.length} episodes, ${baseline.reduce((n, e) => n + e.scenes.reduce((s, x) => s + x.samples.length, 0), 0)} procedural frame samples.`);
} else {
  const baseline = json(baselinePath);
  const results = [];
  for (const before of baseline) {
    const after = sampleEpisode(before.id, false);
    const failures = [];
    for (const key of ['voiceHash', 'cssHash', 'timelineHash']) if (before[key] !== after[key]) failures.push(key);
    for (const scene of before.scenes) {
      const next = after.scenes.find(s => s.id === scene.id);
      if (!next) { failures.push(`${scene.id}: missing`); continue; }
      for (const key of ['frames', 'sourceHash', 'captionsHash']) if (scene[key] !== next[key]) failures.push(`${scene.id}: ${key}`);
      for (const sample of scene.samples) if (next.samples.find(s => s.frame === sample.frame)?.hash !== sample.hash) failures.push(`${scene.id}: frame ${sample.frame}`);
    }
    const entry = { id: before.id, pass: failures.length === 0, sampledFrames: after.scenes.reduce((n, s) => n + s.samples.length, 0), failures, warnings: after.warnings };
    results.push(entry);
    console.log(`${entry.pass ? 'PASS' : 'FAIL'} ${entry.id}: ${entry.sampledFrames} procedural samples; ${failures.length} differences`);
  }
  mkdirSync(join(root, 'docs'), { recursive: true });
  writeFileSync(join(root, 'docs/refactor-fidelity.json'), JSON.stringify({ scope: 'Procedural HTML/SVG markup, scene source, voice manifest, caption grouping and timeline equality. Does not verify browser pixels or encoded audio.', results }, null, 2));
  if (results.some(r => !r.pass)) process.exitCode = 1;
}
