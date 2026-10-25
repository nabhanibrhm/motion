import React from "react";
import { mascot } from "../../../../theme";
import { CharacterSpec, Figure } from "./Figure";
import { FigureProps, INK, Mottle, SW } from "./parts";

const BODY =
  "M130 152 C170 144 235 144 275 152 C330 162 350 202 350 262 L350 340 C350 380 335 400 300 402 L105 402 C70 400 55 380 55 340 L55 262 C55 202 75 162 130 152Z";
const BODY_FILL = mascot.sageDeep;

const spec: CharacterSpec = {
  id: "bog",
  lidFill: BODY_FILL,
  armFill: BODY_FILL,
  armW: 32,
  eyeL: { cx: 150, cy: 252, rx: 45, ry: 44, pr: 25 },
  eyeR: { cx: 274, cy: 262, rx: 29, ry: 28, pr: 16 },
  idleLook: [
    [-0.3, -0.3],
    [0.35, -0.25],
  ],
  lid: 0,
  brows: [
    { cx: 148, cy: 196, w: 30 },
    { cx: 276, cy: 216, w: 24 },
  ],
  cheeks: [
    { cx: 100, cy: 306, rx: 24, ry: 18 },
    { cx: 326, cy: 314, rx: 24, ry: 18 },
  ],
  mouth: { cx: 210, cy: 320, w: 112, teeth: "two", hMax: 36 },
  armL: { from: [64, 296], hang: [56, 372] },
  armR: { from: [342, 296], hang: [350, 372] },
  head: { cx: 200, cy: 250, r: 150 },
  dots: { x: 322, y: 118 },
  shadowRx: 150,
  back: ({ sway }) => (
    <g>
      {/* legs + feet */}
      <g fill={mascot.green} stroke={INK} strokeWidth={SW} strokeLinejoin="round">
        <path d="M104 392 L106 446 C106 456 118 462 134 462 C152 462 160 456 158 446 L156 392Z" />
        <path d="M250 392 L248 446 C246 456 254 462 272 462 C288 462 300 456 300 446 L302 392Z" />
      </g>
      {/* leafy tuft */}
      <g fill={mascot.green} stroke={INK} strokeWidth={SW} strokeLinejoin="round" transform={`rotate(${sway * 2.5} 205 150)`}>
        <path d="M160 156 C140 138 148 112 172 114 C170 92 214 84 224 110 C248 104 262 130 244 156Z" />
      </g>
      <path d="M206 112 C204 126 206 138 210 146 M180 128 C186 134 190 140 192 146 M232 126 C228 134 226 140 226 146" fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" opacity={0.55} />
    </g>
  ),
  body: (
    <g>
      <defs>
        <clipPath id="bog-body">
          <path d={BODY} />
        </clipPath>
      </defs>
      <path d={BODY} fill={BODY_FILL} />
      <g clipPath="url(#bog-body)">
        <Mottle
          spots={[
            [90, 205, 7],
            [320, 190, 6],
            [330, 365, 7],
            [80, 380, 6],
            [215, 380, 5],
            [250, 180, 4],
          ]}
          opacity={0.14}
        />
        <Mottle spots={[[130, 170, 7], [300, 330, 5]]} fill={mascot.cream} opacity={0.3} />
      </g>
      <path d={BODY} fill="none" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    </g>
  ),
};

export const Bog: React.FC<FigureProps> = (p) => <Figure spec={spec} {...p} />;
