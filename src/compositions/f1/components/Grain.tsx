import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { toon } from "../../../theme";

type Props = { opacity?: number; sepia?: boolean; seed?: number };

// Soft film grain (re-rolled ~12x per second) with an optional sepia wash and vignette for old-era moments.
export const Grain: React.FC<Props> = ({ opacity = 0.14, sepia = true, seed = 1 }) => {
  const frame = useCurrentFrame();
  const step = Math.floor(frame / 2);
  const noiseSeed = Math.floor(random(seed * 100000 + step) * 1000);
  const flicker = 0.94 + random(seed * 7 + step * 3) * 0.06;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: flicker }}>
      {sepia && <AbsoluteFill style={{ background: toon.old.tan, mixBlendMode: "multiply", opacity: 0.4 }} />}
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: opacity * 3 }}>
        <filter id="f1-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed={noiseSeed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#f1-grain)" />
      </svg>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, transparent 55%, ${toon.ink}55 100%)` }} />
    </AbsoluteFill>
  );
};
