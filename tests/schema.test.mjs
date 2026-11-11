import test from 'node:test';
import assert from 'node:assert/strict';
import {promises as fs,readdirSync,readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {REPO_ROOT,listEpisodes,loadEpisode,resetEpisodeCache,episodeScanCount} from '../src/config/episodes.mjs';
import {validateEpisode,validateEpisodes,checkSchema,didYouMean,placeholderWarnings,SCHEMA,PALETTE_KEYS} from '../src/config/validate.mjs';
import {createEpisode} from '../scripts/motion.mjs';

async function fixture(t) {
  await fs.mkdir(join(REPO_ROOT,'.cache'),{recursive:true});
  const root=await fs.mkdtemp(join(REPO_ROOT,'.cache/schema-test-'));
  t.after(async()=>{assert.ok(resolve(root).startsWith(resolve(REPO_ROOT,'.cache')));await fs.rm(root,{recursive:true,force:true});});
  for(const name of ['src/runtime','src/templates','config']) await fs.cp(join(REPO_ROOT,name),join(root,name),{recursive:true});
  for(const name of ['tools/voice','assets/shared/fonts']) await fs.mkdir(join(root,name),{recursive:true});
  const ctx=createEpisode('example',{title:'Example',number:8,category:'Sains',repoRoot:root});
  return {root,ctx};
}
const errorsOf=(ctx,patch)=>{const c=structuredClone(ctx);patch(c);try {validateEpisode(c);return '';} catch(e) {return e.message;}};

test('typo keys are rejected with did-you-mean hints',async t=>{
  const {ctx}=await fixture(t);
  assert.equal(validateEpisode(ctx).valid,true);
  assert.match(errorsOf(ctx,c=>{c.config.audio.bedgain=.5;}),/audio\.bedgain is not supported \(did you mean "bedGain"\?\)/);
  assert.match(errorsOf(ctx,c=>{c.config.scenes[0].temlate='title-card';}),/scenes\[0\]\.temlate is not supported \(did you mean "template"\?\)/);
  assert.match(errorsOf(ctx,c=>{c.config.scenes[0].bgg='#ffffff';}),/scenes\[0\]\.bgg is not supported \(did you mean "bg"\?\)/);
  assert.match(errorsOf(ctx,c=>{c.config.titel='x';}),/episode\.json\.titel is not supported \(did you mean "title"\?\)/);
  assert.match(errorsOf(ctx,c=>{c.config.runtime.palete={};}),/runtime\.palete is not supported \(did you mean "palette"\?\)/);
  assert.match(errorsOf(ctx,c=>{c.config.runtime.case.nme='x';}),/runtime\.case\.nme is not supported \(did you mean "name"\?\)/);
  assert.match(errorsOf(ctx,c=>{c.config.video.fsp=30;}),/video\.fsp is not supported \(did you mean "fps"\?\)/);
  assert.match(errorsOf(ctx,c=>{c.narration.sectons=[];}),/narration\.sectons is not supported \(did you mean "sections"\?\)/);
  assert.match(errorsOf(ctx,c=>{c.narration.sections[0].lines[0].aftr=.3;}),/lines\[0\]\.aftr is not supported \(did you mean "after"\?\)/);
  assert.match(errorsOf(ctx,c=>{c.narration.speakers.mog.supertonic.spead=1;}),/supertonic\.spead is not supported \(did you mean "speed"\?\)/);
  assert.match(errorsOf(ctx,c=>{c.narration.defaults.gapSameSpeker=.1;}),/defaults\.gapSameSpeker is not supported \(did you mean "gapSameSpeaker"\?\)/);
  assert.match(errorsOf(ctx,c=>{c.config.nothingLikeIt=1;}),/nothingLikeIt is not supported \(allowed: schemaVersion/);
  assert.equal(didYouMean('volume',SCHEMA.sfx),'vol');assert.equal(didYouMean('zzzzzz',SCHEMA.sfx),null);
});

test('legacy keys still validate',async t=>{
  const {ctx}=await fixture(t);
  const ok=structuredClone(ctx);
  ok.config.theme='hotwizz';
  ok.config.voice={speakers:{wec:{supertonic:{voice:'F2',speed:1,range:1.4}}}};
  ok.narration.comment='legacy comment';
  ok.narration.say={UMP:'u em pe'};
  ok.narration.speakers.mog={...ok.narration.speakers.mog,voice:'id-ID-ArdiNeural',rate:'+5%',pitch:'+2Hz',cartesia:{voice:'abc',speed:.95}};
  ok.narration.sections[0].lines[0].after=.4;
  const checked=errorsOf(ok,()=>{});
  assert.doesNotMatch(checked,/not supported/);
  assert.deepEqual(checkSchema(ok.config,ok.narration),[]);
  // cartesia-source narration options
  const c2=structuredClone(ok);c2.narration.source='cartesia';c2.narration.cartesia={model:'sonic-3.6',language:'id-ID',speed:1,sampleRate:44100,dictionary:null,say:{x:'y'}};
  assert.deepEqual(checkSchema(c2.config,c2.narration),[]);
});

test('every committed episode and theme manifest passes the strict schema',()=>{
  for(const id of listEpisodes()) {
    const ctx=loadEpisode(id);
    assert.deepEqual(checkSchema(ctx.config,ctx.narration),[],id);
  }
  for(const name of readdirSync(join(REPO_ROOT,'config/themes'))) {
    const theme=JSON.parse(readFileSync(join(REPO_ROOT,'config/themes',name),'utf8'));
    for(const key of Object.keys(theme)) assert.ok(['runtime','voice','audio','video'].includes(key),`${name}: ${key}`);
    if(theme.runtime?.palette) {
      assert.deepEqual(Object.keys(theme.runtime.palette).sort(),[...PALETTE_KEYS].sort(),name);
      assert.ok(Object.values(theme.runtime.palette).every(v=>/^#[0-9a-f]{6}$/.test(v)),name);
    }
  }
  assert.equal(listEpisodes().length>=14,true);
});

test('runtime.case.name, runtime.palette and runtime.watermark.height are validated',async t=>{
  const {ctx}=await fixture(t);
  await fs.mkdir(join(ctx.paths.sharedAssetsDir,'brand'),{recursive:true});
  await fs.writeFile(join(ctx.paths.sharedAssetsDir,'brand/mark.svg'),'<svg xmlns="http://www.w3.org/2000/svg"/>');
  const ok=structuredClone(ctx);
  ok.config.runtime.case.name='Cuti Bersama';
  ok.config.runtime.palette={bg:'#dfe8ee',red:'#D0413A'};
  ok.config.runtime.watermark={src:'brand/mark.svg',opacity:.2,width:820,height:200};
  assert.equal(validateEpisode(ok).valid,true);
  assert.match(errorsOf(ok,c=>{c.config.runtime.case.name='  ';}),/runtime\.case\.name/);
  assert.match(errorsOf(ok,c=>{c.config.runtime.palette.bg='red';}),/runtime\.palette\.bg must be a #rrggbb/);
  assert.match(errorsOf(ok,c=>{c.config.runtime.palette.bg='#fff';}),/runtime\.palette\.bg must be a #rrggbb/);
  assert.match(errorsOf(ok,c=>{c.config.runtime.palette.tealdark='#ffffff';}),/palette\.tealdark is not supported \(did you mean "tealDark"\?\)/);
  assert.match(errorsOf(ok,c=>{c.config.runtime.watermark.height=5;}),/watermark\.height/);
  assert.match(errorsOf(ok,c=>{c.config.runtime.watermark.hieght=50;}),/watermark\.hieght is not supported \(did you mean "height"\?\)/);
  assert.deepEqual(PALETTE_KEYS,['bg','paper','ink','muted','source','red','accent','teal','tealDark','drift','haze']);
});

test('canonical Supertonic voices come from config/speakers.json',async t=>{
  const {root,ctx}=await fixture(t);
  assert.match(errorsOf(ctx,c=>{c.narration.speakers.mog.supertonic.voice='M3';}),/Speaker mog must retain voice M1/);
  const file=join(root,'config/speakers.json'),speakers=JSON.parse(await fs.readFile(file,'utf8'));
  speakers.mog.supertonic.voice='M3';await fs.writeFile(file,JSON.stringify(speakers));
  const changed=loadEpisode('example',{repoRoot:root});
  assert.match(errorsOf(changed,c=>{c.narration.speakers.mog.supertonic.voice='M1';}),/Speaker mog must retain voice M3/);
  assert.equal(errorsOf(changed,c=>{c.narration.speakers.mog.supertonic.voice='M3';}),'');
});

test('palette themes load, merge under the episode and are used by no existing episode',async t=>{
  const used=new Set(listEpisodes().map(id=>loadEpisode(id).config.theme).filter(Boolean));
  for(const name of ['warm-desk','transit']) assert.ok(!used.has(name),`${name} is referenced by an episode`);
  const {root,ctx}=await fixture(t);
  const path=join(ctx.episodeDir,'episode.json'),cfg=JSON.parse(await fs.readFile(path,'utf8'));
  cfg.theme='transit';cfg.runtime.palette={red:'#112233'};await fs.writeFile(path,JSON.stringify(cfg));
  const next=loadEpisode('example',{repoRoot:root});
  assert.equal(next.config.runtime.palette.bg,'#dfe8ee');assert.equal(next.config.runtime.palette.red,'#112233');
  assert.equal(next.config.runtime.profile,'modern');
  assert.equal(validateEpisode(next).valid,true);
  const warm=JSON.parse(readFileSync(join(REPO_ROOT,'config/themes/warm-desk.json'),'utf8')).runtime.palette;
  assert.equal(warm.bg,'#f6efe1');assert.equal(warm.accent,'#c6f432');
});

test('validateEpisodes rejects duplicate numbers and ids across episodes',async t=>{
  const {root,ctx}=await fixture(t);
  const other=createEpisode('second',{title:'Second',number:9,repoRoot:root});
  assert.equal(validateEpisodes([ctx,other]).valid,true);
  // a second folder with the same number but another id loads fine on its own
  const clash=join(root,'episodes/08_clash');
  await fs.cp(ctx.episodeDir,clash,{recursive:true});
  const path=join(clash,'episode.json'),cfg=JSON.parse(await fs.readFile(path,'utf8'));
  cfg.id='clash';await fs.writeFile(path,JSON.stringify(cfg));
  const third=loadEpisode('clash',{repoRoot:root});
  assert.throws(()=>validateEpisodes([ctx,other,third]),/Duplicate episode number 8: example and clash/);
  assert.throws(()=>validateEpisodes([ctx,ctx],{each:false}),/Duplicate episode id: example/);
  assert.throws(()=>validateEpisodes([ctx,{...other,config:{...other.config,number:8}}],{each:false}),/Duplicate episode number 8/);
});

test('episode folder scan is memoised per root and resetEpisodeCache sees new folders',async t=>{
  const {root}=await fixture(t);
  resetEpisodeCache();
  assert.deepEqual(listEpisodes({repoRoot:root}),['example']);
  const scans=episodeScanCount();
  listEpisodes({repoRoot:root});loadEpisode('example',{repoRoot:root});loadEpisode('example',{repoRoot:root});
  assert.equal(episodeScanCount(),scans,'repeated lookups reuse the scan');
  // a folder added behind the cache's back (a manifest copied in, not through createEpisode)
  const dir=join(root,'episodes/20_later');
  await fs.cp(join(root,'episodes/08_example'),dir,{recursive:true});
  const path=join(dir,'episode.json'),cfg=JSON.parse(await fs.readFile(path,'utf8'));
  cfg.id='later';cfg.number=20;await fs.writeFile(path,JSON.stringify(cfg));
  resetEpisodeCache();
  assert.deepEqual(listEpisodes({repoRoot:root}),['example','later']);
  assert.ok(episodeScanCount()>scans,'reset forces a fresh scan');
  assert.equal(loadEpisode('later',{repoRoot:root}).config.number,20);
  resetEpisodeCache();
});

test('typos in shared config layers are reported against their own file; ttsmaker is a speaker key',async t=>{
  const {root,ctx}=await fixture(t);
  const edit=async(file,fn)=>{const p=join(root,file),d=JSON.parse(await fs.readFile(p,'utf8'));fn(d);await fs.writeFile(p,JSON.stringify(d));};
  const reload=()=>loadEpisode('example',{repoRoot:root});
  await edit('config/speakers.json',d=>{d.mog.supertonic.spead=1;d.wec.ttsmaker='voice-id';});
  let msg=errorsOf(reload(),()=>{});
  assert.match(msg,/config\/speakers\.json\.mog\.supertonic\.spead is not supported \(did you mean "speed"\?\)/);
  assert.doesNotMatch(msg,/episode\.json\.|ttsmaker/);
  assert.doesNotMatch(msg,/voice\.speakers/); // not duplicated through the merged config
  await edit('config/speakers.json',d=>{delete d.mog.supertonic.spead;});
  await edit('config/defaults.json',d=>{d.audio.bedgain=.5;});
  msg=errorsOf(reload(),()=>{});
  assert.match(msg,/config\/defaults\.json: audio\.bedgain is not supported \(did you mean "bedGain"\?\)/);
  assert.equal((msg.match(/bedgain/g)||[]).length,1);
  await edit('config/defaults.json',d=>{delete d.audio.bedgain;});
  const manifest=join(ctx.episodeDir,'episode.json'),cfg=JSON.parse(await fs.readFile(manifest,'utf8'));
  cfg.theme='transit';await fs.writeFile(manifest,JSON.stringify(cfg));
  await edit('config/themes/transit.json',d=>{d.runtime.palete={};d.titel='x';});
  msg=errorsOf(reload(),()=>{});
  assert.match(msg,/config\/themes\/transit\.json: runtime\.palete is not supported \(did you mean "palette"\?\)/);
  assert.match(msg,/config\/themes\/transit\.json\.titel is not supported \(did you mean "title"\?\)/);
  assert.doesNotMatch(msg,/episode\.json\.titel/);
  assert.match(errorsOf(ctx,c=>{c.narration.speakers.mog.ttsmaker=5;}),/ttsmaker must be a string/);
  assert.doesNotMatch(errorsOf(ctx,c=>{c.narration.speakers.mog.ttsmaker='x';}),/ttsmaker/);
});

test('validateEpisodes still checks duplicate ids and numbers for episodes that fail their own validation',async t=>{
  const {root,ctx}=await fixture(t);
  const other=createEpisode('second',{title:'Second',number:9,repoRoot:root});
  const broken={...other,config:{...other.config,number:8,title:''}};
  assert.throws(()=>validateEpisodes([ctx,broken]),e=>/Duplicate episode number 8: example and second/.test(e.message)&&/title is required/.test(e.message));
});

test('the kasus scaffold warns about placeholder text but stays valid',async t=>{
  const {root}=await fixture(t);
  await fs.cp(join(REPO_ROOT,'assets/shared/sfx'),join(root,'assets/shared/sfx'),{recursive:true});
  const ctx=createEpisode('kasus-baru',{title:'Baru',format:'kasus',repoRoot:root});
  assert.equal(validateEpisode(ctx).valid,true);
  const warnings=placeholderWarnings(ctx);
  assert.equal(warnings.length,1);
  assert.match(warnings[0],/GANTI.*episode\.json.*narration\.json.*scenes\/hook\.js/);
  const clean=createEpisode('bersih',{title:'Bersih',repoRoot:root,number:30});
  assert.equal(placeholderWarnings({...clean,narration:{...clean.narration,sections:[]},config:{...clean.config,runtime:{...clean.config.runtime,case:{...clean.config.runtime.case,name:'X'}}}}).filter(w=>/episode\.json/.test(w)).length,0);
});

test('kasus scenes keep content inside the safe area (right edge <= 960) and the hook shows the claim at frame 0',()=>{
  const dir=join(REPO_ROOT,'config/formats/kasus/files/scenes');
  for(const name of ['hook.js','sisi.js','fakta.js','vonis.js']) {
    const src=readFileSync(join(dir,name),'utf8');
    for(const m of src.matchAll(/\bx:\s*(\d+),[^\n]*?\bw:\s*(\d+)/g)) assert.ok(Number(m[1])+Number(m[2])<=960,`${name}: x ${m[1]} + w ${m[2]}`);
    for(const m of src.matchAll(/\by:\s*(\d+)/g)) assert.ok(Number(m[1])<=1200,`${name}: y ${m[1]}`);
  }
  assert.match(readFileSync(join(dir,'hook.js'),'utf8'),/K\.title\(f, \{ at: -20/);
});
