// Cek: four checklist rows tick as Muklis names them. Beni's "masa transisi satu tahun?" card appears; Nisa's answer
// strikes it and shows what the text says: berlaku 28 Okt 2026, aturan turunan paling lama 1 tahun, PANTAU KEMNAKER.
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const beni = w("Terus");
  const out = beni - 6;
  const ans = w("Teksnya");
  const art = F1.join(
    K.kicker(f, { text: "CEK KONTRAKMU", out }),
    K.checkRow(f, { at: -10, out, tick: w("empat"), y: 310, label: "KONTRAK ≤ 4 TAHUN", sub: "PASAL 82 AYAT (2)" }),
    K.checkRow(f, { at: -6, out, tick: w("enam"), y: 460, label: "MAGANG ≤ 6 BULAN", sub: "PASAL 38 HURUF A" }),
    K.checkRow(f, { at: -2, out, tick: w("ditahan"), y: 610, label: "IJAZAH TIDAK DITAHAN", sub: "KECUALI PELATIHAN DIBIAYAI PERUSAHAAN, PERJANJIAN TERTULIS" }),
    K.checkRow(f, { at: 2, out, tick: w("dua"), y: 760, label: "CUTI TAHUNAN ≥ 12 HARI", sub: "PASAL 118 AYAT (5)" }),
    K.kicker(f, { at: beni, text: "KATANYA…" }),
    K.card(f, { at: beni + 2, x: 72, y: 310, w: 888, dashed: true, pad: "26px 32px", html: `<div style="position:relative;display:inline-block;font:700 76px Oswald;color:${T.ink2}">MASA TRANSISI 1 TAHUN?${K.strike(f, { at: ans, x: -10, y: 48, w: 860 })}</div><div style="font:700 26px 'JetBrains Mono',monospace;color:${T.red};margin-top:8px;opacity:${F1.n(F1.ramp(f, ans + 6, 8), 3)}">TIDAK ADA DI TEKS UU</div>` }),
    K.card(f, { at: w("diundangkan"), x: 72, y: 560, w: 888, pad: "24px 32px", html: `<div style="font:700 26px 'JetBrains Mono',monospace;color:${T.teal}">PASAL 313</div><div style="font:700 64px/1.05 Oswald">BERLAKU SEJAK 28 OKT 2026</div>` }),
    K.card(f, { at: w("turunan"), x: 72, y: 770, w: 888, pad: "24px 32px", html: `<div style="font:700 26px 'JetBrains Mono',monospace;color:${T.teal}">PASAL 312</div><div style="font:700 64px/1.05 Oswald">ATURAN TURUNAN ≤ 1 TAHUN</div>` }),
    K.chip(f, { at: w("pantau"), x: 560, y: 990, text: "PANTAU KEMNAKER", teal: true, rot: -3, size: 34 }),
    K.src(f, { y: 1170, text: "UU 27/2026 Pasal 38 huruf a, 78, 82 ayat (2), 118 ayat (5), 312-313" }),
  );
  const at = { x: 200, y: 1200, w: 320 };
  return F1.join(K.page(f, D, art), K.head(f, D, { step: 7, label: "CEK KONTRAKMU" }), K.cast(S, f, [{ src: K.CAST.muklis, ...at }, { src: K.CAST.beniKaget, ...at }, { src: K.CAST.nisa, ...at }]));
});
