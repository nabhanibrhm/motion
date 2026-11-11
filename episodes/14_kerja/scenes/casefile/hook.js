// Hook (casefile look). Frame 0 is fully drawn and shows the claim: tag, headline, calendar, Nisa.
// "tidak" gets a red pen ring as it is spoken; the pasal number is redacted and the bar slides off on "undang-undang";
// cuti bersama days are ringed on the second "cuti"; the KASUS #11 stamp lands on "Terus".
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const art = F1.join(
    K.chip(f, { at: -20, x: 72, y: 250, text: "UU 27/2026 · BERLAKU 28 OKT 2026", teal: true }),
    K.title(f, { at: -20, y: 336, size: 118, lh: 0.98, html: `Cuti bersama<br><span style="position:relative;display:inline-block">tidak${K.pen(f, { at: w("tidak") - 2, x: 34, y: 4, w: 300, h: 104 })}</span> memotong<br>cuti tahunan` }),
    `<div style="position:absolute;left:72px;top:760px;font:700 34px 'JetBrains Mono',monospace;color:${T.ink2};white-space:nowrap">PASAL <span style="position:relative;display:inline-block">118 AYAT (6)${K.redact(f, { at: w("undang-undang"), x: -8, y: -4, w: 270, h: 52 })}</span></div>`,
    K.calendar(f, { x: 430, y: 850, ring: [24, 26], shade: [22, 23, 24, 25, 26], ringAt: w("cuti", 1), note: "CONTOH" }),
    K.stamp(f, { at: w("Terus"), x: 72, y: 1000, rot: -8, text: "KASUS #11", size: 56 }),
    K.src(f, { at: w("Terus") + 6, text: "UU 27/2026 Pasal 118 ayat (6), Pasal 313 · CNBC Indonesia 7 Nov 2026 · Bisnis 7 Nov 2026" }),
  );
  return F1.join(K.page(f, D, art, { slide: false }), K.head(f, D, { step: 1, label: "CUTI BERSAMA" }), K.cast(S, f, [{ src: K.CAST.nisa, x: 200, y: 1200, w: 320, at: -20 }]));
});
