/** Built-in scene templates: `{ "id": "...", "template": "<name>", "props": {...} }` in episode.json. */
import {titleCard} from './title-card.mjs';
import {HOTWIZZ_TEMPLATES,checkHotwizz,renderHotwizz} from './hotwizz.mjs';

export const TEMPLATE_NAMES=['title-card',...Object.keys(HOTWIZZ_TEMPLATES)];

/** Returns {errors, anchors} for a template scene; anchors are F1.at specs the validator resolves. */
export function checkTemplate(scene,ctx) {
  if(scene.template==='title-card') return {errors:typeof scene.props?.title==='string'&&scene.props.title.trim()?[]:[`${scene.id}: invalid template/props`],anchors:[]};
  if(Object.hasOwn(HOTWIZZ_TEMPLATES,scene.template)) return checkHotwizz(scene,ctx);
  return {errors:[`${scene.id}: unknown template ${scene.template} (known: ${TEMPLATE_NAMES.join(', ')})`],anchors:[]};
}

export function renderTemplate(scene,ctx,index) {
  if(scene.template==='title-card') return titleCard(scene.id,scene.props);
  if(Object.hasOwn(HOTWIZZ_TEMPLATES,scene.template)) return renderHotwizz(scene,ctx,index);
  throw new Error(`${scene.id}: unknown template ${scene.template}`);
}
