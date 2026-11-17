// Hook: frame 0 already shows the claim (CUTI BERSAMA NGGAK POTONG CUTI KAMU* + footnote), stamp on "tidak", cuti form card.
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const art = F1.join(
    K.chip(f, { at: -20, x: 72, y: 250, text: "UU 27/2026 PASAL 118 (6)", teal: true }),
    K.title(f, { at: -20, y: 336, size: 124, lh: 0.98, html: `CUTI BERSAMA<br>NGGAK POTONG<br><span style="position:relative;display:inline-block">CUTI KAMU*${K.pen(f, { at: w("dipotong") - 2, x: -10, y: 2, w: 520, h: 112 })}</span>` }),
    K.box(f, { at: -20, x: 72, y: 722, html: `<div style="font:700 40px ${mono};color:${T.red};letter-spacing:2px">*ADA SYARATNYA</div>` }),
    K.stamp(f, { at: w("tidak"), x: 100, y: 820, rot: -6, text: "TIDAK BOLEH DIPOTONG", size: 68 }),
    K.card(f, { at: -20, x: 72, y: 980, w: 888, pad: "22px 34px", html: `<div style="font:700 24px ${mono};color:${T.ink2};letter-spacing:2px">FORMULIR CUTI TAHUNAN</div><div style="font:700 56px/1.05 Oswald;margin-top:6px">JATAH KAMU: <span style="color:${T.teal}">UTUH</span></div>` }),
    K.src(f, { at: -20, y: 1160, text: "Kompas · detikJatim · UU 27/2026" }),
  );
  return F1.join(K.page(f, D, art, { slide: false }), K.head(f, D, { step: 1, label: "KLAIM" }), K.cast(S, f, [{ src: K.CAST.nisa, x: 200, y: 1200, w: 320, at: -20 }]));
});
