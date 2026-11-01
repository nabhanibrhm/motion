import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, readdirSync, existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const IDS = ['inflasi','rupiah','ihsg','paylater','judol','emas','kelas'];
const rel = (root,p) => path.relative(root,p).split(path.sep).join('/');
let checkedAncestors = new Set();
const hash = p => createHash('sha256').update(readFileSync(p)).digest('hex');
const json = p => JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,''));
function resolveInside(root, relative) {
  if (typeof relative !== 'string' || path.isAbsolute(relative) || relative.split(/[\\/]/).some(x => x === '..' || x === '.')) throw new Error(`Unsafe path: ${relative}`);
  const p=path.resolve(root,relative), r=path.relative(root,p);
  if (!r || path.isAbsolute(r) || r==='..' || r.startsWith(`..${path.sep}`)) throw new Error(`Path escapes root: ${relative}`);
  let cur=root;
  for (const part of r.split(path.sep)) { cur=path.join(cur,part); if (checkedAncestors.has(cur)) continue; const st=lstatSync(cur); if(st.isSymbolicLink()) throw new Error(`Refusing symlink: ${cur}`); if(st.isDirectory()) checkedAncestors.add(cur); }
  return p;
}
function walk(root, p, out=[]) {
  const st=lstatSync(p); if(st.isSymbolicLink()) throw new Error(`Refusing symlink: ${p}`);
  if(st.isFile()) out.push({path:p,rel:rel(root,p),bytes:st.size});
  else if(st.isDirectory()) for(const entry of readdirSync(p)) walk(root,path.join(p,entry),out);
  else throw new Error(`Refusing special file: ${p}`);
  return out;
}
function matchRecord(root,record) {
  const p=resolveInside(root,record.path); const st=lstatSync(p);
  if (!st.isFile() || st.size!==record.bytes || hash(p)!==record.sha256) throw new Error(`Verification failed: ${record.path}`);
}
const isPyc = p => p.split('/').includes('__pycache__') && p.endsWith('.pyc');
function verifyTwin(root, source, target, cache, ignorePyc=false) {
  const sourceFiles=walk(root,source);
  for(const f of sourceFiles) {
    if(ignorePyc && isPyc(f.rel)) continue;
    const sub=path.relative(source,f.path), dest=path.join(target,sub);
    const checked=resolveInside(root,rel(root,dest)), st=lstatSync(checked);
    if(!st.isFile() || st.size!==f.bytes) throw new Error(`Dependency copy differs: ${f.rel}`);
    let h=cache.get(checked); if(!h) {h=hash(checked); cache.set(checked,h);}
    if(hash(f.path)!==h) throw new Error(`Dependency copy differs: ${f.rel}`);
  }
  return sourceFiles;
}
function nodeMetadata(root, nodeDir) {
  const data = json(resolveInside(root,rel(root,path.join(nodeDir,'.package-lock.json'))));
  if (!data.packages || typeof data.packages !== 'object') throw new Error(`Missing Node package graph: ${nodeDir}`);
  const packages = { ...data.packages }; delete packages[''];
  return JSON.stringify(Object.entries(packages).sort(([a],[b])=>a.localeCompare(b)));
}
function pythonMetadata(root, site) {
  const packages = {};
  for (const name of readdirSync(site)) if (name.endsWith('.dist-info')) {
    const meta = readFileSync(resolveInside(root,rel(root,path.join(site,name,'METADATA'))),'utf8');
    const pkg = /^Name:\s*(.+)$/mi.exec(meta)?.[1]?.trim().toLowerCase().replace(/[-_.]+/g,'-');
    const version = /^Version:\s*(.+)$/mi.exec(meta)?.[1]?.trim();
    if (!pkg || !version || packages[pkg]) throw new Error(`Invalid Python package metadata: ${name}`);
    packages[pkg] = version;
  }
  if (!Object.keys(packages).length) throw new Error(`Missing Python package metadata: ${site}`);
  return packages;
}
function version312(root, env) {
  const cfg=readFileSync(resolveInside(root,rel(root,path.join(env,'pyvenv.cfg'))),'utf8');
  if (!/^version\s*=\s*3\.12(?:\.|\s|$)/mi.test(cfg)) throw new Error(`Python 3.12 environment required: ${env}`);
}
function sameTopLevel(source,target) {
  const expected = new Set(readdirSync(target));
  for (const name of readdirSync(source)) if (!expected.has(name) && name !== '__pycache__') throw new Error(`Unknown dependency item: ${path.join(source,name)}`);
}
/** Complete preflight; no writes. Returned paths are all relative to root. */
export function planRetirement(repoRoot) {
  checkedAncestors = new Set();
  const root=path.resolve(repoRoot), receipt=json(resolveInside(root,'docs/refactor-migration.json'));
  if(receipt.schemaVersion!==1 || JSON.stringify([...receipt.episodes].sort())!==JSON.stringify([...IDS].sort())) throw new Error('Invalid migration receipt episodes');
  for(const key of ['archive','baseline']) {
    const r=receipt[key], expected=key==='archive'?'.cache/migration-baseline/legacy-source.zip':'.cache/migration-baseline/source-hashes.json';
    if(r.path!==expected) throw new Error(`Unexpected ${key} path`); matchRecord(root,r);
  }
  if(!Array.isArray(receipt.mappings) || !receipt.mappings.length || !Array.isArray(receipt.outputs) || !receipt.outputs.length) throw new Error('Incomplete migration receipt');
  for(const r of receipt.mappings) { matchRecord(root,{...r,path:r.source}); matchRecord(root,{...r,path:r.target}); }
  for(const r of receipt.outputs) matchRecord(root,r);
  // Validate the retained install and lockfiles exist before considering old copies.
  const nodeRoot=resolveInside(root,'node_modules'), pyRoot=resolveInside(root,'.venv/Lib/site-packages');
  const pkg=json(resolveInside(root,'package.json')), installed=json(resolveInside(root,'node_modules/hyperframes/package.json'));
  if(pkg.devDependencies?.hyperframes!=='0.8.210' || installed.version!=='0.8.210') throw new Error('Root HyperFrames is not the pinned installation');
  const lock = json(resolveInside(root,'package-lock.json'));
  if (lock.packages?.['node_modules/hyperframes']?.version !== '0.8.210') throw new Error('Root HyperFrames lock mismatch');
  resolveInside(root,'requirements-lock.txt');
  const python = process.platform === 'win32' ? '.venv/Scripts/python.exe' : '.venv/bin/python';
  if (!lstatSync(resolveInside(root,python)).isFile()) throw new Error('Root Python interpreter is missing');
  const baseline=json(resolveInside(root,receipt.baseline.path)), base=new Map();
  for(const entry of baseline) { if(base.has(entry.path)) throw new Error(`Duplicate baseline path ${entry.path}`); matchRecord(root,entry); base.set(entry.path,entry); }
  if(!base.size) throw new Error('Empty baseline');
  const nodeGraph = nodeMetadata(root,nodeRoot), pythonGraph = pythonMetadata(root,pyRoot);
  version312(root,path.join(root,'.venv'));
  const candidates=[], cache=new Map();
  const add=(p,kind,files) => candidates.push({path:rel(root,p),kind,files:files.length,bytes:files.reduce((n,f)=>n+f.bytes,0)});
  for(const id of IDS) {
    const episode=resolveInside(root,`out/Ekonomi_keuangan/${id}`);
    for(const lock of [`.cache/locks/${id}`,`.cache/voice/${id}.lock`]) if(existsSync(path.join(root,lock))) throw new Error(`Episode has active or stale lock: ${id}`);
    const oldCache=resolveInside(root,`out/Ekonomi_keuangan/${id}/voiceover/.cache`), newCache=resolveInside(root,`.cache/voice/${id}/legacy-chunks`);
    verifyTwin(root,oldCache,newCache,cache);
    const oldManifest=resolveInside(root,`out/Ekonomi_keuangan/${id}/src/data/${id}-voice.json`), newManifest=resolveInside(root,`.cache/voice/${id}/manifest.json`);
    if(hash(oldManifest)!==hash(newManifest)) throw new Error(`Imported manifest differs: ${id}`);
    for(const section of json(oldManifest).sections) {
      if(!/^[a-z0-9][a-z0-9-]*$/.test(section.id) || section.audio!==`voice/${id}/${section.id}.mp3`) throw new Error(`Invalid voice path: ${id}`);
      const old=resolveInside(root,`out/Ekonomi_keuangan/${id}/public/${section.audio}`), newer=resolveInside(root,`.cache/voice/${id}/${section.audio}`);
      if(hash(old)!==hash(newer)) throw new Error(`Imported voice differs: ${id}/${section.id}`);
    }
    const protectedNames=new Set(['renders','debug.log']);
    for(const name of readdirSync(episode)) {
      const target=path.join(episode,name); if(protectedNames.has(name)) { walk(root,target); continue; }
      if(name==='node_modules') { if (nodeMetadata(root,target)!==nodeGraph) throw new Error(`Node package metadata differs: ${id}`); sameTopLevel(target,nodeRoot); add(target,'duplicate-node-dependencies',walk(root,target)); continue; }
      if(name==='.venv') {
        // Keep interpreter, scripts and any unknown local files. Only site-packages
        // whose non-bytecode content matches the retained installation is eligible.
        const site=resolveInside(root,`out/Ekonomi_keuangan/${id}/.venv/Lib/site-packages`);
        version312(root,target); const packages=pythonMetadata(root,site); for (const [name,version] of Object.entries(packages)) if(pythonGraph[name]!==version) throw new Error(`Python package metadata differs: ${id}/${name}`); sameTopLevel(site,pyRoot); add(site,'duplicate-python-packages',walk(root,site)); continue;
      }
      if(['.stills','.hyperframes','__pycache__'].includes(name)) {add(target,'generated-diagnostics',walk(root,target));continue;}
      const files=walk(root,target);
      for(const f of files) {
        if(f.rel.startsWith(`out/Ekonomi_keuangan/${id}/voiceover/.cache/`) || isPyc(f.rel)) continue;
        if(!base.has(f.rel)) throw new Error(`Unknown legacy file; refusing retirement: ${f.rel}`);
      }
      add(target,'archived-source-and-cache',files);
    }
  }
  return {episodes:IDS,paths:candidates,files:candidates.reduce((n,x)=>n+x.files,0),bytes:candidates.reduce((n,x)=>n+x.bytes,0),dependencyVerification:'Node package graph and Python distribution versions; dependency payloads not byte-hashed',protected:['out/result','legacy renders','legacy interpreter and scripts','debug.log','migration archive','imported voice']};
}
export function retire(repoRoot,{execute=false}={}) {
  const plan=planRetirement(repoRoot);
  if(execute) for(const entry of plan.paths) { checkedAncestors = new Set(); rmSync(resolveInside(path.resolve(repoRoot),entry.path),{recursive:true,force:false}); }
  return {...plan,executed:execute};
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const args=process.argv.slice(2); if(args.some(x=>x!=='--execute')) throw new Error('Usage: node scripts/retire-legacy.mjs [--execute]');
  const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'); console.log(JSON.stringify(retire(root,{execute:args.includes('--execute')}),null,2));
}
