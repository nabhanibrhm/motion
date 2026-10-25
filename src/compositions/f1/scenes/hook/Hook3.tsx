import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { objects, toon } from "../../../../theme";
import { Grain } from "../../components/Grain";
import { useLine, useSpeaking, useWordFrame } from "../../components/hooks";
import { Mascot } from "../../components/mascot";
import { Photo, photoLayout } from "../../components/photo";
import { Sfx } from "../../components/Sfx";
import { clamp, ramp } from "../../components/toon/anim";
import { SceneProps } from "../../manifest";
import { Chip, Ground, Sepia } from "./bits";

const OLD = objects.old;

export const Hook3: React.FC<SceneProps> = ({ section }) => {
  const frame = useCurrentFrame();
  const club = useLine(section, 1);
  const rewind = useWordFrame(section, "rewind");
  const exclusive = useWordFrame(section, "exclusive");
  const euro = useWordFrame(section, "Euro-centric");
  const playground = useWordFrame(section, "playground");
  const mogTalk = useSpeaking(section, "mog");
  const lay = photoLayout("card-right");
  const p = lay.photos[0];
  const t = lay.text!;

  const year = Math.round(interpolate(frame, [rewind, rewind + 70], [2025, 2010], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) }));
  const tickerIn = ramp(frame, rewind - 8, 14);
  const tickerOut = 1 - ramp(frame, club.start - 14, 12);
  const cardAt = club.start - 8;

  return (
    <AbsoluteFill>
      <Ground color={OLD.ground} />

      {/* rewind: the year runs back to 2010 */}
      <div style={{ position: "absolute", left: 140, top: 150, opacity: tickerIn * tickerOut }}>
        <div style={{ fontFamily: toon.font.display, fontWeight: 800, fontSize: 300, lineHeight: 1, color: OLD.cream, fontVariantNumeric: "tabular-nums" }}>{year}</div>
        <div style={{ fontFamily: toon.font.display, fontWeight: 800, fontSize: 46, color: OLD.red, marginTop: 6 }}>Rewind 15 years</div>
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: tickerIn * tickerOut }}>
        <g fill={OLD.amber} opacity={0.9}>
          <polygon points="1380,300 1380,560 1160,430" />
          <polygon points="1660,300 1660,560 1440,430" />
        </g>
      </svg>

      {/* framed sepia paddock card */}
      <Sepia>
        <Photo src="assets/archival/f1_paddock_2010.jpg" x={p.x} y={p.y} w={p.w} h={p.h} fit="contain" at={cardAt} enter="rise" enterFrames={18} />
      </Sepia>
      <div style={{ position: "absolute", left: t.x, top: t.y - 20, width: t.w, opacity: ramp(frame, cardAt + 8, 16), color: OLD.cream }}>
        <div style={{ fontFamily: toon.font.body, fontWeight: 800, fontSize: 26, letterSpacing: "0.14em", textTransform: "uppercase", color: OLD.red }}>Formula 1, 2010</div>
        <div style={{ fontFamily: toon.font.display, fontWeight: 800, fontSize: 84, lineHeight: 1.04, marginTop: 12 }}>Old boys' club</div>
        <div style={{ width: 72, height: 6, borderRadius: 3, background: OLD.red, margin: "18px 0" }} />
      </div>
      <Chip text="Exclusive" x={t.x} y={t.y + 215} at={exclusive} fontSize={36} bg={OLD.tan} color={OLD.cream} border={OLD.groundDeep} />
      <Chip text="Euro-centric" x={t.x + 250} y={t.y + 215} at={euro} fontSize={36} bg={OLD.tan} color={OLD.cream} border={OLD.groundDeep} />
      <Chip text="Billionaire's playground" x={t.x} y={t.y + 305} at={playground} fontSize={36} bg={OLD.tan} color={OLD.cream} border={OLD.groundDeep} />

      <Mascot character="mog" x={330} y={830} scale={0.85} at={0} enter="none" facing="right" look={[[0, "viewer"], [club.start, "right"]]}
        talking={mogTalk}
        gesture={[[0, "idle"], [club.start + 20, { gesture: "point", dir: "up-right" }], [club.start + 80, "idle"]]} expression="neutral" />
      <Mascot character="bog" x={640} y={830} scale={0.8} at={0} enter="none" facing="left" look="left"
        gesture="listen" expression={[[0, "neutral"], [club.start, "confused"]]} talking={false} />
      <Grain opacity={0.1} sepia={false} seed={3} />
      <Sfx name="swoosh-soft" at={cardAt} />
      <Sfx name="shutter" at={cardAt + 12} volume={0.2} />
      <Sfx name="tick" at={rewind} volume={0.2} />
    </AbsoluteFill>
  );
};
