# motion

Motion animation videos built with Remotion 4 (React + TypeScript), Node 22.

**Before any change request, read `ai-routing.md`** and route to the model it names.

## Commands

- `npm run dev` — open Remotion Studio (live preview, prop editing)
- `npm run render:explainer` — 1920×1080 MP4 → `out/explainer.mp4`
- `npm run render:short` — 1080×1920 vertical MP4 → `out/short.mp4`
- `npm run still` — single frame PNG, quick render check
- `npm run typecheck`
- `npm run render:f1` — the F1 video → `out/f1-explosion.mp4` (serves the bundle on 127.0.0.1 to avoid the Windows localhost/IPv6 issue)

Check/debug frames go to `%TEMP%\motion-stills\`, not `out/` — `out/` is for finished videos only.
- `npm run upgrade` — upgrade all Remotion packages together

## Layout

- `src/Root.tsx` — registers compositions (`Explainer` 16:9, `Short` 9:16) and their default props
- `src/compositions/` — one file per video; scenes are `Sequence`s inside it
- `src/components/` — reusable animated pieces shared by scenes
- `src/theme.ts` — colour and font tokens, `FPS`
- `public/` — images, audio, video (load with `staticFile()`)
