import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import vm from 'node:vm';
import {REPO_ROOT,listEpisodes,loadEpisode} from '../src/config/episodes.mjs';
import {runtimeConfig,PALETTE_KEYS} from '../src/runtime/timing.mjs';

/* ---- a Node VM that mirrors the browser runtime load order (timing, core, world, cine) ---- */
const DIR=join(REPO_ROOT,'src/runtime/f1');
const css=readFileSync(join(DIR,'f1.css'),'utf8');
const vars=Object.fromEntries([...css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(m=>[m[1],m[2].trim()]));
const CASE={id:'KASUS #11',steps:8,name:'CUTI BERSAMA'};

const words=text=>text.split(' ');
function line(speaker,text,start,per=.3){
  const ws=words(text).map((word,i)=>({word,start:+(start+i*per).toFixed(3),end:+(start+i*per+per*.8).toFixed(3)}));
  return {speaker,text,start:ws[0].start,end:ws.at(-1).end,words:ws};
}
const LINES=[line('nisa','Stempel kasus ditutup sekarang juga',.2),line('nisa','Cuti tahunanmu masih utuh',3.4),line('nisa','Tulis di komentar ya',6.4)];
const VOICE={speakers:{nisa:{}},chapters:[{id:'c',title:'C'}],total:11,sections:[{id:'vonis',chapter:'c',start:0,duration:10,lead:.2,tail:.1,audio:'voice/vonis.mp3',text:LINES.map(l=>l.text).join(' '),lines:LINES}]};

function createRuntime({palette,config={}}={}){
  const warnings=[];
  const CONFIG={profile:'modern',case:structuredClone(CASE),captions:{maxWords:6},...config};
  if(palette) CONFIG.palette=palette;
  const tl={to(p,vars){tl.p=p;tl.vars=vars;return tl;}};
  const c=vm.createContext({
    F1:{VOICE:structuredClone(VOICE),CONFIG},window:{__timelines:{}},
    document:{documentElement:{},createElement:()=>({}),getElementById:()=>({parentElement:{querySelectorAll:()=>[]}})},
    getComputedStyle:()=>({getPropertyValue:name=>vars[name]??''}),
    gsap:{timeline:()=>tl},
    console:{warn:m=>warnings.push(String(m)),log(){},error(){}},
  });
  for(const name of ['timing.js','core.js','world.js','cine.js']) vm.runInContext(readFileSync(join(DIR,name),'utf8'),c,{filename:name,timeout:5000});
  return {c,F1:c.F1,tl,warnings};
}
const {c:ctxVm,F1}=createRuntime();
const S=F1.section('vonis');
const D=F1.sceneFrames('vonis');
const frames=[];for(let f=0;f<=D;f+=.5) frames.push(f);
const clean=(s,what)=>{assert.equal(typeof s,'string',what);assert.ok(!/NaN|undefined|null|Infinity/.test(s),`${what}: bad value in markup`);};

/* ---- the pasted copies this kit replaces: scenes 06/12/13/14 use F1.n, scene 07 uses a bare n ---- */
const n=F1.n;
const DRIFT_F1=(f,{seed,count,y0,y1,color,a})=>`<g fill="${color}" opacity="${a}">${Array.from({length:count},(_,i)=>{const h=k=>F1.world.hash(seed+i*5+k);return `<circle cx="${F1.n(60+960*h(1)+26*Math.sin(f*0.035*(0.6+h(2))+h(3)*6.28),1)}" cy="${F1.n(y0+(y1-y0)*h(4)+34*Math.sin(f*0.026*(0.6+h(5))+h(6)*6.28),1)}" r="${F1.n(8+18*h(7),1)}"/>`;}).join("")}</g>`;
const SWEEP_F1=(f,{color,a,y0,y1})=>`<g style="filter:blur(26px)" opacity="${F1.n(a*(0.65+0.35*Math.sin(f*0.021)),3)}" transform="translate(${F1.n(-260+1000*(0.5+0.5*Math.sin(f*0.0175)),1)} 0)"><polygon points="0,${y0} 200,${y0} 100,${y1} -100,${y1}" fill="${color}"/></g>`;
const DRIFT_N=(f,{seed,count,y0,y1,color,a})=>`<g fill="${color}" opacity="${a}">${Array.from({length:count},(_,i)=>{const h=k=>F1.world.hash(seed+i*5+k);return `<circle cx="${n(60+960*h(1)+26*Math.sin(f*0.035*(0.6+h(2))+h(3)*6.28),1)}" cy="${n(y0+(y1-y0)*h(4)+34*Math.sin(f*0.026*(0.6+h(5))+h(6)*6.28),1)}" r="${n(8+18*h(7),1)}"/>`;}).join("")}</g>`;
const SWEEP_N=(f,{color,a,y0,y1})=>`<g style="filter:blur(26px)" opacity="${n(a*(0.65+0.35*Math.sin(f*0.021)),3)}" transform="translate(${n(-260+1000*(0.5+0.5*Math.sin(f*0.0175)),1)} 0)"><polygon points="0,${y0} 200,${y0} 100,${y1} -100,${y1}" fill="${color}"/></g>`;

test('W.drift and W.sweep are byte-identical to both pasted variants',()=>{
  const drifts=[
    {seed:310,count:7,y0:420,y1:1050,color:'#f2c27a',a:0.25},{seed:210,count:8,y0:300,y1:1000,color:'#f2c27a',a:0.25},
    {seed:1010,count:7,y0:300,y1:1100,color:'#8fd0d2',a:0.26},{seed:1260,count:8,y0:300,y1:1400,color:'#ff8a3d',a:0.2},
    {seed:260,count:6,y0:560,y1:1050,color:'#e0b57a',a:0.2},{seed:0,count:1,y0:0,y1:1920,color:'#fff',a:1},
  ];
  const sweeps=[{color:'#fffaf0',a:0.2,y0:300,y1:1100},{color:'#f3f7fa',a:0.22,y0:240,y1:1180},{color:'#ffffff',a:0.14,y0:280,y1:1420},{color:'#ff2d3d',a:0,y0:0,y1:1920}];
  let checked=0;
  for(let f=0;f<=600;f+=.5){
    for(const o of drifts){
      const got=F1.world.drift(f,o);
      assert.equal(got,DRIFT_F1(f,o),`drift f=${f}`);assert.equal(got,DRIFT_N(f,o),`drift(n) f=${f}`);checked++;
    }
    for(const o of sweeps){
      const got=F1.world.sweep(f,o);
      assert.equal(got,SWEEP_F1(f,o),`sweep f=${f}`);assert.equal(got,SWEEP_N(f,o),`sweep(n) f=${f}`);checked++;
    }
  }
  assert.ok(checked>10000);
});

test('hotwizz-kit background is plain (no drift dots or red sweep since 10 Nov 2026) and has no private copy',()=>{
  const kit=readFileSync(join(REPO_ROOT,'src/templates/hotwizz-kit.js'),'utf8');
  assert.ok(!kit.includes('F1.world.drift('));
  assert.ok(!kit.includes('F1.world.sweep('));
  assert.ok(!/const (DRIFT|SWEEP) =/.test(kit));
});

test('F1.fmt.id matches the pasted regexp formatters, with negatives and decimals',()=>{
  const copy=v=>String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  let seed=12345;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const values=[0,-0,1,-1,0.5,-0.5,999,1000,-1000,1234567,-1234567,99999.5,1e9,2.5,-2.5];
  while(values.length<2000){const mag=10**Math.floor(rnd()*10);const v=(rnd()-.4)*mag;values.push(rnd()<.5?v:Math.round(v*100)/100);}
  for(const v of values) assert.equal(F1.fmt.id(v),copy(v),`id(${v})`);
  for(const v of values) for(const d of [1,2]){
    const got=F1.fmt.id(v,d);
    assert.equal(got.replace(/\./g,'').replace(',','.'),v.toFixed(d),`id(${v},${d}) = ${got}`);
    if(Math.abs(v)<1000) assert.equal(got,v.toFixed(d).replace('.',','),`scene copy for ${v}`);
  }
  assert.equal(F1.fmt.id(1234.5,2),'1.234,50');assert.equal(F1.fmt.id(-1234567),'-1.234.567');assert.equal(F1.fmt.id(NaN),'0');
  assert.equal(F1.fmt.rp(1500000),'Rp1.500.000');assert.equal(F1.fmt.rp(1234.5,1),'Rp1.234,5');
});

test('F1.countUp eases between its end points',()=>{
  assert.equal(F1.countUp(0,10,20,100,500),100);assert.equal(F1.countUp(10,10,20,100,500),100);
  assert.equal(F1.countUp(30,10,20,100,500),500);assert.equal(F1.countUp(999,10,20,100,500),500);
  const mid=F1.countUp(20,10,20,0,1000);assert.ok(mid>0&&mid<1000);
  assert.equal(F1.countUp(20,10,20,0,1000,u=>u),500);
  let prev=-1;for(const f of frames){const v=F1.countUp(f,20,40,0,1000);assert.ok(v>=prev&&Number.isFinite(v));prev=v;}
});

test('PALETTE_KEYS equals the DEFAULT_PAL keys, F1.PAL is frozen and merges runtime.palette',()=>{
  assert.deepEqual([...PALETTE_KEYS],Object.keys(F1.DEFAULT_PAL));
  assert.ok(Object.isFrozen(F1.PAL)&&Object.isFrozen(F1.DEFAULT_PAL));
  assert.deepEqual({...F1.PAL},{...F1.DEFAULT_PAL});
  assert.deepEqual(Object.values(F1.DEFAULT_PAL).slice(0,7),['#f6efe1','#fffaf0','#2a2a2e','#6f6a66','#8a6f55','#c0392b','#c6f432']);
  assert.deepEqual(Object.values(F1.DEFAULT_PAL).slice(7),['#3d7480','#2f6a6e','#8fd0d2','#c4d3dd']);
  const {F1:themed}=createRuntime({palette:{bg:'#dfe8ee',red:'#d0413a'}});
  assert.equal(themed.PAL.bg,'#dfe8ee');assert.equal(themed.PAL.red,'#d0413a');assert.equal(themed.PAL.ink,'#2a2a2e');
  assert.ok(Object.isFrozen(themed.PAL));
});

/** runtimeConfig as it was at HEAD (before palette support). */
const headRuntimeConfig=config=>{
  const out={profile:config.runtime.profile,case:config.runtime.case,captions:{maxWords:config.runtime.profile==='legacy-inflasi'?4:6}};
  if(config.runtime.watermark) out.watermark=structuredClone(config.runtime.watermark);
  return out;
};
test('runtimeConfig is unchanged for every episode without a palette, and emits palette when set',()=>{
  const episodes=listEpisodes();
  assert.ok(episodes.length>=14,`expected at least 14 episodes, found ${episodes.length}`);
  for(const id of episodes){
    const ctx=loadEpisode(id);
    const out=runtimeConfig(ctx.config);
    if(ctx.config.runtime.palette){ // a theme/episode that sets a palette opts in; everything else is unchanged
      assert.deepEqual(out.palette,ctx.config.runtime.palette,id);delete out.palette;
    } else assert.ok(!('palette' in out),id);
    assert.deepEqual(out,headRuntimeConfig(ctx.config),id);
  }
  const base=loadEpisode(episodes[0]).config;
  const palette={bg:'#dfe8ee',red:'#d0413a'};
  const cfg={...base,runtime:{...base.runtime,palette}};
  const out=runtimeConfig(cfg);
  assert.deepEqual(out.palette,palette);assert.notEqual(out.palette,palette);
  delete out.palette;assert.deepEqual(out,headRuntimeConfig(cfg));
});

test('F1.sceneCtx and F1.scene hand scenes n, w, C, W, PAL and FONT; {S, D} destructuring still works',()=>{
  const ctx=F1.sceneCtx('vonis',S,D);
  assert.deepEqual(Object.keys(ctx).sort(),['C','D','FONT','PAL','S','W','id','n','w']);
  assert.equal(ctx.n,F1.n);assert.equal(ctx.C,F1.cine);assert.equal(ctx.W,F1.world);assert.equal(ctx.PAL,F1.PAL);
  assert.equal(ctx.w('ditutup'),F1.wordFrame(S,'ditutup'));assert.equal(ctx.w('Cuti',0),F1.wordFrame(S,'Cuti',0));
  assert.deepEqual({...ctx.FONT},{mono:"'JetBrains Mono', monospace",osw:'Oswald, sans-serif'});
  const rt=createRuntime();rt.F1.morph=()=>{};
  let seen,destructured;
  rt.F1.scene('vonis',(f,c)=>{seen=c;const {S:s,D:d}=c;destructured=[s,d];return '';});
  assert.equal(seen.id,'vonis');assert.equal(seen.D,destructured[1]);assert.equal(seen.S.id,'vonis');
  for(const k of ['n','w','C','W','PAL','FONT']) assert.ok(seen[k],k);
});

test('C.card draws a sourced paper or dark card and nothing before its cue',()=>{
  const base={at:20,x:60,y:300,w:700,kicker:'CEK',big:'KONTRAK ≤ 4 TAHUN',sub:'sub',src:'UU 27/2026 Pasal 82'};
  assert.equal(F1.cine.card(10,base),'');
  for(const tone of ['paper','dark']) for(const f of frames){
    const html=F1.cine.card(f,{...base,tone});
    if(f>=20.5) assert.ok(html.length>0&&html.includes('Sumber: UU 27/2026 Pasal 82')&&html.includes('KONTRAK'),`${tone} f=${f}`);
    if(html) clean(html,`card ${tone} f=${f}`);
  }
  assert.ok(F1.cine.card(60,{...base,tone:'dark'}).includes(F1.PAL.ink));
  assert.ok(!F1.cine.card(60,{at:20,x:0,y:0,w:300,big:'x'}).includes('Sumber'));
});

test('W.checklist ticks items on their frames and stays NaN-free',()=>{
  const ticks=[F1.wordFrame(S,'Stempel'),F1.wordFrame(S,'kasus'),F1.wordFrame(S,'utuh')];
  const items=[{t:'SATU',s:'kecil',src:'UU 1'},{t:'DUA',color:'#d0413a'},{t:'TIGA',src:'UU 3'}];
  for(const tone of ['paper','dark']) for(const f of frames){
    const html=F1.world.checklist(f,{x:90,y:330,w:900,title:'CEK HAK',items,ticks,tone});
    assert.ok(html.length>0&&html.includes('CEK HAK')&&html.includes('SATU')&&html.includes('Sumber: UU 3'));
    clean(html,`checklist ${tone} f=${f}`);
  }
  const early=F1.world.checklist(0,{items,ticks,tone:'paper'}),late=F1.world.checklist(D,{items,ticks,tone:'paper'});
  assert.equal((early.match(/<path/g)||[]).length,0);assert.equal((late.match(/<path/g)||[]).length,3);
  assert.ok(F1.world.checklist(D,{items,ticks,tone:'dark',check:'#123456'}).includes('#123456'));
  assert.equal((F1.world.checklist(0,{items}).match(/<path/g)||[]).length,3); // no tick frames: shown ticked
});

test('C.verdict slams on its anchor, reads the case id and name, and is continuous in f',()=>{
  const opts={at:'word:ditutup',ask:{cue:'word:Cuti',kicker:'TULIS DI KOMENTAR',big:'CUTI TAHUNANMU<br>MASIH UTUH?',sub:'sub',hot:[{t:'UTUH',at:'word:utuh',color:'#7fd0c4'}]},slogan:'EMAS = <b>JANGKA PANJANG</b>',source:'word:Tulis'};
  const ditutup=F1.wordFrame(S,'ditutup');
  assert.equal(F1.cine.verdict(ditutup-8,S,opts),'');
  for(const f of frames){
    const html=F1.cine.verdict(f,S,opts);
    if(f>=ditutup-5) assert.ok(html.length>0,`f=${f}`);
    if(html){clean(html,`verdict f=${f}`);assert.ok(html.includes('KASUS DITUTUP')&&html.includes('KASUS #11 · CUTI BERSAMA'));}
  }
  const end=F1.cine.verdict(D,S,opts);
  assert.ok(end.includes('SUMBER LENGKAP DI DESKRIPSI')&&end.includes('TULIS DI KOMENTAR')&&end.includes('>UTUH</span>')&&end.includes('JANGKA PANJANG')&&end.includes(F1.cine.ACCENT));
  assert.ok(end.includes('color:#7fd0c4'));
  assert.ok(F1.cine.verdict(F1.wordFrame(S,'Cuti'),S,{...opts}).includes('color:#fff">UTUH'));
  // frame anchors, custom stamp/bg/top, no ask, no source, no name
  const plain=F1.cine.verdict(D,S,{at:ditutup,bg:'#eaf1f5',top:330,gap:22,stamp:'KASUS DITUTUP SEMENTARA',name:'',source:false});
  clean(plain,'plain verdict');assert.ok(plain.includes('SEMENTARA')&&plain.includes('#eaf1f5')&&plain.includes('top:330px')&&!plain.includes('SUMBER'));
  assert.ok(plain.includes('>KASUS #11</div>'));
  // case name comes from C.CASE.name when not given; id and name from the runtime config
  const rt=createRuntime({config:{case:{id:'KASUS #02',steps:5,name:'RUPIAH'}}});
  assert.ok(rt.F1.cine.verdict(D,rt.F1.section('vonis'),{at:ditutup}).includes('KASUS #02 · RUPIAH'));
});

test('C.cover is a z 50 full-bleed card inside y 240-1680, 4 frames after the last word by default',()=>{
  const lastEnd=F1.line(S,S.lines.length-1).end;
  const opts={lines:[{t:'Cuti Bersama',size:128},{t:'Tak Potong'},{t:'Cuti',accent:'Tahunan?'},{t:'',accent:'ONLY'}],art:'<svg width="10" height="10"></svg>'};
  assert.equal(F1.cine.cover(lastEnd+3,S,opts),'');
  for(const f of frames){
    const html=F1.cine.cover(f,S,opts);
    if(f>=lastEnd+4.5) assert.ok(html.length>0,`f=${f}`);
    if(html){clean(html,`cover f=${f}`);assert.ok(html.includes('z-index:50')&&html.includes('padding:240px 40px')&&html.includes('KASUS #11'));}
  }
  const end=F1.cine.cover(D,S,opts);
  assert.ok(end.includes('Cuti Bersama')&&end.includes('Tahunan?')&&end.includes('font-size:128px')&&end.includes('font-size:118px')&&end.includes('<svg width="10"'));
  assert.ok(end.includes(F1.PAL.bg)&&end.includes(F1.PAL.red));
  assert.ok(F1.cine.cover(D,S,{...opts,at:'word:ditutup',bg:'#dfe8ee',stamp:'HOTWIZZ #03',accent:'#123456',gap:40}).includes('HOTWIZZ #03'));
  assert.equal(F1.cine.cover(F1.wordFrame(S,'ditutup')+1,S,{...opts,at:'word:ditutup'}).length>0,true);
  assert.ok(F1.cine.cover(D,S,{lines:[{t:'A & B <x>'}]}).includes('A &amp; B &lt;x&gt;'));
});

test('the kit helpers never use f % N, timers, Math.random, Date or CSS animation',()=>{
  for(const name of ['core.js','world.js','cine.js']){
    const code=readFileSync(join(DIR,name),'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
    assert.ok(!/Math\.random|Date\.now|new Date|performance\.now|requestAnimationFrame|setTimeout|setInterval|@keyframes|animation:|transition:/.test(code),name);
  }
  const added=readFileSync(join(DIR,'world.js'),'utf8').split('W.drift =')[1];
  assert.ok(!/\bf\s*%/.test(added));
  const cine=readFileSync(join(DIR,'cine.js'),'utf8').split('kit: card, verdict, cover')[1];
  assert.ok(!/\bf\s*%/.test(cine));
});
