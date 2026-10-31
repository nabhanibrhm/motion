// Masters a rendered video's audio for web/social: two-pass EBU R128 loudnorm to -14 LUFS integrated,
// true peak -1 dBTP (earshot critique's target). The video stream is copied untouched; the file is replaced in place.
//   node scripts/master.mjs renders/inflasi-short.mp4
import { spawnSync } from "node:child_process";
import { renameSync } from "node:fs";

const [file] = process.argv.slice(2);
if (!file) throw new Error("usage: node scripts/master.mjs <video.mp4>");
const TARGET = "I=-14:TP=-1:LRA=11";

const ffmpeg = (args) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostdin", ...args], { encoding: "utf8" });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(r.stderr.slice(-2000));
  return r.stderr;
};

// pass 1: measure
const log = ffmpeg(["-i", file, "-vn", "-af", `loudnorm=${TARGET}:print_format=json`, "-f", "null", "-"]);
const m = JSON.parse(log.slice(log.lastIndexOf("{"), log.lastIndexOf("}") + 1));

// pass 2: apply with the measured values (linear gain when it fits under the true-peak ceiling)
const tmp = file.replace(/\.mp4$/i, ".master.mp4");
const af = `loudnorm=${TARGET}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}` +
  `:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
ffmpeg(["-y", "-i", file, "-map", "0", "-c:v", "copy", "-af", af, "-ar", "48000", "-c:a", "aac", "-b:a", "192k", tmp]);
renameSync(tmp, file);
console.log(`mastered ${file}: ${m.input_i} LUFS -> -14 LUFS (true peak ${m.input_tp} dBTP before)`);
