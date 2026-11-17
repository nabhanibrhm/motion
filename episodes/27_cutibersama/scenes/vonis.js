// Vonis: folder, KASUS DITUTUP on "ditutup", comment ask on "Tulis", disclaimer, then the title cover with a large calendar.
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const sans = "'Nunito Sans',sans-serif";
  const folder = K.folder(f, {
    at: -12, y: 270, h: 600,
    html: `<div style="font:700 26px ${mono};color:${T.ink2}">BERKAS · ${F1.esc(F1.CONFIG.case.id)}</div><div style="font:700 66px/1.02 Oswald;text-transform:uppercase;margin-top:12px">Cuti bersama<br><span style="${K.hl(f, w("tidak") + 2)}">tidak potong cuti</span></div><div style="font:700 30px/1.4 ${sans};margin-top:22px"><span style="color:${T.teal}">✓</span> KANTOR IKUT: CUTI TETAP UTUH</div><div style="font:700 30px/1.4 ${sans}"><span style="color:${T.teal}">✓</span> TIDAK IKUT: MASUK, CUTI UTUH</div><div style="font:700 30px/1.4 ${sans};color:${T.ink2}"><span style="color:${T.red}">!</span> PERUSAHAAN TIDAK WAJIB IKUT</div>`,
  });
  const art = F1.join(
    folder,
    K.stamp(f, { at: w("ditutup"), x: 300, y: 870, rot: -7, text: "KASUS DITUTUP", size: 76 }),
    K.card(f, { at: w("Tulis") - 6, x: 72, y: 1030, w: 888, bg: T.ink, pad: "22px 32px", html: `<div style="font:700 24px ${mono};color:${T.paper}">● TULIS DI KOMENTAR</div><div style="font:700 50px/1.1 Oswald;color:${T.paper};margin-top:6px">KANTOR KAMU <span style="color:${T.onInkA}">IKUT</span> CUTI BERSAMA?</div>` }),
    K.box(f, { at: -10, x: 72, y: 1208, w: 888, html: `<div style="font:600 20px ${mono};color:${T.ink2}">Ringkasan UU 27/2026 Pasal 118, bukan nasihat hukum</div>` }),
  );
  const art2 = `<div style="margin-top:36px;position:relative;height:620px;width:100%">${K.calendar(f, { x: 20, y: 0, w: 840, month: "CUTI 2027", first: 1, last: 28, note: "CUTI BERSAMA ≠ POTONG CUTI" })}</div>`;
  return F1.join(
    K.page(f, D, art),
    K.head(f, D, { step: 4, label: "VONIS" }),
    K.cast(S, f, [{ src: K.CAST.nisa, x: 200, y: 1200, w: 320 }]),
    K.cover(f, S, { lines: [{ t: "CUTI BERSAMA 2027" }, { t: "CUTI KAMU", accent: true }, { t: "DIPOTONG?", accent: true }], tag: "UU 27/2026 · PASAL 118", size: 104, art: art2 }),
  );
});
