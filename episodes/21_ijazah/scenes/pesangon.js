// Pesangon (BUKTI 2). The 1-9 month ladder grows bar by bar from "satu" to "sembilan"; PAILIT and TUTUP KARENA RUGI rows
// show the old 0,5x, struck as it is spoken, and the new 1x ticked; chip "PENGALI 0,5 DIHAPUS" on "penuh"; the micro/small
// business footer stays on screen (Pasal 250).
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const BY = 560;
  const s0 = w("satu");
  const s1 = w("sembilan");
  const years = ["<1", "1", "2", "3", "4", "5", "6", "7", "≥8"];
  let bars = "";
  for (let i = 0; i < 9; i++) {
    const x = 72 + i * 100;
    const at = s0 + ((s1 - s0) * i) / 8;
    const p = F1.ramp(f, at, 10, F1.expoOut);
    const h = 26 * (i + 1) * p;
    const last = i === 8;
    bars += `<div style="position:absolute;left:${x}px;top:${F1.n(BY - h)}px;width:86px;height:${F1.n(h)}px;background:${last ? T.teal : T.ink};border-radius:6px 6px 0 0"></div>`;
    bars += `<div style="position:absolute;left:${x}px;top:${F1.n(BY - h - 36)}px;width:86px;text-align:center;font:800 28px ${mono};color:${last ? T.teal : T.ink};opacity:${F1.n(p, 3)}">${i + 1}</div>`;
    bars += `<div style="position:absolute;left:${x}px;top:${BY + 10}px;width:86px;text-align:center;font:700 24px ${mono};color:${T.ink2}">${years[i]}</div>`;
  }
  const ladder = K.box(f, { at: -10, x: 0, y: 0, frames: 10, html: `<div style="position:absolute;left:72px;top:${BY}px;width:888px;height:6px;background:${T.ink}"></div>${bars}<div style="position:absolute;left:72px;top:296px;font:700 22px ${mono};color:${T.teal};letter-spacing:2px">BULAN UPAH</div><div style="position:absolute;left:72px;top:${BY + 46}px;width:888px;text-align:center;font:600 22px ${mono};color:${T.ink2};letter-spacing:2px">MASA KERJA (TAHUN)</div>` });
  const row = (at, y, main, sub, strikeAt, newAt) =>
    K.card(f, {
      at, x: 72, y, w: 888, h: 132, pad: "16px 30px",
      html: `<div style="display:flex;align-items:center;height:100%"><div style="flex:1"><div style="font:700 50px/1 Oswald;text-transform:uppercase;white-space:nowrap">${main}</div><div style="font:600 21px ${mono};color:${T.ink2};margin-top:8px;white-space:nowrap">${sub}</div></div><div style="position:relative;font:700 64px/1 Oswald;color:${T.ink2}">0,5×${K.strike(f, { at: strikeAt, x: -8, y: 30, w: 148 })}</div><div style="font:700 40px ${mono};margin:0 20px;color:${T.ink2}">→</div><div style="display:flex;align-items:center;gap:6px;width:150px;opacity:${F1.n(F1.ramp(f, newAt, 8), 3)}"><span style="font:700 84px/1 Oswald;color:${T.teal}">1×</span><span style="width:56px;height:56px">${K.tick(f, { at: newAt + 2, size: 56 })}</span></div></div>`,
    });
  const art = F1.join(
    K.kicker(f, { at: -10, text: "PASAL 232 AYAT (2) · PALING SEDIKIT" }),
    ladder,
    K.chip(f, { at: w("tetap"), x: 72, y: 652, text: "SKALA SAMA SEPERTI SEBELUMNYA", teal: true, size: 26 }),
    row(w("pailit"), 728, "Pailit", "PASAL 240 · PP 35/2021 PASAL 47", w("tidak"), w("satu", 1)),
    row(w("rugi"), 872, "Tutup karena rugi", "2 TAHUN BERTURUT-TURUT · PASAL 237", w("setengah"), w("kali")),
    K.chip(f, { at: w("penuh"), x: 72, y: 1022, text: "PENGALI 0,5 DIHAPUS", red: true, size: 28 }),
    K.box(f, { at: w("kali"), x: 72, y: 1096, w: 888, html: `<div style="font:600 21px/1.35 ${mono};color:${T.ink2}">USAHA MIKRO & KECIL: BESARAN PESANGON SESUAI KESEPAKATAN (PASAL 250)</div>` }),
    K.src(f, { y: 1166, text: "UU 27/2026 Pasal 232, 237, 240, 250 · PP 35/2021 Pasal 40, 44, 47 · Katadata 6 Okt 2026" }),
  );
  return F1.join(K.page(f, D, art), K.head(f, D, { step: 3, label: "BUKTI 2 · PESANGON" }), K.cast(S, f, [{ src: K.CAST.muklis, x: 200, y: 1200, w: 320 }]));
});
