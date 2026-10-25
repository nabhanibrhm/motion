# toon kit: flat illustrated explainer look

Import everything from `../components/toon` (index.ts). Tokens: `toon` in `src/theme.ts`.
TOKEN GROUPS (src/theme.ts): `editorial` (ink #000, accent #CB2957, panel #DDDDDD, bg #EEEEEE, white, plus contrast-checked accentOnDark/accentOnLight/muted) for text, panels, backgrounds, cards and HUD;
`mascot` (green/cream) for MOG/WEC/BOG only; `objects` (liveries, skins, hairs, props, sepia `old`); `brand` (logo colours); `chart` (restrained categorical colours).
`toon` keeps every legacy name, now natural again: `paper` white, `sage` panel grey, `sageDeep` rule grey, `green` = the editorial ACCENT (historical name), `ink`/`cream` black text (cream = TEXT colour; for a light colour on a dark surface use `toon.paper`),
`ground` #EEEEEE, `groundAlt` #DDDDDD, `groundDeep` near-black, `red amber mint sky pink lilac` real object colours (no green remap), `redText` text-safe red, `accentText` / `accentOnDark` small accent text,
`muted`, `skins[0..4]` light->deep, `hairs.{black,brown,auburn,blonde,grey,white,pink,blue}`, `suit`, `shoe`, `old.{ground,groundDeep,tan,cream,red,amber}` for 2010 sepia flashbacks, `font.display` Bricolage Grotesque, `font.body` Nunito Sans.
Colour helpers: `mix(a,b,t)`, `shade(c,amt)`, `tint(c,amt)`. Small pink text on black fails contrast: use `editorial.accentOnDark`.

Frame is 1920x1080. Layout rules: text in the LEFT column (x 140, width 820), art on the RIGHT half (x 1000..1840),
keep y > 780 clear for captions (put feet / ground lines at y <= 780). Top-left (64, 44) holds the Hud chapter label.
Everything animates from `useCurrentFrame()` of the scene (frame 0 = section start). All "at" / "exitAt" are scene frames.

## Layout and text

- `<Ground tone? color? glow? glowColor? glowX? glowY? particles? particleColor? seed? />`
  tone: "plum" (default, #EEEEEE) | "alt" (#DDDDDD) | "deep" / "ink" (black) | "old" (sepia). Already rendered underneath every scene (CarbonBackground);
  add your own inside a scene to cover it (e.g. `<Ground tone="old"/>`).
- `<Words kicker? lines sub? highlight? highlightColor? kickerColor? at? stagger? startAt? wordStagger? exitAt? x? width? fontSize? subSize? valign? top? drift? />`
  Left-column block. `lines` = string[] or "\n" string; wrap phrases in `*stars*` to highlight them, or pass
  `highlight` words. highlightColor: "accent" (default) | "red" | "amber" | "mint" | "sky" (all text-safe on light) | css colour. Each element
  (kicker, every line, every sub line) fades in from the right (26 px, 12 frames) `stagger` (8) frames after the previous;
  `startAt` = explicit frames per element `[kicker?, ...lines, ...subs]`; `wordStagger` staggers words inside a line.
  Drifts -2 px/s. Headline auto-shrinks to fit the column. valign "center" (default, centred above the caption zone) | "top" | "bottom".
- `<Enter at? from? dist? frames? exitAt? style>`: fade + slide wrapper. from "right" (default) | "left" | "up" | "down" | "none".
  Illustrations: `from="right" dist={70} frames={20}`.
- `<Pop at? frames? origin? exitAt? style>`: scale-in with back-ease overshoot (~1.7). For small objects.
- `<Drift px? py? style>`: constant drift of children (default -2 px/s).
- `<Tag text x y at? point? variant? fontSize? labelWidth?>`: white label (variant "light"|"red"|"amber"|"dark"), x/y = centre,
  pops at `at`; if `point={{x,y}}` a leader line draws from that point to the label edge.
- `<Leader from to at? frames? color? width? dot?>`: thin drawn leader line with a dot at `from`.
- `<CutEdge x y w h? at? frames? color?>`: dashed cut-away outline (rounded rect with `h`, circle without).
- anim helpers: `ramp(frame, at, frames, easing?)`, `popScale(frame, at, frames)`, `wave(t, period, phase)`, `pulse`, `easeOut`, `backOut`, `clamp`, `useSeconds()`.

## People (nominal 300x600 box, scaled by `size`; `x`,`y` = feet-centre in frame px, or position with `style`)

- `<Person skin? hair? hairColor? capColor? top? bottom? shoe? expression? pose? accessory? facing? seed? size? x? y? shadow? phoneColor? life? style />`
  - hair: "short" | "long" | "bun" | "curly" | "cap" | "none"; hairColor from `toon.hairs`.
  - expression: "smile" | "grin" | "wow" | "sad" | "angry" | "neutral".
  - pose: "idle" | "wave" | "cheer" | "point" | "phone" | "clap" | "think" | "arms-crossed".
    "wave", "point" and "think" use the viewer-right arm; `facing="left"` mirrors the whole figure.
  - accessory: "none" | "glasses" | "headphones" | "cap" (uses capColor) | "tie" | "sunglasses".
  - facing: "front" (default) | "left" | "right" (mirror for left, gaze shift for both).
  - seed: offsets idle motion (use a different seed per person). life: 0..1 scales idle motion.
  - Built in: breathing, head bob and tilt, blinking every 3-5 s, arm sway (2.5 s); wave/cheer/clap loop.
- `<Driver ...Person props (no top/bottom/accessory) team? helmet? visor? helmetColor? />`
  team `{main, secondary}` (default red/cream). `helmet` 1 = on, 0 = off; animate 1 -> 0 over ~25 frames for the lift-off
  (helmet rises, tilts and fades; hair shows). `visor` 0 = up (face visible, default) .. 1 = down.
- `<Suit suit? tie? hold? pose? glasses? moustache? hairColor? skin? expression? ...size/x/y/seed/facing />`
  Older businessman. hold: "none" | "champagne" | "cigar" (right hand; the cigar puffs on a 6 s cycle with smoke).
  pose: "idle" | "point" | "arms-crossed" | "think" | "wave" | "clap".
- `<Crowd width? rows? cols? cheering? phoneLights? seed? palette? x? y? style />`
  Small heads and shoulders; back rows smaller and dimmer. cheering 0..1 = share with arms up and jumping,
  phoneLights 0..1 = share holding a glowing phone. x = centre, y = bottom edge. `crowdHeight(width, rows, cols)` for layout.

## Cars (nominal 640x230, nose right; `x` = wheelbase centre, `y` = ground line)

- `<Car livery? number? speed? size? facing? helmetColor? tyre? speedLines? dust? shadow? x? y? style />`
  livery `{main, secondary}`; `LIVERIES.{red,amber,mint,sky,pink,old}`. speed 0 = parked (engine shiver),
  1 = flat out (wheel spin, body vibration, speed lines and dust; override with speedLines / dust booleans).
  size = width in px. facing "right" | "left".
- `<CarTop livery? size? angle? x? y? />`: top-down car (nominal 240x90, nose right), x/y = centre. `CarTopArt` is the same art as an svg group.
- `<Track width? height? shape? draw? cars? lane? asphalt? kerbs? startLine? x? y? />`
  shape "circuit" (default) | "oval". `draw` 0..1 draws the track on. `cars`: `{progress, livery?, number?, size?}[]`
  where `progress` is any real (laps wrap), e.g. `frame / 90`. `trackPoint(shape, u, width, height)` returns `{x, y, angle}`
  (a pure function, in the Track svg's coordinates) to attach tags, pins or leaders to a spot on the track.
- `<SpeedLines width? height? count? color? speed? seed? toward? />` and `<Exhaust puffs? color? size? speed? />`: standalone ambience.

## Old-era moments

`<Ground tone="old"/>` + `<Grain/>` (sepia tint, paper grain, vignette) + `toon.old.*` colours + `LIVERIES.old`.
Existing `KineticHeadline`, `StatCounter`, `ChapterCard`, `Captions`, `Hud` are restyled but unchanged in API.
