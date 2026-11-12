// Hook (casefile look). Frame 0 shows the claim: chip, headline "300 saham tak dihitung di IHSG", and a board of 300 dots
// (one per stock). On "dihitung" the dots go hollow in a diagonal sweep; on "delisting" the DELISTING chip is struck and
// the "BUKAN DELISTING · KATA BEI" stamp lands.
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const t0 = w("dihitung");
  const COLS = 25, ROWS = 12, GAP = 32;
  let dots = "";
  for (let i = 0; i < COLS * ROWS; i++) {
    const c = i % COLS, r = Math.floor(i / COLS);
    const k = F1.ramp(f, t0 + (c + r) * 0.9, 6, F1.easeOut);
    const off = k > 0.5;
    dots += `<div style="position:absolute;left:${c * GAP}px;top:${r * GAP}px;width:22px;height:22px;border-radius:11px;box-sizing:border-box;border:3px solid ${off ? T.ink2 : T.ink};background:${off ? "transparent" : T.teal};opacity:${F1.n(1 - 0.45 * k, 3)}"></div>`;
  }
  const board = K.card(f, {
    at: -20, x: 72, y: 700, w: 888, h: 500, pad: "26px 40px",
    html: `<div style="display:flex;justify-content:space-between;font:700 22px ${mono};letter-spacing:2px;color:${T.ink2}"><span>1 TITIK = 1 SAHAM</span><span style="color:${T.teal}">300 SAHAM</span></div><div style="position:relative;margin-top:24px;height:${ROWS * GAP}px">${dots}</div>`,
  });
  const art = F1.join(
    K.chip(f, { at: -20, x: 72, y: 250, text: "BEI · MULAI JUMAT 13 NOV 2026", teal: true }),
    K.title(f, { at: -20, y: 336, size: 104, lh: 0.98, html: `300 saham<br>tak dihitung<br>di <span style="color:${T.teal}">IHSG</span>` }),
    board,
    K.chip(f, { at: w("Kata"), x: 560, y: 1236, text: "DELISTING" }),
    K.strike(f, { at: w("delisting"), x: 552, y: 1264, w: 200 }),
    K.stamp(f, { at: w("delisting") + 6, x: 520, y: 1320, rot: -7, text: "BUKAN DELISTING", sub: "KATA BEI", size: 46 }),
  );
  return F1.join(K.page(f, D, art, { slide: false }), K.head(f, D, { step: 1, label: "LAPORAN MASUK" }), K.cast(S, f, [{ src: K.CAST.nisa, x: 200, y: 1200, w: 320, at: -20 }]));
});
