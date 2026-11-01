import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import os from 'node:os';
import { planRetirement, retire } from '../scripts/retire-legacy.mjs';
const ids=['inflasi','rupiah','ihsg','paylater','judol','emas','kelas'];
const digest=b=>createHash('sha256').update(b).digest('hex');
function fixture() {
  const root=mkdtempSync(path.join(os.tmpdir(),'retire-test-'));
  const put=(p,v)=>{const f=path.join(root,p);mkdirSync(path.dirname(f),{recursive:true});writeFileSync(f,v);return {path:p,bytes:Buffer.byteLength(v),sha256:digest(v)};};
  const baseline=[],mappings=[],outputs=[];
  put(process.platform==='win32'?'.venv/Scripts/python.exe':'.venv/bin/python','python');
  put('package.json',JSON.stringify({devDependencies:{hyperframes:'0.8.210'}}));put('package-lock.json',JSON.stringify({packages:{'node_modules/hyperframes':{version:'0.8.210'}}}));put('requirements-lock.txt','x');
  put('node_modules/hyperframes/package.json',JSON.stringify({version:'0.8.210'})); put('node_modules/.package-lock.json',JSON.stringify({packages:{'node_modules/hyperframes':{version:'0.8.210'}}})); put('.venv/pyvenv.cfg','version = 3.12.0'); put('.venv/Lib/site-packages/module.py','x'); put('.venv/Lib/site-packages/demo-1.dist-info/METADATA','Name: demo\nVersion: 1\n');
  for(const id of ids){
    const prefix=`out/Ekonomi_keuangan/${id}`, manifest=JSON.stringify({sections:[{id:'part',audio:`voice/${id}/part.mp3`}]}), text=`scene ${id}`;
    for(const [p,v] of [[`${prefix}/scene.html`,text],[`${prefix}/src/data/${id}-voice.json`,manifest],[`${prefix}/public/voice/${id}/part.mp3`,'audio'],[`${prefix}/voiceover/narration.json`,'source']])baseline.push(put(p,v));
    put(`${prefix}/voiceover/.cache/key.wav`,'cache');put(`.cache/voice/${id}/legacy-chunks/key.wav`,'cache');put(`.cache/voice/${id}/manifest.json`,manifest);put(`.cache/voice/${id}/voice/${id}/part.mp3`,'audio');
    put(`${prefix}/node_modules/hyperframes/package.json`,JSON.stringify({version:'0.8.210'})); put(`${prefix}/node_modules/.package-lock.json`,JSON.stringify({packages:{'node_modules/hyperframes':{version:'0.8.210'}}}));put(`${prefix}/.venv/pyvenv.cfg`,'version = 3.12.0');put(`${prefix}/.venv/Lib/site-packages/module.py`,'x');put(`${prefix}/.venv/Lib/site-packages/demo-1.dist-info/METADATA`,'Name: demo\nVersion: 1\n');put(`${prefix}/renders/old.mp4`,'old');
    const target=put(`episodes/${id}/scene.html`,text);mappings.push({source:`${prefix}/scene.html`,target:target.path,bytes:target.bytes,sha256:target.sha256}); outputs.push(target);
  }
  const archive=put('.cache/migration-baseline/legacy-source.zip','archive');const base=put('.cache/migration-baseline/source-hashes.json',JSON.stringify(baseline));
  put('docs/refactor-migration.json',JSON.stringify({schemaVersion:1,episodes:ids,archive,baseline:base,mappings,outputs}));
  return {root,put};
}
test('preflight plans bounded paths and preserves rendered videos',()=>{const {root}=fixture();try {const plan=planRetirement(root);assert.ok(plan.paths.length>0);assert.ok(plan.paths.every(x=>x.path.startsWith('out/Ekonomi_keuangan/')));assert.ok(plan.paths.every(x=>!x.path.includes('/renders')));assert.equal(existsSync(path.join(root,'out/Ekonomi_keuangan/kelas/scene.html')),true);retire(root,{execute:true});assert.equal(existsSync(path.join(root,'out/Ekonomi_keuangan/kelas/renders/old.mp4')),true);assert.equal(existsSync(path.join(root,'.cache/voice/kelas/legacy-chunks/key.wav')),true);}finally{rmSync(root,{recursive:true,force:true});}});
test('changed original aborts before deletion',()=>{const {root,put}=fixture();try{put('out/Ekonomi_keuangan/inflasi/scene.html','edit');assert.throws(()=>retire(root,{execute:true}),/Verification failed/);assert.ok(existsSync(path.join(root,'out/Ekonomi_keuangan/kelas/scene.html')));}finally{rmSync(root,{recursive:true,force:true});}});
test('changed archive and unknown authored file block retirement',()=>{const {root,put}=fixture();try{put('.cache/migration-baseline/legacy-source.zip','altered');assert.throws(()=>planRetirement(root),/Verification failed/);}finally{rmSync(root,{recursive:true,force:true});} const b=fixture();try{b.put('out/Ekonomi_keuangan/kelas/new.txt','custom');assert.throws(()=>planRetirement(b.root),/Unknown legacy file/);}finally{rmSync(b.root,{recursive:true,force:true});}});
test('different cached speech or dependencies aborts preflight',()=>{const a=fixture();try {a.put('.cache/voice/judol/legacy-chunks/key.wav','wrong'); assert.throws(()=>planRetirement(a.root),/Dependency copy differs/);}finally{rmSync(a.root,{recursive:true,force:true});} const b=fixture();try {b.put('out/Ekonomi_keuangan/emas/node_modules/.package-lock.json',JSON.stringify({packages:{'node_modules/hyperframes':{version:'0.1'}}})); assert.throws(()=>planRetirement(b.root),/Node package metadata differs/);}finally{rmSync(b.root,{recursive:true,force:true});}});
