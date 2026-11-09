#!/usr/bin/env node
// Regression harness for scene drawing, timing and stills. Everything is written under .cache/regress/<label>/.
//
//   capture <id...>|--all --label L --timing synthetic|voice [--force]
//   compare <id...>|--all --label L --timing synthetic|voice [--dump]
//   stills <id> --label L [--times-from L0]
//   stills-compare <id> --base A --after B [--ssim 0.9995]
//
// capture/compare run every scene's draw() in a Node VM that mirrors the browser runtime (F1 scripts, runtimeConfig,
// uid scope, scene context) at sampled frames and hash the markup. They need no voice cache with --timing synthetic
// (timing is derived deterministically from the narration). This verifies procedural markup, caption grouping, SFX
// anchors and the timeline, not browser pixels; use `stills` / `stills-compare` for pixels.
import {existsSync,mkdirSync,readFileSync,readdirSync,writeFileSync,copyFileSync,renameSync,rmSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';
import {REPO_ROOT,ID,listEpisodes,loadEpisode} from '../src/config/episodes.mjs';
import {runtimeConfig} from '../src/runtime/timing.mjs';
import {compositionSource} from '../src/pipeline/build.mjs';
import {captions} from '../src/templates/captions.mjs';

const CAPTURE_VERSION=1;
// Runtime scripts in index.html order (voice.js is generated); other scripts in the folder load afterwards.
const LIB_ORDER=['timing.js','core.js','mascot.js','toon.js','photo.js','words.js','bits.js','rig.js','world.js','cine.js'];
const MARKER=/\[(?:pause|hold)\s+([\d.]+)\]/;
const r3=x=>Math.round(x*1000)/1000;
const hash=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex').slice(0,24);
const readJSON=path=>JSON.parse(readFileSync(path,'utf8').replace(/^﻿/,''));
const LABEL=/^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export const regressDir=(repoRoot,label)=>{
  if(!LABEL.test(label||'')) throw new Error(`Invalid --label: ${label}`);
  return join(repoRoot,'.cache/regress',label);
};

/* ------------------------------------------------------------------ synthetic voice timing */

/** Deterministic manifest from the narration alone: 0.32 s/word (a line has at least 0.6 s) plus the narration defaults. */
export function syntheticVoice(narration) {
  const d={lead:.15,tail:.1,gapSameSpeaker:.1,gapNewSpeaker:.1,firstLead:.2,chapterLead:.1,chapterEndTail:.1,...narration.defaults};
  const secs=narration.sections,sections=[];
  let cursor=0;
  secs.forEach((sec,i)=>{
    const firstInChapter=i===0||secs[i-1].chapter!==sec.chapter, lastInChapter=i===secs.length-1||secs[i+1].chapter!==sec.chapter;
    const lead=i===0?d.firstLead:firstInChapter?d.chapterLead:d.lead;
    const tailOverride=lastInChapter&&i!==secs.length-1?d.chapterEndTail:null;
    let t=lead,lastAfter=null;
    const lines=[];
    sec.lines.forEach((line,li)=>{
      const pieces=String(line.text).split(MARKER); // text, secs, text, ...
      const texts=pieces.filter((_,k)=>k%2===0).map(p=>p.trim().split(/\s+/).filter(Boolean));
      const total=texts.reduce((n,w)=>n+w.length,0);
      const per=total*.32<.6?.6/Math.max(1,total):.32;
      const words=[];
      for(let k=0;k<pieces.length;k+=2) {
        for(const word of texts[k/2]) {words.push({word,start:r3(t),end:r3(t+per)});t+=per;}
        if(k+1<pieces.length) t+=parseFloat(pieces[k+1]);
      }
      lines.push({speaker:line.speaker,text:String(line.text).replace(/\[(?:pause|hold)\s+[\d.]+\]/g,' ').replace(/\s+/g,' ').trim(),start:words[0].start,end:words.at(-1).end,words});
      if(li<sec.lines.length-1) t+=line.after??(sec.lines[li+1].speaker===line.speaker?d.gapSameSpeaker:d.gapNewSpeaker);
      else lastAfter=line.after??.4;
    });
    const tail=tailOverride!==null?tailOverride:Math.max(d.tail,lastAfter-d.lead);
    t+=tail;
    const duration=r3(t);
    sections.push({id:sec.id,chapter:sec.chapter,start:r3(cursor),duration,lead:r3(lead),tail:r3(tail),audio:`voice/synthetic/${sec.id}.mp3`,text:lines.map(l=>l.text).join(' '),lines});
    cursor+=duration;
  });
  return {speakers:narration.speakers,chapters:narration.chapters,total:r3(cursor),sections};
}

async function realVoice(ctx) {
  if(!existsSync(ctx.paths.voiceManifest)) throw new Error(`${ctx.id}: no voice cache at ${ctx.paths.voiceManifest}; --timing voice needs a valid cache (use --timing synthetic, or generate the voice first)`);
  let voice;
  try {
    ({manifest:voice}=await (await import('../src/pipeline/voice.mjs')).ensureVoice(ctx,{generate:false,checkOnly:true}));
  } catch(e) {throw new Error(`${ctx.id}: voice cache is not valid for the current narration (${e.message.split('\n')[0]}); --timing voice never synthesizes`);}
  return voice;
}

/* ------------------------------------------------------------------ VM sampler */

function runtimeSources(repoRoot) {
  const dir=join(repoRoot,'src/runtime/f1');
  const names=readdirSync(dir).filter(n=>n.endsWith('.js')&&n!=='voice.js');
  const order=[...LIB_ORDER.filter(n=>names.includes(n)),...names.filter(n=>!LIB_ORDER.includes(n)).sort()];
  return {dir,order,files:order.map(name=>({name,code:readFileSync(join(dir,name),'utf8')})),css:readFileSync(join(dir,'f1.css'),'utf8')};
}

function createRuntime(ctx,voice,rt) {
  const vars=Object.fromEntries([...rt.css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(m=>[m[1],m[2].trim()]));
  const warnings=[];
  const c=vm.createContext({
    F1:{VOICE:structuredClone(voice),CONFIG:runtimeConfig(ctx.config)},window:{__timelines:{}},
    document:{documentElement:{},createElement:()=>({})},
    getComputedStyle:()=>({getPropertyValue:name=>vars[name]??''}),
    console:{warn:m=>warnings.push(String(m)),log(){},error(){}},
  });
  for(const {name,code} of rt.files) vm.runInContext(code,c,{filename:name,timeout:5000});
  // Same registration contract as core.js F1.scene: scene code returns markup; the browser would morph it into the layers.
  const defs={};
  c.F1.scene=(id,render,opts={})=>{defs[id]={render,opts};return {};};
  return {c,defs,warnings};
}

// One source of truth with the build: .html as authored, .js wrapped (bg/sfx), templates rendered.
const sceneSource=async(ctx,scene,index)=>compositionSource(ctx,scene,index);

const markupText=out=>typeof out==='string'?out:JSON.stringify(out);

function frameSet(D,section,fps60,FPS) {
  const set=new Set([0,1,8,14,Math.round(D/2),D-1].filter(f=>f>=0&&f<D));
  let firstWord=null;
  for(const line of section.lines) for(const word of line.words) {
    const at=Math.round(word.start*FPS);
    if(firstWord===null) firstWord=at;
    for(const offset of [-1,0,1]) if(at+offset>=0&&at+offset<D) set.add(at+offset);
  }
  if(fps60) for(const base of [0,Math.round(D/2),firstWord??0]) if(base+.5<D) set.add(base+.5);
  return [...set].sort((a,b)=>a-b);
}

/** Capture one episode. Returns a plain, deterministic object. `onMarkup(sceneId, frame, markup)` receives every draw output. */
export async function captureEpisode(ctx,{timing='synthetic',onMarkup=null,only=null}={}) {
  if(!['synthetic','voice'].includes(timing)) throw new Error(`--timing must be synthetic or voice, not ${timing}`);
  const voice=timing==='voice'?await realVoice(ctx):syntheticVoice(ctx.narration);
  const rt=runtimeSources(ctx.repoRoot);
  const {c,defs,warnings}=createRuntime(ctx,voice,rt);
  const F1=c.F1,FPS=F1.FPS,fps60=ctx.config.video.fps===60;
  const segments=F1.segments();
  // Browser scene counter (core.js `${id}_${n}`): every F1.scene call counts, chapter cards included, in timeline order.
  const counters=new Map();
  let counter=0;
  for(const seg of segments.list) counters.set(seg.kind==='section'?seg.section.id:`chapter:${seg.chapterId}`,counter++);
  const scenes=[];
  for(const [index,scene] of ctx.config.scenes.entries()) {
    if(only&&only!==scene.id) continue;
    const section=voice.sections.find(s=>s.id===scene.id);
    if(!section) throw new Error(`${ctx.id}/${scene.id}: scene has no narration section`);
    const source=await sceneSource(ctx,scene,index);
    for(const script of source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)) vm.runInContext(script[1],c,{filename:`${ctx.id}/${scene.id}`,timeout:5000});
    const def=defs[scene.id];
    if(!def) throw new Error(`${ctx.id}/${scene.id}: no F1.scene drawing callback`);
    const S=F1.section(scene.id),D=def.opts.frames??F1.sceneFrames(scene.id);
    if(!D) throw new Error(`${ctx.id}/${scene.id}: unknown scene length`);
    const sceneCtx=typeof F1.sceneCtx==='function'?F1.sceneCtx(scene.id,S,D):{S,D,id:scene.id};
    const scope=`${scene.id}_${counters.get(scene.id)}`;
    const samples=[];
    for(const frame of frameSet(D,section,fps60,FPS)) {
      F1.uidScope(scope);
      let out;
      try {out=markupText(def.render(Math.round(frame*1000)/1000,sceneCtx));} catch(e) {out=`ERROR ${e&&e.message}`;}
      samples.push([frame,hash(out)]);
      if(onMarkup) onMarkup(scene.id,frame,out);
    }
    const sfx=[...source.matchAll(/<audio\b[^>]*>/g)].map(m=>m[0]).filter(tag=>/\bdata-at=/.test(tag)).map(tag=>{
      const attr=name=>(tag.match(new RegExp(`\\b${name}=(["'])(.*?)\\1`))||[])[2]??null;
      let frame;
      try {frame=Math.max(0,Math.min(D-1,Math.round(F1.at(S,attr('data-at')))));} catch(e) {frame=`ERROR ${e.message}`;}
      return {src:attr('src'),vol:attr('data-volume'),frame};
    }).sort((a,b)=>String(a.frame).localeCompare(String(b.frame),'en',{numeric:true})||String(a.src).localeCompare(String(b.src)));
    scenes.push({id:scene.id,frames:D,sourceHash:hash(source),captionsHash:hash(F1.captionGroups(S)),sfxHash:hash(sfx),samples});
  }
  let captionsPageHash;
  try {captionsPageHash=hash(captions({F1,segments:segments.list,width:ctx.config.video.width,height:ctx.config.video.height,profile:ctx.config.runtime.profile}));}
  catch(e) {captionsPageHash=`ERROR ${e.message}`;}
  return {version:CAPTURE_VERSION,id:ctx.id,timing,fps:ctx.config.video.fps,
    voiceHash:hash(voice),runtimeHash:hash(rt.files.map(f=>[f.name,f.code])),cssHash:hash(rt.css),
    timelineHash:hash(segments),captionsPageHash,warnings:[...new Set(warnings)],scenes};
}

/* ------------------------------------------------------------------ capture files */

const capturePath=(repoRoot,label,id,timing)=>join(regressDir(repoRoot,label),id,`capture-${timing}.json`);
function writeCapture(path,capture) {
  mkdirSync(dirname(path),{recursive:true});
  const {scenes,...meta}=capture;
  const head=JSON.stringify(meta).slice(0,-1);
  const text=`${head},"scenes":[\n${scenes.map(s=>JSON.stringify(s)).join(',\n')}\n]}\n`;
  const tmp=`${path}.tmp-${process.pid}`;
  writeFileSync(tmp,text);renameSync(tmp,path);
}

/** Differences between a stored capture and a fresh one. `failures` fail the run; `notes` are informational. */
export function diffCaptures(before,after) {
  const failures=[],notes=[];
  for(const key of ['fps','timelineHash','captionsPageHash']) if(before[key]!==after[key]) failures.push(`${key}: ${before[key]} -> ${after[key]}`);
  for(const key of ['voiceHash','runtimeHash','cssHash']) if(before[key]!==after[key]) notes.push(`${key} changed`);
  if(JSON.stringify(before.warnings)!==JSON.stringify(after.warnings)) notes.push(`warnings changed: ${after.warnings.length} now, ${before.warnings.length} before`);
  for(const s of after.scenes) if(!before.scenes.some(b=>b.id===s.id)) failures.push(`${s.id}: scene added`);
  for(const scene of before.scenes) {
    const next=after.scenes.find(s=>s.id===scene.id);
    if(!next) {failures.push(`${scene.id}: scene missing`);continue;}
    for(const key of ['frames','captionsHash','sfxHash']) if(scene[key]!==next[key]) failures.push(`${scene.id}: ${key}`);
    if(scene.sourceHash!==next.sourceHash) notes.push(`${scene.id}: sourceHash changed`);
    const nextMap=new Map(next.samples);
    for(const [frame,h] of scene.samples) {
      if(!nextMap.has(frame)) failures.push(`${scene.id}: frame ${frame} not sampled any more`);
      else if(nextMap.get(frame)!==h) failures.push(`${scene.id}: frame ${frame}`);
    }
    const known=new Set(scene.samples.map(([f])=>f));
    for(const [frame] of next.samples) if(!known.has(frame)) failures.push(`${scene.id}: frame ${frame} newly sampled`);
  }
  return {failures,notes};
}

/* ------------------------------------------------------------------ commands */

function resolveIds(opts,repoRoot) {
  const ids=opts.all?listEpisodes({repoRoot}):opts.positionals;
  if(!ids.length) throw new Error('Name one or more episodes, or use --all');
  for(const id of ids) if(!ID.test(id)) throw new Error(`Invalid episode id: ${id}`);
  return ids;
}
const timingOf=opts=>{
  const t=opts.timing??'synthetic';
  if(!['synthetic','voice'].includes(t)) throw new Error(`--timing must be synthetic or voice, not ${t}`);
  return t;
};

export async function captureCommand(opts,{repoRoot=REPO_ROOT,log=console.log}={}) {
  const label=opts.label,timing=timingOf(opts),ids=resolveIds(opts,repoRoot);
  regressDir(repoRoot,label);
  if(!opts.force) for(const id of ids) if(existsSync(capturePath(repoRoot,label,id,timing))) throw new Error(`Capture already exists: ${capturePath(repoRoot,label,id,timing)} (use --force to overwrite)`);
  let scenes=0,samples=0;
  for(const id of ids) {
    const capture=await captureEpisode(loadEpisode(id,{repoRoot}),{timing});
    writeCapture(capturePath(repoRoot,label,id,timing),capture);
    const n=capture.scenes.reduce((a,s)=>a+s.samples.length,0);
    scenes+=capture.scenes.length;samples+=n;
    log(`captured ${id}: ${capture.scenes.length} scenes, ${n} samples (${timing})`);
  }
  log(`Captured ${ids.length} episodes / ${scenes} scenes / ${samples} samples under ${regressDir(repoRoot,label)}`);
  return {episodes:ids.length,scenes,samples};
}

export async function compareCommand(opts,{repoRoot=REPO_ROOT,log=console.log}={}) {
  const label=opts.label,timing=timingOf(opts),ids=resolveIds(opts,repoRoot);
  regressDir(repoRoot,label);
  const results=[];
  for(const id of ids) {
    const path=capturePath(repoRoot,label,id,timing);
    if(!existsSync(path)) {
      log(`FAIL ${id}: no stored capture at ${path}`);
      results.push({id,pass:false,failures:['no stored capture'],notes:[]});
      continue;
    }
    const before=readJSON(path);
    const dumped=[];
    const wanted=new Set();
    let after,error=null;
    try {
      // First pass finds the differing frames; with --dump a second pass writes their markup.
      after=await captureEpisode(loadEpisode(id,{repoRoot}),{timing});
    } catch(e) {error=e;}
    if(error) {
      log(`FAIL ${id}: cannot capture (${error.message})`);
      results.push({id,pass:false,failures:[`capture error: ${error.message}`],notes:[]});
      continue;
    }
    const {failures,notes}=diffCaptures(before,after);
    if(opts.dump) {
      const dir=join(regressDir(repoRoot,label),id,`dump-${timing}`);
      rmSync(dir,{recursive:true,force:true});
      mkdirSync(dir,{recursive:true});
      for(const f of failures) {const m=/^(.+?): frame ([\d.]+)$/.exec(f);if(m) wanted.add(`${m[1]}|${m[2]}`);}
      writeFileSync(join(dir,'after-capture.json'),JSON.stringify(after,null,1)+'\n');
      if(wanted.size) await captureEpisode(loadEpisode(id,{repoRoot}),{timing,onMarkup:(sceneId,frame,markup)=>{
        if(wanted.has(`${sceneId}|${frame}`)) {const file=`${sceneId}_${frame}.txt`;writeFileSync(join(dir,file),markup);dumped.push(file);}
      }});
    }
    const pass=failures.length===0;
    const samples=after.scenes.reduce((a,s)=>a+s.samples.length,0);
    log(`${pass?'PASS':'FAIL'} ${id}: ${after.scenes.length} scenes, ${samples} samples${pass?'':`; ${failures.length} differences`}`);
    const limit=opts.dump?Infinity:20;
    for(const f of failures.slice(0,limit)) log(`  ${f}`);
    if(failures.length>limit) log(`  ... ${failures.length-limit} more (use --dump)`);
    for(const n of notes) log(`  note: ${n}`);
    if(dumped.length) log(`  dumped ${dumped.length} markup files to ${join(regressDir(repoRoot,label),id,`dump-${timing}`)}`);
    results.push({id,pass,failures,notes});
  }
  const failed=results.filter(r=>!r.pass).length;
  log(`${results.length-failed} PASS, ${failed} FAIL`);
  return {results,failed};
}

/* ------------------------------------------------------------------ stills */

/** Fixed still moments: each section at 30% and 70%, 0.1 s, near the end; 60 fps episodes add two 1/60 s offsets. */
export function stillTimes(timing,{fps}={}) {
  const FPS=timing.fps,sections=timing.list.filter(s=>s.kind==='section');
  const times=[];
  for(const s of sections) times.push(+(s.from/FPS+s.duration/FPS*.3).toFixed(2),+(s.from/FPS+s.duration/FPS*.7).toFixed(2));
  const total=timing.seconds??+(timing.total/FPS).toFixed(4);
  times.push(.1,+(total-1.2).toFixed(4),+(total-.2).toFixed(4));
  if(fps===60&&sections.length) {
    const first=sections[0],last=sections.at(-1);
    times.push(+(first.from/FPS+first.duration/FPS*.3+1/60).toFixed(4),+(last.from/FPS+last.duration/FPS*.7+1/60).toFixed(4));
  }
  return [...new Set(times.filter(t=>t>=0&&t<total))].sort((a,b)=>a-b);
}

export async function stillsCommand(opts,{repoRoot=REPO_ROOT,log=console.log}={}) {
  const label=opts.label;
  if(opts.positionals.length!==1) throw new Error('stills takes exactly one episode id');
  const id=opts.positionals[0];
  if(!ID.test(id)) throw new Error(`Invalid episode id: ${id}`);
  const dir=join(regressDir(repoRoot,label),id),timesPath=join(dir,'times.json');
  let times;
  if(opts['times-from']) {
    const from=join(regressDir(repoRoot,opts['times-from']),id,'times.json');
    if(!existsSync(from)) throw new Error(`--times-from ${opts['times-from']}: ${from} does not exist`);
    times=readJSON(from).times;
  } else if(existsSync(timesPath)) times=readJSON(timesPath).times;
  const ctx=loadEpisode(id,{repoRoot});
  if(!times) {
    const voice=await realVoice(ctx);
    const {loadTiming}=await import('../src/runtime/timing.mjs');
    const F1=loadTiming(ctx,voice),seg=F1.segments();
    times=stillTimes({list:seg.list,total:seg.total,fps:F1.FPS},{fps:ctx.config.video.fps});
  }
  if(!Array.isArray(times)||!times.length||times.some(t=>!Number.isFinite(t)||t<0)) throw new Error('times.json has no valid times');
  mkdirSync(dir,{recursive:true});
  writeFileSync(timesPath,JSON.stringify({id,times},null,1)+'\n');
  const stillsRoot=join(repoRoot,'.cache/stills',id,'custom');
  const seen=new Set(existsSync(stillsRoot)?readdirSync(stillsRoot):[]);
  const result=spawnSync(process.execPath,[join(repoRoot,'scripts/motion.mjs'),'stills',id,'--at',times.join(',')],{cwd:repoRoot,stdio:'inherit',shell:false});
  if(result.error||result.status!==0) throw new Error(`motion stills failed for ${id} (${result.error?.message??result.signal??result.status})`);
  const fresh=readdirSync(stillsRoot).filter(n=>!seen.has(n)&&n.startsWith('run-'));
  if(fresh.length!==1) throw new Error(`Expected exactly one new stills run in ${stillsRoot}, found ${fresh.length}`);
  const pngs=readdirSync(join(stillsRoot,fresh[0])).filter(n=>/\.png$/i.test(n)).sort();
  if(pngs.length!==times.length) throw new Error(`Expected ${times.length} stills, got ${pngs.length} in ${join(stillsRoot,fresh[0])}`);
  const out=join(dir,'stills');
  rmSync(out,{recursive:true,force:true});
  mkdirSync(out,{recursive:true});
  // HyperFrames names snapshots in time order; times.json is sorted ascending, so index N is times[N].
  pngs.forEach((name,i)=>copyFileSync(join(stillsRoot,fresh[0],name),join(out,`${String(i).padStart(2,'0')}-${times[i]}.png`)));
  log(`${id}: ${pngs.length} stills -> ${out}`);
  return {times,count:pngs.length};
}

const ffmpegBin=()=>process.env.FFMPEG||'ffmpeg';
function ffmpeg(args) {
  const r=spawnSync(ffmpegBin(),args,{encoding:'utf8',maxBuffer:64*1024*1024});
  if(r.error) throw new Error(`Cannot run ffmpeg (${r.error.message}); set FFMPEG to its path`);
  return r;
}
export function compareStill(a,b,threshold=.9995) {
  const md5=file=>{const r=ffmpeg(['-v','error','-i',file,'-f','framemd5','-']);if(r.status!==0) throw new Error(`ffmpeg failed on ${file}: ${r.stderr.trim()}`);return r.stdout;};
  if(md5(a)===md5(b)) return {pass:true,identical:true,ssim:1,psnr:Infinity};
  const r=ffmpeg(['-hide_banner','-i',a,'-i',b,'-lavfi','ssim;[0:v][1:v]psnr','-f','null','-']);
  const ssim=/SSIM[^\n]*All:([\d.]+)/.exec(r.stderr),psnr=/PSNR[^\n]*average:([\d.]+|inf)/.exec(r.stderr);
  if(r.status!==0||!ssim) return {pass:false,identical:false,ssim:null,psnr:null,error:(r.stderr.trim().split('\n').at(-1))||'ffmpeg failed'};
  const s=Number(ssim[1]),p=psnr?(psnr[1]==='inf'?Infinity:Number(psnr[1])):null;
  return {pass:s>=threshold,identical:false,ssim:s,psnr:p};
}

export async function stillsCompareCommand(opts,{repoRoot=REPO_ROOT,log=console.log}={}) {
  if(opts.positionals.length!==1) throw new Error('stills-compare takes exactly one episode id');
  const id=opts.positionals[0],threshold=opts.ssim===undefined?.9995:Number(opts.ssim);
  if(!ID.test(id)) throw new Error(`Invalid episode id: ${id}`);
  if(!opts.base||!opts.after) throw new Error('stills-compare requires --base and --after');
  if(!Number.isFinite(threshold)||threshold<=0||threshold>1) throw new Error('--ssim must be a number in (0, 1]');
  const list=label=>{
    const dir=join(regressDir(repoRoot,label),id,'stills');
    if(!existsSync(dir)) throw new Error(`No stills for ${label}: ${dir}`);
    return {dir,names:readdirSync(dir).filter(n=>/\.png$/i.test(n)).sort()};
  };
  const base=list(opts.base),after=list(opts.after);
  const results=[];
  for(const name of new Set([...base.names,...after.names])) {
    if(!base.names.includes(name)||!after.names.includes(name)) {
      results.push({name,pass:false,error:`only in ${base.names.includes(name)?opts.base:opts.after}`});
      continue;
    }
    results.push({name,...compareStill(join(base.dir,name),join(after.dir,name),threshold)});
  }
  for(const r of results) log(`${r.pass?'PASS':'FAIL'} ${r.name}: ${r.error??(r.identical?'identical (framemd5)':`ssim ${r.ssim} psnr ${r.psnr}`)}`);
  const failed=results.filter(r=>!r.pass).length;
  log(`${id}: ${results.length-failed}/${results.length} stills ok (ssim threshold ${threshold})`);
  writeFileSync(join(regressDir(repoRoot,opts.after),id,`stills-compare-${opts.base}.json`),JSON.stringify({id,base:opts.base,after:opts.after,threshold,results},null,1)+'\n');
  return {results,failed};
}

/* ------------------------------------------------------------------ CLI */

const USAGE=`regress — scene/timing/stills regression harness (output under .cache/regress/<label>/)

  capture <id...>|--all --label L [--timing synthetic|voice] [--force]
  compare <id...>|--all --label L [--timing synthetic|voice] [--dump]
  stills <id> --label L [--times-from L0]       needs a valid voice cache; runs motion stills
  stills-compare <id> --base A --after B [--ssim 0.9995]
`;
const FLAGS={capture:['all','force'],compare:['all','dump'],stills:[],'stills-compare':[]};
const VALUES={capture:['label','timing'],compare:['label','timing'],stills:['label','times-from'],'stills-compare':['base','after','ssim']};
export function parseRegressArgs(argv) {
  const [command,...args]=argv;
  if(!command||command==='help'||command==='--help'||command==='-h') return {command:'help',opts:{positionals:[]}};
  if(!Object.hasOwn(FLAGS,command)) throw new Error(`Unknown command: ${command}`);
  const opts={positionals:[]};
  for(let i=0;i<args.length;i++) {
    const arg=args[i];
    if(arg==='--help'||arg==='-h') return {command:'help',opts};
    if(!arg.startsWith('--')) {opts.positionals.push(arg);continue;}
    const m=/^--([a-z-]+)(?:=(.*))?$/.exec(arg);
    if(!m) throw new Error(`Unknown option for ${command}: ${arg}`);
    const [,name,inline]=m;
    if(Object.hasOwn(opts,name)) throw new Error(`Duplicate option: --${name}`);
    if(VALUES[command].includes(name)) {
      const value=inline??args[++i];
      if(value===undefined||value===''||value.startsWith('--')) throw new Error(`--${name} requires a value`);
      opts[name]=value;
    } else if(FLAGS[command].includes(name)) {
      if(inline!==undefined) throw new Error(`--${name} takes no value`);
      opts[name]=true;
    } else throw new Error(`Unknown option for ${command}: ${arg}`);
  }
  if(opts.all&&opts.positionals.length) throw new Error('Choose an episode or --all');
  if(command==='capture'||command==='compare'||command==='stills') if(!opts.label) throw new Error(`${command} requires --label`);
  if(command==='stills-compare') for(const k of ['base','after']) if(!opts[k]) throw new Error(`stills-compare requires --${k}`);
  return {command,opts};
}

export async function main(argv=process.argv.slice(2),env={}) {
  const {command,opts}=parseRegressArgs(argv);
  if(command==='help') {console.log(USAGE);return 0;}
  if(command==='capture') {await captureCommand(opts,env);return 0;}
  if(command==='compare') return (await compareCommand(opts,env)).failed?1:0;
  if(command==='stills') {await stillsCommand(opts,env);return 0;}
  return (await stillsCompareCommand(opts,env)).failed?1:0;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) main().then(code=>{process.exitCode=code;},error=>{console.error(`regress: ${error.message}`);process.exitCode=1;});
