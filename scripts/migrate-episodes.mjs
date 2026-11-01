#!/usr/bin/env node
// Copy authored inputs only. Existing files must already match: migration never overwrites.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const EPISODE_IDS = ['inflasi', 'rupiah', 'ihsg', 'paylater', 'judol', 'emas', 'kelas'];
const category = 'Ekonomi_keuangan';
const digest = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const json = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
const posix = (...parts) => parts.join('/');
const receiptPath = 'docs/refactor-migration.json';

function assertSafePath(root, relative) {
  if (path.isAbsolute(relative) || relative.split(/[\\/]/).some((part) => part === '..')) {
    throw new Error(`Unsafe migration path: ${relative}`);
  }
  let current = root;
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) {
      throw new Error(`Migration refuses symbolic links: ${relative}`);
    }
  }
  return current;
}

function filesBelow(root, relative) {
  const directory = assertSafePath(root, relative);
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'en')).flatMap((entry) => {
    const child = posix(relative, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Migration refuses symbolic links: ${child}`);
    return entry.isDirectory() ? filesBelow(root, child) : [child];
  });
}

export function buildMigrationPlan(directory) {
  const root = fs.realpathSync(directory);
  const entries = new Map();
  const assets = new Map();
  const sourceHashes = new Map();
  const baselinePath = path.join(root, '.cache/migration-baseline/source-hashes.json');
  const baseline = fs.existsSync(baselinePath)
    ? new Map(JSON.parse(fs.readFileSync(baselinePath, 'utf8')).map((entry) => [entry.path, entry.sha256])) : null;
  function read(relative) {
    const absolute = assertSafePath(root, relative);
    if (!fs.existsSync(absolute)) throw new Error(`Legacy source unavailable; restore .cache/migration-baseline/legacy-source.zip before migrating again: ${relative}. Use --verify to check migrated files without restoring.`);
    const bytes = fs.readFileSync(absolute);
    const sha256 = digest(bytes);
    if (baseline && (!baseline.has(relative) || baseline.get(relative) !== sha256)) {
      throw new Error(`Legacy source differs from migration baseline: ${relative}`);
    }
    sourceHashes.set(relative, { path: relative, bytes: bytes.length, sha256 });
    return bytes;
  }
  function add(relative, bytes) {
    if (entries.has(relative) && !entries.get(relative).equals(bytes)) throw new Error(`Conflicting migration output: ${relative}`);
    entries.set(relative, bytes);
  }
  let sceneCount = 0;
  for (const [index, id] of EPISODE_IDS.entries()) {
    const source = posix('out', category, id);
    const target = posix('episodes', id);
    const copied = [];
    const copy = (from, to) => {
      const bytes = read(from);
      add(posix(target, to), bytes);
      copied.push({ source: from, target: to, bytes: bytes.length, sha256: digest(bytes) });
      return bytes;
    };
    const narrationBytes = copy(posix(source, 'voiceover', `${id}.json`), 'narration.json');
    const narration = JSON.parse(narrationBytes.toString('utf8').replace(/^\uFEFF/, ''));
    const ids = narration.sections.map((section) => section.id);
    if (!ids.length || new Set(ids).size !== ids.length || ids.some((scene) => !/^[a-z][a-z0-9-]*$/.test(scene))) {
      throw new Error(`Invalid narration section IDs: ${id}`);
    }
    for (const file of fs.readdirSync(assertSafePath(root, source)).sort()) {
      if (/^script.*\.md$/.test(file)) copy(posix(source, file), file);
    }
    const scriptBytes = entries.get(posix(target, 'script-short.md'));
    if (!scriptBytes) throw new Error(`Missing authored script-short.md: ${id}`);
    const heading = scriptBytes.toString('utf8').replace(/^\uFEFF/, '').split(/\r?\n/)[0];
    const title = heading.replace(/^#\s+/, '').replace(/\s+\(Short\)$/, '');
    if (!title || title === heading) throw new Error(`Missing script title: ${id}`);
    const scenes = ids.map((scene) => {
      copy(posix(source, 'compositions', `${scene}.html`), posix('scenes', `${scene}.html`));
      sceneCount++;
      return { id: scene, file: posix('scenes', `${scene}.html`) };
    });
    add(posix(target, 'episode.json'), json({
      schemaVersion: 1, id, number: index + 1, title, category,
      narration: 'narration.json', script: 'script-short.md',
      video: { width: 1080, height: 1920, fps: 30 },
      runtime: { profile: id === 'inflasi' ? 'legacy-inflasi' : 'modern', case: { id: `KASUS #${String(index + 1).padStart(2, '0')}`, steps: ids.length } },
      scenes,
      audio: { bed: id === 'inflasi' ? null : 'music/bed.mp3', bedGain: 0.3, loudness: { integrated: -14, truePeak: -1, range: 11 } },
    }));
    add(posix(target, 'migration.json'), json({ schemaVersion: 1, source, files: copied }));
    for (const group of ['fonts', 'sfx', 'cast', 'music']) {
      const prefix = posix(source, 'public');
      for (const file of filesBelow(root, posix(prefix, group))) {
        const logical = file.slice(prefix.length + 1);
        const bytes = read(file);
        const sha256 = digest(bytes);
        const previous = assets.get(logical);
        if (previous && previous.sha256 !== sha256) throw new Error(`Shared asset collision: ${logical}`);
        if (previous) previous.sources.push(file);
        else assets.set(logical, { path: logical, bytes: bytes.length, sha256, sources: [file] });
        add(posix('assets/shared', logical), bytes);
      }
    }
  }
  add('assets/shared/asset-manifest.json', json({ schemaVersion: 1, assets: [...assets.values()].sort((a, b) => a.path.localeCompare(b.path, 'en')) }));
  const mappings = [];
  for (const id of EPISODE_IDS) {
    const migration = JSON.parse(entries.get(`episodes/${id}/migration.json`).toString('utf8'));
    for (const file of migration.files) mappings.push({ source: file.source, target: `episodes/${id}/${file.target}`, bytes: file.bytes, sha256: file.sha256 });
  }
  for (const asset of assets.values()) for (const source of asset.sources) mappings.push({ source, target: `assets/shared/${asset.path}`, bytes: asset.bytes, sha256: asset.sha256 });
  const outputs = [...entries].map(([relative, bytes]) => ({ path: relative, bytes: bytes.length, sha256: digest(bytes) }));
  // The builder owns this shared template. Record fidelity without writing engine files.
  const sharedBackground = 'src/templates/background.html';
  if (fs.existsSync(assertSafePath(root, sharedBackground))) {
    const bytes = fs.readFileSync(path.join(root, sharedBackground));
    for (const id of EPISODE_IDS) {
      const source = `out/${category}/${id}/compositions/background.html`;
      if (!read(source).equals(bytes)) throw new Error(`Shared background differs from legacy source: ${source}`);
      mappings.push({ source, target: sharedBackground, bytes: bytes.length, sha256: digest(bytes) });
    }
    outputs.push({ path: sharedBackground, bytes: bytes.length, sha256: digest(bytes) });
  }
  const record = (relative) => {
    const absolute = assertSafePath(root, relative);
    if (!fs.existsSync(absolute)) return null;
    const bytes = fs.readFileSync(absolute);
    return { path: relative, bytes: bytes.length, sha256: digest(bytes) };
  };
  add(receiptPath, json({ schemaVersion: 1, episodes: EPISODE_IDS, archive: record('.cache/migration-baseline/legacy-source.zip'), baseline: record('.cache/migration-baseline/source-hashes.json'), mappings, outputs }));
  return { root, entries, sourceHashes: [...sourceHashes.values()], episodeCount: EPISODE_IDS.length, sceneCount, assetCount: assets.size };
}

export function verifyMigration(directory) {
  const root = fs.realpathSync(directory);
  const receiptFile = assertSafePath(root, receiptPath);
  if (!fs.existsSync(receiptFile)) throw new Error(`Migration incomplete: missing ${receiptPath}; restore legacy sources and rerun migration to create the verification receipt`);
  const receipt = JSON.parse(fs.readFileSync(receiptFile, 'utf8'));
  if (receipt.schemaVersion !== 1 || !Array.isArray(receipt.outputs) || !Array.isArray(receipt.mappings) || receipt.outputs.length === 0 || receipt.mappings.length === 0) throw new Error('Invalid migration verification receipt');
  const check = (relative, record, description) => {
    const absolute = assertSafePath(root, relative);
    if (!fs.existsSync(absolute)) throw new Error(`${description} missing: ${relative}`);
    const bytes = fs.readFileSync(absolute);
    if (bytes.length !== record.bytes || digest(bytes) !== record.sha256) throw new Error(`${description} differs from recorded migration hash: ${relative}`);
  };
  for (const output of receipt.outputs) check(output.path, output, 'Migrated output');
  let baseline = null;
  if (receipt.baseline) {
    check(receipt.baseline.path, receipt.baseline, 'Migration baseline');
    baseline = new Map(JSON.parse(fs.readFileSync(path.join(root, receipt.baseline.path), 'utf8')).map((entry) => [entry.path, entry]));
  }
  let liveSources = 0;
  let retiredSources = 0;
  for (const mapping of receipt.mappings) {
    if (baseline) {
      const original = baseline.get(mapping.source);
      if (!original || original.sha256 !== mapping.sha256 || original.bytes !== mapping.bytes) throw new Error(`Migration receipt disagrees with original baseline: ${mapping.source}`);
    }
    check(mapping.target, mapping, 'Migrated source copy');
    if (fs.existsSync(assertSafePath(root, mapping.source))) {
      check(mapping.source, mapping, 'Legacy source');
      liveSources++;
    } else retiredSources++;
  }
  let archiveStatus = 'not-recorded';
  if (receipt.archive) {
    check(receipt.archive.path, receipt.archive, 'Legacy source archive');
    archiveStatus = 'sha256-verified';
  } else if (retiredSources) throw new Error('Legacy sources retired without a recorded recovery archive; restore original sources before claiming migration fidelity');
  return { status: 'verified', episodes: receipt.episodes.length, files: receipt.outputs.length, sourceMappingsVerified: receipt.mappings.length, liveSources, retiredSources, archiveStatus, originalSourceCheck: retiredSources ? (baseline ? 'recorded-baseline-and-archive' : 'recorded-receipt-and-archive') : 'live-source-bytes', migrationRequiresRestore: retiredSources > 0, created: 0, pending: 0 };
}

export function migrateEpisodes({ root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), dryRun = false, verify = false } = {}) {
  if (verify) return verifyMigration(root);
  const plan = buildMigrationPlan(root);
  const pending = [];
  // Preflight every target before creating even one file. Preserve authored user work.
  for (const [relative, bytes] of plan.entries) {
    const target = assertSafePath(plan.root, relative);
    let ancestor = path.dirname(target);
    while (ancestor !== plan.root) {
      if (fs.existsSync(ancestor) && !fs.statSync(ancestor).isDirectory()) throw new Error(`Target parent is not a directory: ${relative}`);
      ancestor = path.dirname(ancestor);
    }
    if (fs.existsSync(target)) {
      if (!fs.statSync(target).isFile() || !fs.readFileSync(target).equals(bytes)) throw new Error(`Refusing to overwrite changed target: ${relative}`);
    } else pending.push([target, bytes]);
  }
  if (!dryRun) {
    for (const [target, bytes] of pending) {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, bytes, { flag: 'wx' });
    }
  }
  return { episodes: plan.episodeCount, scenes: plan.sceneCount, sharedAssets: plan.assetCount, sourcesVerified: plan.sourceHashes.length, files: plan.entries.size, created: dryRun ? 0 : pending.length, pending: pending.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const flags = process.argv.slice(2);
    if (flags.some((flag) => !['--dry-run', '--verify'].includes(flag))) throw new Error('Usage: node scripts/migrate-episodes.mjs [--dry-run | --verify]');
    console.log(JSON.stringify(migrateEpisodes({ dryRun: flags.includes('--dry-run'), verify: flags.includes('--verify') }), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
