// Resmi: ICW's 8 packages as our own table (data LKPP via ICW; values per Warta Ekonomi and Suara, 9-10 Nov).
// Kemendikbudristek rows reveal on line 1, KKP rows on line 2, total after the KKP rows.
const RED = "#ff2d3d", YEL = "#ffd23f", ORG = "#ff7a1a", INK = "#0d0f16", GREY = "#9aa3b8";
const osw = "Oswald, sans-serif", mono = "'JetBrains Mono', monospace";
const X0 = 72, W0 = 888;
const GROUPS = [
  {
    name: "KEMENDIKBUDRISTEK · 2024",
    sub: "5 paket · ±Rp3,9 M",
    line: "line:1",
    rows: [
      ["YouTube RANS Entertainment", "Rp452,69 jt"],
      ["IG Reels @raffinagita1717", "Rp205,89 jt"],
      ["IG Story @raffinagita1717", "Rp575,65 jt", true],
      ["Kehadiran di acara", "Rp2,52 M", true],
      ["TikTok @raffinagita1717", "Rp144,42 jt"],
    ],
  },
  {
    name: "KKP · 2025–2026",
    sub: "3 paket · ±Rp10,8 M",
    line: "line:2",
    rows: [
      ["2025 · Influencer engagement", "Rp3,59 M"],
      ["2025 · Promosi pembangunan BINS", "Rp3,6 M"],
      ["2026 · Kampung Nelayan, Natuna", "Rp3,6 M"],
    ],
  },
];

scene((f, { S, D, n, C, W }) => {
  const show = (p, dy = 24) => `opacity:${n(Math.min(1, p), 3)};transform:translateY(${n((1 - Math.min(1, p)) * dy)}px)`;
  const bg =
    `<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 40% 40%,#1b2133 0%,${INK} 70%)"></div>` +
    `<div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,0.025) 0 2px,transparent 2px 6px)"></div>` +
    `<svg width="1080" height="1920" viewBox="0 0 1080 1920" style="position:absolute;inset:0">${W.drift(f, { seed: 197, count: 7, y0: 420, y1: 1420, color: ORG, a: 0.18 })}${W.sweep(f, { color: RED, a: 0.14, y0: 280, y1: 1420 })}</svg>`;

  const head = F1.ramp(f, 2, 14, F1.expoOut);
  let y = 430;
  const RH = 72, GH = 74;
  let html = "";
  let lastAt = 0;
  GROUPS.forEach((g, gi) => {
    const at = F1.at(S, g.line);
    const gp = F1.ramp(f, at, 12, F1.expoOut);
    const gOp = Math.min(1, head) * (0.35 + 0.65 * gp);
    html += `<div style="position:absolute;left:${X0}px;top:${y}px;width:${W0}px;height:${GH - 10}px;border-radius:12px;background:${gi ? "#ffffff" : YEL};display:flex;align-items:center;justify-content:space-between;padding:0 24px;box-sizing:border-box;opacity:${n(gOp, 3)};transform:scale(${n(0.97 + 0.03 * gp, 3)})">
<span style="font-family:${osw};font-weight:700;font-size:40px;letter-spacing:2px;color:${INK};white-space:nowrap">${g.name}</span>
<span style="font-family:${mono};font-weight:700;font-size:24px;color:${INK};white-space:nowrap">${g.sub}</span></div>`;
    y += GH;
    g.rows.forEach(([label, val, hot], i) => {
      const ra = at + 12 + i * 9;
      lastAt = Math.max(lastAt, ra);
      const rp = F1.ramp(f, ra, 12, F1.expoOut);
      const pulse = hot ? F1.ramp(f, ra + 6, 10) : 0;
      if (rp < 1) html += `<div style="position:absolute;left:${X0}px;top:${y}px;width:${W0}px;height:${RH - 8}px;border-radius:10px;border:3px dashed rgba(255,255,255,0.16);box-sizing:border-box;opacity:${n(Math.min(1, head) * (1 - rp), 3)}"></div>`;
      html += `<div style="position:absolute;left:${X0}px;top:${y}px;width:${W0}px;height:${RH - 8}px;border-radius:10px;background:rgba(27,33,50,0.94);border-left:10px solid ${hot ? YEL : "rgba(255,255,255,0.35)"};display:flex;align-items:center;justify-content:space-between;padding:0 24px 0 22px;box-sizing:border-box;box-shadow:0 0 ${n(22 * pulse)}px rgba(255,210,63,0.3);${show(rp, 18)}">
<span style="font-family:${osw};font-weight:500;font-size:36px;color:#fff;white-space:nowrap">${label}</span>
<span style="font-family:${osw};font-weight:700;font-size:40px;color:${hot ? YEL : "#fff"};white-space:nowrap">${val}</span></div>`;
      y += RH;
    });
    y += 14;
  });
  const tp = F1.ramp(f, lastAt + 18, 14, F1.backOut);
  if (tp < 1) html += `<div style="position:absolute;left:${X0}px;top:${y}px;width:${W0}px;height:84px;border-radius:12px;border:3px dashed rgba(255,45,61,0.35);box-sizing:border-box;opacity:${n(Math.min(1, head) * (1 - Math.max(0, tp)), 3)}"></div>`;
  html += `<div style="position:absolute;left:${X0}px;top:${y}px;width:${W0}px;height:84px;border-radius:12px;background:${RED};display:flex;align-items:center;justify-content:space-between;padding:0 24px;box-sizing:border-box;${show(tp, 20)}">
<span style="font-family:${osw};font-weight:700;font-size:44px;letter-spacing:3px;color:#fff">TOTAL 8 PAKET</span>
<span style="font-family:${osw};font-weight:700;font-size:48px;color:#fff;white-space:nowrap">Rp14.696.955.002</span></div>
<div style="position:absolute;left:${X0}px;top:${y + 96}px;width:${W0}px;font-family:${mono};font-weight:500;font-size:20px;line-height:1.3;color:${GREY};${show(tp, 8)}">Sumber: data LKPP via ICW · Warta Ekonomi, Suara (9–10 Nov)</div>`;

  const body =
    `<div style="position:absolute;left:${X0}px;top:258px;width:${W0}px;${show(head, 16)}">
<div style="font-family:${mono};font-weight:700;font-size:26px;letter-spacing:3px;color:${RED};white-space:nowrap">● DATA LKPP VIA ICW</div>
<div style="font-family:${osw};font-weight:700;font-size:96px;line-height:1.05;letter-spacing:3px;color:#fff;white-space:nowrap">8 PAKET <span style="color:${YEL}">INFLUENCER</span></div></div>` + html;

  return F1.join(
    C.stage(f, D, bg + body, { whip: true, zoom: 0.025, ox: 50, oy: 48 }),
    C.vignette(0.35, "50% 50%", 50),
    C.progress(f, { step: 2, label: "DATA PENGADAAN" }),
  );
});
