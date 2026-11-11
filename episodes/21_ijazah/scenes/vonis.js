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
  return F1.join(
    K.page(f, D, art),
    K.head(f, D, { step: 6, label: "VONIS" }),
    K.cast(S, f, [{ src: K.CAST.nisa, x: 200, y: 1200, w: 320 }]),
    K.cover(f, S, { lines: [{ t: "Ijazah ditahan" }, { t: "kantor?" }, { t: "Kini dilarang UU", accent: true }], tag: "UU 27/2026 · PASAL 78", icon: "dokumen", size: 104 }),
  );
});
