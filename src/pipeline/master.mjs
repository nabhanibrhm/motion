import { spawnSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
export async function masterVideo({ input, output, bedPath = null, bedGain = .3, integrated = -14, truePeak = -1, range = 11 }) {
  if (path.resolve(input).toLowerCase() === path.resolve(output).toLowerCase()) throw new Error('Master input and output must differ.');
  const run = (cmd, args) => { const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }); if (r.error) throw r.error; if (r.status !== 0) throw new Error(`${cmd}: ${r.stderr.slice(-3000)}`); return r; };
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
  const tmp = path.join(path.dirname(input), `.${path.basename(output, path.extname(output))}-${process.pid}-${Date.now()}.mp4`);
  const publish = async () => { try { await fs.rename(tmp, output); } catch (e) { if (e.code !== 'EXDEV') throw e; await fs.copyFile(tmp, output); } };
  try { ff(['-y',...inputs,'-filter_complex',`${mix}${ln}[out]`,'-map','0:v','-map','[out]','-c:v','copy','-ar','48000','-c:a','aac','-b:a','192k',tmp]); await publish(); } finally { await fs.rm(tmp, { force: true }); }
  return { output, inputLoudness: Number(m.input_i), bed: Boolean(bedPath) };
}
