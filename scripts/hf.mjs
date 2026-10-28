// Runs `node scripts/sync.mjs`, then the project's pinned HyperFrames CLI with the given arguments.
// Plain Node (no shell), so the npm scripts behave the same in bash and PowerShell.
//   node scripts/hf.mjs render -o out/f1-explosion-v3.mp4
//   node scripts/hf.mjs --no-sync lint
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const noSync = args[0] === "--no-sync";
if (noSync) args.shift();

/** Absolute path of the pinned hyperframes CLI entry (node_modules/hyperframes). */
export const hyperframesBin = () => {
  const require = createRequire(join(root, "package.json"));
  const pkgPath = require.resolve("hyperframes/package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  const bin = typeof pkg.bin === "string" ? pkg.bin : pkg.bin.hyperframes;
  return join(dirname(pkgPath), bin);
};

export const run = (cmdArgs, opts = {}) => {
  const r = spawnSync(process.execPath, cmdArgs, { cwd: root, stdio: "inherit", ...opts });
  if (r.error) throw r.error;
  return r.status ?? 1;
};

if (process.argv[1] && resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase()) {
  if (!noSync) {
    const s = run([join(root, "scripts/sync.mjs")]);
    if (s !== 0) process.exit(s);
  }
  process.exit(run([hyperframesBin(), ...args]));
}
