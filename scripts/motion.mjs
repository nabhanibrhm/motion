#!/usr/bin/env node
import {existsSync,mkdirSync,writeFileSync,readFileSync,readdirSync,statSync,renameSync} from 'node:fs';
import {join,resolve,dirname,basename,relative,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {REPO_ROOT,ID,listEpisodes,loadEpisode,within,episodeFolder,readJSON} from '../src/config/episodes.mjs';
import {validateEpisode,validateEpisodes,placeholderWarnings} from '../src/config/validate.mjs';
import {buildEpisode,hyperframesPackage} from '../src/pipeline/build.mjs';
import {ensureVoice} from '../src/pipeline/voice.mjs';
import {masterVideo,masterQa} from '../src/pipeline/master.mjs';
import {clean,cleanReport} from '../src/pipeline/storage.mjs';
import {withEpisodeLock,releaseHeldLocksSync} from '../src/pipeline/lock.mjs';
import {randomUUID} from 'node:crypto';

const commands=new Set(['list','new','validate','voice','sync','preview','stills','lint','check','render','clean']);
const flags={list:[],new:['title','number','category','flash','format'],validate:['all'],voice:['all','force','offline','restamp','adopt','adopt-structural'],sync:['all','check'],preview:[],stills:['at','scene'],lint:['all'],check:['all'],render:['all','no-master'],clean:['all','execute','dry-run','target']};
const values=new Set(['title','number','category','format','at','scene','target']);
const hfValues={preview:new Set(['port']),render:new Set(['quality','workers','crf','video-bitrate','keyframe-interval','max-bitrate','buffer-size','browser-timeout','protocol-timeout','player-ready-timeout'])};
const hfFlags={preview:new Set(['force-new','background','foreground','status','stop','no-open','lint-verbose','json','context','selection','browser-gpu','no-browser-gpu','proxy','no-proxy']),render:new Set(['gpu','browser-gpu','no-browser-gpu','quiet','lint-verbose','debug','best-effort','no-best-effort','low-memory-mode','no-low-memory-mode']),lint:new Set(['json','verbose']),check:new Set(['json'])};
function validateForward(command,args) {
  for(let i=0;i<args.length;i++) {
    const match=args[i].match(/^--([a-z-]+)(?:=(.*))?$/);
    if(!match) throw new Error(`Unsupported HyperFrames argument: ${args[i]}; only documented long options are supported`);
    const [,name,value]=match;
    if(hfValues[command]?.has(name)) {
      const next=value??args[++i];
      if(!next||next.startsWith('--')) throw new Error(`HyperFrames --${name} requires a value`);
    }else if(!hfFlags[command]?.has(name)||value!==undefined) throw new Error(`Unsupported HyperFrames option: --${name}`);
  }
}
export function parseArgs(argv) {
  const [command='help',...args]=argv, options={},positionals=[],forward=[];
  if(command==='help'||command==='--help'||command==='-h') return {command:'help',options,positionals,forward};
  if(!commands.has(command)) throw new Error(`Unknown command: ${command}`);
  for(let i=0;i<args.length;i++) {
    const arg=args[i];
    if(arg==='--'){forward.push(...args.slice(i+1));break;}
    if(arg==='--help'||arg==='-h') return {command:'help',options,positionals,forward};
    if(arg.startsWith('-')) {
      const match=arg.match(/^--([a-z-]+)(?:=(.*))?$/);
      if(!match||!flags[command].includes(match[1])) throw new Error(`Unknown option for ${command}: ${arg}`);
      const [,name,inline]=match;
      if(Object.hasOwn(options,name)) throw new Error(`Duplicate option: --${name}`);
      if(values.has(name)) {
        const value=inline ?? args[++i];
        if(value===undefined||value===''||value.startsWith('--')) throw new Error(`--${name} requires a value`);
        options[name]=value;
      }else{if(inline!==undefined) throw new Error(`--${name} takes no value`);options[name]=true;}
    }else positionals.push(arg);
  }
  if(options.all&&positionals.length) throw new Error('Choose an episode or --all');
  if(command==='list'&&positionals.length) throw new Error('list takes no episode');
  if(positionals.length>(command==='stills'?2:1)) throw new Error(`Too many arguments for ${command}`);
  if(forward.length&&!['preview','lint','check','render'].includes(command)) throw new Error(`${command} does not forward HyperFrames arguments`);
  if(forward.some(arg=>/^(?:-o(?:=|$)|--(?:output|dir|entry|project|input)(?:=|$))/.test(arg))) throw new Error('Output and project overrides are managed by motion');
  validateForward(command,forward);
  if(options.execute&&options['dry-run']) throw new Error('Choose --execute or --dry-run');
  if(command==='new'&&options.flash&&options.format&&options.format!=='hotwizz-flash') throw new Error('--flash is the same as --format hotwizz-flash; do not combine it with another format');
  if(command==='clean'&&options.target&&!['build','stills','voice','all'].includes(options.target)) throw new Error(`Unknown clean target: ${options.target}; use build, stills or all`);
  const voiceModes=['force','offline','restamp','adopt','adopt-structural'].filter(k=>options[k]);
  if(voiceModes.length>1) throw new Error(`Choose one of --${voiceModes.join(', --')}`);
  if(command==='stills'&&((options.at&&(options.scene||positionals[1]))||(options.scene&&positionals[1]))) throw new Error('Choose one still selector: positional scene, --scene, or --at');
  return {command,options,positionals,forward};
}
/** Thrown when SIGINT/SIGTERM stopped the run; the CLI exits 130 after the locks are released. */
export class Interrupted extends Error {constructor(signal='SIGINT'){super(`Interrupted (${signal})`);this.signal=signal;}}
export function runNode(args,{cwd=REPO_ROOT}={}) {
  const result=spawnSync(process.execPath,args,{cwd,stdio:'inherit',shell:false});
  if(result.error) throw new Error(`Unable to start process: ${result.error.message}`);
  if(result.signal==='SIGINT'||result.signal==='SIGTERM') throw new Interrupted(result.signal);
  if(result.status!==0) throw new Error(`Command failed (${result.signal || result.status}): node ${args.map(String).join(' ')}`);
}
const help=`motion — shared HyperFrames 0.8.210 episode pipeline

Usage: node scripts/motion.mjs <command> <episode> [options]
  list                           List authored episodes
  new <id> --title "Title"        Create an episode from a format (default: one title-card scene)
      [--format default|hotwizz-flash|kasus|...]   a folder in config/formats/
      [--flash]                  Same as --format hotwizz-flash (hotwizz theme, Nisa/Cartesia, hw-* templates)
      [--number n] [--category c]
  validate <id>|--all             Validate configuration and source references (--all also checks unique ids and numbers)
  voice <id>|--all [--force]      Explicitly generate/reuse the voice cache
        [--offline]              Local caches only: no Cartesia API, no Supertonic synthesis
        [--restamp]              Re-key an older cache: regenerate offline from caches, keep it if byte-identical
        [--adopt]                Re-key a pre-v4 cache that cannot be regenerated, if its narration digest still matches
        [--adopt-structural]     Files/Cartesia only: adopt when the layout rebuilt from the clips matches the manifest
  sync <id>|--all [--check]       Build the disposable HyperFrames project
  preview <id> [-- <HF flags>]    Build (locked), then open HyperFrames Studio without holding the lock
  stills <id> [scene|all]         Capture representative section frames
           [--at 1.2,3.4]        Or capture explicit seconds
  lint|check <id>|--all           Run pinned HyperFrames validation
  render <id>|--all              Render and master into out/ (prints measured loudness, fps and size)
  clean <id>|--all               Show disposable build/still paths (dry run)
        [--target build|stills|all] [--execute]
With --all a failing episode does not stop the run: a per-episode table follows and the exit code is 1 if any failed.
Voice caches are retained by clean (a voice target is rejected). Diagnostic frames use .cache/stills.
Use -- before extra preview/lint/check/render HyperFrames arguments. Ctrl-C releases the episode lock and exits 130.
`;


/* ------------------------------------------------------------------ formats (config/formats/<name>/) */

const FORMAT_NAME=/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const TOKEN=/\{\{(\w+)\}\}/g;
export function listFormats({repoRoot=REPO_ROOT}={}) {
  const dir=join(repoRoot,'config/formats');
  if(!existsSync(dir)) return [];
  return readdirSync(dir,{withFileTypes:true}).filter(x=>x.isDirectory()&&existsSync(join(dir,x.name,'format.json'))).map(x=>x.name).sort();
}
export function loadFormat(name,{repoRoot=REPO_ROOT}={}) {
  if(!FORMAT_NAME.test(name||'')) throw new Error(`Invalid format name: ${name}`);
  const dir=within(repoRoot,`config/formats/${name}`);
  if(!existsSync(join(dir,'format.json'))) throw new Error(`Unknown format: ${name}; available: ${listFormats({repoRoot}).join(', ')||'none'}`);
  const format=readJSON(join(dir,'format.json'));
  for(const key of ['episode','narration']) if(!format[key]||typeof format[key]!=='object') throw new Error(`Format ${name}: "${key}" is required`);
  return {name,dir,filesDir:join(dir,'files'),format};
}
/** {{id}} {{number}} {{title}} {{category}} {{caseId}} {{steps}} inside strings; a string that is only {{number}} or {{steps}} becomes a number. */
function fill(value,vars,where) {
  if(typeof value==='string') {
    const only=/^\{\{(number|steps)\}\}$/.exec(value);
    if(only) return vars[only[1]];
    return value.replace(TOKEN,(_,k)=>{if(!Object.hasOwn(vars,k)) throw new Error(`Format placeholder {{${k}}} is unknown (${where})`);return String(vars[k]);});
  }
  if(Array.isArray(value)) return value.map(x=>fill(x,vars,where));
  if(value&&typeof value==='object') return Object.fromEntries(Object.entries(value).map(([k,x])=>[k,fill(x,vars,where)]));
  return value;
}
function* walkFiles(dir,base=dir) {
  if(!existsSync(dir)) return;
  for(const e of readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))) {
    const path=join(dir,e.name);
    if(e.isSymbolicLink()) throw new Error(`Symlink in a format is not supported: ${path}`);
    if(e.isDirectory()) yield* walkFiles(path,base);
    else yield relative(base,path).split(sep).join('/');
  }
}
/** The case number the new episode gets: its episode number, a per-theme count, or one more than the highest `<prefix> #NN` in use. */
function caseNumber(counter,prefix,{ids,repoRoot,number}) {
  if(counter==='number'||counter===undefined) return number;
  const configs=ids.map(x=>loadEpisode(x,{repoRoot}).config);
  if(counter&&typeof counter==='object'&&typeof counter.theme==='string') return configs.filter(c=>c.theme===counter.theme).length+1;
  if(counter==='max') {
    const re=new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')} #(\\d+)$`);
    return Math.max(0,...configs.map(c=>Number(re.exec(c.runtime?.case?.id||'')?.[1]||0)))+1;
  }
  throw new Error(`Unsupported case counter: ${JSON.stringify(counter)}`);
}

export function createEpisode(id,{title,number,category=undefined,flash=false,format=undefined,repoRoot=REPO_ROOT}={}) {
  if(flash&&format&&format!=='hotwizz-flash') throw new Error('--flash is the same as --format hotwizz-flash');
  const fmt=loadFormat(format??(flash?'hotwizz-flash':'default'),{repoRoot});
  category??=fmt.format.category??'Ekonomi_keuangan';
  if(!ID.test(id || '')) throw new Error('new requires a lowercase episode id');
  if(!title?.trim()) throw new Error('new requires --title');
  const ids=listEpisodes({repoRoot});
  if(ids.includes(id)) throw new Error(`Episode already exists: ${id}`);
  const next=number===undefined?Math.max(0,...ids.map(x=>loadEpisode(x,{repoRoot}).config.number))+1:Number(number);
  if(!Number.isSafeInteger(next)||next<1) throw new Error('--number must be a positive integer');
  if(ids.some(x=>loadEpisode(x,{repoRoot}).config.number===next)) throw new Error(`Episode number ${next} already exists`);
  const dir=within(repoRoot,`episodes/${episodeFolder(id,next)}`);
  if(existsSync(dir)) throw new Error(`Episode folder already exists: ${dir}`);
  if(!/^[\p{L}\p{N}][\p{L}\p{N}_ -]*$/u.test(category)) throw new Error('Invalid category name');
  const kase=fmt.format.case||{prefix:'KASUS',counter:'number'};
  const caseId=`${kase.prefix} #${String(caseNumber(kase.counter,kase.prefix,{ids,repoRoot,number:next})).padStart(2,'0')}`;
  const vars={id,number:next,title,category,caseId,steps:fmt.format.episode.scenes?.length??1};
  const config=fill(fmt.format.episode,vars,`${fmt.name} episode`), narration=fill(fmt.format.narration,vars,`${fmt.name} narration`);
  const files=[...walkFiles(fmt.filesDir)].map(rel=>({rel,data:readFileSync(join(fmt.filesDir,rel))}));
  for(const {rel} of files) if(['episode.json','narration.json'].includes(rel)) throw new Error(`Format ${fmt.name}: files/${rel} would overwrite the generated manifest`);
  mkdirSync(dir,{recursive:true});
  for(const [name,data] of [['episode.json',config],['narration.json',narration]]) writeFileSync(join(dir,name),JSON.stringify(data,null,2)+'\n');
  for(const {rel,data} of files) {
    const out=within(dir,rel);
    mkdirSync(dirname(out),{recursive:true});
    writeFileSync(out,data.includes(0)?data:fill(data.toString('utf8'),vars,`${fmt.name} files/${rel}`));
  }
  return loadEpisode(id,{repoRoot});
}

/* ------------------------------------------------------------------ batch runner */

const firstLine=text=>String(text).split('\n').find(l=>l.trim())?.trim()??'';
function printTable(out,rows) {
  const w=Math.max(7,...rows.map(r=>r.id.length)),bad=rows.filter(r=>!r.ok).length;
  out.log('');
  out.log(`${'episode'.padEnd(w)}  status  detail`);
  for(const r of rows) out.log(`${r.id.padEnd(w)}  ${(r.ok?'OK':'FAIL').padEnd(6)}  ${firstLine(r.detail).slice(0,140)}`);
  out.log(`${rows.length} episodes: ${rows.length-bad} ok, ${bad} failed`);
}

export async function main(argv=process.argv.slice(2),{repoRoot=REPO_ROOT,out=console}={}) {
  const {command,options:o,positionals:pos,forward}=parseArgs(argv);
  if(command==='help'){out.log(help);return 0;}
  if(command==='new'){const ctx=createEpisode(pos[0],{...o,flash:!!o.flash,repoRoot});out.log(`Created ${ctx.episodeDir}`);return 0;}
  const ids=o.all?listEpisodes({repoRoot}):pos[0]?[pos[0]]:[];
  if(command==='list') {
    for(const id of listEpisodes({repoRoot})){const {config:c}=loadEpisode(id,{repoRoot});out.log(`${String(c.number).padStart(2,'0')}  ${id}  ${c.title}`);}return 0;
  }
  if(!ids.length) throw new Error(`${command} requires an episode id or --all where supported`);
  // First signal: finish the current step so `finally` releases the lock, then exit 130. Second: release locks and leave now.
  const state={interrupted:null};
  const onSignal=signal=>{
    if(state.interrupted){releaseHeldLocksSync();process.exit(130);}
    state.interrupted=signal;out.error(`motion: ${signal} received; stopping after the current step (a render or ffmpeg step in progress must finish first; a second signal exits at once when the process is idle)`);
  };
  process.on('SIGINT',onSignal);process.on('SIGTERM',onSignal);
  const stopIfInterrupted=()=>{if(state.interrupted) throw new Interrupted(state.interrupted);};

  const runOne=async id=>{
    const ctx=loadEpisode(id,{repoRoot});
    if(command==='validate'){const result=validateEpisode(ctx);for(const w of placeholderWarnings(ctx)) out.error(`WARNING ${w}`);out.log(`${id}: valid (${result.scenes} scenes)`);return `valid (${result.scenes} scenes)`;}
    let status='';
    const work=async()=>{
      stopIfInterrupted();
      if(command==='voice'){validateEpisode(ctx);const result=await ensureVoice(ctx,{generate:true,force:!!o.force,offline:!!o.offline,restamp:!!o.restamp,adopt:!!o.adopt,adoptStructural:!!o['adopt-structural']});status=`voice ${result.restamped?`restamped (${result.restamped})`:result.cacheHit?'cache hit':'ready'}`;out.log(`${id}: ${status}`);return;}
      if(command==='clean'){const r=await clean(ctx,{execute:!!o.execute,target:o.target || 'all'});out.log(cleanReport(id,r));status=r.execute?'cleaned':'dry run';return;}
      if(command==='render'){validateEpisode(ctx);await ensureVoice(ctx,{generate:true});}
      const build=await buildEpisode(ctx,{check:!!o.check,locked:true});
      if(command==='sync'){status=`${build.changed.length?`${build.changed.length} files written`:'up to date'}; ${build.timing.seconds} s`;out.log(`${id}: ${status}`);return;}
      const hf=hyperframesPackage(ctx.repoRoot).bin;
      if(command==='stills') {
        const scene=o.scene || pos[1] || 'all';
        if(o.at&&o.scene) throw new Error('Choose --at or --scene');
        const at=o.at?o.at.split(',').map(Number):build.timing.list.filter(s=>s.kind==='section'&&(scene==='all'||s.section.id===scene)).flatMap(s=>[+(s.from/build.timing.fps+s.duration/build.timing.fps*.3).toFixed(2),+(s.from/build.timing.fps+s.duration/build.timing.fps*.7).toFixed(2)]);
        if(!at.length||at.some(t=>!Number.isFinite(t)||t<0||t>=build.timing.seconds)) throw new Error(`Invalid still moments or scene: ${scene}`);
        const dest=join(ctx.paths.stillsDir,o.at?'custom':scene,`run-${randomUUID()}`);
        if(!ID.test(scene)&&scene!=='all') throw new Error('Invalid still scene');
        mkdirSync(dest,{recursive:true});runNode([hf,'snapshot','--at',at.join(','),'--no-end','-o',dest],{cwd:build.buildDir});status=dest;return;
      }
      if(command==='render') {
        mkdirSync(dirname(ctx.paths.rawRenderFile),{recursive:true});
        const raw=join(build.buildDir,`render-${randomUUID()}.raw.mp4`);
        runNode([hf,'render',...forward,'-o',raw],{cwd:build.buildDir});
        if(!existsSync(raw)||statSync(raw).size===0) throw new Error('HyperFrames did not create the fresh raw render');
        const {loudness}=ctx.config.audio;
        let mastered=null;
        if(!o['no-master']) mastered=await masterVideo({input:raw,output:ctx.paths.resultFile,bedPath:ctx.config.audio.bed?join(build.buildDir,'public',ctx.config.audio.bed):null,bedGain:ctx.config.audio.bedGain,...loudness});
        renameSync(raw,ctx.paths.rawRenderFile);
        status=o['no-master']?ctx.paths.rawRenderFile:ctx.paths.resultFile;
        out.log(`${id}: ${status}`);
        if(mastered) {
          const qa=await masterQa(mastered.measured,{output:ctx.paths.resultFile,fps:ctx.config.video.fps,integrated:loudness.integrated,truePeak:loudness.truePeak});
          out.log(`  ${qa.line}`);
          if(mastered.measureError) out.log(`  could not measure the output: ${mastered.measureError}`);
          const posted=join(dirname(ctx.paths.resultFile),'uploaded',basename(ctx.paths.resultFile));
          const warnings=[...qa.warnings];
          if(!mastered.measured&&existsSync(posted)) warnings.push(`Already posted: ${posted} exists (left untouched).`);
          for(const w of warnings) out.log(`  warning: ${w}`);
        }
        return;
      }
      runNode([hf,command,...forward],{cwd:build.buildDir});status='ok';
    };
    if(command==='preview') {
      // The lock covers only the build; Studio runs for as long as the person keeps it open.
      const build=await buildEpisode(ctx);
      runNode([hyperframesPackage(ctx.repoRoot).bin,'preview',...forward],{cwd:build.buildDir});
      return 'ok';
    }
    if(o.check||(command==='clean'&&!o.execute)) await work();
    else await withEpisodeLock(ctx,work);
    return status||'ok';
  };

  try {
    if(!o.all) {
      try{await runOne(ids[0]);}catch(e){await new Promise(r=>setImmediate(r)); // let a pending signal handler run before deciding
        if(e instanceof Interrupted||state.interrupted){out.error(`motion: ${e instanceof Interrupted?e.message:`interrupted (${state.interrupted})`}`);return 130;}throw e;}
      return 0;
    }
    const rows=[],loaded=[];
    for(const id of ids) {
      if(state.interrupted) break;
      try {
        const status=await runOne(id);
        rows.push({id,ok:true,detail:status});
      } catch(e) {
        await new Promise(r=>setImmediate(r)); // let a pending signal handler run before deciding
        if(e instanceof Interrupted||state.interrupted){state.interrupted??=e.signal;break;}
        out.error(`${id}: FAILED\n${e.message}`);
        rows.push({id,ok:false,detail:e.message});
      }
      // cross-episode id/number checks cover every readable episode, including ones whose own validation failed
      if(command==='validate') try{loaded.push(loadEpisode(id,{repoRoot}));}catch{/* unreadable manifest: already reported above */}
    }
    if(command==='validate'&&!state.interrupted) try{validateEpisodes(loaded,{each:false});}catch(e){out.error(`cross-episode checks failed\n${e.message}`);rows.push({id:'(all episodes)',ok:false,detail:e.message});}
    printTable(out,rows);
    if(state.interrupted){out.error(`motion: interrupted (${state.interrupted}); ${ids.length-rows.length} episode(s) not run`);return 130;}
    return rows.every(r=>r.ok)?0:1;
  } finally {process.off('SIGINT',onSignal);process.off('SIGTERM',onSignal);}
}
if(process.argv[1]&&resolve(process.argv[1]).toLowerCase()===fileURLToPath(import.meta.url).toLowerCase()) main().then(code=>{process.exitCode=code;},error=>{console.error(`motion: ${error.message}`);process.exitCode=error instanceof Interrupted?130:1;});
