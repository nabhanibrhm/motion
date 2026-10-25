# AI model routing

> **AI AGENT INSTRUCTION:** Whenever a new change request is received, you must first read this file, identify the target files for the request, and switch to the cheapest approved model listed below before writing any code.

This is a Remotion project: videos are React components rendered frame by frame to
MP4. There is no server and no stored data. What *can* go wrong is quieter and only
shows up at render time: a Remotion package drifting off the shared exact version, an
animation that depends on wall-clock time or `Math.random()` instead of the frame (it
previews fine and flickers in the render), or a shared timing helper that shifts every
scene after it. The tiers below are weighted for that: the toolchain and the shared
timing / layout plumbing route high regardless of how small the diff is; copy, colours
and one scene's styling route low.

## Models and effort

| Model | Effort | Use for |
|---|---|---|
| **Haiku 5.5** | default | Docs, `defaultProps` copy in `Root.tsx`, theme token values, static assets in `public/` |
| **Sonnet 5.5** · medium | medium | One scene or one component, its markup, springs and interpolations |
| **Sonnet 5.5** · high | high | Composition timing (`Sequence` offsets, durations, `explainerDuration`), shared components used by every scene, `Root.tsx` composition setup, render config, anything spanning three or more files |
| **Opus 5.5** · high | high | Dependencies and the lockfile, `npm audit` handling, a render that fails with no known cause |
| **Opus 5.5** · max | xhigh / max | A Remotion major upgrade, adding Lambda / cloud rendering, a stack or architecture change |

**How to switch.**
- **Session:** if the current model or effort is higher than needed, say so in one line and ask the user to switch with `/model`. If it's lower, stop and ask for the higher one before writing code.
- **Subagents:** set `model` (`haiku`, `sonnet` or `opus`) and `effort` on the agent call to match the table. Delegating cheap work this way is preferred over switching the whole session.

---

## Routing map

Paths are relative to the repo root. Where several rows match a file, the first one wins.

### Opus 5.5

| Path / pattern | Effort | Why |
|---|---|---|
| `package.json` `dependencies` / `devDependencies` / `overrides`, `package-lock.json` | high | Every `remotion` and `@remotion/*` package must sit on the **same exact version** (no `^`). A mismatch installs fine and fails at bundle or render time. |
| `npm audit` triage, any advisory fix | high | `npm audit fix --force` can bump Remotion or React to a version the other packages don't match. |
| A render (`remotion render` / `still`) that fails or hangs with no known cause | high | Usually a browser download, version mismatch or a non-deterministic component, not the line in the stack trace. |
| Remotion major upgrade, React major upgrade | max | |
| Adding `@remotion/lambda` / cloud rendering, replacing a stack piece | max | |

### Sonnet 5.5 · high

| Path / pattern |
|---|
| `src/Root.tsx` — composition ids, sizes, `fps`, `durationInFrames`, `calculateMetadata` |
| Scene timing constants and `explainerDuration` in `src/compositions/*.tsx` (they shift every scene after them) |
| `src/components/Background.tsx`, `src/components/AnimatedText.tsx` (shared by every scene) |
| `src/theme.ts` structure — adding/removing tokens, `FPS` |
| `remotion.config.ts`, `tsconfig.json`, `package.json` `scripts` |
| `src/index.ts` (`registerRoot`) |

### Sonnet 5.5 · medium

| Path / pattern |
|---|
| One scene inside a composition (`TitleScene`, `PointScene`, `CtaScene` …) without changing its duration |
| A new self-contained component used by one scene |
| A new composition file that reuses existing components, registered in `Root.tsx` (registration alone is Sonnet · high if it changes existing ones) |
| Audio / video / image usage via `<Audio>`, `<OffthreadVideo>`, `<Img>` in one scene |

### Haiku 5.5

| Path / pattern |
|---|
| `**/*.md` — `README.md`, `CLAUDE.md`, this file |
| Copy in `defaultProps` (titles, points, CTA text) using fields that already exist |
| Theme token **values** in `src/theme.ts` (a new token or a change to how tokens are wired is Sonnet · high) |
| `public/**` asset swaps — images, music, logos (re-encoding or a new format is Sonnet · medium) |
| `.gitignore`, a `package.json` `version` bump on its own |

**Generated, don't edit:** `out/` (renders) and `node_modules/`.

---

## Cross-tier rules

1. **Highest wins.** A request touching several rows runs at the highest model and effort among them.
2. **Route on files, not wording.** List the target files first. "Make the number bounce more" is Sonnet · medium (one scene); "make every scene half a second longer" is Sonnet · high (timing constants, `Root.tsx`).
3. **The kind of change can only raise the level.**
   - Anything that changes **what npm installs** — a version range, an `overrides` entry, the lockfile, the Node version: **Opus**.
   - Anything that changes **timing for more than one scene** — `fps`, durations, `Sequence` offsets, transitions between scenes: at least **Sonnet · high**.
   - Anything that could make rendering **non-deterministic** — `Date`, `Math.random()` (use `random(seed)` from `remotion`), CSS animations/transitions, timers, un-awaited fonts or data (use `delayRender`): at least **Sonnet · high**.
   - Anything that changes **output size or format** — width/height, codec, image format, aspect ratio: at least **Sonnet · high**.
4. **Paired files go together.** A prop in `defaultProps` and the component that renders it; a token in `theme.ts` and the scenes that use it; `package.json` and `package-lock.json` — one batch, at the higher of the two rows.
5. **Scope grows, stop.** If the work needs a higher row mid-task, say so and continue only at that level.
6. **Read-only work drops one level.** Questions, searches and explanations: Haiku, or Sonnet · medium for Opus areas. No code written.
7. **Reviews match the code**, one level up for Opus areas (high -> xhigh).
8. **Unsure, go one level up** and say why in one line.

## Rules that outrank this file

These apply at every tier:

- **Never run `npm audit fix --force`.** Upgrade Remotion with `npm run upgrade` (`remotion upgrade`), which moves every Remotion package together.
- **Remotion packages are pinned exactly** and always share one version. React stays on the major Remotion supports.
- **Animate from the frame only:** `useCurrentFrame()`, `interpolate`, `spring`. No CSS transitions/animations, timers or wall-clock time.
- **Colours and fonts are tokens only** from `src/theme.ts`; scene copy lives in props, not hard-coded in scenes.
- **`npm run typecheck` clean and a test still renders** before handing off. A dependency change also needs a fresh install (delete `node_modules`, then `npm install`) followed by a render.
- **Check frames go to the temp folder, never `out/`.** Write them to `%TEMP%\motion-stills\` (e.g. `npx remotion still F1Explosion "$env:TEMP\motion-stills\netflix-3300.png" --frame=3300`). `out/` holds finished videos only.

---

_Adapted on 23 Oct 2026 from the portfolio repo's `ai-routing.md`; tiers and paths re-derived for this Remotion project._
