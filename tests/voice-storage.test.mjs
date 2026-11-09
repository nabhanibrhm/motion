import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ensureVoice } from '../src/pipeline/voice.mjs';
import { stageFile, clean } from '../src/pipeline/storage.mjs';
async function fixture() {
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'motion-voice-test-')), id='demo';
  const legacy=path.join(root,'legacy'), episodeDir=path.join(root,'episode'), voiceDir=path.join(root,'.cache','voice',id);
  const narration={source:'supertonic',speakers:{},sections:[{id:'part',lines:[]}]};
  for(const dir of ['voiceover/.cache','src/data','public/voice/demo']) await fs.mkdir(path.join(legacy,dir),{recursive:true});
  await fs.mkdir(path.join(root,'tools/voice'),{recursive:true});
  await fs.writeFile(path.join(root,'tools/voice/generate.py'),'v1'); await fs.writeFile(path.join(root,'requirements-lock.txt'),'numpy==2.5.4\n');
  await fs.writeFile(path.join(root,'tools/voice/versions.json'),JSON.stringify({assembly:1,align:1,pitch:1,cartesia:1}));
  await fs.writeFile(path.join(legacy,'voiceover/demo.json'),JSON.stringify(narration));
  await fs.writeFile(path.join(legacy,'src/data/demo-voice.json'),JSON.stringify({sections:[{id:'part',audio:'voice/demo/part.mp3'}]}));
  await fs.writeFile(path.join(legacy,'public/voice/demo/part.mp3'),'audio'); await fs.writeFile(path.join(legacy,'voiceover/.cache/chunk.wav'),'chunk');
  const ctx={repoRoot:root,episodeDir,id,narration,config:{},paths:{voiceDir,voiceManifest:path.join(voiceDir,'manifest.json'),voiceState:path.join(voiceDir,'state.json'),chunkCacheDir:path.join(root,'.cache/voice/chunks'),buildDir:path.join(root,'.cache/build/demo'),stillsDir:path.join(root,'.cache/stills/demo')}};
  return {root,ctx,legacy};
}
test('imports unchanged bytes, detects output and generator-version changes',async()=>{const {root,ctx,legacy}=await fixture();try {
  assert.equal((await ensureVoice(ctx,{importLegacy:legacy})).cacheHit,false);
  assert.equal(await fs.readFile(path.join(ctx.paths.voiceDir,'voice/demo/part.mp3'),'utf8'),'audio');
  assert.equal(await fs.readFile(path.join(ctx.paths.voiceDir,'legacy-chunks/chunk.wav'),'utf8'),'chunk');
  assert.equal((await ensureVoice(ctx)).cacheHit,true);
  await fs.writeFile(ctx.paths.voiceDir+'/voice/demo/part.mp3','changed'); await assert.rejects(ensureVoice(ctx),/stale/);
  await ensureVoice(ctx,{importLegacy:legacy,force:true}); await fs.writeFile(root+'/tools/voice/generate.py','v2'); assert.equal((await ensureVoice(ctx)).cacheHit,true);
  await fs.writeFile(root+'/tools/voice/versions.json',JSON.stringify({assembly:2,align:1,pitch:1,cartesia:1})); await assert.rejects(ensureVoice(ctx),/stale for demo \(inputs\.versions\.assembly 1 -> 2\)/);
}finally{await fs.rm(root,{recursive:true,force:true});}});
test('rejects traversal and concurrent lock',async()=>{const {root,ctx,legacy}=await fixture();try {
  await fs.writeFile(legacy+'/src/data/demo-voice.json',JSON.stringify({sections:[{id:'part',audio:'voice/demo/../part.mp3'}]}));
  await assert.rejects(ensureVoice(ctx,{importLegacy:legacy}),/Invalid voice path/);
  await fs.mkdir(ctx.paths.voiceDir+'.lock'); await assert.rejects(ensureVoice(ctx),/already running/);
}finally{await fs.rm(root,{recursive:true,force:true});}});
test('stage replacement and scoped cleanup preserve imported voice',async()=>{const {root,ctx,legacy}=await fixture();try {
  await ensureVoice(ctx,{importLegacy:legacy}); const src=root+'/source',dst=root+'/dest'; await fs.writeFile(src,'original'); await stageFile(src,dst); await fs.writeFile(src,'new'); await stageFile(src,dst,{mutable:true}); assert.equal(await fs.readFile(dst,'utf8'),'new');
  await fs.mkdir(ctx.paths.buildDir,{recursive:true}); const dry=await clean(ctx,{target:'all'}); assert.equal(dry.paths.length,2); await fs.access(ctx.paths.buildDir); await clean(ctx,{target:'all',execute:true}); await fs.access(ctx.paths.voiceManifest); await assert.rejects(fs.access(ctx.paths.buildDir));
  ctx.paths.buildDir=root; await assert.rejects(clean(ctx,{target:'build',execute:true}),/Unsafe/);
}finally{await fs.rm(root,{recursive:true,force:true});}});
test('asset snapshot stages references and detects removals without writing in check mode',async()=>{const {root,ctx,legacy}=await fixture();try {
  await ensureVoice(ctx,{importLegacy:legacy}); ctx.config={audio:{bed:null}};
  ctx.paths.sharedAssetsDir=root+'/assets/shared'; ctx.paths.episodeAssetsDir=root+'/assets/episode';
  await fs.mkdir(ctx.paths.sharedAssetsDir+'/sfx',{recursive:true}); await fs.mkdir(ctx.paths.buildDir,{recursive:true});
  await fs.writeFile(ctx.paths.sharedAssetsDir+'/sfx/used.wav','used'); await fs.writeFile(ctx.paths.sharedAssetsDir+'/sfx/unused.wav','unused');
  await fs.writeFile(ctx.paths.buildDir+'/index.html',"<script>F1.asset('sfx/used.wav')</script>");
  const {stageAssets}=await import('../src/pipeline/storage.mjs');
  assert.equal((await stageAssets(ctx,{check:true})).current,false); await assert.rejects(fs.access(ctx.paths.buildDir+'/public'));
  await stageAssets(ctx); await fs.access(ctx.paths.buildDir+'/public/sfx/used.wav'); await assert.rejects(fs.access(ctx.paths.buildDir+'/public/sfx/unused.wav'));
  assert.equal((await stageAssets(ctx,{check:true})).current,true); await fs.writeFile(ctx.paths.buildDir+'/index.html','none');
  assert.equal((await stageAssets(ctx,{check:true})).current,false); await fs.access(ctx.paths.buildDir+'/public/sfx/used.wav');
  await stageAssets(ctx); await assert.rejects(fs.access(ctx.paths.buildDir+'/public/sfx/used.wav'));
} finally {await fs.rm(root,{recursive:true,force:true});}});
