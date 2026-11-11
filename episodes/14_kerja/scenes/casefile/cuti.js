// Cuti. Muklis: the Pasal 118 page; "12 (dua belas) hari kerja" highlighted on "dua", DIBAYAR PENUH chip on "dibayar",
// ayat (6) highlighted on "tidak". Beni's question pushes the page away for two "?" tiles; Nisa fills them:
// SUAMI 2 + 3 HARI ("Dua", "ditambah"), CUTI MELAHIRKAN >= 3 BULAN ("ibunya"), UPAH PENUH ringed on "upah".
// Quoted text: only the fragments recorded in script-short.md (S14a/b), gaps marked with "…".
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const beni = w("Terus");
  const page = K.card(f, {
    at: -12,
    out: beni - 6,
    x: 72,
    y: 300,
    w: 888,
    rot: -0.8,
    pad: "40px 48px",
    html: `<div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:3px solid ${T.ink};padding-bottom:14px"><div style="font:700 72px Oswald">PASAL 118</div><div style="font:700 24px 'JetBrains Mono',monospace;color:${T.ink2}">UU 27/2026</div></div>
<div style="font:500 40px/1.5 'Nunito Sans',sans-serif;margin-top:26px;color:${T.ink2}">(5) … paling sedikit <b style="color:${T.ink};${K.hl(f, w("dua"))}">12 (dua belas) hari kerja</b> setelah … bekerja selama 12 (dua belas) bulan secara terus-menerus.</div>
<div style="font:600 44px/1.5 'Nunito Sans',sans-serif;margin-top:26px;color:${T.ink}">(6) Dalam hal Perusahaan menerapkan cuti bersama … <span style="${K.hl(f, w("tidak"), 16)}">tidak mengurangi hak cuti tahunan</span> …</div>
<div style="font:600 22px 'JetBrains Mono',monospace;color:${T.ink2};margin-top:30px">KUTIPAN · BAGIAN YANG DIPOTONG DITANDAI …</div>`,
  });
  const q = (at, x, label) => K.card(f, { at, out: w("Dua", 2) - 4, x, y: 380, w: 427, h: 300, dashed: true, html: `<div style="font:700 40px Oswald;color:${T.ink2}">${label}</div><div style="font:700 150px/1 Oswald;color:${T.ink2};margin-top:10px">?</div>` });
  const art = F1.join(
    K.kicker(f, { text: "BUNYI PASALNYA", out: beni - 6 }),
    page,
    K.chip(f, { at: w("dibayar"), out: beni - 6, x: 500, y: 1010, text: "DIBAYAR PENUH · PASAL 123", teal: true, rot: 3 }),
    K.kicker(f, { at: beni, text: "HAK CUTI KELUARGA" }),
    q(w("istriku"), 72, "SUAMI"),
    q(w("dibayar", 1), 533, "DIBAYAR?"),
    K.tile(f, { at: w("Dua", 2), x: 72, y: 330, w: 888, h: 320, num: "01", icon: "ayah", big: `SUAMI: 2 HARI<br><span style="color:${T.teal};opacity:${F1.n(F1.ramp(f, w("ditambah"), 8), 3)}">+ HINGGA 3 HARI</span>`, small: "CUTI PENDAMPINGAN · TAMBAHAN DENGAN KESEPAKATAN · PASAL 124", bigSize: 64 }),
    K.tile(f, { at: w("ibunya"), x: 72, y: 690, w: 888, h: 320, num: "02", icon: "bayi", big: `IBU: ≥ 3 BULAN<br><span style="position:relative;display:inline-block;color:${T.teal}">UPAH PENUH${K.pen(f, { at: w("upah"), x: 36, y: 0, w: 300, h: 70 })}</span>`, small: "CUTI MELAHIRKAN · PASAL 121, 123", bigSize: 64 }),
    K.src(f, { y: 1170, text: "UU 27/2026 Pasal 118 ayat (5)-(6), 121, 123, 124 · Bisnis 7 Nov 2026 · CNBC Indonesia 7 Nov 2026" }),
  );
  const at = { x: 200, y: 1200, w: 320 };
  return F1.join(K.page(f, D, art), K.head(f, D, { step: 5, label: "CUTI" }), K.cast(S, f, [{ src: K.CAST.muklis, ...at }, { src: K.CAST.beniKaget, ...at }, { src: K.CAST.nisa, ...at }]));
});
