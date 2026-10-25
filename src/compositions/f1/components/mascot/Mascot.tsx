import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { editorial } from "../../../../theme";
import { STAGE } from "../stage";
import { Bog } from "./Bog";
import { Mog } from "./Mog";
import { Expression, MascotCharacter, Pose, Prop, VIEW } from "./parts";
import { Sample, sample, stepFrames, Talking, talkFrameAt, Timed } from "./timed";
import { Wec } from "./Wec";

export type { Expression, MascotCharacter, Pose, Prop } from "./parts";
export type { Talking, Timed } from "./timed";

export type Gesture = Pose;
export type PointDir = "left" | "right" | "up" | "down" | "up-left" | "up-right" | "down-left" | "down-right" | number;
/** A gesture name, or a gesture with a direction (for "point"). */
export type GestureSpec = Gesture | { gesture: Gesture; dir?: PointDir };
export type Facing = "front" | "left" | "right";
/** Where the pupils go: a direction, "auto" (follow facing), "viewer", or a point in frame px (look at a speaker). */
export type Look = "auto" | "front" | "viewer" | "left" | "right" | "up" | "down" | { x: number; y: number };
export type Entrance = "none" | "pop" | "fade" | "walk-left" | "walk-right";

export type MascotProps = {
  character: MascotCharacter;
  /** Feet-centre in frame px (default: frame centre, STAGE.feetY). */
  x?: number;
  y?: number;
  /** 1 = 260 px wide (about 285 px tall). 0.6 small, 1.6 large. */
  scale?: number;
  /** Which way the face is turned. Timeline-able. */
  facing?: Timed<Facing>;
  /** Pupil target. Default "auto" (follows `facing`). Timeline-able. */
  look?: Timed<Look>;
  /** true while this mascot speaks, or [startFrame, endFrame) ranges. The mouth moves ONLY then. */
  talking?: Talking;
  /** idle | point | wave | cheer | think | shrug | peek | hold | listen | startle. Timeline-able. */
  gesture?: Timed<GestureSpec>;
  /** Default direction of "point" (default: toward the facing side, else "right"). */
  pointDir?: PointDir;
  /** Held prop. A prop with an "idle" gesture switches to "hold". Timeline-able. */
  prop?: Timed<Prop>;
  /** neutral | happy | surprised | confused | smug. Timeline-able. */
  expression?: Timed<Expression>;
  /** Frame it appears (default 0) and how. Default "pop" when at > 0, else "none". */
  at?: number;
  enter?: Entrance;
  enterFrames?: number;
  /** Frame it leaves (optional) and how. "walk-left" exits toward the left edge. Default "fade". */
  exitAt?: number;
  exit?: Entrance;
  exitFrames?: number;
  /** Salt so two mascots of one character do not blink together. */
  seed?: string;
  zIndex?: number;
};

const FIGURES = { mog: Mog, wec: Wec, bog: Bog } as const;

/** Mascot width at scale 1 (px). Height = BASE_W * 480 / 440. */
export const MASCOT_W = 260;
const HEIGHT_RATIO = VIEW.h / VIEW.w;
const FEET_FRAC = 462 / VIEW.h; // feet sit at 96% of the figure box

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const easeOut = (t: number) => 1 - (1 - clamp01(t)) ** 3;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const DIR: Record<string, number> = { right: 0, left: 180, up: -90, down: 90, "up-right": -35, "up-left": -145, "down-right": 35, "down-left": 145 };
const dirAngle = (d: PointDir) => (typeof d === "number" ? d : DIR[d]);
const turnOf = (f: Facing) => (f === "left" ? -1 : f === "right" ? 1 : 0);

const TILT_POSE: Partial<Record<Pose, number>> = { think: -3, listen: 2, peek: 5 };
const TILT_EXPR: Partial<Record<Expression, number>> = { confused: -3, smug: 2 };

/**
 * Scene-level mascot. Frame-driven and deterministic: every argument that can change over time takes a plain value
 * or a `[[frame, value], ...]` timeline in the frames of the containing Sequence. Idle is only a blink and slow breathing.
 *
 *   <Mascot character="bog" x={700} y={830} scale={1.1} facing="right" look={{x: 1100, y: 500}}
 *           talking={[[40, 130]]} gesture={[[0, "idle"], [60, {gesture: "point", dir: "right"}]]}
 *           expression={[[0, "neutral"], [90, "surprised"]]} at={10} enter="walk-left" />
 */
export const Mascot: React.FC<MascotProps> = ({
  character,
  x: xIn,
  y = STAGE.feetY,
  scale = 1,
  facing = "front",
  look = "auto",
  talking = false,
  gesture = "idle",
  pointDir,
  prop = "none",
  expression = "neutral",
  at = 0,
  enter,
  enterFrames,
  exitAt,
  exit = "fade",
  exitFrames,
  seed = "",
  zIndex,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const x = xIn ?? width / 2;
  const w = MASCOT_W * scale;
  const h = w * HEIGHT_RATIO;
  const enterKind: Entrance = enter ?? (at > 0 ? "pop" : "none");
  const inFrames = enterFrames ?? (enterKind.startsWith("walk") ? 40 : enterKind === "pop" ? 14 : 12);
  const outFrames = exitFrames ?? (exit.startsWith("walk") ? 36 : 10);

  if (frame < at) return null;
  if (exitAt !== undefined && frame >= exitAt + outFrames) return null;

  /* ---- entrance / exit */
  const f0 = frame - at;
  const pIn = enterKind === "none" ? 1 : clamp01(f0 / inFrames);
  const qOut = exitAt === undefined ? 0 : clamp01((frame - exitAt) / outFrames);
  const walkIn = enterKind.startsWith("walk") && pIn < 1;
  const walkOut = exit.startsWith("walk") && qOut > 0 && qOut < 1;
  const edge = w / 2 + 70;
  let offX = 0;
  let hop = 0;
  let walkTurn: number | null = null;
  let walkLean = 0;
  if (walkIn) {
    const from = enterKind === "walk-left" ? -edge : width + edge;
    const e = Easing.out(Easing.quad)(pIn);
    offX = (from - x) * (1 - e);
    hop = -Math.abs(Math.sin(f0 * 0.5)) * 8 * scale * Math.min(1, (1 - pIn) * 5);
    walkTurn = enterKind === "walk-left" ? 1 : -1;
    walkLean = walkTurn * 3 * Math.min(1, (1 - pIn) * 5);
  }
  if (walkOut) {
    const to = exit === "walk-left" ? -edge : width + edge;
    const e = Easing.in(Easing.quad)(qOut);
    offX = (to - x) * e;
    hop = -Math.abs(Math.sin((frame - (exitAt ?? 0)) * 0.5)) * 8 * scale;
    walkTurn = exit === "walk-left" ? -1 : 1;
    walkLean = walkTurn * 3;
  }
  const popS = enterKind === "pop" ? spring({ frame: f0, fps, config: { damping: 12, stiffness: 180, mass: 0.7 } }) : 1;
  const exitPop = exit === "pop" && exitAt !== undefined ? interpolate(qOut, [0, 1], [1, 0.6]) : 1;
  const fadeIn = enterKind === "fade" ? pIn : enterKind === "pop" ? clamp01(f0 / 4) : 1;
  const fadeOut = exit === "fade" || exit === "pop" ? 1 - qOut : 1;
  const opacity = fadeIn * fadeOut;
  const appear = enterKind === "pop" ? lerp(0.35, 1, popS) : 1;

  /* ---- facing -> turn (smooth), look -> pupil vector */
  const fs = sample(facing, frame);
  const turnCur = turnOf(fs.value);
  const turnPrev = fs.prev === undefined ? turnCur : turnOf(fs.prev);
  const facingTurn = lerp(turnPrev, turnCur, easeOut(fs.since / 10));
  const walkW = walkTurn === null ? 0 : walkIn ? clamp01((1 - pIn) * 6) : 1;
  const turn = lerp(facingTurn, walkTurn ?? 0, walkW);

  const bodyMidY = y - h * 0.55;
  const lookVec = (l: Look): [number, number] | null => {
    if (typeof l === "object") return [Math.max(-1, Math.min(1, (l.x - x) / 300)), Math.max(-0.8, Math.min(0.8, (l.y - bodyMidY) / 260))];
    switch (l) {
      case "left":
        return [-0.9, 0.1];
      case "right":
        return [0.9, 0.1];
      case "up":
        return [0, -0.8];
      case "down":
        return [0, 0.7];
      case "front":
      case "viewer":
        return [0, 0.05];
      default:
        return turnCur === 0 ? null : [turnCur * 0.9, 0.1];
    }
  };
  const ls: Sample<Look> = sample(look, frame);
  const lc = lookVec(ls.value);
  const lp = ls.prev === undefined ? lc : lookVec(ls.prev);
  const lb = easeOut(ls.since / 6);
  const IDLE: [number, number] = [0.3, 0.15];
  const lookOut: [number, number] | null = lc === null && lp === null ? null : [lerp((lp ?? IDLE)[0], (lc ?? IDLE)[0], lb), lerp((lp ?? IDLE)[1], (lc ?? IDLE)[1], lb)];

  /* ---- expression */
  const es = sample(expression, frame);

  /* ---- effective pose from gesture + prop, with the last change and the pose it came from */
  const propAt = (f: number) => sample(prop, f).value;
  const effective = (f: number) => {
    const g = sample(gesture, f).value;
    const spec = typeof g === "string" ? { gesture: g, dir: undefined } : g;
    const pr = propAt(f);
    const pose: Pose = spec.gesture === "idle" && pr !== "none" ? "hold" : spec.gesture;
    const faceDir = turnOf(sample(facing, f).value);
    const dir = spec.dir ?? pointDir ?? (faceDir < 0 ? "left" : "right");
    const angle = pose === "point" ? dirAngle(dir) : 0;
    return { pose, angle, key: `${pose}|${pose === "point" ? angle : ""}|${pose === "hold" ? pr : ""}` };
  };
  const cur = effective(frame);
  const marks = [...stepFrames(gesture), ...stepFrames(prop)].filter((m) => m <= frame).sort((a, b) => b - a);
  let changeAt = -1;
  let prevPose: Pose | undefined;
  for (const m of marks) {
    const before = effective(m - 1);
    if (before.key !== effective(m).key) {
      changeAt = m;
      prevPose = before.pose;
      break;
    }
  }
  const poseFrame = changeAt >= 0 ? frame - changeAt : Math.max(0, frame - (marks.length ? Math.min(...marks) : 0));
  const blend = changeAt >= 0 ? easeOut(poseFrame / 8) : 1;

  /* ---- talking */
  const tf = talkFrameAt(talking, frame, at);
  const isTalking = tf >= 0;

  /* ---- body motion: breathing only, plus the lean of peek / tilt of listen, think, confused, smug */
  const breath = Math.sin((frame / fps) * Math.PI * 2 * 0.62);
  const bScaleY = 1 + breath * 0.012;
  const bScaleX = 1 - breath * 0.006;
  const poseTilt = lerp(prevPose ? (TILT_POSE[prevPose] ?? 0) : (TILT_POSE[cur.pose] ?? 0), TILT_POSE[cur.pose] ?? 0, blend);
  const sgn = turn < 0 ? -1 : 1;
  const tilt = poseTilt * (cur.pose === "peek" || prevPose === "peek" ? sgn : 1) + (TILT_EXPR[es.value] ?? 0) * easeOut(es.since / 8) + walkLean;
  const lean = cur.pose === "peek" ? 10 * sgn * scale * blend : 0;

  const Figure = FIGURES[character];

  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - h * FEET_FRAC,
        width: w,
        height: h,
        opacity,
        zIndex,
        pointerEvents: "none",
        filter: `drop-shadow(0 4px 5px ${editorial.ink}40)`,
        transformOrigin: `50% ${FEET_FRAC * 100}%`,
        transform: `translate(${offX + lean}px, ${hop}px) rotate(${tilt}deg) scale(${appear * exitPop * bScaleX}, ${appear * exitPop * bScaleY})`,
      }}
    >
      <Figure
        frame={frame}
        fps={fps}
        seed={seed}
        pose={cur.pose}
        poseFrame={poseFrame}
        prevPose={prevPose}
        blend={blend}
        pointAngle={cur.angle}
        expr={es.value}
        exprFrame={es.since}
        talking={isTalking}
        talkFrame={Math.max(0, tf)}
        look={lookOut}
        turn={turn}
        prop={propAt(frame)}
      />
    </div>
  );
};
