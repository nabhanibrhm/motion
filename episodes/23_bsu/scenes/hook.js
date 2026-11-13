// Hook (casefile look). Frame 0 is fully drawn: tag chip, headline and the big transfer slip "BSU · Rp900.000".
// Cash chip on "sembilan", status line on "sekarang", the BELUM CAIR stamp slams across the slip on "cair".
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const slip = K.card(f, {
    at: -20, x: 72, y: 580, w: 888, h: 390, rot: -2, pad: "28px 40px",
    html: `<div style="display:flex;justify-content:space-between;font:700 24px ${mono};letter-spacing:2px;color:${T.ink2}"><span>BUKTI TRANSFER</span><span style="color:${T.teal}">BSU 2026</span></div><div style="font:700 26px ${mono};letter-spacing:2px;margin-top:14px">BANTUAN SUBSIDI UPAH</div><div style="font:700 150px/1 Oswald;color:${T.ink};margin-top:6px;white-space:nowrap">Rp900.000</div><div style="height:6px;background:${T.teal};margin-top:8px"></div><div style="font:600 22px ${mono};color:${T.ink2};margin-top:14px">PENERIMA: PEKERJA YANG MEMENUHI SYARAT</div>`,
  });
  const art = F1.join(
    K.chip(f, { at: -20, x: 72, y: 250, text: "PERMENAKER 16/2026 · BERLAKU 28 OKT 2026", teal: true, size: 26 }),
    K.title(f, { at: -20, y: 330, size: 98, lh: 0.98, html: `BSU Rp900 ribu:<br><span style="color:${T.teal}">kamu dapat?</span>` }),
    slip,
    K.chip(f, { at: w("sembilan"), x: 72, y: 1004, text: "Rp300.000 × 3 BULAN (OKT-DES) · SEKALIGUS", size: 24 }),
    K.chip(f, { at: w("sekarang"), x: 72, y: 1076, text: "STATUS 13 NOV: BELUM ADA TANGGAL CAIR", size: 24, red: true }),
    K.stamp(f, { at: w("cair"), x: 380, y: 850, rot: -8, text: "BELUM CAIR", size: 84 }),
    K.src(f, { y: 1166, at: w("sekarang"), text: "Permenaker 16/2026 Pasal 6 · Kemnaker 9 Nov" }),
  );
  return F1.join(K.page(f, D, art, { slide: false }), K.head(f, D, { step: 1, label: "LAPORAN MASUK" }), K.cast(S, f, [{ src: K.CAST.nisa, x: 200, y: 1200, w: 320, at: -20 }]));
});
