import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs, existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { ensureVoice, effectiveNarration, same, voiceGuard, GUARD_GROUPS } from '../src/pipeline/voice.mjs';
import { REPO_ROOT } from '../src/config/episodes.mjs';

const sha = b => createHash('sha256').update(b).digest('hex');
const python = path.join(REPO_ROOT, '.venv', ...(process.platform === 'win32' ? ['Scripts', 'python.exe'] : ['bin', 'python']));
const LEGACY_GENERATOR_HASH = '7905da790a3bc097f182e4bf5dcaeeddc163afc998a00ed50834cf4ed4539422';
const DEFAULTS = { lead: .15, tail: .1, gapSameSpeaker: .1, gapNewSpeaker: .3, firstLead: .2, chapterLead: .1, chapterEndTail: .1 };
const SPEAKERS = { mog: { supertonic: { voice: 'M1', speed: 1 }, cartesia: { voice: 'mog-id' } }, wec: { supertonic: { voice: 'F2', speed: 1 }, cartesia: { voice: 'wec-id' } }, bog: { supertonic: { voice: 'M4', speed: 1 }, cartesia: { voice: 'bog-id' } } };
/** A 16-bit mono WAV: a short tone, so FFmpeg and wave both accept it. */
function wav(seconds = .6, hz = 220, sr = 24000) {
  const n = Math.round(seconds * sr), b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(Math.sin(2 * Math.PI * hz * i / sr) * 9000), 44 + i * 2);
  return b;
}
/** A manifest laid out the way generate.py would for this narration (0.04 s before and 0.1 s after each line's speech). */
function layout(id, n) {
  const d = n.defaults, secs = n.sections; let start = 0;
  const sections = secs.map((s, i) => {
    const first = i === 0 || secs[i - 1].chapter !== s.chapter, last = i === secs.length - 1 || secs[i + 1].chapter !== s.chapter;
    const lead = i === 0 ? d.firstLead : first ? d.chapterLead : d.lead;
    const tail = last && i !== secs.length - 1 ? d.chapterEndTail : Math.max(d.tail, (s.lines.at(-1).after ?? .4) - d.lead);
    let t = lead + .04;
    const lines = s.lines.map((l, li) => {
      const text = l.text.replace(/\[(?:pause|hold)\s+[\d.]+\]/g, ' ').replace(/\s+/g, ' ').trim(), out = { speaker: l.speaker, text, start: +t.toFixed(3), end: +(t + .5).toFixed(3), words: [] };
      const next = s.lines[li + 1];
      t += .5 + .1 + (next ? (l.after ?? (next.speaker === l.speaker ? d.gapSameSpeaker : d.gapNewSpeaker)) + .04 : 0);
      return out;
    });
    const duration = +(t + tail).toFixed(3), sec = { id: s.id, chapter: s.chapter, start: +start.toFixed(3), duration, lead, tail, audio: `voice/${id}/${s.id}.mp3`, text: lines.map(l => l.text).join(' '), lines };
    start += duration; return sec;
  });
  return { speakers: n.speakers, chapters: n.chapters, total: +start.toFixed(3), sections };
}
async function fixture(t, { source = 'supertonic', narration = {}, root = null } = {}) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'motion-voice-key-')), id = 'demo';
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  root ??= dir;
  if (root === dir) {
    await fs.mkdir(path.join(root, 'tools/voice'), { recursive: true }); await fs.mkdir(path.join(root, 'config'), { recursive: true });
    await fs.writeFile(path.join(root, 'tools/voice/versions.json'), JSON.stringify({ assembly: 1, align: 1, pitch: 1, cartesia: 1 }));
    await fs.writeFile(path.join(root, 'requirements-lock.txt'), 'numpy==2.5.4\nfaster-whisper==1.2.1\nyt-dlp==2026.10.26\n');
    await fs.writeFile(path.join(root, 'config/cartesia-pronunciation.json'), JSON.stringify([{ text: 'KRL', pronunciation: 'ka er el' }, { text: 'MRT', pronunciation: 'em er te' }]));
  }
  const voiceDir = path.join(dir, '.cache/voice', id), episodeDir = path.join(dir, 'episode');
  const n = { comment: 'notes', source, ...(source === 'supertonic' ? { say: { KRL: 'ka er el' } } : {}),
    speakers: { mog: structuredClone(SPEAKERS.mog), wec: { supertonic: { voice: 'F2', speed: 1, range: 1.4 } }, bog: structuredClone(SPEAKERS.bog) },
    chapters: [{ id: 'kasus', title: 'Kasus' }], defaults: { ...DEFAULTS },
    sections: [{ id: 'hook', chapter: 'kasus', lines: [{ speaker: 'wec', text: 'Naik KRL setiap hari.' }, { speaker: 'wec', text: 'Tiap pagi.', after: .3 }] }, { id: 'tutup', chapter: 'kasus', lines: [{ speaker: 'wec', text: 'Selesai.' }] }], ...narration };
  const ctx = { repoRoot: root, episodeDir, id, narration: n, config: { voice: { speakers: structuredClone(SPEAKERS) } },
    paths: { voiceDir, voiceManifest: path.join(voiceDir, 'manifest.json'), voiceState: path.join(voiceDir, 'state.json'), chunkCacheDir: path.join(dir, '.cache/voice/chunks') } };
  if (source !== 'supertonic') {
    await fs.mkdir(path.join(episodeDir, 'voice-lines'), { recursive: true });
    for (const s of n.sections) for (let i = 0; i < s.lines.length; i++) await fs.writeFile(path.join(episodeDir, 'voice-lines', `${s.id}-${i}.wav`), wav(.6, 200 + 40 * i));
  }
  return { root, dir, ctx };
}
/** Stamp a cache for the current narration through the importLegacy seam (no Python). */
async function stamp(ctx, manifest = layout(ctx.id, effectiveNarration(ctx))) {
  const legacy = await fs.mkdtemp(path.join(os.tmpdir(), 'motion-voice-legacy-'));
  try {
    for (const d of ['voiceover', 'src/data', `public/voice/${ctx.id}`]) await fs.mkdir(path.join(legacy, d), { recursive: true });
    await fs.writeFile(path.join(legacy, 'voiceover', `${ctx.id}.json`), JSON.stringify(effectiveNarration(ctx)));
    await fs.writeFile(path.join(legacy, 'src/data', `${ctx.id}-voice.json`), JSON.stringify(manifest, null, 1));
    for (const s of manifest.sections) await fs.writeFile(path.join(legacy, 'public/voice', ctx.id, `${s.id}.mp3`), `audio ${s.id}`);
    return await ensureVoice(ctx, { importLegacy: legacy, force: true });
  } finally { await fs.rm(legacy, { recursive: true, force: true }); }
}
const expectOk = async (ctx, why) => { const s = await same(ctx); assert.equal(s.ok, true, `${why}: ${s.reasons?.join('; ')}`); };
const expectStale = async (ctx, pattern) => { const s = await same(ctx); assert.equal(s.ok, false); assert.match(s.reasons.join('; '), pattern); };

test('v4 key ignores comments, unused speakers, unrelated pins and tool edits', async t => {
  const { root, ctx } = await fixture(t, { source: 'cartesia' });
  await stamp(ctx);
  const state = JSON.parse(await fs.readFile(ctx.paths.voiceState, 'utf8'));
  assert.equal(state.version, 4);
  assert.deepEqual(Object.keys(state.inputs).sort(), ['narration', 'packages', 'source', 'sources', 'versions', 'whisper']);
  assert.deepEqual(state.inputs.versions, { assembly: 1, align: 1, cartesia: 1 });
  assert.deepEqual(state.inputs.packages, { 'faster-whisper': '1.2.1', ctranslate2: null, numpy: '2.5.4' });
  ctx.config.voice.speakers.mog.cartesia.voice = 'another-id'; await expectOk(ctx, 'unused speaker Cartesia id');
  ctx.narration.speakers.bog.cartesia = { speed: .8 }; await expectOk(ctx, 'unused speaker narration settings');
  ctx.narration.speakers.wec.supertonic.range = 2; await expectOk(ctx, 'used speaker, other provider');
  ctx.narration.comment = 'edited notes'; ctx.narration.say = { foo: 'bar' }; await expectOk(ctx, 'comment and top-level say (unused by Cartesia)');
  await fs.writeFile(path.join(root, 'requirements-lock.txt'), 'numpy==2.5.4\nfaster-whisper==1.2.1\nyt-dlp==2027.1.1\nedge-tts==9\n'); await expectOk(ctx, 'yt-dlp pin');
  await fs.writeFile(path.join(root, 'tools/voice/generate.py'), '# any edit'); await fs.writeFile(path.join(root, 'tools/voice/cartesia.py'), '# any edit'); await expectOk(ctx, 'tool files');
  await fs.writeFile(path.join(root, 'config/cartesia-pronunciation.json'), JSON.stringify([{ text: 'KRL', pronunciation: 'ka er el' }, { text: 'MRT', pronunciation: 'em-er-te' }, { text: 'LRT', pronunciation: 'el er te' }]));
  await expectOk(ctx, 'irrelevant dictionary entries');
  assert.equal((await ensureVoice(ctx, { checkOnly: true })).cacheHit, true);
});

test('v4 key is stale for used speakers, clips, versions, voice packages and relevant dictionary entries', async t => {
  const { root, ctx } = await fixture(t, { source: 'cartesia' });
  const reset = async () => { await stamp(ctx); await expectOk(ctx, 'fresh stamp'); };
  await reset();
  ctx.config.voice.speakers.wec.cartesia.voice = 'new-wec'; await expectStale(ctx, /inputs\.narration/); ctx.config.voice.speakers.wec.cartesia.voice = 'wec-id'; await expectOk(ctx, 'restored');
  ctx.narration.speakers.wec.cartesia = { speed: 1.1 }; await expectStale(ctx, /inputs\.narration/); delete ctx.narration.speakers.wec.cartesia;
  ctx.narration.cartesia = { say: { Naik: 'naek' } }; await expectStale(ctx, /inputs\.narration/); delete ctx.narration.cartesia;
  ctx.narration.sections[0].lines[1].after = .5; await expectStale(ctx, /inputs\.narration/); ctx.narration.sections[0].lines[1].after = .3;
  await fs.writeFile(path.join(ctx.episodeDir, 'voice-lines/hook-1.wav'), wav(.7)); await expectStale(ctx, /inputs\.sources\.hook-1\.wav/); await reset();
  await fs.writeFile(path.join(root, 'tools/voice/versions.json'), JSON.stringify({ assembly: 1, align: 2, pitch: 1, cartesia: 1 })); await expectStale(ctx, /inputs\.versions\.align 1 -> 2/); await reset();
  await fs.writeFile(path.join(root, 'tools/voice/versions.json'), JSON.stringify({ assembly: 1, align: 2, pitch: 7, cartesia: 1 })); await expectOk(ctx, 'pitch version is Supertonic-only');
  await fs.writeFile(path.join(root, 'tools/voice/versions.json'), JSON.stringify({ assembly: 1, align: 2, pitch: 7, cartesia: 2 })); await expectStale(ctx, /inputs\.versions\.cartesia 1 -> 2/); await reset();
  await fs.writeFile(path.join(root, 'requirements-lock.txt'), 'numpy==2.6.0\nfaster-whisper==1.2.1\n'); await expectStale(ctx, /inputs\.packages\.numpy 2\.5\.4 -> 2\.6\.0/); await reset();
  await fs.writeFile(path.join(root, 'config/cartesia-pronunciation.json'), JSON.stringify([{ text: 'krl', pronunciation: 'ka-er-el' }, { text: 'MRT', pronunciation: 'em er te' }])); await expectStale(ctx, /inputs\.narration/); await reset();
  await fs.writeFile(path.join(ctx.paths.voiceDir, 'voice/demo/hook.mp3'), 'edited'); await expectStale(ctx, /outputs\.files\.voice\/demo\/hook\.mp3/);
  await assert.rejects(ensureVoice(ctx, { checkOnly: true }), /Voice cache missing or stale for demo \(outputs\.files/);
});

test('supertonic key covers used speaker range, say and the pitch version only', async t => {
  const { root, ctx } = await fixture(t);
  await stamp(ctx);
  const state = JSON.parse(await fs.readFile(ctx.paths.voiceState, 'utf8'));
  assert.deepEqual(state.inputs.versions, { assembly: 1, align: 1, pitch: 1 });
  assert.deepEqual(Object.keys(state.inputs.packages), ['faster-whisper', 'ctranslate2', 'numpy', 'supertonic', 'onnxruntime', 'praat-parselmouth']);
  assert.equal(state.inputs.sources, undefined);
  ctx.narration.speakers.mog.supertonic.range = 1.9; await expectOk(ctx, 'unused speaker range');
  ctx.narration.speakers.wec.cartesia = { voice: 'x' }; await expectOk(ctx, 'used speaker, other provider');
  ctx.narration.speakers.wec.supertonic.range = 1.5; await expectStale(ctx, /inputs\.narration/); ctx.narration.speakers.wec.supertonic.range = 1.4; await expectOk(ctx, 'restored');
  ctx.narration.say = { KRL: 'ka-er-el' }; await expectStale(ctx, /inputs\.narration/); ctx.narration.say = { KRL: 'ka er el' };
  await fs.writeFile(path.join(root, 'tools/voice/versions.json'), JSON.stringify({ assembly: 1, align: 1, pitch: 2, cartesia: 1 })); await expectStale(ctx, /inputs\.versions\.pitch 1 -> 2/);
  await fs.writeFile(path.join(root, 'tools/voice/versions.json'), JSON.stringify({ assembly: 1, align: 1, pitch: 2, cartesia: 9 })); await expectStale(ctx, /^inputs\.versions\.pitch 1 -> 2$/);
});

test('a v3 state names its version; --adopt re-keys it only by an unchanged narration digest', async t => {
  const { ctx } = await fixture(t);
  await stamp(ctx);
  const v4 = JSON.parse(await fs.readFile(ctx.paths.voiceState, 'utf8'));
  const manifestBytes = await fs.readFile(ctx.paths.voiceManifest);
  const v3 = (narration = sha(JSON.stringify(effectiveNarration(ctx)))) => fs.writeFile(ctx.paths.voiceState, JSON.stringify({ version: 3, narration, models: {}, sources: {}, generator: LEGACY_GENERATOR_HASH, dependencies: 'old', manifest: v4.outputs.manifest, files: v4.outputs.files }));
  await v3();
  await expectStale(ctx, /state v3, expected v4; try voice demo --restamp/);
  await assert.rejects(ensureVoice(ctx, { checkOnly: true }), /stale for demo \(state v3, expected v4/);
  await assert.rejects(ensureVoice(ctx, { adopt: true, force: true }), /Choose one of --force, --adopt/);
  await assert.rejects(ensureVoice(ctx, { adopt: true, adoptStructural: true }), /Choose one of --adopt, --adopt-structural/);
  let r = await ensureVoice(ctx, { adopt: true });
  assert.equal(r.restamped, 'adopted');
  const st = JSON.parse(await fs.readFile(ctx.paths.voiceState, 'utf8'));
  assert.equal(st.version, 4); assert.deepEqual([st.restamp.from, st.restamp.mode, st.restamp.proof], [3, 'adopted', 'digest']);
  assert.deepEqual(await fs.readFile(ctx.paths.voiceManifest), manifestBytes);
  assert.deepEqual(await fs.readdir(ctx.paths.voiceDir), ['manifest.json', 'state.json', 'voice'], 'no state temp left behind');
  await expectOk(ctx, 'adopted');
  assert.equal((await ensureVoice(ctx, { adopt: true })).restamped, false);
  // a stale v4 state is never adopted: its inputs say what changed
  ctx.narration.say = { KRL: 'ka-er-el' };
  await assert.rejects(ensureVoice(ctx, { adopt: true }), /already has a v4 state, and adopt only re-keys older states/);
  // any narration change (say, after, a mid-line pause) breaks the v3 digest
  for (const mutate of [n => { n.say = { KRL: 'ka-er-el' }; }, n => { n.sections[0].lines[0].after = .12; }, n => { n.sections[0].lines[0].text = 'Naik KRL [pause 0.2] setiap hari.'; }]) {
    ctx.narration.say = { KRL: 'ka er el' }; await v3(); mutate(ctx.narration);
    await assert.rejects(ensureVoice(ctx, { adopt: true }), /narration digest differs from the old state/);
    await assert.rejects(ensureVoice(ctx, { adoptStructural: true }), /--adopt-structural supports files and Cartesia episodes only/);
    ctx.narration.sections[0].lines[0] = { speaker: 'wec', text: 'Naik KRL setiap hari.' };
  }
  ctx.narration.say = { KRL: 'ka er el' }; await v3();
  await fs.writeFile(path.join(ctx.paths.voiceDir, 'voice/demo/tutup.mp3'), 'changed audio');
  await assert.rejects(ensureVoice(ctx, { adopt: true }), /section audio differs from what the old state recorded/);
  assert.equal(JSON.parse(await fs.readFile(ctx.paths.voiceState, 'utf8')).version, 3, 'a refused adopt leaves the old state');
});

test('output-affecting voice tool functions match versions.json.guard', () => {
  const versions = JSON.parse(readFileSync(path.join(REPO_ROOT, 'tools/voice/versions.json'), 'utf8'));
  const read = f => readFileSync(path.join(REPO_ROOT, 'tools/voice', f), 'utf8');
  const sources = { 'generate.py': read('generate.py'), 'cartesia.py': read('cartesia.py') }, now = voiceGuard(sources);
  assert.deepEqual(Object.keys(versions.guard).sort(), Object.keys(GUARD_GROUPS).sort());
  for (const [group, { file, names }] of Object.entries(GUARD_GROUPS)) {
    assert.ok(Number.isSafeInteger(versions[group]), `versions.json "${group}"`);
    assert.equal(now[group], versions.guard[group], `${file} "${group}" parts (${names.join(', ')}) changed. If their output changed, bump versions.json "${group}"; then set guard.${group} to ${now[group]}.`);
  }
  const edited = { ...sources, 'cartesia.py': sources['cartesia.py'].replace('"dictionary": "config/cartesia-pronunciation.json"}', '"dictionary": None}') };
  assert.notEqual(voiceGuard(edited).cartesia, now.cartesia, 'a continuation line of a guarded assignment counts');
  assert.equal(voiceGuard({ ...sources, 'generate.py': sources['generate.py'].replace('WHISPER_MODEL = os.environ.get("WHISPER_MODEL", "small")', 'WHISPER_MODEL = os.environ.get("WHISPER_MODEL", "medium")') }).align === now.align, false);
  assert.throws(() => voiceGuard({ 'generate.py': 'def other():\n    pass\n', 'cartesia.py': '' }), /generate\.py has no top-level WHISPER_MODEL/);
});

const venvReady = existsSync(python) && spawnSync(process.env.FFMPEG || 'ffmpeg', ['-version']).status === 0;
test('--restamp reproduces a files-mode cache offline from legacy-keyed alignments and keeps its bytes', { skip: !venvReady && 'root .venv or FFmpeg missing' }, async t => {
  const { ctx } = await fixture(t, { source: 'files', root: REPO_ROOT });
  const saved = process.env.MOTION_NO_MODELS; process.env.MOTION_NO_MODELS = '1'; // never load Whisper in a test
  t.after(() => { if (saved === undefined) delete process.env.MOTION_NO_MODELS; else process.env.MOTION_NO_MODELS = saved; });
  const whisper = spawnSync(python, ['-c', "import importlib.metadata as m;print(m.version('faster-whisper'))"], { encoding: 'utf8' }).stdout.trim();
  const alignKey = (data, text, tag) => sha(Buffer.concat([data, Buffer.from(text + (process.env.WHISPER_MODEL || 'small') + whisper + tag + 'motion-align-v1')])).slice(0, 24);
  const entries = [];
  await fs.mkdir(ctx.paths.chunkCacheDir, { recursive: true });
  for (const s of ctx.narration.sections) for (let i = 0; i < s.lines.length; i++) {
    const data = await fs.readFile(path.join(ctx.episodeDir, 'voice-lines', `${s.id}-${i}.wav`)), text = s.lines[i].text;
    const words = text.split(' ').map((word, k) => ({ word, start: +(.05 + k * .15).toFixed(3), end: +(.18 + k * .15).toFixed(3) }));
    await fs.writeFile(path.join(ctx.paths.chunkCacheDir, `file-${alignKey(data, text, LEGACY_GENERATOR_HASH)}.json`), JSON.stringify(words));
    entries.push(path.join(ctx.paths.chunkCacheDir, `file-${alignKey(data, text, 'align-v1')}.json`));
  }
  const first = await ensureVoice(ctx, { generate: true });
  assert.equal(first.cacheHit, false);
  for (const e of entries) assert.ok(existsSync(e), 'legacy alignment copied to its align-v1 name');
  const bytes = async () => Object.fromEntries(await Promise.all(['manifest.json', 'voice/demo/hook.mp3', 'voice/demo/tutup.mp3'].map(async f => [f, sha(await fs.readFile(path.join(ctx.paths.voiceDir, f)))])));
  const before = await bytes(), v4 = JSON.parse(await fs.readFile(ctx.paths.voiceState, 'utf8'));
  await fs.writeFile(ctx.paths.voiceState, JSON.stringify({ version: 3, manifest: v4.outputs.manifest, files: v4.outputs.files }));
  for (const e of entries) await fs.rm(e); // only the legacy-keyed entries remain
  let r = await ensureVoice(ctx, { restamp: true });
  assert.equal(r.restamped, 'reproduced');
  assert.deepEqual(await bytes(), before);
  const st = JSON.parse(await fs.readFile(ctx.paths.voiceState, 'utf8'));
  assert.deepEqual({ ...st, restamp: undefined }, { ...v4, restamp: undefined });
  assert.equal(st.restamp.from, 3); assert.equal(st.restamp.mode, 'reproduced');
  for (const e of entries) assert.ok(existsSync(e));
  // a narration change that alters the layout is refused and leaves the old state in place
  await fs.writeFile(ctx.paths.voiceState, JSON.stringify({ version: 3 }));
  ctx.narration.sections[0].lines[1].after = .9;
  await assert.rejects(ensureVoice(ctx, { restamp: true }), /Restamp refused for demo: the regenerated manifest differs/);
  assert.deepEqual(JSON.parse(await fs.readFile(ctx.paths.voiceState, 'utf8')), { version: 3 });
  ctx.narration.sections[0].lines[1].after = .3;
  // --adopt-structural: rebuild the layout from the clips and cached alignments and compare it with the real generator's manifest
  const v3 = () => fs.writeFile(ctx.paths.voiceState, JSON.stringify({ version: 3, narration: 'digest-under-an-older-config', sources: v4.inputs.sources, manifest: v4.outputs.manifest, files: v4.outputs.files }));
  await v3();
  await assert.rejects(ensureVoice(ctx, { adopt: true }), /narration digest differs from the old state .*--adopt-structural can check the layout instead/);
  r = await ensureVoice(ctx, { adoptStructural: true });
  assert.equal(r.restamped, 'adopted');
  assert.equal(JSON.parse(await fs.readFile(ctx.paths.voiceState, 'utf8')).restamp.proof, 'layout');
  for (const [mutate, undo, pattern] of [
    [() => { ctx.narration.sections[0].lines[1].after = .32; }, () => { ctx.narration.sections[0].lines[1].after = .3; }, /hook: tail 0\.15, narration gives 0\.17/],
    [() => { ctx.narration.sections[0].lines[0].after = .12; }, () => { delete ctx.narration.sections[0].lines[0].after; }, /hook\[1\]: words or their timing differ/],
    [() => { ctx.narration.defaults.tail = .2; }, () => { ctx.narration.defaults.tail = DEFAULTS.tail; }, /hook: tail 0\.15, narration gives 0\.2.*hook: duration 1\.54 s/],
    [() => { ctx.narration.sections[1].lines[0].text = 'Selesai juga.'; }, () => { ctx.narration.sections[1].lines[0].text = 'Selesai.'; }, /tutup\[0\]: text differs/],
  ]) { await v3(); mutate(); await assert.rejects(ensureVoice(ctx, { adoptStructural: true }), pattern); undo(); }
  assert.equal(JSON.parse(await fs.readFile(ctx.paths.voiceState, 'utf8')).version, 3);
  // a line without a cached alignment fails under MOTION_NO_MODELS instead of loading Whisper
  ctx.narration.sections[1].lines[0].text = 'Selesai juga.';
  await assert.rejects(ensureVoice(ctx, { restamp: true }), /Voice generator exited 1/);
  assert.deepEqual(await bytes(), before);
});

test('voice CLI accepts one of --force, --offline, --restamp, --adopt, --adopt-structural', async () => {
  const { parseArgs } = await import('../scripts/motion.mjs');
  assert.throws(() => parseArgs(['voice', 'demo', '--adopt', '--adopt-structural']), /Choose one of --adopt, --adopt-structural/);
  for (const flag of ['force', 'offline', 'restamp', 'adopt', 'adopt-structural']) assert.equal(parseArgs(['voice', 'demo', `--${flag}`]).options[flag], true);
  assert.equal(parseArgs(['voice', '--all', '--restamp']).options.all, true);
  assert.throws(() => parseArgs(['voice', 'demo', '--force', '--restamp']), /Choose one of --force, --restamp/);
  assert.throws(() => parseArgs(['voice', 'demo', '--offline', '--adopt']), /Choose one of --offline, --adopt/);
  assert.throws(() => parseArgs(['sync', 'demo', '--offline']), /Unknown option for sync/);
});
