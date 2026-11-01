import {existsSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {ID,within} from './episodes.mjs';
import {loadTiming} from '../runtime/timing.mjs';
const reserved=new Set(['root','background','captions','chapter-card']);
export function validateEpisode(ctx,{voice=null}={}) {
  const {config:c,narration:n,episodeDir,paths}=ctx, errors=[];
  const check=(ok,msg)=>{if(!ok) errors.push(msg);};
  check(c.schemaVersion===1,'schemaVersion must be 1');
  check(Number.isSafeInteger(c.number)&&c.number>0,'number must be a positive integer');
  check(typeof c.title==='string'&&!!c.title.trim(),'title is required');
  check(typeof c.category==='string'&&/^[\p{L}\p{N}][\p{L}\p{N}_ -]*$/u.test(c.category),'category must be a nonempty name');
  check(c.video?.width===1080&&c.video?.height===1920&&c.video?.fps===30,'Only 1080x1920 at 30 fps is currently supported');
  check(['modern','legacy-inflasi'].includes(c.runtime?.profile),'Unsupported runtime profile');
  check(typeof c.runtime?.case?.id==='string'&&Number.isSafeInteger(c.runtime?.case?.steps)&&c.runtime.case.steps>0,'runtime.case requires id and positive steps');
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
  check(['supertonic','files'].includes(n.source),'narration.source must be supertonic or files');
  const canonicalVoices={mog:'M1',wec:'F2',bog:'M4'};
  if(n.source==='supertonic') for(const [speaker,settings] of Object.entries(speakers)) {
    check(typeof settings.supertonic?.voice==='string',`Speaker ${speaker}: Supertonic voice is required`);
    if(canonicalVoices[speaker]) check(settings.supertonic?.voice===canonicalVoices[speaker],`Speaker ${speaker} must retain voice ${canonicalVoices[speaker]}`);
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
    if(s.template) check(s.template==='title-card'&&typeof s.props?.title==='string'&&s.props.title.trim(),`${s.id}: invalid template/props`);
    if(s.file) try {
      const path=within(episodeDir,s.file);check(existsSync(path),`Missing scene: ${s.file}`);
      if(existsSync(path)) {
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
