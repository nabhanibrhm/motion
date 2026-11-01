import {promises as fs} from 'node:fs';
import {join} from 'node:path';
import {ID,within} from '../config/episodes.mjs';

/** Hold through compilation, capture and mastering; never silently break another run's lock. */
export async function withEpisodeLock(ctx,work) {
  if(!ID.test(ctx.id)) throw new Error('Invalid episode lock id');
  const root=within(ctx.repoRoot,'.cache/locks'),lock=within(root,ctx.id);
  await fs.mkdir(root,{recursive:true});
  try{await fs.mkdir(lock);}catch(e){if(e.code==='EEXIST') throw new Error(`Episode ${ctx.id} is busy (lock ${lock}); if a previous process crashed, inspect and remove its lock directory before retrying`);throw e;}
  try{
    await fs.writeFile(join(lock,'owner.json'),JSON.stringify({pid:process.pid,id:ctx.id}));
    return await work();
  }finally{await fs.rm(lock,{recursive:true,force:true});}
}
