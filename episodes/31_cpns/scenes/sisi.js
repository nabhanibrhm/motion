// Sisi: TUTUP BELUM DIUMUMKAN + plan timeline (27 Nov daftar -> Des administrasi -> 2027 tes), then the scam warning card.
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const b2 = w("Hati") - 4;
  const step = (y, at, date, label, col) => K.card(f, { at, out: b2, x: 72, y, w: 888, pad: "18px 30px", html: `<div style="display:flex;align-items:baseline;gap:28px"><div style="flex:none;width:250px;font:800 28px ${mono};color:${col}">${date}</div><div style="font:700 50px/1.05 Oswald">${label}</div></div>` });
  const one = F1.join(
    K.kicker(f, { at: -10, out: b2, text: "YANG BELUM PASTI" }),
    K.card(f, { at: w("tutup") - 4, out: b2, x: 72, y: 300, w: 888, pad: "26px 32px", html: `<div style="font:700 24px ${mono};color:${T.ink2};letter-spacing:2px">TANGGAL TUTUP PENDAFTARAN</div><div style="font:700 80px/1.02 Oswald;margin-top:6px;color:${T.red}">BELUM DIUMUMKAN</div>` }),
    step(560, w("Seleksi") - 4, "27 NOV 2026", "PENDAFTARAN DIBUKA", T.teal),
    step(700, w("administrasi"), "MINGGU 1 DES", "SELEKSI ADMINISTRASI", T.teal),
    step(840, w("Desember") + 6, "AWAL 2027", "TES DIMULAI", T.ink2),
    K.box(f, { at: w("Desember") + 14, out: b2, x: 72, y: 990, w: 888, html: `<div style="font:600 22px/1.4 ${mono};color:${T.ink2}">Jadwal rencana, bisa berubah. Pantau pengumuman resmi.</div>` }),
  );
  const two = F1.join(
    K.kicker(f, { at: b2, text: "HATI-HATI" }),
    K.card(f, { at: w("penipuan") - 4, x: 72, y: 300, w: 888, pad: "28px 34px", html: `<div style="font:700 24px ${mono};color:${T.ink2};letter-spacing:2px">MODUS PENIPUAN</div><div style="position:relative;display:inline-block;font:700 76px/1.02 Oswald;margin-top:8px">“PASTI LULUS,<br>ASAL TRANSFER”${K.strike(f, { at: w("percaya") - 2, x: -6, y: 80, w: 700 })}</div>` }),
    K.stamp(f, { at: w("percaya"), x: 330, y: 610, rot: -7, text: "JANGAN PERCAYA", size: 64 }),
    K.card(f, { at: w("percaya") + 14, x: 72, y: 800, w: 888, bg: T.ink, pad: "22px 32px", html: `<div style="display:flex;align-items:center;gap:24px">${K.icon("perisai", 84, T.paper)}<div style="font:700 50px/1.05 Oswald;color:${T.paper}">CEK HANYA DI <span style="color:${T.onInkA}">PORTAL RESMI</span></div></div>` }),
  );
  const at = { x: 200, y: 1200, w: 320 };
  const art = F1.join(one, two, f < b2 ? K.src(f, { at: -10, y: 1160, text: "Detik · Antara · 25 Nov 2026" }) : K.src(f, { at: b2, y: 1160, text: "Kemenhut via Kaltim Post · Media Indonesia" }));
  return F1.join(K.page(f, D, art), K.head(f, D, { step: 3, label: "BUKTI 2 · SISI LAIN" }), K.cast(S, f, [{ src: K.CAST.nisa, ...at }, { src: K.CAST.muklis, ...at }]));
});
