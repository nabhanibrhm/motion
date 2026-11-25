// Hook: frame 0 already shows the claim (NUNGGU LAMA CPNS? DIBUKA JUMAT* + 70.000 kehutanan), pen ring on "nunggu", stamp MULAI 27 NOV on "Jumat".
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const art = F1.join(
    K.chip(f, { at: -20, x: 72, y: 250, text: "SELEKSI CPNS 2026 · SSCASN", teal: true }),
    K.title(f, { at: -20, y: 336, size: 124, lh: 0.98, html: `<span style="position:relative;display:inline-block">NUNGGU LAMA${K.pen(f, { at: w("nunggu") + 2, x: -60, y: -2, w: 840, h: 122 })}</span><br>CPNS?<br><span style="color:${T.teal}">DIBUKA JUMAT*</span>` }),
    K.box(f, { at: -20, x: 72, y: 722, html: `<div style="font:700 40px ${mono};color:${T.red};letter-spacing:2px">*70.000 KURSI DI KEHUTANAN</div>` }),
    K.stamp(f, { at: w("Jumat"), x: 120, y: 820, rot: -6, text: "MULAI 27 NOV 2026", size: 68 }),
    K.card(f, { at: -20, x: 72, y: 980, w: 888, pad: "22px 34px", html: `<div style="font:700 24px ${mono};color:${T.ink2};letter-spacing:2px">FORMASI TERBANYAK</div><div style="font:700 56px/1.05 Oswald;margin-top:6px">KEHUTANAN: <span style="color:${T.teal}">70.000 KURSI</span></div>` }),
    K.src(f, { at: -20, y: 1160, text: "Antara · Detik · Kompas TV · 25 Nov 2026" }),
  );
  return F1.join(K.page(f, D, art, { slide: false }), K.head(f, D, { step: 1, label: "KLAIM" }), K.cast(S, f, [{ src: K.CAST.nisa, x: 200, y: 1200, w: 320, at: -20 }]));
});
