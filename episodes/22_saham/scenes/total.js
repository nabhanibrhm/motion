// Total (BUKTI 1). Stacked bar 83 (since 2 NOV) + 300 (from 13 NOV) = 383 HSC stocks outside the IHSG calculation.
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const a = F1.ramp(f, w("delapan"), 14, F1.expoOut);
  const b = F1.ramp(f, w("tambahan"), 16, F1.expoOut);
  const W1 = Math.round((888 * 83) / 383), W2 = 888 - W1;
  const bar = K.box(f, {
    at: -10, x: 72, y: 560, w: 888,
    html: `<div style="position:relative;height:120px;border:5px solid ${T.ink};border-radius:12px;box-sizing:border-box;background:${T.card};overflow:hidden"><div style="position:absolute;left:0;top:0;bottom:0;width:${F1.n(W1 * a)}px;background:${T.ink}"></div><div style="position:absolute;left:${W1}px;top:0;bottom:0;width:${F1.n(W2 * b)}px;background:${T.teal}"></div></div>`,
  });
  const num = (at, x, wd, big, sub, color) =>
    K.box(f, { at, x, y: 730, w: wd, html: `<div style="font:700 96px/1 Oswald;color:${color}">${big}</div><div style="font:700 24px ${mono};color:${T.ink2};margin-top:8px;letter-spacing:1px">${sub}</div>` });
  const art = F1.join(
    K.kicker(f, { at: -10, text: "DAFTAR SAHAM HSC · BEI-KSEI" }),
    K.title(f, { at: -10, y: 300, size: 84, lh: 1, html: `Di luar hitungan<br>indeks` }),
    bar,
    num(w("delapan"), 72, 250, "83", "SEJAK 2 NOV", T.ink),
    num(w("tambahan"), 350, 290, "+300", "MULAI 13 NOV", T.teal),
    num(w("totalnya"), 680, 280, "=383", "TOTAL SAHAM", T.ink),
    K.pen(f, { at: w("totalnya") + 4, x: 650, y: 712, w: 290, h: 150 }),
    K.chip(f, { at: w("indeks"), x: 72, y: 950, text: "SAHAMNYA TETAP TERCATAT DI BURSA", teal: true }),
    K.src(f, { y: 1166, text: "Pengumuman BEI-KSEI 11 Nov 2026 (via Kompas, kumparan, CNBC Indonesia)" }),
  );
  return F1.join(K.page(f, D, art), K.head(f, D, { step: 2, label: "BUKTI 1 · TOTAL" }), K.cast(S, f, [{ src: K.CAST.muklis, x: 200, y: 1200, w: 320 }]));
});
