import { promises as fs } from 'node:fs';
import path from 'node:path';
import { constants } from 'node:fs';

export async function stageFile(source, destination, { mutable = false } = {}) {
  const stat = await fs.lstat(source);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`Refusing non-file or symlink: ${source}`);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  const temp = `${destination}.stage-${process.pid}-${Math.random().toString(36).slice(2)}`;
  try {
    if (mutable) await fs.copyFile(source, temp, constants.COPYFILE_EXCL);
    else { try { await fs.link(source, temp); } catch (e) { if (!['EXDEV', 'EPERM', 'EACCES', 'ENOTSUP'].includes(e.code)) throw e; await fs.copyFile(source, temp, constants.COPYFILE_EXCL); } }
    await fs.rename(temp, destination);
  } finally { await fs.rm(temp, { force: true }); }
}
async function filesUnder(root, prefix = '') {
  let st; try { st = await fs.lstat(root); } catch (e) { if (e.code === 'ENOENT') return []; throw e; }
  if (st.isSymbolicLink()) throw new Error(`Refusing symlink: ${root}`);
  if (st.isFile()) return [{ rel: prefix, file: root }];
  if (!st.isDirectory()) throw new Error(`Refusing special file: ${root}`);
  const out = [];
  for (const name of await fs.readdir(root)) out.push(...await filesUnder(path.join(root,name), prefix ? `${prefix}/${name}` : name));
  return out;
}
async function equalFiles(a,b) {
  try { const [x,y] = await Promise.all([fs.readFile(a),fs.readFile(b)]); return x.equals(y); } catch (e) { if (e.code === 'ENOENT') return false; throw e; }
}
export async function stageAssets(ctx, { check = false } = {}) {
  for (const root of [ctx.paths.buildDir,ctx.paths.sharedAssetsDir,ctx.paths.episodeAssetsDir,ctx.paths.voiceDir]) {
    const rel = path.relative(ctx.repoRoot,root);
    if (path.isAbsolute(rel) || rel === '..' || rel.startsWith(`..${path.sep}`)) throw new Error(`Asset root escapes repository: ${root}`);
    let cursor = ctx.repoRoot;
    for (const part of rel.split(path.sep).filter(Boolean)) {
      cursor = path.join(cursor,part);
      try { if ((await fs.lstat(cursor)).isSymbolicLink()) throw new Error(`Refusing symlink: ${cursor}`); }
      catch(e) { if (e.code !== 'ENOENT') throw e; break; }
    }
  }
  const target = path.join(ctx.paths.buildDir,'public');
  const candidates = new Map();
  for (const source of [ctx.paths.sharedAssetsDir,ctx.paths.episodeAssetsDir]) for (const f of await filesUnder(source)) candidates.set(f.rel,f.file);
  const sourceFiles = (await filesUnder(ctx.paths.buildDir)).filter(f => !f.rel.startsWith('public/') && /\.(?:html|css|js|mjs)$/i.test(f.rel));
  const referenced = new Set();
  for (const file of sourceFiles) {
    const text = await fs.readFile(file.file,'utf8');
    for (const rel of candidates.keys()) if (text.includes(`public/${rel}`) || ["'", '"', '`'].some(q => text.includes(`${q}${rel}${q}`))) referenced.add(rel);
  }
  for (const rel of [...(ctx.config.assets || []), ...(ctx.config.audio?.bed ? [ctx.config.audio.bed] : [])]) {
    if (typeof rel !== 'string' || !candidates.has(rel)) throw new Error(`Unknown explicit asset: ${rel}`);
    referenced.add(rel);
  }
  const manifest = JSON.parse(await fs.readFile(ctx.paths.voiceManifest,'utf8'));
  for (const section of manifest.sections) {
    const rel = section.audio;
    if (!/^[a-z0-9][a-z0-9-]*$/.test(section.id || '') || rel !== `voice/${ctx.id}/${section.id}.mp3`) throw new Error(`Invalid voice asset: ${rel}`);
    const source = path.join(ctx.paths.voiceDir,...rel.split('/'));
    const st = await fs.lstat(source); if (!st.isFile() || st.isSymbolicLink()) throw new Error(`Invalid voice asset: ${source}`);
    candidates.set(rel,source); referenced.add(rel);
  }
  const existing = await filesUnder(target), existingSet = new Set(existing.map(f=>f.rel));
  const changed = [];
  for (const rel of referenced) if (!existingSet.has(rel) || !await equalFiles(candidates.get(rel),path.join(target,...rel.split('/')))) changed.push(rel);
  for (const rel of existingSet) if (!referenced.has(rel)) changed.push(rel);
  if (check) return { files: referenced.size, changed: [...new Set(changed)].sort(), current: changed.length === 0 };
  if (!changed.length) return { files: referenced.size, changed: [], current: true };
  await fs.mkdir(ctx.paths.buildDir,{recursive:true});
  const tmp = await fs.mkdtemp(path.join(ctx.paths.buildDir,'.public-stage-'));
  const backup = `${target}-previous-${process.pid}`;
  let had = false;
  try {
    for (const rel of referenced) await stageFile(candidates.get(rel),path.join(tmp,...rel.split('/')));
    try { await fs.rename(target,backup); had = true; } catch (e) { if (e.code !== 'ENOENT') throw e; }
    try { await fs.rename(tmp,target); } catch (e) { if (had) await fs.rename(backup,target); throw e; }
    if (had) await fs.rm(backup,{recursive:true,force:true});
  } finally { await fs.rm(tmp,{recursive:true,force:true}); }
  return { files: referenced.size, changed: [...new Set(changed)].sort(), current: false };
}
export async function clean(ctx, { execute = false, target = 'all' } = {}) {
  if (target === 'voice') throw new Error('Voice cache contains imported baseline audio and cannot be cleaned.');
  if (!['build', 'stills', 'voice', 'all'].includes(target)) throw new Error(`Unknown clean target: ${target}`);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(ctx.id)) throw new Error('Invalid episode id');
  if (execute) {
    const lock = path.join(ctx.repoRoot,'.cache','locks',ctx.id);
    try { const owner = JSON.parse(await fs.readFile(path.join(lock,'owner.json'),'utf8')); if (owner.pid !== process.pid) throw new Error(`Episode is locked: ${ctx.id}`); } catch (e) { if (e.code !== 'ENOENT') throw e; try { await fs.lstat(lock); throw new Error(`Episode lock requires inspection: ${lock}`); } catch (inner) { if (inner.code !== 'ENOENT') throw inner; } }
  }
  const allowed = [];
  for (const [name, actual] of [['build',ctx.paths.buildDir],['stills',ctx.paths.stillsDir]]) {
    if (target !== 'all' && target !== name) continue;
    const expected = path.resolve(ctx.repoRoot,'.cache',name,ctx.id);
    if (path.resolve(actual).toLowerCase() !== expected.toLowerCase()) throw new Error(`Unsafe ${name} cleanup path`);
    // Reject symlink ancestors; a missing directory is harmless.
    let cursor = path.resolve(ctx.repoRoot);
    for (const part of ['.cache',name,ctx.id]) {
      cursor = path.join(cursor,part);
      try { if ((await fs.lstat(cursor)).isSymbolicLink()) throw new Error(`Unsafe cleanup symlink: ${cursor}`); } catch (e) { if (e.code !== 'ENOENT') throw e; break; }
    }
    allowed.push(expected);
  }
  const protectedPaths = target === 'voice' || target === 'all' ? [ctx.paths.voiceDir] : [];
  if (execute) for (const dir of allowed) await fs.rm(dir,{recursive:true,force:true});
  return { execute, paths: allowed, protected: protectedPaths };
}
