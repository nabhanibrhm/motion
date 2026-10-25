import React from "react";
import { random } from "remotion";
import { mascot } from "../../../../theme";

export type MascotCharacter = "mog" | "wec" | "bog";

/** Arm / body gestures. "startle" = both hands up (big surprise). */
export type Pose = "idle" | "point" | "wave" | "cheer" | "think" | "shrug" | "peek" | "hold" | "listen" | "startle";
export type Expression = "neutral" | "happy" | "surprised" | "confused" | "smug";
export type Prop = "none" | "tickets" | "phone" | "map" | "storyboard";

// Shared drawing canvas: every character is drawn in this box with feet on y = FEET_Y,
// so switching state or character never moves the baseline.
export const VIEW = { x: -20, y: 0, w: 440, h: 480 } as const;
export const FEET_Y = 462;

export const INK = mascot.ink;
export const SW = 5; // outline width

/** Everything a character needs to draw one frame. All values are derived from the frame (deterministic). */
export type FigureProps = {
  /** Frame used for blink and idle drift. */
  frame: number;
  fps: number;
  /** Seed salt so two instances of one character do not blink together. */
  seed?: string;
  /** Effective arm pose, frames since it began, and the pose it is blending away from. */
  pose: Pose;
  poseFrame: number;
  prevPose?: Pose;
  /** 0..1 progress of the arm blend prevPose -> pose. */
  blend: number;
  /** Direction of "point" in degrees (0 = right, -90 = up, 180 = left); also picks the pointing arm. */
  pointAngle: number;
  expr: Expression;
  exprFrame: number;
  talking: boolean;
  /** Frames since the current talking range began. */
  talkFrame: number;
  /** Pupil direction, each -1..1. null = the character's idle look. */
  look: [number, number] | null;
  /** Face turn, -1 (viewer-left) .. 1 (viewer-right): shifts the face to fake a head turn. */
  turn: number;
  prop: Prop;
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** 0..1 blink amount; a periodic, slightly irregular blink derived from the frame. */
export const blinkAmount = (frame: number, seed: string) => {
  const PERIOD = 104;
  const DUR = 7;
  const k0 = Math.floor(frame / PERIOD);
  for (let k = k0 - 1; k <= k0; k++) {
    const start = k * PERIOD + 20 + random(`${seed}-blink-${k}`) * 52;
    const d = frame - start;
    if (d >= 0 && d < DUR) return 1 - Math.abs((d / DUR) * 2 - 1);
  }
  return 0;
};

/** 0..1 mouth opening for a stylised talk loop: a syllable-like pulse with varied heights. */
export const talkAmount = (stateFrame: number, fps: number, seed: string) => {
  const t = (stateFrame / fps) * 4.2;
  const syl = Math.floor(t);
  const p = t - syl;
  const height = 0.5 + 0.5 * random(`${seed}-syl-${syl}`);
  return Math.sin(Math.PI * p) ** 0.8 * height;
};

/* ----------------------------------------------------------------- eyes */

export type EyeSpec = { cx: number; cy: number; rx: number; ry: number; pr: number };

type EyeProps = EyeSpec & {
  id: string;
  /** pupil direction, -1..1 each axis */
  look: [number, number];
  /** 0..1 lid coverage from the top */
  lid: number;
  /** slope of the lid edge in px (positive = outer end lower) */
  lidTilt?: number;
  lidFill: string;
  scale?: number;
};

export const Eye: React.FC<EyeProps> = ({ id, cx, cy, rx, ry, pr, look, lid, lidTilt = 0, lidFill, scale = 1 }) => {
  const rX = rx * scale;
  const rY = ry * scale;
  const px = cx + look[0] * rX * 0.42;
  const py = cy + look[1] * rY * 0.42;
  const lidY = cy - rY + lid * 2 * rY;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <ellipse cx={cx} cy={cy} rx={rX} ry={rY} />
        </clipPath>
      </defs>
      <ellipse cx={cx} cy={cy} rx={rX} ry={rY} fill={mascot.cream} />
      <g clipPath={`url(#${id})`}>
        <circle cx={px} cy={py} r={pr} fill={mascot.deep} />
        <circle cx={px - pr * 0.32} cy={py - pr * 0.36} r={pr * 0.34} fill={mascot.cream} />
        <circle cx={px + pr * 0.38} cy={py + pr * 0.42} r={pr * 0.14} fill={mascot.cream} opacity={0.85} />
        {lid > 0.01 && (
          <>
            <path
              d={`M ${cx - rX - 4} ${cy - rY - 6} L ${cx + rX + 4} ${cy - rY - 6} L ${cx + rX + 4} ${lidY + lidTilt} L ${cx - rX - 4} ${lidY - lidTilt} Z`}
              fill={lidFill}
            />
            <line x1={cx - rX - 4} y1={lidY - lidTilt} x2={cx + rX + 4} y2={lidY + lidTilt} stroke={INK} strokeWidth={4.5} />
          </>
        )}
      </g>
      <ellipse cx={cx} cy={cy} rx={rX} ry={rY} fill="none" stroke={INK} strokeWidth={SW} />
    </g>
  );
};

/** Small curved brow above an eye. `raise` lifts it (px), `tilt` rotates the inner end up/down. */
export const Brow: React.FC<{ cx: number; cy: number; w: number; raise?: number; tilt?: number }> = ({ cx, cy, w, raise = 0, tilt = 0 }) => (
  <path
    d={`M ${cx - w / 2} ${cy - raise + tilt} Q ${cx} ${cy - raise - 9} ${cx + w / 2} ${cy - raise - tilt}`}
    fill="none"
    stroke={INK}
    strokeWidth={4.5}
    strokeLinecap="round"
  />
);

export const Cheek: React.FC<{ cx: number; cy: number; rx?: number; ry?: number }> = ({ cx, cy, rx = 24, ry = 18 }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={mascot.cheek} opacity={0.62} />
);

/* ---------------------------------------------------------------- mouths */

export type MouthKind = "line" | "open" | "o" | "hmm" | "smirk";

type MouthProps = {
  cx: number;
  cy: number;
  w: number;
  kind: MouthKind;
  /** 0..1 openness for kind="open" */
  amt?: number;
  teeth: "two" | "one" | "none";
  /** Max open height in px. */
  hMax?: number;
  /** Unique key per mascot instance so clip ids never collide. */
  idKey?: string;
};

const Teeth: React.FC<{ x: number; y: number; teeth: "two" | "one" | "none"; size?: number }> = ({ x, y, teeth, size = 1 }) => {
  if (teeth === "none") return null;
  const tw = 15 * size;
  const th = 17 * size;
  if (teeth === "one") return <rect x={x - 3} y={y} width={tw} height={th} rx={3} fill={mascot.cream} stroke={INK} strokeWidth={3.5} />;
  return (
    <>
      <rect x={x - tw - 0.5} y={y} width={tw} height={th} rx={3} fill={mascot.cream} stroke={INK} strokeWidth={3.5} />
      <rect x={x + 0.5} y={y} width={tw} height={th} rx={3} fill={mascot.cream} stroke={INK} strokeWidth={3.5} />
    </>
  );
};

export const Mouth: React.FC<MouthProps> = ({ cx, cy, w, kind, amt = 0, teeth, hMax = 40, idKey = "" }) => {
  if (kind === "o") {
    return (
      <g>
        <ellipse cx={cx} cy={cy + 6} rx={w * 0.2} ry={w * 0.26} fill={mascot.mouth} stroke={INK} strokeWidth={4.5} />
        <ellipse cx={cx} cy={cy + 14} rx={w * 0.11} ry={w * 0.09} fill={mascot.tongue} opacity={0.35} />
      </g>
    );
  }
  if (kind === "smirk") {
    const x0 = cx - w / 2;
    const x1 = cx + w / 2;
    return (
      <path d={`M ${x0 + 4} ${cy + 6} Q ${cx} ${cy + 12} ${x1} ${cy - 7}`} fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
    );
  }
  if (kind === "hmm") {
    const x0 = cx - w * 0.3;
    return (
      <path
        d={`M ${x0} ${cy + 3} Q ${x0 + w * 0.15} ${cy - 5} ${x0 + w * 0.3} ${cy + 2} T ${x0 + w * 0.6} ${cy + 1}`}
        fill="none"
        stroke={INK}
        strokeWidth={4.5}
        strokeLinecap="round"
      />
    );
  }
  if (kind === "open" && amt > 0.06) {
    const h = 8 + amt * hMax;
    const x0 = cx - w / 2;
    const x1 = cx + w / 2;
    const id = `mclip-${idKey}-${Math.round(cx)}-${Math.round(cy)}`;
    const d = `M ${x0} ${cy} Q ${cx} ${cy + 7} ${x1} ${cy} C ${x1 - w * 0.06} ${cy + h * 1.15} ${x0 + w * 0.06} ${cy + h * 1.15} ${x0} ${cy} Z`;
    return (
      <g>
        <defs>
          <clipPath id={id}>
            <path d={d} />
          </clipPath>
        </defs>
        <path d={d} fill={mascot.mouth} />
        <g clipPath={`url(#${id})`}>
          <ellipse cx={cx} cy={cy + h * 0.95} rx={w * 0.26} ry={h * 0.42} fill={mascot.tongue} opacity={0.55} />
        </g>
        <Teeth x={cx} y={cy + 1} teeth={teeth} />
        <path d={d} fill="none" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
      </g>
    );
  }
  // closed line with teeth hanging under it
  return (
    <g>
      <Teeth x={cx} y={cy + 1} teeth={teeth} />
      <path d={`M ${cx - w / 2} ${cy} Q ${cx} ${cy + 7} ${cx + w / 2} ${cy}`} fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
    </g>
  );
};

/* ------------------------------------------------------------------ arms */

type ArmProps = {
  from: [number, number];
  to: [number, number];
  /** optional elbow control point */
  bend?: [number, number];
  w?: number;
  fill: string;
  /** draw a short finger/thumb tick at the hand */
  finger?: boolean;
};

export const Arm: React.FC<ArmProps> = ({ from, to, bend, w = 32, fill, finger = true }) => {
  const d = bend ? `M ${from[0]} ${from[1]} Q ${bend[0]} ${bend[1]} ${to[0]} ${to[1]}` : `M ${from[0]} ${from[1]} L ${to[0]} ${to[1]}`;
  const dx = to[0] - (bend ? bend[0] : from[0]);
  const dy = to[1] - (bend ? bend[1] : from[1]);
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return (
    <g strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={d} stroke={INK} strokeWidth={w + 2 * SW} />
      <path d={d} stroke={fill} strokeWidth={w} />
      {finger && (
        <path
          d={`M ${to[0] + ux * 2 - uy * 7} ${to[1] + uy * 2 + ux * 7} l ${ux * 6} ${uy * 6} M ${to[0] + ux * 2 + uy * 7} ${to[1] + uy * 2 - ux * 7} l ${ux * 6} ${uy * 6}`}
          stroke={INK}
          strokeWidth={3}
          opacity={0.7}
        />
      )}
    </g>
  );
};

/* ------------------------------------------------- state decorations */

/** Little "!" ticks radiating from the head, as on the sheet. */
export const SurpriseTicks: React.FC<{ cx: number; cy: number; r: number; stateFrame: number }> = ({ cx, cy, r, stateFrame }) => {
  const appear = clamp01(stateFrame / 5);
  const pulse = 0.82 + 0.18 * Math.sin(stateFrame * 0.9);
  const angles = [-150, -118, -90, -62, -30];
  return (
    <g stroke={INK} strokeWidth={5} strokeLinecap="round" opacity={appear}>
      {angles.map((a, i) => {
        const rad = (a * Math.PI) / 180;
        const inner = r * (i % 2 === 0 ? 1.0 : 1.08);
        const len = (i % 2 === 0 ? 20 : 28) * pulse * appear;
        return (
          <line
            key={a}
            x1={cx + Math.cos(rad) * inner}
            y1={cy + Math.sin(rad) * inner}
            x2={cx + Math.cos(rad) * (inner + len)}
            y2={cy + Math.sin(rad) * (inner + len)}
          />
        );
      })}
    </g>
  );
};

/** Thought trail: three dots growing up toward the top-right, popping in one after another. */
export const ThinkDots: React.FC<{ x: number; y: number; stateFrame: number }> = ({ x, y, stateFrame }) => {
  const dots = [
    { dx: 0, dy: 0, r: 6 },
    { dx: 20, dy: -22, r: 9 },
    { dx: 46, dy: -50, r: 13 },
  ];
  return (
    <g fill={mascot.cream} stroke={INK} strokeWidth={4}>
      {dots.map((d, i) => {
        const s = clamp01((stateFrame - 4 - i * 5) / 6);
        const bob = Math.sin(stateFrame * 0.12 + i * 1.3) * 2.5;
        return <circle key={i} cx={x + d.dx} cy={y + d.dy + bob} r={d.r * s} opacity={s} />;
      })}
    </g>
  );
};

/** Faint mottled texture: dark specks clipped by the caller's group. */
export const Mottle: React.FC<{ spots: [number, number, number][]; fill?: string; opacity?: number }> = ({ spots, fill = INK, opacity = 0.16 }) => (
  <g fill={fill} opacity={opacity}>
    {spots.map(([x, y, r], i) => (
      <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.82} />
    ))}
  </g>
);

export const GroundShadow: React.FC<{ cx?: number; rx?: number }> = ({ cx = 200, rx = 150 }) => (
  <ellipse cx={cx} cy={FEET_Y + 2} rx={rx} ry={13} fill={INK} opacity={0.14} />
);
