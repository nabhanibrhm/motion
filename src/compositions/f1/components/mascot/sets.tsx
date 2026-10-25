import React, { ReactNode } from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { editorial, objects, toon } from "../../../../theme";
import { clamp, ramp } from "../toon/anim";
import { BoardArt, TicketsArt } from "./props";

/*
 * Reusable set pieces for the mascot story. All are absolutely positioned in frame px, frame-driven, and take
 * `at` / `exitAt` in frames of the containing Sequence. They draw no background, so they sit on any scene ground.
 */

type PieceTiming = {
  /** Frame it appears (default 0). */
  at?: number;
  /** Frame it starts leaving (optional) and the length of the fade. */
  exitAt?: number;
  exitFrames?: number;
  /** Entrance: "fade" (default), "pop", "slide-left" / "slide-right" (comes in from that edge), "none". */
  enter?: "none" | "fade" | "pop" | "slide-left" | "slide-right";
  enterFrames?: number;
};

/** Shared entrance/exit wrapper: returns null outside the piece's lifetime. */
const Piece: React.FC<PieceTiming & { x: number; y: number; w: number; h: number; originY?: number; scale: number; children: ReactNode }> = ({
  x,
  y,
  w,
  h,
  originY = 1,
  scale,
  at = 0,
  exitAt,
  exitFrames = 10,
  enter = "fade",
  enterFrames,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  if (frame < at || (exitAt !== undefined && frame >= exitAt + exitFrames)) return null;
  const ef = enterFrames ?? (enter.startsWith("slide") ? 28 : enter === "pop" ? 14 : 12);
  const p = enter === "none" ? 1 : Math.min(1, Math.max(0, (frame - at) / ef));
  const out = exitAt === undefined ? 1 : 1 - ramp(frame, exitAt, exitFrames);
  let dx = 0;
  let s = 1;
  if (enter === "slide-left" || enter === "slide-right") {
    const from = enter === "slide-left" ? -(w * scale) / 2 - 100 : width + (w * scale) / 2 + 100;
    dx = (from - x) * (1 - Easing.out(Easing.cubic)(p));
  }
  if (enter === "pop") s = 0.4 + 0.6 * spring({ frame: frame - at, fps, config: { damping: 13, stiffness: 170, mass: 0.7 } });
  return (
    <div
      style={{
        position: "absolute",
        left: x - (w * scale) / 2,
        top: y - h * scale * originY,
        width: w * scale,
        height: h * scale,
        opacity: (enter === "none" || enter.startsWith("slide") ? 1 : Math.min(1, p * 2.5)) * out,
        transform: `translateX(${dx}px) scale(${s})`,
        transformOrigin: `50% ${originY * 100}%`,
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  );
};

/* ------------------------------------------------------------ VelvetDoor */

const DOOR = { w: 300, h: 560 }; // overall box (units = px at scale 1)
const OPENING = { x: 40, y: 70, w: 220, h: 440 }; // doorway inside the box
const FLOOR = 520; // y of the floor line inside the box

export type VelvetDoorProps = PieceTiming & {
  /** Floor-centre of the door in frame px. */
  x: number;
  y: number;
  /** 1 = 300 x 560 px. */
  scale?: number;
  /** Frame at which the door starts swinging open (omit for a closed door) and how long it takes. */
  openAt?: number;
  openFrames?: number;
  /** Velvet rope across the front (default true). It unhooks and drops when the door opens. */
  rope?: boolean;
  /** Drawn inside the doorway, behind the door leaf (e.g. a small image or a garage glimpse). */
  children?: ReactNode;
};

/**
 * A tall velvet door with brass posts and a rope. Closed until `openAt`, then the leaf swings open on its left hinge,
 * warm light fills the doorway and spills onto the floor. Use the same component (openAt={0}) for the ending's open door.
 */
export const VelvetDoor: React.FC<VelvetDoorProps> = ({ x, y, scale = 1, openAt, openFrames = 26, rope = true, children, ...timing }) => {
  const frame = useCurrentFrame();
  const o = openAt === undefined ? 0 : Easing.inOut(Easing.cubic)(ramp(frame, openAt, openFrames, (t) => t));
  const sx = Math.cos(o * 1.38); // leaf foreshortens as it swings
  const skew = -o * 7;
  const { x: ox, y: oy, w: ow, h: oh } = OPENING;
  const light = o;
  const post = (px: number) => (
    <g>
      <ellipse cx={px} cy={FLOOR} rx={26} ry={7} fill="#1A1A1A" opacity={0.18} />
      <path d={`M ${px - 22} ${FLOOR} q 0 -10 22 -10 q 22 0 22 10 z`} fill={objects.brass} stroke="#1A1A1A" strokeWidth={4} strokeLinejoin="round" />
      <rect x={px - 6} y={FLOOR - 190} width={12} height={180} fill={objects.brass} stroke="#1A1A1A" strokeWidth={4} />
      <circle cx={px} cy={FLOOR - 198} r={13} fill={objects.brass} stroke="#1A1A1A" strokeWidth={4} />
    </g>
  );
  const pL = 10;
  const pR = DOOR.w - 10;
  const ropeSag = 34 + o * 150;
  const ropeY = FLOOR - 190;

  return (
    <Piece x={x} y={y} w={DOOR.w} h={DOOR.h} originY={FLOOR / DOOR.h} scale={scale} {...timing}>
      <svg viewBox={`0 0 ${DOOR.w} ${DOOR.h}`} width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {/* frame + doorway interior */}
        <rect x={ox - 16} y={oy - 16} width={ow + 32} height={oh + 32} rx={8} fill={objects.wood} stroke="#1A1A1A" strokeWidth={5} />
        <rect x={ox} y={oy} width={ow} height={oh} fill="#2A1520" />
        <defs>
          <linearGradient id="vd-light" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFF6DC" />
            <stop offset="1" stopColor="#FFD98A" />
          </linearGradient>
        </defs>
        <rect x={ox} y={oy} width={ow} height={oh} fill="url(#vd-light)" opacity={light} />
        {/* light spilling onto the floor */}
        <path d={`M ${ox} ${oy + oh} L ${ox + ow} ${oy + oh} L ${ox + ow + 70} ${FLOOR + 20} L ${ox - 70} ${FLOOR + 20} Z`} fill="#FFE9A8" opacity={0.55 * light} />
      </svg>
      {children && (
        <div style={{ position: "absolute", left: ox, top: oy, width: ow, height: oh, overflow: "hidden", opacity: light }}>{children}</div>
      )}
      <svg viewBox={`0 0 ${DOOR.w} ${DOOR.h}`} width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {/* door leaf, hinged on the left edge of the opening */}
        <g transform={`translate(${ox} 0) skewY(${skew}) scale(${sx} 1) translate(${-ox} 0)`}>
          <rect x={ox} y={oy} width={ow} height={oh} fill={objects.velvet} stroke="#1A1A1A" strokeWidth={5} />
          <g fill="none" stroke="#000" strokeOpacity={0.28} strokeWidth={3}>
            <rect x={ox + 22} y={oy + 28} width={ow - 44} height={150} rx={4} />
            <rect x={ox + 22} y={oy + 200} width={ow - 44} height={200} rx={4} />
          </g>
          {[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => <circle key={`${r}${c}`} cx={ox + 60 + c * 50} cy={oy + 220 + r * 55} r={4.5} fill="#000" opacity={0.28} />))}
          {/* keyhole plate and handle */}
          <rect x={ox + ow - 52} y={oy + 205} width={28} height={50} rx={14} fill={objects.brass} stroke="#1A1A1A" strokeWidth={3.5} />
          <circle cx={ox + ow - 38} cy={oy + 224} r={5.5} fill="#1A1A1A" />
          <path d={`M ${ox + ow - 38} ${oy + 224} l -4 20 h 8 z`} fill="#1A1A1A" />
          <circle cx={ox + ow - 38} cy={oy + 190} r={9} fill={objects.brass} stroke="#1A1A1A" strokeWidth={3.5} />
        </g>
        {/* floor line */}
        <rect x={-30} y={FLOOR} width={DOOR.w + 60} height={6} rx={3} fill="#1A1A1A" opacity={0.12} />
        {/* rope posts and the velvet rope */}
        {post(pL)}
        {post(pR)}
        {rope && (
          <path
            d={`M ${pL} ${ropeY - 4} Q ${(pL + pR) / 2} ${ropeY + ropeSag} ${pR} ${ropeY - 4}`}
            fill="none"
            stroke={objects.velvet}
            strokeWidth={9}
            strokeLinecap="round"
            opacity={1 - interpolate(o, [0.5, 1], [0, 1], clamp)}
          />
        )}
      </svg>
    </Piece>
  );
};

/* --------------------------------------------------------------- Tickets */

export type TicketsProps = PieceTiming & {
  /** Centre of the fan (its bottom pivot) in frame px. */
  x: number;
  y: number;
  /** 1 = tickets 64 px wide; props held by mascots are drawn at 1. A stage prop usually wants 1.6-2.4. */
  scale?: number;
  count?: number;
  /** Tilt in degrees. */
  angle?: number;
};

/** Race tickets lying or floating on the stage: for a handoff, a close-up, or the ending's "only two". */
export const Tickets: React.FC<TicketsProps> = ({ x, y, scale = 2, count = 2, angle = 0, ...timing }) => (
  <Piece x={x} y={y} w={110} h={90} originY={1} scale={scale} {...timing}>
    <svg viewBox="-55 -90 110 90" width="100%" height="100%" style={{ overflow: "visible", transform: `rotate(${angle}deg)`, transformOrigin: "50% 100%" }}>
      <TicketsArt count={count} />
    </svg>
  </Piece>
);

/* ------------------------------------------------------------ StoryBoard */

export type StoryBoardProps = PieceTiming & {
  /** Centre in frame px. */
  x: number;
  y: number;
  /** 1 = 420 x 300 px. */
  scale?: number;
  cols?: number;
  rows?: number;
  /** Tile to ring in the accent colour from `highlightAt` (omit for none). */
  highlight?: number;
  highlightAt?: number;
  /** Show two little easel legs under the frame. */
  stand?: boolean;
  children?: ReactNode;
};

/** A framed board of driver portraits. Static art, no photos: tiles are abstract busts in varied skin tones and helmet colours. */
export const StoryBoard: React.FC<StoryBoardProps> = ({ x, y, scale = 1, cols = 3, rows = 2, highlight, highlightAt = 0, stand = false, children, ...timing }) => {
  const frame = useCurrentFrame();
  const W = 420;
  const H = 300;
  const hl = highlight === undefined ? 0 : ramp(frame, highlightAt, 10);
  return (
    <Piece x={x} y={y} w={W} h={H + (stand ? 70 : 0)} originY={0.5 * (H / (H + (stand ? 70 : 0)))} scale={scale} {...timing}>
      <svg viewBox={`${-W / 2} ${-H / 2} ${W} ${H + (stand ? 70 : 0)}`} width="100%" height="100%" style={{ overflow: "visible" }}>
        {stand && (
          <g stroke="#1A1A1A" strokeWidth={5} strokeLinecap="round" fill="none">
            <path d={`M -90 ${H / 2} L -120 ${H / 2 + 66}`} stroke={objects.wood} />
            <path d={`M 90 ${H / 2} L 120 ${H / 2 + 66}`} stroke={objects.wood} />
          </g>
        )}
        <BoardArt w={W} h={H} cols={cols} rows={rows} highlight={highlight ?? -1} highlightAmount={hl} />
      </svg>
      {children && <div style={{ position: "absolute", inset: 0 }}>{children}</div>}
    </Piece>
  );
};

/* --------------------------------------------------------------- TripMap */

const MAP = { w: 600, h: 360 };
// A simplified outline of the contiguous US (stylised, not cartographic).
const US_PATH =
  "M38 38 L190 32 L330 34 L360 50 L400 46 L430 66 L470 52 L520 30 L560 28 L566 62 L540 100 L530 150 L510 200 L505 250 L520 300 L505 332 L480 318 L455 262 L420 262 L390 285 L345 292 L300 314 L268 306 L250 275 L215 262 L190 270 L120 255 L80 235 L52 195 L40 150 L34 100 Z";

/** Pin positions on the TripMap as 0..1 fractions (u across, v down) for the three US races. */
export const US_CITIES = {
  austin: { u: 318 / 600, v: 268 / 360, label: "Austin" },
  miami: { u: 500 / 600, v: 318 / 360, label: "Miami" },
  vegas: { u: 120 / 600, v: 185 / 360, label: "Las Vegas" },
} as const;

export type MapPin = {
  label: string;
  /** Frame the pin drops in. */
  at: number;
  /** Position on the map, 0..1 across / down (see `US_CITIES`). */
  u: number;
  v: number;
  /** Pin colour (default accent). */
  color?: string;
};

export type TripMapProps = PieceTiming & {
  /** Centre in frame px. */
  x: number;
  y: number;
  /** 1 = 600 x 360 px. */
  scale?: number;
  pins?: readonly MapPin[];
  /** Frames the map takes to unfold (default 22). */
  unfoldFrames?: number;
};

/** A stylised US map on paper that unfolds, then pins drop on it one by one with a label chip. */
export const TripMap: React.FC<TripMapProps> = ({ x, y, scale = 1, pins = [], unfoldFrames = 22, ...timing }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = timing.at ?? 0;
  const u = Easing.out(Easing.cubic)(ramp(frame, at, unfoldFrames, (t) => t));
  return (
    <Piece x={x} y={y} w={MAP.w} h={MAP.h} originY={0.5} scale={scale} {...timing} enter="none">
      <div style={{ position: "absolute", inset: 0, transform: `scaleY(${0.08 + 0.92 * u})`, opacity: Math.min(1, u * 3), transformOrigin: "50% 50%" }}>
        <svg viewBox={`0 0 ${MAP.w} ${MAP.h}`} width="100%" height="100%" style={{ overflow: "visible" }}>
          <rect x={0} y={0} width={MAP.w} height={MAP.h} rx={10} fill={objects.paper} stroke="#1A1A1A" strokeWidth={5} />
          <path d={`M ${MAP.w / 3} 4 V ${MAP.h - 4} M ${(MAP.w * 2) / 3} 4 V ${MAP.h - 4}`} stroke="#1A1A1A" strokeOpacity={0.18} strokeWidth={3} />
          <path d={US_PATH} fill={objects.liveries.mint} fillOpacity={0.35} stroke="#1A1A1A" strokeOpacity={0.55} strokeWidth={3} strokeLinejoin="round" />
        </svg>
      </div>
      {u >= 1 &&
        pins.map((p, i) => {
          if (frame < p.at) return null;
          const k = spring({ frame: frame - p.at, fps, config: { damping: 11, stiffness: 200, mass: 0.6 } });
          const px = p.u * MAP.w;
          const py = p.v * MAP.h;
          const color = p.color ?? editorial.accent;
          return (
            <div key={`${p.label}${i}`} style={{ position: "absolute", left: px, top: py, width: 0, height: 0 }}>
              <svg width={60} height={80} viewBox="-30 -70 60 80" style={{ position: "absolute", left: -30, top: -70, overflow: "visible", transform: `translateY(${(1 - k) * -50}px)`, opacity: Math.min(1, k * 3) }}>
                <path d="M0 8 C-18 -16 -20 -26 -20 -34 A20 20 0 1 1 20 -34 C20 -26 18 -16 0 8 Z" fill={color} stroke="#1A1A1A" strokeWidth={4} strokeLinejoin="round" />
                <circle cx={0} cy={-34} r={7.5} fill={editorial.white} />
              </svg>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 16,
                  transform: "translateX(-50%)",
                  whiteSpace: "nowrap",
                  padding: "4px 14px",
                  borderRadius: 999,
                  background: editorial.white,
                  boxShadow: `0 0 0 2px ${editorial.rule}`,
                  fontFamily: toon.font.body,
                  fontWeight: 800,
                  fontSize: 24,
                  color: editorial.ink,
                  opacity: Math.min(1, k * 2),
                }}
              >
                {p.label}
              </div>
            </div>
          );
        })}
    </Piece>
  );
};
