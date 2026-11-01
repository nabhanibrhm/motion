import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {createContext, Script} from 'node:vm';

export function runtimeConfig(config) {
  return {profile:config.runtime.profile,case:config.runtime.case,captions:{maxWords:config.runtime.profile==='legacy-inflasi'?4:6}};
}
/** Fresh globals on every call, including when multiple episodes build in one process. */
export function loadTiming(ctx, voice, {warnings=[]}={}) {
  const sandbox=createContext({F1:{VOICE:structuredClone(voice),CONFIG:runtimeConfig(ctx.config)},console:{warn:message=>warnings.push(message)}});
  const path=join(ctx.repoRoot,'src/runtime/f1/timing.js');
  new Script(readFileSync(path,'utf8'),{filename:path}).runInContext(sandbox,{timeout:5000});
  return sandbox.F1;
}
