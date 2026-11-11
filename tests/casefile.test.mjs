import test from 'node:test';
import assert from 'node:assert/strict';
import {promises as fs,readFileSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
import vm from 'node:vm';
import {REPO_ROOT,loadEpisode} from '../src/config/episodes.mjs';
import {validateEpisode,LOOKS} from '../src/config/validate.mjs';
import {loadTiming,runtimeConfig} from '../src/runtime/timing.mjs';
import {buildEpisode} from '../src/pipeline/build.mjs';
import {ensureVoice,effectiveNarration} from '../src/pipeline/voice.mjs';
import {captions} from '../src/templates/captions.mjs';
import {createEpisode} from '../scripts/motion.mjs';

/* ---- fixtures: a throw-away repo root (under .cache, like engine.test) with a synthetic voice, no TTS ---- */
const SPEAKERS={mog:'muklis',wec:'nisa',bog:'beni'};
/** One voice section per narration section; word timings are synthetic (.3 s per word), the section ends `after` + .1 s behind the last word. */
function synthVoice(narration) {
  let start=0;
  const sections=narration.sections.map(s=>{
    const line=s.lines[0],words=line.text.split(/\s+/).map((word,j)=>({word,start:+(.2+j*.3).toFixed(2),end:+(.2+j*.3+.25).toFixed(2)}));
    const duration=+(words.at(-1).end+(line.after??0)+.1).toFixed(2); // `after` is the silence the voice pipeline leaves behind the line
    const out={id:s.id,chapter:s.chapter,start,duration,lead:.2,tail:.1,audio:`voice/x/${s.id}.mp3`,text:line.text,lines:[{speaker:line.speaker,text:line.text,start:.2,end:words.at(-1).end,words}]};
    start+=duration;return out;
  });
  return {speakers:narration.speakers,chapters:narration.chapters,total:start,sections};
}
async function fixture(t,{format,id='example',number=8}) {
  await fs.mkdir(join(REPO_ROOT,'.cache'),{recursive:true});
  const root=await fs.mkdtemp(join(REPO_ROOT,'.cache/casefile-test-'));
  t.after(async()=>{assert.ok(resolve(root).startsWith(resolve(REPO_ROOT,'.cache')));await fs.rm(root,{recursive:true,force:true,maxRetries:10,retryDelay:200});});
  for(const name of ['src/runtime','src/templates','config','assets/shared/sfx']) await fs.cp(join(REPO_ROOT,name),join(root,name),{recursive:true});
  for(const name of ['tools/voice','assets/shared/fonts']) await fs.mkdir(join(root,name),{recursive:true});
  await fs.writeFile(join(root,'tools/voice/generate.py'),'fixture');
  await fs.writeFile(join(root,'requirements-lock.txt'),'fixture');
  await fs.writeFile(join(root,'assets/shared/fonts/Montserrat.ttf'),'font');
  let ctx=createEpisode(id,{title:'Contoh',number,category:'Hukum',format,repoRoot:root});
  // The scaffold narrates with Cartesia (needs recorded clips); the look does not care, so the fixture imports a Supertonic voice.
  const nPath=join(ctx.episodeDir,'narration.json'),n=JSON.parse(await fs.readFile(nPath,'utf8'));
  if(n.source==='cartesia') {n.source='supertonic';await fs.writeFile(nPath,JSON.stringify(n,null,2));ctx=loadEpisode(id,{repoRoot:root});}
  const voice=synthVoice(ctx.narration),legacy=join(root,'legacy');
  for(const name of ['voiceover','src/data',`public/voice/${id}`]) await fs.mkdir(join(legacy,name),{recursive:true});
  await fs.writeFile(join(legacy,`voiceover/${id}.json`),JSON.stringify(effectiveNarration(ctx)));
  const legacyVoice={...voice,sections:voice.sections.map(s=>({...s,audio:`voice/${id}/${s.id}.mp3`}))};
  await fs.writeFile(join(legacy,`src/data/${id}-voice.json`),JSON.stringify(legacyVoice));
  for(const s of voice.sections) await fs.writeFile(join(legacy,`public/voice/${id}/${s.id}.mp3`),`voice ${s.id}`);
  await ensureVoice(ctx,{importLegacy:legacy});
  return {root,ctx,voice:legacyVoice};
}

test('runtime.look accepts only "casefile" and is passed through runtimeConfig only when set',async t=>{
  const {ctx}=await fixture(t,{format:'default'});
  assert.deepEqual(LOOKS,['casefile']);
  assert.equal(validateEpisode(ctx).valid,true);
  assert.equal(Object.hasOwn(runtimeConfig(ctx.config),'look'),false); // other episodes: nothing new reaches the runtime
  const ok=structuredClone(ctx);ok.config.runtime.look='casefile';
  assert.equal(validateEpisode(ok).valid,true);
  assert.equal(runtimeConfig(ok.config).look,'casefile');
  for(const bad of ['neon','Casefile','',7,null,{}]) {
    const c=structuredClone(ctx);c.config.runtime.look=bad;
    assert.throws(()=>validateEpisode(c),/runtime\.look must be one of: casefile/,`look=${JSON.stringify(bad)}`);
  }
});

test('the casefile theme sets the look and a complete palette, and the kasus scaffold inherits both',async t=>{
  const {ctx}=await fixture(t,{format:'kasus'});
  assert.equal(ctx.config.theme,'casefile');
  assert.equal(ctx.config.runtime.look,'casefile');
  for(const key of ['bg','paper','ink','muted','source','red','accent','teal','tealDark','drift','haze']) assert.match(ctx.config.runtime.palette[key],/^#[0-9a-f]{6}$/i,key);
  assert.equal(validateEpisode(ctx).valid,true);
  assert.equal(runtimeConfig(ctx.config).look,'casefile');
});

test('build loads lib/f1/casefile.js after cine only when the theme sets runtime.look',async t=>{
  const plain=await fixture(t,{format:'default',id:'plain'});
  const bp=await buildEpisode(plain.ctx);
  const ip=await fs.readFile(join(bp.buildDir,'index.html'),'utf8');
  assert.doesNotMatch(ip,/casefile/);
  assert.equal(existsSync(join(bp.buildDir,'lib/f1/casefile.js')),false);
  assert.match(ip,/lib\/f1\/cine\.js/);

  const cf=await fixture(t,{format:'kasus',id:'kasus-baru',number:21});
  const bc=await buildEpisode(cf.ctx);
  const ic=await fs.readFile(join(bc.buildDir,'index.html'),'utf8');
  assert.ok(ic.indexOf('lib/f1/casefile.js')>ic.indexOf('lib/f1/cine.js'),'casefile.js is loaded after cine.js');
  assert.equal(await fs.readFile(join(bc.buildDir,'lib/f1/casefile.js'),'utf8'),readFileSync(join(REPO_ROOT,'src/templates/casefile-kit.js'),'utf8'));
  for(const id of ['hook','fakta','sisi','vonis']) assert.ok(existsSync(join(bc.buildDir,`compositions/${id}.html`)),id);
  // the build is idempotent with the look as well
  assert.deepEqual((await buildEpisode(cf.ctx)).changed,[]);
});

test('the casefile caption style is selected by the look (and not by the legacy profile)',async t=>{
  const {ctx,voice}=await fixture(t,{format:'kasus',id:'kasus-baru',number:21});
  const F1=loadTiming(ctx,voice),segments=F1.segments().list,palette=ctx.config.runtime.palette;
  const plain=captions({F1,segments});
  const look=captions({F1,segments,look:'casefile',palette});
  assert.match(plain,/top: 1496px/);assert.doesNotMatch(plain,/box-shadow: 0 0 0 4px/);
  assert.match(look,/top: 1496px/);
  assert.match(look,/box-shadow: 0 0 0 4px #151515/);       // ink outline
  assert.match(look,/rgba\(251, 249, 245, 0\.94\)/);          // paper box
  assert.ok(look.includes('#1d6b6b')||look.includes('29, 107, 107'),'spoken word / key words use the teal');
  assert.notEqual(look,plain);
  // the palette overrides the casefile defaults, so the alternative casefile themes recolour the captions
  const navy=captions({F1,segments,look:'casefile',palette:{...palette,ink:'#0a1f44'}});
  assert.match(navy,/box-shadow: 0 0 0 4px #0a1f44/);
  // a look never replaces the legacy profile
  const legacy=captions({F1,segments,profile:'legacy-inflasi',look:'casefile',palette});
  assert.match(legacy,/top: 960px/);assert.doesNotMatch(legacy,/box-shadow: 0 0 0 4px #151515/);
});

/* ---- the scaffold scenes, run in a Node VM that mirrors the browser load order (timing, core, world, cine, casefile) ---- */
const DIR=join(REPO_ROOT,'src/runtime/f1');
const cssVars=Object.fromEntries([...readFileSync(join(DIR,'f1.css'),'utf8').matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(m=>[m[1],m[2].trim()]));
const SCENES=['hook','fakta','sisi','vonis'];
function sceneRuntime(ctx,voice) {
  const warnings=[],renders={};
  const CONFIG={...runtimeConfig(ctx.config),captions:{maxWords:6}};
  const c=vm.createContext({
    F1:{VOICE:structuredClone(voice),CONFIG},window:{__timelines:{}},
    document:{documentElement:{},createElement:()=>({}),getElementById:()=>({parentElement:{querySelectorAll:()=>[]}})},
    getComputedStyle:()=>({getPropertyValue:name=>cssVars[name]??''}),
    gsap:{timeline:()=>({to(){return this;}})},
    console:{warn:m=>warnings.push(String(m)),log(){},error(){}},
  });
  const load=(file,filename)=>vm.runInContext(readFileSync(file,'utf8'),c,{filename,timeout:5000});
  for(const name of ['timing.js','core.js','mascot.js','toon.js','photo.js','words.js','bits.js','rig.js','world.js','cine.js']) load(join(DIR,name),name);
  load(join(REPO_ROOT,'src/templates/casefile-kit.js'),'casefile-kit.js');
  for(const id of SCENES) {
    c.scene=render=>{renders[id]=render;};
    vm.runInContext(readFileSync(join(ctx.episodeDir,`scenes/${id}.js`),'utf8'),c,{filename:`${id}.js`,timeout:5000});
  }
  const F1=c.F1;
  const draw=(id,f)=>{F1.uidScope(`t_${id}`);const S=F1.section(id);return renders[id](f,F1.sceneCtx(id,S,F1.sceneFrames(id)));};
  return {F1,warnings,draw,frames:id=>F1.sceneFrames(id)};
}

test('kasus scaffold scenes render clean markup on every frame, use only F1.casefile, and keep the layout contract',async t=>{
  const {ctx,voice}=await fixture(t,{format:'kasus',id:'kasus-baru',number:21});
  const rt=sceneRuntime(ctx,voice);
  assert.ok(rt.F1.casefile,'F1.casefile is loaded');
  assert.equal(rt.F1.casefile.T.paper,'#f2efe9');
  for(const id of SCENES) {
    const source=readFileSync(join(ctx.episodeDir,`scenes/${id}.js`),'utf8');
    assert.match(source,/F1\.casefile/,id);
    assert.doesNotMatch(source,/F1\.cine|\bC\.|Math\.random|Date\.now|setTimeout|setInterval|requestAnimationFrame|transition|@keyframes|animation:/,`${id}: timeline-only, casefile-only`);
    for(const m of source.matchAll(/\bx:\s*(\d+),[^\n]*?\bw:\s*(\d+)/g)) assert.ok(Number(m[1])+Number(m[2])<=960,`${id}: x ${m[1]} + w ${m[2]} reaches into the right 120 px`);
    for(const m of source.matchAll(/\by:\s*(\d+)/g)) assert.ok(Number(m[1])<=1200,`${id}: y ${m[1]} is below the narrator line (lower ~15% stays clear)`);
    const D=rt.frames(id);
    for(let f=0;f<=D;f+=1.5) {
      const html=rt.draw(id,f);
      assert.equal(typeof html,'string',`${id} f=${f}`);
      assert.ok(!/NaN|undefined|Infinity|\bnull\b/.test(html),`${id} f=${f}: bad value in markup`);
      assert.doesNotMatch(html,/transition|animation:/,`${id} f=${f}`);
      assert.equal(html,rt.draw(id,f),`${id} f=${f}: the markup is a pure function of the frame`);
    }
  }
  assert.deepEqual(rt.warnings,[]); // every w("...") anchor is found in the scaffold narration
});

test('kasus scaffold: frame 0 of the hook shows the claim, the verdict stamps on "ditutup" and the title cover owns the last second',async t=>{
  const {ctx,voice}=await fixture(t,{format:'kasus',id:'kasus-baru',number:21});
  const rt=sceneRuntime(ctx,voice),{F1}=rt;
  const h0=rt.draw('hook',0);
  assert.ok(h0.includes('GANTI DENGAN')&&h0.includes('KLAIM'),'claim headline is fully drawn at t = 0');
  assert.ok(h0.includes('KASUS'),'case label in the head strip');
  assert.ok(/z-index:\s*50/.test(rt.draw('vonis',rt.frames('vonis')-1)),'cover is up on the last frame');
  const D=rt.frames('vonis'),S=F1.section('vonis');
  let first=null;
  for(let f=0;f<=D;f++) if(/z-index:\s*50/.test(rt.draw('vonis',f))){first=f;break;}
  const lastWord=Math.round(S.lines.at(-1).end*30);
  assert.ok(first!==null&&first>=lastWord&&first<=lastWord+6,`cover starts right after the last spoken word (${first} vs ${lastWord})`);
  assert.ok(D-first>=30,`cover holds for ${D-first} frames (${((D-first)/30).toFixed(2)} s): at least 1 s for the TikTok cover pick`);
  const stamp=F1.wordFrame(S,'ditutup');
  assert.ok(!rt.draw('vonis',Math.max(0,stamp-2)).includes('KASUS DITUTUP'));
  assert.ok(rt.draw('vonis',stamp+8).includes('KASUS DITUTUP'));
  assert.ok(rt.draw('vonis',first+10).includes('GANTI')); // cover lines (placeholder until the script fills them)
  assert.equal(rt.warnings.length,0);
});
