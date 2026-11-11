// Ijazah (BUKTI 1). Muklis: Pasal 78 ayat (1) quote with highlighter, then the one exception (tick on "tertulis").
// Beni asks: question cards. Nisa: the three sanctions on peringatan / denda / pembatasan, then the "wajib dikembalikan" stamp.
// No "pidana" anywhere: the ijazah sanction is administrative only.
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const beni = F1.line(S, 1).start;
  const nisa = F1.line(S, 2).start;
  const oM = beni - 6;
  const oB = nisa - 6;
  const lab = (t) => `<div style="font:700 24px ${mono};color:${T.teal};letter-spacing:2px;margin-bottom:10px">${t}</div>`;
  const sanksi = (at, y, num, icon, big) => K.tile(f, { at, x: 72, y, w: 888, h: 204, num, icon, big, bigSize: 56 });
  const art = F1.join(
    // Muklis
    K.kicker(f, { at: -10, out: oM, text: "PASAL 78 · LARANGAN" }),
    K.card(f, {
      at: -8, out: oM, x: 72, y: 310, w: 888,
      html: `${lab("PASAL 78 AYAT (1)")}<div style="font:700 36px/1.4 'Nunito Sans',sans-serif">Pemberi Kerja dilarang: a. <span style="${K.hl(f, w("Pasal") + 6)}">mensyaratkan</span> ijazah dan/atau dokumen pribadi … b. <span style="${K.hl(f, w("Pasal") + 18)}">menahan</span> ijazah dan/atau dokumen pribadi … <span style="${K.hl(f, w("Pasal") + 30)}">sebagai jaminan</span> dalam Hubungan Kerja.</div>`,
    }),
    K.card(f, {
      at: w("pengecualian"), out: oM, x: 72, y: 700, w: 888, pad: "26px 120px 26px 32px",
      html: `${lab("PASAL 78 AYAT (2)")}<div style="font:700 46px/1.05 Oswald;text-transform:uppercase"><span style="color:${T.red}">KECUALI:</span> DIPEROLEH DARI PENDIDIKAN DAN PELATIHAN YANG DIBIAYAI PEMBERI KERJA, BERDASARKAN PERJANJIAN KERJA TERTULIS</div>`,
    }),
    K.box(f, { at: w("tertulis"), out: oM, x: 866, y: 770, frames: 6, html: K.tick(f, { at: w("tertulis"), size: 76 }) }),
    // Beni
    K.kicker(f, { at: beni, out: oB, text: "KALAU DITAHAN?" }),
    K.card(f, { at: w("kantorku"), out: oB, x: 72, y: 310, w: 888, dashed: true, pad: "24px 32px", html: `<div style="font:700 62px/1.02 Oswald;color:${T.ink2};text-transform:uppercase">Kantorku tetap menahan ijazahku?</div>` }),
    K.tile(f, { at: w("sanksinya"), out: oB, x: 72, y: 560, w: 888, h: 240, num: "?", icon: "palu", big: "SANKSINYA?", bigSize: 90 }),
    K.card(f, { at: w("balik"), out: oB, x: 72, y: 832, w: 888, dashed: true, pad: "24px 32px", html: `<div style="font:700 64px/1 Oswald;color:${T.ink2}">IJAZAHNYA BISA BALIK?</div>` }),
    // Nisa
    K.kicker(f, { at: nisa, text: "PASAL 79 AYAT (1) · SANKSI" }),
    sanksi(w("peringatan"), 300, "1", "dokumen", "PERINGATAN TERTULIS"),
    sanksi(w("denda"), 520, "2", "kantor", "DENDA ADMINISTRATIF"),
    sanksi(w("pembatasan"), 740, "3", "gedung", "PEMBATASAN KEGIATAN USAHA"),
    K.stamp(f, { at: w("mengembalikan"), x: 100, y: 978, rot: -4, text: "IJAZAH WAJIB DIKEMBALIKAN", size: 52 }),
    K.box(f, { at: w("mengembalikan") + 5, x: 72, y: 1082, w: 888, html: `<div style="font:600 22px/1.35 ${mono};color:${T.ink2}">Pasal 79 ayat (2): sanksi tidak menghilangkan kewajiban mengembalikan</div>` }),
    K.src(f, { text: "UU 27/2026 Pasal 78 ayat (1)-(2), Penjelasan Pasal 78, Pasal 79 ayat (1)-(2)" }),
  );
  const at = { x: 200, y: 1200, w: 320 };
  return F1.join(K.page(f, D, art), K.head(f, D, { step: 2, label: "BUKTI 1 · IJAZAH" }), K.cast(S, f, [{ src: K.CAST.muklis, ...at }, { src: K.CAST.beni, ...at }, { src: K.CAST.nisa, ...at }]));
});
