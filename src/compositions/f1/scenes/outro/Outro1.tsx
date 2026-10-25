import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Sfx } from "../../components/Sfx";
import { useWordFrame } from "../../components/hooks";
import { Photo, photoLayout } from "../../components/photo";
import { SceneProps } from "../../manifest";
import { editorial, objects, toon } from "../../../../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Label: React.FC<{ box: { x: number; y: number; w: number }; title: string; sub: string; at: number; accent?: boolean }> = ({ box, title, sub, at, accent }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at, at + 14], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", left: box.x, top: box.y, width: box.w, textAlign: "center", opacity: o, fontFamily: toon.font.display }}>
      <div style={{ fontWeight: 800, fontSize: 38, color: editorial.ink }}>{title}</div>
      <div style={{ margin: "8px auto", width: 90 * o, height: 6, borderRadius: 3, background: accent ? editorial.accent : editorial.muted }} />
      <div style={{ fontFamily: toon.font.body, fontWeight: 700, fontSize: 28, color: accent ? editorial.accentOnLight : editorial.muted }}>{sub}</div>
    </div>
  );
};

/** Fifteen years ago (sepia paddock) next to today (natural-colour grandstand). */
export const Outro1: React.FC<SceneProps> = ({ section }) => {
  const f = useCurrentFrame();
  const lay = photoLayout("two-up");
  const [a, b] = lay.photos;
  const [la, lb] = lay.labels;
  const fifteen = useWordFrame(section, "fifteen");
  const today = useWordFrame(section, "today");
  const fade = interpolate(f, [today - 6, today + 20], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ background: editorial.bg }}>
      <Photo src="assets/archival/f1_paddock_2010.jpg" x={a.x} y={a.y} w={a.w} h={a.h} fit="cover" focal={{ x: 0.5, y: 0.5 }} at={Math.max(0, fifteen - 4)} desaturate={1} grain={0.4} vignette={0.3} enter="rise" enterFrames={18}>
        <div style={{ position: "absolute", inset: 0, background: objects.old.tan, mixBlendMode: "multiply", opacity: 0.7 }} />
        <div style={{ position: "absolute", inset: 0, background: editorial.bg, opacity: fade * 0.25 }} />
      </Photo>
      <Photo src="assets/crowds/usgp_quali_grandstand.jpg" x={b.x} y={b.y} w={b.w} h={b.h} fit="cover" focal={{ x: 0.5, y: 0.55 }} at={today - 4} enter="rise" enterFrames={18} />
      <Label box={la} title="2010" sub="Doors shut. Pay to peek." at={Math.max(0, fifteen)} />
      <Label box={lb} title="Today" sub="Doors wide open." at={today} accent />
      <Sfx name="swoosh-soft" at={today - 4} volume={0.2} />
    </AbsoluteFill>
  );
};
