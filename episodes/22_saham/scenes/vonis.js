// Vonis: folder verdict (highlight on "bursa"), KASUS DITUTUP stamp on "ditutup", "Bukan saran investasi" card, then the
// title cover card for the last ~1 s with the subject object large (README rule 10): an IHSG board with hollow dots.
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const folder = K.folder(f, {
    at: -12, y: 270, h: 640,
    html: `<div style="font:700 26px ${mono};color:${T.ink2}">BERKAS · ${F1.esc(F1.CONFIG.case.id)}</div><div style="font:700 68px/1.02 Oswald;text-transform:uppercase;margin-top:12px">Keluar dari hitungan,<br><span style="${K.hl(f, w("bursa"))}">bukan dari bursa</span></div><div style="font:700 32px/1.5 'Nunito Sans',sans-serif;margin-top:22px;color:${T.ink}"><span style="color:${T.teal}">✓</span> 383 saham HSC mulai 13 Nov 2026</div><div style="font:700 32px/1.5 'Nunito Sans',sans-serif;color:${T.ink2}">… Daftar dievaluasi berkala oleh BEI</div>`,
  });
  const art = F1.join(
    folder,
    K.stamp(f, { at: w("ditutup"), x: 360, y: 870, rot: -7, text: "KASUS DITUTUP", size: 76 }),
    K.card(f, { at: w("saran") - 4, x: 72, y: 1000, w: 888, bg: T.ink, pad: "22px 32px", html: `<div style="font:700 50px/1.1 Oswald;color:${T.paper}">BUKAN <span style="color:${T.onInkB}">SARAN INVESTASI</span></div>` }),
    K.box(f, { at: -10, x: 72, y: 1140, w: 888, html: `<div style="font:600 20px ${mono};color:${T.ink2}">Ringkasan pengumuman BEI-KSEI 11 Nov 2026 dan pemberitaan media</div>` }),
  );
  let dots = "";
  for (let i = 0; i < 120; i++) {
    const c = i % 15, r = Math.floor(i / 15);
    const off = i % 3 !== 0;
    dots += `<div style="position:absolute;left:${c * 34}px;top:${r * 34}px;width:24px;height:24px;border-radius:12px;box-sizing:border-box;border:3px solid ${off ? T.ink2 : T.ink};background:${off ? "transparent" : T.teal};opacity:${off ? 0.55 : 1}"></div>`;
  }
  const board = `<div style="align-self:center;margin-top:36px;width:620px;box-sizing:border-box;padding:28px 36px 34px;background:${T.card};border:6px solid ${T.ink};border-radius:14px;box-shadow:14px 14px 0 ${T.shadow};transform:rotate(2deg)"><div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font:700 84px/1 Oswald;letter-spacing:4px">IHSG</span><span style="font:700 26px ${mono};color:${T.teal}">○ TAK DIHITUNG</span></div><div style="height:6px;background:${T.teal};margin:14px 0 22px"></div><div style="position:relative;height:${8 * 34 - 10}px">${dots}</div></div>`;
  return F1.join(
    K.page(f, D, art),
    K.head(f, D, { step: 6, label: "VONIS" }),
    K.cast(S, f, [{ src: K.CAST.nisa, x: 200, y: 1200, w: 320 }]),
    K.cover(f, S, { lines: [{ t: "300 saham" }, { t: "tak dihitung" }, { t: "IHSG", accent: true }], tag: "BEI · MULAI 13 NOV 2026", art: board, size: 104 }),
  );
});
