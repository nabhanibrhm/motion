// Hook (casefile look). Frame 0 is fully drawn and shows the claim: tag, headline, IJAZAH document card (redacted), narrator.
// "undang-undang" brings the "SEBELUMNYA: SURAT EDARAN" chip; "ijazah" slides the redaction off and strikes JAMINAN KERJA;
// "jaminan" rings "SEBAGAI JAMINAN"; paspor / nikah / BPKB pop three ASLI tiles; the KASUS #12 stamp lands on BPKB.
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const tile = (word, x, label) =>
    K.card(f, {
      at: w(word), x, y: 944, w: 280, h: 170, pad: "16px 18px",
      html: `<div style="display:flex;justify-content:space-between;align-items:flex-start">${K.icon("dokumen", 64)}<span style="font:800 22px ${mono};color:${T.teal}">ASLI</span></div><div style="font:700 44px/1 Oswald;margin-top:8px;white-space:nowrap">${label}</div>`,
    });
  const art = F1.join(
    K.chip(f, { at: -20, x: 72, y: 250, text: "UU 27/2026 · BERLAKU 28 OKT 2026", teal: true }),
    K.title(f, { at: -20, y: 336, size: 104, lh: 0.98, html: `Ijazah<br>ditahan?<br>Dilarang UU` }),
    K.chip(f, { at: w("undang-undang"), x: 72, y: 664, text: "SEBELUMNYA: SURAT EDARAN MENAKER, MEI 2025", size: 24 }),
    K.card(f, {
      at: -20, x: 72, y: 748, w: 470, h: 170, pad: "22px 26px",
      html: `<div style="display:flex;gap:22px;align-items:center">${K.icon("dokumen", 80)}<div><div style="font:700 20px ${mono};color:${T.ink2};letter-spacing:1px">DOKUMEN PRIBADI</div><div style="position:relative;display:inline-block;font:700 76px/1 Oswald;margin-top:6px">IJAZAH${K.redact(f, { at: w("ijazah"), x: -8, y: -4, w: 252, h: 92 })}</div></div></div>`,
    }),
    K.chip(f, { at: -20, x: 570, y: 756, text: "JAMINAN KERJA" }),
    K.strike(f, { at: w("ijazah") + 4, x: 562, y: 784, w: 302 }),
    K.box(f, { at: w("sebagai"), x: 600, y: 858, html: `<div style="position:relative;display:inline-block;font:700 42px/1 Oswald;white-space:nowrap">SEBAGAI JAMINAN${K.pen(f, { at: w("jaminan") - 2, x: -44, y: -5, w: 395, h: 62 })}</div>` }),
    tile("paspor", 72, "PASPOR"),
    tile("nikah", 376, "BUKU NIKAH"),
    tile("BPKB", 680, "BPKB"),
    K.stamp(f, { at: w("BPKB"), x: 600, y: 1228, rot: -8, text: F1.CONFIG.case.id, size: 52 }),
    K.src(f, { at: -12, text: "UU 27/2026 Pasal 78 (1), 313 · SE Menaker 20 Mei 2025" }),
  );
  return F1.join(K.page(f, D, art, { slide: false }), K.head(f, D, { step: 1, label: "LAPORAN MASUK" }), K.cast(S, f, [{ src: K.CAST.nisa, x: 200, y: 1200, w: 320, at: -20 }]));
});
