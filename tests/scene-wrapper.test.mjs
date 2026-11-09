import test from 'node:test';
import assert from 'node:assert/strict';
import {promises as fs} from 'node:fs';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {REPO_ROOT,loadEpisode} from '../src/config/episodes.mjs';
import {validateEpisode} from '../src/config/validate.mjs';
import {loadTiming} from '../src/runtime/timing.mjs';
import {buildEpisode,compositionSource,hyperframesPackage} from '../src/pipeline/build.mjs';
import {ensureVoice} from '../src/pipeline/voice.mjs';
import {checkWrappedSource,wrapScene,sfxTrack} from '../src/templates/scene-wrapper.mjs';
import {createEpisode} from '../scripts/motion.mjs';

const BODY=`// two beats; the cue words come from the narration
const n = F1.n;
scene((f, { S, D, w }) => {
  const t = w("empat");
  const u = F1.at(S, "word:kata");
  return \`<div style="position:absolute;left:\${n(f)}px;top:\${t + u + D}px">\${F1.esc("halo")}</div>\`;
});
`;
const BODY_DUA=`scene((f, { w }) => \`<p>\${f + w("contoh", 1)}</p>\${"line:0"}\`);\n`;

/** A fixture repo with two wrapped .js scenes, made voice-ready from a synthetic legacy import (no TTS). */
async function wrappedFixture(t) {
  await fs.mkdir(join(REPO_ROOT,'.cache'),{recursive:true});
  const root=await fs.mkdtemp(join(REPO_ROOT,'.cache/wrapper-test-'));
  t.after(async()=>{assert.ok(resolve(root).startsWith(resolve(REPO_ROOT,'.cache')));await fs.rm(root,{recursive:true,force:true,maxRetries:10,retryDelay:200});}); // retries: Windows briefly holds locks (EBUSY) after lint/build
  for(const name of ['src/runtime','src/templates','config']) await fs.cp(join(REPO_ROOT,name),join(root,name),{recursive:true});
  for(const name of ['tools/voice','assets/shared/fonts','assets/shared/sfx']) await fs.mkdir(join(root,name),{recursive:true});
  await fs.writeFile(join(root,'tools/voice/generate.py'),'fixture');
  await fs.writeFile(join(root,'requirements-lock.txt'),'fixture');
  await fs.writeFile(join(root,'assets/shared/fonts/Montserrat.ttf'),'font');
  await fs.copyFile(join(REPO_ROOT,'assets/shared/sfx/click.wav'),join(root,'assets/shared/sfx/click.wav'));
  await fs.copyFile(join(REPO_ROOT,'assets/shared/sfx/stamp.wav'),join(root,'assets/shared/sfx/stamp.wav'));
  let ctx=createEpisode('example',{title:'Example',number:8,category:'Sains',repoRoot:root});
  const dir=ctx.episodeDir,nPath=join(dir,'narration.json'),ePath=join(dir,'episode.json');
  const n=JSON.parse(await fs.readFile(nPath,'utf8'));
  n.sections=[
    {id:'hook',chapter:'kasus',lines:[{speaker:'mog',text:'Ini hanya contoh empat kata saja'}]},
    {id:'dua',chapter:'kasus',lines:[{speaker:'mog',text:'Contoh kedua dengan contoh lagi'}]},
  ];
  await fs.writeFile(nPath,JSON.stringify(n));
  const cfg=JSON.parse(await fs.readFile(ePath,'utf8'));
  cfg.runtime.case.steps=2;
  cfg.scenes=[
    {id:'hook',file:'scenes/hook.js',bg:'#dfe8ee',sfx:[{at:'word:empat',file:'click',vol:0.22},{at:'kata',file:'stamp'},{at:'0',file:'click',vol:0.1}]},
    {id:'dua',file:'scenes/dua.js',sfx:[{at:'word:contoh#1',file:'stamp',vol:0.3}]},
  ];
  await fs.writeFile(ePath,JSON.stringify(cfg));
  await fs.mkdir(join(dir,'scenes'),{recursive:true});
  await fs.writeFile(join(dir,'scenes/hook.js'),BODY);
  await fs.writeFile(join(dir,'scenes/dua.js'),BODY_DUA);
  ctx=loadEpisode('example',{repoRoot:root});
  const legacy=join(root,'legacy');
  for(const name of ['voiceover','src/data','public/voice/example']) await fs.mkdir(join(legacy,name),{recursive:true});
  await fs.writeFile(join(legacy,'voiceover/example.json'),JSON.stringify(ctx.narration));
  let start=0;
  const sections=ctx.narration.sections.map(s=>{
    const words=s.lines[0].text.split(/\s+/).map((word,j)=>({word,start:.2+j*.3,end:.2+j*.3+.25}));
    const duration=+(words.at(-1).end+1.5).toFixed(2);
    const out={id:s.id,chapter:s.chapter,start,duration,lead:.2,tail:.1,audio:`voice/example/${s.id}.mp3`,text:s.lines[0].text,lines:[{speaker:'mog',text:s.lines[0].text,start:.2,end:words.at(-1).end,words}]};
    start+=duration;return out;
  });
  const voice={speakers:ctx.narration.speakers,chapters:ctx.narration.chapters,total:start,sections};
  await fs.writeFile(join(legacy,'src/data/example-voice.json'),JSON.stringify(voice));
  for(const s of sections) await fs.writeFile(join(legacy,`public/voice/example/${s.id}.mp3`),`voice ${s.id}`);
  await ensureVoice(ctx,{importLegacy:legacy});
  return {root,ctx,voice};
}

const audioTags=html=>[...html.matchAll(/<audio\b[^>]*>/g)].map(m=>m[0]);
const attr=(tag,name)=>(tag.match(new RegExp(`\\b${name}="([^"]*)"`))||[])[1];

test('wrapped .js scene emits the .html skeleton with bg, art layer and sfx clips',async t=>{
  const {ctx}=await wrappedFixture(t);
  assert.equal(validateEpisode(ctx).valid,true);
  const src=compositionSource(ctx,ctx.config.scenes[0],0);
  assert.match(src,/^<template>\n  <link rel="stylesheet" href="lib\/f1\/f1.css" \/>\n  <style>\n    #root \{\n      position: absolute;\n      inset: 0;\n      background: #dfe8ee;\n      overflow: hidden;\n    \}\n  <\/style>\n/);
  assert.match(src,/<div id="root" data-composition-id="hook" data-width="1080" data-height="1920">\n    <div id="hook-art" class="f1-layer"><\/div>\n/);
  assert.match(src,/<audio data-hf-media-start-basis="local" data-start="0" id="hook-sfx-0" class="clip" src="public\/sfx\/click.wav" data-at="word:empat" data-track-index="20" data-volume="0.22"><\/audio>/);
  assert.match(src,/id="hook-sfx-1"[^>]*src="public\/sfx\/stamp.wav" data-at="word:kata"[^>]*data-volume="0.2"/); // bare word, default volume
  assert.match(src,/id="hook-sfx-2"[^>]*data-at="0"[^>]*data-track-index="22"/);
  assert.match(src,/<script>\(\(\)=>\{const scene=\(render,opts\)=>\{window\.__timelines\["hook"\]=F1\.scene\("hook",render,opts\);\};\n\/\/ two beats/);
  assert.match(src,/\}\)\(\);<\/script>\n<\/template>\n$/);
  // default background when bg is omitted
  assert.match(compositionSource(ctx,ctx.config.scenes[1],1),/background: #000000;/);
  assert.equal(compositionSource(ctx,ctx.config.scenes[0],0),wrapScene(ctx.config.scenes[0],0,BODY));
});

test('wrapped scenes build with resolved data-start and unique track indices; pinned lint reports no errors',async t=>{
  const {ctx,voice}=await wrappedFixture(t);
  const res=await buildEpisode(ctx);
  const F1=loadTiming(ctx,voice),FPS=F1.FPS,sec=f=>+(f/FPS).toFixed(4);
  const hook=await fs.readFile(join(res.buildDir,'compositions/hook.html'),'utf8'),dua=await fs.readFile(join(res.buildDir,'compositions/dua.html'),'utf8');
  const clipsHook=audioTags(hook),clipsDua=audioTags(dua);
  assert.equal(clipsHook.length,3);assert.equal(clipsDua.length,1);
  const D=F1.sceneFrames('hook'),clamp=f=>Math.max(0,Math.min(D-1,Math.round(f)));
  assert.equal(attr(clipsHook[0],'data-start'),String(sec(clamp(F1.at(F1.section('hook'),'word:empat')))));
  assert.equal(attr(clipsHook[1],'data-start'),String(sec(clamp(F1.at(F1.section('hook'),'word:kata')))));
  assert.equal(attr(clipsHook[2],'data-start'),'0');
  assert.notEqual(attr(clipsHook[0],'data-start'),'0');
  assert.equal(attr(clipsDua[0],'data-start'),String(sec(clamp(F1.at(F1.section('dua'),'word:contoh#1')))));
  for(const tag of [...clipsHook,...clipsDua]) assert.equal(attr(tag,'data-hf-media-start-basis'),'local');
  const tracks=[...clipsHook,...clipsDua].map(tag=>Number(attr(tag,'data-track-index')));
  assert.equal(new Set(tracks).size,tracks.length);
  assert.deepEqual(tracks,[sfxTrack(0,0),sfxTrack(0,1),sfxTrack(0,2),sfxTrack(1,0)]);
  assert.ok(tracks.every(x=>x>=20));
  assert.deepEqual((await buildEpisode(ctx)).changed,[]); // incremental rebuild is a no-op
  // sfx files are staged where the clips point
  await fs.access(join(res.buildDir,'public/sfx/click.wav'));await fs.access(join(res.buildDir,'public/sfx/stamp.wav'));
  // pinned HyperFrames lint on the generated project
  const run=spawnSync(process.execPath,[hyperframesPackage(ctx.repoRoot).bin,'lint','--json'],{cwd:res.buildDir,encoding:'utf8'});
  const report=JSON.parse(run.stdout.slice(run.stdout.indexOf('{')));
  assert.equal(typeof report.errorCount,'number');assert.equal(report.errorCount,0,run.stdout);
  assert.equal(run.status,0,run.stdout+run.stderr);
});

test('wrapped scene validation: scene call, anchors, sfx file and volume',async t=>{
  const {ctx}=await wrappedFixture(t);
  const write=(name,text)=>fs.writeFile(join(ctx.episodeDir,'scenes',name),text);
  const bad=async(patchScene,body,re)=>{
    const c=structuredClone(ctx);Object.assign(c.config.scenes[1],patchScene);
    if(body!==undefined) await write('dua.js',body);
    assert.throws(()=>validateEpisode(c),re);
    await write('dua.js',BODY_DUA);
  };
  await bad({},'const x = 1;\n',/exactly one scene\(/);
  await bad({},'scene(f=>"a");\nscene(f=>"b");\n',/found 2/);
  await bad({},'scene(f=>"</script>");\n',/<\/script>/);
  await bad({},'scene((f,{w})=>w("nonexistentword"));\n',/Unresolved anchor|nonexistentword/);
  await bad({},'scene(f=>({at:"word:hilang"}));\n',/hilang/);
  await bad({},'scene(f=>({at:"line:9"}));\n',/line 9|line/i);
  await bad({sfx:[{at:'word:contoh',file:'nope'}]},undefined,/missing sfx\/nope.wav/);
  await bad({sfx:[{at:'word:contoh',file:'click',vol:2}]},undefined,/vol must be 0..1/);
  await bad({sfx:[{at:'word:contoh',file:'../click'}]},undefined,/sound name/);
  await bad({sfx:[{at:'word:tidakada',file:'click'}]},undefined,/tidakada|anchor/i);
  await bad({sfx:[{at:'word:contoh',file:'click',volume:.2}]},undefined,/sfx\[0\]\.volume is not supported \(did you mean "vol"\?\)/);
  await bad({bg:'blue'},undefined,/bg must be a #rrggbb/);
  await bad({sfx:Array.from({length:17},()=>({at:'0',file:'click'}))},undefined,/at most 16/);
  assert.equal(validateEpisode(ctx).valid,true);
  const found=checkWrappedSource({id:'x'},BODY);
  assert.deepEqual(found.errors,[]);assert.deepEqual(found.anchors,['word:empat','word:kata']);
  assert.deepEqual(checkWrappedSource({id:'x'},BODY_DUA).anchors,['word:contoh#1','line:0']);
});

test('bg and sfx are rejected on .html and template scenes',async t=>{
  const {ctx}=await wrappedFixture(t);
  const html=structuredClone(ctx);
  await fs.writeFile(join(ctx.episodeDir,'scenes/dua.html'),'<template><div id="root" data-composition-id="dua" data-width="1080" data-height="1920"></div></template>');
  html.config.scenes[1]={id:'dua',file:'scenes/dua.html',bg:'#ffffff'};
  assert.throws(()=>validateEpisode(html),/bg and sfx are only supported on \.js scenes/);
  const tpl=structuredClone(ctx);
  tpl.config.scenes[1]={id:'dua',template:'title-card',props:{title:'X'},sfx:[{at:'0',file:'click'}]};
  assert.throws(()=>validateEpisode(tpl),/bg and sfx are only supported on \.js scenes/);
});
