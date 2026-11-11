// Dua sisi: equal columns. SERIKAT BURUH (KSPI: terima + 3 catatan, opsi uji materi) vs PENGUSAHA (Apindo: tunggu naskah resmi).
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const head = (icon, label) => `<div style="display:flex;justify-content:space-between;align-items:flex-start"><div style="font:700 28px 'JetBrains Mono',monospace;color:${T.teal};letter-spacing:2px">${label}</div>${K.icon(icon, 72)}</div>`;
  const notes = ["PENANGGUHAN UPAH", "PEMAGANGAN", "CADANGAN PESANGON"]
    .map((t, i) => `<div style="font:700 24px 'JetBrains Mono',monospace;margin-top:12px;opacity:${F1.n(F1.ramp(f, w("catatan") + 5 * i, 8), 3)}">${i + 1}. ${t}</div>`)
    .join("");
  const art = F1.join(
    K.kicker(f, { text: "DUA SISI" }),
    K.card(f, { at: w("KSPI") - 2, x: 72, y: 310, w: 427, h: 760, dir: -1, html: `${head("serikat", "SERIKAT BURUH")}<div style="font:700 64px/1.02 Oswald;margin-top:18px">KSPI<br>TERIMA</div><div style="font:700 40px/1.1 Oswald;color:${T.teal};margin-top:10px">+ 3 CATATAN</div>${notes}<div style="margin-top:28px;opacity:${F1.n(F1.ramp(f, w("uji"), 8), 3)}"><div style="display:inline-block;font:700 26px 'JetBrains Mono',monospace;padding:8px 14px;border:3px solid ${T.ink};border-radius:8px">OPSI UJI MATERI</div><div style="font:600 20px 'JetBrains Mono',monospace;color:${T.ink2};margin-top:8px">JIKA ADA YANG MERUGIKAN</div></div>` }),
    K.card(f, { at: w("Apindo") - 2, x: 533, y: 310, w: 427, h: 760, dir: 1, html: `${head("kantor", "PENGUSAHA")}<div style="font:700 64px/1.02 Oswald;margin-top:18px">APINDO<br>TUNGGU</div><div style="font:700 40px/1.1 Oswald;color:${T.teal};margin-top:10px">NASKAH RESMI</div>` }),
    K.src(f, { y: 1170, text: "Okezone 7 Okt 2026 · iNews 7 Okt 2026 · ANTARA 8 Okt 2026 · CNN Indonesia 9 Okt 2026" }),
  );
  return F1.join(K.page(f, D, art), K.head(f, D, { step: 6, label: "DUA SISI" }), K.cast(S, f, [{ src: K.CAST.nisa, x: 200, y: 1200, w: 320 }]));
});
