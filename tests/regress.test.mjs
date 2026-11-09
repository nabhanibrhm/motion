import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {REPO_ROOT,loadEpisode} from '../src/config/episodes.mjs';
import {captureEpisode,captureCommand,compareCommand,diffCaptures,parseRegressArgs,stillsCommand,stillsCompareCommand,compareStill,syntheticVoice,stillTimes,main} from '../scripts/regress.mjs';

const scene=offset=>`<template>
  <link rel="stylesheet" href="lib/f1/f1.css" />
  <div id="root" data-composition-id="hook" data-width="1080" data-height="1920"><div id="hook-art" class="f1-layer"></div></div>
  <audio id="hook-sfx" class="clip" src="public/sfx/pop.wav" data-at="word:dua" data-volume="0.2"></audio>
  <script>(()=>{window.__timelines["hook"]=F1.scene("hook",(f,{S,D})=>{
    const w=F1.wordFrame(S,"dua");
    return '<div id="'+F1.uid()+'" style="position:absolute;left:'+(Math.round(f*10)/10+${offset})+'px;top:'+(f>=w?5:0)+'px">'+D+'</div>';
  });})();</script>
</template>
`;

/** A throw-away repo root: the real runtime scripts, one episode and one scene. Never touches the real episodes. */
function fixture(t,{fps=30,offset=0}={}) {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'motion-regress-'));
  t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
  fs.cpSync(path.join(REPO_ROOT,'src/runtime'),path.join(root,'src/runtime'),{recursive:true});
  const dir=path.join(root,'episodes/01_demo');
  fs.mkdirSync(path.join(dir,'scenes'),{recursive:true});
  fs.writeFileSync(path.join(dir,'episode.json'),JSON.stringify({schemaVersion:1,id:'demo',number:1,title:'Demo',category:'Test',narration:'narration.json',script:'script-short.md',video:{width:1080,height:1920,fps},runtime:{profile:'modern',case:{id:'KASUS #01',steps:1}},scenes:[{id:'hook',file:'scenes/hook.html'}],audio:{bed:null,bedGain:.3,loudness:{integrated:-14,truePeak:-1,range:11}}}));
  fs.writeFileSync(path.join(dir,'narration.json'),JSON.stringify({source:'supertonic',speakers:{mog:{supertonic:{voice:'M1',speed:1}}},chapters:[{id:'kasus',title:'Demo'}],defaults:{lead:.15,tail:.1,gapSameSpeaker:.1,gapNewSpeaker:.1,firstLead:.2,chapterLead:.1,chapterEndTail:.1},sections:[{id:'hook',chapter:'kasus',lines:[{speaker:'mog',text:'Satu dua tiga empat lima enam tujuh delapan sembilan sepuluh.'}]}]}));
  fs.writeFileSync(path.join(dir,'scenes/hook.html'),scene(offset));
  return {root,sceneFile:path.join(dir,'scenes/hook.html')};
}
const quiet=()=>{const lines=[];return {log:m=>lines.push(m),lines};};

test('synthetic timing is deterministic and follows the narration defaults', t=>{
  const {root}=fixture(t);
  const ctx=loadEpisode('demo',{repoRoot:root});
  const a=syntheticVoice(ctx.narration),b=syntheticVoice(ctx.narration);
  assert.deepEqual(a,b);
  const [section]=a.sections;
  assert.equal(section.lead,.2);
  assert.equal(section.lines[0].words.length,10);
  assert.equal(section.lines[0].words[0].start,.2);
  assert.equal(section.lines[0].words[1].start,.52); // 0.32 s per word
  assert.equal(section.duration,3.65); // .2 lead + 10 * .32 + tail max(.1, .4 - .15)
});

test('two captures are identical and compare passes', async t=>{
  const {root}=fixture(t);
  const ctx=loadEpisode('demo',{repoRoot:root});
  const one=await captureEpisode(ctx,{timing:'synthetic'}),two=await captureEpisode(ctx,{timing:'synthetic'});
  assert.deepEqual(one,two);
  assert.equal(one.scenes.length,1);
  assert.ok(one.scenes[0].samples.length>=6);
  assert.deepEqual(diffCaptures(one,two),{failures:[],notes:[]});
  const out=quiet();
  await captureCommand({label:'t',positionals:['demo'],timing:'synthetic'},{repoRoot:root,log:out.log});
  await assert.rejects(()=>captureCommand({label:'t',positionals:['demo'],timing:'synthetic'},{repoRoot:root,log:out.log}),/already exists/);
  const result=await compareCommand({label:'t',positionals:['demo'],timing:'synthetic'},{repoRoot:root,log:out.log});
  assert.equal(result.failed,0);
  assert.ok(out.lines.some(l=>l.startsWith('PASS demo')));
});

test('a one-pixel change in a temp copy of a scene fails compare and names scene and frame', async t=>{
  const {root,sceneFile}=fixture(t);
  const out=quiet();
  await captureCommand({label:'base',positionals:['demo'],timing:'synthetic'},{repoRoot:root,log:out.log});
  fs.writeFileSync(sceneFile,scene(1)); // left: +1px everywhere
  const result=await compareCommand({label:'base',positionals:['demo'],timing:'synthetic',dump:true},{repoRoot:root,log:out.log});
  assert.equal(result.failed,1);
  assert.ok(out.lines.some(l=>l.startsWith('FAIL demo')));
  assert.ok(out.lines.some(l=>/hook: frame 0$/.test(l.trim())));
  assert.ok(out.lines.some(l=>/note: hook: sourceHash changed/.test(l)));
  assert.ok(fs.existsSync(path.join(root,'.cache/regress/base/demo/dump-synthetic/hook_0.txt')));
  assert.match(fs.readFileSync(path.join(root,'.cache/regress/base/demo/dump-synthetic/hook_0.txt'),'utf8'),/left:1px/);
  // exit code through main()
  const code=await main(['compare','demo','--label','base','--timing','synthetic'],{repoRoot:root,log:()=>{}});
  assert.equal(code,1);
});

test('a source-only change (same output) passes with a note', async t=>{
  const {root,sceneFile}=fixture(t);
  const out=quiet();
  await captureCommand({label:'base',positionals:['demo'],timing:'synthetic'},{repoRoot:root,log:out.log});
  fs.writeFileSync(sceneFile,scene(0)+'<!-- comment -->\n');
  const result=await compareCommand({label:'base',positionals:['demo'],timing:'synthetic'},{repoRoot:root,log:out.log});
  assert.equal(result.failed,0);
  assert.ok(out.lines.some(l=>/note: hook: sourceHash changed/.test(l)));
});

test('60 fps episodes also sample half frames', async t=>{
  const {root}=fixture(t,{fps:60});
  const capture=await captureEpisode(loadEpisode('demo',{repoRoot:root}),{timing:'synthetic'});
  const frames=capture.scenes[0].samples.map(([f])=>f);
  assert.ok(frames.includes(0.5));
  assert.ok(frames.includes(Math.round(capture.scenes[0].frames/2)+.5));
  const thirty=await captureEpisode(loadEpisode('demo',{repoRoot:fixture(t).root}),{timing:'synthetic'});
  assert.ok(thirty.scenes[0].samples.every(([f])=>Number.isInteger(f)));
});

test('voice timing without a valid cache fails clearly; stills argument handling', async t=>{
  const {root}=fixture(t);
  await assert.rejects(()=>captureEpisode(loadEpisode('demo',{repoRoot:root}),{timing:'voice'}),/no voice cache.*--timing synthetic/s);
  assert.throws(()=>parseRegressArgs(['capture','demo']),/requires --label/);
  assert.throws(()=>parseRegressArgs(['capture','demo','--label','x','--bogus']),/Unknown option/);
  assert.throws(()=>parseRegressArgs(['capture','demo','--all','--label','x']),/Choose an episode or --all/);
  assert.throws(()=>parseRegressArgs(['stills-compare','demo','--base','a']),/requires --after/);
  assert.throws(()=>parseRegressArgs(['nope']),/Unknown command/);
  assert.deepEqual(parseRegressArgs(['compare','demo','--label=x','--timing','voice','--dump']).opts,{positionals:['demo'],label:'x',timing:'voice',dump:true});
  await assert.rejects(()=>captureCommand({label:'../escape',positionals:['demo']},{repoRoot:root,log:()=>{}}),/Invalid --label/);
  await assert.rejects(()=>captureCommand({label:'x',positionals:['demo'],timing:'bogus'},{repoRoot:root,log:()=>{}}),/--timing must be/);
  await assert.rejects(()=>stillsCommand({label:'x',positionals:[]},{repoRoot:root,log:()=>{}}),/exactly one episode/);
  await assert.rejects(()=>stillsCommand({label:'x',positionals:['demo'],'times-from':'missing'},{repoRoot:root,log:()=>{}}),/does not exist/);
  await assert.rejects(()=>stillsCommand({label:'x',positionals:['demo']},{repoRoot:root,log:()=>{}}),/no voice cache/);
});

test('still times: sections at 30% and 70%, 0.1 s, near the end, and 1/60 s offsets at 60 fps', ()=>{
  const timing={fps:30,total:300,list:[{kind:'section',from:0,duration:150},{kind:'chapter',from:150,duration:45},{kind:'section',from:195,duration:105}]};
  const t30=stillTimes(timing,{fps:30});
  assert.deepEqual(t30,[.1,1.5,3.5,7.55,8.8,8.95,9.8]);
  const t60=stillTimes(timing,{fps:60});
  assert.equal(t60.length,t30.length+2);
  assert.ok(t60.some(v=>Math.abs(v-(1.5+1/60))<1e-3));
});

const ffmpegOk=spawnSync(process.env.FFMPEG||'ffmpeg',['-version']).status===0;
test('stills-compare: framemd5 equality, then SSIM threshold', {skip:!ffmpegOk&&'ffmpeg not available'}, async t=>{
  const {root}=fixture(t);
  const make=(label,filter)=>{
    const dir=path.join(root,'.cache/regress',label,'demo/stills');
    fs.mkdirSync(dir,{recursive:true});
    const r=spawnSync(process.env.FFMPEG||'ffmpeg',['-v','error','-y','-f','lavfi','-i','testsrc=s=128x128:d=1','-frames:v','1',...(filter?['-vf',filter]:[]),path.join(dir,'00-1.png')]);
    assert.equal(r.status,0,String(r.stderr));
    return path.join(dir,'00-1.png');
  };
  const a=make('a'),same=make('same'),shifted=make('shifted','drawbox=x=0:y=0:w=64:h=64:color=black:t=fill');
  assert.equal(compareStill(a,same).identical,true);
  const out=quiet();
  assert.equal((await stillsCompareCommand({positionals:['demo'],base:'a',after:'same'},{repoRoot:root,log:out.log})).failed,0);
  const bad=await stillsCompareCommand({positionals:['demo'],base:'a',after:'shifted'},{repoRoot:root,log:out.log});
  assert.equal(bad.failed,1);
  assert.ok(bad.results[0].ssim<.9995);
  const loose=await stillsCompareCommand({positionals:['demo'],base:'a',after:'shifted',ssim:'0.1'},{repoRoot:root,log:out.log});
  assert.equal(loose.failed,0);
  assert.ok(shifted);
});
