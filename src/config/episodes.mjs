import {existsSync, readFileSync, readdirSync, lstatSync} from 'node:fs';
import {dirname, resolve, join, relative, isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const ID = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
export function readJSON(path) { return JSON.parse(readFileSync(path,'utf8').replace(/^\uFEFF/,'')); }
export function mergeConfig(...layers) {
  const out={};
  for(const layer of layers) for(const [key,value] of Object.entries(layer || {})) {
    if(value && typeof value==='object' && !Array.isArray(value)) out[key]=mergeConfig(out[key],value);
    else out[key]=structuredClone(value);
  }
  return out;
}
/** Keep authored key order and values while filling omitted narration settings. */
export function narrationDefaults(authored,defaults) {
  const out=structuredClone(authored);
  for(const [key,value] of Object.entries(defaults || {})) {
    if(!Object.hasOwn(out,key)) out[key]=structuredClone(value);
    else if(key==='speakers'&&out[key]&&value&&typeof value==='object') {
      // A fully authored speaker may intentionally omit processing knobs (e.g. range=1).
      // Inherit only missing speaker definitions, never change such implicit defaults.
      for(const [speaker,settings] of Object.entries(value)) if(!Object.hasOwn(out[key],speaker)) out[key][speaker]=structuredClone(settings);
    }
    else if(out[key]&&value&&typeof out[key]==='object'&&typeof value==='object'&&!Array.isArray(out[key])&&!Array.isArray(value)) out[key]=narrationDefaults(out[key],value);
  }
  return out;
}
export function within(root, path) {
  const abs=resolve(root,path), rel=relative(root,abs);
  if(isAbsolute(path) || rel==='..' || rel.startsWith('..\\') || rel.startsWith('../')) throw new Error(`Path escapes its root: ${path}`);
  let cursor=resolve(root);
  for(const part of ['',...rel.split(/[\\/]/).filter(Boolean)]) {
    if(part) cursor=join(cursor,part);
    if(existsSync(cursor)&&lstatSync(cursor).isSymbolicLink()) throw new Error(`Symlink path is not supported: ${cursor}`);
  }
  return abs;
}
/** Episode folders are `<NN>_<id>` (e.g. `01_inflasi`); a bare `<id>` folder is still accepted. */
export const episodeFolder=(id,number)=>`${String(number).padStart(2,'0')}_${id}`;
function parseFolder(name) {
  const m=/^(\d{2,})_(.+)$/.exec(name);
  if(m) return ID.test(m[2]) ? {id:m[2],number:Number(m[1])} : null;
  return ID.test(name) ? {id:name,number:null} : null;
}
// Folder scan, memoised per repo root. An entry is reused only while the `episodes/` directory listing is unchanged
// (one cheap readdir) so folders created in-process (`new`) are seen at once; resetEpisodeCache() drops it explicitly.
const scanCache=new Map();
let scanCount=0;
export function resetEpisodeCache() { scanCache.clear(); }
/** Number of full folder scans done since start (test seam for the memo). */
export const episodeScanCount=()=>scanCount;
function episodeFolders(repoRoot) {
  repoRoot=resolve(repoRoot);
  const dir=join(repoRoot,'episodes');
  if(!existsSync(dir)) return [];
  const entries=readdirSync(dir,{withFileTypes:true}), signature=entries.map(x=>`${x.isDirectory()?'d':'f'}${x.name}`).sort().join('\n');
  const hit=scanCache.get(repoRoot);
  if(hit&&hit.signature===signature) return hit.folders;
  scanCount++;
  const folders=entries.filter(x=>x.isDirectory() && existsSync(join(dir,x.name,'episode.json'))).map(x=>({name:x.name,...parseFolder(x.name)})).filter(x=>x.id);
  scanCache.set(repoRoot,{signature,folders});
  return folders;
}
export function listEpisodes({repoRoot=REPO_ROOT}={}) {
  return [...episodeFolders(repoRoot)].sort((a,b)=>(a.number ?? Infinity)-(b.number ?? Infinity) || a.id.localeCompare(b.id)).map(x=>x.id);
}
export function loadEpisode(id,{repoRoot=REPO_ROOT}={}) {
  if(!ID.test(id || '')) throw new Error(`Invalid episode id: ${id}`);
  repoRoot=resolve(repoRoot);
  let folders=episodeFolders(repoRoot).filter(x=>x.id===id);
  if(!folders.length) {resetEpisodeCache();folders=episodeFolders(repoRoot).filter(x=>x.id===id);} // an episode.json added to an existing folder
  if(folders.length>1) throw new Error(`Episode ${id} has more than one folder: ${folders.map(x=>x.name).join(', ')}`);
  if(!folders.length) throw new Error(`Episode not found: ${id}`);
  const episodeDir=within(repoRoot,`episodes/${folders[0].name}`), manifest=join(episodeDir,'episode.json');
  const authored=readJSON(manifest), defaults=join(repoRoot,'config/defaults.json');
  let theme={};
  if(authored.theme) {
    if(!ID.test(authored.theme)) throw new Error('Invalid theme name');
    theme=readJSON(join(repoRoot,'config/themes',`${authored.theme}.json`));
  }
  const speakersPath=join(repoRoot,'config/speakers.json');
  const config=mergeConfig(existsSync(speakersPath)?{voice:{speakers:readJSON(speakersPath)}}:{},existsSync(defaults)?readJSON(defaults):{},theme,authored);
  if(config.id!==id) throw new Error(`Manifest id must equal directory: ${id}`);
  if(folders[0].number!==null && folders[0].number!==config.number) throw new Error(`Folder ${folders[0].name} does not match episode number ${config.number}`);
  const narration=narrationDefaults(readJSON(within(episodeDir,config.narration || 'narration.json')),config.voice || {});
  const buildDir=within(repoRoot,`.cache/build/${id}`), voiceDir=within(repoRoot,`.cache/voice/${id}`);
  return {repoRoot,episodeDir,id,config,narration,paths:{buildDir,voiceDir,voiceManifest:join(voiceDir,'manifest.json'),voiceState:join(voiceDir,'state.json'),chunkCacheDir:join(repoRoot,'.cache/voice/chunks'),sharedAssetsDir:within(repoRoot,'assets/shared'),episodeAssetsDir:within(episodeDir,'assets'),stillsDir:join(repoRoot,'.cache/stills',id),rawRenderFile:join(buildDir,'render.raw.mp4'),resultFile:join(repoRoot,'out',`${String(config.number).padStart(2,'0')}-${id}-short.mp4`)}};
}
