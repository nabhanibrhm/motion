// Boleh (BUKTI 4): Nisa asks whether a contract ending needs talks; Muklis: TIDAK. Four tiles (Pasal 229).
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const art = F1.join(
    K.card(f, { at: -10, x: 72, y: 260, w: 888, pad: "26px 34px", html: `<div style="font:700 24px ${mono};color:${T.teal};letter-spacing:2px">PERTANYAAN</div><div style="font:700 70px/1.05 Oswald;margin-top:8px">KONTRAK HABIS<br>HARUS BERUNDING?</div>` }),
    K.stamp(f, { at: w("Tidak"), x: 640, y: 470, rot: -8, text: "TIDAK", size: 72 }),
    K.kicker(f, { at: w("Tidak") + 4, y: 575, text: "BERAKHIR TANPA PERUNDINGAN" }),
    K.tile(f, { at: w("Mengundurkan"), x: 72, y: 620, w: 430, h: 200, num: "01", icon: "dokumen", big: "RESIGN", bigSize: 52 }),
    K.tile(f, { at: w("kontrak"), x: 530, y: 620, w: 430, h: 200, num: "02", icon: "kalender", big: "KONTRAK HABIS", bigSize: 46 }),
    K.tile(f, { at: w("pensiun"), x: 72, y: 850, w: 430, h: 200, num: "03", icon: "kantor", big: "PENSIUN", bigSize: 52 }),
    K.tile(f, { at: w("meninggal"), x: 530, y: 850, w: 430, h: 200, num: "04", icon: "perisai", big: "MENINGGAL", bigSize: 52 }),
    K.src(f, { at: -10, y: 1120, text: "UU 27/2026 Pasal 229" }),
  );
  const at = { x: 200, y: 1200, w: 320 };
  return F1.join(K.page(f, D, art), K.head(f, D, { step: 5, label: "BUKTI 4 · PENGECUALIAN" }), K.cast(S, f, [{ src: K.CAST.nisa, ...at }, { src: K.CAST.muklis, ...at }]));
});
