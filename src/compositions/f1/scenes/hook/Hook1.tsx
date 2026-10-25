import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { editorial } from "../../../../theme";
import { useLine, useSpeaking, useWordFrame } from "../../components/hooks";
import { Mascot, Tickets } from "../../components/mascot";
import { Sfx } from "../../components/Sfx";
import { clamp } from "../../components/toon/anim";
import { SceneProps } from "../../manifest";
import { FeedCard, Ground } from "./bits";

const CARDS = [
  { src: "assets/racing/f1_podium.jpg", x: 70, y: 110, rot: -4, avatar: "#4DA3E8" },
  { src: "assets/people/lewis_hamilton_2021.jpg", x: 380, y: 130, rot: 3, avatar: "#F4A93B" },
  { src: "assets/racing/sf21_2021.jpg", x: 690, y: 105, rot: -2, avatar: "#4FC3A1" },
  { src: "assets/people/max_verstappen_2021.jpg", x: 1000, y: 135, rot: 4, avatar: "#F08BB4" },
  { src: "assets/racing/hamilton_verstappen_2021.jpg", x: 1310, y: 110, rot: -3, avatar: "#8E7BE0" },
  { src: "assets/people/driver_parade_2021.jpg", x: 1590, y: 140, rot: 3, avatar: "#E5483F" },
  { src: "assets/racing/usgp_start_2021.jpg", x: 200, y: 400, rot: 3, avatar: "#F4A93B" },
  { src: "assets/racing/garage_2021.jpg", x: 560, y: 430, rot: -3, avatar: "#4DA3E8" },
  { src: "assets/racing/usgp_podium_2021.jpg", x: 1180, y: 420, rot: 2, avatar: "#4FC3A1" },
  { src: "assets/racing/garage_2021_b.jpg", x: 1480, y: 400, rot: -4, avatar: "#F08BB4" },
];

export const Hook1: React.FC<SceneProps> = ({ section }) => {
  const frame = useCurrentFrame();
  const a = useLine(section, 1);
  const tickets = useWordFrame(section, "tickets");
  const bogTalk = useSpeaking(section, "bog");
  const wecTalk = useSpeaking(section, "wec");
  const arrive = a.start - 36;

  // the feed bursts in, then settles into the background as BOG speaks
  const dim = interpolate(frame, [38, 110], [1, 0.22], clamp);
  const bigTickets = interpolate(frame, [tickets, tickets + 14, tickets + 80, tickets + 96], [0, 1, 1, 0], clamp);

  return (
    <AbsoluteFill>
      <Ground color={editorial.ink}>
        {CARDS.map((c, i) => (
          <FeedCard key={c.src} {...c} at={i * 4} opacity={dim} />
        ))}
      </Ground>

      <Mascot
        character="bog"
        x={640}
        y={830}
        scale={1.3}
        at={8}
        enter="walk-left"
        facing={[[0, "front"], [arrive, "right"]]}
        look={[[0, "viewer"], [arrive + 10, "right"]]}
        gesture={[[0, "idle"], [arrive + 24, "startle"], [arrive + 60, "idle"]]}
        expression={[[0, "confused"], [arrive + 24, "surprised"], [a.start + 70, "neutral"]]}
        talking={bogTalk}
      />
      <Mascot
        character="wec"
        x={1330}
        y={830}
        scale={1.2}
        at={arrive}
        enter="walk-right"
        enterFrames={30}
        facing="left"
        look="left"
        gesture="wave"
        prop="tickets"
        expression="happy"
        talking={wecTalk}
      />
      {/* the prop the outro revisits: two race tickets, shown big for a moment */}
      <div style={{ opacity: bigTickets, transform: `translateY(${(1 - bigTickets) * 20}px)` }}>
        <Tickets x={1330} y={400} scale={2.6} count={2} angle={-8} />
      </div>
      <Sfx name="whoosh" at={arrive} />
      <Sfx name="pop" at={tickets} />
    </AbsoluteFill>
  );
};
