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
