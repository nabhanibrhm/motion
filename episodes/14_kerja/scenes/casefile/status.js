// Status: two timeline stops (6 OKT, 28 OKT), the law card with its LN number, then UU 13/2003 struck through.
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const stop = (at, y, date, what, filled) =>
    K.box(f, { at, x: 72, y, w: 888, html: `<div style="display:flex;gap:30px;align-items:flex-start"><div style="width:44px;height:44px;flex:none;margin-top:16px;border:5px solid ${T.ink};border-radius:50%;background:${filled ? T.teal : T.card}"></div><div><div style="font:700 96px/1 Oswald;color:${T.ink}">${date}</div><div style="font:700 28px 'JetBrains Mono',monospace;color:${T.ink2};margin-top:8px">${what}</div></div></div>` });
  const line = F1.ramp(f, w("dua") - 8, 10);
  const art = F1.join(
    K.kicker(f, { text: "BUKAN DRAF · SUDAH DIUNDANGKAN" }),
    `<div style="position:absolute;left:91px;top:390px;width:6px;height:${F1.n(190 * line)}px;background:${T.ink}"></div>`,
    stop(w("enam") - 4, 330, "6 OKT", "PARIPURNA DPR", false),
    stop(w("dua") - 2, 540, "28 OKT", "DITANDATANGANI · DIUNDANGKAN · BERLAKU", true),
    K.card(f, { at: w("sebagai") - 2, x: 72, y: 760, w: 500, rot: -1.5, html: `<div style="font:700 26px 'JetBrains Mono',monospace;color:${T.ink2}">LEMBARAN NEGARA 2026 NO. 179</div><div style="font:700 72px/1.02 Oswald;text-transform:uppercase;margin-top:8px">UU No. 27<br>Tahun 2026</div><div style="font:700 30px 'Nunito Sans',sans-serif;margin-top:10px">tentang Pelindungan Ketenagakerjaan</div>` }),
    K.card(f, { at: w("mencabut") - 2, x: 610, y: 800, w: 350, dashed: true, pad: "18px 26px", html: `<div style="position:relative;display:inline-block;font:700 54px Oswald;color:${T.ink2}">UU 13/2003${K.strike(f, { at: w("Ketenagakerjaan"), x: -8, y: 34, w: 290 })}</div><div style="font:700 24px 'JetBrains Mono',monospace;color:${T.red};margin-top:6px;opacity:${F1.n(F1.ramp(f, w("Ketenagakerjaan") + 6, 8), 3)}">DICABUT · PASAL 311</div>` }),
    K.src(f, { y: 1170, text: "UU 27/2026 Pasal 311 huruf a, Pasal 313, penutup · DPR.go.id 6 Okt 2026 · CNN Indonesia 6 Okt 2026" }),
  );
  return F1.join(K.page(f, D, art), K.head(f, D, { step: 2, label: "STATUS UU" }), K.cast(S, f, [{ src: K.CAST.muklis, x: 200, y: 1200, w: 320 }]));
});
