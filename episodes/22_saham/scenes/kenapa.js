// Kenapa (BUKTI 2). Beni's question card, then the criterion: ten holders light up on "Sepuluh", the donut fills to 92,5%
// on "menguasai".
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const tA = w("Kepemilikannya");
  const fill = 92.5 * F1.ramp(f, w("menguasai"), 22, F1.easeOut);
  let people = "";
  for (let i = 0; i < 10; i++) {
    const p = F1.ramp(f, w("Sepuluh") + i * 1.5, 8, F1.expoOut);
    people += `<div style="width:70px;opacity:${F1.n(0.25 + 0.75 * p, 3)}"><svg width="70" height="90" viewBox="0 0 64 84" fill="${p > 0.5 ? T.teal : "none"}" stroke="${T.ink}" stroke-width="4"><circle cx="32" cy="20" r="14"/><path d="M6 80c0-18 11-30 26-30s26 12 26 30z"/></svg></div>`;
  }
  const pct = fill > 0.5 ? `${(Math.round(fill * 10) / 10).toFixed(1).replace(".", ",")}%` : "";
  const donut = `<div style="position:relative;width:340px;height:340px;flex:none;border-radius:170px;background:conic-gradient(${T.teal} 0 ${F1.n(fill, 2)}%, ${T.paper2} ${F1.n(fill, 2)}% 100%);border:5px solid ${T.ink};box-sizing:border-box"><div style="position:absolute;left:70px;top:70px;width:190px;height:190px;border-radius:95px;box-sizing:border-box;background:${T.card};border:5px solid ${T.ink};display:flex;align-items:center;justify-content:center;font:700 52px/1 Oswald;color:${T.ink}">${pct}</div></div>`;
  const art = F1.join(
    K.card(f, { at: -10, out: tA, x: 72, y: 380, w: 888, bg: T.ink, pad: "36px 40px", html: `<div style="font:700 26px ${mono};color:${T.paper}">● PERTANYAAN</div><div style="font:700 80px/1.05 Oswald;color:${T.paper};margin-top:12px">SAHAM-SAHAM ITU<br><span style="color:${T.onInkB}">SALAH APA?</span></div>` }),
    K.kicker(f, { at: tA, text: "KRITERIA HSC · KOMITE HSC 10 NOV 2026" }),
    K.title(f, { at: tA, y: 300, size: 76, lh: 1, html: `Kepemilikan<br>terlalu terkumpul` }),
    K.box(f, { at: tA + 4, x: 72, y: 490, w: 888, html: `<div style="display:flex;gap:12px">${people}</div><div style="font:700 26px ${mono};color:${T.ink2};margin-top:10px;letter-spacing:1px">≤ 10 PEMEGANG SAHAM</div>` }),
    K.box(f, { at: tA + 8, x: 72, y: 690, w: 888, html: `<div style="display:flex;gap:40px;align-items:center">${donut}<div><div style="font:700 64px/1 Oswald">≥ 92,5%</div><div style="font:700 24px/1.4 ${mono};color:${T.ink2};margin-top:12px">SAHAMNYA DIKUASAI<br>≤ 10 PIHAK</div></div></div>` }),
    K.src(f, { y: 1166, text: "Komite HSC 10 Nov · data kepemilikan per 30 Okt 2026 (Liputan6, Kompas, CNBC Indonesia)" }),
  );
  const at = { x: 200, y: 1200, w: 320 };
  return F1.join(K.page(f, D, art), K.head(f, D, { step: 3, label: "BUKTI 2 · KRITERIA" }), K.cast(S, f, [{ src: K.CAST.beni, ...at }, { src: K.CAST.muklis, ...at }]));
});
