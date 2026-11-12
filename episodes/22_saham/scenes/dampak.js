// Dampak (BUKTI 3). 100-square grid with 6 squares teal (bobot ~6%); divisor chip; two opposing analyst cards; then the
// comment question card on "Menurutmu".
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  let sq = "";
  for (let i = 0; i < 100; i++) {
    const c = i % 20, r = Math.floor(i / 20);
    const hot = i >= 94;
    const p = hot ? F1.ramp(f, w("Bobotnya") + (i - 94) * 2, 8, F1.expoOut) : 0;
    const on = hot && p > 0.5;
    sq += `<div style="position:absolute;left:${c * 44}px;top:${r * 44}px;width:36px;height:36px;border-radius:6px;box-sizing:border-box;border:3px solid ${on ? T.ink : T.rule};background:${on ? T.teal : "transparent"}"></div>`;
  }
  const tQ = w("Menurutmu");
  const view = (at, x, big, sub) =>
    K.card(f, { at, out: tQ, x, y: 800, w: 432, h: 240, pad: "22px 26px", html: `<div style="font:700 22px ${mono};color:${T.teal};letter-spacing:1px">PENDAPAT</div><div style="font:700 46px/1.05 Oswald;margin-top:10px">${big}</div><div style="font:600 20px/1.35 ${mono};color:${T.ink2};margin-top:10px">${sub}</div>` });
  const art = F1.join(
    K.kicker(f, { at: -10, text: "SEBERAPA BESAR?" }),
    K.box(f, { at: -10, x: 72, y: 310, w: 888, html: `<div style="position:relative;height:216px">${sq}</div><div style="display:flex;justify-content:space-between;margin-top:14px;font:700 24px ${mono};color:${T.ink2}"><span>NILAI PASAR IHSG = 100 KOTAK</span><span style="color:${T.teal}">± 6%</span></div>` }),
    K.chip(f, { at: w("pembagi"), x: 72, y: 610, text: "BEI SESUAIKAN PEMBAGI INDEKS", teal: true }),
    K.box(f, { at: w("pembagi") + 4, x: 72, y: 690, w: 888, html: `<div style="font:600 24px/1.35 ${mono};color:${T.ink2}">SUPAYA LEVEL IHSG TIDAK LONCAT SAAT SAHAM DIKELUARKAN</div>` }),
    view(w("Analis"), 72, "HARGA TIDAK OTOMATIS TURUN", "KATA EKONOM · CNN INDONESIA 12 NOV"),
    view(w("berbeda"), 528, "BISA ADA AKSI JUAL", "EKONOM LAIN · CNN INDONESIA 12 NOV"),
    K.card(f, { at: tQ, x: 72, y: 800, w: 888, bg: T.ink, pad: "26px 34px", html: `<div style="font:700 24px ${mono};color:${T.paper};opacity:${F1.n(F1.ramp(f, w("komentar"), 8), 3)}">● TULIS DI KOMENTAR</div><div style="font:700 64px/1.08 Oswald;color:${T.paper};margin-top:8px">ATURAN INI <span style="color:${T.onInkB}">PERLU NGGAK?</span></div>` }),
    K.src(f, { y: 1166, text: "BEI via investor.id 12 Nov (bobot 6,16%) · CNN Indonesia 12 Nov · Bukan saran investasi" }),
  );
  const at = { x: 200, y: 1200, w: 320 };
  return F1.join(K.page(f, D, art), K.head(f, D, { step: 5, label: "BUKTI 3 · DAMPAK" }), K.cast(S, f, [{ src: K.CAST.muklis, ...at }, { src: K.CAST.nisa, ...at }]));
});
