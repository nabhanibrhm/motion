// Vonis: folder summary, KASUS DITUTUP on "ditutup", comment question on "Tulis", then the title cover for the last ~1 s.
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const sans = "'Nunito Sans',sans-serif";
  const folder = K.folder(f, {
    at: -12, y: 270, h: 600,
    html: `<div style="font:700 26px ${mono};color:${T.ink2}">BERKAS · ${F1.esc(F1.CONFIG.case.id)}</div><div style="font:700 70px/1.02 Oswald;text-transform:uppercase;margin-top:12px">PHK sepihak<br><span style="${K.hl(f, w("batal"))}">batal demi hukum</span></div><div style="font:700 30px/1.4 ${sans};margin-top:22px"><span style="color:${T.teal}">✓</span> WAJIB DIPEKERJAKAN KEMBALI</div><div style="font:700 30px/1.4 ${sans}"><span style="color:${T.teal}">✓</span> 10 ALASAN PHK DILARANG</div><div style="font:700 30px/1.4 ${sans};color:${T.ink2}"><span style="color:${T.red}">!</span> TIDAK OTOMATIS: LEWAT PHI</div>`,
  });
  const art = F1.join(
    folder,
    K.stamp(f, { at: w("ditutup"), x: 300, y: 885, rot: -7, text: "KASUS DITUTUP", size: 76 }),
    K.card(f, { at: w("Tulis"), x: 72, y: 990, w: 888, bg: T.ink, pad: "22px 32px", html: `<div style="font:700 24px ${mono};color:${T.paper}">● TULIS DI KOMENTAR</div><div style="font:700 50px/1.1 Oswald;color:${T.paper};margin-top:6px">PERNAH DI-PHK <span style="color:${T.onInkA}">SEPIHAK</span>?</div>` }),
    K.box(f, { at: -10, x: 72, y: 1176, w: 888, html: `<div style="font:600 20px ${mono};color:${T.ink2}">Ringkasan UU 27/2026 (berlaku 28 Okt 2026), bukan nasihat hukum</div>` }),
  );
  return F1.join(
    K.page(f, D, art),
    K.head(f, D, { step: 6, label: "VONIS" }),
    K.cast(S, f, [{ src: K.CAST.nisa, x: 200, y: 1200, w: 320 }]),
    K.cover(f, S, { lines: [{ t: "PHK SEPIHAK" }, { t: "BATAL DEMI", accent: true }, { t: "HUKUM?", accent: true }], tag: "UU 27/2026 · PASAL 228", icon: "palu" }),
  );
});
