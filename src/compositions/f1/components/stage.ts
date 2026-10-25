/**
 * Shared stage geometry for the 1920x1080 F1 composition (px). Layouts, photo cards and mascots all
 * place themselves against these so content, captions and mascots never fight for the same pixels.
 *
 *   HUD label       top-left, y 36..84        -> content starts at `top`
 *   content         y `top`..`bottom`         -> text, photo cards, charts, props
 *   caption band    y 860..1040, centred      -> keep EVERYTHING else clear (captions render on top anyway)
 *   mascot feet     y `feetY` (just above the caption band) unless a scene deliberately stands them lower at the far corners
 */
export const STAGE = {
  width: 1920,
  height: 1080,
  left: 96,
  right: 1824,
  top: 110,
  bottom: 830,
  feetY: 830,
  captionTop: 860,
  captionBottom: 1040,
} as const;

export type Box = { x: number; y: number; w: number; h: number };
