import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {createContext, Script} from 'node:vm';

/** The fixed palette keys of `runtime.palette` (the keys of DEFAULT_PAL in src/runtime/f1/core.js; a test keeps them equal). */
export const PALETTE_KEYS=Object.freeze(['bg','paper','ink','muted','source','red','accent','teal','tealDark','drift','haze']);
export function runtimeConfig(config) {
  const out={profile:config.runtime.profile,case:config.runtime.case,captions:{maxWords:config.runtime.profile==='legacy-inflasi'?4:6}};
  // Opt-in (theme) watermark; omitted when unset so existing episodes keep an identical F1.CONFIG.
  if(config.runtime.watermark) out.watermark=structuredClone(config.runtime.watermark);
  // Opt-in palette (episode or theme); omitted when unset so F1.PAL stays the defaults and F1.CONFIG identical.
  if(config.runtime.palette) out.palette=structuredClone(config.runtime.palette);
  return out;
}
/** Fresh globals on every call, including when multiple episodes build in one process. */
export function loadTiming(ctx, voice, {warnings=[]}={}) {
  const sandbox=createContext({F1:{VOICE:structuredClone(voice),CONFIG:runtimeConfig(ctx.config)},console:{warn:message=>warnings.push(message)}});
  const path=join(ctx.repoRoot,'src/runtime/f1/timing.js');
  new Script(readFileSync(path,'utf8'),{filename:path}).runInContext(sandbox,{timeout:5000});
  return sandbox.F1;
}
