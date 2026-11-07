import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const digest = b => createHash('sha256').update(b).digest('hex');
const hashFile = async p => digest(await fs.readFile(p));
const present = async p => fs.lstat(p).then(s => s.isFile() && !s.isSymbolicLink() && s.size > 0, () => false);
async function rejectLinks(root) {
  const st = await fs.lstat(root);
  if (st.isSymbolicLink()) throw new Error(`Refusing symlink: ${root}`);
  if (st.isDirectory()) for (const name of await fs.readdir(root)) await rejectLinks(path.join(root,name));
  else if (!st.isFile()) throw new Error(`Refusing special file: ${root}`);
}
export const CARTESIA_DEFAULTS = { model: 'sonic-3.6', language: 'id-ID', speed: 1, sampleRate: 44100, dictionary: 'config/cartesia-pronunciation.json' };
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
async function fingerprint(ctx, manifestPath, voiceDir) {
  await rejectLinks(manifestPath);
  await rejectLinks(path.join(voiceDir, 'voice'));
  const manifestBytes = await fs.readFile(manifestPath);
  const manifest = JSON.parse(manifestBytes);
  const files = {};
  for (const section of manifest.sections) {
    const rel = section.audio;
    if (!/^[a-z0-9][a-z0-9-]*$/.test(section.id || '') || rel !== `voice/${ctx.id}/${section.id}.mp3`) throw new Error(`Invalid voice path: ${rel}`);
    const p = path.join(voiceDir, ...rel.split('/'));
    if (!await present(p)) throw new Error(`Missing voice audio: ${p}`);
    files[rel] = await hashFile(p);
  }
  const narration = effectiveNarration(ctx), sources = {};
  const cartesia = narration.source === 'cartesia';
  if (narration.source === 'files' || cartesia) for (const section of narration.sections) for (let i=0; i<section.lines.length; i++) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(section.id || '')) throw new Error('Invalid section id');
    await rejectLinks(path.join(ctx.episodeDir,'voice-lines'));
    const base = path.join(ctx.episodeDir,'voice-lines',`${section.id}-${i}`);
    const file = !cartesia && await present(`${base}.mp3`) ? `${base}.mp3` : `${base}.wav`;
    sources[path.basename(file)] = await hashFile(file);
  }
  const extra = {};
  if (cartesia) {
    const dict = narration.cartesia.dictionary;
    extra.cartesia = { provider: await hashFile(path.join(ctx.repoRoot, 'tools', 'voice', 'cartesia.py')), dictionary: dict ? await hashFile(dictionaryPath(ctx, dict)) : null };
  }
  return { version: 3, ...extra, narration: digest(JSON.stringify(narration)), models: { supertonic: 'supertonic-3', whisper: process.env.WHISPER_MODEL || 'small', language: 'id' }, sources, generator: await hashFile(path.join(ctx.repoRoot, 'tools', 'voice', 'generate.py')), dependencies: await hashFile(path.join(ctx.repoRoot, 'requirements-lock.txt')), manifest: digest(manifestBytes), files };
}
async function same(ctx) {
  try { const state = JSON.parse(await fs.readFile(ctx.paths.voiceState, 'utf8')); const now = await fingerprint(ctx, ctx.paths.voiceManifest, ctx.paths.voiceDir); return JSON.stringify(state) === JSON.stringify(now); } catch { return false; }
}
async function execute(command, args, options) {
  await new Promise((resolve, reject) => { const p = spawn(command, args, { ...options, stdio: 'inherit' }); p.once('error', reject); p.once('exit', c => c === 0 ? resolve() : reject(new Error(`Voice generator exited ${c}`))); });
}
export async function ensureVoice(ctx, options = {}) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(ctx.id)) throw new Error('Invalid episode id');
  if (options.checkOnly) {
    if (!await same(ctx)) throw new Error(`Voice cache missing or stale for ${ctx.id}; run the explicit voice command.`);
    return { manifest: JSON.parse(await fs.readFile(ctx.paths.voiceManifest, 'utf8')), manifestPath: ctx.paths.voiceManifest, cacheHit: true };
  }
  const parent = path.dirname(ctx.paths.voiceDir);
  await fs.mkdir(parent, { recursive: true });
  const lock = `${ctx.paths.voiceDir}.lock`;
  try { await fs.mkdir(lock); } catch (e) { if (e.code === 'EEXIST') throw new Error(`Voice operation already running or lock requires inspection: ${lock}`); throw e; }
  try { return await ensureVoiceLocked(ctx, options); } finally { await fs.rmdir(lock); }
}
async function ensureVoiceLocked(ctx, { generate = false, force = false, importLegacy = null } = {}) {
  if (!force && await same(ctx)) return { manifest: JSON.parse(await fs.readFile(ctx.paths.voiceManifest, 'utf8')), manifestPath: ctx.paths.voiceManifest, cacheHit: true };
  if (!generate && !importLegacy) throw new Error(`Voice cache missing or stale for ${ctx.id}; run the explicit voice command.`);
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

    } else {
      try { await fs.cp(path.join(ctx.paths.voiceDir, 'legacy-chunks'), path.join(tmp, 'legacy-chunks'), { recursive: true }); } catch (e) { if (e.code !== 'ENOENT') throw e; }
      await fs.mkdir(ctx.paths.chunkCacheDir, { recursive: true });
      const win = process.platform === 'win32';
      const python = path.join(ctx.repoRoot, '.venv', ...(win ? ['Scripts', 'python.exe'] : ['bin', 'python']));
      const narration = path.join(tmp, 'effective-narration.json');
      const effective = effectiveNarration(ctx);
      await fs.writeFile(narration, JSON.stringify(effective));
      if (effective.source === 'cartesia') {
        // Synthesise changed lines into voice-lines/, then align them exactly like a files-mode episode.
        await execute(python, [path.join(ctx.repoRoot, 'tools', 'voice', 'cartesia.py'), 'lines', narration, '--lines', path.join(ctx.episodeDir, 'voice-lines'), '--cache', ctx.paths.chunkCacheDir, ...(force ? ['--force'] : [])], { cwd: ctx.repoRoot, env: process.env });
        await fs.writeFile(narration, JSON.stringify({ ...effective, source: 'files' }));
      }
      await execute(python, [path.join(ctx.repoRoot, 'tools', 'voice', 'generate.py'), narration], { cwd: ctx.repoRoot, env: { ...process.env, MOTION_VOICE_ROOT: tmp, MOTION_CHUNK_CACHE: ctx.paths.chunkCacheDir, MOTION_EPISODE_ID: ctx.id, MOTION_LEGACY_CHUNKS: path.join(ctx.paths.voiceDir, 'legacy-chunks'), VOICE_LINES: path.join(ctx.episodeDir, 'voice-lines') } });
    }
    await fs.rm(path.join(tmp, 'effective-narration.json'), { force: true });
    const state = await fingerprint(ctx, path.join(tmp, 'manifest.json'), tmp);
    await fs.writeFile(path.join(tmp, 'state.json'), JSON.stringify(state, null, 2));
    const backup = `${ctx.paths.voiceDir}-previous-${process.pid}`;
    let had = false;
    try { await fs.rename(ctx.paths.voiceDir, backup); had = true; } catch (e) { if (e.code !== 'ENOENT') throw e; }
    try { await fs.rename(tmp, ctx.paths.voiceDir); } catch (e) { if (had) await fs.rename(backup, ctx.paths.voiceDir); throw e; }
    if (had) await fs.rm(backup, { recursive: true, force: true });
    return { manifest: JSON.parse(await fs.readFile(ctx.paths.voiceManifest, 'utf8')), manifestPath: ctx.paths.voiceManifest, cacheHit: false };
  } finally { await fs.rm(tmp, { recursive: true, force: true }); }
}
