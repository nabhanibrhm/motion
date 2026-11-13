// Vonis: folder (2026 berlaku, 2027 rencana, PTKP tidak naik), KASUS DITUTUP on "ditutup", comment question on "Tulis",
// then the title cover (art slot: big payslip "PPh 21: Rp0?") for the last ~1 s.
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const sans = "'Nunito Sans',sans-serif";
  const folder = K.folder(f, {
    at: -12, y: 270, h: 600,
    html: `<div style="font:700 26px ${mono};color:${T.ink2}">BERKAS · ${F1.esc(F1.CONFIG.case.id)}</div><div style="font:700 72px/1.02 Oswald;text-transform:uppercase;margin-top:12px">Rencana ada,<br><span style="${K.hl(f, w("belum"))}">aturan belum</span></div><div style="font:700 30px/1.4 ${sans};margin-top:22px"><span style="color:${T.teal}">✓</span> 2026: BERLAKU · 5 SEKTOR</div><div style="font:700 30px/1.4 ${sans}"><span style="color:${T.red}">?</span> 2027 SEMUA SEKTOR: RENCANA</div><div style="font:700 30px/1.4 ${sans};color:${T.ink2}"><span style="color:${T.teal}">✓</span> PTKP: TIDAK NAIK JANUARI</div>`,
  });
  const art = F1.join(
    folder,
    K.stamp(f, { at: w("ditutup"), x: 300, y: 885, rot: -7, text: "KASUS DITUTUP", size: 76 }),
    K.card(f, { at: w("Tulis"), x: 72, y: 1030, w: 888, bg: T.ink, pad: "22px 32px", html: `<div style="font:700 24px ${mono};color:${T.paper}">● TULIS DI KOMENTAR</div><div style="font:700 50px/1.1 Oswald;color:${T.paper};margin-top:6px">GAJIMU <span style="color:${T.onInkA}">&lt; RP10 JUTA</span>?</div>` }),
    K.box(f, { at: -10, x: 72, y: 1176, w: 888, html: `<div style="font:600 20px ${mono};color:${T.ink2}">Ringkasan PMK 105/2025 dan pernyataan pejabat, bukan nasihat pajak</div>` }),
  );
  const slip = `<div style="align-self:center;margin-top:36px;width:760px;box-sizing:border-box;padding:34px 40px;background:${T.card};border:6px solid ${T.ink};border-radius:14px;box-shadow:14px 14px 0 ${T.shadow};transform:rotate(-3deg)"><div style="font:700 28px ${mono};letter-spacing:4px;color:${T.ink2}">SLIP GAJI</div><div style="font:700 112px/1 Oswald;color:${T.ink};margin-top:10px;white-space:nowrap">PPh 21: Rp0?</div><div style="height:6px;background:${T.teal};margin-top:14px"></div><div style="font:700 24px ${mono};color:${T.ink2};margin-top:16px">GAJI ≤ Rp10.000.000 · 2027</div></div>`;
  return F1.join(
    K.page(f, D, art),
    K.head(f, D, { step: 6, label: "VONIS" }),
    K.cast(S, f, [{ src: K.CAST.nisa, x: 200, y: 1200, w: 320 }]),
    K.cover(f, S, { lines: [{ t: "GAJI < RP10 JUTA" }, { t: "BEBAS PAJAK?", accent: true }], tag: "PPh 21 DTP · BARU RENCANA", art: slip, size: 112 }),
  );
});
