import { CSSProperties } from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { ramp, popScale } from "../toon/anim";
import { expoOut } from "./util";

export type LogoProps = {
  /** Transparent PNG relative to public/, e.g. "assets/logos/formula1.png". */
  src: string;
  /** Give width OR height (px), never both: the other side follows the logo's own proportions. */
  width?: number;
  height?: number;
  /** Centre of the logo in frame px (default: frame centre 960, 540). */
  x?: number;
  y?: number;
  /** "pop" (soft overshoot), "fade" (fade + rise, default), "none". */
  enter?: "pop" | "fade" | "none";
  at?: number;
  frames?: number;
  exitAt?: number;
  /** 0..1 overall opacity (default 1). */
  opacity?: number;
  style?: CSSProperties;
};

/** A logo drawn with object-fit: contain, never stretched. */
export const Logo: React.FC<LogoProps> = ({ src, width, height, x = 960, y = 540, enter = "fade", at = 0, frames, exitAt, opacity = 1, style }) => {
  const frame = useCurrentFrame();
  const f = frames ?? (enter === "pop" ? 16 : 18);
  const fade = enter === "none" ? 1 : ramp(frame, at, f, expoOut);
  const pop = enter === "pop" ? popScale(frame, at, f) : 1;
  const out = exitAt === undefined ? 1 : 1 - ramp(frame, exitAt, 10);
  if (frame < at && enter !== "none") return null;
  if (out <= 0) return null;

  const box: CSSProperties = width !== undefined ? { width } : { height: height ?? 160 };
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        ...box,
        transform: `translate(-50%, -50%) scale(${pop}) translateY(${enter === "fade" ? (1 - fade) * 18 : 0}px)`,
        opacity: Math.min(1, fade * 3) * out * opacity,
        ...style,
      }}
    >
      <Img src={staticFile(src)} style={{ display: "block", width: width !== undefined ? "100%" : "auto", height: width !== undefined ? "auto" : "100%", objectFit: "contain" }} />
    </div>
  );
};
