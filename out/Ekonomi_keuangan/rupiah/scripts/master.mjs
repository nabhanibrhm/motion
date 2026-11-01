// Masters a rendered video's audio for web/social. If public/music/bed.mp3 exists (voiceover/bed.py) it is mixed
// in first: trimmed and faded to the video, about 10 dB down, and ducked by the voice + SFX through a sidechain
// compressor so it dips whenever anyone speaks. Then two-pass EBU R128 loudnorm to -14 LUFS integrated, true peak
// -1 dBTP (earshot critique's target). The video stream is copied untouched; the file is replaced in place, so run
// it once per fresh render (`npm run render` does).
//   node scripts/master.mjs renders/rupiah-short.mp4
import { spawnSync } from "node:child_process";
import { existsSync, renameSync } from "node:fs";

const [file] = process.argv.slice(2);
if (!file) throw new Error("usage: node scripts/master.mjs <video.mp4>");
const TARGET = "I=-14:TP=-1:LRA=11";
const BED = "public/music/bed.mp3";
const BED_GAIN = 0.3;

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { encoding: "utf8" });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(r.stderr.slice(-2000));
  return r;
};
const ffmpeg = (args) => run("ffmpeg", ["-hide_banner", "-nostdin", ...args]).stderr;
const dur = +run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).stdout.trim();

const bed = existsSync(BED);
const inputs = ["-i", file, ...(bed ? ["-i", BED] : [])];
const mix = bed
  ? `[0:a]aresample=48000,asplit=2[v][sc];` +
    `[1:a]aresample=48000,volume=${BED_GAIN},atrim=0:${dur},afade=t=out:st=${Math.max(0, dur - 1.5).toFixed(2)}:d=1.5[m];` +
    `[m][sc]sidechaincompress=threshold=0.015:ratio=5:attack=40:release=400[md];` +
    `[v][md]amix=inputs=2:normalize=0:duration=first,`
  : `[0:a]`;

// pass 1: measure
const log = ffmpeg([...inputs, "-filter_complex", `${mix}loudnorm=${TARGET}:print_format=json[out]`, "-map", "[out]", "-f", "null", "-"]);
const m = JSON.parse(log.slice(log.lastIndexOf("{"), log.lastIndexOf("}") + 1));

// pass 2: apply with the measured values (linear gain when it fits under the true-peak ceiling)
const tmp = file.replace(/\.mp4$/i, ".master.mp4");
const ln = `loudnorm=${TARGET}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}` +
  `:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
ffmpeg(["-y", ...inputs, "-filter_complex", `${mix}${ln}[out]`, "-map", "0:v", "-map", "[out]", "-c:v", "copy", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", tmp]);
renameSync(tmp, file);
console.log(`mastered ${file}${bed ? " (+ music bed)" : ""}: ${m.input_i} LUFS -> -14 LUFS (true peak ${m.input_tp} dBTP before)`);
