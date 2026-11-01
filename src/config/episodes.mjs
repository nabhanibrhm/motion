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
export function listEpisodes({repoRoot=REPO_ROOT}={}) {
  const dir=join(repoRoot,'episodes');
  return existsSync(dir) ? readdirSync(dir,{withFileTypes:true}).filter(x=>x.isDirectory() && ID.test(x.name) && existsSync(join(dir,x.name,'episode.json'))).map(x=>x.name).sort() : [];
}
export function loadEpisode(id,{repoRoot=REPO_ROOT}={}) {
  if(!ID.test(id || '')) throw new Error(`Invalid episode id: ${id}`);
  repoRoot=resolve(repoRoot);
  const episodeDir=within(repoRoot,`episodes/${id}`), manifest=join(episodeDir,'episode.json');
  if(!existsSync(manifest)) throw new Error(`Episode not found: ${id}`);
  const authored=readJSON(manifest), defaults=join(repoRoot,'config/defaults.json');
  let theme={};
  if(authored.theme) {
    if(!ID.test(authored.theme)) throw new Error('Invalid theme name');
    theme=readJSON(join(repoRoot,'config/themes',`${authored.theme}.json`));
  }
  const speakersPath=join(repoRoot,'config/speakers.json');
  const config=mergeConfig(existsSync(speakersPath)?{voice:{speakers:readJSON(speakersPath)}}:{},existsSync(defaults)?readJSON(defaults):{},theme,authored);
  if(config.id!==id) throw new Error(`Manifest id must equal directory: ${id}`);
  const narration=narrationDefaults(readJSON(within(episodeDir,config.narration || 'narration.json')),config.voice || {});
  const buildDir=within(repoRoot,`.cache/build/${id}`), voiceDir=within(repoRoot,`.cache/voice/${id}`);
  return {repoRoot,episodeDir,id,config,narration,paths:{buildDir,voiceDir,voiceManifest:join(voiceDir,'manifest.json'),voiceState:join(voiceDir,'state.json'),chunkCacheDir:join(repoRoot,'.cache/voice/chunks'),sharedAssetsDir:within(repoRoot,'assets/shared'),episodeAssetsDir:within(episodeDir,'assets'),stillsDir:join(repoRoot,'.cache/stills',id),rawRenderFile:join(buildDir,'render.raw.mp4'),resultFile:join(repoRoot,'out/result',`${String(config.number).padStart(2,'0')}-${id}-short.mp4`)}};
}
