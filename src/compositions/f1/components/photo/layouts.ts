import { Box, STAGE } from "../stage";

/**
 * Reusable placements for framed photos. Every layout returns explicit boxes in frame px, so a scene never
 * relies on a full-frame default. Boxes stay inside the content area (y 110..830) and leave the caption band
 * (y 860..1040) clear. `text` is the column beside the photo(s); `mascot` is a free zone sized for one mascot
 * (stand it with `feet`); `labels` sit under each photo.
 */
export type PhotoLayoutName = "card-left" | "card-right" | "center" | "two-up" | "timeline" | "collage";

export type PhotoAspect = "landscape" | "portrait" | "square";

export type PhotoLayoutOptions = {
  /** Shape of the (single) photo in card-left / card-right. Default "landscape". */
  aspect?: PhotoAspect;
  /** Number of cards in "timeline" (2..5, default 3). */
  count?: number;
};

export type PhotoLayout = {
  name: PhotoLayoutName;
  photos: Box[];
  /** Text column (headline / body) or null. */
  text: Box | null;
  /** One short label row under each photo (two-up, timeline), else empty. */
  labels: Box[];
  /** Free zone for a mascot. `feet` is the suggested feet-centre. */
  mascot: Box & { feet: { x: number; y: number } };
  /** Timeline rail (x0..x1 at y) for "timeline", else null. */
  rail: { x0: number; x1: number; y: number } | null;
};

const { left: L, right: R, top: T, bottom: B } = STAGE;

// Photo sizes (1920 frame): landscape 4:3-ish ~46% of the width, portrait and square narrower.
const SIZE: Record<PhotoAspect, { w: number; h: number }> = {
  landscape: { w: 880, h: 620 },
  portrait: { w: 580, h: 700 },
  square: { w: 680, h: 680 },
};

const mascotZone = (x: number, w: number, top = 520): PhotoLayout["mascot"] => ({ x, y: top, w, h: B - top, feet: { x: x + w / 2, y: STAGE.feetY } });

const side = (name: "card-left" | "card-right", aspect: PhotoAspect): PhotoLayout => {
  const { w, h } = SIZE[aspect];
  const y = Math.round(T + (B - T - h) / 2); // centred in the content band
  const gutter = 64;
  const photoX = name === "card-left" ? L : R - w;
  const textX = name === "card-left" ? L + w + gutter : L;
  const textW = R - L - w - gutter;
  const text: Box = { x: textX, y, w: textW, h: Math.min(h, 400) };
  return {
    name,
    photos: [{ x: photoX, y, w, h }],
    text,
    labels: [],
    mascot: mascotZone(textX, textW, y + text.h + 20),
    rail: null,
  };
};

const LAYOUTS: Record<PhotoLayoutName, (o: PhotoLayoutOptions) => PhotoLayout> = {
  /** Photo about 46% wide on the left, text column on the right, mascot zone under the text. */
  "card-left": (o) => side("card-left", o.aspect ?? "landscape"),
  /** Mirror: text left, photo right. */
  "card-right": (o) => side("card-right", o.aspect ?? "landscape"),
  /** Centred card (50% wide) with a headline above and a mascot zone on each side. */
  center: () => {
    const w = 960;
    const h = 540;
    const x = (STAGE.width - w) / 2;
    const y = 216;
    return {
      name: "center",
      photos: [{ x, y, w, h }],
      text: { x: 240, y: T - 14, w: 1440, h: 96 },
      labels: [],
      mascot: mascotZone(R - 340, 340, 470),
      rail: null,
    };
  },
  /** Two equal photos side by side, a label under each. */
  "two-up": () => {
    const w = 820;
    const h = 540;
    const gap = R - L - w * 2;
    const y = 140;
    return {
      name: "two-up",
      photos: [
        { x: L, y, w, h },
        { x: L + w + gap, y, w, h },
      ],
      text: null,
      labels: [
        { x: L, y: y + h + 18, w, h: 64 },
        { x: L + w + gap, y: y + h + 18, w, h: 64 },
      ],
      mascot: mascotZone(STAGE.width / 2 - 170, 340, 700),
      rail: null,
    };
  },
  /** A strip of 2..5 dated cards along a rail, a label under each. */
  timeline: (o) => {
    const n = Math.max(2, Math.min(5, o.count ?? 3));
    const gap = 40;
    const w = Math.floor((R - L - gap * (n - 1)) / n);
    const h = Math.round(Math.min(w * 0.72, 420));
    const y = 200;
    const photos = Array.from({ length: n }, (_, i) => ({ x: L + i * (w + gap), y, w, h }));
    const railY = y + h + 40;
    return {
      name: "timeline",
      photos,
      text: { x: L, y: T - 14, w: R - L, h: 70 },
      labels: photos.map((p) => ({ x: p.x, y: railY + 28, w: p.w, h: 90 })),
      mascot: mascotZone(R - 300, 300, railY + 140),
      rail: { x0: L, x1: R, y: railY },
    };
  },
  /** Restrained 3-photo collage: one large, two small, staggered, with open space top-right for text. */
  collage: () => ({
    name: "collage",
    photos: [
      { x: 150, y: 140, w: 720, h: 500 },
      { x: 930, y: 140, w: 420, h: 320 },
      { x: 1150, y: 500, w: 480, h: 300 },
    ],
    text: { x: 1410, y: 140, w: R - 1410, h: 300 },
    labels: [],
    mascot: mascotZone(150, 700, 650),
    rail: null,
  }),
};

/** Explicit boxes for a named layout at the 1920x1080 reference size. Scale with `scaleBox` for other sizes. */
export const photoLayout = (name: PhotoLayoutName, options: PhotoLayoutOptions = {}): PhotoLayout => LAYOUTS[name](options);

/** All layout factories by name (`photoLayouts["card-left"]()`). */
export const photoLayouts = LAYOUTS;

/** Scale a 1920x1080 box to another frame size. */
export const scaleBox = (b: Box, width: number, height: number): Box => {
  const sx = width / STAGE.width;
  const sy = height / STAGE.height;
  return { x: b.x * sx, y: b.y * sy, w: b.w * sx, h: b.h * sy };
};
