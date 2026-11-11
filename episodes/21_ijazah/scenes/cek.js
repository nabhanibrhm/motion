// Cek (CEK HAK KAMU). Calendar 28 OKT 2026 (berlaku) is on screen from frame 0; on "peraturan" the second calendar,
// 28 OKT 2027 (batas aturan turunan), lands and "Oktober" rings its day; the checklist ticks on "ijazah" and "pesangon".
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const side = (at, y, pasal, date, sub) =>
    K.card(f, { at, x: 620, y, w: 340, h: 243, pad: "24px 28px", html: `<div style="font:700 24px ${mono};color:${T.teal};letter-spacing:2px">${pasal}</div><div style="font:700 46px/1 Oswald;margin-top:10px;white-space:nowrap">${date}</div><div style="font:700 34px/1.05 Oswald;color:${T.teal};margin-top:10px">${sub}</div>` });
  const cal2 = w("peraturan");
  const art = F1.join(
    K.kicker(f, { at: -10, text: "KAPAN BERLAKU, KAPAN RINCIANNYA?" }),
    K.calendar(f, { x: 72, y: 300, w: 520, month: "OKTOBER 2026", first: 22, last: 31, ring: [28], ringAt: 8, note: "BERLAKU" }),
    side(-8, 300, "PASAL 313", "28 OKT 2026", "BERLAKU"),
    K.box(f, { at: cal2, x: 0, y: 0, html: K.calendar(f, { x: 72, y: 570, w: 520, month: "OKTOBER 2027", first: 22, last: 31, ring: [28], ringAt: w("Oktober"), note: "BATAS" }) }),
    side(cal2 + 3, 570, "PASAL 312", "28 OKT 2027", "BATAS ATURAN TURUNAN"),
    K.checkRow(f, { at: w("jadi"), tick: w("ijazah"), y: 845, label: "PASAL SERAH IJAZAH ASLI?", sub: "TIDAK BOLEH (KECUALI PELATIHAN DIBIAYAI, TERTULIS)" }),
    K.checkRow(f, { at: w("jadi") + 4, tick: w("pesangon"), y: 985, label: "ALASAN PHK & PENGALINYA", sub: "PASAL 232, 237, 240" }),
    K.src(f, { y: 1166, text: "UU 27/2026 Pasal 253 ayat (5), 312, 313 · Bukan nasihat hukum · naskah: peraturan.bpk.go.id" }),
  );
  return F1.join(K.page(f, D, art), K.head(f, D, { step: 5, label: "CEK HAK KAMU" }), K.cast(S, f, [{ src: K.CAST.nisa, x: 200, y: 1200, w: 320 }]));
});
