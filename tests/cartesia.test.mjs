import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { effectiveNarration, ensureVoice, CARTESIA_DEFAULTS } from '../src/pipeline/voice.mjs';
import { REPO_ROOT } from '../src/config/episodes.mjs';

const python = path.join(REPO_ROOT, '.venv', ...(process.platform === 'win32' ? ['Scripts', 'python.exe'] : ['bin', 'python']));
const script = path.join(REPO_ROOT, 'tools', 'voice', 'cartesia.py');
const narration = (extra = {}) => ({ source: 'cartesia', speakers: { wec: { supertonic: { voice: 'F2' } }, mog: { cartesia: { voice: 'own-id', speed: 1.1 } } },
  sections: [{ id: 'hook', lines: [{ speaker: 'wec', text: 'Naik KRL [pause 0.3] setiap hari.' }, { speaker: 'mog', text: 'Kata DPR.' }] }], ...extra });

test('cartesia narration inherits provider defaults and speaker voices from config', () => {
  const ctx = { narration: narration({ cartesia: { speed: 0.9 } }), config: { voice: { speakers: { wec: { cartesia: { voice: 'intan' } }, mog: { cartesia: { voice: 'fallback' } } } } } };
  const n = effectiveNarration(ctx);
  assert.deepEqual(n.cartesia, { ...CARTESIA_DEFAULTS, speed: 0.9 });
  assert.equal(n.speakers.wec.cartesia.voice, 'intan');
  assert.equal(n.speakers.mog.cartesia.voice, 'own-id');
  assert.equal(effectiveNarration({ narration: { source: 'files' } }).cartesia, undefined);
});

test('cartesia voice cache is stale without its clips', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'motion-cartesia-test-')), voiceDir = path.join(root, '.cache/voice/demo');
  try {
    const ctx = { repoRoot: root, episodeDir: path.join(root, 'episode'), id: 'demo', narration: narration({ cartesia: { dictionary: null } }), config: {},
      paths: { voiceDir, voiceManifest: path.join(voiceDir, 'manifest.json'), voiceState: path.join(voiceDir, 'state.json'), chunkCacheDir: path.join(root, '.cache/voice/chunks') } };
    await assert.rejects(ensureVoice(ctx, { checkOnly: true }), /stale/);
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});

test('cartesia.py plans billing per changed line without the network', { skip: !existsSync(python) && 'root .venv missing' }, async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'motion-cartesia-lines-'));
  try {
    const file = path.join(dir, 'n.json'), lines = path.join(dir, 'voice-lines'), cache = path.join(dir, 'cache');
    const run = n => { const input = { ...n, speakers: { wec: { cartesia: { voice: 'v1' } }, mog: { cartesia: { voice: 'v2' } }, ...n.speakers } };
      return fs.writeFile(file, JSON.stringify(input)).then(() => spawnSync(python, [script, 'lines', file, '--lines', lines, '--cache', cache, '--dry-run'], { encoding: 'utf8', env: { ...process.env, CARTESIA_API_KEY: 'unused' } })); };
    const base = narration({ cartesia: { dictionary: null } });
    let r = await run({ ...base, speakers: {} });
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /2 lines, 0 unchanged, 0 from cache, 2 to synthesise \(~30 characters/);
    r = await run({ ...base, speakers: { mog: { cartesia: { voice: null } } } });
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /no Cartesia voice id for speaker\(s\) mog/);
    await fs.mkdir(lines, { recursive: true }); await fs.writeFile(path.join(lines, 'hook-0.wav'), 'pasted');
    r = await run({ ...base, speakers: {} });
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /hook-0\.wav exists but was not made by this provider/);
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});

test('cartesia.py --verify writes nothing, --offline never needs the API, and an unchanged sidecar is not rewritten', { skip: !existsSync(python) && 'root .venv missing' }, async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'motion-cartesia-verify-'));
  try {
    const file = path.join(dir, 'n.json'), lines = path.join(dir, 'voice-lines'), cache = path.join(dir, 'cache');
    await fs.writeFile(file, JSON.stringify({ ...narration({ cartesia: { dictionary: null } }), speakers: { wec: { cartesia: { voice: 'v1' } }, mog: { cartesia: { voice: 'v2' } } } }));
    const env = { ...process.env, CARTESIA_API_KEY: 'unused' };
    const run = (...flags) => spawnSync(python, [script, 'lines', file, '--lines', lines, '--cache', cache, ...flags], { encoding: 'utf8', env });
    const keys = JSON.parse(spawnSync(python, ['-I', '-c', 'import json,sys; sys.path.insert(0, sys.argv[1]); import cartesia; print(json.dumps({r["name"]: r["key"] for r in cartesia.plan(json.load(open(sys.argv[2], encoding="utf-8")))[1]}))', path.dirname(script), file], { encoding: 'utf8' }).stdout);
    const wav = Buffer.concat([Buffer.from('RIFF$\0\0\0WAVEfmt \x10\0\0\0\x01\0\x01\0\x44\xac\0\0\x88\x58\x01\0\x02\0\x10\0data', 'latin1'), Buffer.from([4, 0, 0, 0, 1, 0, 2, 0])]);
    let r = run('--verify');
    assert.equal(r.status, 3, r.stderr); assert.equal(existsSync(lines), false); assert.equal(existsSync(cache), false);
    r = run('--offline');
    assert.equal(r.status, 3, r.stderr); assert.match(r.stdout, /needs the API/); assert.equal(existsSync(lines), false);
    assert.notEqual(run('--offline', '--force').status, 0);
    await fs.mkdir(cache, { recursive: true });
    for (const key of Object.values(keys)) await fs.writeFile(path.join(cache, `cartesia-${key.slice(0, 32)}.wav`), wav);
    assert.equal(run('--verify').status, 3, 'clips only in the local cache are not current yet');
    r = run('--offline');
    assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, /0 unchanged, 2 from cache, 0 to synthesise/);
    const side = path.join(lines, 'cartesia.json'), before = await fs.stat(side), text = await fs.readFile(side, 'utf8');
    assert.deepEqual(Object.keys(JSON.parse(text)), ['hook-0.wav', 'hook-1.wav']);
    await new Promise(res => setTimeout(res, 20));
    r = run('--verify'); assert.equal(r.status, 0, r.stdout + r.stderr);
    r = run(); assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, /2 unchanged, 0 from cache, 0 to synthesise/);
    assert.equal((await fs.stat(side)).mtimeMs, before.mtimeMs, 'unchanged sidecar is not rewritten');
    assert.deepEqual((await fs.readdir(lines)).sort(), ['cartesia.json', 'hook-0.wav', 'hook-1.wav']);
    await fs.writeFile(path.join(lines, 'hook-1.wav'), Buffer.concat([wav, Buffer.from([0, 0])]));
    r = run('--verify'); assert.equal(r.status, 3); assert.match(r.stdout, /hook-1\.wav exists but was not made by this provider/);
    assert.equal(await fs.readFile(side, 'utf8'), text);
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
});
