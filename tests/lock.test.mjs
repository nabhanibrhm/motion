import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs, existsSync, readFileSync, mkdirSync, writeFileSync, readdirSync, utimesSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { withLock, withEpisodeLock, releaseHeldLocksSync, pidAlive } from '../src/pipeline/lock.mjs';
import { ensureVoice, withVoiceLock } from '../src/pipeline/voice.mjs';

const dead = spawnSync(process.execPath, ['-e', '']).pid; // exited, so its pid is free
const me = { pid: process.pid, host: os.hostname(), platform: process.platform };
const ownerOf = lock => JSON.parse(readFileSync(path.join(lock, 'owner.json'), 'utf8'));
const plant = (lock, owner) => { mkdirSync(lock, { recursive: true }); writeFileSync(path.join(lock, 'owner.json'), JSON.stringify(owner)); };

/** The voice-storage fixture: a legacy import ensureVoice can complete without Python or any API. */
async function voiceFixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'motion-lock-test-')), id = 'demo';
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const legacy = path.join(root, 'legacy'), voiceDir = path.join(root, '.cache', 'voice', id);
  const narration = { source: 'supertonic', speakers: {}, sections: [{ id: 'part', lines: [] }] };
  for (const dir of ['voiceover/.cache', 'src/data', 'public/voice/demo', 'tools/voice']) await fs.mkdir(path.join(dir.startsWith('tools') ? root : legacy, dir), { recursive: true });
  await fs.writeFile(path.join(root, 'tools/voice/generate.py'), 'v1'); await fs.writeFile(path.join(root, 'requirements-lock.txt'), 'numpy==2.5.4\n');
  await fs.writeFile(path.join(root, 'tools/voice/versions.json'), JSON.stringify({ assembly: 1, align: 1, pitch: 1, cartesia: 1 }));
  await fs.writeFile(path.join(legacy, 'voiceover/demo.json'), JSON.stringify(narration));
  await fs.writeFile(path.join(legacy, 'src/data/demo-voice.json'), JSON.stringify({ sections: [{ id: 'part', audio: 'voice/demo/part.mp3' }] }));
  await fs.writeFile(path.join(legacy, 'public/voice/demo/part.mp3'), 'audio');
  await fs.mkdir(path.dirname(voiceDir), { recursive: true });
  const ctx = { repoRoot: root, episodeDir: path.join(root, 'episode'), id, narration, config: {},
    paths: { voiceDir, voiceManifest: path.join(voiceDir, 'manifest.json'), voiceState: path.join(voiceDir, 'state.json'), chunkCacheDir: path.join(root, '.cache/voice/chunks') } };
  return { root, ctx, legacy, lock: `${voiceDir}.lock` };
}

test('the voice lock is registered for a forced exit and records its owner', async t => {
  const { ctx, lock } = await voiceFixture(t);
  assert.equal(pidAlive(dead), false);
  await withVoiceLock(ctx, async () => {
    const o = ownerOf(lock);
    assert.deepEqual({ pid: o.pid, host: o.host, platform: o.platform, id: o.id }, { ...me, id: 'demo' });
    assert.match(o.nonce, /^[0-9a-f]{16}$/);
    releaseHeldLocksSync(); // what the second Ctrl-C does before exit 130
    assert.equal(existsSync(lock), false);
  });
  assert.equal(existsSync(lock), false);
});

test('ensureVoice breaks a voice lock whose owner died here, and keeps a live one', async t => {
  const { ctx, legacy, lock } = await voiceFixture(t);
  const notices = [];
  plant(lock, { pid: dead, host: os.hostname(), platform: process.platform, nonce: 'gone', id: 'demo' });
  assert.equal((await ensureVoice(ctx, { importLegacy: legacy, log: m => notices.push(m) })).cacheHit, false);
  assert.equal(notices.length, 1); assert.match(notices[0], new RegExp(`stale voice lock for demo: process ${dead}`));
  assert.equal(existsSync(lock), false);
  assert.deepEqual(readdirSync(path.dirname(lock)).filter(n => n.startsWith('demo.')), []); // no guard or grave left behind
  for (const [what, owner] of [['own live pid', { ...me, nonce: 'live' }], ['other platform', { ...me, pid: dead, platform: process.platform === 'win32' ? 'linux' : 'win32' }], ['other host', { ...me, pid: dead, host: 'some-other-host' }]]) {
    plant(lock, owner);
    await assert.rejects(ensureVoice(ctx, { log: m => notices.push(m) }), new RegExp(`Voice operation already running or lock requires inspection: ${lock.replace(/[\\.]/g, '\\$&')}`), what);
    assert.deepEqual(ownerOf(lock), owner, what);
    await fs.rm(lock, { recursive: true });
  }
  assert.equal(notices.length, 1);
});

test('a platform mismatch never breaks an episode lock, even with a free pid on the same host', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'motion-lock-test-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const lock = path.join(root, '.cache/locks/demo'), owner = { pid: dead, host: os.hostname(), platform: 'other-os', id: 'demo' };
  plant(lock, owner);
  await assert.rejects(withEpisodeLock({ id: 'demo', repoRoot: root }, () => assert.fail('must not run'), { log: () => assert.fail('must not break') }), /busy/);
  assert.deepEqual(ownerOf(lock), owner);
});

test('a breaker never removes a lock re-created after it judged the old owner dead', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'motion-lock-test-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const lock = path.join(root, 'x.lock'), guard = `${lock}.breaking`;
  const opts = { busy: () => new Error('busy'), stale: o => `broke ${o.nonce}`, log: () => {} };
  // Breaker A is mid-break (holds the guard); B finds the dead lock and waits instead of acting on it.
  plant(lock, { ...me, pid: dead, nonce: 'dead' }); mkdirSync(guard);
  const b = withLock(lock, () => assert.fail('B must not run'), opts);
  await new Promise(ok => setTimeout(ok, 80));
  // A finishes: the dead lock is replaced by A's live one and the guard is released.
  await fs.rm(lock, { recursive: true }); plant(lock, { ...me, nonce: 'A' }); await fs.rm(guard, { recursive: true });
  await assert.rejects(b, /busy/);
  assert.equal(ownerOf(lock).nonce, 'A');
  await fs.rm(lock, { recursive: true });

  // A guard abandoned by a crashed breaker is cleared, then the dead lock is broken once.
  plant(lock, { ...me, pid: dead, nonce: 'dead' }); mkdirSync(guard); utimesSync(guard, new Date(Date.now() - 60e3), new Date(Date.now() - 60e3));
  const notices = [];
  assert.equal(await withLock(lock, async () => 'ran', { ...opts, log: m => notices.push(m) }), 'ran');
  assert.deepEqual(notices, ['broke dead']);
  assert.deepEqual(readdirSync(root), []);

  // Many contenders on one dead lock: it is broken once, holders never overlap, and each finds its own nonce throughout.
  plant(lock, { ...me, pid: dead, nonce: 'dead' });
  let running = 0, ran = 0; const breaks = [];
  const results = await Promise.allSettled(Array.from({ length: 8 }, () => withLock(lock, async () => {
    running++; ran++; const mine = ownerOf(lock).nonce;
    await new Promise(ok => setTimeout(ok, 50));
    assert.equal(running, 1); assert.equal(ownerOf(lock).nonce, mine); running--;
  }, { ...opts, log: m => breaks.push(m) })));
  assert.deepEqual(breaks, ['broke dead']);
  assert.ok(ran >= 1);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, ran);
  for (const r of results.filter(r => r.status === 'rejected')) assert.match(r.reason.message, /^busy$/);
  assert.deepEqual(readdirSync(root), []);
});
