// Check stills: frames at 30% and 70% of every section (or at given times), written to .stills/<name>/
// with a contact sheet.
//
//   node scripts/stills.mjs              every section -> .stills/all/
//   node scripts/stills.mjs dalang       one section   -> .stills/dalang/
//   node scripts/stills.mjs custom --at 2.6,31.4
import { readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { hyperframesBin, run } from "./hf.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const [name = "all", ...rest] = process.argv.slice(2);

globalThis.F1 = { VOICE: JSON.parse(readFileSync(join(root, "src/data/inflasi-voice.json"), "utf8")) };
await import(pathToFileURL(join(root, "lib/f1/timing.js")).href);
const F1 = globalThis.F1;
const { list } = F1.segments();
const sec = (frames) => +(frames / F1.FPS).toFixed(2);

const at = (() => {
  const i = rest.indexOf("--at");
  if (i >= 0) return rest[i + 1].split(",").map(Number);
  const sections = list.filter((s) => s.kind === "section" && (name === "all" || s.section.id === name));
  return sections.flatMap((s) => [sec(s.from + s.duration * 0.3), sec(s.from + s.duration * 0.7)]);
})();
if (!at.length) {
  console.error(`stills: no moments for "${name}" (sections: ${list.filter((s) => s.kind === "section").map((s) => s.section.id).join(", ")}, or all / custom --at)`);
  process.exit(1);
}

if (run([join(root, "scripts/sync.mjs")]) !== 0) process.exit(1);
const out = join(root, ".stills", name);
rmSync(out, { recursive: true, force: true });
console.log(`stills: ${name} at ${at.join(", ")} s -> ${out}`);
process.exit(run([hyperframesBin(), "snapshot", "--at", at.join(","), "--no-end", "-o", out]));
