import { interpolate, useCurrentFrame } from "remotion";
import { editorial, toon } from "../../../theme";
import { segmentAt, TOTAL_FRAMES } from "../timeline";

// Persistent progress bar (bottom edge) and small chapter label (top-left). Editorial: white pill with black text
// (readable over photos, light and dark grounds), accent dot and accent progress.
export const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const seg = segmentAt(frame);
  const show = seg.kind === "section";
  const label = interpolate(frame - seg.from, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <>
      {show && (
        <div
          style={{
            position: "absolute",
            top: 36,
            left: 52,
            padding: "8px 18px 8px 14px",
            borderRadius: 999,
            background: `${editorial.white}F2`,
            boxShadow: `0 0 0 1.5px ${editorial.rule}`,
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: toon.font.body,
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: editorial.ink,
            opacity: label,
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: 6, background: editorial.accent }} />
          {String(seg.chapterIndex + 1).padStart(2, "0")} · {seg.chapter}
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 8, background: `${editorial.ink}26` }}>
        <div style={{ width: `${(frame / TOTAL_FRAMES) * 100}%`, height: "100%", background: editorial.accent, borderRadius: "0 4px 4px 0" }} />
      </div>
    </>
  );
};
