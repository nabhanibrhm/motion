// PTKP (BUKTI 4). PTKP Rp54 jt card, highlighter on "batas"; on "Januari" the JANUARI 2027 calendar + "NAIK?" struck;
// on "selesai" they leave and the Menko quote lands.
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const sans = "'Nunito Sans',sans-serif";
  const q = w("selesai") - 4;
  const art = F1.join(
    K.kicker(f, { at: -10, text: "PTKP · BATAS BEBAS PAJAK" }),
    K.card(f, { at: -10, x: 72, y: 300, w: 888, pad: "24px 34px", html: `<div style="font:700 24px ${mono};color:${T.teal};letter-spacing:2px">PTKP SEKARANG</div><div style="font:700 112px/1.05 Oswald;margin-top:6px;white-space:nowrap"><span style="${K.hl(f, w("batas"))}">Rp54 JUTA/TAHUN</span></div><div style="font:600 24px ${mono};color:${T.ink2};margin-top:10px">Lajang tanpa tanggungan · ±Rp4,5 jt/bulan</div>` }),
    K.box(f, { at: w("Januari") - 8, out: q, x: 0, y: 0, html: K.calendar(f, { x: 72, y: 700, w: 440, month: "JANUARI 2027", first: 1, last: 31 }) }),
    K.box(f, { at: w("Januari") + 2, out: q, x: 560, y: 780, html: `<div style="font:700 130px/1 Oswald;color:${T.ink}">NAIK?</div>` }),
    f < q ? K.strike(f, { at: w("Januari") + 10, x: 556, y: 850, w: 330 }) : "",
    K.card(f, { at: w("selesai"), x: 72, y: 700, w: 888, pad: "26px 34px", html: `<div style="font:700 24px ${mono};color:${T.teal};letter-spacing:2px">MENKO PEREKONOMIAN · 5 NOV 2026</div><div style="font:700 46px/1.2 ${sans};margin-top:10px">“Jadi pembahasannya ini belum selesai, dan ini tidak akan diberlakukan di Januari.”</div>` }),
    K.chip(f, { at: w("selesai") + 8, x: 72, y: 1020, text: "BESARAN BARU: BELUM DITETAPKAN", red: true, size: 28 }),
    K.src(f, { at: -10, y: 1166, text: "Fortune IDN 5 Nov · IKPI 5 Nov · PMK 105/2025 Lampiran B" }),
  );
  return F1.join(K.page(f, D, art), K.head(f, D, { step: 5, label: "BUKTI 4 · PTKP" }), K.cast(S, f, [{ src: K.CAST.muklis, x: 200, y: 1200, w: 320 }]));
});
