export function titleCard(id, props={}) {
  if(typeof props.title!=='string' || !props.title.trim()) throw new Error(`title-card ${id}: props.title is required`);
  const data=JSON.stringify({title:props.title,subtitle:props.subtitle || ''}).replace(/</g,'\\u003c');
  const frames=Number.isSafeInteger(props.frames)&&props.frames>0?String(props.frames):`F1.sceneFrames("${id}")`;
  return `<template>
  <link rel="stylesheet" href="lib/f1/f1.css" />
  <div id="root" data-composition-id="${id}" data-width="1080" data-height="1920"><div id="${id}-art" class="f1-layer"></div></div>
  <script>(()=>{const p=${data},frames=${frames}; window.__timelines["${id}"]=F1.scene("${id}",f=>F1.cine.stage(f,frames,'<div style="position:absolute;inset:0;background:#eee5d5;display:flex;align-items:center;justify-content:center;flex-direction:column;padding:100px 140px 380px 80px;text-align:center"><div style="font:700 94px Oswald;color:#171719">'+F1.esc(p.title)+'</div><div style="font:600 38px Montserrat;margin-top:32px">'+F1.esc(p.subtitle)+'</div></div>'),{frames});})();</script>
</template>\n`;
}
