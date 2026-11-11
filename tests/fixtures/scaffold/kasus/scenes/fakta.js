// Fakta (casefile look): three sourced evidence tiles, each entering on the word that introduces it.
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const tile = (word, y, num, icon, big, small) => K.tile(f, { at: w(word), x: 72, y, w: 888, h: 250, num, icon, big, small, bigSize: 60 });
  const art = F1.join(
    K.kicker(f, { text: "BUKTI RESMI" }),
    tile("pertama", 310, "01", "dokumen", "GANTI: FAKTA PERTAMA", "MEDIA A · TANGGAL"),
    tile("kedua", 590, "02", "palu", "GANTI: FAKTA KEDUA", "MEDIA B · TANGGAL"),
    tile("ketiga", 870, "03", "gedung", "GANTI: FAKTA KETIGA", "MEDIA C · TANGGAL"),
    K.src(f, { y: 1170, text: "Media A · Media B · Media C" }),
  );
  return F1.join(K.page(f, D, art), K.head(f, D, { step: 2, label: "FAKTA" }), K.cast(S, f, [{ src: K.CAST.nisa, x: 200, y: 1200, w: 320 }]));
});
