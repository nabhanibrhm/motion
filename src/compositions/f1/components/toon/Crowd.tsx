import { CSSProperties } from "react";
import { random, useCurrentFrame, useVideoConfig } from "remotion";
import { toon } from "../../../../theme";
import { wave } from "./anim";
import { mix, shade } from "./color";

export type CrowdProps = {
  /** Total width in px (height follows from rows). Default 1200. */
  width?: number;
  rows?: number;
  cols?: number;
  /** 0..1: fraction of the crowd with arms up, jumping and open mouths. */
  cheering?: number;
  /** 0..1: fraction of the crowd holding up a glowing phone. */
  phoneLights?: number;
  /** Changes who is who. */
  seed?: number;
  /** Shirt colours (default a warm mixed palette). */
  palette?: string[];
  /** Absolute placement: x = centre, y = bottom edge, in frame px. */
  x?: number;
  y?: number;
  style?: CSSProperties;
};

const SHIRTS = [toon.red, toon.amber, toon.mint, toon.sky, toon.pink, toon.lilac, toon.paper, "#2F6DB5", "#C9B28A"];
const HAIRS = Object.values(toon.hairs).slice(0, 6);

/** Height in px of a Crowd of the given geometry (for layout). */
export const crowdHeight = (width: number, rows: number, cols: number) => {
  const u = width / cols;
  return u * 1.55 + (rows - 1) * u * 0.58;
};

/** Rows of simplified small people (heads + shoulders) bobbing; back rows are smaller and dimmer. */
export const Crowd: React.FC<CrowdProps> = ({ width = 1200, rows = 3, cols = 10, cheering = 0.3, phoneLights = 0, seed = 1, palette = SHIRTS, x, y, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const u = width / (cols + 0.5);
  const step = u * 0.58;
  const H = crowdHeight(width, rows, cols);

  const people: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    const depth = rows === 1 ? 1 : r / (rows - 1); // 0 back .. 1 front
    const s = 0.82 + 0.18 * depth;
    const dim = (1 - depth) * 0.3;
    const base = u * 1.55 + r * step;
    for (let c = 0; c < cols; c++) {
      const id = `${seed}-${r}-${c}`;
      const cx = u * 0.5 + c * u + (r % 2 ? u * 0.5 : 0) + (random(`cx${id}`) - 0.5) * u * 0.18;
      const cheer = random(`ch${id}`) < cheering;
      const phone = !cheer && random(`ph${id}`) < phoneLights;
      const ph = random(`pp${id}`);
      const period = cheer ? 0.55 + random(`pe${id}`) * 0.2 : 2.2 + random(`pe${id}`) * 0.8;
      const jump = cheer ? Math.abs(wave(t, period, ph)) * u * 0.2 : (0.5 + 0.5 * wave(t, period, ph)) * u * 0.04;
      const hr = u * 0.3 * s;
      const yc = base - u * 0.62 * s - jump;
      const skin = mix(toon.skins[Math.floor(random(`sk${id}`) * toon.skins.length)], toon.ground, dim);
      const shirt = mix(palette[Math.floor(random(`sh${id}`) * palette.length)], toon.ground, dim);
      const hair = mix(HAIRS[Math.floor(random(`ha${id}`) * HAIRS.length)], toon.ground, dim);
      const hs = Math.floor(random(`hs${id}`) * 3);
      const sw = u * 0.92 * s;
      const arm = u * 0.2 * s;
      people.push(
        <g key={id}>
          {cheer && (
            <g stroke={skin} strokeWidth={arm} strokeLinecap="round" fill="none">
              <path d={`M ${cx - sw * 0.38} ${base - u * 0.2 - jump} L ${cx - sw * 0.62 - wave(t, period, ph) * u * 0.08} ${yc - hr * 1.5}`} />
              <path d={`M ${cx + sw * 0.38} ${base - u * 0.2 - jump} L ${cx + sw * 0.62 + wave(t, period, ph + 0.5) * u * 0.08} ${yc - hr * 1.5}`} />
            </g>
          )}
          {phone && (
            <g>
              <path d={`M ${cx + sw * 0.4} ${base - u * 0.2 - jump} L ${cx + sw * 0.5} ${yc - hr * 1.2}`} stroke={skin} strokeWidth={arm} strokeLinecap="round" />
              <circle cx={cx + sw * 0.5} cy={yc - hr * 1.5} r={hr * 1.3} fill={toon.amber} opacity={0.2 + 0.08 * wave(t, 1.3, ph)} />
              <rect x={cx + sw * 0.5 - hr * 0.3} y={yc - hr * 1.95} width={hr * 0.6} height={hr * 0.9} rx={hr * 0.12} fill={mix(toon.ink, toon.sky, 0.35)} />
            </g>
          )}
          {/* shoulders */}
          <path d={`M ${cx - sw / 2} ${base + 4} Q ${cx - sw / 2} ${base - u * 0.5 * s} ${cx} ${base - u * 0.5 * s} Q ${cx + sw / 2} ${base - u * 0.5 * s} ${cx + sw / 2} ${base + 4} Z`} fill={shirt} transform={`translate(0 ${-jump * 0.6})`} />
          {/* head */}
          <circle cx={cx} cy={yc} r={hr} fill={skin} />
          {hs !== 2 && <path d={`M ${cx - hr} ${yc} A ${hr} ${hr} 0 0 1 ${cx + hr} ${yc} Q ${cx} ${yc - hr * 0.45} ${cx - hr} ${yc} Z`} fill={hair} />}
          {hs === 2 && <circle cx={cx} cy={yc - hr * 0.95} r={hr * 0.38} fill={hair} />}
          <circle cx={cx - hr * 0.36} cy={yc + hr * 0.12} r={hr * 0.11} fill="#2B2620" />
          <circle cx={cx + hr * 0.36} cy={yc + hr * 0.12} r={hr * 0.11} fill="#2B2620" />
          {cheer ? (
            <ellipse cx={cx} cy={yc + hr * 0.52} rx={hr * 0.26} ry={hr * 0.22} fill="#4A2A22" />
          ) : (
            <path d={`M ${cx - hr * 0.26} ${yc + hr * 0.42} Q ${cx} ${yc + hr * 0.65} ${cx + hr * 0.26} ${yc + hr * 0.42}`} fill="none" stroke={shade(skin, 0.6)} strokeWidth={hr * 0.1} strokeLinecap="round" />
          )}
        </g>,
      );
    }
  }

  const pos: CSSProperties = x !== undefined || y !== undefined ? { position: "absolute", left: (x ?? 0) - width / 2, top: (y ?? 0) - H } : {};
  return (
    <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} style={{ overflow: "visible", display: "block", ...pos, ...style }}>
      {people}
    </svg>
  );
};
