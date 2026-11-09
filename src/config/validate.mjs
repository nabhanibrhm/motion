import {existsSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {ID,within,readJSON} from './episodes.mjs';
import {loadTiming,PALETTE_KEYS} from '../runtime/timing.mjs';
import {checkTemplate} from '../templates/registry.mjs';
import {checkWrapperOptions,checkWrappedSource,isWrappedScene} from '../templates/scene-wrapper.mjs';
const reserved=new Set(['root','background','captions','chapter-card']);
export {PALETTE_KEYS};
const HEX=/^#[0-9a-fA-F]{6}$/;

/** Allow-list per object of the episode manifest and narration; any other key is an error with a did-you-mean hint. */
export const SCHEMA={
  top:['schemaVersion','id','number','title','category','narration','script','video','runtime','scenes','audio','theme','voice'],
  video:['width','height','fps'],
  runtime:['profile','case','watermark','palette'],
  case:['id','steps','name'],
  watermark:['src','opacity','width','height','pulse'],
  pulse:['period','scale','glow'],
  palette:PALETTE_KEYS,
  audio:['bed','bedGain','loudness'],
  loudness:['integrated','truePeak','range'],
  scene:['id','file','template','props','bg','sfx'],
  sfx:['at','file','vol'],
  voice:['source','speakers','defaults','say','cartesia'],
  narration:['comment','source','speakers','chapters','defaults','sections','say','cartesia'],
  speaker:['voice','rate','pitch','ttsmaker','supertonic','cartesia'],
  supertonic:['voice','speed','range'],
  speakerCartesia:['voice','speed'],
  cartesia:['model','language','speed','sampleRate','dictionary','say'],
  defaults:['lead','tail','gapSameSpeaker','gapNewSpeaker','firstLead','chapterLead','chapterEndTail'],
  chapter:['id','title'],
  section:['id','chapter','lines'],
  line:['speaker','text','after'],
};
/** Edit distance with adjacent transpositions (titel -> title is 1). */
function distance(a,b) {
  const d=Array.from({length:a.length+1},(_,i)=>[i,...Array(b.length).fill(0)]);
  for(let j=1;j<=b.length;j++) d[0][j]=j;
  for(let i=1;i<=a.length;i++) for(let j=1;j<=b.length;j++) {
    d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
    if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1]) d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1);
  }
  return d[a.length][b.length];
}
/** Closest allowed key to a typo (case-insensitive edit distance), or null. */
export function didYouMean(key,allowed) {
  const k=String(key).toLowerCase(), limit=Math.max(1,Math.floor(k.length/3));
  let best=null,bestD=Infinity;
  for(const name of allowed) {
    const lower=name.toLowerCase();
    let d=distance(k,lower);
    if(lower.length>=2&&k.length>=2&&(k.startsWith(lower)||lower.startsWith(k))) d=Math.min(d,1); // volume -> vol, bed -> bedGain
    if(d<bestD){bestD=d;best=name;}
  }
  return bestD<=limit&&bestD<k.length?best:null;
}
const isObj=v=>v&&typeof v==='object'&&!Array.isArray(v);
/** True when `value` is an object; reports unsupported keys against an allow-list. */
function strictKeys(errors,path,value,allowed) {
  if(!isObj(value)) {errors.push(`${path} must be an object`);return false;}
  for(const key of Object.keys(value)) if(!allowed.includes(key)) {
    const hint=didYouMean(key,allowed);
    errors.push(`${path}.${key} is not supported (${hint?`did you mean "${hint}"?`:`allowed: ${allowed.join(', ')}`})`);
  }
  return true;
}
const num=(v,min,max)=>Number.isFinite(v)&&v>=min&&v<=max;
/** Checks keys of one `speakers` block (narration or config voice). */
function schemaSpeakers(errors,path,speakers) {
  if(!strictKeys(errors,path,speakers,Object.keys(speakers||{}))) return;
  for(const [name,spk] of Object.entries(speakers)) {
    if(!strictKeys(errors,`${path}.${name}`,spk,SCHEMA.speaker)) continue;
    if(spk.supertonic!==undefined&&strictKeys(errors,`${path}.${name}.supertonic`,spk.supertonic,SCHEMA.supertonic)) {
      const st=spk.supertonic;
      if(st.voice!==undefined&&typeof st.voice!=='string') errors.push(`${path}.${name}.supertonic.voice must be a string`);
      if(st.speed!==undefined&&!num(st.speed,.3,3)) errors.push(`${path}.${name}.supertonic.speed must be 0.3..3`);
      if(st.range!==undefined&&!num(st.range,0,4)) errors.push(`${path}.${name}.supertonic.range must be 0..4`);
    }
    if(spk.ttsmaker!==undefined&&typeof spk.ttsmaker!=='string') errors.push(`${path}.${name}.ttsmaker must be a string`);
    if(spk.cartesia!==undefined) strictKeys(errors,`${path}.${name}.cartesia`,spk.cartesia,SCHEMA.speakerCartesia);
  }
}
function schemaNarrationFields(errors,path,n,{full}) {
  if(n.comment!==undefined&&typeof n.comment!=='string') errors.push(`${path}.comment must be a string`);
  if(n.speakers!==undefined) schemaSpeakers(errors,`${path}.speakers`,n.speakers);
  if(n.defaults!==undefined&&strictKeys(errors,`${path}.defaults`,n.defaults,SCHEMA.defaults)) for(const [k,v] of Object.entries(n.defaults)) if(!num(v,0,60)) errors.push(`${path}.defaults.${k} must be 0..60 seconds`);
  if(n.say!==undefined) {
    if(!isObj(n.say)||Object.values(n.say).some(v=>typeof v!=='string')) errors.push(`${path}.say must map words to spoken strings`);
  }
  if(n.cartesia!==undefined) strictKeys(errors,`${path}.cartesia`,n.cartesia,SCHEMA.cartesia);
  if(!full) return;
  for(const [i,ch] of (Array.isArray(n.chapters)?n.chapters:[]).entries()) strictKeys(errors,`${path}.chapters[${i}]`,ch,SCHEMA.chapter);
  for(const [i,sec] of (Array.isArray(n.sections)?n.sections:[]).entries()) {
    if(!strictKeys(errors,`${path}.sections[${i}]`,sec,SCHEMA.section)) continue;
    for(const [j,line] of (Array.isArray(sec.lines)?sec.lines:[]).entries()) {
      if(!strictKeys(errors,`${path}.sections[${i}].lines[${j}]`,line,SCHEMA.line)) continue;
      if(line.after!==undefined&&!num(line.after,0,60)) errors.push(`${path}.sections[${i}].lines[${j}].after must be 0..60 seconds`);
    }
  }
}
/** Strict allow-list schema for the merged config (defaults + speakers + theme + episode.json) and the narration. */
export function checkSchema(c,n) {
  const errors=[];
  if(!strictKeys(errors,'episode.json',c,SCHEMA.top)) return errors;
  if(c.video!==undefined) strictKeys(errors,'video',c.video,SCHEMA.video);
  if(c.theme!==undefined&&!(typeof c.theme==='string'&&ID.test(c.theme))) errors.push('theme must be a theme name');
  if(c.runtime!==undefined&&strictKeys(errors,'runtime',c.runtime,SCHEMA.runtime)) {
    const r=c.runtime;
    if(r.case!==undefined&&strictKeys(errors,'runtime.case',r.case,SCHEMA.case)&&r.case.name!==undefined&&!(typeof r.case.name==='string'&&r.case.name.trim())) errors.push('runtime.case.name must be a nonempty string');
    if(r.watermark!==undefined) {
      if(strictKeys(errors,'runtime.watermark',r.watermark,SCHEMA.watermark)&&r.watermark.pulse!==undefined) strictKeys(errors,'runtime.watermark.pulse',r.watermark.pulse,SCHEMA.pulse);
    }
    if(r.palette!==undefined&&strictKeys(errors,'runtime.palette',r.palette,SCHEMA.palette)) for(const [k,v] of Object.entries(r.palette)) if(!(typeof v==='string'&&HEX.test(v))) errors.push(`runtime.palette.${k} must be a #rrggbb colour`);
  }
  if(c.audio!==undefined&&strictKeys(errors,'audio',c.audio,SCHEMA.audio)&&c.audio.loudness!==undefined) strictKeys(errors,'audio.loudness',c.audio.loudness,SCHEMA.loudness);
  if(Array.isArray(c.scenes)) c.scenes.forEach((s,i)=>{
    if(!strictKeys(errors,`scenes[${i}]`,s,SCHEMA.scene)) return;
    if(Array.isArray(s.sfx)) s.sfx.forEach((e,k)=>{if(isObj(e)) strictKeys(errors,`scenes[${i}].sfx[${k}]`,e,SCHEMA.sfx);});
  });
  if(c.voice!==undefined&&strictKeys(errors,'voice',c.voice,SCHEMA.voice)) schemaNarrationFields(errors,'voice',c.voice,{full:false});
  if(isObj(n)) {
    strictKeys(errors,'narration',n,SCHEMA.narration);
    schemaNarrationFields(errors,'narration',n,{full:true});
  }
  return errors;
}
/**
 * Schema-checks the config layers that merge under every episode (config/defaults.json, config/themes/<theme>.json and
 * config/speakers.json) on their own, so a typo there is reported against its file. Returns [{body,text}]: `body` is the
 * message the merged-config check would give (used to drop the duplicate), `text` the file-prefixed message.
 */
export function checkConfigLayers(repoRoot,themeName) {
  const out=[];
  const layers=[['config/defaults.json',x=>x],['config/speakers.json',x=>({voice:{speakers:x}})]];
  if(typeof themeName==='string'&&ID.test(themeName)) layers.push([`config/themes/${themeName}.json`,x=>x]);
  for(const [file,wrap] of layers) {
    let data;
    try{const path=join(repoRoot,file);if(!existsSync(path)) continue;data=readJSON(path);}catch{continue;} // unreadable files are reported where they are loaded
    for(const body of checkSchema(wrap(data),null)) {
      const text=body.startsWith('voice.speakers')&&file==='config/speakers.json'?`${file}${body.slice('voice.speakers'.length)}`
        :body.startsWith('episode.json.')?`${file}.${body.slice('episode.json.'.length)}`:`${file}: ${body}`;
      out.push({body,text});
    }
  }
  return out;
}
/** Scaffold placeholder token left in an episode (uppercase GANTI in scenes/manifest, "Ganti:" opening a narration line). */
const PLACEHOLDER={scene:/\bGANTI\b/,line:/^\s*Ganti:/};
/** Warnings (never errors) for scaffold text that was not replaced yet. */
export function placeholderWarnings(ctx) {
  const {config:c,narration:n,episodeDir}=ctx, found=[];
  if(PLACEHOLDER.scene.test(JSON.stringify({...c,narration:undefined}))) found.push('episode.json');
  const lines=(n?.sections||[]).flatMap(sec=>sec.lines||[]);
  if(lines.some(l=>typeof l?.text==='string'&&PLACEHOLDER.line.test(l.text))) found.push(c.narration||'narration.json');
  for(const s of c.scenes||[]) if(typeof s?.file==='string') try {
    const path=within(episodeDir,s.file);
    if(existsSync(path)&&PLACEHOLDER.scene.test(readFileSync(path,'utf8'))) found.push(s.file);
  } catch{/* reported by validateEpisode */}
  return found.length?[`${ctx.id}: still has scaffold placeholder text ("GANTI"/"Ganti:") in ${found.join(', ')}`]:[];
}
export function validateEpisode(ctx,{voice=null}={}) {
  const {config:c,narration:n,episodeDir,paths}=ctx, errors=[];
  const check=(ok,msg)=>{if(!ok) errors.push(msg);};
  const layerErrors=checkConfigLayers(ctx.repoRoot,c.theme), layerBodies=new Set(layerErrors.map(e=>e.body));
  errors.push(...layerErrors.map(e=>e.text),...checkSchema(c,n).filter(e=>!layerBodies.has(e)));
  check(c.schemaVersion===1,'schemaVersion must be 1');
  check(Number.isSafeInteger(c.number)&&c.number>0,'number must be a positive integer');
  check(typeof c.title==='string'&&!!c.title.trim(),'title is required');
  check(typeof c.category==='string'&&/^[\p{L}\p{N}][\p{L}\p{N}_ -]*$/u.test(c.category),'category must be a nonempty name');
  check(c.video?.width===1080&&c.video?.height===1920&&(c.video?.fps===30||c.video?.fps===60),'Only 1080x1920 at 30 or 60 fps is currently supported');
  check(['modern','legacy-inflasi'].includes(c.runtime?.profile),'Unsupported runtime profile');
  check(typeof c.runtime?.case?.id==='string'&&Number.isSafeInteger(c.runtime?.case?.steps)&&c.runtime.case.steps>0,'runtime.case requires id and positive steps');
  const wm=c.runtime?.watermark;
  if(wm!==undefined) {
    check(wm&&typeof wm==='object'&&!Array.isArray(wm),'runtime.watermark must be an object');
    if(wm&&typeof wm==='object') {
      check(Number.isFinite(wm.opacity)&&wm.opacity>=0&&wm.opacity<=1,'runtime.watermark.opacity must be 0..1');
      check(Number.isInteger(wm.width)&&wm.width>=100&&wm.width<=1080,'runtime.watermark.width must be an integer 100..1080');
      if(wm.height!==undefined) check(Number.isInteger(wm.height)&&wm.height>=20&&wm.height<=1920,'runtime.watermark.height must be an integer 20..1920');
      if(wm.pulse!==undefined) {
        const pu=wm.pulse;
        check(pu&&typeof pu==='object'&&!Array.isArray(pu),'runtime.watermark.pulse must be an object');
        if(pu&&typeof pu==='object') {
          check(Number.isFinite(pu.period)&&pu.period>=0.4&&pu.period<=5,'runtime.watermark.pulse.period must be 0.4..5 seconds');
          check(Number.isFinite(pu.scale)&&pu.scale>=0&&pu.scale<=0.2,'runtime.watermark.pulse.scale must be 0..0.2');
          check(Number.isFinite(pu.glow)&&pu.glow>=0&&pu.glow<=0.9,'runtime.watermark.pulse.glow must be 0..0.9');
        }
      }
      if(typeof wm.src!=='string'||!/\.(?:svg|png|webp|jpe?g)$/i.test(wm.src)) errors.push('runtime.watermark.src must be an svg/png/webp/jpg asset path');
      else try{check(existsSync(within(paths.sharedAssetsDir,wm.src))||existsSync(within(paths.episodeAssetsDir,wm.src)),`Missing watermark asset: ${wm.src}`);}catch(e){errors.push(e.message);}
    }
  }
  check(typeof c.narration==='string'&&typeof c.script==='string','narration and script paths are required');
  for(const path of [c.narration,c.script]) {try{check(typeof path==='string'&&existsSync(within(episodeDir,path)),`Missing source: ${path}`);}catch(e){errors.push(e.message);}}
  check(Array.isArray(c.scenes)&&c.scenes.length>0,'scenes must be a nonempty array');
  check(Array.isArray(n.sections)&&n.sections.length>0,'narration.sections must be nonempty');
  check(Array.isArray(n.chapters)&&n.chapters.length>0,'narration.chapters must be nonempty');
  const ids=new Set(), sections=n.sections || [];
  const chapterIds=new Set((n.chapters || []).map(x=>x.id));
  check(chapterIds.size===(n.chapters || []).length,'Duplicate narration chapter ids');
  check(new Set(sections.map(s=>s.id)).size===sections.length,'Duplicate narration section ids');
  for(const chapter of n.chapters || []) check(ID.test(chapter.id || '')&&typeof chapter.title==='string'&&chapter.title.trim(),`Invalid chapter: ${chapter.id}`);
  const speakers=n.speakers || {};
  check(['supertonic','files','cartesia'].includes(n.source),'narration.source must be supertonic, files or cartesia');
  if(n.source==='cartesia') {
    const cc=n.cartesia;
    check(cc===undefined||(cc&&typeof cc==='object'&&!Array.isArray(cc)),'narration.cartesia must be an object');
    if(cc&&typeof cc==='object') {
      if(cc.speed!==undefined) check(Number.isFinite(cc.speed)&&cc.speed>=0.6&&cc.speed<=1.5,'narration.cartesia.speed must be 0.6..1.5');
      if(cc.sampleRate!==undefined) check([8000,16000,22050,24000,44100,48000].includes(cc.sampleRate),'narration.cartesia.sampleRate is not supported');
      if(cc.dictionary!==undefined&&cc.dictionary!==null) check(typeof cc.dictionary==='string'&&/\.json$/.test(cc.dictionary),'narration.cartesia.dictionary must be a .json path or null');
    }
    for(const [speaker,settings] of Object.entries(speakers)) {
      const v=settings?.cartesia;
      if(v!==undefined) check(v&&typeof v==='object'&&(v.voice===undefined||v.voice===null||typeof v.voice==='string')&&(v.speed===undefined||(Number.isFinite(v.speed)&&v.speed>=0.6&&v.speed<=1.5)),`Speaker ${speaker}: invalid cartesia settings`);
    }
  }
  const canonicalVoices={};
  try {
    const shared=join(ctx.repoRoot,'config/speakers.json');
    if(existsSync(shared)) for(const [name,spk] of Object.entries(readJSON(shared))) if(typeof spk?.supertonic?.voice==='string') canonicalVoices[name]=spk.supertonic.voice;
  } catch(e) {errors.push(`config/speakers.json: ${e.message}`);}
  if(n.source==='supertonic') for(const [speaker,settings] of Object.entries(speakers)) {
    check(typeof settings.supertonic?.voice==='string',`Speaker ${speaker}: Supertonic voice is required`);
    if(Object.hasOwn(canonicalVoices,speaker)) check(settings.supertonic?.voice===canonicalVoices[speaker],`Speaker ${speaker} must retain voice ${canonicalVoices[speaker]}`);
  }
  let anchorTiming;
  const anchorWarnings=[];
  const validateAnchor=(id,spec)=>{
    try {
      if(!anchorTiming) {
        const synthetic={...n,sections:sections.map(s=>({...s,lead:0,duration:1000,lines:(s.lines || []).map((l,i)=>({...l,start:i,end:i+.9,words:String(l.text || '').replace(/\[pause\s+[^\]]+\]/g,'').split(/\s+/).filter(Boolean).map((word,j)=>({word,start:i+j/100,end:i+(j+1)/100}))}))}))};
        anchorTiming=loadTiming(ctx,synthetic,{warnings:anchorWarnings});
      }
      anchorTiming.at(anchorTiming.section(id),spec);
    }catch(e){errors.push(`${id}: ${e.message}`);}
  };
  for(const s of sections){
    check(ID.test(s.id || '')&&!reserved.has(s.id)&&!/^chapter-\d+$/.test(s.id)&&!s.id.startsWith('voice-')&&!s.id.startsWith('cap-'),`Invalid/reserved section id: ${s.id}`);
    check(chapterIds.has(s.chapter),`Unknown chapter ${s.chapter} in ${s.id}`);
    check(Array.isArray(s.lines)&&s.lines.length>0,`${s.id}: lines required`);
    for(const l of s.lines || []) check(typeof l.text==='string'&&l.text.trim()&&Object.hasOwn(speakers,l.speaker),`${s.id}: invalid line text/speaker`);
  }
  for(const [i,s] of (c.scenes || []).entries()) {
    check(ID.test(s.id || '')&&!reserved.has(s.id),`Invalid scene id: ${s.id}`);
    check(!ids.has(s.id),`Duplicate scene id: ${s.id}`);ids.add(s.id);
    check(s.id===sections[i]?.id,`Scene order must equal narration section order at ${s.id}`);
    check(!!s.file !== !!s.template,`${s.id}: use exactly one file or template`);
    const wrapped=isWrappedScene(s);
    if(!wrapped&&(s.bg!==undefined||s.sfx!==undefined)) errors.push(`${s.id}: bg and sfx are only supported on .js scenes (a .html scene keeps its own markup; a template has no such option)`);
    if(wrapped) {const r=checkWrapperOptions(s,ctx);errors.push(...r.errors);if(!r.errors.length) for(const spec of r.anchors) validateAnchor(s.id,spec);}
    if(s.template) {const r=checkTemplate(s,ctx);errors.push(...r.errors);if(!r.errors.length) for(const spec of r.anchors) validateAnchor(s.id,spec);}
    if(s.file) try {
      const path=within(episodeDir,s.file);check(existsSync(path),`Missing scene: ${s.file}`);
      if(existsSync(path)&&wrapped) {
        const body=readFileSync(path,'utf8'), r=checkWrappedSource(s,body);
        errors.push(...r.errors);
        for(const spec of r.anchors) validateAnchor(s.id,spec);
        for(const m of body.matchAll(/F1\.at\(\s*S\s*,\s*(["'])(.*?)\1/g)) validateAnchor(s.id,m[2]);
        for(const m of body.matchAll(/(["'`(])public\/([\w@./-]+)/g)) {
          const name=m[2];
          check(existsSync(within(paths.episodeAssetsDir,name))||existsSync(within(paths.sharedAssetsDir,name)),`${s.id}: missing asset public/${name}`);
        }
      } else if(existsSync(path)) {
        const html=readFileSync(path,'utf8');
        check(html.includes(`data-composition-id="${s.id}"`) || html.includes(`data-composition-id='${s.id}'`),`${s.id}: composition namespace mismatch`);
        for(const m of html.matchAll(/\bdata-at=(["'])(.*?)\1/g)) validateAnchor(s.id,m[2]);
        for(const m of html.matchAll(/F1\.at\(\s*S\s*,\s*(["'])(.*?)\1/g)) validateAnchor(s.id,m[2]);
        for(const m of html.matchAll(/F1\.(?:wordFrame|word)\(\s*S\s*,\s*(["'])(.*?)\1(?:\s*,\s*(\d+))?/g)) validateAnchor(s.id,`word:${m[2]}${m[3]?`#${m[3]}`:''}`);
        for(const m of html.matchAll(/F1\.line\(\s*S\s*,\s*(\d+)\s*\)/g)) validateAnchor(s.id,`line:${m[1]}`);
        for(const m of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
          const ref=m[1];if(/^(?:https?:|data:|#)/.test(ref)||ref.startsWith('lib/f1/')) continue;
          if(!ref.startsWith('public/')) {errors.push(`${s.id}: unsupported resource path ${ref}`);continue;}
          const name=ref.slice(7);
          check(existsSync(within(paths.episodeAssetsDir,name))||existsSync(within(paths.sharedAssetsDir,name)),`${s.id}: missing asset ${ref}`);
        }
      }
    } catch(e) {errors.push(e.message);}
  }
  check(c.scenes?.length===sections.length,'Scene count must equal narration section count');
  errors.push(...anchorWarnings.map(message=>`Unresolved anchor: ${message}`));
  check(Number.isFinite(c.audio?.bedGain)&&c.audio.bedGain>=0&&c.audio.bedGain<=1,'audio.bedGain must be 0..1');
  for(const field of ['integrated','truePeak','range']) check(Number.isFinite(c.audio?.loudness?.[field]),`audio.loudness.${field} must be finite`);
  if(c.audio?.bed) try{check(existsSync(within(paths.episodeAssetsDir,c.audio.bed))||existsSync(within(paths.sharedAssetsDir,c.audio.bed)),`Missing bed: ${c.audio.bed}`);}catch(e){errors.push(e.message);}
  if(voice) check(JSON.stringify(voice.sections?.map(s=>s.id))===JSON.stringify(sections.map(s=>s.id)),'Voice section order does not match narration');
  if(errors.length) throw new Error(`Invalid episode ${ctx.id}:\n${errors.map(e=>'  - '+e).join('\n')}`);
  return {valid:true,scenes:ids.size};
}

/** Cross-episode checks (unique numbers and ids) plus each episode's own validation; throws one combined error. */
export function validateEpisodes(ctxs,{each=true}={}) {
  const errors=[],byNumber=new Map(),byId=new Map(),scenes={};
  for(const ctx of ctxs) {
    const {id,config:{number}}=ctx;
    if(byId.has(id)) errors.push(`Duplicate episode id: ${id}`);
    byId.set(id,ctx);
    if(byNumber.has(number)) errors.push(`Duplicate episode number ${number}: ${byNumber.get(number)} and ${id}`);
    else byNumber.set(number,id);
    if(each) try {scenes[id]=validateEpisode(ctx).scenes;} catch(e) {errors.push(e.message);}
  }
  if(errors.length) throw new Error(errors.join('\n'));
  return {valid:true,episodes:ctxs.length,scenes};
}
