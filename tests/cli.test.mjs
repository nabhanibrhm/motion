import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {REPO_ROOT,resetEpisodeCache} from '../src/config/episodes.mjs';
import {validateEpisode} from '../src/config/validate.mjs';
import {withEpisodeLock,pidAlive} from '../src/pipeline/lock.mjs';
import {createEpisode,listFormats,loadFormat,main,parseArgs,runNode,Interrupted} from '../scripts/motion.mjs';

const GOLDEN=path.join(REPO_ROOT,'tests/fixtures/scaffold');
const readTree=(dir,base=dir)=>Object.fromEntries(fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(e=>{
  const p=path.join(dir,e.name);
  return e.isDirectory()?Object.entries(readTree(p,base)):[[path.relative(base,p).split(path.sep).join('/'),fs.readFileSync(p)]];
}));

/** A throw-away repo root with the real config (themes, formats), runtime, templates and the shared SFX. Never touches the real episodes. */
function fixture(t,{sfx=true}={}) {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'motion-cli-'));
  t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
  for(const name of ['config','src/runtime','src/templates']) fs.cpSync(path.join(REPO_ROOT,name),path.join(root,name),{recursive:true});
  fs.mkdirSync(path.join(root,'episodes'),{recursive:true});
  if(sfx) fs.cpSync(path.join(REPO_ROOT,'assets/shared/sfx'),path.join(root,'assets/shared/sfx'),{recursive:true});
  return root;
}
const capture=()=>{const lines=[],errors=[];return {log:m=>lines.push(m),error:m=>errors.push(m),lines,errors,text:()=>lines.join('\n'),errorText:()=>errors.join('\n')};};

test('default and hotwizz-flash scaffolds are byte-identical to the goldens, under every spelling',t=>{
  const root=fixture(t);
  const a=createEpisode('gold-default',{title:'Judul Emas',number:7,repoRoot:root});
  const b=createEpisode('gold-flash',{title:'Judul Kilat',number:8,flash:true,repoRoot:root});
  assert.deepEqual(readTree(a.episodeDir),readTree(path.join(GOLDEN,'default')));
  assert.deepEqual(readTree(b.episodeDir),readTree(path.join(GOLDEN,'flash')));
  const root2=fixture(t);
  const c=createEpisode('gold-default',{title:'Judul Emas',number:7,format:'default',repoRoot:root2});
  const d=createEpisode('gold-flash',{title:'Judul Kilat',number:8,format:'hotwizz-flash',repoRoot:root2});
  assert.deepEqual(readTree(c.episodeDir),readTree(path.join(GOLDEN,'default')));
  assert.deepEqual(readTree(d.episodeDir),readTree(path.join(GOLDEN,'flash')));
});

test('formats: listing, unknown names, placeholders and the flash conflict',t=>{
  const root=fixture(t);
  assert.deepEqual(listFormats({repoRoot:root}),['default','hotwizz-flash','kasus']);
  assert.equal(loadFormat('kasus',{repoRoot:root}).format.theme,'transit');
  assert.throws(()=>createEpisode('x',{title:'X',format:'nope',repoRoot:root}),/Unknown format: nope; available: default, hotwizz-flash, kasus/);
  assert.throws(()=>createEpisode('x',{title:'X',format:'../default',repoRoot:root}),/Invalid format name/);
  assert.throws(()=>createEpisode('x',{title:'X',flash:true,format:'kasus',repoRoot:root}),/same as --format hotwizz-flash/);
  assert.throws(()=>parseArgs(['new','x','--title','X','--flash','--format','kasus']),/hotwizz-flash/);
  assert.equal(parseArgs(['new','x','--title','X','--format','kasus']).options.format,'kasus');
  assert.equal(parseArgs(['new','x','--title','X','--flash','--format','hotwizz-flash']).options.flash,true);
  // an unknown {{placeholder}} in a format is an error, not literal text
  fs.mkdirSync(path.join(root,'config/formats/bad'),{recursive:true});
  const def=JSON.parse(fs.readFileSync(path.join(root,'config/formats/default/format.json'),'utf8'));
  def.episode.title='{{titel}}';
  fs.writeFileSync(path.join(root,'config/formats/bad/format.json'),JSON.stringify(def));
  assert.throws(()=>createEpisode('x',{title:'X',format:'bad',repoRoot:root}),/\{\{titel\}\}/);
  assert.equal(fs.existsSync(path.join(root,'episodes')),true);
  assert.deepEqual(fs.readdirSync(path.join(root,'episodes')),[]); // nothing half-written
});

test('the kasus format scaffolds a valid wrapped-scene episode with the next KASUS number',t=>{
  const root=fixture(t);
  createEpisode('tua',{title:'Tua',number:20,repoRoot:root}); // default format: KASUS #20
  const ctx=createEpisode('baru',{title:'Baru',format:'kasus',repoRoot:root});
  assert.equal(ctx.config.number,21);
  assert.equal(ctx.config.runtime.case.id,'KASUS #21');
  assert.equal(ctx.config.runtime.case.name,'GANTI NAMA KASUS');
  assert.equal(ctx.config.runtime.case.steps,4);
  assert.equal(ctx.config.theme,'transit');
  assert.equal(ctx.config.runtime.palette.bg,'#dfe8ee');
  assert.deepEqual(ctx.config.scenes.map(s=>s.file),['scenes/hook.js','scenes/fakta.js','scenes/sisi.js','scenes/vonis.js']);
  assert.ok(ctx.config.scenes.every(s=>/^#[0-9a-f]{6}$/i.test(s.bg)&&s.sfx.length>0));
  assert.equal(ctx.narration.source,'cartesia');
  assert.deepEqual(Object.keys(ctx.narration.speakers),['mog','wec','bog']);
  assert.deepEqual(ctx.narration.sections.map(s=>s.id),ctx.config.scenes.map(s=>s.id));
  assert.equal(validateEpisode(ctx).valid,true);
  const vonis=fs.readFileSync(path.join(ctx.episodeDir,'scenes/vonis.js'),'utf8');
  assert.match(vonis,/C\.verdict\(/);assert.match(vonis,/C\.cover\(/);
  assert.match(fs.readFileSync(path.join(ctx.episodeDir,'scenes/hook.js'),'utf8'),/at: -12/); // frame 0 shows the claim card
  assert.match(fs.readFileSync(path.join(ctx.episodeDir,'script-short.md'),'utf8'),/^# Baru \(KASUS #21\)/);
  assert.ok(!/\{\{/.test(Object.values(readTree(ctx.episodeDir)).join('')));
  // the next kasus counts on from the last, and a manual --number does not change the case counter
  const again=createEpisode('lagi',{title:'Lagi',format:'kasus',number:99,repoRoot:root});
  assert.equal(again.config.runtime.case.id,'KASUS #22');
});

test('a lock whose owner process died on this host is broken with a notice; live, foreign and unreadable locks stay',async t=>{
  const root=fixture(t);
  const ctx={id:'demo',repoRoot:root};
  const lock=path.join(root,'.cache/locks/demo');
  const dead=spawnSync(process.execPath,['-e','']).pid; // exited, so its pid is free
  assert.equal(pidAlive(dead),false);assert.equal(pidAlive(process.pid),true);
  const owner=o=>{fs.mkdirSync(lock,{recursive:true});if(o!==null) fs.writeFileSync(path.join(lock,'owner.json'),typeof o==='string'?o:JSON.stringify(o));};
  const notices=[];
  owner({pid:dead,host:os.hostname(),id:'demo'});
  assert.equal(await withEpisodeLock(ctx,async()=>{
    const mine=JSON.parse(fs.readFileSync(path.join(lock,'owner.json'),'utf8'));
    assert.equal(mine.pid,process.pid);assert.equal(mine.host,os.hostname());
    return 'ran';
  },{log:m=>notices.push(m)}),'ran');
  assert.equal(notices.length,1);assert.match(notices[0],new RegExp(`stale lock for demo.*process ${dead}`));
  assert.equal(fs.existsSync(lock),false); // released afterwards
  assert.deepEqual(fs.readdirSync(path.join(root,'.cache/locks')),[]); // the broken lock left no leftovers
  for(const [what,o] of [['live pid',{pid:process.pid,host:os.hostname()}],['other host',{pid:dead,host:'some-other-host'}],['no owner.json',null],['garbage owner.json','{nope']]) {
    owner(o);
    await assert.rejects(withEpisodeLock(ctx,()=>assert.fail('must not run'),{log:m=>notices.push(m)}),/busy/,what);
    assert.equal(fs.existsSync(lock),true,what);
    fs.rmSync(lock,{recursive:true,force:true});
  }
  assert.equal(notices.length,1);
});

// Windows has no POSIX signals: process.kill(pid,"SIGINT") just terminates with exit code 1, no signal reported.
test('SIGINT/SIGTERM during a child process is an Interrupted error that still releases the lock',{skip:process.platform==='win32'&&'POSIX signals only'},async t=>{
  const root=fixture(t);
  const ctx={id:'demo',repoRoot:root};
  assert.throws(()=>runNode(['-e','process.kill(process.pid,"SIGINT")']),Interrupted);
  assert.throws(()=>runNode(['-e','process.kill(process.pid,"SIGTERM")']),e=>e instanceof Interrupted&&e.signal==='SIGTERM');
  assert.throws(()=>runNode(['-e','process.exit(3)']),/Command failed/);
  await assert.rejects(withEpisodeLock(ctx,async()=>{runNode(['-e','process.kill(process.pid,"SIGINT")']);}),Interrupted);
  assert.equal(fs.existsSync(path.join(root,'.cache/locks/demo')),false);
});

test('--all continues past a failing episode, prints a table and exits 1',async t=>{
  const root=fixture(t);
  createEpisode('aa',{title:'A',repoRoot:root});
  createEpisode('bb',{title:'B',repoRoot:root});
  createEpisode('cc',{title:'C',repoRoot:root});
  fs.writeFileSync(path.join(root,'episodes/02_bb/episode.json'),'{ not json');
  resetEpisodeCache();
  const out=capture();
  const code=await main(['validate','--all'],{repoRoot:root,out});
  assert.equal(code,1);
  assert.match(out.text(),/aa: valid/);assert.match(out.text(),/cc: valid/); // both neighbours were still processed
  assert.match(out.errorText(),/bb: FAILED/);
  const table=out.lines.slice(out.lines.findIndex(l=>/^episode\s+status/.test(l))+1);
  assert.match(table[0],/^aa\s+OK\s+valid \(1 scenes\)/);
  assert.match(table[1],/^bb\s+FAIL\s+/);
  assert.match(table[2],/^cc\s+OK\s+/);
  assert.equal(table.at(-1),'3 episodes: 2 ok, 1 failed');
  // all healthy: exit 0
  fs.writeFileSync(path.join(root,'episodes/02_bb/episode.json'),fs.readFileSync(path.join(root,'episodes/01_aa/episode.json'),'utf8').replace('"aa"','"bb"').replace('"number": 1','"number": 2'));
  resetEpisodeCache();
  const ok=capture();
  assert.equal(await main(['validate','--all'],{repoRoot:root,out:ok}),0);
  assert.match(ok.lines.at(-1),/3 episodes: 3 ok, 0 failed/);
  // a single episode keeps throwing instead of printing a table
  fs.writeFileSync(path.join(root,'episodes/02_bb/episode.json'),'{ not json');
  resetEpisodeCache();
  await assert.rejects(main(['validate','bb'],{repoRoot:root,out:capture()}),/JSON/);
});

test('validate --all also checks that episode ids and numbers are unique',async t=>{
  const root=fixture(t);
  createEpisode('aa',{title:'A',number:5,repoRoot:root});
  fs.cpSync(path.join(root,'episodes/05_aa'),path.join(root,'episodes/05_bb'),{recursive:true});
  fs.writeFileSync(path.join(root,'episodes/05_bb/episode.json'),fs.readFileSync(path.join(root,'episodes/05_bb/episode.json'),'utf8').replace('"aa"','"bb"'));
  resetEpisodeCache();
  const out=capture();
  assert.equal(await main(['validate','--all'],{repoRoot:root,out}),1);
  assert.match(out.errorText(),/Duplicate episode number 5: aa and bb/);
  assert.match(out.text(),/\(all episodes\)\s+FAIL\s+Duplicate episode number 5/);
});

test('a signal between episodes stops the batch with exit 130 and removes its handlers',async t=>{
  const root=fixture(t);
  for(const id of ['aa','bb','cc']) createEpisode(id,{title:id,repoRoot:root});
  const before=[process.listenerCount('SIGINT'),process.listenerCount('SIGTERM')];
  let sent=false;
  const out=capture();
  const log=out.log;
  out.log=m=>{log(m);if(!sent&&/^aa: valid/.test(m)){sent=true;process.emit('SIGINT','SIGINT');}};
  assert.equal(await main(['validate','--all'],{repoRoot:root,out}),130);
  assert.doesNotMatch(out.text(),/bb: valid/);
  assert.match(out.errorText(),/SIGINT received/);
  assert.match(out.errorText(),/2 episode\(s\) not run/);
  assert.deepEqual([process.listenerCount('SIGINT'),process.listenerCount('SIGTERM')],before);
});

test('clean prints the stale voice temp report, accepts build|stills|all and deletes nothing in a dry run',async t=>{
  const root=fixture(t);
  createEpisode('aa',{title:'A',repoRoot:root});
  const voice=path.join(root,'.cache/voice');
  fs.mkdirSync(path.join(voice,'aa'),{recursive:true});fs.writeFileSync(path.join(voice,'aa/manifest.json'),'{}');
  fs.mkdirSync(path.join(voice,'aa-tmp-xyz'),{recursive:true});
  fs.mkdirSync(path.join(root,'.cache/build/aa'),{recursive:true});fs.writeFileSync(path.join(root,'.cache/build/aa/index.html'),'x');
  const out=capture();
  assert.equal(await main(['clean','aa'],{repoRoot:root,out}),0);
  assert.match(out.text(),/^aa: dry run/m);
  assert.match(out.text(),/stale voice temp \(not removed\): .*aa-tmp-xyz/);
  assert.match(out.text(),/Retained voice: /);
  assert.ok(fs.existsSync(path.join(root,'.cache/build/aa/index.html'))&&fs.existsSync(path.join(voice,'aa-tmp-xyz')));
  assert.equal(await main(['clean','aa','--target','build','--execute'],{repoRoot:root,out:capture()}),0);
  assert.equal(fs.existsSync(path.join(root,'.cache/build/aa')),false);
  assert.ok(fs.existsSync(path.join(voice,'aa-tmp-xyz'))&&fs.existsSync(path.join(voice,'aa/manifest.json'))); // voice and its leftovers stay
  await assert.rejects(main(['clean','aa','--target','voice'],{repoRoot:root,out:capture()}),/cannot be cleaned/);
  assert.throws(()=>parseArgs(['clean','aa','--target','everything']),/Unknown clean target/);
});

test('--all cross-checks duplicate numbers even when one of the episodes fails its own validation',async t=>{
  const root=fixture(t);
  createEpisode('aa',{title:'A',number:5,repoRoot:root});
  fs.cpSync(path.join(root,'episodes/05_aa'),path.join(root,'episodes/05_bb'),{recursive:true});
  const p=path.join(root,'episodes/05_bb/episode.json');
  fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace('"aa"','"bb"').replace(/"title": "[^"]*"/,'"title": ""'));
  resetEpisodeCache();
  const out=capture();
  assert.equal(await main(['validate','--all'],{repoRoot:root,out}),1);
  assert.match(out.errorText(),/bb: FAILED/);
  assert.match(out.errorText(),/Duplicate episode number 5: aa and bb/);
});

test('validate prints a WARNING (exit 0) for scaffold placeholder text',async t=>{
  const root=fixture(t);
  createEpisode('kk',{title:'K',format:'kasus',repoRoot:root});
  const out=capture();
  assert.equal(await main(['validate','kk'],{repoRoot:root,out}),0);
  assert.match(out.errorText(),/WARNING kk: still has scaffold placeholder/);
  assert.match(out.text(),/kk: valid/);
});

test('a signal during a single-episode run exits 130, not 1',async t=>{
  const root=fixture(t);
  createEpisode('aa',{title:'A',repoRoot:root});
  const out=capture();
  const log=out.log;
  out.log=m=>{log(m);if(/^aa: valid/.test(m)){process.emit('SIGINT','SIGINT');throw new Error('late failure after the signal');}};
  assert.equal(await main(['validate','aa'],{repoRoot:root,out}),130);
  assert.match(out.errorText(),/SIGINT received/);
});
