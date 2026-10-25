import { toon } from "../../../../theme";

const parse = (hex: string): [number, number, number] => {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};

const hex2 = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, "0");

/** Mix two #rrggbb colours; t=0 gives a, t=1 gives b. */
export const mix = (a: string, b: string, t: number) => {
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  return `#${hex2(r1 + (r2 - r1) * t)}${hex2(g1 + (g2 - g1) * t)}${hex2(b1 + (b2 - b1) * t)}`;
};

/** Flat 1-tone shadow: the colour mixed toward dark green. */
export const shade = (c: string, amount = 0.2) => mix(c, toon.groundDeep, amount);

/** Flat highlight: the colour mixed toward paper (cream). */
export const tint = (c: string, amount = 0.2) => mix(c, toon.paper, amount);
