import React, { useId } from "react";
import {
  Arm,
  Brow,
  Cheek,
  Eye,
  EyeSpec,
  FigureProps,
  GroundShadow,
  Mouth,
  MouthKind,
  Pose,
  SurpriseTicks,
  ThinkDots,
  VIEW,
  blinkAmount,
  talkAmount,
} from "./parts";
import { BoardArt, MapArt, PhoneArt, TicketsArt } from "./props";

export type Ctx = FigureProps & {
  /** gentle -1..1 oscillation for ears/leaves */
  sway: number;
  /** extra jiggle while talking / surprised */
  jiggle: number;
};

export type CharacterSpec = {
  id: string;
  lidFill: string;
  armFill: string;
  armW: number;
  eyeL: EyeSpec;
  eyeR: EyeSpec;
  /** pupil resting direction per eye */
  idleLook: [[number, number], [number, number]];
  /** resting lid coverage (sleepy = 0.35) and slope */
  lid: number;
  lidTilt?: number;
  brows?: { cx: number; cy: number; w: number }[];
  cheeks: { cx: number; cy: number; rx?: number; ry?: number }[];
  mouth: { cx: number; cy: number; w: number; teeth: "two" | "one" | "none"; hMax?: number; baseOpen?: number };
  /** shoulders and hanging hand positions, viewer-left (L) and viewer-right (R) */
  armL: { from: [number, number]; hang: [number, number] };
  armR: { from: [number, number]; hang: [number, number] };
  /** head circle for surprise ticks, and spot for thought dots */
  head: { cx: number; cy: number; r: number };
  dots: { x: number; y: number };
  shadowRx?: number;
  /** drawn behind the body (feet, legs, ears, tuft) */
  back: (c: Ctx) => React.ReactNode;
  /** body shape(s), texture and belly */
  body: React.ReactNode;
  /** drawn over the face and arms (tuft, front ears) */
  front?: (c: Ctx) => React.ReactNode;
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp2 = (a: [number, number], b: [number, number], t: number): [number, number] => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const mid = (a: [number, number], b: [number, number]): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

type Hand = { to: [number, number]; bend: [number, number] };
type Side = "L" | "R";

/** Big held props (map, story board) sit with the hands at `from.y + HOLD_DY`. */
const HOLD_DY = 46;
const BIG_W = { map: 156, storyboard: 150 } as const;

type HandOpts = { poseFrame: number; angle: number; turn: number; prop: FigureProps["prop"]; talking: boolean; talkFrame: number; wob: number };

/**
 * Settled hand target for one arm in a pose (no easing: the caller blends between poses). Small deterministic
 * wiggles use `poseFrame` so waves, cheers and points stay alive without moving the body.
 */
const handFor = (spec: CharacterSpec, side: Side, pose: Pose, o: HandOpts): Hand => {
  const arm = side === "L" ? spec.armL : spec.armR;
  const sg = side === "L" ? -1 : 1;
  const len = Math.hypot(arm.hang[0] - arm.from[0], arm.hang[1] - arm.from[1]);
  const [fx, fy] = arm.from;
  const f = o.poseFrame;
  const hang: [number, number] = [arm.hang[0] - sg * o.wob * 1.5, arm.hang[1]];
  const rest: Hand = { to: hang, bend: mid(arm.from, hang) };
  const at = (to: [number, number], bend?: [number, number]): Hand => ({ to, bend: bend ?? mid(arm.from, to) });
  const big = o.prop === "map" || o.prop === "storyboard";
  const bigW = o.prop === "map" ? BIG_W.map : BIG_W.storyboard;

  if (pose === "hold" && o.prop !== "none") {
    if (big) {
      const cxm = (spec.armL.from[0] + spec.armR.from[0]) / 2;
      return at([cxm + sg * (bigW / 2 - 6), fy + HOLD_DY], [fx - sg * 6, fy + 34]);
    }
    if (side === "R") {
      if (o.prop === "tickets") return at([fx - 14, fy - 62], [fx + 34, fy - 22]);
      return at([fx - 8, spec.head.cy + 6], [fx + 42, fy - 34]); // phone, raised to film
    }
    return rest;
  }
  switch (pose) {
    case "listen":
      return at([hang[0] - sg * 16, hang[1] - 14]);
    case "point": {
      const rad = (o.angle * Math.PI) / 180;
      const active: Side = Math.abs(Math.cos(rad)) < 0.2 ? "R" : Math.cos(rad) < 0 ? "L" : "R";
      if (side !== active) return rest;
      const r = len * 1.38;
      const w = Math.sin(f * 0.25) * 2.5;
      return at([fx + Math.cos(rad) * r + w * Math.sin(rad), fy + Math.sin(rad) * r - w * Math.cos(rad)]);
    }
    case "wave":
      if (side !== "R") return rest;
      return at([fx + sg * 10 + Math.sin(f * 0.42) * 22, fy - len * 1.32], [fx + sg * 44, fy - len * 0.5]);
    case "cheer": {
      const ph = side === "L" ? 1.5 : 0;
      return at([fx + sg * 34 + Math.sin(f * 0.3 + ph) * 5, fy - len * 1.4 + Math.cos(f * 0.3 + ph) * 5], [fx + sg * 38, fy - len * 0.55]);
    }
    case "startle":
      return at([fx + sg * 40, fy - 62 + Math.sin(f * 1.3) * Math.max(0, 1 - f / 25) * 4]);
    case "think":
      if (side !== "R") return rest;
      return at([spec.mouth.cx + spec.mouth.w * 0.55, spec.mouth.cy + 38], [fx + 6, fy + 62]);
    case "shrug": {
      const lift = 8 * Math.sin(Math.PI * clamp01(f / 16));
      return at([fx + sg * len * 1.05, fy - len * 0.1 - lift], [fx + sg * len * 0.5, fy + len * 0.5]);
    }
    case "peek": {
      const active: Side = o.turn < 0 ? "L" : "R";
      if (side !== active) return rest;
      return at([spec.head.cx + sg * spec.head.r * 0.78, spec.head.cy + 6], [fx + sg * 50, fy - 20]);
    }
    default:
      if (o.talking && side === "R") return at([hang[0] + 10, hang[1] - 26 + Math.sin(o.talkFrame * 0.26) * 7]); // small speaking hand
      return rest;
  }
};

export const Figure: React.FC<FigureProps & { spec: CharacterSpec }> = ({
  spec,
  frame,
  fps,
  seed = "",
  pose,
  poseFrame,
  prevPose,
  blend,
  pointAngle,
  expr,
  exprFrame,
  talking,
  talkFrame,
  look,
  turn,
  prop,
}) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const t = frame / fps;
  const sway = Math.sin(t * Math.PI * 2 * 0.55);
  const surprised = expr === "surprised" || pose === "startle";
  const jiggle = talking ? Math.sin(talkFrame * 0.55) * 0.5 : surprised ? Math.sin(exprFrame * 1.3) * Math.max(0, 1 - exprFrame / 25) : 0;
  const ctx: Ctx = { frame, fps, seed, pose, poseFrame, prevPose, blend, expr, exprFrame, talking, talkFrame, look, turn, prop, pointAngle, sway, jiggle };
  const thinking = pose === "think";
  const confused = expr === "confused" || (thinking && expr === "neutral");

  /* ---- eyes */
  const blink = blinkAmount(frame, spec.id + seed);
  const baseLid = surprised ? 0 : expr === "smug" ? Math.max(spec.lid, 0.42) : confused ? spec.lid * 0.35 : spec.lid;
  const lid = baseLid + (1 - baseLid) * blink;
  const eyeScale = surprised ? 1.1 : 1;
  const drift: [number, number] = [Math.sin(t * 0.9) * 0.1, Math.cos(t * 0.7) * 0.06];
  const rad = (pointAngle * Math.PI) / 180;
  const eyeLook = (i: 0 | 1): [number, number] => {
    if (look) return look;
    if (pose === "point") return [Math.cos(rad) * 0.9, Math.sin(rad) * 0.5];
    if (thinking) return [-0.4 - 0.1 * i, -0.95];
    if (surprised) return [0.05, -0.02];
    if (confused) return [0.35, -0.6];
    return [spec.idleLook[i][0] + drift[0], spec.idleLook[i][1] + drift[1]];
  };
  const pScale = surprised ? 0.72 : 1;

  /* ---- mouth */
  const m = spec.mouth;
  const baseOpen = m.baseOpen ?? 0;
  let kind: MouthKind = baseOpen > 0 ? "open" : "line";
  let amt = baseOpen;
  if (talking) {
    kind = "open";
    amt = Math.max(baseOpen * 0.35, talkAmount(talkFrame, fps, spec.id + seed));
  } else if (surprised) kind = "o";
  else if (confused) kind = "hmm";
  else if (expr === "smug") kind = "smirk";
  else if (expr === "happy") {
    kind = "open";
    amt = Math.max(baseOpen, 0.34);
  }

  /* ---- brows */
  const browRaise = (i: number) => {
    if (surprised) return 14 + Math.max(0, 6 - exprFrame);
    if (confused) return i === 1 ? 11 : -1;
    if (expr === "smug") return i === 1 ? 7 : -3;
    if (expr === "happy") return 4;
    if (pose === "listen") return 3;
    return 0;
  };
  const browTilt = (i: number) => (confused && i === 0 ? 3 : expr === "smug" && i === 0 ? 2 : 0);

  /* ---- arms: blend from the previous pose to the current one */
  const wob = Math.sin(t * Math.PI * 2 * 0.6);
  const base = { angle: pointAngle, turn, prop, talking, talkFrame, wob };
  const cur = (side: Side) => handFor(spec, side, pose, { ...base, poseFrame });
  const old = (side: Side) => (prevPose ? handFor(spec, side, prevPose, { ...base, poseFrame: 30 }) : cur(side));
  const hand = (side: Side): Hand => {
    const a = old(side);
    const b = cur(side);
    return { to: lerp2(a.to, b.to, blend), bend: lerp2(a.bend, b.bend, blend) };
  };
  const L = hand("L");
  const R = hand("R");

  /* ---- face turn (fakes a head turn by sliding and narrowing the face group) */
  const cx = spec.head.cx;
  const faceT = `translate(${turn * 13} 0) translate(${cx} 0) scale(${1 - 0.06 * Math.abs(turn)} 1) translate(${-cx} 0)`;

  const holding = pose === "hold" && prop !== "none";
  const bigProp = holding && (prop === "map" || prop === "storyboard");
  const smallHeld = prop === "tickets" || prop === "phone"; // small props follow the right hand in any pose
  const cxm = (spec.armL.from[0] + spec.armR.from[0]) / 2;
  const holdY = spec.armR.from[1] + HOLD_DY;

  return (
    <svg viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`} width="100%" height="100%" style={{ display: "block", overflow: "visible" }}>
      <GroundShadow rx={spec.shadowRx} />
      {spec.back(ctx)}
      {spec.body}

      {/* face */}
      <g transform={faceT}>
        {spec.cheeks.map((c, i) => (
          <Cheek key={i} {...c} />
        ))}
        <Eye id={`${spec.id}-eL${uid}`} {...spec.eyeL} pr={spec.eyeL.pr * pScale} look={eyeLook(0)} lid={lid} lidTilt={spec.lidTilt} lidFill={spec.lidFill} scale={eyeScale} />
        <Eye id={`${spec.id}-eR${uid}`} {...spec.eyeR} pr={spec.eyeR.pr * pScale} look={eyeLook(1)} lid={lid} lidTilt={-(spec.lidTilt ?? 0)} lidFill={spec.lidFill} scale={eyeScale} />
        {spec.brows?.map((b, i) => (
          <Brow key={i} {...b} raise={browRaise(i)} tilt={browTilt(i)} />
        ))}
        <Mouth cx={m.cx} cy={m.cy} w={m.w} kind={kind} amt={amt} teeth={m.teeth} hMax={m.hMax} idKey={`${spec.id}${uid}`} />
      </g>

      {/* big props sit in front of the belly; the arms then grip their edges */}
      {bigProp && <g transform={`translate(${cxm} ${holdY - 8})`}>{prop === "map" ? <MapArt w={BIG_W.map} /> : <BoardArt w={BIG_W.storyboard} h={112} />}</g>}

      {/* arms */}
      <Arm from={spec.armL.from} to={L.to} bend={L.bend} w={spec.armW} fill={spec.armFill} />
      <Arm from={spec.armR.from} to={R.to} bend={R.bend} w={spec.armW} fill={spec.armFill} />

      {smallHeld && <g transform={`translate(${R.to[0]} ${R.to[1] + 6})`}>{prop === "tickets" ? <TicketsArt /> : <PhoneArt />}</g>}

      {spec.front?.(ctx)}

      {surprised && <SurpriseTicks cx={spec.head.cx} cy={spec.head.cy} r={spec.head.r} stateFrame={exprFrame} />}
      {thinking && <ThinkDots x={spec.dots.x} y={spec.dots.y} stateFrame={poseFrame} />}
    </svg>
  );
};
