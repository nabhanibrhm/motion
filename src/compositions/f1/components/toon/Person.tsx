import { CSSProperties, useId } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { toon } from "../../../../theme";
import { wave } from "./anim";
import { mix, shade, tint } from "./color";

/* ------------------------------------------------------------------ types */

export type Expression = "smile" | "grin" | "wow" | "sad" | "angry" | "neutral";
export type Pose = "idle" | "wave" | "cheer" | "point" | "phone" | "clap" | "think" | "arms-crossed";
export type HairStyle = "short" | "long" | "bun" | "curly" | "cap" | "none";
export type Accessory = "none" | "glasses" | "headphones" | "cap" | "tie" | "sunglasses";
export type Facing = "front" | "left" | "right";

export type PersonProps = {
  /** Skin tone; use toon.skins[0..4]. */
  skin?: string;
  /** Hair style (default "short"). */
  hair?: HairStyle;
  /** Hair colour; use toon.hairs.*. For hair="cap" this is the hair peeking out from under the cap. */
  hairColor?: string;
  /** Cap colour for hair="cap" or accessory="cap" (default red). */
  capColor?: string;
  /** Shirt colour. */
  top?: string;
  /** Trousers colour. */
  bottom?: string;
  /** Sneaker colour (default cream). */
  shoe?: string;
  expression?: Expression;
  pose?: Pose;
  accessory?: Accessory;
  /** "front" (default), "left" / "right" (mirror + gaze). Note "point" points to the viewer's right when not mirrored. */
  facing?: Facing;
  /** Offsets the idle motion so a group of people never move in sync. */
  seed?: number;
  /** Scale of the nominal 300x600 box (default 1). */
  size?: number;
  /** Absolute placement: feet-centre x/y in frame px. Omit to place with `style`. */
  x?: number;
  y?: number;
  /** Soft ground shadow (default true). */
  shadow?: boolean;
  /** Glow colour of the phone screen for pose="phone" (default sky). */
  phoneColor?: string;
  /** 0..1 amount of idle life (default 1). */
  life?: number;
  style?: CSSProperties;
};

export type DriverProps = Omit<PersonProps, "top" | "bottom" | "accessory"> & {
  /** Racing-suit colours (default red + cream). */
  team?: { main: string; secondary: string };
  /** 1 = helmet on (default), 0 = lifted off and gone; in between it is mid lift-off. */
  helmet?: number;
  /** 0 = visor up (face visible, default), 1 = visor down (face hidden). */
  visor?: number;
  helmetColor?: string;
};

export type SuitProps = Omit<PersonProps, "top" | "bottom" | "accessory" | "hair" | "pose"> & {
  /** Suit colour (default very dark plum). */
  suit?: string;
  tie?: string;
  /** Item in the right hand. */
  hold?: "none" | "champagne" | "cigar";
  pose?: "idle" | "point" | "arms-crossed" | "think" | "wave" | "clap";
  /** Show round glasses. */
  glasses?: boolean;
  /** Grey moustache (default true). */
  moustache?: boolean;
  /** Hair colour at the temples (default grey). */
  hairColor?: string;
};

/* ------------------------------------------------------------------ geometry */

type Pt = { x: number; y: number };
const L1 = 78;
const L2 = 78;
const INK = "#2B2620";
const MOUTH = "#4A2A22";

// Two-bone IK: elbow position for a shoulder `s` reaching `target`; picks the lower/outer elbow.
const solveArm = (s: Pt, target: Pt, side: 1 | -1) => {
  let dx = target.x - s.x;
  let dy = target.y - s.y;
  let d = Math.hypot(dx, dy) || 1;
  const max = L1 + L2 - 0.5;
  if (d > max) {
    dx *= max / d;
    dy *= max / d;
    d = max;
  }
  const h: Pt = { x: s.x + dx, y: s.y + dy };
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d);
  const hh = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const ux = dx / d;
  const uy = dy / d;
  const px = s.x + ux * a;
  const py = s.y + uy * a;
  const e1: Pt = { x: px - uy * hh, y: py + ux * hh };
  const e2: Pt = { x: px + uy * hh, y: py - ux * hh };
  const score = (e: Pt) => e.y + 0.6 * (e.x - 150) * side;
  return { e: score(e1) >= score(e2) ? e1 : e2, h };
};

/* ------------------------------------------------------------------ pose targets */

type Targets = { L: Pt; R: Pt; hop: number; gazeY: number; finger?: boolean; phone?: boolean; tilt: number };

const poseTargets = (pose: Pose, t: number, seed: number, sw: number, life: number): Targets => {
  const ph = seed * 0.37;
  const sway = (o: number) => wave(t, 2.5, ph + o) * life;
  const xL = 150 - sw;
  const xR = 150 + sw;
  const idleR: Pt = { x: xR + 14 + 5 * sway(0), y: 352 + 4 * sway(0.25) };
  const idleL: Pt = { x: xL - 14 - 5 * sway(0.5), y: 352 + 4 * sway(0.75) };
  const base: Targets = { L: idleL, R: idleR, hop: 0, gazeY: 0, tilt: 0 };

  switch (pose) {
    case "wave":
      return { ...base, R: { x: xR + 52 + 26 * wave(t, 0.7, ph), y: 96 + 8 * wave(t, 0.7, ph + 0.25) }, tilt: 2 };
    case "cheer": {
      const c = wave(t, 0.62, ph);
      return {
        ...base,
        L: { x: xL - 38 - 6 * c, y: 60 + 20 * c },
        R: { x: xR + 38 + 6 * c, y: 60 - 20 * c },
        hop: Math.abs(wave(t, 1.24, ph)) * 16,
        tilt: 3 * c,
      };
    }
    case "point":
      return { ...base, R: { x: xR + 124, y: 178 + 4 * sway(0) }, finger: true };
    case "phone":
      return { ...base, R: { x: xR - 20, y: 252 + 3 * sway(0) }, L: { x: xL + 10, y: 322 + 3 * sway(0.5) }, phone: true, gazeY: 6, tilt: -3 };
    case "clap": {
      const s = 0.5 + 0.5 * wave(t, 0.56, ph);
      const spread = 40 * (1 - s);
      return { ...base, L: { x: 150 - 2 - spread, y: 262 - spread * 0.35 }, R: { x: 150 + 2 + spread, y: 262 - spread * 0.35 }, hop: 0 };
    }
    case "think":
      return { ...base, R: { x: 184, y: 176 + 2 * sway(0) }, L: { x: 194, y: 270 }, tilt: 4 };
    case "arms-crossed":
      return { ...base, R: { x: 114, y: 272 + 2 * sway(0) }, L: { x: 186, y: 258 + 2 * sway(0) } };
    default:
      return base;
  }
};

/* ------------------------------------------------------------------ small drawing parts */

const Arm: React.FC<{ s: Pt; e: Pt; h: Pt; sleeve: string; skin: string; hand: string; sleeveFrac: number; width?: number }> = ({
  s,
  e,
  h,
  sleeve,
  skin,
  hand,
  sleeveFrac,
  width = 38,
}) => {
  const cut: Pt = { x: e.x + (h.x - e.x) * sleeveFrac, y: e.y + (h.y - e.y) * sleeveFrac };
  return (
    <g strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={`M ${e.x} ${e.y} L ${h.x} ${h.y}`} stroke={skin} strokeWidth={width - 8} />
      <path d={`M ${s.x} ${s.y} L ${e.x} ${e.y} L ${cut.x} ${cut.y}`} stroke={sleeve} strokeWidth={width} />
      <circle cx={h.x} cy={h.y} r={(width - 8) / 2 + 3} fill={hand} stroke="none" />
    </g>
  );
};

const Eye: React.FC<{ cx: number; cy: number; r: number; blink: number; gx: number; gy: number }> = ({ cx, cy, r, blink, gx, gy }) => (
  <g transform={`translate(${cx + gx} ${cy + gy}) scale(1 ${blink})`}>
    <circle r={r} fill={INK} />
    <circle cx={r * 0.32} cy={-r * 0.34} r={r * 0.32} fill="#fff" />
  </g>
);

type FaceProps = {
  skin: string;
  expression: Expression;
  brow: string;
  fx: number;
  gazeY: number;
  blink: number;
  noseShade?: string;
  bushy?: boolean;
};

const Face: React.FC<FaceProps> = ({ skin, expression, brow, fx, gazeY, blink, bushy }) => {
  const wow = expression === "wow";
  const er = wow ? 10 : 8.5;
  const lift = wow ? -8 : expression === "grin" ? -2 : 0;
  const bw = bushy ? 9 : 6.5;
  const ex = [121 + fx, 179 + fx];
  let browL = `M ${ex[0] - 14} ${79 + lift} Q ${ex[0]} ${72 + lift} ${ex[0] + 14} ${78 + lift}`;
  let browR = `M ${ex[1] - 14} ${78 + lift} Q ${ex[1]} ${72 + lift} ${ex[1] + 14} ${79 + lift}`;
  if (expression === "angry") {
    browL = `M ${ex[0] - 15} ${72} L ${ex[0] + 15} ${86}`;
    browR = `M ${ex[1] - 15} ${86} L ${ex[1] + 15} ${72}`;
  } else if (expression === "sad") {
    browL = `M ${ex[0] - 15} ${86} L ${ex[0] + 15} ${74}`;
    browR = `M ${ex[1] - 15} ${74} L ${ex[1] + 15} ${86}`;
  }
  const mx = 150 + fx;
  let mouth: React.ReactNode;
  switch (expression) {
    case "grin":
      mouth = (
        <g>
          <path d={`M ${mx - 22} 123 Q ${mx} 126 ${mx + 22} 123 Q ${mx + 19} 152 ${mx} 152 Q ${mx - 19} 152 ${mx - 22} 123 Z`} fill={MOUTH} />
          <path d={`M ${mx - 19} 124 Q ${mx} 127 ${mx + 19} 124 L ${mx + 18} 132 Q ${mx} 135 ${mx - 18} 132 Z`} fill="#fff" />
          <ellipse cx={mx} cy={146} rx={10} ry={5} fill="#F27A86" />
        </g>
      );
      break;
    case "wow":
      mouth = <ellipse cx={mx} cy={140} rx={11} ry={15} fill={MOUTH} />;
      break;
    case "sad":
      mouth = <path d={`M ${mx - 14} 146 Q ${mx} 130 ${mx + 14} 146`} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />;
      break;
    case "angry":
      mouth = <path d={`M ${mx - 14} 143 Q ${mx} 133 ${mx + 14} 143`} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />;
      break;
    case "neutral":
      mouth = <path d={`M ${mx - 12} 137 L ${mx + 12} 137`} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />;
      break;
    default:
      mouth = <path d={`M ${mx - 17} 130 Q ${mx} 148 ${mx + 17} 130`} fill="none" stroke={INK} strokeWidth={5.5} strokeLinecap="round" />;
  }
  const blush = expression === "angry" ? "#FF5A4A" : "#FF8A80";
  return (
    <g>
      <circle cx={112 + fx} cy={122} r={13} fill={blush} opacity={expression === "angry" ? 0.4 : 0.32} />
      <circle cx={188 + fx} cy={122} r={13} fill={blush} opacity={expression === "angry" ? 0.4 : 0.32} />
      <ellipse cx={150 + fx} cy={116} rx={5.5} ry={4} fill={shade(skin, 0.18)} />
      <Eye cx={ex[0]} cy={101} r={er} blink={blink} gx={0} gy={gazeY} />
      <Eye cx={ex[1]} cy={101} r={er} blink={blink} gx={0} gy={gazeY} />
      <path d={browL} fill="none" stroke={brow} strokeWidth={bw} strokeLinecap="round" />
      <path d={browR} fill="none" stroke={brow} strokeWidth={bw} strokeLinecap="round" />
      {mouth}
      {expression === "sad" && <path d={`M ${ex[0] + 4} 114 Q ${ex[0] + 8} 128 ${ex[0] + 2} 132 Q ${ex[0] - 3} 126 ${ex[0] + 4} 114 Z`} fill={toon.sky} opacity={0.85} />}
    </g>
  );
};

/** Hair drawn behind the head (and for long hair, behind the body). */
const HairBack: React.FC<{ style: HairStyle; color: string }> = ({ style, color }) => {
  if (style === "long") {
    return (
      <path
        d="M 66 96 C 52 6 248 6 234 96 C 242 170 252 232 238 272 Q 232 292 206 290 L 94 290 Q 68 292 62 272 C 48 232 58 170 66 96 Z"
        fill={shade(color, 0.12)}
      />
    );
  }
  if (style === "curly") {
    return (
      <g fill={shade(color, 0.1)}>
        {Array.from({ length: 12 }, (_, i) => {
          const a = Math.PI * (0.88 + (i / 11) * 1.24);
          return <circle key={i} cx={150 + Math.cos(a) * 80} cy={96 + Math.sin(a) * 78} r={31} />;
        })}
      </g>
    );
  }
  return null;
};

const HairFront: React.FC<{ style: HairStyle; color: string; cap: string }> = ({ style, color, cap }) => {
  const fringe = "M 70 100 C 62 44 104 17 150 17 C 200 17 240 44 230 100 C 224 78 212 64 192 61 C 170 70 128 70 108 58 C 88 64 76 80 70 100 Z";
  const hi = <path d="M 98 44 Q 124 27 164 29" fill="none" stroke={tint(color, 0.25)} strokeWidth={7} strokeLinecap="round" opacity={0.55} />;
  switch (style) {
    case "short":
      return (
        <g>
          <path d={fringe} fill={color} />
          {hi}
        </g>
      );
    case "long":
      return (
        <g>
          <path d="M 70 104 C 60 44 104 17 150 17 C 200 17 240 44 230 104 C 224 82 208 56 150 52 C 96 56 76 82 70 104 Z" fill={color} />
          <path d="M 150 52 C 130 40 112 38 98 44" fill="none" stroke={shade(color, 0.25)} strokeWidth={3} strokeLinecap="round" opacity={0.6} />
          {hi}
        </g>
      );
    case "bun":
      return (
        <g>
          <circle cx={150} cy={2} r={31} fill={color} />
          <path d="M 122 22 Q 150 34 178 22" fill="none" stroke={shade(color, 0.3)} strokeWidth={5} strokeLinecap="round" />
          <path d={fringe} fill={color} />
          {hi}
        </g>
      );
    case "curly":
      return (
        <g fill={color}>
          {[104, 127, 150, 173, 196].map((x, i) => (
            <circle key={i} cx={x} cy={50 + Math.abs(i - 2) * 6} r={26} />
          ))}
          <circle cx={78} cy={78} r={20} />
          <circle cx={222} cy={78} r={20} />
          <path d="M 96 40 Q 118 24 150 28" fill="none" stroke={tint(color, 0.25)} strokeWidth={7} strokeLinecap="round" opacity={0.5} />
        </g>
      );
    case "cap":
      return (
        <g>
          <circle cx={74} cy={98} r={11} fill={color} />
          <circle cx={226} cy={98} r={11} fill={color} />
          <Cap color={cap} />
        </g>
      );
    default:
      return null;
  }
};

const Cap: React.FC<{ color: string }> = ({ color }) => (
  <g>
    <path d="M 66 78 C 58 0 242 0 234 78 Z" fill={color} />
    <path d="M 100 32 Q 122 16 160 18" fill="none" stroke={tint(color, 0.25)} strokeWidth={7} strokeLinecap="round" opacity={0.5} />
    <path d="M 58 80 Q 150 98 242 80 Q 150 66 58 80 Z" fill={shade(color, 0.28)} />
    <circle cx={150} cy={12} r={7} fill={shade(color, 0.28)} />
  </g>
);

const Accessories: React.FC<{ accessory: Accessory; fx: number; skin: string; accent: string }> = ({ accessory, fx, skin, accent }) => {
  switch (accessory) {
    case "glasses":
      return (
        <g fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round">
          <circle cx={121 + fx} cy={101} r={24} fill="#ffffff" fillOpacity={0.14} />
          <circle cx={179 + fx} cy={101} r={24} fill="#ffffff" fillOpacity={0.14} />
          <path d={`M ${145 + fx} 99 Q ${150 + fx} 94 ${155 + fx} 99`} />
          <path d={`M ${97 + fx} 98 L 80 94 M ${203 + fx} 98 L 220 94`} />
        </g>
      );
    case "sunglasses":
      return (
        <g>
          <path d={`M ${96 + fx} 88 Q ${96 + fx} 84 ${102 + fx} 84 L ${140 + fx} 84 Q ${146 + fx} 84 ${145 + fx} 92 Q ${143 + fx} 118 ${122 + fx} 118 Q ${98 + fx} 118 ${96 + fx} 88 Z`} fill="#15171A" />
          <path d={`M ${204 + fx} 88 Q ${204 + fx} 84 ${198 + fx} 84 L ${160 + fx} 84 Q ${154 + fx} 84 ${155 + fx} 92 Q ${157 + fx} 118 ${178 + fx} 118 Q ${202 + fx} 118 ${204 + fx} 88 Z`} fill="#15171A" />
          <path d={`M ${143 + fx} 90 L ${157 + fx} 90`} stroke="#15171A" strokeWidth={5} />
          <path d={`M ${106 + fx} 94 L ${118 + fx} 90 M ${166 + fx} 94 L ${178 + fx} 90`} stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.55} />
        </g>
      );
    case "headphones":
      return (
        <g>
          <path d="M 70 98 C 58 -14 242 -14 230 98" fill="none" stroke={shade(accent, 0.35)} strokeWidth={13} strokeLinecap="round" />
          <rect x={52} y={72} width={32} height={60} rx={16} fill={accent} />
          <rect x={216} y={72} width={32} height={60} rx={16} fill={accent} />
          <rect x={52} y={72} width={14} height={60} rx={7} fill={shade(accent, 0.22)} />
          <rect x={234} y={72} width={14} height={60} rx={7} fill={shade(accent, 0.22)} />
        </g>
      );
    case "cap":
      return <Cap color={accent} />;
    default:
      void skin;
      return null;
  }
};

/* ------------------------------------------------------------------ figure engine */

type Outfit = "tee" | "racing" | "suit";

type FigureProps = PersonProps & {
  outfit: Outfit;
  team?: { main: string; secondary: string };
  helmet?: number;
  visor?: number;
  helmetColor?: string;
  hold?: "none" | "champagne" | "cigar";
  moustache?: boolean;
  glassesOn?: boolean;
  tieColor?: string;
  suitColor?: string;
};

const Figure: React.FC<FigureProps> = ({
  outfit,
  skin = toon.skins[1],
  hair = "short",
  hairColor = toon.hairs.brown,
  capColor = toon.red,
  top = toon.sky,
  bottom = "#3B3F73",
  shoe = toon.shoe,
  expression = "smile",
  pose = "idle",
  accessory = "none",
  facing = "front",
  seed = 0,
  size = 1,
  x,
  y,
  shadow = true,
  phoneColor = toon.sky,
  life = 1,
  style,
  team = { main: toon.red, secondary: toon.paper },
  helmet = 1,
  visor = 0,
  helmetColor,
  hold = "none",
  moustache = true,
  glassesOn = false,
  tieColor = toon.red,
  suitColor = toon.suit,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const t = frame / fps + seed * 1.37;
  const ph = seed * 0.37;

  const suit = outfit === "suit";
  const racing = outfit === "racing";
  const shirt = racing ? team.main : suit ? suitColor : top;
  const pants = racing ? team.main : suit ? suitColor : bottom;
  const shoes = racing ? "#1E2127" : suit ? "#111316" : shoe;
  const sw = suit ? 70 : 62;
  const SL: Pt = { x: 150 - sw, y: 208 };
  const SR: Pt = { x: 150 + sw, y: 208 };

  const tg = poseTargets(pose, t, seed, sw, life);
  // Held items override the right hand.
  let holdR: Pt | undefined;
  if (hold === "champagne") holdR = { x: 150 + sw + 24, y: 214 + 8 * wave(t, 2.5, ph) * life };
  if (hold === "cigar") {
    const s = 0.5 + 0.5 * wave(t, 6, ph - 0.25);
    const k = Math.min(1, Math.max(0, (s - 0.35) / 0.4));
    const e = k * k * (3 - 2 * k);
    holdR = { x: 236 + (180 - 236) * e, y: 300 + (160 - 300) * e };
  }
  const rt = holdR ?? tg.R;
  const armL = solveArm(SL, tg.L, -1);
  const armR = solveArm(SR, rt, 1);

  // Idle life.
  const breath = 0.5 + 0.5 * wave(t, 3.2, ph);
  const bob = wave(t, 2.5, ph + 0.1) * 2 * life;
  const tilt = (wave(t, 5, ph) * 1.4 + tg.tilt) * (life > 0 ? 1 : 0);
  const lean = wave(t, 2.5, ph + 0.3) * 0.7 * life;
  const bp = 3.2 + (((seed * 7.31) % 1) + 1) % 1 * 1.8; // blink period seconds
  const bt = (t + seed * 0.9) % bp;
  const blink = bt < 0.18 ? 1 - 0.92 * Math.sin((Math.PI * bt) / 0.18) : 1;

  const dir = facing === "right" ? 1 : facing === "left" ? -1 : 0;
  const fx = dir * 9;
  const mirror = facing === "left";
  const sleeveFrac = racing || suit ? 0.9 : 0.5;
  const handColor = racing ? "#1A1C20" : skin;
  const brow = suit ? mix(hairColor, INK, 0.2) : hair === "none" ? shade(skin, 0.45) : mix(hairColor, INK, 0.35);
  const hStyle: HairStyle = suit ? "none" : hair;
  const faceVisible = !racing || helmet < 1 || visor < 1;

  // Helmet lift-off.
  const lift = (1 - helmet) * 175;
  const helmetOpacity = Math.min(1, helmet * 3);

  const W = 300 * size;
  const H = 600 * size;
  const pos: CSSProperties = x !== undefined || y !== undefined ? { position: "absolute", left: (x ?? 0) - 150 * size, top: (y ?? 0) - 595 * size } : {};

  const hop = tg.hop * life;
  const shadowScale = 1 - hop / 80;

  const torso = suit
    ? "M 72 385 Q 62 330 68 250 Q 70 194 122 190 L 178 190 Q 230 194 232 250 Q 238 330 228 385 Z"
    : "M 80 371 L 80 238 Q 80 192 122 190 L 178 190 Q 220 192 220 238 L 220 371 Q 220 385 206 385 L 94 385 Q 80 385 80 371 Z";

  return (
    <svg width={W} height={H} viewBox="0 0 300 600" style={{ overflow: "visible", display: "block", ...pos, ...style }}>
      <g transform={mirror ? "translate(300 0) scale(-1 1)" : undefined}>
        {shadow && <ellipse cx={150} cy={594} rx={96 * shadowScale} ry={13 * shadowScale} fill={toon.groundDeep} opacity={0.3} />}
        <g transform={`translate(0 ${25 - hop}) rotate(${lean} 150 570)`}>
          {/* hair behind the body */}
          {hStyle === "long" && <HairBack style="long" color={hairColor} />}

          {/* legs */}
          <g>
            <rect x={84} y={366} width={132} height={60} rx={22} fill={pants} />
            <rect x={84} y={380} width={62} height={160} rx={26} fill={pants} />
            <rect x={154} y={380} width={62} height={160} rx={26} fill={pants} />
            <rect x={196} y={400} width={20} height={140} rx={10} fill="#000" opacity={0.1} />
            {racing && (
              <g fill={team.secondary}>
                <rect x={84} y={400} width={8} height={130} rx={4} />
                <rect x={208} y={400} width={8} height={130} rx={4} />
              </g>
            )}
            {/* shoes */}
            <rect x={74} y={536} width={76} height={36} rx={18} fill={shoes} />
            <rect x={150} y={536} width={76} height={36} rx={18} fill={shoes} />
            <rect x={74} y={563} width={76} height={9} rx={4.5} fill={racing ? team.secondary : shade(shoes, 0.28)} />
            <rect x={150} y={563} width={76} height={9} rx={4.5} fill={racing ? team.secondary : shade(shoes, 0.28)} />
            {!racing && !suit && (
              <g fill={shade(shoe, 0.2)}>
                <rect x={104} y={546} width={30} height={5} rx={2.5} />
                <rect x={166} y={546} width={30} height={5} rx={2.5} />
              </g>
            )}
          </g>

          {/* upper body: breathes */}
          <g transform={`translate(0 ${-2.5 * breath * life})`}>
            <g transform={`translate(150 385) scale(1 ${1 + 0.012 * breath * life}) translate(-150 -385)`}>
              {/* neck */}
              <rect x={128} y={150} width={44} height={56} rx={14} fill={shade(skin, 0.2)} />
              {/* torso */}
              <path d={torso} fill={shirt} />
              <path d="M 196 196 Q 222 202 222 240 L 222 380 L 190 380 Z" fill="#000" opacity={suit ? 0.16 : 0.1} />
              {!suit && !racing && <rect x={80} y={366} width={140} height={19} rx={9} fill={shade(shirt, 0.18)} />}
              {!suit && !racing && <path d="M 100 300 Q 108 330 100 352" fill="none" stroke={shade(shirt, 0.2)} strokeWidth={4} strokeLinecap="round" opacity={0.5} />}

              {/* crew collar (tee) */}
              {!suit && !racing && (
                <g>
                  <path d="M 124 186 L 176 186 Q 150 222 124 186 Z" fill={shade(skin, 0.2)} />
                  <path d="M 120 190 Q 150 228 180 190" fill="none" stroke={shade(shirt, 0.25)} strokeWidth={7} strokeLinecap="round" />
                </g>
              )}

              {/* racing suit details */}
              {racing && (
                <g>
                  <rect x={80} y={236} width={140} height={20} fill={team.secondary} />
                  <rect x={80} y={338} width={140} height={22} fill="#1E2127" />
                  <rect x={136} y={336} width={28} height={26} rx={6} fill={team.secondary} />
                  <circle cx={116} cy={290} r={14} fill={team.secondary} />
                  <circle cx={116} cy={290} r={7} fill={team.main} />
                  <path d="M 124 190 Q 150 214 176 190 Z" fill={shade(team.main, 0.3)} />
                  <path d="M 120 190 Q 150 222 180 190" fill="none" stroke={team.secondary} strokeWidth={8} strokeLinecap="round" />
                </g>
              )}

              {/* business suit details */}
              {suit && (
                <g>
                  <path d="M 126 188 L 174 188 L 150 268 Z" fill={toon.paper} />
                  <path d="M 122 188 L 150 272 L 108 258 Q 98 228 106 204 Z" fill={tint(suitColor, 0.1)} />
                  <path d="M 178 188 L 150 272 L 192 258 Q 202 228 194 204 Z" fill={tint(suitColor, 0.1)} />
                  <path d="M 150 272 L 150 383" stroke={shade(suitColor, 0.4)} strokeWidth={3} />
                  <path d="M 143 197 L 157 197 L 155 212 L 145 212 Z" fill={tieColor} />
                  <path d="M 145 212 L 155 212 L 162 292 L 150 310 L 138 292 Z" fill={tieColor} />
                  <path d="M 145 212 L 150 214 L 150 302 L 138 292 Z" fill={shade(tieColor, 0.22)} />
                  <circle cx={156} cy={330} r={5} fill={shade(suitColor, 0.5)} />
                  <circle cx={156} cy={356} r={5} fill={shade(suitColor, 0.5)} />
                  <path d="M 190 268 L 204 266 L 206 276 L 192 278 Z" fill={toon.paper} />
                </g>
              )}

              {/* tie accessory for tee wearers */}
              {accessory === "tie" && !suit && !racing && (
                <g>
                  <path d="M 144 205 L 156 205 L 154 220 L 146 220 Z" fill={toon.red} />
                  <path d="M 146 220 L 154 220 L 161 300 L 150 316 L 139 300 Z" fill={toon.red} />
                  <path d="M 146 220 L 150 222 L 150 308 L 139 300 Z" fill={shade(toon.red, 0.22)} />
                </g>
              )}

              {/* arms */}
              {pose === "arms-crossed" ? (
                <g>
                  <Arm s={SL} e={armL.e} h={armL.h} sleeve={shirt} skin={skin} hand={handColor} sleeveFrac={sleeveFrac} />
                  <Arm s={SR} e={armR.e} h={armR.h} sleeve={shirt} skin={skin} hand={handColor} sleeveFrac={sleeveFrac} />
                </g>
              ) : (
                <g>
                  <Arm s={SL} e={armL.e} h={armL.h} sleeve={shirt} skin={skin} hand={handColor} sleeveFrac={sleeveFrac} />
                  {tg.phone && <Phone at={armR.h} color={phoneColor} t={t} />}
                  <Arm s={SR} e={armR.e} h={armR.h} sleeve={shirt} skin={skin} hand={handColor} sleeveFrac={sleeveFrac} />
                </g>
              )}
              {tg.finger && (
                <path
                  d={`M ${armR.h.x} ${armR.h.y - 2} L ${armR.h.x + 30} ${armR.h.y - 6}`}
                  stroke={handColor}
                  strokeWidth={13}
                  strokeLinecap="round"
                />
              )}
              {hold === "champagne" && <Glass at={armR.h} t={t} />}
              {hold === "cigar" && <Cigar at={armR.h} t={t} />}
            </g>

            {/* head */}
            <g transform={`translate(0 ${bob}) rotate(${tilt} 150 172)`}>
              {hStyle === "curly" && <HairBack style="curly" color={hairColor} />}
              {suit && (
                <g fill={hairColor}>
                  <path d="M 76 66 C 56 88 58 130 78 148 L 90 116 Z" />
                  <path d="M 224 66 C 244 88 242 130 222 148 L 210 116 Z" />
                </g>
              )}
              {/* ears */}
              <circle cx={77} cy={102} r={15} fill={skin} />
              <circle cx={223} cy={102} r={15} fill={skin} />
              <circle cx={77} cy={102} r={7} fill={shade(skin, 0.18)} />
              <circle cx={223} cy={102} r={7} fill={shade(skin, 0.18)} />
              {/* head */}
              <circle cx={150} cy={95} r={75} fill={skin} />
              <path d="M 92 150 Q 150 190 208 150 Q 150 176 92 150 Z" fill={shade(skin, 0.12)} opacity={0.6} />
              {suit && <ellipse cx={150} cy={34} rx={24} ry={8} fill="#fff" opacity={0.2} />}

              {/* phone glow on the face */}
              {/* screen blend only lightens, so it never reads as a smudge on darker skin */}
              {tg.phone && <ellipse cx={168} cy={128} rx={58} ry={44} fill={phoneColor} opacity={0.18} style={{ mixBlendMode: "screen" }} />}

              {faceVisible && (
                <Face skin={skin} expression={expression} brow={brow} fx={fx} gazeY={tg.gazeY} blink={blink} bushy={suit} />
              )}
              {suit && moustache && (
                <g>
                  <path d={`M ${150 + fx} 124 Q ${128 + fx} 116 ${116 + fx} 130 Q ${132 + fx} 134 ${150 + fx} 128 Q ${168 + fx} 134 ${184 + fx} 130 Q ${172 + fx} 116 ${150 + fx} 124 Z`} fill={hairColor} />
                </g>
              )}
              {suit && (
                <path d={`M ${100 + fx} 134 Q ${96 + fx} 146 ${104 + fx} 154 M ${200 + fx} 134 Q ${204 + fx} 146 ${196 + fx} 154`} fill="none" stroke={shade(skin, 0.2)} strokeWidth={3.5} strokeLinecap="round" />
              )}

              {/* hair */}
              {!racing || helmet < 1 ? <HairFront style={hStyle} color={hairColor} cap={capColor} /> : null}
              {racing && helmet < 1 && (
                <path d="M 138 22 Q 130 2 150 -4 Q 144 10 152 20 Z" fill={hairColor} opacity={Math.min(1, (1 - helmet) * 3)} />
              )}

              {/* accessories */}
              {!racing && !suit && <Accessories accessory={accessory} fx={fx} skin={skin} accent={accessory === "cap" ? capColor : accessory === "headphones" ? toon.red : toon.red} />}
              {suit && glassesOn && <Accessories accessory="glasses" fx={fx} skin={skin} accent={toon.red} />}

              {/* helmet */}
              {racing && helmet > 0 && (
                <g transform={`translate(0 ${-lift}) rotate(${-(1 - helmet) * 16} 150 92)`} opacity={helmetOpacity}>
                  <Helmet uid={uid} color={helmetColor ?? team.secondary} stripe={team.main} visor={visor} fx={fx} />
                </g>
              )}
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};

const Helmet: React.FC<{ uid: string; color: string; stripe: string; visor: number; fx: number }> = ({ uid, color, stripe, visor, fx }) => {
  const ring = "M 60 92 a 90 90 0 1 0 180 0 a 90 90 0 1 0 -180 0 Z";
  const win = "M 122 62 H 178 Q 206 62 206 90 V 126 Q 206 156 176 156 H 124 Q 94 156 94 126 V 90 Q 94 62 122 62 Z";
  void uid;
  return (
    <g transform={`translate(${fx * 0.6} 0)`}>
      <path d={`${ring} ${win}`} fill={color} fillRule="evenodd" />
      <path d="M 138 4 L 162 4 L 168 62 L 132 62 Z" fill={stripe} />
      <path d="M 70 70 Q 80 38 110 22" fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.35} />
      <path d={win} fill="none" stroke={shade(color, 0.3)} strokeWidth={5} />
      <g opacity={visor * 0.95}>
        <path d={win} fill="#17191D" />
        <path d="M 112 150 L 150 68 L 168 68 L 130 150 Z" fill="#fff" opacity={0.12} />
        <path d="M 184 90 L 196 90" stroke={tint(stripe, 0.2)} strokeWidth={5} strokeLinecap="round" opacity={0.7} />
      </g>
      <path d="M 96 172 Q 150 196 204 172" fill="none" stroke={shade(color, 0.2)} strokeWidth={6} strokeLinecap="round" opacity={0.7} />
    </g>
  );
};

const Phone: React.FC<{ at: Pt; color: string; t: number }> = ({ at, color, t }) => (
  <g transform={`translate(${at.x + 6} ${at.y}) rotate(14)`}>
    <rect x={-22} y={-74} width={44} height={78} rx={10} fill="#15171A" />
    <rect x={-18} y={-70} width={36} height={66} rx={7} fill={color} />
    <rect x={-13} y={-64} width={26} height={7} rx={3.5} fill="#fff" opacity={0.55} />
    <rect x={-13} y={-50} width={26} height={16} rx={4} fill="#fff" opacity={0.28} />
    <rect x={-13} y={-28 + 2 * wave(t, 1.2)} width={18} height={6} rx={3} fill="#fff" opacity={0.4} />
    <rect x={-13} y={-18} width={26} height={6} rx={3} fill="#fff" opacity={0.3} />
  </g>
);

const Glass: React.FC<{ at: Pt; t: number }> = ({ at, t }) => (
  <g transform={`translate(${at.x} ${at.y}) rotate(${6 * wave(t, 2.5)})`}>
    <path d="M -13 -66 L 13 -66 L 10 -26 Q 0 -16 -10 -26 Z" fill="#F7D774" opacity={0.95} />
    <path d="M -13 -66 L 13 -66 L 12.2 -52 L -12.2 -52 Z" fill="#fff" opacity={0.55} />
    <path d="M -13 -66 L 13 -66 L 10 -26 Q 0 -16 -10 -26 Z" fill="none" stroke="#fff" strokeWidth={2.5} opacity={0.6} />
    <rect x={-2} y={-22} width={4} height={26} fill="#fff" opacity={0.7} />
    {[0, 1, 2].map((i) => {
      const k = (t * 0.9 + i * 0.33) % 1;
      return <circle key={i} cx={-4 + i * 4} cy={-28 - k * 30} r={1.8} fill="#fff" opacity={0.8 * (1 - k)} />;
    })}
  </g>
);

const Cigar: React.FC<{ at: Pt; t: number }> = ({ at, t }) => (
  <g transform={`translate(${at.x} ${at.y})`}>
    <path d="M -2 -2 L -44 -10" stroke="#6B3F25" strokeWidth={11} strokeLinecap="round" />
    <path d="M -2 -2 L -14 -4" stroke="#C9A06A" strokeWidth={11} strokeLinecap="butt" />
    <circle cx={-46} cy={-10} r={6} fill={toon.amber} />
    {[0, 1, 2, 3].map((i) => {
      const k = (t * 0.45 + i * 0.25) % 1;
      return <circle key={i} cx={-48 - k * 14 + Math.sin(k * 9 + i) * 8} cy={-14 - k * 90} r={6 + k * 20} fill="#EEEEEE" opacity={0.5 * (1 - k)} />;
    })}
  </g>
);

/* ------------------------------------------------------------------ public components */

/**
 * One configurable flat, front-facing person (nominal 300x600 box, scaled by `size`).
 * Built-in idle life: breathing, head bob, blinking, arm sway; wave/cheer/clap loop from the frame.
 */
export const Person: React.FC<PersonProps> = (props) => <Figure outfit="tee" {...props} />;

/** Racing driver: team-coloured suit, helmet with visor. `helmet` 1 -> 0 animates a lift-off. */
export const Driver: React.FC<DriverProps> = ({ hair = "short", ...rest }) => (
  <Figure outfit="racing" hair={hair} expression="grin" {...rest} />
);

/** Older businessman in a dark suit and tie: executives / "old boys' club". Can hold a champagne glass or cigar. */
export const Suit: React.FC<SuitProps> = ({ suit, tie, hairColor = toon.hairs.grey, glasses = false, moustache = true, skin = toon.skins[0], expression = "smile", ...rest }) => (
  <Figure outfit="suit" skin={skin} hairColor={hairColor} suitColor={suit} tieColor={tie} glassesOn={glasses} moustache={moustache} expression={expression} {...rest} />
);
