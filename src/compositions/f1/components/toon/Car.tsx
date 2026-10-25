import { CSSProperties } from "react";
import { random, useCurrentFrame, useVideoConfig } from "remotion";
import { toon } from "../../../../theme";
import { wave } from "./anim";
import { mix, shade, tint } from "./color";

export type Livery = { main: string; secondary: string };

export const LIVERIES: Record<string, Livery> = {
  red: { main: toon.red, secondary: toon.paper },
  amber: { main: toon.amber, secondary: toon.groundDeep },
  mint: { main: toon.mint, secondary: toon.groundDeep },
  sky: { main: toon.sky, secondary: toon.paper },
  pink: { main: toon.pink, secondary: toon.groundDeep },
  old: { main: toon.old.red, secondary: toon.old.cream },
};

const DARK = "#1E2127";

/* ------------------------------------------------------------------ wheel */

const arc = (r: number, a0: number, a1: number) => {
  const p = (a: number) => `${(Math.cos((a * Math.PI) / 180) * r).toFixed(2)} ${(Math.sin((a * Math.PI) / 180) * r).toFixed(2)}`;
  return `M ${p(a0)} A ${r} ${r} 0 0 1 ${p(a1)}`;
};

const Wheel: React.FC<{ cx: number; cy: number; r: number; angle: number; mark: string }> = ({ cx, cy, r, angle, mark }) => (
  <g transform={`translate(${cx} ${cy})`}>
    <circle r={r} fill="#16181C" />
    <circle r={r * 0.9} fill="#272A30" />
    <g transform={`rotate(${angle})`}>
      <path d={arc(r * 0.76, 10, 120)} fill="none" stroke={mark} strokeWidth={r * 0.1} strokeLinecap="round" />
      <path d={arc(r * 0.76, 190, 230)} fill="none" stroke={mark} strokeWidth={r * 0.1} strokeLinecap="round" opacity={0.6} />
      <circle r={r * 0.56} fill="#DADADA" />
      <circle r={r * 0.46} fill="#33373E" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={-r * 0.07} y={-r * 0.46} width={r * 0.14} height={r * 0.46} rx={r * 0.07} fill="#DADADA" transform={`rotate(${i * 72})`} />
      ))}
      <circle r={r * 0.13} fill="#9A9CA2" />
      <circle cx={r * 0.34} cy={0} r={r * 0.045} fill="#9A9CA2" />
    </g>
  </g>
);

/* ------------------------------------------------------------------ speed lines / exhaust */

export type SpeedLinesProps = {
  width?: number;
  height?: number;
  count?: number;
  color?: string;
  /** Multiplier on how fast the lines stream by (default 1). */
  speed?: number;
  seed?: number;
  /** Direction the lines stream towards (default "left": something is moving right). */
  toward?: "left" | "right";
  style?: CSSProperties;
};

/** Horizontal streaks that stream past (frame-driven, deterministic). Place behind a moving object. */
export const SpeedLines: React.FC<SpeedLinesProps> = ({ width = 600, height = 200, count = 9, color = toon.cream, speed = 1, seed = 1, toward = "left", style }) => {
  const frame = useCurrentFrame();
  return (
    <svg width={width} height={height} style={{ overflow: "visible", display: "block", ...style }}>
      {Array.from({ length: count }, (_, i) => {
        const len = width * (0.18 + random(`sl${seed}-${i}`) * 0.3);
        const v = (22 + random(`sv${seed}-${i}`) * 26) * speed;
        const span = width + len;
        const k = ((((random(`sx${seed}-${i}`) * span - frame * v) % span) + span) % span) / span; // 0..1 along the span
        const px = toward === "left" ? k * span - len : width - k * span;
        const fade = Math.min(1, k * 4) * Math.min(1, (1 - k) * 4);
        const y = (i + 0.5 + (random(`sy${seed}-${i}`) - 0.5) * 0.6) * (height / count);
        return <rect key={i} x={px} y={y - 2.5} width={len} height={5} rx={2.5} fill={color} opacity={0.4 * fade} />;
      })}
    </svg>
  );
};

/** Little puffs drifting out of an exhaust / tyre smoke, looping. Origin is the SVG's (0,0)-ish left end. */
export const Exhaust: React.FC<{ puffs?: number; color?: string; size?: number; speed?: number; style?: CSSProperties }> = ({ puffs = 6, color = toon.cream, size = 1, speed = 1, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (frame / fps) * speed;
  return (
    <svg width={260 * size} height={120 * size} viewBox="-240 -60 260 120" style={{ overflow: "visible", display: "block", ...style }}>
      {Array.from({ length: puffs }, (_, i) => {
        const k = (t * 1.1 + i / puffs) % 1;
        return <circle key={i} cx={-k * 220} cy={-k * 26 + Math.sin(k * 7 + i * 2) * 8} r={6 + k * 26} fill={color} opacity={0.36 * (1 - k)} />;
      })}
    </svg>
  );
};

/* ------------------------------------------------------------------ side-view car */

export type CarProps = {
  livery?: Livery;
  /** Race number on the nose roundel. */
  number?: number | string;
  /** 0 = parked (idle engine shiver), 1 = flat out. Drives wheel spin, body vibration, speed lines, dust. */
  speed?: number;
  /** Width in px (nominal drawing is 640 wide). */
  size?: number;
  /** "right" (default, nose to the right) or "left" (mirrored). */
  facing?: "right" | "left";
  helmetColor?: string;
  /** Tyre compound marking colour (default red = soft). */
  tyre?: string;
  /** Speed streaks behind the car (default: on when speed > 0.3). */
  speedLines?: boolean;
  /** Dust/smoke puffs behind the rear wheel (default: on when speed > 0.2). */
  dust?: boolean;
  shadow?: boolean;
  /** Absolute placement: x = centre of the wheelbase, y = ground line (bottom of the tyres). */
  x?: number;
  y?: number;
  style?: CSSProperties;
};

const W = 640;
const H = 230;
const GROUND_Y = 210;

/** Modern flat F1 car, side view (nominal 640x230, nose right). */
export const Car: React.FC<CarProps> = ({
  livery = LIVERIES.red,
  number = 1,
  speed = 0,
  size = 640,
  facing = "right",
  helmetColor = toon.paper,
  tyre = toon.red,
  speedLines,
  dust,
  shadow = true,
  x,
  y,
  style,
}) => {
  const frame = useCurrentFrame();
  const { main, secondary } = livery;
  const k = size / W;
  const dir = facing === "right" ? 1 : -1;
  const spin = frame * 11 * speed;
  const vib = (wave(frame / 30, 0.09) * 1.1 + wave(frame / 30, 0.23, 0.3) * 0.7) * speed + wave(frame / 30, 0.1) * 0.35;
  const showLines = speedLines ?? speed > 0.3;
  const showDust = dust ?? speed > 0.2;
  const sidepod = tint(main, 0.1);

  const anchor = (facing === "right" ? 340 : W - 340) * k; // wheelbase centre, from the left edge
  const pos: CSSProperties = x !== undefined || y !== undefined ? { position: "absolute", left: (x ?? 0) - anchor, top: (y ?? 0) - GROUND_Y * k } : {};

  return (
    <svg width={W * k} height={H * k} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", display: "block", ...pos, ...style }}>
      <g transform={facing === "left" ? `translate(${W} 0) scale(-1 1)` : undefined}>
        {shadow && <ellipse cx={340} cy={GROUND_Y + 3} rx={300} ry={9} fill={toon.groundDeep} opacity={0.35} />}

        {showLines && (
          <g transform="translate(-330 20)">
            <SpeedLines width={420} height={180} count={8} speed={0.6 + speed} seed={3} />
          </g>
        )}
        {showDust && (
          <g transform="translate(110 200)">
            <Exhaust puffs={5} size={1} speed={0.6 + speed} color={mix(toon.ink, toon.ground, 0.8)} />
          </g>
        )}

        <g transform={`translate(0 ${vib})`}>
          {/* rear wing */}
          <rect x={92} y={104} width={12} height={46} rx={3} fill={DARK} />
          <path d="M 52 68 L 112 64 L 116 112 L 62 120 Z" fill={shade(main, 0.22)} stroke={shade(main, 0.22)} strokeWidth={4} strokeLinejoin="round" />
          <path d="M 46 58 L 122 55 L 122 66 L 46 70 Z" fill={secondary} stroke={secondary} strokeWidth={3} strokeLinejoin="round" />
          <path d="M 56 92 L 116 90 L 116 97 L 56 99 Z" fill={DARK} />
          <path d="M 100 142 L 72 160 L 100 166 Z" fill={DARK} />

          {/* suspension */}
          <g stroke={DARK} strokeWidth={5} strokeLinecap="round">
            <path d="M 150 160 L 214 138 M 150 160 L 206 124" />
            <path d="M 510 166 L 452 146 M 510 166 L 440 134" />
          </g>

          {/* floor / plank */}
          <rect x={104} y={154} width={430} height={16} rx={7} fill={DARK} />

          {/* body */}
          <path
            d="M 100 160 L 102 108 C 130 102 176 90 220 70 L 262 58 C 280 60 288 80 306 92 L 348 96 C 420 100 500 114 580 128 C 606 132 622 138 624 146 C 622 154 600 158 580 158 L 330 160 Z"
            fill={main}
          />
          <path d="M 100 160 L 104 142 C 200 150 400 146 574 150 L 574 158 L 330 160 Z" fill="#000" opacity={0.14} />
          <path d="M 118 112 C 160 104 200 90 244 72" fill="none" stroke={tint(main, 0.28)} strokeWidth={6} strokeLinecap="round" opacity={0.7} />
          {/* nose stripe */}
          <path d="M 380 110 L 580 140 L 582 149 L 384 121 Z" fill={secondary} />

          {/* sidepod */}
          <path d="M 186 160 C 190 130 206 112 232 106 C 290 94 366 98 410 110 C 428 116 434 140 432 160 Z" fill={sidepod} />
          <path d="M 222 130 C 280 120 342 120 414 130 L 418 140 C 342 132 280 132 216 142 Z" fill={secondary} />
          <path d="M 186 160 L 192 146 L 426 146 L 432 160 Z" fill="#000" opacity={0.12} />
          <ellipse cx={420} cy={134} rx={10} ry={21} fill={DARK} />

          {/* cockpit, driver, halo */}
          <ellipse cx={308} cy={92} rx={42} ry={10} fill={DARK} />
          <circle cx={304} cy={80} r={18} fill={helmetColor} />
          <path d="M 308 72 Q 324 73 322 84 L 308 87 Z" fill="#17191D" />
          <path d="M 292 70 Q 298 64 306 63" fill="none" stroke={main} strokeWidth={5} strokeLinecap="round" />
          <path d="M 276 96 Q 306 99 346 97 L 346 106 L 276 106 Z" fill={main} />
          <ellipse cx={266} cy={74} rx={6} ry={12} fill={DARK} />
          <circle cx={346} cy={90} r={5} fill={secondary} />
          <path d="M 349 97 L 341 74 C 322 58 290 58 272 68 M 272 68 L 264 88" fill="none" stroke="#17191D" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />

          {/* front wing */}
          <rect x={545} y={148} width={9} height={22} rx={3} fill={DARK} />
          <rect x={516} y={168} width={128} height={9} rx={4.5} fill={secondary} />
          <rect x={538} y={160} width={100} height={6} rx={3} fill={shade(main, 0.3)} />
          <path d="M 614 150 L 640 150 L 642 180 L 610 180 Z" fill={main} stroke={main} strokeWidth={4} strokeLinejoin="round" />
          <path d="M 618 158 L 636 158 L 637 172 L 617 172 Z" fill="#000" opacity={0.14} />

          {/* number roundel */}
          <circle cx={450} cy={126} r={15} fill={toon.paper} />
          <text
            x={450}
            y={126}
            textAnchor="middle"
            dominantBaseline="central"
            transform={facing === "left" ? "translate(900 0) scale(-1 1)" : undefined}
            fontFamily={toon.font.display}
            fontWeight={800}
            fontSize={String(number).length > 1 ? 17 : 22}
            fill={toon.groundDeep}
          >
            {number}
          </text>

          {/* wheels */}
          <Wheel cx={150} cy={160} r={50} angle={spin * dir} mark={tyre} />
          <Wheel cx={510} cy={166} r={44} angle={spin * 1.13 * dir} mark={tyre} />
        </g>
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------------ top-down car */

const TOP_W = 240;
const TOP_H = 90;

/** Top-down car art (nominal 240x90, nose right) as an SVG group centred on (0,0). Used by Track; also embeddable. */
export const CarTopArt: React.FC<{ livery?: Livery; number?: number | string; helmetColor?: string }> = ({ livery = LIVERIES.red, helmetColor = toon.paper }) => (
  <g transform={`translate(${-TOP_W / 2} ${-TOP_H / 2})`}>
    {/* wheels */}
    <g fill="#16181C">
      <rect x={34} y={0} width={40} height={24} rx={9} />
      <rect x={34} y={66} width={40} height={24} rx={9} />
      <rect x={168} y={4} width={32} height={20} rx={8} />
      <rect x={168} y={66} width={32} height={20} rx={8} />
    </g>
    {/* rear wing */}
    <rect x={2} y={8} width={20} height={74} rx={6} fill={livery.secondary} />
    <rect x={14} y={8} width={6} height={74} rx={3} fill="#000" opacity={0.18} />
    {/* body */}
    <path d="M 22 38 L 60 32 C 90 24 134 26 156 38 L 214 41 Q 228 45 214 49 L 156 52 C 134 64 90 66 60 58 L 22 52 Z" fill={livery.main} />
    <path d="M 70 40 C 110 38 160 40 214 43 L 214 47 C 160 50 110 52 70 50 Z" fill={livery.secondary} />
    {/* front wing */}
    <rect x={206} y={4} width={22} height={82} rx={7} fill={livery.secondary} />
    <rect x={222} y={4} width={6} height={82} rx={3} fill="#000" opacity={0.18} />
    <circle cx={112} cy={45} r={10} fill={helmetColor} />
    <path d="M 118 40 Q 124 45 118 50 Z" fill="#17191D" />
  </g>
);

export type CarTopProps = {
  livery?: Livery;
  number?: number | string;
  /** Width in px (nominal 240). */
  size?: number;
  /** Rotation in degrees (0 = nose right). */
  angle?: number;
  /** Absolute placement of the centre. */
  x?: number;
  y?: number;
  style?: CSSProperties;
};

/** Top-down simplified car for maps and diagrams. */
export const CarTop: React.FC<CarTopProps> = ({ livery, number, size = 240, angle = 0, x, y, style }) => {
  const k = size / TOP_W;
  const pos: CSSProperties = x !== undefined || y !== undefined ? { position: "absolute", left: (x ?? 0) - size / 2, top: (y ?? 0) - (TOP_H * k) / 2 } : {};
  return (
    <svg width={size} height={TOP_H * k} viewBox={`0 0 ${TOP_W} ${TOP_H}`} style={{ overflow: "visible", display: "block", ...pos, ...style }}>
      <g transform={`translate(${TOP_W / 2} ${TOP_H / 2}) rotate(${angle})`}>
        <CarTopArt livery={livery} number={number} />
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------------ track */

export type TrackShape = "oval" | "circuit";

/**
 * Position + heading (degrees, 0 = +x) on a closed track for progress `u` (any real; wraps at 1).
 * Pure function of (shape, u, width, height): no path measuring needed. Coordinates are inside the
 * Track svg (width x height) with a 70px margin.
 */
export const trackPoint = (shape: TrackShape, u: number, width: number, height: number) => {
  const f = (v: number) => {
    const th = Math.PI * 2 * v;
    const a = width / 2 - 70;
    const b = height / 2 - 70;
    if (shape === "oval") {
      const n = 2.7;
      const c = Math.cos(th);
      const s = Math.sin(th);
      return { x: width / 2 + a * Math.sign(c) * Math.abs(c) ** (2 / n), y: height / 2 + b * Math.sign(s) * Math.abs(s) ** (2 / n) };
    }
    const r = 1 + 0.2 * Math.cos(3 * th + 0.6) + 0.12 * Math.sin(2 * th + 1) + 0.05 * Math.cos(5 * th);
    return { x: width / 2 + a * 0.92 * r * Math.cos(th), y: height / 2 + b * 0.92 * r * Math.sin(th) };
  };
  const p = f(u);
  const q = f(u + 0.002);
  return { x: p.x, y: p.y, angle: (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI };
};

export type TrackCar = { progress: number; livery?: Livery; number?: number | string; size?: number };

export type TrackProps = {
  width?: number;
  height?: number;
  shape?: TrackShape;
  /** 0..1: how much of the track is drawn (draw-on effect). Default 1. */
  draw?: number;
  /** Cars on the track; `progress` is any real number (laps wrap). Compute it from the frame. */
  cars?: TrackCar[];
  /** Track band width in px (default 46). */
  lane?: number;
  /** Asphalt colour (default a lighter plum). */
  asphalt?: string;
  kerbs?: boolean;
  /** Chequered start/finish line at progress 0. */
  startLine?: boolean;
  /** Absolute placement of the centre. */
  x?: number;
  y?: number;
  style?: CSSProperties;
};

/** Closed race-track diagram with top-down cars moving along it. */
export const Track: React.FC<TrackProps> = ({ width = 900, height = 560, shape = "circuit", draw = 1, cars = [], lane = 46, asphalt = toon.groundAlt, kerbs = true, startLine = true, x, y, style }) => {
  const N = 220;
  let d = "";
  for (let i = 0; i < N; i++) {
    const p = trackPoint(shape, i / N, width, height);
    d += `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
  }
  d += "Z";
  const start = trackPoint(shape, 0, width, height);
  const dash = `${draw} 2`;
  const pos: CSSProperties = x !== undefined || y !== undefined ? { position: "absolute", left: (x ?? 0) - width / 2, top: (y ?? 0) - height / 2 } : {};

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible", display: "block", ...pos, ...style }}>
      {kerbs && <path d={d} pathLength={1} fill="none" stroke={toon.paper} strokeWidth={lane + 12} strokeLinejoin="round" strokeDasharray={dash} opacity={0.9} />}
      {kerbs && draw >= 1 && <path d={d} pathLength={1} fill="none" stroke={toon.red} strokeWidth={lane + 12} strokeLinejoin="round" strokeDasharray="0.012 0.012" />}
      <path d={d} pathLength={1} fill="none" stroke={asphalt} strokeWidth={lane} strokeLinejoin="round" strokeDasharray={dash} />
      <path d={d} pathLength={1} fill="none" stroke={toon.cream} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={`0.012 0.012`} opacity={draw >= 1 ? 0.35 : 0} />
      {startLine && draw >= 1 && (
        <g transform={`translate(${start.x} ${start.y}) rotate(${start.angle})`}>
          {Array.from({ length: 6 }, (_, r) =>
            [0, 1].map((c) => <rect key={`${r}${c}`} x={-8 + c * 8} y={-lane / 2 + (r * lane) / 6} width={8} height={lane / 6} fill={(r + c) % 2 ? toon.paper : toon.groundDeep} />),
          )}
        </g>
      )}
      {cars.map((c, i) => {
        const p = trackPoint(shape, ((c.progress % 1) + 1) % 1, width, height);
        const s = (c.size ?? 72) / TOP_W;
        return (
          <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.angle}) scale(${s})`}>
            <CarTopArt livery={c.livery ?? LIVERIES.red} number={c.number} />
          </g>
        );
      })}
    </svg>
  );
};
