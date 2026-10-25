import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { colors } from "../theme";

// Slowly drifting gradient blobs behind every scene.
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 300], [0, 1], { extrapolateRight: "extend" });
  const x1 = 30 + Math.sin(drift * Math.PI) * 15;
  const y1 = 30 + Math.cos(drift * Math.PI) * 10;
  const x2 = 70 - Math.sin(drift * Math.PI) * 15;
  const y2 = 70 - Math.cos(drift * Math.PI) * 10;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        backgroundImage: [
          `radial-gradient(circle at ${x1}% ${y1}%, ${colors.accent}55 0%, transparent 45%)`,
          `radial-gradient(circle at ${x2}% ${y2}%, ${colors.accent2}40 0%, transparent 45%)`,
        ].join(","),
      }}
    />
  );
};
