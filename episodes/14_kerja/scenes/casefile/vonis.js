// Vonis: the case folder (what is settled, what is pending), KASUS DITUTUP SEMENTARA stamp on "ditutup", the comment
// question on "Cuti", TULIS DI KOMENTAR on "Tulis", then the title cover card for the last ~1 s (TikTok cover).
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const ask = w("Cuti");
  const folder = K.folder(f, {
    at: -12,
    y: 270,
    h: 640,
    html: `<div style="font:700 26px 'JetBrains Mono',monospace;color:${T.ink2}">BERKAS · KASUS #11</div><div style="font:700 72px/1 Oswald;text-transform:uppercase;margin-top:12px">Cuti bersama<br>vs cuti tahunan</div><div style="font:700 32px/1.5 'Nunito Sans',sans-serif;margin-top:22px;color:${T.ink}"><span style="color:${T.teal}">✓</span> Teks UU berlaku sejak 28 Okt</div><div style="font:700 32px/1.5 'Nunito Sans',sans-serif;color:${T.ink2}">… Aturan turunan masih ditunggu</div>`,
  });
  const art = F1.join(
    folder,
    K.stamp(f, { at: w("ditutup"), x: 360, y: 830, rot: -7, text: "KASUS DITUTUP", sub: "SEMENTARA", size: 76 }),
    K.card(f, { at: ask, x: 72, y: 1010, w: 888, bg: T.ink, pad: "22px 32px", html: `<div style="font:700 24px 'JetBrains Mono',monospace;color:${T.paper};opacity:${F1.n(F1.ramp(f, w("Tulis"), 8), 3)}">● TULIS DI KOMENTAR</div><div style="font:700 50px/1.1 Oswald;color:${T.paper};margin-top:6px">CUTI TAHUNANMU TAHUN INI: <span style="color:${T.onInkA}">UTUH</span> ATAU <span style="color:${T.onInkB}">KEPOTONG?</span></div>` }),
  );
  return F1.join(
    K.page(f, D, art),
    K.head(f, D, { step: 8, label: "VONIS" }),
    K.cast(S, f, [{ src: K.CAST.nisa, x: 200, y: 1200, w: 320 }]),
    K.cover(f, S, { lines: [{ t: "Cuti bersama" }, { t: "tak potong", accent: true }, { t: "cuti tahunan?" }], tag: "UU 27/2026 · PASAL 118" }),
  );
});
