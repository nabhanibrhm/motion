import test from 'node:test';
import assert from 'node:assert/strict';
import {promises as fs} from 'node:fs';
import {join,resolve} from 'node:path';
import {REPO_ROOT,loadEpisode,mergeConfig,within,narrationDefaults} from '../src/config/episodes.mjs';
import {runtimeConfig} from '../src/runtime/timing.mjs';
import {validateEpisode} from '../src/config/validate.mjs';
import {loadTiming} from '../src/runtime/timing.mjs';
import {buildEpisode} from '../src/pipeline/build.mjs';
import {ensureVoice} from '../src/pipeline/voice.mjs';
import {withEpisodeLock} from '../src/pipeline/lock.mjs';
import {captions} from '../src/templates/captions.mjs';
import {parseArgs,createEpisode} from '../scripts/motion.mjs';

async function fixture(t) {
  await fs.mkdir(join(REPO_ROOT,'.cache'),{recursive:true});
  const root=await fs.mkdtemp(join(REPO_ROOT,'.cache/engine-test-'));
  t.after(async()=>{assert.ok(resolve(root).startsWith(resolve(REPO_ROOT,'.cache')+'/')||resolve(root).startsWith(resolve(REPO_ROOT,'.cache')+'\\'));await fs.rm(root,{recursive:true,force:true});});
  for(const name of ['src/runtime','src/templates','config']) await fs.cp(join(REPO_ROOT,name),join(root,name),{recursive:true});
  for(const name of ['tools/voice','assets/shared/fonts']) await fs.mkdir(join(root,name),{recursive:true});
  await fs.writeFile(join(root,'tools/voice/generate.py'),'fixture');
  await fs.writeFile(join(root,'requirements-lock.txt'),'fixture');
  await fs.writeFile(join(root,'assets/shared/fonts/Montserrat.ttf'),'font');
  const ctx=createEpisode('example',{title:'Example',number:8,category:'Sains',repoRoot:root});
  const legacy=join(root,'legacy');
  for(const name of ['voiceover','src/data','public/voice/example']) await fs.mkdir(join(legacy,name),{recursive:true});
  await fs.writeFile(join(legacy,'voiceover/example.json'),JSON.stringify(ctx.narration));
  const voice={speakers:ctx.narration.speakers,chapters:ctx.narration.chapters,sections:[{id:'hook',chapter:'kasus',duration:1,lead:.1,audio:'voice/example/hook.mp3',lines:[{speaker:'mog',text:'Example',start:.1,end:.8,words:[{word:'Example',start:.1,end:.8}]}]}]};
  await fs.writeFile(join(legacy,'src/data/example-voice.json'),JSON.stringify(voice));
  await fs.writeFile(join(legacy,'public/voice/example/hook.mp3'),'voice fixture');
  await ensureVoice(ctx,{importLegacy:legacy});
  return {root,ctx,voice};
}

test('configuration resolves defaults, theme and episode and keeps narration highest',async t=>{
  const {root,ctx}=await fixture(t);
  await fs.mkdir(join(root,'config/themes'),{recursive:true});
  await fs.writeFile(join(root,'config/themes/test.json'),JSON.stringify({audio:{bedGain:.2,loudness:{integrated:-16}},voice:{speakers:{mog:{supertonic:{speed:.7}},newvoice:{supertonic:{voice:'M2'}}}}}));
  const path=join(ctx.episodeDir,'episode.json'),cfg=JSON.parse(await fs.readFile(path,'utf8'));
  cfg.theme='test';cfg.audio={bedGain:.4};await fs.writeFile(path,JSON.stringify(cfg));
  const next=loadEpisode('example',{repoRoot:root});
  assert.equal(next.config.audio.bedGain,.4);assert.equal(next.config.audio.loudness.integrated,-16);assert.equal(next.config.audio.loudness.truePeak,-1);
  assert.equal(next.narration.speakers.mog.supertonic.speed,1);assert.equal(next.narration.speakers.newvoice.supertonic.voice,'M2');
  assert.deepEqual(mergeConfig({a:{x:1,y:2},list:[1]},{a:{x:3},list:[2]}),{a:{x:3,y:2},list:[2]});
  const source={source:'supertonic',speakers:{mog:{x:1}}};assert.equal(JSON.stringify(narrationDefaults(source,{speakers:{mog:{x:0}}})),JSON.stringify(source));
  assert.deepEqual(narrationDefaults({speakers:{mog:{supertonic:{voice:'M1'}}}},{speakers:{mog:{supertonic:{range:1.5}},wec:{supertonic:{voice:'F2'}}}}),{speakers:{mog:{supertonic:{voice:'M1'}},wec:{supertonic:{voice:'F2'}}}});
});
test('fresh timing VM isolates episodes and preserves four/six caption profiles',async t=>{
  const {ctx,voice}=await fixture(t),a=loadTiming(ctx,voice);
  const words=Array.from({length:6},(_,i)=>({word:`word${i}`,start:i*.1,end:(i+1)*.1}));
  assert.equal(a.groupWords(words).length,1);
  const legacy=structuredClone(ctx);legacy.config.runtime.profile='legacy-inflasi';
  const b=loadTiming(legacy,{...voice,sections:[{...voice.sections[0],id:'different',duration:2}]});
  assert.equal(b.groupWords(words).length,2);assert.equal(a.section('hook').duration,1);assert.throws(()=>b.section('hook'),/Unknown/);
  assert.equal(globalThis.F1,undefined);
  assert.match(captions({F1:a,segments:a.segments().list}),/top: 1496px/);
  assert.match(captions({F1:b,segments:b.segments().list,profile:'legacy-inflasi'}),/top: 960px/);
});
test('new template builds incrementally, checks read-only and preserves authored sources',async t=>{
  const {ctx,root}=await fixture(t),source=await fs.readFile(join(ctx.episodeDir,'episode.json'));
  const first=await buildEpisode(ctx);assert.ok(first.changed.length>0);assert.equal(first.timing.seconds,2);
  const index=join(ctx.paths.buildDir,'index.html'),before=await fs.stat(index);
  assert.deepEqual((await buildEpisode(ctx)).changed,[]);
  assert.equal((await fs.stat(index)).mtimeMs,before.mtimeMs);
  await buildEpisode(ctx,{check:true});assert.deepEqual(await fs.readFile(join(ctx.episodeDir,'episode.json')),source);
  assert.match(await fs.readFile(index,'utf8'),/lib\/vendor\/gsap.min.js/);
  const generated=join(ctx.paths.buildDir,'compositions/hook.html');
  const original=await fs.readFile(generated,'utf8');await fs.writeFile(generated,'stale');
  await assert.rejects(buildEpisode(ctx,{check:true}),/out of date/);assert.equal(await fs.readFile(generated,'utf8'),'stale');
  await buildEpisode(ctx);assert.equal(await fs.readFile(generated,'utf8'),original);
  await assert.rejects(fs.access(join(root,'.cache/locks/example')));
});
test('schema rejects scene order, duplicate ids, invalid profile and missing source',async t=>{
  const {ctx}=await fixture(t);assert.equal(validateEpisode(ctx).valid,true);
  const bad=structuredClone(ctx);bad.config.scenes[0].id='captions';bad.config.runtime.profile='future';bad.narration.sections.push({...bad.narration.sections[0]});
  assert.throws(()=>validateEpisode(bad),/Duplicate narration section ids/);
  bad.config.script='../escape';assert.throws(()=>validateEpisode(bad),/escapes its root/);
  assert.throws(()=>within(ctx.episodeDir,'../../elsewhere'),/escapes/);
});
test('runtime.watermark is opt-in and validated',async t=>{
  const {ctx}=await fixture(t);
  assert.equal(validateEpisode(ctx).valid,true);
  assert.equal(Object.hasOwn(runtimeConfig(ctx.config),'watermark'),false);
  await fs.mkdir(join(ctx.paths.sharedAssetsDir,'brand'),{recursive:true});
  await fs.writeFile(join(ctx.paths.sharedAssetsDir,'brand/mark.svg'),'<svg xmlns="http://www.w3.org/2000/svg"/>');
  const ok=structuredClone(ctx);ok.config.runtime.watermark={src:'brand/mark.svg',opacity:.2,width:820};
  assert.equal(validateEpisode(ok).valid,true);
  assert.deepEqual(runtimeConfig(ok.config).watermark,{src:'brand/mark.svg',opacity:.2,width:820});
  ok.config.runtime.watermark.pulse={period:1.2,scale:.04,glow:.3};assert.equal(validateEpisode(ok).valid,true);
  const bad=(patch,re)=>{const c=structuredClone(ok);Object.assign(c.config.runtime.watermark,patch);assert.throws(()=>validateEpisode(c),re);};
  bad({src:'brand/missing.svg'},/Missing watermark asset/);
  bad({src:'../escape.svg'},/escapes its root/);
  bad({src:'brand/mark.txt'},/watermark\.src/);
  bad({opacity:1.5},/watermark\.opacity/);
  bad({width:50},/watermark\.width/);
  bad({extra:1},/watermark\.extra/);
  bad({pulse:{period:.1,scale:.04,glow:.3}},/pulse\.period/);
  bad({pulse:{period:1.2,scale:.5,glow:.3}},/pulse\.scale/);
  bad({pulse:{period:1.2,scale:.04,glow:2}},/pulse\.glow/);
  bad({pulse:{period:1.2,scale:.04,glow:.3,x:1}},/pulse\.x/);
});
test('same-episode operations serialize and release lock on errors',async t=>{
  const {ctx}=await fixture(t);
  await withEpisodeLock(ctx,async()=>{await assert.rejects(withEpisodeLock(ctx,()=>{}),/busy/);await assert.rejects(buildEpisode(ctx,{check:true}),/busy/);});
  await assert.rejects(withEpisodeLock(ctx,()=>{throw new Error('fixture failure');}),/fixture failure/);
  await withEpisodeLock(ctx,async()=>{});
});
test('CLI preserves spaced values and rejects ambiguous or unmanaged arguments',()=>{
  assert.equal(parseArgs(['new','demo','--title','A spaced title','--category','Sains']).options.title,'A spaced title');
  assert.equal(parseArgs(['clean','kelas','--dry-run']).options['dry-run'],true);
  for(const args of [['render','kelas','--','..'],['render','kelas','--','-ooutside.mp4'],['render','kelas','--','--output=outside.mp4'],['render','kelas','--','--fps','60'],['stills','kelas','hook','--at','1'],['sync','kelas','--all'],['new','demo','--title']]) assert.throws(()=>parseArgs(args));
  assert.deepEqual(parseArgs(['render','kelas','--','--quality','draft','--workers=1']).forward,['--quality','draft','--workers=1']);
});

test('video.fps opts in to 60 while timeline units and 30 fps stay unchanged',async t=>{
  const {ctx}=await fixture(t);
  assert.equal(ctx.config.video.fps,30);assert.equal(validateEpisode(ctx).valid,true);
  const b30=await buildEpisode(ctx);assert.equal(b30.timing.fps,30);assert.equal(b30.timing.renderFps,30);
  const idx30=await fs.readFile(join(b30.buildDir,'index.html'),'utf8');assert.match(idx30,/data-fps="30"/);
  const hi=structuredClone(ctx);hi.config.video.fps=60;assert.equal(validateEpisode(hi).valid,true);
  const b60=await buildEpisode(hi);assert.equal(b60.timing.fps,30);assert.equal(b60.timing.renderFps,60);assert.equal(b60.timing.seconds,b30.timing.seconds);
  assert.match(await fs.readFile(join(b60.buildDir,'index.html'),'utf8'),/data-fps="60"/);
  const bad=structuredClone(ctx);bad.config.video.fps=24;assert.throws(()=>validateEpisode(bad),/30 or 60 fps/);
});
