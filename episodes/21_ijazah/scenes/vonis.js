// Vonis: the case folder with the verdict (highlighter on "jaminan"), the KASUS DITUTUP stamp on "ditutup",
// the comment question on "Ijazahmu" / "Cerita", then the title cover card for the last ~1 s (TikTok cover).
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const folder = K.folder(f, {
    at: -12,
    y: 270,
    h: 640,
    html: `<div style="font:700 26px ${mono};color:${T.ink2}">BERKAS · ${F1.esc(F1.CONFIG.case.id)}</div><div style="font:700 72px/1.02 Oswald;text-transform:uppercase;margin-top:12px">Ijazah bukan<br><span style="${K.hl(f, w("jaminan"))}">jaminan kerja</span></div><div style="font:700 32px/1.5 'Nunito Sans',sans-serif;margin-top:22px;color:${T.ink}"><span style="color:${T.teal}">✓</span> Berlaku sejak 28 Okt 2026</div><div style="font:700 32px/1.5 'Nunito Sans',sans-serif;color:${T.ink2}">… Aturan turunan: paling lambat 28 Okt 2027</div>`,
  });
  const art = F1.join(
    folder,
    K.stamp(f, { at: w("ditutup"), x: 360, y: 830, rot: -7, text: "KASUS DITUTUP", size: 76 }),
    K.card(f, { at: w("Ijazahmu"), x: 72, y: 1010, w: 888, bg: T.ink, pad: "22px 32px", html: `<div style="font:700 24px ${mono};color:${T.paper};opacity:${F1.n(F1.ramp(f, w("Cerita"), 8), 3)}">● CERITA DI KOMENTAR</div><div style="font:700 50px/1.1 Oswald;color:${T.paper};margin-top:6px">IJAZAHMU PERNAH <span style="color:${T.onInkB}">DITAHAN</span>?</div>` }),
    K.box(f, { at: -10, x: 72, y: 1172, w: 888, html: `<div style="font:600 20px ${mono};color:${T.ink2}">Ringkasan teks UU 27/2026, bukan nasihat hukum</div>` }),
  );
  // Cover art (README rule 10): the subject object, large. A generic ijazah sheet, no name or number.
  const doc = `<div style="align-self:center;margin-top:36px;width:620px;height:500px;box-sizing:border-box;padding:34px 40px;background:${T.card};border:6px solid ${T.ink};border-radius:14px;box-shadow:14px 14px 0 ${T.shadow};transform:rotate(3deg);position:relative"><div style="font:700 28px ${mono};letter-spacing:4px;color:${T.ink2}">DOKUMEN ASLI</div><div style="font:700 104px/1 Oswald;letter-spacing:6px;color:${T.ink};margin-top:10px">IJAZAH</div><div style="height:6px;background:${T.teal};margin-top:14px"></div><div style="height:14px;background:${T.ink2};opacity:.35;margin-top:34px;width:88%"></div><div style="height:14px;background:${T.ink2};opacity:.35;margin-top:20px;width:70%"></div><div style="height:14px;background:${T.ink2};opacity:.35;margin-top:20px;width:80%"></div><div style="position:absolute;right:44px;bottom:36px;width:120px;height:120px;border-radius:60px;border:6px solid ${T.teal};box-sizing:border-box"></div><div style="position:absolute;right:74px;bottom:66px;width:60px;height:60px;border-radius:30px;background:${T.teal};opacity:.35"></div></div>`;
  return F1.join(
    K.page(f, D, art),
    K.head(f, D, { step: 6, label: "VONIS" }),
    K.cast(S, f, [{ src: K.CAST.nisa, x: 200, y: 1200, w: 320 }]),
    K.cover(f, S, { lines: [{ t: "Ijazah ditahan" }, { t: "kantor?" }, { t: "Kini dilarang UU", accent: true }], tag: "UU 27/2026 · PASAL 78", art: doc, size: 104 }),
  );
});
