// Check stills for a chapter: frames at fixed moments of every section, written to .stills/<name>/ with a
// contact sheet. If the v2 reference video exists (out/f1-explosion-v2.mp4), each frame is paired with the
// reference frame at the same moment (HyperFrames `snapshot --against`).
//
//   node scripts/stills.mjs hook            sections of one chapter (30% and 70% of each) + its chapter card
//   node scripts/stills.mjs shared          the shared parts: captions, mascots, lip-sync, card, HUD, photo card
//   node scripts/stills.mjs all             every chapter, one sheet each
//   node scripts/stills.mjs custom --at 2.6,57.4
import { existsSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { hyperframesBin, run } from "./hf.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const REFERENCE = join(root, "out", "f1-explosion-v2.mp4");
const [name = "shared", ...rest] = process.argv.slice(2);

globalThis.F1 = { VOICE: JSON.parse(readFileSync(join(root, "src/data/f1-voice.json"), "utf8")) };
await import(pathToFileURL(join(root, "lib/f1/timing.js")).href);
const F1 = globalThis.F1;
const { list } = F1.segments();
const sec = (frames) => +(frames / F1.FPS).toFixed(2);

const chapterTimes = (chapter) => {
  const times = [];
  for (const s of list.filter((x) => x.chapterId === chapter)) {
    if (s.kind === "chapter") times.push(sec(s.from + 24));
    else times.push(sec(s.from + s.duration * 0.3), sec(s.from + s.duration * 0.7));
  }
  return times;
};

const at = (() => {
  const i = rest.indexOf("--at");
  if (i >= 0) return rest[i + 1].split(",").map(Number);
  if (name === "shared") {
    const first = list.find((s) => s.kind === "section");
    const card = list.find((s) => s.kind === "chapter");
    const S = first.section;
    const bog = F1.line(S, 0);
    const wec = F1.line(S, 1);
    return [sec(bog.start + 20), sec(wec.start + 70), sec(card.from + 8), sec(card.from + 24), sec(card.from + card.duration + 30)];
  }
  return chapterTimes(name);
})();

const chapters = name === "all" ? F1.VOICE.chapters.map((c) => c.id) : [name];
const reference = existsSync(REFERENCE);
if (!reference) console.log(`stills: ${REFERENCE} not found; sheets show the new version only`);

if (run([join(root, "scripts/sync.mjs")]) !== 0) process.exit(1);
for (const c of chapters) {
  const times = name === "all" ? chapterTimes(c) : at;
  if (!times.length) {
    console.error(`stills: no moments for "${c}" (chapters: ${F1.VOICE.chapters.map((x) => x.id).join(", ")}, or shared / all / custom --at)`);
    process.exit(1);
  }
  const out = join(root, ".stills", name === "all" ? c : name);
  rmSync(out, { recursive: true, force: true });
  const args = [hyperframesBin(), "snapshot", "--at", times.join(","), "--no-end", "-o", out];
  if (reference) args.push("--against", REFERENCE);
  console.log(`stills: ${c} at ${times.join(", ")} s -> ${out}`);
  if (run(args) !== 0) process.exit(1);
}
