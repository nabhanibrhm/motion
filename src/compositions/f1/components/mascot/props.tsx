import React from "react";
import { editorial, objects } from "../../../../theme";

/*
 * SVG art for props, drawn in plain svg units so the same art is used held by a mascot (inside the figure's
 * viewBox) and as a standalone set piece (sets.tsx). Colours are natural object colours, not the mascot green.
 */

const OUT = "#1A1A1A"; // prop outline: neutral near-black, same weight as the mascot line work
const SW = 4;

/** One ticket, origin at its bottom-centre. 64 x 36 units. */
export const TicketArt: React.FC<{ stub?: string; w?: number; h?: number }> = ({ stub = editorial.accent, w = 64, h = 36 }) => (
  <g strokeLinejoin="round">
    <rect x={-w / 2} y={-h} width={w} height={h} rx={5} fill={objects.paper} stroke={OUT} strokeWidth={SW} />
    <path d={`M ${-w / 2 + 5} ${-h + 1} h ${w * 0.26 - 5} v ${h - 2} h ${-(w * 0.26 - 5)} a4 4 0 0 1 -4 -4 v ${-(h - 10)} a4 4 0 0 1 4 -4 z`} fill={stub} />
    <path d={`M ${-w / 2 + w * 0.26} ${-h + 3} v ${h - 6}`} stroke={OUT} strokeWidth={2} strokeDasharray="3 3" />
    <g fill={OUT} opacity={0.75}>
      <rect x={-w / 2 + w * 0.26 + 7} y={-h + 9} width={w * 0.42} height={4} rx={2} />
      <rect x={-w / 2 + w * 0.26 + 7} y={-h + 18} width={w * 0.3} height={4} rx={2} />
    </g>
  </g>
);

/** A fan of tickets, origin at the hand (pivot at the bottom). */
export const TicketsArt: React.FC<{ count?: number }> = ({ count = 2 }) => {
  const stubs = [editorial.accent, objects.liveries.sky, objects.liveries.amber];
  const spread = count > 1 ? 26 : 0;
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const a = count > 1 ? -spread / 2 + (spread / (count - 1)) * i : 0;
        return (
          <g key={i} transform={`translate(0 -4) rotate(${a})`}>
            <g transform="translate(0 -6)">
              <TicketArt stub={stubs[i % stubs.length]} />
            </g>
          </g>
        );
      })}
    </g>
  );
};

/** Back of a phone held up to film, origin at the hand (bottom of the phone). */
export const PhoneArt: React.FC = () => (
  <g strokeLinejoin="round">
    <rect x={-24} y={-86} width={48} height={92} rx={9} fill="#23262D" stroke={OUT} strokeWidth={SW} />
    <rect x={-17} y={-79} width={22} height={24} rx={7} fill="#15171B" />
    <circle cx={-10} cy={-72} r={5} fill="#3B4350" stroke="#0A0A0A" strokeWidth={1.5} />
    <circle cx={1} cy={-62} r={4} fill="#3B4350" stroke="#0A0A0A" strokeWidth={1.5} />
    <circle cx={-10} cy={-72} r={1.8} fill="#8FB8E8" />
  </g>
);

/** Folded map, origin at its centre. */
export const MapArt: React.FC<{ w?: number; h?: number }> = ({ w = 156, h = 108 }) => {
  const x0 = -w / 2;
  const y0 = -h / 2;
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <rect x={x0} y={y0} width={w} height={h} rx={6} fill={objects.paper} stroke={OUT} strokeWidth={SW} />
      <path d={`M ${x0 + 8} ${y0 + 8} h 46 l 12 18 l -20 22 l -38 -4 z`} fill={objects.liveries.sky} opacity={0.5} />
      <path d={`M ${x0 + w * 0.55} ${y0 + 10} l 40 10 l 8 30 l -30 20 l -22 -18 z`} fill={objects.liveries.mint} opacity={0.5} />
      <path d={`M ${x0 + 24} ${y0 + h - 22} Q ${x0 + 60} ${y0 + 40} ${x0 + w * 0.62} ${y0 + h * 0.5} T ${x0 + w - 22} ${y0 + 24}`} fill="none" stroke={editorial.accent} strokeWidth={4} strokeDasharray="1 9" />
      <path d={`M ${x0 + w / 3} ${y0 + 2} v ${h - 4} M ${x0 + (w * 2) / 3} ${y0 + 2} v ${h - 4}`} stroke={OUT} strokeWidth={2} opacity={0.35} />
      <circle cx={x0 + w - 24} cy={y0 + 24} r={7} fill={editorial.accent} stroke={OUT} strokeWidth={3} />
    </g>
  );
};

const TILE_SKIN = [objects.skins[0], objects.skins[2], objects.skins[4], objects.skins[1], objects.skins[3], objects.skins[2]];
const TILE_HELMET = [objects.liveries.red, objects.liveries.sky, objects.liveries.amber, objects.liveries.mint, objects.liveries.lilac, objects.liveries.pink];

/** One driver "portrait" tile (abstract bust: helmet, face, shoulders), origin at its top-left. */
export const DriverTile: React.FC<{ w: number; h: number; i: number; highlight?: number }> = ({ w, h, i, highlight = 0 }) => {
  const cx = w / 2;
  return (
    <g>
      <rect width={w} height={h} rx={4} fill={editorial.panel} />
      <path d={`M ${w * 0.12} ${h} Q ${w * 0.14} ${h * 0.68} ${cx} ${h * 0.66} Q ${w * 0.86} ${h * 0.68} ${w * 0.88} ${h} Z`} fill={TILE_HELMET[i % 6]} />
      <circle cx={cx} cy={h * 0.4} r={w * 0.2} fill={TILE_SKIN[i % 6]} />
      <path d={`M ${cx - w * 0.22} ${h * 0.38} a ${w * 0.22} ${w * 0.22} 0 0 1 ${w * 0.44} 0 q ${-w * 0.22} ${-h * 0.06} ${-w * 0.44} 0 z`} fill={TILE_HELMET[(i + 2) % 6]} />
      {highlight > 0 && <rect x={1.5} y={1.5} width={w - 3} height={h - 3} rx={4} fill="none" stroke={editorial.accent} strokeWidth={4} opacity={highlight} />}
    </g>
  );
};

/** Framed story board of driver portraits, origin at its centre. `highlight` = tile index to ring (or -1). */
export const BoardArt: React.FC<{ w?: number; h?: number; cols?: number; rows?: number; highlight?: number; highlightAmount?: number }> = ({
  w = 156,
  h = 116,
  cols = 3,
  rows = 2,
  highlight = -1,
  highlightAmount = 1,
}) => {
  const pad = Math.max(8, w * 0.07);
  const gap = Math.max(4, w * 0.03);
  const tw = (w - pad * 2 - gap * (cols - 1)) / cols;
  const th = (h - pad * 2 - gap * (rows - 1)) / rows;
  return (
    <g strokeLinejoin="round">
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill={objects.wood} stroke={OUT} strokeWidth={SW} />
      <rect x={-w / 2 + pad / 2} y={-h / 2 + pad / 2} width={w - pad} height={h - pad} rx={3} fill={editorial.white} />
      <g transform={`translate(${-w / 2 + pad} ${-h / 2 + pad})`}>
        {Array.from({ length: cols * rows }, (_, i) => (
          <g key={i} transform={`translate(${(i % cols) * (tw + gap)} ${Math.floor(i / cols) * (th + gap)})`}>
            <DriverTile w={tw} h={th} i={i} highlight={i === highlight ? highlightAmount : 0} />
          </g>
        ))}
      </g>
    </g>
  );
};
