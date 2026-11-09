import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { promises as fs, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { masterVideo, measureMedia, masterQa, ffmpegBin, ffprobeBin } from '../src/pipeline/master.mjs';
import { clean, cleanReport, staleVoiceTemps, STALE_VOICE_LABEL } from '../src/pipeline/storage.mjs';

const tmpRoot = () => fs.mkdtemp(path.join(os.tmpdir(), 'motion-master-test-'));
const LOUDNORM = 'noise {"input_i" : "-20.10","input_tp" : "-3.20","input_lra" : "5.40","input_thresh" : "-30.50","target_offset" : "0.30"}\n';
const EBUR = '[Parsed_ebur128_0 @ 0x1] Summary:\n\n  Integrated loudness:\n    I:         -14.0 LUFS\n    Threshold: -24.0 LUFS\n\n  Loudness range:\n    LRA:         5.3 LU\n\n  True peak:\n    Peak:       -1.2 dBFS\n';
// Records every tool call and answers like ffmpeg/ffprobe would, writing the encode target.
function fakeRun(calls) {
  return (tool, args) => {
    calls.push([tool, ...args]);
    if (tool === 'ffprobe' && args.includes('format=duration')) return { stdout: '3.000000\n', stderr: '' };
    if (tool === 'ffprobe') return { stdout: JSON.stringify({ streams: [{ codec_type: 'video', avg_frame_rate: '30/1', r_frame_rate: '30/1', nb_frames: '90' }, { codec_type: 'audio' }], format: { duration: '3.000000' } }), stderr: '' };
    if (args.some(a => a.includes('print_format=json'))) return { stdout: '', stderr: LOUDNORM };
    if (args.some(a => a.includes('ebur128'))) return { stdout: '', stderr: EBUR };
    writeFileSync(args[args.length - 1], 'mastered');
    return { stdout: '', stderr: '' };
  };
}

// Argument arrays captured from HEAD (96c7fa8) master.mjs with fake ffmpeg/ffprobe on PATH, before this refactor.
const TMP = '<DIR>/in/.ep-<PID>-<TS>.mp4';
const BED_MIX = '[0:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,asplit=2[v][sc];[1:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,volume=0.3,atrim=0:3,afade=t=out:st=1.50:d=1.5[m];[m][sc]sidechaincompress=threshold=0.015:ratio=5:attack=40:release=400[md];[v][md]amix=inputs=2:normalize=0:duration=first,';
const LN2 = 'loudnorm=I=-14:TP=-1:LRA=11:measured_I=-20.10:measured_TP=-3.20:measured_LRA=5.40:measured_thresh=-30.50:offset=0.30:linear=true[out]';
const PROBE = ['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','<DIR>/in/raw.mp4'];
const ENC = ['-map','0:v','-map','[out]','-c:v','copy','-ar','48000','-c:a','aac','-b:a','192k',TMP];
const HEAD = {
  bed: [PROBE,
    ['ffmpeg','-hide_banner','-nostdin','-i','<DIR>/in/raw.mp4','-stream_loop','-1','-i','<DIR>/bed.wav','-filter_complex',`${BED_MIX}loudnorm=I=-14:TP=-1:LRA=11:print_format=json[out]`,'-map','[out]','-f','null','-'],
    ['ffmpeg','-hide_banner','-nostdin','-y','-i','<DIR>/in/raw.mp4','-stream_loop','-1','-i','<DIR>/bed.wav','-filter_complex',`${BED_MIX}${LN2}`,...ENC]],
  nobed: [PROBE,
    ['ffmpeg','-hide_banner','-nostdin','-i','<DIR>/in/raw.mp4','-filter_complex','[0:a]loudnorm=I=-14:TP=-1:LRA=11:print_format=json[out]','-map','[out]','-f','null','-'],
    ['ffmpeg','-hide_banner','-nostdin','-y','-i','<DIR>/in/raw.mp4','-filter_complex',`[0:a]${LN2}`,...ENC]],
};

test('mix and loudnorm argument arrays are unchanged from HEAD (bed and no bed)', async () => {
  const D = await tmpRoot();
  try {
    await fs.mkdir(path.join(D, 'in')); await fs.writeFile(path.join(D, 'in/raw.mp4'), 'r'); await fs.writeFile(path.join(D, 'bed.wav'), 'b');
    for (const [name, bedPath] of [['bed', path.join(D, 'bed.wav')], ['nobed', null]]) {
      const calls = [];
      const r = await masterVideo({ input: path.join(D, 'in/raw.mp4'), output: path.join(D, 'out/ep.mp4'), bedPath, bedGain: .3, integrated: -14, truePeak: -1, range: 11 }, { run: fakeRun(calls) });
      const norm = calls.slice(0, 3).map(c => c.map(s => s.split(D).join('<DIR>').replaceAll('\\', '/').replace(/\.ep-\d+-\d+\.mp4$/, '.ep-<PID>-<TS>.mp4')));
      assert.deepEqual(norm, HEAD[name], name);
      assert.equal(await fs.readFile(path.join(D, 'out/ep.mp4'), 'utf8'), 'mastered');
      assert.deepEqual(r.measured, { duration: 3, fps: 30, frames: 90, lufs: -14, truePeak: -1.2, lra: 5.3, size: 8 });
      assert.equal(r.inputLoudness, -20.1); assert.equal(r.bed, Boolean(bedPath));
      assert.deepEqual((await fs.readdir(path.join(D, 'in'))).sort(), ['raw.mp4']);
    }
  } finally { await fs.rm(D, { recursive: true, force: true }); }
});

test('EXDEV publish copies to a temp in the output folder, then renames', async () => {
  const D = await tmpRoot();
  try {
    await fs.mkdir(path.join(D, 'in')); await fs.mkdir(path.join(D, 'out')); await fs.writeFile(path.join(D, 'in/raw.mp4'), 'r');
    const output = path.join(D, 'out/ep.mp4'), renames = [], copies = [];
    const rename = async (from, to) => {
      renames.push([from, to]);
      if (path.dirname(from) !== path.dirname(to)) throw Object.assign(new Error('cross-device link not permitted'), { code: 'EXDEV' });
      return fs.rename(from, to);
    };
    const copyFile = async (from, to, mode) => { copies.push([from, to]); return fs.copyFile(from, to, mode); };
    await masterVideo({ input: path.join(D, 'in/raw.mp4'), output }, { run: fakeRun([]), rename, copyFile });
    assert.equal(await fs.readFile(output, 'utf8'), 'mastered');
    assert.equal(renames.length, 2);
    assert.equal(path.dirname(renames[0][0]), path.join(D, 'in'));
    assert.equal(path.dirname(renames[1][0]), path.join(D, 'out')); assert.equal(renames[1][1], output);
    assert.match(path.basename(renames[1][0]), /^\.ep-\d+-\d+\.mp4\.tmp$/);
    assert.deepEqual(copies, [[renames[0][0], renames[1][0]]]);
    assert.deepEqual(await fs.readdir(path.join(D, 'out')), ['ep.mp4']);
    assert.deepEqual(await fs.readdir(path.join(D, 'in')), ['raw.mp4']);
    // A failing copy leaves the previous output untouched and no temp behind.
    const failCopy = async (from, to) => { await fs.writeFile(to, 'partial'); throw Object.assign(new Error('disk full'), { code: 'ENOSPC' }); };
    await assert.rejects(masterVideo({ input: path.join(D, 'in/raw.mp4'), output }, { run: fakeRun([]), rename, copyFile: failCopy }), /disk full/);
    assert.equal(await fs.readFile(output, 'utf8'), 'mastered');
    assert.deepEqual(await fs.readdir(path.join(D, 'out')), ['ep.mp4']);
    assert.deepEqual(await fs.readdir(path.join(D, 'in')), ['raw.mp4']);
  } finally { await fs.rm(D, { recursive: true, force: true }); }
});

test('refuses to master into an uploaded folder', async () => {
  const calls = [];
  await assert.rejects(masterVideo({ input: '/x/raw.mp4', output: '/x/out/uploaded/01-a-short.mp4' }, { run: fakeRun(calls) }), /posted-videos/);
  assert.equal(calls.length, 0);
});

test('FFMPEG / FFPROBE env select the tools', async () => {
  const D = await tmpRoot();
  try {
    assert.equal(ffmpegBin({}), 'ffmpeg'); assert.equal(ffprobeBin({}), 'ffprobe');
    assert.equal(ffprobeBin({ FFPROBE: '/p/ffprobe', FFMPEG: '/q/ffmpeg' }), '/p/ffprobe');
    const ff = path.join(D, 'ffmpeg.exe'); await fs.writeFile(ff, ''); assert.equal(ffmpegBin({ FFMPEG: ff }), ff);
    assert.equal(ffprobeBin({ FFMPEG: ff }), 'ffprobe');
    await fs.writeFile(path.join(D, 'ffprobe.exe'), ''); assert.equal(ffprobeBin({ FFMPEG: ff }), path.join(D, 'ffprobe.exe'));
  } finally { await fs.rm(D, { recursive: true, force: true }); }
});

test('masterQa flags true peak, fps and an already-posted name without touching it', async () => {
  const D = await tmpRoot();
  try {
    const output = path.join(D, 'out/01-a-short.mp4'), posted = path.join(D, 'out/uploaded/01-a-short.mp4');
    const m = { duration: 3, fps: 30, frames: 90, lufs: -14, truePeak: -0.1, lra: 5, size: 1048576 };
    let qa = await masterQa(m, { output, fps: 30 });
    assert.equal(qa.line, '01-a-short.mp4: 3.00 s, 30 fps, 90 frames, -14.0 LUFS, -0.1 dBTP, LRA 5.0 LU, 1.0 MB');
    assert.equal(qa.warnings.length, 1); assert.match(qa.warnings[0], /True peak -0.1/);
    await fs.mkdir(path.dirname(posted), { recursive: true }); await fs.writeFile(posted, 'posted');
    qa = await masterQa({ ...m, truePeak: -1.2 }, { output, fps: 60 });
    assert.equal(qa.warnings.length, 2); assert.match(qa.warnings[0], /differs from video.fps 60/); assert.match(qa.warnings[1], /Already posted/);
    assert.equal(await fs.readFile(posted, 'utf8'), 'posted');
  } finally { await fs.rm(D, { recursive: true, force: true }); }
});

const hasFfmpeg = spawnSync(ffmpegBin(), ['-version']).status === 0 && spawnSync(ffprobeBin(), ['-version']).status === 0;
test('lavfi fixture: masters a 3 s clip and measures it', { skip: !hasFfmpeg && 'ffmpeg/ffprobe not found' }, async () => {
  const D = await tmpRoot();
  try {
    const raw = path.join(D, 'build/render.raw.mp4'), bed = path.join(D, 'bed.wav');
    await fs.mkdir(path.dirname(raw), { recursive: true });
    const gen = args => { const r = spawnSync(ffmpegBin(), ['-hide_banner', '-nostdin', '-y', ...args], { encoding: 'utf8' }); assert.equal(r.status, 0, r.stderr); };
    gen(['-f', 'lavfi', '-i', 'testsrc2=size=108x192:rate=30:duration=3', '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=48000:duration=3', '-af', 'volume=0.2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', raw]);
    gen(['-f', 'lavfi', '-i', 'anoisesrc=d=1:c=pink:a=0.1:r=48000', bed]);
    for (const bedPath of [null, bed]) {
      const output = path.join(D, 'out', `${bedPath ? 'bed' : 'plain'}.mp4`);
      const r = await masterVideo({ input: raw, output, bedPath });
      assert.equal(r.measureError, undefined);
      const m = r.measured;
      assert.equal(m.fps, 30); assert.equal(m.frames, 90);
      assert.ok(Math.abs(m.duration - 3) < 0.1, `duration ${m.duration}`);
      assert.ok(Math.abs(m.lufs - -14) <= 1, `lufs ${m.lufs}`);
      assert.ok(m.truePeak <= -0.5, `true peak ${m.truePeak}`);
      assert.ok(Number.isFinite(m.lra));
      assert.equal(m.size, (await fs.stat(output)).size);
      assert.deepEqual(await measureMedia(output), m);
    }
    assert.deepEqual(await fs.readdir(path.join(D, 'build')), ['render.raw.mp4']);
  } finally { await fs.rm(D, { recursive: true, force: true }); }
});

test('clean reports stale voice temps and never removes them', async () => {
  const root = await tmpRoot(), id = 'demo';
  try {
    const voice = path.join(root, '.cache/voice');
    for (const d of [id, `${id}-tmp-AbC123`, `${id}-previous-4242`, 'other-tmp-x', 'demox-tmp-y', 'chunks']) await fs.mkdir(path.join(voice, d), { recursive: true });
    const ctx = { repoRoot: root, id, paths: { voiceDir: path.join(voice, id), buildDir: path.join(root, '.cache/build', id), stillsDir: path.join(root, '.cache/stills', id) } };
    await fs.mkdir(ctx.paths.buildDir, { recursive: true });
    const stale = [path.join(voice, `${id}-previous-4242`), path.join(voice, `${id}-tmp-AbC123`)];
    assert.deepEqual(await staleVoiceTemps(ctx), stale);
    const dry = await clean(ctx);
    assert.deepEqual(dry.staleVoice, stale);
    const text = cleanReport(id, dry);
    assert.ok(text.startsWith(`${id}: dry run\n${ctx.paths.buildDir}\n`));
    for (const p of stale) assert.ok(text.includes(`${STALE_VOICE_LABEL}: ${p}`));
    await clean(ctx, { execute: true });
    await assert.rejects(fs.access(ctx.paths.buildDir));
    for (const d of [id, `${id}-tmp-AbC123`, `${id}-previous-4242`, 'other-tmp-x', 'demox-tmp-y', 'chunks']) await fs.access(path.join(voice, d));
    await assert.rejects(clean(ctx, { target: 'voice' }), /cannot be cleaned/);
  } finally { await fs.rm(root, { recursive: true, force: true }); }
});
