// Hook (casefile look). Frame 0 is fully drawn (it is the thumbnail): tag chip, claim headline, redacted dasar hukum, narrator.
// A red pen ring lands on "klaim", the redaction bar slides off the dasar hukum on "kasus", the case stamp slams on "satu".
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const art = F1.join(
    K.chip(f, { at: -20, x: 72, y: 250, text: "GANTI: ATURAN · TANGGAL BERLAKU", teal: true }),
    K.title(f, { at: -20, y: 336, size: 118, lh: 0.98, html: `GANTI DENGAN<br>KLAIM <span style="position:relative;display:inline-block">UTAMA${K.pen(f, { at: w("klaim") - 2, x: -12, y: 4, w: 350, h: 110 })}</span><br>KASUS INI` }),
    `<div style="position:absolute;left:72px;top:760px;font:700 34px 'JetBrains Mono',monospace;color:${T.ink2};white-space:nowrap">DASAR HUKUM <span style="position:relative;display:inline-block">PASAL GANTI${K.redact(f, { at: w("kasus"), x: -8, y: -4, w: 300, h: 52 })}</span></div>`,
    K.stamp(f, { at: w("satu"), x: 72, y: 900, rot: -8, text: F1.CONFIG.case.id, size: 56 }),
    K.src(f, { at: w("satu") + 6, text: "Media A · Media B" }),
  );
  return F1.join(K.page(f, D, art, { slide: false }), K.head(f, D, { step: 1, label: "KLAIM" }), K.cast(S, f, [{ src: K.CAST.muklis, x: 200, y: 1200, w: 320, at: -20 }]));
});
