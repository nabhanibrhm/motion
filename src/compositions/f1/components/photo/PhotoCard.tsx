import { ReactNode } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { editorial, toon } from "../../../../theme";
import { Box } from "../stage";
import { clamp, ramp } from "../toon/anim";
import { photoLayout, PhotoLayoutName, PhotoLayoutOptions, scaleBox } from "./layouts";
import { FitProps, Photo, PhotoEnter } from "./Photo";

export type PhotoItem = {
  src: string;
  /** Caption under the photo (two-up, timeline). Short: a name or a year. */
  label?: string;
  sub?: string;
  desaturate?: number;
  grain?: number;
  vignette?: number;
  /** Slow push [from, to]; default none. Use sparingly ([1, 1.05]). */
  zoom?: [number, number];
  /** Extra frames of delay for this photo (on top of the layout stagger). */
  delay?: number;
} & FitProps;

export type PhotoCardProps = {
  layout: PhotoLayoutName;
  options?: PhotoLayoutOptions;
  photos: readonly PhotoItem[];
  /** Text beside / above the photo(s). Ignored when `children` is given. */
  kicker?: string;
  headline?: string;
  body?: string;
  /** Replaces the default text block; rendered inside the layout's text column. */
  children?: ReactNode;
  /** Text colours for the ground behind: "light" (#EEEEEE, default) or "dark" (black). */
  tone?: "light" | "dark";
  /** Scene frame where it starts, frames between successive photos, and optional exit. */
  at?: number;
  stagger?: number;
  exitAt?: number;
  exitFrames?: number;
  /** Photo entrance. Default "rise" (calm). Avoid repeating wipes. */
  enter?: PhotoEnter;
  /** Slow push applied to every photo that does not set its own `zoom`. */
  push?: boolean | [number, number];
  /** Frames the push lasts. Default 180. */
  pushFrames?: number;
};

/**
 * A framed photo (or photos) laid out with an editorial preset, plus its text column and label rows.
 * Boxes come from `photoLayout(name)`; read the same layout in your scene to stand a mascot on `layout.mascot.feet`.
 * Natural colour, white frame, never full frame.
 */
export const PhotoCard: React.FC<PhotoCardProps> = ({
  layout: name,
  options,
  photos,
  kicker,
  headline,
  body,
  children,
  tone = "light",
  at = 0,
  stagger = 10,
  exitAt,
  exitFrames = 10,
  enter = "rise",
  push = false,
  pushFrames = 180,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const L = photoLayout(name, options);
  const sb = (b: Box) => scaleBox(b, width, height);
  const dark = tone === "dark";
  const inkText = dark ? editorial.white : editorial.ink;
  const kickText = dark ? editorial.accentOnDark : editorial.accentOnLight;
  const subText = dark ? editorial.mutedOnDark : editorial.muted;
  const railColor = dark ? editorial.mutedOnDark : editorial.rule;
  const pushRange: [number, number] | undefined = push === true ? [1, 1.05] : push === false ? undefined : push;
  const sw = width / 1920;

  const textIn = ramp(frame, at + 6, 16);
  const out = exitAt === undefined ? 1 : 1 - ramp(frame, exitAt, exitFrames);
  const centred = name === "center" || name === "timeline";
  const start = (i: number) => at + i * stagger + (photos[i]?.delay ?? 0);

  const railBox = L.rail ? sb({ x: L.rail.x0, y: L.rail.y, w: L.rail.x1 - L.rail.x0, h: 0 }) : null;
  const hasText = Boolean(children || headline || kicker || body);

  return (
    <div style={{ position: "absolute", inset: 0, opacity: out, pointerEvents: "none" }}>
      {railBox && (
        <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
          <line x1={railBox.x} y1={railBox.y} x2={railBox.x + railBox.w * ramp(frame, at + 4, 28)} y2={railBox.y} stroke={railColor} strokeWidth={4 * sw} strokeLinecap="round" />
          {L.photos.slice(0, photos.length).map((p, i) => {
            const b = sb(p);
            const on = interpolate(frame, [start(i) + 8, start(i) + 18], [0, 1], clamp);
            return <circle key={i} cx={b.x + b.w / 2} cy={railBox.y} r={11 * sw * on} fill={editorial.accent} stroke={dark ? editorial.ink : editorial.bg} strokeWidth={4 * sw} />;
          })}
        </svg>
      )}

      {L.photos.slice(0, photos.length).map((box, i) => {
        const b = sb(box);
        const item = photos[i];
        const lb = L.labels[i] ? sb(L.labels[i]) : null;
        const labelIn = ramp(frame, start(i) + 10, 14);
        const fit: FitProps = item.fit === "cover" ? { fit: "cover", focal: item.focal } : { fit: "contain", focal: item.focal };
        return (
          <div key={item.src + i}>
            <Photo
              src={item.src}
              x={b.x}
              y={b.y}
              w={b.w}
              h={b.h}
              {...fit}
              at={start(i)}
              dur={pushFrames}
              zoom={item.zoom ?? pushRange}
              desaturate={item.desaturate}
              grain={item.grain}
              vignette={item.vignette}
              enter={enter}
              enterFrames={18}
            />
            {lb && item.label && (
              <div style={{ position: "absolute", left: lb.x, top: lb.y, width: lb.w, opacity: labelIn, textAlign: "center", fontFamily: toon.font.display, color: inkText }}>
                <div style={{ fontWeight: 800, fontSize: 34 * sw, lineHeight: 1.1 }}>{item.label}</div>
                {item.sub && <div style={{ fontFamily: toon.font.body, fontWeight: 700, fontSize: 24 * sw, color: subText, marginTop: 4 * sw }}>{item.sub}</div>}
              </div>
            )}
          </div>
        );
      })}

      {L.text && hasText && (() => {
        const t = sb(L.text);
        return (
          <div
            style={{
              position: "absolute",
              left: t.x,
              top: t.y,
              width: t.w,
              height: t.h,
              display: "flex",
              flexDirection: "column",
              justifyContent: centred ? "flex-start" : "center",
              alignItems: centred ? "center" : "flex-start",
              textAlign: centred ? "center" : "left",
              opacity: textIn,
              transform: `translateY(${(1 - textIn) * 14}px)`,
              color: inkText,
            }}
          >
            {children ?? (
              <>
                {kicker && <div style={{ fontFamily: toon.font.body, fontWeight: 800, fontSize: 26 * sw, letterSpacing: "0.14em", textTransform: "uppercase", color: kickText, marginBottom: 14 * sw }}>{kicker}</div>}
                {headline && <div style={{ fontFamily: toon.font.display, fontWeight: 800, fontSize: (centred ? 64 : 80) * sw, lineHeight: 1.04, letterSpacing: "-0.01em" }}>{headline}</div>}
                {!centred && <div style={{ width: 72 * sw, height: 6 * sw, borderRadius: 3, background: editorial.accent, margin: `${20 * sw}px 0` }} />}
                {body && <div style={{ fontFamily: toon.font.body, fontWeight: 600, fontSize: 34 * sw, lineHeight: 1.3, color: subText }}>{body}</div>}
              </>
            )}
          </div>
        );
      })()}
    </div>
  );
};
