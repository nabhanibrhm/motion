import { createHash } from 'node:crypto';
import { promises as fs, existsSync } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { withLock } from './lock.mjs';

const digest = b => createHash('sha256').update(b).digest('hex');
const hashFile = async p => digest(await fs.readFile(p));
const present = async p => fs.lstat(p).then(s => s.isFile() && !s.isSymbolicLink() && s.size > 0, () => false);
const SAFE = /^[a-z0-9][a-z0-9-]*$/;
const MODULE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
async function rejectLinks(root) {
  const st = await fs.lstat(root);
  if (st.isSymbolicLink()) throw new Error(`Refusing symlink: ${root}`);
  if (st.isDirectory()) for (const name of await fs.readdir(root)) await rejectLinks(path.join(root,name));
  else if (!st.isFile()) throw new Error(`Refusing special file: ${root}`);
}
export const STATE_VERSION = 4;
export const CARTESIA_DEFAULTS = { model: 'sonic-3.6', language: 'id-ID', speed: 1, sampleRate: 44100, dictionary: 'config/cartesia-pronunciation.json' };
/** Python packages whose versions can change voice output, per source (pins parsed from requirements-lock.txt). */
export const VOICE_PACKAGES = { common: ['faster-whisper', 'ctranslate2', 'numpy'], supertonic: ['supertonic', 'onnxruntime', 'praat-parselmouth'] };
/**
 * Output-affecting parts of tools/voice/*.py, by version in tools/voice/versions.json.
 * tests/voice-key.test.mjs fails when one of these changes and versions.json.guard was not updated:
 * bump the matching version when the output changes (every cache of that kind becomes stale).
 */
export const GUARD_GROUPS = {
  align: { file: 'generate.py', names: ['WHISPER_MODEL', 'norm', 'speech_bounds', 'snap_onsets', 'align', 'span', 'align_file'] },
  pitch: { file: 'generate.py', names: ['pitch_window', 'widen_pitch'] },
  assembly: { file: 'generate.py', names: ['SR', 'TARGET_RMS', 'PEAK_CEIL', 'MARKER', 'SUPERTONIC_STEPS', 'respell', 'synth_supertonic_unlocked', 'supertonic_render', 'line_file', 'decode', 'level', 'encode', 'build_section', 'main'] },
  cartesia: { file: 'cartesia.py', names: ['API_VERSION', 'DEFAULTS', 'MARKER', 'load_dictionary', 'respell', 'options', 'plan', 'tts'] },
};
/**
 * Hash each guard group from the Python sources ({"generate.py": text, "cartesia.py": text}): top-level
 * `def name` blocks and `NAME = …` assignments (with their indented continuation lines), in group order.
 */
export function voiceGuard(sources) {
  const block = (file, name) => {
    const lines = sources[file].replace(/\r\n/g, '\n').split('\n');
    const i = lines.findIndex(l => new RegExp(`^(?:async )?def ${name}\\(`).test(l) || new RegExp(`^${name}\\s*=`).test(l));
    if (i < 0) throw new Error(`${file} has no top-level ${name}`);
    const def = /^(?:async )?def /.test(lines[i]);
    let j = i + 1;
    while (j < lines.length && ((def && lines[j] === '') || /^\s+\S/.test(lines[j]))) j++;
    while (j > i + 1 && lines[j - 1] === '') j--;
    return lines.slice(i, j).join('\n');
  };
  return Object.fromEntries(Object.entries(GUARD_GROUPS).map(([group, { file, names }]) => [group, digest(names.map(n => block(file, n)).join('\n\n'))]));
}

/** Cartesia narrations inherit provider defaults and each speaker's Cartesia voice from config/speakers.json. */
export function effectiveNarration(ctx) {
  const n = ctx.narration;
  if (n?.source !== 'cartesia') return n;
  const known = ctx.config?.voice?.speakers || {};
  const speakers = Object.fromEntries(Object.entries(n.speakers || {}).map(([k, s]) => [k, { ...s, cartesia: { ...(known[k]?.cartesia || {}), ...(s.cartesia || {}) } }]));
  return { ...n, cartesia: { ...CARTESIA_DEFAULTS, ...(n.cartesia || {}) }, speakers };
}
function dictionaryPath(ctx, rel) {
  const abs = path.resolve(ctx.repoRoot, rel), back = path.relative(ctx.repoRoot, abs);
  if (path.isAbsolute(rel) || back.startsWith('..')) throw new Error(`Cartesia dictionary escapes the repository: ${rel}`);
  return abs;
}
const sortKeys = v => Array.isArray(v) ? v.map(sortKeys) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().filter(k => v[k] !== undefined).map(k => [k, sortKeys(v[k])])) : v;
export const canonical = v => JSON.stringify(sortKeys(v) ?? null);
const MARKER = /\[(?:pause|hold)\s+([\d.]+)\]/g;
const strip = text => text.replace(MARKER, ' ').replace(/\s+/g, ' ').trim();
const usedSpeakers = n => [...new Set((n.sections || []).flatMap(s => (s.lines || []).map(l => l.speaker)))].sort();
/** The options cartesia.py actually uses (its options(): a null value falls back to the default, except dictionary). */
function cartesiaOptions(n) {
  const out = { ...CARTESIA_DEFAULTS };
  for (const [k, v] of Object.entries(n.cartesia || {})) if (v !== null || k === 'dictionary') out[k] = v;
  return out;
}
/** Dictionary entries that can affect this episode: their text occurs (case-insensitively) in a line or in cartesia.say. */
async function relevantDictionary(ctx, n, opts) {
  if (!opts.dictionary) return [];
  const items = JSON.parse((await fs.readFile(dictionaryPath(ctx, opts.dictionary), 'utf8')).replace(/^﻿/, ''));
  if (!Array.isArray(items) || !items.every(i => i && typeof i.text === 'string' && typeof i.pronunciation === 'string')) throw new Error(`${opts.dictionary} must be a JSON array of {"text", "pronunciation"} entries`);
  const corpus = [...(n.sections || []).flatMap(s => s.lines.map(l => l.text)), ...Object.entries(opts.say || {}).flat()].join('\n').toLowerCase();
  return items.filter(i => corpus.includes(i.text.toLowerCase())).map(i => Object.fromEntries(['text', 'pronunciation', 'case_sensitive'].filter(k => k in i).map(k => [k, i[k]])));
}
/** What the generators read from the narration: no comments, no unused speakers, only the provider's speaker settings. */
export async function narrationInputs(ctx) {
  const n = effectiveNarration(ctx), source = n.source;
  const provider = source === 'supertonic' || source === 'cartesia' ? source : null;
  const out = {
    source, chapters: n.chapters, defaults: n.defaults,
    sections: (n.sections || []).map(s => ({ id: s.id, chapter: s.chapter, lines: (s.lines || []).map(l => ({ speaker: l.speaker, text: l.text, ...(l.after != null ? { after: l.after } : {}) })) })),
    speakers: Object.fromEntries(usedSpeakers(n).map(k => [k, provider ? n.speakers?.[k]?.[provider] ?? null : null])),
  };
  if (source === 'supertonic' && n.say && Object.keys(n.say).length) out.say = n.say;
  if (source === 'cartesia') {
    const { dictionary, ...opts } = cartesiaOptions(n);
    out.cartesia = opts;
    out.dictionary = await relevantDictionary(ctx, n, { ...opts, dictionary });
  }
  return out;
}
async function voiceVersions(ctx) {
  // A test fixture may have no tools/voice/versions.json; it then shares this checkout's versions.
  let file = path.join(ctx.repoRoot, 'tools', 'voice', 'versions.json');
  if (!existsSync(file)) file = path.join(MODULE_ROOT, 'tools', 'voice', 'versions.json');
  const v = JSON.parse(await fs.readFile(file, 'utf8'));
  for (const k of ['assembly', 'align', 'pitch', 'cartesia']) if (!Number.isSafeInteger(v[k])) throw new Error(`versions.json: ${k} must be an integer`);
  return v;
}
async function packagePins(ctx, source) {
  const pins = {};
  for (const line of (await fs.readFile(path.join(ctx.repoRoot, 'requirements-lock.txt'), 'utf8')).split(/\r?\n/)) {
    const m = line.trim().match(/^([A-Za-z0-9._-]+)\s*==\s*([^\s;#]+)/);
    if (m) pins[m[1].toLowerCase().replace(/[._]/g, '-')] = m[2];
  }
  const names = [...VOICE_PACKAGES.common, ...(source === 'supertonic' ? VOICE_PACKAGES.supertonic : [])];
  return Object.fromEntries(names.map(k => [k, pins[k] ?? null]));
}
async function sourcesFor(ctx, n) {
  const sources = {}, cartesia = n.source === 'cartesia';
  if (n.source !== 'files' && !cartesia) return null;
  for (const section of n.sections) for (let i = 0; i < section.lines.length; i++) {
    if (!SAFE.test(section.id || '')) throw new Error('Invalid section id');
    await rejectLinks(path.join(ctx.episodeDir, 'voice-lines'));
    const base = path.join(ctx.episodeDir, 'voice-lines', `${section.id}-${i}`);
    const file = !cartesia && await present(`${base}.mp3`) ? `${base}.mp3` : `${base}.wav`;
    try { sources[path.basename(file)] = await hashFile(file); } catch (e) { if (e.code === 'ENOENT') throw new Error(`Missing voice clip: ${file}`); throw e; }
  }
  return sources;
}
async function inputsFor(ctx) {
  const n = effectiveNarration(ctx), versions = await voiceVersions(ctx);
  const inputs = {
    source: n.source,
    narration: digest(canonical(await narrationInputs(ctx))),
    versions: { assembly: versions.assembly, align: versions.align, ...(n.source === 'supertonic' ? { pitch: versions.pitch } : {}), ...(n.source === 'cartesia' ? { cartesia: versions.cartesia } : {}) },
    packages: await packagePins(ctx, n.source),
    whisper: process.env.WHISPER_MODEL || 'small',
  };
  const sources = await sourcesFor(ctx, n);
  if (sources) inputs.sources = sources;
  return inputs;
}
async function outputsFor(ctx, manifestPath, voiceDir) {
  await rejectLinks(manifestPath);
  await rejectLinks(path.join(voiceDir, 'voice'));
  const manifestBytes = await fs.readFile(manifestPath);
  const manifest = JSON.parse(manifestBytes);
  const files = {};
  for (const section of manifest.sections) {
    const rel = section.audio;
    if (!SAFE.test(section.id || '') || rel !== `voice/${ctx.id}/${section.id}.mp3`) throw new Error(`Invalid voice path: ${rel}`);
    const p = path.join(voiceDir, ...rel.split('/'));
    if (!await present(p)) throw new Error(`Missing voice audio: ${p}`);
    files[rel] = await hashFile(p);
  }
  return { manifest: digest(manifestBytes), files };
}
async function fingerprint(ctx, manifestPath, voiceDir) {
  return { version: STATE_VERSION, inputs: await inputsFor(ctx), outputs: await outputsFor(ctx, manifestPath, voiceDir) };
}
const short = v => { const s = typeof v === 'string' ? v : canonical(v); return s.length > 24 ? `${s.slice(0, 12)}…` : s; };
/** Paths where two plain-JSON values differ, e.g. "inputs.packages.numpy 2.5.4 -> 2.6.0". */
function differences(a, b, at) {
  const obj = v => v && typeof v === 'object' && !Array.isArray(v);
  if (obj(a) && obj(b)) return [...new Set([...Object.keys(a), ...Object.keys(b)])].sort().flatMap(k => differences(a[k], b[k], `${at}.${k}`));
  return canonical(a) === canonical(b) ? [] : [`${at} ${a === undefined ? '(none)' : short(a)} -> ${b === undefined ? '(none)' : short(b)}`];
}
/** Whether the cached voice matches the current inputs and outputs; reasons name what differs. */
export async function same(ctx) {
  let state;
  try { state = JSON.parse(await fs.readFile(ctx.paths.voiceState, 'utf8')); }
  catch (e) { return { ok: false, reasons: [e.code === 'ENOENT' ? 'no voice cache (state.json missing)' : `unreadable state.json: ${e.message}`] }; }
  if (state?.version !== STATE_VERSION) return { ok: false, state, reasons: [`state v${state?.version ?? '?'}, expected v${STATE_VERSION}; try voice ${ctx.id} --restamp`] };
  let now;
  try { now = await fingerprint(ctx, ctx.paths.voiceManifest, ctx.paths.voiceDir); } catch (e) { return { ok: false, state, reasons: [e.message] }; }
  const reasons = [...differences(state.inputs, now.inputs, 'inputs'), ...differences(state.outputs, now.outputs, 'outputs')];
  return { ok: reasons.length === 0, state, reasons };
}
const staleError = (ctx, reasons) => new Error(`Voice cache missing or stale for ${ctx.id} (${reasons.slice(0, 6).join('; ')}${reasons.length > 6 ? `; +${reasons.length - 6} more` : ''}); run the explicit voice command.`);
async function execute(command, args, options, label = 'Voice generator') {
  await new Promise((resolve, reject) => { const p = spawn(command, args, { ...options, stdio: 'inherit' }); p.once('error', reject); p.once('exit', c => c === 0 ? resolve() : reject(Object.assign(new Error(`${label} exited ${c}`), { exitCode: c }))); });
}
const readManifest = async ctx => JSON.parse(await fs.readFile(ctx.paths.voiceManifest, 'utf8'));
export async function ensureVoice(ctx, options = {}) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(ctx.id)) throw new Error('Invalid episode id');
  const modes = ['force', 'offline', 'restamp', 'adopt', 'adoptStructural'].filter(k => options[k]);
  if (modes.length > 1) throw new Error(`Choose one of --${modes.map(k => k.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)).join(', --')}`);
  if (options.checkOnly) {
    const status = await same(ctx);
    if (!status.ok) throw staleError(ctx, status.reasons);
    return { manifest: await readManifest(ctx), manifestPath: ctx.paths.voiceManifest, cacheHit: true };
  }
  const parent = path.dirname(ctx.paths.voiceDir);
  await fs.mkdir(parent, { recursive: true });
  return withVoiceLock(ctx, () => ensureVoiceLocked(ctx, options), { log: options.log });
}
/** Hold `.cache/voice/<id>.lock` through work: registered for releaseHeldLocksSync, broken when its owner died on this machine. */
export async function withVoiceLock(ctx, work, { log } = {}) {
  const lock = `${ctx.paths.voiceDir}.lock`;
  return withLock(lock, work, { owner: { id: ctx.id, kind: 'voice' }, ...(log ? { log } : {}),
    stale: o => `Removed stale voice lock for ${ctx.id}: process ${o.pid} on ${o.host} is no longer running`,
    busy: () => new Error(`Voice operation already running or lock requires inspection: ${lock}`) });
}
const python = ctx => path.join(ctx.repoRoot, '.venv', ...(process.platform === 'win32' ? ['Scripts', 'python.exe'] : ['bin', 'python']));
/** cartesia.py lines on the effective narration. mode: null (synthesise changed lines), 'offline' (local clips/cache only), 'verify' (no writes). */
async function cartesiaLines(ctx, narrationFile, { force = false, mode = null } = {}) {
  const args = [path.join(ctx.repoRoot, 'tools', 'voice', 'cartesia.py'), 'lines', narrationFile, '--lines', path.join(ctx.episodeDir, 'voice-lines'), '--cache', ctx.paths.chunkCacheDir, ...(force ? ['--force'] : []), ...(mode ? [`--${mode}`] : [])];
  try { await execute(python(ctx), args, { cwd: ctx.repoRoot, env: process.env }, 'cartesia.py'); }
  catch (e) {
    if (e.exitCode !== 3) throw e;
    if (mode === 'verify') throw new Error(`Cartesia clips for ${ctx.id} are not all current for the narration; --restamp and --adopt need them current (run voice ${ctx.id} --offline if they are in the local cache, else voice ${ctx.id})`);
    throw new Error(`Cartesia clips for ${ctx.id} need the Cartesia API, which --offline never calls; run voice ${ctx.id} without --offline`);
  }
}
/** Run the providers into tmp. offline: no Cartesia API, no Supertonic synthesis. reproduce: additionally no model at all (cache only) and no clip writes. */
async function generateInto(ctx, tmp, { force = false, offline = false, reproduce = false } = {}) {
  try { await fs.cp(path.join(ctx.paths.voiceDir, 'legacy-chunks'), path.join(tmp, 'legacy-chunks'), { recursive: true }); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  await fs.mkdir(ctx.paths.chunkCacheDir, { recursive: true });
  const narration = path.join(tmp, 'effective-narration.json');
  const effective = effectiveNarration(ctx);
  await fs.writeFile(narration, JSON.stringify(effective));
  if (effective.source === 'cartesia') {
    // Synthesise changed lines into voice-lines/, then align them exactly like a files-mode episode.
    await cartesiaLines(ctx, narration, { force, mode: reproduce ? 'verify' : offline ? 'offline' : null });
    await fs.writeFile(narration, JSON.stringify({ ...effective, source: 'files' }));
  }
  const env = { ...process.env, MOTION_VOICE_ROOT: tmp, MOTION_CHUNK_CACHE: ctx.paths.chunkCacheDir, MOTION_EPISODE_ID: ctx.id, MOTION_LEGACY_CHUNKS: path.join(ctx.paths.voiceDir, 'legacy-chunks'), VOICE_LINES: path.join(ctx.episodeDir, 'voice-lines') };
  if (offline || reproduce) env.MOTION_NO_SYNTH = '1';
  if (reproduce) env.MOTION_NO_MODELS = '1';
  await execute(python(ctx), [path.join(ctx.repoRoot, 'tools', 'voice', 'generate.py'), narration], { cwd: ctx.repoRoot, env });
  await fs.rm(narration, { force: true });
}
async function ensureVoiceLocked(ctx, { generate = false, force = false, offline = false, restamp = false, adopt = false, adoptStructural = false, importLegacy = null } = {}) {
  if (restamp || adopt || adoptStructural) return restampLocked(ctx, { adopt: adopt || adoptStructural, structural: adoptStructural });
  if (!force) {
    const status = await same(ctx);
    if (status.ok) return { manifest: await readManifest(ctx), manifestPath: ctx.paths.voiceManifest, cacheHit: true };
    if (!generate && !importLegacy) throw staleError(ctx, status.reasons);
  } else if (!generate && !importLegacy) throw staleError(ctx, ['--force without generation']);
  const parent = path.dirname(ctx.paths.voiceDir);
  await fs.mkdir(parent, { recursive: true });
  const tmp = await fs.mkdtemp(path.join(parent, `${ctx.id}-tmp-`));
  try {
    if (importLegacy) {
      if (!path.isAbsolute(importLegacy)) throw new Error('importLegacy must be absolute');
      const legacyNarration = JSON.parse(await fs.readFile(path.join(importLegacy, 'voiceover', `${ctx.id}.json`), 'utf8'));
      if (digest(JSON.stringify(legacyNarration)) !== digest(JSON.stringify(effectiveNarration(ctx)))) throw new Error('Legacy narration differs from current narration; refusing stale import');
      const legacyManifest = path.join(importLegacy, 'src', 'data', `${ctx.id}-voice.json`);
      await rejectLinks(legacyManifest);
      await rejectLinks(path.join(importLegacy, 'public', 'voice', ctx.id));
      await fs.copyFile(legacyManifest, path.join(tmp, 'manifest.json'));
      await fs.cp(path.join(importLegacy, 'public', 'voice', ctx.id), path.join(tmp, 'voice', ctx.id), { recursive: true });
      const legacyChunks = path.join(importLegacy, 'voiceover', '.cache');
      try { await rejectLinks(legacyChunks); await fs.cp(legacyChunks, path.join(tmp, 'legacy-chunks'), { recursive: true }); } catch (e) { if (e.code !== 'ENOENT') throw e; }
    } else await generateInto(ctx, tmp, { force, offline });
    const state = await fingerprint(ctx, path.join(tmp, 'manifest.json'), tmp);
    await fs.writeFile(path.join(tmp, 'state.json'), JSON.stringify(state, null, 2));
    const backup = `${ctx.paths.voiceDir}-previous-${process.pid}`;
    let had = false;
    try { await fs.rename(ctx.paths.voiceDir, backup); had = true; } catch (e) { if (e.code !== 'ENOENT') throw e; }
    try { await fs.rename(tmp, ctx.paths.voiceDir); } catch (e) { if (had) await fs.rename(backup, ctx.paths.voiceDir); throw e; }
    if (had) await fs.rm(backup, { recursive: true, force: true });
    return { manifest: await readManifest(ctx), manifestPath: ctx.paths.voiceManifest, cacheHit: false };
  } finally { await fs.rm(tmp, { recursive: true, force: true }); }
}

/**
 * Re-key an existing cache to the current state version without changing its manifest or audio.
 * reproduced: regenerate into tmp from local caches only (no network, no model) and require a
 *   manifest equal apart from `speakers` and byte-equal section audio.
 * adopted: for caches that cannot be reproduced; see checkAdoptable.
 */
async function restampLocked(ctx, { adopt, structural = false }) {
  const mode = adopt ? 'adopted' : 'reproduced';
  const status = await same(ctx);
  if (status.ok) return { manifest: await readManifest(ctx), manifestPath: ctx.paths.voiceManifest, cacheHit: true, restamped: false };
  let old;
  try { old = JSON.parse(await fs.readFile(ctx.paths.voiceState, 'utf8')); } catch { throw new Error(`No voice cache to restamp for ${ctx.id}: ${ctx.paths.voiceState}`); }
  const current = await outputsFor(ctx, ctx.paths.voiceManifest, ctx.paths.voiceDir);
  const proof = adopt ? await checkAdoptable(ctx, old, current, { structural }) : await checkReproducible(ctx);
  const state = { ...await fingerprint(ctx, ctx.paths.voiceManifest, ctx.paths.voiceDir), restamp: { from: old.version ?? null, mode, ...(proof ? { proof } : {}), at: new Date().toISOString() } };
  if (canonical(state.outputs) !== canonical(current)) throw new Error(`Voice outputs for ${ctx.id} changed during restamp`);
  const tmpState = `${ctx.paths.voiceState}.tmp-${process.pid}`;
  try { await fs.writeFile(tmpState, JSON.stringify(state, null, 2)); await fs.rename(tmpState, ctx.paths.voiceState); }
  catch (e) { await fs.rm(tmpState, { force: true }); throw e; }
  return { manifest: await readManifest(ctx), manifestPath: ctx.paths.voiceManifest, cacheHit: true, restamped: mode };
}
async function checkReproducible(ctx) {
  const tmp = await fs.mkdtemp(path.join(path.dirname(ctx.paths.voiceDir), `${ctx.id}-tmp-`));
  try {
    await generateInto(ctx, tmp, { reproduce: true });
    const [was, now] = await Promise.all([readManifest(ctx), fs.readFile(path.join(tmp, 'manifest.json'), 'utf8').then(JSON.parse)]);
    delete was.speakers; delete now.speakers;
    const diff = differences(was, now, 'manifest');
    if (diff.length) throw new Error(`Restamp refused for ${ctx.id}: the regenerated manifest differs (${diff.slice(0, 4).join('; ')}); try --adopt`);
    for (const section of was.sections) {
      const [a, b] = await Promise.all([fs.readFile(path.join(ctx.paths.voiceDir, ...section.audio.split('/'))), fs.readFile(path.join(tmp, ...section.audio.split('/')))]);
      if (!a.equals(b)) throw new Error(`Restamp refused for ${ctx.id}: ${section.audio} is not byte-identical when regenerated; try --adopt`);
    }
  } finally { await fs.rm(tmp, { recursive: true, force: true }); }
}
const LEGACY_GENERATOR_HASH = '7905da790a3bc097f182e4bf5dcaeeddc163afc998a00ed50834cf4ed4539422';
const SR = 24000; // generate.py's working sample rate
const round3 = x => Math.round(x * 1000) / 1000;
const near = (a, b, tol = 0.002) => typeof a === 'number' && Math.abs(a - b) <= tol;
/** Duration in seconds of a PCM WAV from its header; null when the bytes are not a WAV. */
function wavSeconds(buf) {
  if (buf.length < 12 || buf.toString('latin1', 0, 4) !== 'RIFF' || buf.toString('latin1', 8, 12) !== 'WAVE') return null;
  let o = 12, rate = 0, align = 0;
  while (o + 8 <= buf.length) {
    const id = buf.toString('latin1', o, o + 4), size = buf.readUInt32LE(o + 4);
    if (id === 'fmt ' && size >= 16) { rate = buf.readUInt32LE(o + 12); align = buf.readUInt16LE(o + 20); }
    else if (id === 'data' && rate && align) return Math.floor(Math.min(size, buf.length - o - 8) / align) / rate;
    o += 8 + size + (size & 1);
  }
  return null;
}
/**
 * Files/Cartesia only: rebuild the layout generate.py makes (build_section with source "files") from
 * the clips and their cached Whisper alignments, and compare it with the manifest to a few ms: ids,
 * chapters, speakers, texts, every word and its time, leads, gaps (`after`/defaults) and tails.
 */
export async function layoutProblems(ctx, n, m) {
  const p = [], d = n.defaults || {}, secs = n.sections || [];
  if (canonical(m.chapters) !== canonical(n.chapters)) p.push('chapters differ');
  if (!Array.isArray(m.sections) || m.sections.length !== secs.length) return [...p, `manifest has ${m.sections?.length} sections, narration ${secs.length}`];
  const whisper = (await packagePins(ctx, n.source))['faster-whisper'], model = process.env.WHISPER_MODEL || 'small', versions = await voiceVersions(ctx);
  const alignment = async (data, text) => {
    for (const tag of [`align-v${versions.align}`, LEGACY_GENERATOR_HASH]) {
      const key = digest(Buffer.concat([data, Buffer.from(text + model + whisper + tag + 'motion-align-v1')])).slice(0, 24);
      try { return JSON.parse(await fs.readFile(path.join(ctx.paths.chunkCacheDir, `file-${key}.json`), 'utf8')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
    }
    return null;
  };
  for (let i = 0; i < secs.length; i++) {
    const s = secs[i], ms = m.sections[i];
    if (ms.id !== s.id || ms.chapter !== s.chapter) { p.push(`section ${i} is ${ms.id}/${ms.chapter}, narration has ${s.id}/${s.chapter}`); continue; }
    if (!Array.isArray(ms.lines) || ms.lines.length !== s.lines.length) { p.push(`${s.id}: ${ms.lines?.length} lines, narration ${s.lines.length}`); continue; }
    const first = i === 0 || secs[i - 1].chapter !== s.chapter, last = i === secs.length - 1 || secs[i + 1].chapter !== s.chapter;
    const lead = i === 0 ? d.firstLead : first ? d.chapterLead : d.lead;
    const tail = last && i !== secs.length - 1 ? d.chapterEndTail : Math.max(d.tail, (s.lines.at(-1).after ?? 0.4) - d.lead);
    if (!near(ms.lead, lead, 0.0015)) p.push(`${s.id}: lead ${ms.lead}, narration gives ${lead}`);
    if (!near(ms.tail, tail, 0.0015)) p.push(`${s.id}: tail ${ms.tail}, narration gives ${tail}`);
    let cursor = Math.round(lead * SR), ok = true;
    for (let li = 0; li < s.lines.length && ok; li++) {
      const l = s.lines[li], ml = ms.lines[li], text = strip(l.text);
      if (ml.speaker !== l.speaker) p.push(`${s.id}[${li}]: speaker ${ml.speaker}, narration ${l.speaker}`);
      if (ml.text !== text) { p.push(`${s.id}[${li}]: text differs`); ok = false; break; }
      const base = path.join(ctx.episodeDir, 'voice-lines', `${s.id}-${li}`);
      const file = n.source === 'files' && await present(`${base}.mp3`) ? `${base}.mp3` : `${base}.wav`;
      const data = await fs.readFile(file), seconds = wavSeconds(data), raw = await alignment(data, text);
      if (seconds === null) { p.push(`${path.basename(file)}: not a WAV, timing cannot be checked`); ok = false; break; }
      if (!raw?.length) { p.push(`${path.basename(file)}: no cached Whisper alignment (faster-whisper ${whisper}, ${model}), timing cannot be checked`); ok = false; break; }
      const len = Math.round(seconds * SR) / SR, t0 = Math.max(0, raw[0].start - 0.04), t1 = Math.min(len, raw.at(-1).end + 0.18), at = cursor / SR;
      const words = raw.map(w => ({ word: w.word, start: round3(at + w.start - t0), end: round3(at + w.end - t0) }));
      const mw = ml.words || [];
      if (mw.length !== words.length || words.some((w, k) => w.word !== mw[k].word || !near(mw[k].start, w.start) || !near(mw[k].end, w.end))) p.push(`${s.id}[${li}]: words or their timing differ from the clip's alignment (check after/gaps/defaults)`);
      cursor += Math.min(Math.floor(t1 * SR), Math.round(len * SR)) - Math.floor(t0 * SR);
      if (li + 1 < s.lines.length) cursor += Math.round((l.after ?? (s.lines[li + 1].speaker === l.speaker ? d.gapSameSpeaker : d.gapNewSpeaker)) * SR);
    }
    if (ok && !near(ms.duration, round3((cursor + Math.round(tail * SR)) / SR))) p.push(`${s.id}: duration ${ms.duration} s, narration gives ${round3((cursor + Math.round(tail * SR)) / SR)} s`);
  }
  if (n.source === 'cartesia') for (const k of usedSpeakers(n)) if (canonical(m.speakers?.[k]?.cartesia) !== canonical(n.speakers?.[k]?.cartesia)) p.push(`speaker ${k}: cartesia settings differ`);
  return p;
}
/**
 * --adopt re-keys an older (pre-v4) state whose outputs cannot be regenerated byte for byte. It requires:
 *  1. manifest and section audio byte-identical to what the old state recorded, and (files/Cartesia)
 *     voice-lines clips equal to the old state's sources;
 *  2. proof that the narration is unchanged: the old state's narration digest equals the current one
 *     (proof "digest": covers every narration field, say, after, markers and the effective config);
 *     or, only with --adopt-structural and only for files/Cartesia, the layout rebuilt from the clips
 *     and their cached alignments matches the manifest (proof "layout");
 *  3. for Cartesia, cartesia.py --verify: every clip is current for the current narration, say,
 *     options, voices and dictionary.
 * A v4 (or newer) state is never adopted: its inputs can be compared directly, so a stale v4 cache
 * means something output-affecting changed.
 */
async function checkAdoptable(ctx, old, current, { structural = false } = {}) {
  if (!(old.version < STATE_VERSION)) throw new Error(`Adopt refused for ${ctx.id}: the cache already has a v${old.version} state, and adopt only re-keys older states; re-voice it instead`);
  const problems = [];
  if (!old.manifest || old.manifest !== current.manifest) problems.push('manifest.json differs from the one the old state recorded');
  if (canonical(old.files) !== canonical(current.files)) problems.push('section audio differs from what the old state recorded');
  const n = effectiveNarration(ctx);
  const sources = await sourcesFor(ctx, n);
  if (sources && canonical(sources) !== canonical(old.sources)) problems.push('voice-lines clips differ from the ones the old state recorded');
  const exact = typeof old.narration === 'string' && old.narration === digest(JSON.stringify(n));
  if (!exact) {
    if (!structural) problems.push(`the narration digest differs from the old state (narration or config changed)${n.source === 'supertonic' ? '' : '; --adopt-structural can check the layout instead'}`);
    else if (n.source === 'supertonic') problems.push('--adopt-structural supports files and Cartesia episodes only');
    else problems.push(...await layoutProblems(ctx, n, await readManifest(ctx)));
  }
  if (n.source === 'cartesia' && !problems.length) {
    const tmp = await fs.mkdtemp(path.join(path.dirname(ctx.paths.voiceDir), `${ctx.id}-tmp-`));
    try { await fs.writeFile(path.join(tmp, 'n.json'), JSON.stringify(n)); await cartesiaLines(ctx, path.join(tmp, 'n.json'), { mode: 'verify' }); }
    catch (e) { problems.push(e.message); }
    finally { await fs.rm(tmp, { recursive: true, force: true }); }
  }
  if (problems.length) throw new Error(`Adopt refused for ${ctx.id}: ${problems.slice(0, 8).join('; ')}${problems.length > 8 ? `; +${problems.length - 8} more` : ''}`);
  console.log(`${ctx.id}: adopting (${exact ? 'narration digest unchanged' : 'layout rebuilt from clips matches the manifest'})`);
  return exact ? 'digest' : 'layout';
}
