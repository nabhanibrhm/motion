// Vonis: folder (aturan berlaku, uang belum cair), KASUS DITUTUP on "ditutup", comment question on "Tulis",
// then the title cover (art slot: big slip "BSU 2026 · Rp900.000") for the last ~1 s.
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const sans = "'Nunito Sans',sans-serif";
  const folder = K.folder(f, {
    at: -12, y: 270, h: 640,
    html: `<div style="font:700 26px ${mono};color:${T.ink2}">BERKAS · ${F1.esc(F1.CONFIG.case.id)}</div><div style="font:700 72px/1.02 Oswald;text-transform:uppercase;margin-top:12px">Aturan jalan,<br><span style="${K.hl(f, w("belum"))}">uang belum cair</span></div><div style="font:700 32px/1.5 ${sans};margin-top:22px"><span style="color:${T.teal}">✓</span> ATURAN: berlaku 28 Okt 2026</div><div style="font:700 32px/1.5 ${sans};color:${T.ink2}"><span style="color:${T.red}">?</span> UANG: belum cair, belum ada tanggal</div>`,
  });
  const art = F1.join(
    folder,
    K.stamp(f, { at: w("ditutup"), x: 360, y: 830, rot: -7, text: "KASUS DITUTUP", size: 76 }),
    K.card(f, { at: w("Tulis"), x: 72, y: 1010, w: 888, bg: T.ink, pad: "22px 32px", html: `<div style="font:700 24px ${mono};color:${T.paper}">● TULIS DI KOMENTAR</div><div style="font:700 50px/1.1 Oswald;color:${T.paper};margin-top:6px">KAMU MASUK <span style="color:${T.onInkA}">SYARATNYA</span>?</div>` }),
    K.box(f, { at: -10, x: 72, y: 1172, w: 888, html: `<div style="font:600 20px ${mono};color:${T.ink2}">Ringkasan Permenaker 16/2026, bukan nasihat hukum</div>` }),
  );
  const slip = `<div style="align-self:center;margin-top:36px;width:700px;box-sizing:border-box;padding:34px 40px;background:${T.card};border:6px solid ${T.ink};border-radius:14px;box-shadow:14px 14px 0 ${T.shadow};transform:rotate(-3deg)"><div style="font:700 28px ${mono};letter-spacing:4px;color:${T.ink2}">BSU 2026</div><div style="font:700 112px/1 Oswald;color:${T.ink};margin-top:10px;white-space:nowrap">Rp900.000</div><div style="height:6px;background:${T.teal};margin-top:14px"></div><div style="font:700 24px ${mono};color:${T.ink2};margin-top:16px">BANTUAN SUBSIDI UPAH</div></div>`;
  return F1.join(
    K.page(f, D, art),
    K.head(f, D, { step: 6, label: "VONIS" }),
    K.cast(S, f, [{ src: K.CAST.nisa, x: 200, y: 1200, w: 320 }]),
    K.cover(f, S, { lines: [{ t: "BSU Rp900 ribu" }, { t: "Kamu dapat?", accent: true }], tag: "CEK SYARATNYA", art: slip, size: 112 }),
  );
});
