import { spawnSync } from 'node:child_process';
import { constants, existsSync, promises as fs } from 'node:fs';
import path from 'node:path';

// FFmpeg tools: the FFMPEG / FFPROBE env variables (same convention as tools/voice/generate.py), else PATH.
// When only FFMPEG is set, an ffprobe beside it is preferred so both come from one build.
export function ffmpegBin(env = process.env) { return env.FFMPEG || 'ffmpeg'; }
export function ffprobeBin(env = process.env) {
  if (env.FFPROBE) return env.FFPROBE;
  if (env.FFMPEG) {
    const base = path.basename(env.FFMPEG), probe = path.join(path.dirname(env.FFMPEG), base.replace(/ffmpeg(?!.*ffmpeg)/i, 'ffprobe'));
    if (probe !== env.FFMPEG && existsSync(probe)) return probe;
  }
  return 'ffprobe';
}
// run(tool, args) with tool 'ffmpeg' | 'ffprobe'; tests inject their own to record argument arrays.
export function runTool(tool, args) {
  const cmd = tool === 'ffprobe' ? ffprobeBin() : ffmpegBin();
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`${tool}: ${r.stderr.slice(-3000)}`);
  return r;
}
const num = s => { const t = String(s ?? '').trim(); if (/^-inf$/i.test(t)) return -Infinity; if (/^\+?inf$/i.test(t)) return Infinity; const n = Number(t); return t !== '' && Number.isFinite(n) ? n : null; };
const rate = s => { const [a, b = '1'] = String(s || '').split('/'); const n = Number(a) / Number(b); return Number.isFinite(n) && n > 0 ? n : null; };

// Measure a finished file: container duration, video fps/frames, EBU R128 integrated loudness, true peak, LRA, bytes.
export async function measureMedia(file, { run = runTool } = {}) {
  const size = (await fs.stat(file)).size;
  const probe = JSON.parse(run('ffprobe', ['-v','error','-show_entries','stream=codec_type,avg_frame_rate,r_frame_rate,nb_frames:format=duration','-of','json',file]).stdout);
  const streams = probe.streams || [], stream = streams.find(s => s.codec_type === 'video') || null, duration = num(probe.format?.duration);
  const fps = stream ? rate(stream.avg_frame_rate) ?? rate(stream.r_frame_rate) : null;
  let frames = stream ? num(stream.nb_frames) : null;
  if (frames === null && fps && duration) frames = Math.round(duration * fps);
  let lufs = null, truePeak = null, lra = null;
  if (streams.some(s => s.codec_type === 'audio')) {
    const log = run('ffmpeg', ['-hide_banner','-nostdin','-i',file,'-map','0:a:0','-af','ebur128=peak=true','-f','null','-']).stderr;
    const summary = log.slice(log.lastIndexOf('Summary:'));
    const pick = re => { const m = summary.match(re); return m ? num(m[1]) : null; };
    lufs = pick(/\bI:\s*(-?inf|[-+\d.]+)\s*LUFS/i);
    lra = pick(/\bLRA:\s*(-?inf|[-+\d.]+)\s*LU\b/i);
    truePeak = pick(/\bPeak:\s*(-?inf|[-+\d.]+)\s*dBFS/i);
  }
  return { duration, fps, frames, lufs, truePeak, lra, size };
}

// One printable QA line plus warnings. Reads (never writes) out/uploaded/<same name> to flag a re-render of a posted video.
export async function masterQa(measured, { output, fps = null, integrated = -14, truePeak = -1 } = {}) {
  const warnings = [];
  if (!measured) return { line: `${output ? path.basename(output) : 'master'}: not measured`, warnings: ['Output was not measured.'] };
  const f = (v, d, unit) => v === null || v === undefined ? `? ${unit}` : `${Number.isFinite(v) ? v.toFixed(d) : String(v)} ${unit}`;
  const line = `${output ? path.basename(output) : 'master'}: ${f(measured.duration, 2, 's')}, ${f(measured.fps, 3, 'fps').replace('.000 ', ' ')}, ${measured.frames ?? '?'} frames, ${f(measured.lufs, 1, 'LUFS')}, ${f(measured.truePeak, 1, 'dBTP')}, LRA ${f(measured.lra, 1, 'LU')}, ${(measured.size / 1048576).toFixed(1)} MB`;
  if (measured.truePeak !== null && measured.truePeak > truePeak) warnings.push(`True peak ${measured.truePeak} dBTP is above the ${truePeak} dBTP target.`);
  if (measured.lufs !== null && Math.abs(measured.lufs - integrated) > 1) warnings.push(`Integrated loudness ${measured.lufs} LUFS is more than 1 LU from ${integrated} LUFS.`);
  if (fps && (measured.fps === null || Math.abs(measured.fps - fps) > 0.01)) warnings.push(`Frame rate ${measured.fps} fps differs from video.fps ${fps}.`);
  if (output) { try { await fs.access(path.join(path.dirname(output), 'uploaded', path.basename(output))); warnings.push(`Already posted: ${path.join(path.dirname(output), 'uploaded', path.basename(output))} exists (left untouched).`); } catch {} }
  return { line, warnings };
}

export async function masterVideo({ input, output, bedPath = null, bedGain = .3, integrated = -14, truePeak = -1, range = 11 }, { run = runTool, rename = fs.rename, copyFile = fs.copyFile, measure = measureMedia } = {}) {
  if (path.resolve(input).toLowerCase() === path.resolve(output).toLowerCase()) throw new Error('Master input and output must differ.');
  if (path.basename(path.dirname(path.resolve(output))).toLowerCase() === 'uploaded') throw new Error(`Refusing to master into a posted-videos folder: ${output}`);
  const dur = Number(run('ffprobe', ['-v','error','-show_entries','format=duration','-of','csv=p=0',input]).stdout.trim());
  if (!Number.isFinite(dur) || dur <= 0) throw new Error('Invalid video duration');
  if (bedPath) await fs.access(bedPath);
  // Loop the bed so videos longer than the bed file keep music; atrim below cuts it to the video length.
  const inputs = ['-i', input, ...(bedPath ? ['-stream_loop', '-1', '-i', bedPath] : [])];
  const mix = bedPath ? `[0:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,asplit=2[v][sc];[1:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,volume=${bedGain},atrim=0:${dur},afade=t=out:st=${Math.max(0,dur-1.5).toFixed(2)}:d=1.5[m];[m][sc]sidechaincompress=threshold=0.015:ratio=5:attack=40:release=400[md];[v][md]amix=inputs=2:normalize=0:duration=first,` : '[0:a]';
  const target = `I=${integrated}:TP=${truePeak}:LRA=${range}`;
  const ff = args => run('ffmpeg', ['-hide_banner','-nostdin',...args]).stderr;
  const log = ff([...inputs,'-filter_complex',`${mix}loudnorm=${target}:print_format=json[out]`,'-map','[out]','-f','null','-']);
  const m = JSON.parse(log.slice(log.lastIndexOf('{'),log.lastIndexOf('}')+1));
  const ln = `loudnorm=${target}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
  await fs.mkdir(path.dirname(output), { recursive: true });
  // Stage beside the raw render so a synced output folder (e.g. Google Drive) only ever sees finished files.
  const stem = `.${path.basename(output, path.extname(output))}-${process.pid}-${Date.now()}`;
  const tmp = path.join(path.dirname(input), `${stem}.mp4`);
  // Across filesystems a rename fails with EXDEV: copy into a hidden temp in the output folder, then rename there,
  // so the published name still appears atomically and a failed copy never leaves a partial output.
  let staged = null;
  const publish = async () => {
    try { await rename(tmp, output); }
    catch (e) {
      if (e.code !== 'EXDEV') throw e;
      staged = path.join(path.dirname(output), `${stem}.mp4.tmp`);
      await copyFile(tmp, staged, constants.COPYFILE_EXCL);
      await rename(staged, output);
    }
  };
  try { ff(['-y',...inputs,'-filter_complex',`${mix}${ln}[out]`,'-map','0:v','-map','[out]','-c:v','copy','-ar','48000','-c:a','aac','-b:a','192k',tmp]); await publish(); }
  finally { await fs.rm(tmp, { force: true }); if (staged) await fs.rm(staged, { force: true }); }
  // The output is published at this point; a measuring failure is reported, not thrown.
  let measured = null, measureError = null;
  if (measure) { try { measured = await measure(output, { run }); } catch (e) { measureError = e.message; } }
  return { output, inputLoudness: Number(m.input_i), bed: Boolean(bedPath), measured, ...(measureError ? { measureError } : {}) };
}
