import test from 'node:test';
import assert from 'node:assert/strict';
import {promises as fs,readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {createContext,Script} from 'node:vm';
import {REPO_ROOT,loadEpisode} from '../src/config/episodes.mjs';
import {validateEpisode} from '../src/config/validate.mjs';
import {runtimeConfig} from '../src/runtime/timing.mjs';
import {buildEpisode} from '../src/pipeline/build.mjs';
import {ensureVoice} from '../src/pipeline/voice.mjs';
import {createEpisode,parseArgs} from '../scripts/motion.mjs';
import {TEMPLATE_NAMES} from '../src/templates/registry.mjs';
import {cueSpec} from '../src/templates/hotwizz.mjs';

/** A fixture repo with a `new --flash` episode, made voice-ready from a synthetic legacy import (no TTS). */
async function flashFixture(t) {
  await fs.mkdir(join(REPO_ROOT,'.cache'),{recursive:true});
  const root=await fs.mkdtemp(join(REPO_ROOT,'.cache/hotwizz-test-'));
  t.after(async()=>{assert.ok(resolve(root).startsWith(resolve(REPO_ROOT,'.cache')));await fs.rm(root,{recursive:true,force:true});});
  for(const name of ['src/runtime','src/templates','config']) await fs.cp(join(REPO_ROOT,name),join(root,name),{recursive:true});
  for(const name of ['tools/voice','assets/shared/brand','assets/shared/people']) await fs.mkdir(join(root,name),{recursive:true});
  await fs.writeFile(join(root,'tools/voice/generate.py'),'fixture');
  await fs.writeFile(join(root,'requirements-lock.txt'),'fixture');
  await fs.copyFile(join(REPO_ROOT,'assets/shared/brand/hotwizz-logo.svg'),join(root,'assets/shared/brand/hotwizz-logo.svg'));
  await fs.writeFile(join(root,'assets/shared/people/tokoh.jpg'),'jpg fixture');
  let ctx=createEpisode('kilat',{title:'Kilat',number:21,flash:true,repoRoot:root});
  // voice import needs a supertonic/legacy narration; the flash default (cartesia) is checked before the switch
  assert.equal(ctx.narration.source,'cartesia');
  const nPath=join(ctx.episodeDir,'narration.json'),n=JSON.parse(await fs.readFile(nPath,'utf8'));
  n.source='supertonic';await fs.writeFile(nPath,JSON.stringify(n));
  ctx=loadEpisode('kilat',{repoRoot:root});
  const legacy=join(root,'legacy');
  for(const name of ['voiceover','src/data','public/voice/kilat']) await fs.mkdir(join(legacy,name),{recursive:true});
  await fs.writeFile(join(legacy,'voiceover/kilat.json'),JSON.stringify(ctx.narration));
  let start=0;
  const sections=ctx.narration.sections.map(s=>{
    const words=s.lines[0].text.split(/\s+/).map((word,j)=>({word,start:.2+j*.3,end:.2+j*.3+.25}));
    const duration=+(words.at(-1).end+1.5).toFixed(2),out={id:s.id,chapter:s.chapter,start,duration,lead:.2,tail:.1,audio:`voice/kilat/${s.id}.mp3`,text:s.lines[0].text,lines:[{speaker:'wec',text:s.lines[0].text,start:.2,end:words.at(-1).end,words}]};
    start+=duration;return out;
  });
  const voice={speakers:ctx.narration.speakers,chapters:ctx.narration.chapters,total:start,sections};
  await fs.writeFile(join(legacy,'src/data/kilat-voice.json'),JSON.stringify(voice));
  for(const s of sections) await fs.writeFile(join(legacy,`public/voice/kilat/${s.id}.mp3`),`voice ${s.id}`);
  await ensureVoice(ctx,{importLegacy:legacy});
  return {root,ctx,voice};
}

test('new --flash scaffolds a valid HotWizz manifest; plain new is unchanged',async t=>{
  const {root,ctx}=await flashFixture(t);
  const c=ctx.config;
  assert.equal(c.theme,'hotwizz');assert.equal(c.category,'Berita');assert.equal(c.video.fps,30);assert.equal(c.audio.bed,null);
  assert.equal(c.runtime.case.id,'HOTWIZZ #01');assert.equal(c.runtime.case.steps,5);
  assert.deepEqual(c.scenes.map(s=>s.template),['hw-hook','hw-resmi','hw-split','hw-quote','hw-cover']);
  assert.deepEqual(c.scenes.map(s=>s.id),['hook','resmi','belum','kutipan','penutup']);
  const authored=JSON.parse(await fs.readFile(join(ctx.episodeDir,'narration.json'),'utf8'));assert.deepEqual(Object.keys(authored.speakers),['wec']);assert.deepEqual([...new Set(authored.sections.flatMap(x=>x.lines.map(l=>l.speaker)))],['wec']);
  assert.equal(validateEpisode(ctx).valid,true);
  const plain=createEpisode('biasa',{title:'Biasa',repoRoot:root});
  assert.equal(plain.config.theme,undefined);assert.equal(plain.config.category,'Ekonomi_keuangan');
  assert.deepEqual(plain.config.scenes,[{id:'hook',template:'title-card',props:{title:'Biasa'}}]);
  assert.equal(plain.narration.source,'supertonic');
  const next=createEpisode('kedua',{title:'Kedua',flash:true,repoRoot:root});
  assert.equal(next.config.runtime.case.id,'HOTWIZZ #02');
  assert.equal(parseArgs(['new','x','--title','X','--flash']).options.flash,true);
});

test('hw-* templates build with resolved SFX anchors, staged photos and no interpolated src attributes',async t=>{
  const {ctx}=await flashFixture(t);
  const scenes=ctx.config.scenes;
  scenes[0].props.person.photo='people/tokoh.jpg';scenes[0].props.person.credit='Fixture (CC0)';
  scenes[0].props.cue='Ganti';scenes[0].props.stamp={text:'RESMI',cue:'line:0:end'};
  scenes[1].props.items[1].cue='word:resmi';
  scenes.splice(3,0,{id:'angka',template:'hw-number',props:{value:'Rp1.250,5',unit:'triliun',caption:'Nilai *contoh*',source:'Media A, Media B',cue:'line:0'}});
  ctx.narration.sections.splice(3,0,{id:'angka',chapter:'update',lines:[{speaker:'wec',text:'Ganti angka.'}]});
  // the scaffold voice has no angka section; drop it again for the build and only validate the added scene
  assert.equal(validateEpisode(ctx).valid,true);
  scenes.splice(3,1);ctx.narration.sections.splice(3,1);
  const built=await buildEpisode(ctx);
  for(const s of scenes) {
    const html=await fs.readFile(join(built.buildDir,`compositions/${s.id}.html`),'utf8');
    assert.match(html,new RegExp(`data-composition-id="${s.id}"`));
    assert.match(html,/F1\.hw\.draw\(/);
    assert.doesNotMatch(html,/src="\$\{/);
    for(const m of html.matchAll(/<audio\b[^>]*>/g)) assert.match(m[0],/data-start="\d+(?:\.\d+)?"/);
  }
  const hook=await fs.readFile(join(built.buildDir,'compositions/hook.html'),'utf8');
  assert.match(hook,/"photo":"public\/people\/tokoh\.jpg"/);
  await fs.access(join(built.buildDir,'public/people/tokoh.jpg'));
  assert.deepEqual((await buildEpisode(ctx)).changed,[]);
});

test('template validation names bad props, cues, photos and unknown templates',async t=>{
  const {ctx}=await flashFixture(t);
  const bad=(edit,re)=>{const c=structuredClone(ctx);edit(c.config.scenes);assert.throws(()=>validateEpisode(c),re);};
  bad(s=>{s[0].props.headlin='x';},/unknown prop "headlin"/);
  bad(s=>{delete s[0].props.claim;},/claim must be a nonempty string/);
  bad(s=>{s[0].props.person.photo='people/none.jpg';s[0].props.person.credit='x';},/missing photo asset people\/none\.jpg/);
  bad(s=>{s[0].props.person.photo='public/people/tokoh.jpg';},/photo must be an asset path/);
  bad(s=>{s[0].props.person.photo='people/tokoh.jpg';},/credit is required with a photo/);
  bad(s=>{s[1].props.items=[s[1].props.items[0]];},/items must list 2-4 items/);
  bad(s=>{delete s[1].props.items[0].source;},/items\[0\]\.source/);
  bad(s=>{s[1].props.items[0].cue='tidakdiucapkan';},/Unresolved anchor|not found/);
  bad(s=>{s[2].props.right.items=[];},/right\.items must list 1-4/);
  bad(s=>{s[4].props.cover={};},/cover\.title/);
  bad(s=>{s[4].props.lines[0].style='huge';},/style must be/);
  bad(s=>{s[0].props.step=9;},/step must be an integer/);
  bad(s=>{s[0].template='hw-nope';},/unknown template hw-nope/);
  assert.ok(TEMPLATE_NAMES.includes('title-card'));
  assert.equal(cueSpec('resmi'),'word:resmi');assert.equal(cueSpec('line:1:end'),'line:1:end');assert.equal(cueSpec(12),'12');assert.equal(cueSpec(null),null);
});

test('the browser kit draws every template deterministically at 30 and fractional 60 fps frames',async t=>{
  const {ctx,voice}=await flashFixture(t);
  const F1={VOICE:structuredClone(voice),CONFIG:{...runtimeConfig(ctx.config),case:ctx.config.runtime.case}};
  const el={innerHTML:'',content:{childNodes:[]}};
  const sandbox=createContext({F1,console,document:{createElement:()=>el,documentElement:{}},getComputedStyle:()=>({getPropertyValue:()=>'#123456'}),window:{},globalThis:{}});
  sandbox.globalThis=sandbox;
  for(const name of ['timing','core','world','cine']) new Script(readFileSync(join(REPO_ROOT,'src/runtime/f1',`${name}.js`),'utf8')).runInContext(sandbox);
  new Script(readFileSync(join(REPO_ROOT,'src/templates/hotwizz-kit.js'),'utf8')).runInContext(sandbox);
  const hw=sandbox.F1.hw;
  assert.equal(hw.fmt(20980,0),'20.980');assert.equal(hw.fmt(1250.5,1),'1.250,5');
  assert.deepEqual({...hw.parseNum('Rp1.250,5 T')},{pre:'Rp',post:' T',dec:1,value:1250.5});
  const S=sandbox.F1.section('hook'),D=sandbox.F1.sceneFrames('hook');
  const person={name:'Tokoh',role:'Peran',photo:'public/people/tokoh.jpg',credit:'Fixture'};
  const props={
    hook:{seed:1,step:1,label:'UPDATE',kicker:'UPDATE',headline:'A\n*B*',claim:'Klaim',tag:'TAG',person,cue:'word:Ganti',stamp:{text:'X',cue:'line:0'}},
    resmi:{seed:2,step:2,label:'L',title:'YANG RESMI',kicker:'K',items:[{text:'a',source:'s',cue:null},{text:'b *c*',source:'s',cue:'line:0'}]},
    split:{seed:3,step:3,label:'L',kicker:'K',headline:'H',source:'S',left:{title:'RESMI',items:[{text:'a',cue:null}]},right:{title:'BELUM JELAS',items:[{text:'b',cue:null},{text:'c',source:'x',cue:null}]}},
    quote:{seed:4,step:4,label:'L',kicker:'K',person:{...person,photo:null},quote:'Q *q*',source:'S',date:'1 Nov',cue:null},
    number:{seed:5,step:5,label:'L',kicker:'K',value:'Rp1.250,5',unit:'T',caption:'C',source:'S',cue:null,countUp:true},
    cover:{seed:6,step:5,label:'L',footer:'F',lines:[{text:'INGAT',style:'kicker',cue:null},{text:'x',style:'cta',cue:null}],coverAt:null,cover:{stamp:'HOTWIZZ #01',title:'T',chip:'C'}},
  };
  for(const [type,p] of Object.entries(props)) for(const f of [0,7.5,33.25,D-1]) {
    const a=hw.draw(type,f,{S,D},p),b=hw.draw(type,f,{S,D},p);
    assert.equal(a,b,`${type} @${f} is not deterministic`);
    assert.doesNotMatch(a,/NaN|undefined|\[object/,`${type} @${f}`);
  }
  assert.match(hw.draw('hook',0,{S,D},props.hook),/Klaim/); // frame 0 carries the claim
  assert.match(hw.draw('cover',D-1,{S,D},props.cover),/z-index:50/); // cover over the tail
  assert.doesNotMatch(hw.draw('cover',0,{S,D},props.cover),/z-index:50/);
});
