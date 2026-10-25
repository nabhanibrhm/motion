# photo kit: framed photography, logos and stats

Import from `../components/photo`. All `at` / `exitAt` / `dur` are scene frames (frame 0 = section start), like the toon kit.
Tokens come from `src/theme.ts`: editorial `ink #000`, `accent #CB2957`, `panel #DDDDDD`, `bg #EEEEEE`, `white`.
Stage geometry (`../stage`): content y 110..830, caption band y 860..1040 (centred) kept clear, mascot feet at y 830.

**No full-frame photos.** `Photo` has no default bounds: `x, y, w, h` are required. Use a layout so text and a mascot are placed too.
A rare establishing shot is allowed only with explicit `x={0} y={0} w={1920} h={1080}` and must be called out in the change notes.

## PhotoCard + layouts (use these first)

```tsx
import { PhotoCard, photoLayout } from "../components/photo";

<PhotoCard
  layout="card-left"                       // card-left | card-right | center | two-up | timeline | collage
  options={{ aspect: "landscape" }}        // card-left/right: landscape | portrait | square;  timeline: { count: 2..5 }
  photos={[{ src: "assets/racing/garage_2021.jpg", label: "Paddock, 2017" }]}   // label shows under the photo in two-up / timeline
  kicker="2017" headline="The door opens" body="Liberty Media buys F1."          // text column (or pass children)
  tone="light"                             // "dark" if the ground behind is black
  at={0} stagger={10} exitAt={240} push    // push = slow 1 -> 1.05 zoom; default is still
/>

const lay = photoLayout("card-left");      // same boxes the card used
// lay.photos[i]  {x,y,w,h}     lay.text {x,y,w,h}     lay.labels[i]     lay.rail (timeline)
// lay.mascot {x,y,w,h, feet:{x,y}}  -> <Mascot x={lay.mascot.feet.x} y={lay.mascot.feet.y} />
```

| layout | photo(s) | text | mascot zone |
|---|---|---|---|
| `card-left` | 880x620 left (46% wide) | right column, headline + rule + body | under the text, right |
| `card-right` | mirrored | left column | under the text, left |
| `center` | 960x540 centred (50%) | headline above | right side, bottom |
| `two-up` | two 820x540, label under each | none | bottom centre |
| `timeline` | 2..5 cards on a rail with dots, label under each | headline above | bottom right |
| `collage` | one large, two small, staggered, open space top-right | text top-right | bottom left |

Each layout is a function in `photoLayouts`; `scaleBox(box, w, h)` rescales a 1920x1080 box. Everything stays above y 830.
`PhotoItem` fields: `src, label?, sub?, fit?, focal?, desaturate?, grain?, vignette?, zoom?, delay?`.

## Photo (the primitive)

- `<Photo src x y w h fit?="contain" focal? at? dur? zoom?=[1,1] dx? dy? desaturate? grain? vignette? overlay? border?=8 radius?=10 enter?="fade" enterFrames? exitAt? exitFrames? >children</Photo>`
  - Natural colour, no wash. `fit` defaults to `"contain"` (whole picture, panel-grey letterbox). `fit="cover"` crops and **requires** `focal={{x,y}}` (0..1, aim at the face): no blind crops.
  - White frame (`border`) with hairline and soft shadow; `radius` rounds it.
  - Motion is calm: `zoom` is an optional slow push (default none), `dx`/`dy` pan (clamped, no edges show).
  - `enter`: `"fade"` (default) | `"rise"` (fade + 24 px lift, used by PhotoCard) | `"none"` | `"clip"`. The wipes/race entrances (`wipe-*`, `race*`) still work but are not habitual: do not repeat one.
  - `overlay`: `0.6` (flat black) or `{dir, opacity?, reach?}` (solid on that side, for text on the picture). Old calls that omit x/y/w/h render a centred card and warn.
- `<RaceWipe at dur?=20 direction? bars? skew? />`: full-frame bars. Use rarely.
- `<LowerThird text sub? variant?="ink"|"ui" active? x?=140 y?=700 anchor? fontSize? at? exitAt? />`: keep clear of the caption band.
- `<Logo src="assets/logos/formula1.png" width | height x?=960 y?=540 enter?="fade"|"pop"|"none" at? frames? exitAt? opacity? />`: x,y = centre; transparent PNGs, never in white boxes.
- `<BigStat value suffix? prefix? decimals? label? at? dur?=45 x?=140 y?=300 align? fontSize?=280 color? suffixColor? labelColor? exitAt? />`: counts 0 -> value. Default colour is the accent; on black pass `editorial.white`.
- `<ProgressBar pct ... />` / `<Ring pct ... />`: thin bar / circular arc, 0 -> pct.
- Helpers: `alpha(hex, a)`, `expoOut`, `expoInOut`, `glide`.
