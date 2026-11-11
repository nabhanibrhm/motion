// Sisi lain (casefile look): two equal columns, each entering from its own side on its cue word.
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const head = (icon, label) => `<div style="display:flex;justify-content:space-between;align-items:flex-start"><div style="font:700 28px 'JetBrains Mono',monospace;color:${T.teal};letter-spacing:2px">${label}</div>${K.icon(icon, 72)}</div>`;
  const art = F1.join(
    K.kicker(f, { text: "DUA SISI" }),
    K.card(f, { at: w("sisi"), x: 72, y: 310, w: 427, h: 700, dir: -1, html: `${head("dokumen", "SISI LAIN")}<div style="font:700 64px/1.02 Oswald;margin-top:18px">GANTI<br>SISI LAIN</div><div style="font:700 28px/1.3 'JetBrains Mono',monospace;color:${T.ink2};margin-top:24px">PIHAK YANG BERBEDA<br>MEDIA D</div>` }),
    K.card(f, { at: w("bantahan"), x: 533, y: 310, w: 427, h: 700, dir: 1, html: `${head("gedung", "BANTAHAN")}<div style="font:700 64px/1.02 Oswald;margin-top:18px">GANTI<br>BANTAHAN</div><div style="font:700 28px/1.3 'JetBrains Mono',monospace;color:${T.ink2};margin-top:24px">PENJELASAN<br>MEDIA E</div>` }),
    K.src(f, { y: 1170, text: "Media D · Media E" }),
  );
  return F1.join(K.page(f, D, art), K.head(f, D, { step: 3, label: "DUA SISI" }), K.cast(S, f, [{ src: K.CAST.beni, x: 200, y: 1200, w: 320 }]));
});
