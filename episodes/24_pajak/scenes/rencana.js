// Rencana (BUKTI 3). Menko quote card on "Airlangga", SEMUA SEKTOR chip on "semua", Dirjen Pajak quote on "Ditjen",
// BELUM DIPUTUSKAN stamp on "diputuskan".
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const sans = "'Nunito Sans',sans-serif";
  const quote = (who, text, size) => `<div style="font:700 24px ${mono};color:${T.teal};letter-spacing:2px">${who}</div><div style="font:700 ${size}px/1.2 ${sans};margin-top:10px">“${text}”</div>`;
  const art = F1.join(
    K.kicker(f, { at: -10, text: "RENCANA 2027" }),
    K.card(f, { at: w("Airlangga"), x: 72, y: 300, w: 888, pad: "22px 32px", html: quote("MENKO PEREKONOMIAN · 9 NOV 2026", "PPh ditanggung pemerintah untuk [pekerja] dengan gaji sampai Rp10 juta", 42) }),
    K.chip(f, { at: w("semua"), x: 72, y: 585, text: "2027: SEMUA SEKTOR · RENCANA", teal: true, size: 30 }),
    K.card(f, { at: w("Ditjen"), x: 72, y: 670, w: 888, pad: "22px 32px", html: quote("DIRJEN PAJAK · OKT 2026", "Untuk bentuknya, apakah berupa PPh 21 DTP ataukah insentif, potongan lain nanti akan kami sampaikan", 38) }),
    K.stamp(f, { at: w("diputuskan"), x: 190, y: 950, rot: -6, text: "BELUM DIPUTUSKAN", size: 64 }),
    K.chip(f, { at: w("diputuskan") + 6, x: 72, y: 1085, text: "PMK 2027: BELUM ADA (CEK 13 NOV)", size: 24 }),
    K.src(f, { at: w("Ditjen"), y: 1166, text: "DDTCNews 9 Nov, 4 Okt · IKPI 9 Nov · Katadata 9 Nov" }),
  );
  return F1.join(K.page(f, D, art), K.head(f, D, { step: 4, label: "BUKTI 3 · RENCANA 2027" }), K.cast(S, f, [{ src: K.CAST.nisa, x: 200, y: 1200, w: 320 }]));
});
