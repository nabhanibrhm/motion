import React from "react";
import { mascot } from "../../../../theme";
import { CharacterSpec, Figure } from "./Figure";
import { FigureProps, INK, Mottle, SW } from "./parts";

const BODY = "M200 100 C258 100 292 154 295 228 C298 290 308 350 298 405 C290 445 248 458 200 458 C152 458 110 445 102 405 C92 350 102 290 105 228 C108 154 142 100 200 100Z";
const EAR = mascot.mog;

const spec: CharacterSpec = {
  id: "wec",
  lidFill: mascot.cream,
  armFill: mascot.cream,
  armW: 30,
  eyeL: { cx: 155, cy: 205, rx: 38, ry: 36, pr: 21 },
  eyeR: { cx: 250, cy: 222, rx: 33, ry: 32, pr: 19 },
  idleLook: [
    [0.55, -0.35],
    [0.5, -0.3],
  ],
  lid: 0,
  cheeks: [
    { cx: 124, cy: 262, rx: 22, ry: 17 },
    { cx: 280, cy: 272, rx: 22, ry: 17 },
  ],
  mouth: { cx: 214, cy: 288, w: 76, teeth: "one", hMax: 34, baseOpen: 0.5 },
  armL: { from: [108, 322], hang: [104, 386] },
  armR: { from: [292, 322], hang: [296, 386] },
  head: { cx: 200, cy: 200, r: 130 },
  dots: { x: 318, y: 112 },
  shadowRx: 135,
  back: ({ sway, jiggle }) => (
    <g>
      {/* hanging ear (viewer right) */}
      <g transform={`rotate(${sway * 2.5 + jiggle * 2} 262 140)`}>
        <path
          d="M252 128 C300 116 338 162 348 232 C356 292 350 338 324 342 C300 345 296 296 290 250 C286 214 270 180 250 168Z"
          fill={EAR}
          stroke={INK}
          strokeWidth={SW}
          strokeLinejoin="round"
        />
      </g>
      {/* floppy raised ear (viewer left): rises, then flops at the tip */}
      <g transform={`rotate(${-sway * 3 - jiggle * 3} 140 150)`}>
        <path
          d="M158 142 C122 92 78 50 36 44 C6 40 -6 74 20 98 C46 120 86 128 118 166 Z"
          fill={EAR}
          stroke={INK}
          strokeWidth={SW}
          strokeLinejoin="round"
        />
      </g>
      {/* feet */}
      <g fill={mascot.cream} stroke={INK} strokeWidth={SW}>
        <ellipse cx={148} cy={450} rx={44} ry={14} />
        <ellipse cx={254} cy={450} rx={44} ry={14} />
      </g>
      <g stroke={INK} strokeWidth={3.5} strokeLinecap="round" opacity={0.8}>
        <path d="M136 458 v-8 M152 458 v-8 M242 458 v-8 M258 458 v-8" />
      </g>
    </g>
  ),
  body: (
    <g>
      <defs>
        <clipPath id="wec-body">
          <path d={BODY} />
        </clipPath>
      </defs>
      <path d={BODY} fill={mascot.cream} />
      <g clipPath="url(#wec-body)">
        <Mottle
          spots={[
            [128, 330, 8],
            [140, 395, 6],
            [278, 360, 7],
            [250, 420, 5],
            [270, 160, 5],
            [140, 150, 4],
          ]}
          fill={mascot.sage}
          opacity={0.9}
        />
      </g>
      <path d={BODY} fill="none" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    </g>
  ),
  front: ({ sway }) => (
    <g fill={mascot.cream} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" strokeLinecap="round" transform={`rotate(${sway * 4} 214 104)`}>
      <path d="M212 104 C204 92 206 82 212 74 C220 82 220 94 216 104Z" />
      <path d="M208 106 C196 100 190 92 190 84 C202 86 210 94 212 106Z" />
      <path d="M216 106 C228 100 236 92 238 84 C226 84 218 94 214 106Z" />
    </g>
  ),
};

export const Wec: React.FC<FigureProps> = (p) => <Figure spec={spec} {...p} />;
