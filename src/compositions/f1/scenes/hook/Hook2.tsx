import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { editorial, toon } from "../../../../theme";
import { useLine, useSpeaking, useWordFrame } from "../../components/hooks";
import { Mascot } from "../../components/mascot";
import { Logo } from "../../components/photo";
import { Sfx } from "../../components/Sfx";
import { ramp } from "../../components/toon/anim";
import { SceneProps } from "../../manifest";
import { Ground } from "./bits";

const Card: React.FC<{ x: number; y: number; w: number; h: number; at: number; title: string; children: React.ReactNode }> = ({ x, y, w, h, at, title, children }) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, at, 16);
  if (frame < at) return null;
  return (
    <div
      style={{
        position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 18, background: editorial.white,
        border: `2px solid ${editorial.rule}`, opacity: p, transform: `translateY(${(1 - p) * 24}px)`,
        padding: "16px 24px", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 24,
        boxShadow: "0 6px 18px rgba(0,0,0,0.10)",
      }}
    >
      {children}
      <div style={{ fontFamily: toon.font.display, fontWeight: 800, fontSize: 44, color: editorial.ink }}>{title}</div>
    </div>
  );
};

const avatars = ["#4DA3E8", "#F4A93B", "#F08BB4", "#4FC3A1"];

export const Hook2: React.FC<SceneProps> = ({ section }) => {
  const frame = useCurrentFrame();
  const bogLine = useLine(section, 1);
  const universe = useWordFrame(section, "universe");
  const everywhere = useWordFrame(section, "everywhere");
  const friends = useWordFrame(section, "friends");
  const feeds = useWordFrame(section, "feeds");
  const icons = useWordFrame(section, "icons");
  const mogTalk = useSpeaking(section, "mog");
  const bogTalk = useSpeaking(section, "bog");

  const logoOut = 1 - ramp(frame, friends - 14, 12);
  const cardsOut = 1 - ramp(frame, bogLine.start - 20, 14);

  return (
    <AbsoluteFill>
      <Ground color={editorial.bg} />

      {/* "center of the universe": the F1 logo with calm rings */}
      <div style={{ position: "absolute", inset: 0, opacity: logoOut }}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {[1, 2, 3].map((i) => {
            const p = ramp(frame, universe + i * 8, 30);
            return <circle key={i} cx={1130} cy={440} r={120 + i * 90 * p} fill="none" stroke={editorial.rule} strokeWidth={3} opacity={p} />;
          })}
        </svg>
        <Logo src="assets/logos/formula1.png" width={380} x={1130} y={440} at={universe} />
      </div>

      <div style={{ position: "absolute", inset: 0, opacity: cardsOut }}>
        <Card x={700} y={140} w={860} h={150} at={friends} title="Your friends watch it">
          <div style={{ display: "flex" }}>
            {avatars.map((c, i) => (
              <div key={i} style={{ width: 62, height: 62, borderRadius: 31, background: c, border: `4px solid ${editorial.white}`, marginLeft: i ? -16 : 0 }} />
            ))}
          </div>
        </Card>
        <Card x={700} y={320} w={860} h={150} at={feeds} title="It floods your feed">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[110, 80, 95].map((w, i) => (
              <div key={i} style={{ width: w, height: 14, borderRadius: 7, background: editorial.panel }} />
            ))}
          </div>
        </Card>
        <Card x={700} y={500} w={860} h={240} at={icons} title="Drivers are icons">
          <Img src={staticFile("assets/people/lewis_hamilton_2021.jpg")} style={{ width: 200, height: 200, objectFit: "cover", objectPosition: "50% 25%", borderRadius: 12 }} />
          <Img src={staticFile("assets/people/max_verstappen_2021.jpg")} style={{ width: 200, height: 200, objectFit: "cover", objectPosition: "50% 25%", borderRadius: 12 }} />
        </Card>
      </div>

      <Mascot
        character="mog" x={330} y={830} scale={1.2} at={0} enter="none"
        facing="right" look="right" talking={mogTalk}
        gesture={[[0, "idle"], [universe - 4, { gesture: "point", dir: "up-right" }], [everywhere + 20, "idle"], [icons - 6, { gesture: "point", dir: "right" }], [icons + 50, "idle"], [bogLine.start - 30, "listen"]]}
        expression={[[0, "neutral"], [bogLine.start, "smug"]]}
      />
      <Mascot
        character="bog" x={1680} y={830} scale={0.9} at={0} enter="none"
        facing="left" look="left"
        gesture={[[0, "listen"], [bogLine.start - 6, "shrug"], [bogLine.end, "idle"]]}
        expression={[[0, "confused"], [bogLine.start - 6, "smug"]]}
        talking={bogTalk}
      />
      <Sfx name="pop" at={universe} />
      <Sfx name="pop" at={friends} volume={0.18} />
      <Sfx name="pop" at={feeds} volume={0.18} />
    </AbsoluteFill>
  );
};
