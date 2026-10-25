// Render a composition from a bundle served on 127.0.0.1.
// Windows resolves "localhost" to ::1 only, while Remotion's own render server listens on
// 127.0.0.1, so audio downloads fail with ECONNREFUSED. Serving the bundle ourselves on an
// explicit IPv4 address sidesteps that.
// Usage: node scripts/render.mjs <CompositionId> <output> [extra remotion args...]
import { spawn } from "node:child_process";
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const [id, output, ...extra] = process.argv.slice(2);
if (!id || !output) {
  console.error("Usage: node scripts/render.mjs <CompositionId> <output> [remotion args]");
  process.exit(1);
}

const root = resolve(import.meta.dirname, "..");
const buildDir = join(root, "build");
const types = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".css": "text/css",
  ".mp3": "audio/mpeg", ".wav": "audio/wav", ".mp4": "video/mp4", ".png": "image/png", ".jpg": "image/jpeg",
  ".svg": "image/svg+xml", ".ttf": "font/ttf", ".woff2": "font/woff2", ".map": "application/json" };

const run = (args) =>
  new Promise((ok, fail) => {
    const p = spawn("npx", ["remotion", ...args], { cwd: root, stdio: "inherit", shell: true });
    p.on("exit", (code) => (code === 0 ? ok() : fail(new Error(`remotion ${args[0]} exited with ${code}`))));
  });

await run(["bundle", `--out-dir=${buildDir}`, "--log=error"]);

const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "");
  let file = join(buildDir, path);
  if (!file.startsWith(buildDir) || !existsSync(file)) return res.writeHead(404).end();
  if (statSync(file).isDirectory()) file = join(file, "index.html");
  res.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream", "Access-Control-Allow-Origin": "*" });
  createReadStream(file).pipe(res);
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const url = `http://127.0.0.1:${server.address().port}`;

try {
  await run(["render", url, id, output, ...extra]);
} finally {
  server.close();
}
