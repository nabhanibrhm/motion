# mascots: MOG, WEC, BOG

Scene-level API. Import from `../components/mascot` (`Mascot`, `VelvetDoor`, `Tickets`, `StoryBoard`, `TripMap`, `US_CITIES`).
The vector designs (`Mog.tsx`, `Wec.tsx`, `Bog.tsx`) keep their green/cream colours via the `mascot` tokens in `src/theme.ts`.
Everything is driven by `useCurrentFrame()` of the containing Sequence: frames, not seconds. No CSS animation, Date or Math.random.

## `<Mascot character x? y? scale? ... />`

| prop | meaning |
|---|---|
| `character` | `"mog" \| "wec" \| "bog"` |
| `x`, `y` | feet-centre in frame px (default: centre, `STAGE.feetY` = 830, just above the caption band) |
| `scale` | 1 = 260 px wide, ~285 tall. Use 0.6..1.6; vary it between scenes |
| `facing` | `"front" \| "left" \| "right"`: turns the face (head slides and narrows) |
| `look` | pupils: `"auto"` (follow facing), `"front"`, `"viewer"`, `"left"`, `"right"`, `"up"`, `"down"`, or `{x, y}` = a point in frame px (look at the speaker) |
| `talking` | `true`, or `[[start, end], ...]` frame ranges. **The mouth moves only then**, deterministically |
| `gesture` | `idle point wave cheer think shrug peek hold listen startle` (startle = both hands up) |
| `pointDir` | default direction for `point`: `"left" "right" "up" "down" "up-left" ...` or degrees (0 = right, -90 = up) |
| `prop` | `"none" \| "tickets" \| "phone" \| "map" \| "storyboard"` |
| `expression` | `neutral happy surprised confused smug` |
| `at`, `enter` | frame it appears; `"none" \| "pop" \| "fade" \| "walk-left" \| "walk-right"` (walk-left = comes in from the left edge). Default `"pop"` if `at > 0` |
| `exitAt`, `exit` | frame it leaves; same kinds, `"walk-left"` = walks off to the left. Default `"fade"` |
| `enterFrames`, `exitFrames` | durations (pop 14, fade 12, walk 40 / 36) |
| `seed`, `zIndex` | blink salt for two of one character; stacking |

Any of `facing`, `look`, `gesture`, `expression`, `prop` can be a **timeline**: `[[frame, value], ...]` (value holds until the next step; arms blend over 8 frames).
A gesture with direction: `{ gesture: "point", dir: "right" }`. A prop with `gesture="idle"` switches to `hold`.
Small props (`tickets`, `phone`) follow the right hand in any pose (wave + tickets works); `map` and `storyboard` need `hold`/idle (both hands).

Idle is only a blink and slow breathing; no bouncing. Listeners should have `talking={false}`.

```tsx
const lay = photoLayout("card-left");
const SPEAKER = { x: lay.mascot.feet.x + 280, y: 700 };

<Mascot character="bog" x={lay.mascot.feet.x} y={830} scale={0.9} facing="left" look={SPEAKER}
        gesture="listen" expression={[[0, "confused"], [150, "happy"]]} at={0} />
<Mascot character="mog" x={SPEAKER.x} y={830} facing="left"
        talking={[[10, 120], [150, 260]]}
        gesture={[[0, "idle"], [60, { gesture: "point", dir: "left" }], [120, "idle"]]} />
<Mascot character="wec" x={1500} y={830} at={20} enter="walk-right" gesture="wave" prop="tickets" expression="happy" />
```

Handoffs: switch `prop` on two mascots at the same frame (`[[0,"tickets"],[90,"none"]]` and `[[0,"none"],[90,"tickets"]]`) and point/lean toward each other with `look`.
Keep mascots out of the caption band (y 860..1040) and off the photo; `photoLayout(...).mascot` is the free zone.

## Set pieces (all take `x y scale at exitAt exitFrames enter enterFrames`)

- `<VelvetDoor x y scale? openAt? openFrames?=26 rope?=true>`: x,y = floor-centre; closed with brass posts and a rope until `openAt`, then the leaf swings open, light fills the doorway and spills on the floor, the rope drops. `openAt={0}` for the always-open ending door. `children` render inside the doorway.
- `<Tickets x y scale?=2 count?=2 angle? />`: a fan of race tickets (stage prop; hand-held ones are drawn by `Mascot`).
- `<StoryBoard x y scale? cols?=3 rows?=2 highlight? highlightAt? stand? />`: framed board of abstract driver portraits (varied skin tones and helmets); `highlight` rings one tile. x,y = centre; 420x300 at scale 1.
- `<TripMap x y scale? pins? unfoldFrames?=22 />`: stylised US map that unfolds; `pins={[{ ...US_CITIES.austin, at: 40 }, { ...US_CITIES.miami, at: 70 }, { ...US_CITIES.vegas, at: 100 }]}` (any `{label, at, u, v, color?}`; u,v are 0..1). 600x360 at scale 1.
- Enter kinds for set pieces: `"fade"` (default), `"pop"`, `"slide-left"`, `"slide-right"`, `"none"`.

Files: `Mascot.tsx` (API), `Figure.tsx` (poses, expressions, arms), `parts.tsx` (eyes, mouths, arms), `props.tsx` (held prop art), `sets.tsx` (set pieces), `timed.ts` (timelines), `Mog/Wec/Bog.tsx` (designs).
