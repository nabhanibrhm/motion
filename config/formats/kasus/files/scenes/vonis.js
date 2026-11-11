// Vonis (casefile look): the case folder, the KASUS DITUTUP stamp on "ditutup", the comment question on "Tulis",
// then the title cover card for the last ~1 s (the user picks it as the TikTok cover).
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const folder = K.folder(f, {
    at: -12,
    y: 270,
    h: 640,
    html: `<div style="font:700 26px 'JetBrains Mono',monospace;color:${T.ink2}">BERKAS · ${F1.esc(F1.CONFIG.case.id)}</div><div style="font:700 72px/1 Oswald;text-transform:uppercase;margin-top:12px">GANTI<br>KESIMPULAN</div><div style="font:700 32px/1.5 'Nunito Sans',sans-serif;margin-top:22px;color:${T.ink}"><span style="color:${T.teal}">✓</span> Yang sudah pasti</div><div style="font:700 32px/1.5 'Nunito Sans',sans-serif;color:${T.ink2}">… Yang masih ditunggu</div>`,
  });
  const art = F1.join(
    folder,
    K.stamp(f, { at: w("ditutup"), x: 360, y: 830, rot: -7, text: "KASUS DITUTUP", size: 76 }),
    K.card(f, { at: w("Tulis"), x: 72, y: 1010, w: 888, bg: T.ink, pad: "22px 32px", html: `<div style="font:700 24px 'JetBrains Mono',monospace;color:${T.paper}">● TULIS DI KOMENTAR</div><div style="font:700 50px/1.1 Oswald;color:${T.paper};margin-top:6px">GANTI: PERTANYAAN <span style="color:${T.onInkA}">PENUTUP</span>?</div>` }),
  );
  return F1.join(
    K.page(f, D, art),
    K.head(f, D, { step: 4, label: "VONIS" }),
    K.cast(S, f, [{ src: K.CAST.nisa, x: 200, y: 1200, w: 320 }]),
    K.cover(f, S, { lines: [{ t: "GANTI" }, { t: "JUDUL", accent: true }, { t: "COVER" }], tag: "GANTI: TAG", icon: "dokumen" }),
  );
});
