// Kontrak: a 0-5 year axis; 2 TAHUN builds on "dua", +1 on the second "dua", +1 on "satu"; the big 4 TAHUN lands on
// "empat" with a pen ring; on "turun" the dashed 5-year ghost bar and a red TURUN 1 TAHUN chip.
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const n = F1.n;
  const X0 = 72;
  const U = 170;
  const Y = 470;
  const seg = (at, x, units, label, fill, color) => {
    const p = F1.ramp(f, at, 14, F1.expoOut);
    if (p <= 0) return "";
    return `<div style="${F1.css({ position: "absolute", left: x, top: Y, width: n(units * U * p), height: 110, boxSizing: "border-box", background: fill, color, border: `4px solid ${T.ink}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontFamily: "Oswald", fontWeight: 700, fontSize: 52, whiteSpace: "nowrap" })}">${p > 0.6 ? label : ""}</div>`;
  };
  let axis = "";
  for (let k = 0; k <= 5; k++) axis += `<div style="position:absolute;left:${X0 + k * U - 3}px;top:${Y + 120}px;width:6px;height:18px;background:${T.ink}"></div><div style="position:absolute;left:${X0 + k * U - 20}px;top:${Y + 144}px;width:40px;text-align:center;font:700 26px 'JetBrains Mono',monospace">${k}</div>`;
  const gh = F1.ramp(f, w("turun"), 12, F1.expoOut);
  const big = F1.ramp(f, w("empat"), 10, F1.backOut);
  const art = F1.join(
    K.kicker(f, { text: "PASAL 82 AYAT (2) · PKWT" }),
    K.title(f, { y: 300, size: 66, html: "Masa kontrak paling lama" }),
    `<div style="position:absolute;left:${X0}px;top:${Y + 116}px;width:${5 * U}px;height:5px;background:${T.ink}"></div>${axis}`,
    seg(w("dua"), X0, 2, "2 TAHUN", T.teal, T.paper),
    seg(w("dua", 1), X0 + 2 * U, 1, "+1", T.card, T.ink),
    seg(w("satu"), X0 + 3 * U, 1, "+1", T.card, T.ink),
    gh > 0 ? `<div style="${F1.css({ position: "absolute", left: X0, top: Y + 210, width: 5 * U, height: 90, boxSizing: "border-box", border: `4px dashed ${T.ink2}`, borderRadius: 10, display: "flex", alignItems: "center", paddingLeft: 26, fontFamily: "Oswald", fontWeight: 700, fontSize: 44, color: T.ink2, opacity: n(gh, 3), transform: `translateY(${n(-30 * (1 - gh))}px)` })}">SEBELUMNYA 5 TAHUN · PP 35/2021</div>` : "",
    big > 0 ? `<div style="${F1.css({ position: "absolute", left: 72, top: 820, transformOrigin: "0 50%", transform: `scale(${n(0.7 + 0.3 * big, 3)})`, opacity: n(Math.min(1, big), 3), fontFamily: "Oswald", fontWeight: 700, fontSize: 260, lineHeight: 1, color: T.teal, whiteSpace: "nowrap" })}">4<span style="font-size:110px;color:${T.ink};margin-left:22px">TAHUN TOTAL</span></div>` : "",
    K.pen(f, { at: w("empat") + 4, x: 66, y: 850, w: 150, h: 220 }),
    K.chip(f, { at: w("turun") + 8, x: 620, y: 1095, text: "TURUN 1 TAHUN", red: true, rot: 4, size: 32 }),
    K.src(f, { y: 1170, text: "UU 27/2026 Pasal 82 ayat (2) · PP 35/2021 Pasal 8 ayat (1) · Kompas.com 7 Nov 2026" }),
  );
  return F1.join(K.page(f, D, art), K.head(f, D, { step: 3, label: "KONTRAK" }), K.cast(S, f, [{ src: K.CAST.muklis, x: 200, y: 1200, w: 320 }]));
});
