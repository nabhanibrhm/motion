// Status (BUKTI 3). Timeline: 28 OKT ticked at start; Menaker quote on "Menaker"; 9 NOV point on "Keuangan";
// NOV-DES "?" point on "Rencananya"; target + status-site chips on "Desember".
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const pt = (at, y, date, text, mark) => K.box(f, { at, x: 72, y, w: 888, html: `<div style="display:flex;gap:24px;align-items:center"><div style="width:44px;height:44px;flex:none;border-radius:22px;border:5px solid ${T.ink};background:${mark === "ok" ? T.teal : T.card};box-sizing:border-box"></div><div><div style="font:700 24px ${mono};color:${mark === "q" ? T.red : T.teal};letter-spacing:2px">${date}</div><div style="font:700 54px/1.02 Oswald">${text}${mark === "q" ? ` <span style="color:${T.red}">?</span>` : ""}</div></div></div>` });
  const rail = `<div style="position:absolute;left:92px;top:340px;width:5px;height:${F1.n(40 + 520 * F1.ramp(f, w("Menaker"), 90, F1.easeOut))}px;background:${T.ink}"></div>`;
  const art = F1.join(
    K.kicker(f, { at: -10, text: "KAPAN CAIRNYA?" }),
    rail,
    pt(-10, 310, "28 OKT", "ATURAN BERLAKU", "ok"),
    K.card(f, { at: w("Menaker"), x: 72, y: 430, w: 888, pad: "22px 30px", html: `<div style="font:700 22px ${mono};color:${T.teal};letter-spacing:2px">MENAKER · 9 NOV 2026</div><div style="font:700 36px/1.25 'Nunito Sans',sans-serif;margin-top:6px">“Sejauh ini prosesnya masih di Kementerian Keuangan.”</div>` }),
    pt(w("Keuangan"), 640, "9 NOV", "ANGGARAN MASIH DI KEMENKEU", "pt"),
    pt(w("Rencananya"), 790, "NOV-DES", "RENCANA CAIR · BELUM ADA TANGGAL", "q"),
    K.chip(f, { at: w("Desember"), x: 72, y: 950, text: "TARGET 13,3 JUTA PEKERJA · HAMPIR RP12 T", size: 24 }),
    K.chip(f, { at: w("Desember") + 8, x: 72, y: 1022, text: "CEK STATUS DI BSU.KEMNAKER.GO.ID: BELUM DIBUKA", size: 22, red: true }),
    K.src(f, { y: 1166, at: w("Desember"), text: "Liputan6 & Aktual 9 Nov · Katadata 30 Sep · bsu.kemnaker.go.id" }),
  );
  return F1.join(K.page(f, D, art), K.head(f, D, { step: 4, label: "BUKTI 3 · KAPAN CAIR?" }), K.cast(S, f, [{ src: K.CAST.nisa, x: 200, y: 1200, w: 320 }]));
});
