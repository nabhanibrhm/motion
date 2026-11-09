/**
 * Wrapped scenes: `{ "id": "cek", "file": "scenes/cek.js", "bg": "#dfe8ee", "sfx": [{"at":"word:empat","file":"click","vol":0.22}] }`.
 * The `.js` file holds only the scene body and one `scene((f, ctx) => markup, opts?)` call; the wrapper emits the same
 * HyperFrames composition skeleton the hand-written `.html` scenes use (template, f1.css, #root background, art layer,
 * SFX <audio> clips, registering script). build.mjs later rewrites each data-at into a resolved data-start.
 */
import {existsSync} from 'node:fs';
import {within} from '../config/episodes.mjs';
import {cueSpec} from './hotwizz.mjs';

export const SCENE_BG=/^#[0-9a-fA-F]{6}$/;
export const SFX_NAME=/^[a-z0-9][a-z0-9_-]*$/i;
export const MAX_SFX=16;
export const DEFAULT_BG='#000000';
export const DEFAULT_SFX_VOL=0.2;
export const isWrappedScene=scene=>typeof scene?.file==='string'&&/\.js$/i.test(scene.file);
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

/** Anchor spec of an sfx entry: "word:x", "line:1", a frame number, or a bare word. */
export const sfxSpec=at=>cueSpec(at);

/** Unique across the episode: one block of 16 tracks per scene, starting above the voice (10) and caption tracks. */
export const sfxTrack=(index,k)=>20+index*MAX_SFX+k;

/** Errors for a scene entry's `bg` / `sfx` (shape and files); anchors are returned for the timing check. */
export function checkWrapperOptions(scene,ctx) {
  const errors=[],anchors=[];
  if(scene.bg!==undefined&&!(typeof scene.bg==='string'&&SCENE_BG.test(scene.bg))) errors.push(`${scene.id}: bg must be a #rrggbb colour`);
  if(scene.sfx===undefined) return {errors,anchors};
  if(!Array.isArray(scene.sfx)) {errors.push(`${scene.id}: sfx must be an array`);return {errors,anchors};}
  if(scene.sfx.length>MAX_SFX) errors.push(`${scene.id}: at most ${MAX_SFX} sfx entries per scene`);
  scene.sfx.forEach((e,k)=>{
    const where=`${scene.id}: sfx[${k}]`;
    if(!e||typeof e!=='object'||Array.isArray(e)) {errors.push(`${where} must be an object {at, file, vol?}`);return;}
    const at=e.at;
    if(!((typeof at==='string'&&at.trim())||(Number.isFinite(at)&&at>=0))) errors.push(`${where}.at must be a word, anchor ("word:x", "line:1") or frame`);
    else anchors.push(sfxSpec(at));
    if(typeof e.file!=='string'||!SFX_NAME.test(e.file)) errors.push(`${where}.file must be a sound name like "click" (no folder or extension)`);
    else {
      try {
        const name=`sfx/${e.file}.wav`;
        if(!existsSync(within(ctx.paths.episodeAssetsDir,name))&&!existsSync(within(ctx.paths.sharedAssetsDir,name))) errors.push(`${where}.file: missing ${name} in assets/shared or the episode assets`);
      } catch(err) {errors.push(`${where}.file: ${err.message}`);}
    }
    if(e.vol!==undefined&&!(Number.isFinite(e.vol)&&e.vol>=0&&e.vol<=1)) errors.push(`${where}.vol must be 0..1`);
  });
  return {errors,anchors};
}

/**
 * Static checks of a `.js` scene body: exactly one scene( call, nothing that closes the wrapper.
 * Returns {errors, anchors}; anchors are `w("x"[, n])` words and every "word:..." / "line:..." string literal.
 */
export function checkWrappedSource(scene,source) {
  const errors=[],anchors=[],id=scene.id;
  const code=source.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[\s;{}()])\/\/.*$/gm,'$1'); // comments may mention scene(
  const calls=[...code.matchAll(/(?<![\w$.])scene\s*\(/g)].length;
  if(calls!==1) errors.push(`${id}: a .js scene needs exactly one scene(...) call, found ${calls}`);
  if(/<\/(?:script|template)/i.test(source)) errors.push(`${id}: a .js scene must not contain </script> or </template>`);
  if(/\b(?:const|let|var|function)\s+scene\b/.test(code)) errors.push(`${id}: a .js scene must not redeclare "scene"`);
  for(const m of source.matchAll(/(?<![\w$])w\(\s*(["'`])([^"'`$\\]+?)\1(?:\s*,\s*(\d+))?\s*\)/g)) anchors.push(`word:${m[2]}${m[3]?`#${m[3]}`:''}`);
  for(const m of source.matchAll(/(["'`])((?:word|line):[^"'`$\\]*?)\1/g)) anchors.push(m[2]);
  return {errors,anchors};
}

/** The full composition for a wrapped scene. `source` is the .js body. */
export function wrapScene(scene,index,source) {
  const id=scene.id, bg=scene.bg??DEFAULT_BG;
  const audio=(scene.sfx||[]).map((e,k)=>`    <audio data-hf-media-start-basis="local" data-start="0" id="${id}-sfx-${k}" class="clip" src="public/sfx/${e.file}.wav" data-at="${esc(sfxSpec(e.at))}" data-track-index="${sfxTrack(index,k)}" data-volume="${e.vol??DEFAULT_SFX_VOL}"></audio>\n`).join('');
  return `<template>
  <link rel="stylesheet" href="lib/f1/f1.css" />
  <style>
    #root {
      position: absolute;
      inset: 0;
      background: ${bg};
      overflow: hidden;
    }
  </style>
  <div id="root" data-composition-id="${id}" data-width="1080" data-height="1920">
    <div id="${id}-art" class="f1-layer"></div>
${audio}  </div>
  <script>(()=>{const scene=(render,opts)=>{window.__timelines["${id}"]=F1.scene("${id}",render,opts);};
${source.replace(/\n$/,'')}
})();</script>
</template>
`;
}
