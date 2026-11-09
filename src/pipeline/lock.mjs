import {promises as fs,rmSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import {hostname} from 'node:os';
import {join} from 'node:path';
import {ID,within} from '../config/episodes.mjs';

// Locks (and stale-break guards) this process currently holds; released synchronously on a forced exit (second Ctrl-C).
const held=new Set();
export function releaseHeldLocksSync() {
  for(const lock of held) try{rmSync(lock,{recursive:true,force:true});}catch{}
  held.clear();
}
/** True when a process with this pid exists on this machine (EPERM means it exists but belongs to someone else). */
export function pidAlive(pid) {
  if(!Number.isInteger(pid)||pid<=0) return false;
  try{process.kill(pid,0);return true;}catch(e){return e.code==='EPERM';}
}
/** Owner of a lock directory, or null when it cannot be read (e.g. the owner is still writing owner.json). */
async function readOwner(lock) {
  try{const o=JSON.parse(await fs.readFile(join(lock,'owner.json'),'utf8'));return o&&typeof o==='object'&&!Array.isArray(o)?o:null;}catch{return null;}
}
/**
 * A lock left by a process that is gone: same host and platform (WSL and Windows can share a hostname but not a pid
 * namespace) and a pid that no longer exists. owner.json without `platform` predates the field, which was added
 * together with `host`, so it is judged by host alone.
 */
function abandoned(owner) {
  return !!owner&&owner.host===hostname()&&(owner.platform??process.platform)===process.platform
    &&Number.isInteger(owner.pid)&&!pidAlive(owner.pid);
}
// Breaking takes milliseconds; a guard older than this was left by a breaker that died mid-break.
const GUARD_STALE_MS=10_000;
const RETRY='retry';
/**
 * Remove a lock whose owner process is gone. Returns the owner when broken, RETRY when another process is breaking
 * it right now, else null. Breakers serialize on an atomic `<lock>.breaking` directory and read the owner only while
 * holding it, so one breaker can never remove a live lock that another breaker re-created after judging the old one dead.
 */
async function breakStale(lock) {
  const guard=`${lock}.breaking`;
  try{await fs.mkdir(guard);}catch(e){
    if(e.code!=='EEXIST') throw e;
    const st=await fs.stat(guard).catch(()=>null);
    if(st&&Date.now()-st.mtimeMs>GUARD_STALE_MS) await fs.rm(guard,{recursive:true,force:true});
    return RETRY;
  }
  held.add(guard);
  try{
    const owner=await readOwner(lock);
    if(!abandoned(owner)) return null;
    // Rename first so the lock path is free at once and nothing is ever deleted in place.
    const grave=`${lock}.stale-${process.pid}-${randomBytes(4).toString('hex')}`;
    try{await fs.rename(lock,grave);}catch(e){if(e.code==='ENOENT') return owner;throw e;}
    await fs.rm(grave,{recursive:true,force:true});
    return owner;
  }finally{held.delete(guard);await fs.rm(guard,{recursive:true,force:true});}
}

/**
 * Run work while holding the lock directory `lock` (its parent must exist). owner.json records pid, host, platform and
 * a random nonce; a lock whose owner died on this machine is broken (stale(owner) is logged), any other existing lock
 * throws busy(). The lock is registered for releaseHeldLocksSync and removed when work settles.
 */
export async function withLock(lock,work,{busy,stale,owner={},log=m=>console.warn(m)}) {
  for(let breaks=0,waits=0;;) {
    try{await fs.mkdir(lock);break;}catch(e){
      if(e.code!=='EEXIST') throw e;
      const r=breaks<3&&waits<40?await breakStale(lock):null;
      if(r===RETRY){waits++;await new Promise(ok=>setTimeout(ok,25));continue;}
      if(r){breaks++;log(stale(r));continue;}
      throw busy();
    }
  }
  held.add(lock);
  try{
    await fs.writeFile(join(lock,'owner.json'),JSON.stringify({pid:process.pid,host:hostname(),platform:process.platform,nonce:randomBytes(8).toString('hex'),...owner}));
    return await work();
  }finally{held.delete(lock);await fs.rm(lock,{recursive:true,force:true});}
}

/** Hold through compilation, capture and mastering; never break a lock whose owner may still be running. */
export async function withEpisodeLock(ctx,work,{log=m=>console.warn(m)}={}) {
  if(!ID.test(ctx.id)) throw new Error('Invalid episode lock id');
  const root=within(ctx.repoRoot,'.cache/locks'),lock=within(root,ctx.id);
  await fs.mkdir(root,{recursive:true});
  return withLock(lock,work,{log,owner:{id:ctx.id},
    stale:o=>`Removed stale lock for ${ctx.id}: process ${o.pid} on ${o.host} is no longer running`,
    busy:()=>new Error(`Episode ${ctx.id} is busy (lock ${lock}); if a previous process crashed, inspect and remove its lock directory before retrying`)});
}
