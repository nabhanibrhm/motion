import { Easing } from "remotion";
import { toon } from "../../../../theme";

/** "#rrggbb" + alpha 0..1 -> "#rrggbbaa". */
export const alpha = (hex: string, a: number) => `${hex}${Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, "0")}`;

/** Fast-out, long settle: the signature ease of the kit (premium, never bouncy). */
export const expoOut = Easing.bezier(0.16, 1, 0.3, 1);
/** Slow start, fast middle, soft landing (wipes, bars). */
export const expoInOut = Easing.bezier(0.7, 0, 0.2, 1);
/** Gentle glide for Ken Burns moves. */
export const glide = Easing.inOut(Easing.sin);

/** Ink, green, sage: the bar colours of the race wipes. */
export const BARS = [toon.ink, toon.green, toon.sage] as const;
