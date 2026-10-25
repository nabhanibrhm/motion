import React from "react";
import { mascot } from "../../../../theme";
import { CharacterSpec, Figure } from "./Figure";
import { FigureProps, INK, Mottle, SW } from "./parts";

const FILL = mascot.mog;
const BODY = "M200 112 C292 112 350 175 354 262 C358 348 350 408 308 438 C270 464 130 464 92 438 C50 408 42 348 46 262 C50 175 108 112 200 112Z";

const spec: CharacterSpec = {
  id: "mog",
  lidFill: FILL,
  armFill: FILL,
  armW: 34,
  eyeL: { cx: 146, cy: 218, rx: 42, ry: 38, pr: 24 },
  eyeR: { cx: 258, cy: 224, rx: 37, ry: 34, pr: 21 },
  idleLook: [
    [0.35, 0.5],
    [0.1, 0.5],
  ],
  lid: 0.36,
  lidTilt: 3,
  brows: [
    { cx: 144, cy: 164, w: 36 },
    { cx: 264, cy: 174, w: 32 },
  ],
  cheeks: [
    { cx: 98, cy: 284, rx: 28, ry: 21 },
    { cx: 308, cy: 290, rx: 28, ry: 21 },
  ],
  mouth: { cx: 203, cy: 288, w: 58, teeth: "two", hMax: 38 },
  armL: { from: [66, 316], hang: [56, 384] },
  armR: { from: [334, 316], hang: [344, 384] },
  head: { cx: 200, cy: 215, r: 150 },
  dots: { x: 318, y: 120 },
  shadowRx: 150,
  back: ({ sway }) => (
    <g>
      {/* feet */}
      <g fill={FILL} stroke={INK} strokeWidth={SW}>
        <ellipse cx={126} cy={448} rx={46} ry={16} />
        <ellipse cx={274} cy={448} rx={46} ry={16} />
      </g>
      <g stroke={INK} strokeWidth={3.5} strokeLinecap="round" opacity={0.8}>
        <path d="M118 456 v-9 M133 457 v-9 M148 455 v-8 M252 455 v-8 M267 457 v-9 M282 456 v-9" />
      </g>
      {/* tuft */}
      <g fill={FILL} stroke={INK} strokeWidth={SW} strokeLinejoin="round" transform={`translate(0 20) rotate(${sway * 3} 200 96)`}>
        <path d="M197 100 C170 90 160 76 156 60 C180 62 196 78 202 100Z" />
        <path d="M203 100 C230 88 240 72 246 58 C222 62 206 78 199 100Z" />
        <path d="M193 100 C184 72 190 50 202 38 C214 52 216 76 207 100Z" />
      </g>
    </g>
  ),
  body: (
    <g>
      <defs>
        <clipPath id="mog-body">
          <path d={BODY} />
        </clipPath>
      </defs>
      <path d={BODY} fill={FILL} />
      <g clipPath="url(#mog-body)">
        <Mottle
          spots={[
            [100, 200, 7],
            [92, 310, 5],
            [300, 165, 6],
            [312, 350, 7],
            [150, 125, 5],
            [255, 118, 4],
            [80, 400, 6],
          ]}
          opacity={0.2}
        />
        <Mottle spots={[[250, 330, 5], [320, 215, 4], [130, 340, 4]]} fill={mascot.cream} opacity={0.12} />
      </g>
      <ellipse cx={200} cy={392} rx={70} ry={52} fill={mascot.sage} stroke={INK} strokeWidth={4} />
      <path d={BODY} fill="none" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    </g>
  ),
};

export const Mog: React.FC<FigureProps> = (p) => <Figure spec={spec} {...p} />;
