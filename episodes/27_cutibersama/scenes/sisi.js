// Sisi: SKB Sept vs UU 28 Okt timeline, 8 hari tile, strike on old rule, BELUM ADA PENYESUAIAN, then cek HRD.
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const b2 = w("Sampai") - 4;
  const node = (x, at, date, label, col) => K.card(f, { at, out: b2, x, y: 560, w: 430, pad: "20px 26px", bg: T.card, html: `<div style="font:800 26px ${mono};color:${col}">${date}</div><div style="font:700 46px/1.05 Oswald;margin-top:6px">${label}</div>` });
  const one = F1.join(
    K.kicker(f, { at: -10, out: b2, text: "MASALAHNYA" }),
    node(72, w("lewat"), "15 SEP 2026", "SKB CUTI BERSAMA 2027", T.ink2),
    K.box(f, { at: w("sebelum"), out: b2, x: 505, y: 640, html: `<div style="font:700 56px Oswald;color:${T.ink2}">→</div>` }),
    node(530, w("sebelum") + 2, "28 OKT 2026", "UU 27/2026 BERLAKU", T.teal),
    K.tile(f, { at: w("Masalahnya"), out: b2, x: 72, y: 330, w: 888, h: 190, num: "SKB", icon: "kalender", big: "8 HARI CUTI BERSAMA 2027", bigSize: 66 }),
    K.card(f, { at: w("Menaker"), out: w("belum") + 10, x: 72, y: 830, w: 888, pad: "24px 32px", html: `<div style="font:700 24px ${mono};color:${T.ink2};letter-spacing:2px">KATA MENAKER, SAAT ITU</div><div style="position:relative;display:inline-block;font:700 70px/1.05 Oswald;margin-top:6px">MENGURANGI CUTI TAHUNAN${K.strike(f, { at: w("mengurangi") + 6, x: -6, y: 36, w: 740 })}</div>` }),
  );
  const two = F1.join(
    K.chip(f, { at: w("Sampai"), x: 72, y: 250, text: "PER 17 NOV 2026" }),
    K.card(f, { at: w("Sampai") + 3, x: 72, y: 340, w: 888, pad: "28px 34px", html: `<div style="font:700 80px/1.02 Oswald">BELUM ADA<br><span style="color:${T.teal}">PENYESUAIAN</span></div><div style="font:600 24px/1.4 ${mono};color:${T.ink2};margin-top:10px">Belum ada pengumuman penyesuaian untuk 2027.</div>` }),
    K.card(f, { at: w("Jadi"), x: 72, y: 760, w: 888, bg: T.ink, pad: "22px 32px", html: `<div style="display:flex;align-items:center;gap:24px">${K.icon("dokumen", 84, T.paper)}<div style="font:700 52px/1.05 Oswald;color:${T.paper}">CEK <span style="color:${T.onInkA}">PERATURAN PERUSAHAAN</span></div></div>` }),
    K.card(f, { at: w("tanya"), x: 72, y: 930, w: 888, bg: T.ink, pad: "22px 32px", html: `<div style="display:flex;align-items:center;gap:24px">${K.icon("kantor", 84, T.paper)}<div style="font:700 56px/1.05 Oswald;color:${T.paper}">ATAU <span style="color:${T.onInkA}">TANYA HRD</span></div></div>` }),
  );
  const at = { x: 200, y: 1200, w: 320 };
  const art = F1.join(one, two, K.src(f, { at: -10, y: 1160, text: "Kemnaker 15 Sep · Harian Jogja 9 Nov · UU 27/2026" }));
  return F1.join(K.page(f, D, art), K.head(f, D, { step: 3, label: "BUKTI 2 · SISI LAIN" }), K.cast(S, f, [{ src: K.CAST.nisa, ...at }, { src: K.CAST.muklis, ...at }]));
});
