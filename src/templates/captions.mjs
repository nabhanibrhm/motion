const STYLES = {"modern": "\n    #root {\n      position: absolute;\n      inset: 0;\n      pointer-events: none;\n    }\n    .cap {\n      position: absolute;\n      left: 0;\n      right: 0;\n      top: 1496px;\n      height: 136px;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      padding: 0 130px 0 70px;\n    }\n    .cap-text {\n      max-width: 820px;\n      font-family: \"Montserrat\", sans-serif;\n      font-weight: 800;\n      font-size: 46px;\n      line-height: 1.46;\n      text-align: center;\n    }\n    .cap-box {\n      padding: 6px 14px;\n      border-radius: 12px;\n      background: rgba(16, 16, 20, 0.84);\n      -webkit-box-decoration-break: clone;\n      box-decoration-break: clone;\n    }\n    .cap-box span {\n      padding: 0 6px;\n      border-radius: 8px;\n      color: rgba(255, 255, 255, 0.62);\n    }\n", "legacy-inflasi": "\n    #root {\n      position: absolute;\n      inset: 0;\n      pointer-events: none;\n    }\n    .cap {\n      position: absolute;\n      left: 0;\n      right: 0;\n      top: 960px;\n      height: 280px;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      padding: 0 120px 0 60px;\n    }\n    .cap-text {\n      max-width: 900px;\n      font-family: \"Montserrat\", sans-serif;\n      font-weight: 900;\n      font-size: 86px;\n      line-height: 1.08;\n      letter-spacing: -1px;\n      text-transform: uppercase;\n      text-align: center;\n      color: #a3a3a3;\n      -webkit-text-stroke: 11px #111111;\n      paint-order: stroke fill;\n      text-shadow: 0 7px 0 rgba(0, 0, 0, 0.35);\n    }\n"};
/** Opt-in look styles (runtime.look); the modern word timing is reused, only the colours change. */
/** Default palette of the casefile look; a theme palette (runtime.palette) overrides it. */
const CASEFILE_PAL = {bg: "#f2efe9", paper: "#fbf9f5", ink: "#151515", teal: "#1d6b6b"};
const rgba = (h, a) => { const v = parseInt(h.slice(1), 16); return `rgba(${v >> 16}, ${(v >> 8) & 255}, ${v & 255}, ${a})`; };
const LOOK_STYLES = {"casefile": (P) => `
    #root {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .cap {
      position: absolute;
      left: 0;
      right: 0;
      top: 1496px;
      height: 136px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 130px 0 70px;
    }
    .cap-text {
      max-width: 820px;
      font-family: "Nunito Sans", sans-serif;
      font-weight: 800;
      font-size: 48px;
      line-height: 1.42;
      text-align: center;
    }
    .cap-box {
      padding: 6px 16px;
      border-radius: 10px;
      background: ${rgba(P.paper, 0.94)};
      box-shadow: 0 0 0 4px ${P.ink};
      -webkit-box-decoration-break: clone;
      box-decoration-break: clone;
    }
    .cap-box span {
      padding: 0 6px;
      border-radius: 6px;
      color: ${rgba(P.ink, 0.45)};
    }
`};
/** Spoken word: paper on teal; after it, ink (key words teal). */
const LOOK_COLORS = {"casefile": (P) => ({on: P.bg, onBg: P.teal, key: P.teal, rest: P.ink, clear: rgba(P.teal, 0)})};
export function captions({F1,segments,width=1080,height=1920,profile="modern",look=null,palette=null}) {
  const lookPal={...CASEFILE_PAL,...(palette||{})};
  const legacy=profile==='legacy-inflasi', FPS=F1.FPS, clips=[],data=[];
  const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  for(const s of segments.filter(x=>x.kind==='section')) {
    const t0=s.from/FPS,tEnd=(s.from+s.duration)/FPS,groups=F1.captionGroups(s.section);
    groups.forEach((g,gi)=>{
      const id=`cap-${s.section.id}-${gi}`,first=g.words[0].start,lastEnd=g.words.at(-1).end,next=groups[gi+1];
      const linger=next&&next.words[0].start-lastEnd<.7,start=t0+first-.05;
      const end=Math.min(tEnd,linger?t0+next.words[0].start-.05:t0+lastEnd+.6);
      const stats=g.words.map(w=>F1.isStat(w.word));
      const key=stats.some(Boolean)?stats:g.words.map((_,i)=>i===g.words.length-1);
      const words=g.words.map((w,wi)=>`<span id="${id}-w${wi}"${key[wi]?' class="cap-key"':''}>${esc(w.word)}</span>${wi<g.words.length-1?' ':''}`).join('');
      clips.push(`  <div id="${id}" class="clip cap" data-start="${start.toFixed(3)}" data-duration="${(end-start).toFixed(3)}" data-track-index="0"><div class="cap-text" id="${id}-text">${legacy?words:`<span class="cap-box">${words}</span>`}</div></div>`);
      data.push({id,start:+start.toFixed(3),out:linger?null:+(t0+lastEnd+.35).toFixed(3),words:g.words.map((w,wi)=>legacy?[+(t0+w.start).toFixed(3),key[wi]?1:0]:[+(t0+w.start).toFixed(3),key[wi]?1:0,+(t0+(g.words[wi+1]?g.words[wi+1].start:w.end+.15)).toFixed(3)])});
    });
  }
  const lc=!legacy&&look?LOOK_COLORS[look](lookPal):null;
  const motion=lc?`tl.fromTo(text,{opacity:0,y:14},{opacity:1,y:0,duration:5/30,ease:"power2.out"},g.start);
      g.words.forEach(([t,key,next],wi)=>{const el=document.getElementById(g.id+"-w"+wi);tl.set(el,{color:"${lc.on}",backgroundColor:"${lc.onBg}"},t);tl.set(el,{color:key?"${lc.key}":"${lc.rest}",backgroundColor:"${lc.clear}"},next);});`:legacy?`tl.fromTo(text,{opacity:0,scale:.82},{opacity:1,scale:1,duration:5/30,ease:"back.out(2)"},g.start);
      g.words.forEach(([t,key],wi)=>tl.fromTo(document.getElementById(g.id+"-w"+wi),{color:"#a3a3a3"},{color:key?"#c6f432":"#ffffff",duration:.06,ease:"none"},t));`:
      `tl.fromTo(text,{opacity:0,y:14},{opacity:1,y:0,duration:5/30,ease:"power2.out"},g.start);
      g.words.forEach(([t,key,next],wi)=>{const el=document.getElementById(g.id+"-w"+wi);tl.set(el,{color:"#111111",backgroundColor:"#c6f432"},t);tl.set(el,{color:key?"#c6f432":"#ffffff",backgroundColor:"rgba(198,244,50,0)"},next);});`;
  return `<!-- GENERATED by motion sync. Do not edit. -->
<template>
  <link rel="stylesheet" href="lib/f1/f1.css" />
  <style>${lc?LOOK_STYLES[look](lookPal):STYLES[profile]}</style>
  <div id="root" data-composition-id="captions" data-width="${width}" data-height="${height}">
${clips.join('\n')}
  </div>
  <script>(()=>{const GROUPS=${JSON.stringify(data)},tl=gsap.timeline({paused:true});
    for(const g of GROUPS){const text=document.getElementById(g.id+"-text");${motion}
      if(g.out!==null){tl.to(text,{opacity:0,duration:.2,ease:"none"},g.out);tl.set(text,{opacity:0,visibility:"hidden"},g.out+.2);}
    }window.__timelines["captions"]=tl;
  })();</script>
</template>\n`;
}
