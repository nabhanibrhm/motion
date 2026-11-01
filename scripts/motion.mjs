#!/usr/bin/env node
import {existsSync,mkdirSync,writeFileSync,readFileSync,statSync,renameSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {REPO_ROOT,ID,listEpisodes,loadEpisode,within} from '../src/config/episodes.mjs';
import {validateEpisode} from '../src/config/validate.mjs';
import {buildEpisode,hyperframesPackage} from '../src/pipeline/build.mjs';
import {ensureVoice} from '../src/pipeline/voice.mjs';
import {masterVideo} from '../src/pipeline/master.mjs';
import {clean} from '../src/pipeline/storage.mjs';
import {withEpisodeLock} from '../src/pipeline/lock.mjs';
import {randomUUID} from 'node:crypto';

const commands=new Set(['list','new','validate','voice','sync','preview','stills','lint','check','render','clean']);
const flags={list:[],new:['title','number','category'],validate:['all'],voice:['all','force'],sync:['all','check'],preview:[],stills:['at','scene'],lint:['all'],check:['all'],render:['all','no-master'],clean:['all','execute','dry-run','target']};
const values=new Set(['title','number','category','at','scene','target']);
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
  if(command==='stills'&&((options.at&&(options.scene||positionals[1]))||(options.scene&&positionals[1]))) throw new Error('Choose one still selector: positional scene, --scene, or --at');
  return {command,options,positionals,forward};
}
export function runNode(args,{cwd=REPO_ROOT}={}) {
  const result=spawnSync(process.execPath,args,{cwd,stdio:'inherit',shell:false});
  if(result.error) throw new Error(`Unable to start process: ${result.error.message}`);
  if(result.status!==0) throw new Error(`Command failed (${result.signal || result.status}): node ${args.map(String).join(' ')}`);
}
const help=`motion — shared HyperFrames 0.8.210 episode pipeline

Usage: node scripts/motion.mjs <command> <episode> [options]
  list                           List authored episodes
  new <id> --title "Title"        Create an episode using a shared title-card
  validate <id>|--all             Validate configuration and source references
  voice <id>|--all [--force]      Explicitly generate/reuse the voice cache
  sync <id>|--all [--check]       Build the disposable HyperFrames project
  preview <id> [-- <HF flags>]    Open HyperFrames Studio
  stills <id> [scene|all]         Capture representative section frames
           [--at 1.2,3.4]        Or capture explicit seconds
  lint|check <id>|--all           Run pinned HyperFrames validation
  render <id>|--all              Render and master into out/
  clean <id>|--all               Show disposable build/still paths (dry run)
        [--target build|stills|voice|all] [--execute]
Voice caches are retained by clean. Diagnostic frames use .cache/stills.
Use -- before extra preview/lint/check/render HyperFrames arguments.
`;

export function createEpisode(id,{title,number,category='Ekonomi_keuangan',repoRoot=REPO_ROOT}={}) {
  if(!ID.test(id || '')) throw new Error('new requires a lowercase episode id');
  if(!title?.trim()) throw new Error('new requires --title');
  const dir=within(repoRoot,`episodes/${id}`);
  if(existsSync(dir)) throw new Error(`Episode already exists: ${id}`);
  const ids=listEpisodes({repoRoot}), next=number===undefined?Math.max(0,...ids.map(x=>loadEpisode(x,{repoRoot}).config.number))+1:Number(number);
  if(!Number.isSafeInteger(next)||next<1) throw new Error('--number must be a positive integer');
  if(ids.some(x=>loadEpisode(x,{repoRoot}).config.number===next)) throw new Error(`Episode number ${next} already exists`);
  if(!/^[\p{L}\p{N}][\p{L}\p{N}_ -]*$/u.test(category)) throw new Error('Invalid category name');
  const config={schemaVersion:1,id,number:next,title,category,narration:'narration.json',script:'script-short.md',video:{width:1080,height:1920,fps:30},runtime:{profile:'modern',case:{id:`KASUS #${String(next).padStart(2,'0')}`,steps:1}},scenes:[{id:'hook',template:'title-card',props:{title}}],audio:{bed:null,bedGain:.3,loudness:{integrated:-14,truePeak:-1,range:11}}};
  const narration={source:'supertonic',speakers:{mog:{supertonic:{voice:'M1',speed:1,range:1.5}}},chapters:[{id:'kasus',title}],defaults:{lead:.15,tail:.1,gapSameSpeaker:.1,gapNewSpeaker:.1,firstLead:.2,chapterLead:.1,chapterEndTail:.1},sections:[{id:'hook',chapter:'kasus',lines:[{speaker:'mog',text:title}]}]};
  mkdirSync(dir,{recursive:true});
  for(const [name,data] of [['episode.json',config],['narration.json',narration]]) writeFileSync(join(dir,name),JSON.stringify(data,null,2)+'\n');
  writeFileSync(join(dir,'script-short.md'),`# ${title}\n\nReplace this starter narration and scene before production. Add full sources for every claim here.\n`);
  return loadEpisode(id,{repoRoot});
}
export async function main(argv=process.argv.slice(2)) {
  const {command,options:o,positionals:pos,forward}=parseArgs(argv);
  if(command==='help'){console.log(help);return;}
  if(command==='new'){const ctx=createEpisode(pos[0],o);console.log(`Created ${ctx.episodeDir}`);return;}
  const ids=o.all?listEpisodes():pos[0]?[pos[0]]:[];
  if(command==='list') {
    for(const id of listEpisodes()){const {config:c}=loadEpisode(id);console.log(`${String(c.number).padStart(2,'0')}  ${id}  ${c.title}`);}return;
  }
  if(!ids.length) throw new Error(`${command} requires an episode id or --all where supported`);
  for(const id of ids) {
    const ctx=loadEpisode(id);
    if(command==='validate'){const result=validateEpisode(ctx);console.log(`${id}: valid (${result.scenes} scenes)`);continue;}
    const work=async()=>{
    if(command==='voice'){validateEpisode(ctx);const result=await ensureVoice(ctx,{generate:true,force:!!o.force});console.log(`${id}: voice ${result.cacheHit?'cache hit':'ready'}`);return;}
    if(command==='clean'){const r=await clean(ctx,{execute:!!o.execute,target:o.target || 'all'});console.log(`${id}: ${o.execute?'cleaned':'dry run'}\n${r.paths.join('\n')}${r.protected.length?'\nRetained voice: '+r.protected.join(', '):''}`);return;}
    if(command==='render'){validateEpisode(ctx);await ensureVoice(ctx,{generate:true});}
    const build=await buildEpisode(ctx,{check:!!o.check,locked:true});
    if(command==='sync'){console.log(`${id}: ${build.changed.length?`${build.changed.length} files written`:'up to date'}; ${build.timing.seconds} s`);return;}
    const hf=hyperframesPackage(ctx.repoRoot).bin;
    if(command==='stills') {
      const scene=o.scene || pos[1] || 'all';
      if(o.at&&o.scene) throw new Error('Choose --at or --scene');
      const at=o.at?o.at.split(',').map(Number):build.timing.list.filter(s=>s.kind==='section'&&(scene==='all'||s.section.id===scene)).flatMap(s=>[+(s.from/build.timing.fps+s.duration/build.timing.fps*.3).toFixed(2),+(s.from/build.timing.fps+s.duration/build.timing.fps*.7).toFixed(2)]);
      if(!at.length||at.some(t=>!Number.isFinite(t)||t<0||t>=build.timing.seconds)) throw new Error(`Invalid still moments or scene: ${scene}`);
      const out=join(ctx.paths.stillsDir,o.at?'custom':scene,`run-${randomUUID()}`);
      if(!ID.test(scene)&&scene!=='all') throw new Error('Invalid still scene');
      mkdirSync(out,{recursive:true});runNode([hf,'snapshot','--at',at.join(','),'--no-end','-o',out],{cwd:build.buildDir});return;
    }
    if(command==='render') {
      mkdirSync(dirname(ctx.paths.rawRenderFile),{recursive:true});
      const raw=join(build.buildDir,`render-${randomUUID()}.raw.mp4`);
      runNode([hf,'render',...forward,'-o',raw],{cwd:build.buildDir});
      if(!existsSync(raw)||statSync(raw).size===0) throw new Error('HyperFrames did not create the fresh raw render');
      if(!o['no-master']) await masterVideo({input:raw,output:ctx.paths.resultFile,bedPath:ctx.config.audio.bed?join(build.buildDir,'public',ctx.config.audio.bed):null,bedGain:ctx.config.audio.bedGain,...ctx.config.audio.loudness});
      renameSync(raw,ctx.paths.rawRenderFile);
      console.log(`${id}: ${o['no-master']?ctx.paths.rawRenderFile:ctx.paths.resultFile}`);return;
    }
    runNode([hf,command,...forward],{cwd:build.buildDir});
    };
    if(o.check||(command==='clean'&&!o.execute)) await work();
    else await withEpisodeLock(ctx,work);
  }
}
if(process.argv[1]&&resolve(process.argv[1]).toLowerCase()===fileURLToPath(import.meta.url).toLowerCase()) main().catch(error=>{console.error(`motion: ${error.message}`);process.exitCode=1;});
