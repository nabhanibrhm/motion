/**
 * HotWizz Flash templates: data-only scenes for breaking-news shorts (see README "HotWizz Flash").
 * Each entry validates its props (returning error strings plus the anchor specs to check) and renders a
 * HyperFrames composition that inlines the browser kit (hotwizz-kit.js) and calls F1.hw.draw.
 *
 * Cues: a plain word ("resmi") means word:resmi; "word:x#1", "line:2", "line:1:end", "word:x+6" and frame numbers
 * are passed to F1.at unchanged. Photos are asset paths ("people/<slug>.jpg") resolved in the episode's assets/
 * first, then assets/shared/; a photo always needs a credit string. Use photo null for the silhouette.
 */
import {readFileSync,existsSync} from 'node:fs';
import {within} from '../config/episodes.mjs';

const KIT=readFileSync(new URL('./hotwizz-kit.js',import.meta.url),'utf8');
const str=v=>typeof v==='string'&&v.trim().length>0;
const obj=v=>v&&typeof v==='object'&&!Array.isArray(v);
export const cueSpec=v=>v===undefined||v===null?null:typeof v==='number'?String(v):/^(?:word:|line:|\d)/.test(v.trim())?v.trim():`word:${v.trim()}`;

const SFX={pop:'sfx/pop-in.wav',stamp:'sfx/stamp.wav',swoosh:'sfx/swoosh-soft.wav',ding:'sfx/ding.wav',whoosh:'sfx/whoosh.wav'};
const COVER_STYLES=['kicker','big','text','chip','cta'];
/** hw-art icons (monoline, drawn in hotwizz-kit.js ICONS). */
export const ART=['istana','dpr','gavel','dokumen','kotak-suara','uang','hp','kalender'];

/** Shared prop checker. `spec` maps key -> 'text' | 'text?' | 'cue' | 'bool' | 'int' | 'person' | 'person?' | fn. */
function checker(name,id,props,ctx,spec) {
  const errors=[],anchors=[];
  const at=`${id} (${name})`;
  const err=m=>errors.push(`${at}: ${m}`);
  if(!obj(props)) {err('props must be an object');return {errors,anchors};}
  for(const key of Object.keys(props)) if(!Object.hasOwn(spec,key)) err(`unknown prop "${key}"`);
  const cue=(v,where)=>{
    if(v===undefined||v===null) return;
    if(!(str(v)||(Number.isFinite(v)&&v>=0))) {err(`${where} must be a word, anchor or frame`);return;}
    anchors.push(cueSpec(v));
  };
  const text=(v,where,req)=>{if(v===undefined&&!req) return;if(!str(v)) err(`${where} must be a nonempty string`);};
  const personCheck=(p,where)=>{
    if(!obj(p)) {err(`${where} must be an object {name, role?, status?, photo?, credit?}`);return;}
    for(const key of Object.keys(p)) if(!['name','role','status','photo','credit'].includes(key)) err(`${where}.${key} is not supported`);
    text(p.name,`${where}.name`,true);text(p.role,`${where}.role`);text(p.status,`${where}.status`);
    if(p.photo!==undefined&&p.photo!==null) {
      if(!str(p.photo)||!/\.(?:jpe?g|png|webp)$/i.test(p.photo)||p.photo.startsWith('public/')) err(`${where}.photo must be an asset path like people/<slug>.jpg`);
      else try {
        if(!existsSync(within(ctx.paths.episodeAssetsDir,p.photo))&&!existsSync(within(ctx.paths.sharedAssetsDir,p.photo))) err(`missing photo asset ${p.photo}`);
      } catch(e) {err(e.message);}
      if(!str(p.credit)) err(`${where}.credit is required with a photo (author/source and licence)`);
    } else text(p.credit,`${where}.credit`);
  };
  for(const [key,kind] of Object.entries(spec)) {
    const v=props[key];
    if(kind==='text') text(v,key,true);
    else if(kind==='text?') text(v,key,false);
    else if(kind==='cue') cue(v,key);
    else if(kind==='bool') {if(v!==undefined&&typeof v!=='boolean') err(`${key} must be true or false`);}
    else if(kind==='int') {if(v!==undefined&&!(Number.isSafeInteger(v)&&v>=1&&v<=(ctx.config.runtime?.case?.steps??99))) err(`${key} must be an integer 1..runtime.case.steps`);}
    else if(kind==='person') personCheck(v,key);
    else if(typeof kind==='function') kind(v,{err,cue,text,personCheck});
  }
  return {errors,anchors};
}
const common={label:'text?',step:'int',sfx:'bool'};
const itemList=(min,max,{source})=>(v,{err,cue,text},where='items')=>{
  if(!Array.isArray(v)||v.length<min||v.length>max) {err(`${where} must list ${min}-${max} items`);return;}
  v.forEach((it,i)=>{
    if(!obj(it)) {err(`${where}[${i}] must be an object {text, source, cue?}`);return;}
    for(const key of Object.keys(it)) if(!['text','source','cue'].includes(key)) err(`${where}[${i}].${key} is not supported`);
    text(it.text,`${where}[${i}].text`,true);text(it.source,`${where}[${i}].source`,source);cue(it.cue,`${where}[${i}].cue`);
  });
};
const side=(where,title)=>(v,tools)=>{
  if(!obj(v)) {tools.err(`${where} must be an object {title?, items}`);return;}
  for(const key of Object.keys(v)) if(!['title','items'].includes(key)) tools.err(`${where}.${key} is not supported`);
  tools.text(v.title,`${where}.title`);itemList(1,4,{source:false})(v.items,tools,`${where}.items`);
};

const photo=p=>p&&{...p,photo:p.photo?`public/${p.photo}`:null};
const items=list=>(list||[]).map(it=>({...it,cue:cueSpec(it.cue)}));

export const HOTWIZZ_TEMPLATES={
  'hw-hook':{
    type:'hook',
    spec:{...common,headline:'text',claim:'text',kicker:'text?',tag:'text?',search:'text?',person:'person',cue:'cue',introCover:'bool',
      stamp:(v,{err,cue,text})=>{if(v===undefined) return;if(!obj(v)) return err('stamp must be {text, cue}');text(v.text,'stamp.text',true);cue(v.cue,'stamp.cue');}},
    normalize:(p,ctx)=>({kicker:'UPDATE',label:p.kicker||'UPDATE',...p,person:photo(p.person),cue:cueSpec(p.cue),stamp:p.stamp?{text:p.stamp.text,cue:cueSpec(p.stamp.cue)}:null,introCover:p.introCover?introCover(ctx):null}),
    sfx:p=>[...(p.cue?[{at:p.cue,file:SFX.pop,volume:.18}]:[]),...(p.stamp?.cue?[{at:p.stamp.cue,file:SFX.stamp,volume:.2}]:[])],
  },
  'hw-resmi':{
    type:'resmi',
    spec:{...common,title:'text?',kicker:'text?',items:itemList(2,4,{source:true})},
    normalize:p=>({title:'YANG RESMI',kicker:'TERKONFIRMASI',label:'YANG RESMI',...p,items:items(p.items)}),
    sfx:p=>[{at:'0',file:SFX.swoosh,volume:.18},...p.items.filter(it=>it.cue).map(it=>({at:it.cue,file:SFX.pop,volume:.14}))],
  },
  'hw-split':{
    type:'split',
    spec:{...common,headline:'text?',kicker:'text?',source:'text?',left:side('left'),right:side('right'),
      toggle:(v,{err,text})=>{if(v===undefined) return;if(!obj(v)) return err('toggle must be {left, right}');for(const key of Object.keys(v)) if(!['left','right'].includes(key)) err(`toggle.${key} is not supported`);text(v.left,'toggle.left',true);text(v.right,'toggle.right',true);}},
    normalize:p=>({kicker:'PETA FAKTA',label:'RESMI VS BELUM JELAS',...p,left:{title:'RESMI',...p.left,items:items(p.left.items)},right:{title:'BELUM JELAS',...p.right,items:items(p.right.items)}}),
    sfx:p=>[{at:'0',file:SFX.swoosh,volume:.18},...[...p.left.items,...p.right.items].filter(it=>it.cue).map(it=>({at:it.cue,file:SFX.pop,volume:.12}))],
  },
  'hw-quote':{
    type:'quote',
    spec:{...common,person:'person',quote:'text',source:'text',date:'text?',kicker:'text?',cue:'cue'},
    normalize:p=>({kicker:'PERNYATAAN',label:'KATA MEREKA',...p,person:photo(p.person),cue:cueSpec(p.cue)}),
    sfx:p=>[{at:'0',file:SFX.swoosh,volume:.18},...(p.cue?[{at:p.cue,file:SFX.pop,volume:.14}]:[])],
  },
  'hw-number':{
    type:'number',
    spec:{...common,value:'text',unit:'text?',caption:'text',source:'text',kicker:'text?',cue:'cue',countUp:'bool'},
    normalize:p=>({kicker:'ANGKA',label:'ANGKA',countUp:true,...p,cue:cueSpec(p.cue)}),
    sfx:p=>[{at:'0',file:SFX.swoosh,volume:.18},...(p.cue?[{at:p.cue,file:SFX.ding,volume:.14}]:[])],
  },
  'hw-art':{
    type:'art',
    spec:{...common,art:(v,{err})=>{if(!ART.includes(v)) err(`art must be one of ${ART.join('|')}`);},headline:'text',sub:'text?',kicker:'text?',source:'text?',stamp:'text?',cue:'cue'},
    normalize:p=>({kicker:'KONTEKS',label:p.kicker||'KONTEKS',...p,cue:cueSpec(p.cue)}),
    sfx:p=>[{at:'0',file:SFX.swoosh,volume:.18},...(p.cue?[{at:p.cue,file:SFX.pop,volume:.14}]:[]),...(p.stamp?[{at:p.cue?`${p.cue}+9`:'36',file:SFX.stamp,volume:.2}]:[])],
  },
  'hw-cover':{
    type:'cover',
    spec:{...common,footer:'text?',coverAt:'cue',loop:'bool',
      lines:(v,{err,cue,text})=>{
        if(v===undefined) return;
        if(!Array.isArray(v)||v.length>6) return err('lines must list 0-6 items');
        v.forEach((l,i)=>{if(!obj(l)) return err(`lines[${i}] must be {text, cue?, style?}`);for(const key of Object.keys(l)) if(!['text','cue','style'].includes(key)) err(`lines[${i}].${key} is not supported`);text(l.text,`lines[${i}].text`,true);cue(l.cue,`lines[${i}].cue`);if(l.style!==undefined&&!COVER_STYLES.includes(l.style)) err(`lines[${i}].style must be ${COVER_STYLES.join('|')}`);});
      },
      cover:(v,{err,text,personCheck})=>{if(v===undefined) return;if(!obj(v)) return err('cover must be {title, stamp?, chip?, person?}');for(const key of Object.keys(v)) if(!['title','stamp','chip','person'].includes(key)) err(`cover.${key} is not supported`);text(v.title,'cover.title',true);text(v.stamp,'cover.stamp');text(v.chip,'cover.chip');if(v.person!==undefined) personCheck(v.person,'cover.person');}},
    normalize:(p,ctx)=>({label:'PENUTUP',footer:`${ctx.config.runtime.case.id} · SUMBER DI DESKRIPSI`,...p,lines:(p.lines||[]).map(l=>({style:'big',...l,cue:cueSpec(l.cue)})),coverAt:cueSpec(p.coverAt),cover:p.cover?coverCard(p.cover,ctx):null,loopHook:p.loop?loopHook(ctx):null}),
    sfx:p=>[{at:'0',file:SFX.swoosh,volume:.18},...p.lines.filter(l=>l.cue).map(l=>({at:l.cue,file:SFX.pop,volume:.14}))],
  },
};

const coverCard=(c,ctx)=>({stamp:ctx.config.runtime.case.id,...c,person:c.person?photo(c.person):null});
/** introCover: the hw-hook opens on the episode's hw-cover title card (same card as the last frame), then reveals the
 * hook layout, so frame 0 = last frame = the TikTok cover. */
function introCover(ctx) {
  const s=(ctx.config.scenes||[]).find(x=>x.template==='hw-cover'&&obj(x.props?.cover));
  return s?coverCard(s.props.cover,ctx):null;
}
/** loop: the hw-cover tail redraws the episode's first hw-hook at its frame 0, so the last frame equals the first
 * (TikTok replays straight into the hook). Same seed/step as renderHotwizz gives that scene; cues that only fire later
 * (hook pop, a cued stamp) are dropped because they are not visible at frame 0. */
function loopHook(ctx) {
  const scenes=ctx.config.scenes||[];
  const i=scenes.findIndex(s=>s.template==='hw-hook');
  const s=scenes[i],h=HOTWIZZ_TEMPLATES['hw-hook'].normalize(s.props,ctx);
  return {seed:100+i*97,...h,step:s.props.step??Math.min(i+1,ctx.config.runtime.case.steps),cue:null,stamp:h.stamp&&h.stamp.cue===null?h.stamp:null};
}

export function checkHotwizz(scene,ctx) {
  const t=HOTWIZZ_TEMPLATES[scene.template];
  const r=checker(scene.template,scene.id,scene.props,ctx,t.spec);
  if(scene.template==='hw-cover'&&obj(scene.props)) {
    const at=`${scene.id} (hw-cover)`;
    if(scene.props.loop===true&&!(ctx.config.scenes||[]).some(s=>s.template==='hw-hook')) r.errors.push(`${at}: loop needs an hw-hook scene in the episode`);
    if(scene.props.loop===true&&(ctx.config.scenes||[]).some(s=>s.template==='hw-hook'&&s.props?.introCover===true)) r.errors.push(`${at}: use loop or the hook's introCover, not both`);
    if(scene.props.loop!==true&&scene.props.cover===undefined) r.errors.push(`${at}: cover must be {title, stamp?, chip?, person?} (or set loop: true)`);
  }
  if(scene.template==='hw-hook'&&scene.props?.introCover===true&&!(ctx.config.scenes||[]).some(s=>s.template==='hw-cover'&&obj(s.props?.cover))) r.errors.push(`${scene.id} (hw-hook): introCover needs an hw-cover scene with cover`);
  return r;
}

const attr=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
/** Render one hw-* scene; `index` is the scene's position (default progress step = index + 1). */
export function renderHotwizz(scene,ctx,index) {
  const t=HOTWIZZ_TEMPLATES[scene.template],id=scene.id;
  const {errors}=checkHotwizz(scene,ctx);
  if(errors.length) throw new Error(errors.join('\n'));
  const steps=ctx.config.runtime.case.steps;
  const p={seed:100+index*97,...t.normalize(scene.props,ctx)};
  p.step=scene.props.step??Math.min(index+1,steps);
  const sfx=p.sfx===false?[]:t.sfx(p);
  const audio=sfx.map((s,k)=>`<audio data-hf-media-start-basis="local" data-start="0" id="${id}-sfx-${k}" class="clip" src="public/${s.file}" data-at="${attr(s.at)}" data-track-index="${20+index*6+Math.min(k,5)}" data-volume="${s.volume}"></audio>`).join('\n    ');
  const data=JSON.stringify(p).replace(/</g,'\\u003c');
  return `<!-- GENERATED from template ${scene.template}. Edit the episode.json props, not this file. -->
<template>
  <link rel="stylesheet" href="lib/f1/f1.css" />
  <style>#root { position: absolute; inset: 0; background: #0b0b0c; overflow: hidden; }</style>
  <div id="root" data-composition-id="${id}" data-width="1080" data-height="1920">
    <div id="${id}-art" class="f1-layer"></div>
    ${audio}
  </div>
  <script>
${KIT}
(()=>{const p=${data}; window.__timelines["${id}"]=F1.scene("${id}",(f,ctx)=>F1.hw.draw("${t.type}",f,ctx,p));})();
  </script>
</template>
`;
}
