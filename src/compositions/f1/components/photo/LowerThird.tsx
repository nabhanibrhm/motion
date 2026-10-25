import { CSSProperties } from "react";
import { useCurrentFrame } from "remotion";
import { toon } from "../../../../theme";
import { ramp } from "../toon/anim";
import { alpha, expoOut } from "./util";

export type LowerThirdProps = {
  text: string;
  /** Small second line / role (optional, "ink" variant only). */
  sub?: string;
  /** "ink" (default): dark-green pill, cream text. "ui": sage pill, dark text; `active` turns it green with cream text. */
  variant?: "ink" | "ui";
  active?: boolean;
  /** Top-left of the pill in frame px (default 140, 700: above the caption zone). */
  x?: number;
  y?: number;
  /** Anchor x on the pill's "center" instead of its left edge. */
  anchor?: "left" | "center";
  fontSize?: number;
  /** Scene frame to enter (slides + unmasks left to right) and optional exit. */
  at?: number;
  exitAt?: number;
  style?: CSSProperties;
};

/** Pill label: dark-green lower third for photos, or the sage UI-chip variant (e.g. tab / menu items, `active` = selected). */
export const LowerThird: React.FC<LowerThirdProps> = ({ text, sub, variant = "ink", active = false, x = 140, y = 700, anchor = "left", fontSize = 36, at = 0, exitAt, style }) => {
  const frame = useCurrentFrame();
  const inP = ramp(frame, at, 16, expoOut);
  const outP = exitAt === undefined ? 0 : ramp(frame, exitAt, 10);
  const p = inP * (1 - outP);
  if (frame < at || p <= 0.001) return null;

  const ui = variant === "ui";
  const bg = ui ? (active ? toon.green : toon.sage) : toon.ink;
  const fg = ui ? (active ? toon.paper : toon.ink) : toon.paper;
  const padX = Math.round(fontSize * 0.75);
  const padY = Math.round(fontSize * 0.34);
  const reveal = (1 - inP) * 100;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translateX(${anchor === "center" ? "-50%" : "0"}) translateX(${(1 - inP) * -36}px)`,
        opacity: Math.min(1, p * 2) * (1 - outP),
        clipPath: `inset(-20px ${reveal}% -20px 0 round 999px)`,
        filter: ui ? undefined : `drop-shadow(0 10px 18px ${alpha(toon.ink, 0.25)})`,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: Math.round(fontSize * 0.45),
          padding: `${padY}px ${padX}px`,
          borderRadius: 999,
          background: bg,
          color: fg,
          fontFamily: toon.font.body,
          fontWeight: 800,
          fontSize,
          lineHeight: 1.1,
          letterSpacing: ui ? "0.01em" : "0.06em",
          textTransform: ui ? "none" : "uppercase",
          whiteSpace: "nowrap",
          boxShadow: ui && !active ? `inset 0 0 0 2px ${toon.sageDeep}` : undefined,
        }}
      >
        {!ui && <span style={{ width: fontSize * 0.28, height: fontSize * 0.28, borderRadius: "50%", background: toon.sage }} />}
        <span>{text}</span>
        {sub && !ui && <span style={{ fontWeight: 600, opacity: 0.7, letterSpacing: "0.02em", textTransform: "none", fontSize: fontSize * 0.8 }}>{sub}</span>}
      </div>
    </div>
  );
};
