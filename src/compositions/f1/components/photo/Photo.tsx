import { CSSProperties, ReactNode, useId } from "react";
import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { editorial } from "../../../../theme";
import { clamp, ramp } from "../toon/anim";
import { alpha, BARS, expoOut, glide } from "./util";

export type PhotoEnter = "none" | "fade" | "rise" | "wipe-right" | "wipe-left" | "wipe-up" | "wipe-down" | "clip" | "race" | "race-left";
export type PhotoOverlay =
  | number
  | {
      /** Side where the black is solid (put your text there). */
      dir: "left" | "right" | "top" | "bottom";
      /** Opacity at that side, default 0.7. */
      opacity?: number;
      /** Fraction of the box the gradient reaches, default 0.85. */
      reach?: number;
    };

export type Focal = { x: number; y: number };

/** `contain` (default) shows the whole picture; `cover` crops, so it must name the focal point it keeps. */
export type FitProps = { fit?: "contain"; focal?: Focal } | { fit: "cover"; focal: Focal };

export type PhotoProps = {
  /** Path relative to public/, e.g. "assets/people/hamilton.jpg" (loaded with staticFile + Img). */
  src: string;
  /** Box in frame px. All four are REQUIRED: there is no full-frame default (use a layout from `photoLayouts`). */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Scene frame at which the photo starts entering and its Ken Burns move starts. */
  at?: number;
  /** Frames the push lasts (then it holds). Default 150. */
  dur?: number;
  /** Optional slow push, scale [from, to]. Default [1, 1] = still. Keep it gentle ([1, 1.05]). The pan is clamped so edges never show. */
  zoom?: [number, number];
  /** Pan in px over `dur` (positive dx moves the picture right). Needs zoom > 1 to have room. */
  dx?: number;
  dy?: number;
  /** 0..1 desaturation (flashbacks); 1 = black and white. */
  desaturate?: number;
  /** 0..1 film grain. */
  grain?: number;
  /** 0..1 black vignette. */
  vignette?: number;
  /** Black overlay for text on the picture: a flat opacity, or a gradient from one side. */
  overlay?: PhotoOverlay;
  /** White frame width in px (default 8, 0 = none) with a hairline and soft shadow. */
  border?: number;
  radius?: number;
  /** How the photo arrives. Default "fade"; "rise" = fade + 24 px lift. */
  enter?: PhotoEnter;
  /** Frames the entrance takes (default 14; race 12; clip 20). */
  enterFrames?: number;
  /** Scene frame at which it fades out (optional) and the fade length. */
  exitAt?: number;
  exitFrames?: number;
  /** Content drawn above the photo and overlays, inside the box (not zoomed). */
  children?: ReactNode;
  style?: CSSProperties;
} & FitProps;

const SLANT = 140; // px lean of the race-wipe edge
const BAR_W = [34, 54, 22]; // leading bars (px), colours in BARS (util.ts)
const BARS_TOTAL = BAR_W[0] + BAR_W[1] + BAR_W[2];

/** A real photograph in an explicit box: contain (or an intentional cover crop with a focal point), optional slow push, grade, overlay, white frame and a restrained entrance. Natural colour, no wash. */
export const Photo: React.FC<PhotoProps> = ({
  src,
  x: xIn,
  y: yIn,
  w: wIn,
  h: hIn,
  focal = { x: 0.5, y: 0.5 },
  fit = "contain",
  at = 0,
  dur = 150,
  zoom = [1, 1],
  dx = 0,
  dy = 0,
  desaturate = 0,
  grain = 0,
  vignette = 0,
  overlay,
  border = 8,
  radius = 10,
  enter = "fade",
  enterFrames,
  exitAt,
  exitFrames = 10,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  // Bounds are required by the type. If an old call site still omits them, fall back to a centred card (never full frame).
  const missing = xIn === undefined || yIn === undefined || wIn === undefined || hIn === undefined;
  const bw = wIn ?? Math.round(W * 0.5);
  const bh = hIn ?? Math.round(H * 0.55);
  const x = xIn ?? Math.round((W - bw) / 2);
  const y = yIn ?? Math.round((H - bh) / 2);
  if (missing && frame === 0) console.warn(`Photo ${src}: x, y, w, h are required; using a centred card.`);
  const ef = enterFrames ?? (enter.startsWith("race") ? 12 : enter === "clip" ? 20 : 14);

  if (exitAt !== undefined && frame >= exitAt + exitFrames) return null;

  const p = enter === "none" ? 1 : ramp(frame, at, ef, enter === "fade" ? undefined : expoOut);
  const out = exitAt === undefined ? 1 : 1 - ramp(frame, exitAt, exitFrames);
  const live = frame >= at;

  // Ken Burns: scale + pan, clamped so the picture always covers the box.
  const k = interpolate(frame, [at, at + dur], [0, 1], { ...clamp, easing: glide });
  const s = zoom[0] + (zoom[1] - zoom[0]) * k;
  const fx = focal.x;
  const fy = focal.y;
  const iw = bw - border * 2;
  const ih = bh - border * 2;
  const rise = enter === "rise" ? (1 - p) * 24 : 0;
  const tx = Math.max(-(s - 1) * (1 - fx) * iw, Math.min((s - 1) * fx * iw, dx * k));
  const ty = Math.max(-(s - 1) * (1 - fy) * ih, Math.min((s - 1) * fy * ih, dy * k));
  const settle = enter === "clip" ? 1 + (1 - p) * 0.12 : 1;

  // Entrance mask on the whole card (dropped once finished so the frame shadow is never clipped).
  const wrapStyle: CSSProperties = {};
  let bars: ReactNode = null;
  if (p < 1 && enter !== "none" && enter !== "fade" && enter !== "rise") {
    if (enter.startsWith("wipe")) {
      const dir = { "wipe-right": "90deg", "wipe-left": "270deg", "wipe-up": "0deg", "wipe-down": "180deg" }[enter as "wipe-right"];
      const edge = interpolate(p, [0, 1], [-10, 100]);
      const m = `linear-gradient(${dir}, #000 ${edge}%, transparent ${edge + 10}%)`;
      wrapStyle.WebkitMaskImage = m;
      wrapStyle.maskImage = m;
    } else if (enter === "clip") {
      const v = (1 - p) * 50;
      wrapStyle.clipPath = `inset(${v}% ${(1 - p) * 6}% ${v}% ${(1 - p) * 6}% round ${Math.max(radius, 6)}px)`;
    } else {
      // race: a slanted edge sweeps across, led by ink / green / sage bars.
      const left = enter === "race-left";
      const mx = (v: number) => (left ? bw - v : v);
      const e = p * (bw + SLANT + BARS_TOTAL) - BARS_TOTAL; // photo edge (top of the slant)
      const poly = (a: number, b: number) => [`${mx(a)},0`, `${mx(b)},0`, `${mx(b - SLANT)},${bh}`, `${mx(a - SLANT)},${bh}`].join(" ");
      wrapStyle.clipPath = `polygon(${poly(-SLANT - 10, e)
        .split(" ")
        .map((pt) => pt.split(",").map((n) => `${n}px`).join(" "))
        .join(", ")})`;
      let a = e;
      bars = BAR_W.map((bwid, i) => {
        const el = <polygon key={i} points={poly(a, a + bwid)} fill={BARS[i]} />;
        a += bwid;
        return el;
      });
    }
  }

  const ov = overlay === undefined ? null : typeof overlay === "number" ? { flat: overlay } : overlay;
  const grad = ov && "dir" in ov ? { to: { left: "to right", right: "to left", top: "to bottom", bottom: "to top" }[ov.dir], a: ov.opacity ?? 0.7, reach: (ov.reach ?? 0.85) * 100 } : null;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: bw,
        height: bh,
        opacity: live ? (enter === "fade" || enter === "rise" ? p : 1) * out : 0,
        transform: rise ? `translateY(${rise}px)` : undefined,
        ...style,
      }}
    >
      <div style={{ position: "absolute", inset: 0, ...wrapStyle }}>
        {border > 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: editorial.white,
              borderRadius: radius + border * 0.5,
              boxShadow: `0 0 0 1px ${editorial.rule}, 0 16px 36px ${alpha(editorial.ink, 0.2)}`,
            }}
          />
        )}
        <div style={{ position: "absolute", left: border, top: border, width: iw, height: ih, overflow: "hidden", borderRadius: radius, background: editorial.panel }}>
          <div style={{ position: "absolute", inset: 0, transform: `scale(${settle})`, transformOrigin: `${fx * 100}% ${fy * 100}%` }}>
            <Img
              src={staticFile(src)}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: fit,
                objectPosition: `${fx * 100}% ${fy * 100}%`,
                transformOrigin: `${fx * 100}% ${fy * 100}%`,
                transform: `translate(${tx}px, ${ty}px) scale(${s})`,
                filter: desaturate > 0 ? `saturate(${1 - desaturate}) contrast(${1 + desaturate * 0.08})` : undefined,
              }}
            />
          </div>
          {vignette > 0 && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at center, transparent 45%, ${alpha(editorial.ink, vignette * 0.85)} 100%)` }} />}
          {ov && "flat" in ov && <div style={{ position: "absolute", inset: 0, background: alpha(editorial.ink, ov.flat) }} />}
          {grad && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(${grad.to}, ${alpha(editorial.ink, grad.a)} 0%, ${alpha(editorial.ink, grad.a * 0.55)} ${grad.reach * 0.5}%, ${alpha(editorial.ink, 0)} ${grad.reach}%)`,
              }}
            />
          )}
          {grain > 0 && (
            <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: Math.min(1, grain * 1.6) }}>
              <filter id={`pg${id}`}>
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed={Math.floor(frame / 2) % 997} stitchTiles="stitch" />
                <feColorMatrix type="saturate" values="0" />
              </filter>
              <rect width="100%" height="100%" filter={`url(#pg${id})`} />
            </svg>
          )}
          {children && <div style={{ position: "absolute", inset: 0 }}>{children}</div>}
        </div>
      </div>
      {bars && (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <svg width={bw} height={bh} style={{ position: "absolute", inset: 0 }}>
            {bars}
          </svg>
        </div>
      )}
    </div>
  );
};
