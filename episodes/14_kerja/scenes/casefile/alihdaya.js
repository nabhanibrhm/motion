// Alih daya: five numbered tiles land on each named service; Beni's question dims them under a dashed "DI LUAR ITU?";
// on Muklis's "BUMN" the tiles leave and a BUMN -> ANAK USAHA (PT) -> ALIH DAYA chain draws in, PT ringed on "perseroan".
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const bumn = w("BUMN", 1);
  const out = bumn - 10;
  const items = [
    ["01", "sapu", "KEBERSIHAN", "kebersihan"],
    ["02", "piring", "MAKANAN", "makanan"],
    ["03", "perisai", "KEAMANAN", "keamanan"],
    ["04", "bus", "ANGKUTAN PEKERJA", "angkutan"],
    ["05", "helm", "PENUNJANG TAMBANG / MIGAS", "tambang"],
  ];
  const dim = F1.ramp(f, w("luar"), 10);
  const slots = items
    .map((_, i) => K.card(f, { at: w("lima") + 3 * i, out, x: 72 + (i < 4 ? i % 2 : 0) * 461, y: 380 + Math.floor(i / 2) * 205, w: i === 4 ? 888 : 427, h: 180, dashed: true, html: `<div style="font:800 30px 'JetBrains Mono',monospace;color:${T.ink2}">0${i + 1}</div>` }))
    .join("");
  const tiles = items
    .map(([num, icon, big, word], i) => {
      const col = i < 4 ? i % 2 : 0;
      const row = Math.floor(i / 2);
      return K.tile(f, { at: w(word) - 2, out, x: 72 + col * 461, y: 380 + row * 205, w: i === 4 ? 888 : 427, h: 180, num, icon, big, bigSize: 44 });
    })
    .join("");
  const node = (at, x, y, wd, label, sub, fill) =>
    K.card(f, { at, x, y, w: wd, pad: "20px 24px", bg: fill || T.card, html: `<div style="font:700 26px 'JetBrains Mono',monospace;color:${fill ? T.paper : T.ink2}">${sub}</div><div style="font:700 64px/1 Oswald;color:${fill ? T.paper : T.ink};margin-top:6px">${label}</div>` });
  const arrow = (at, y) => {
    const p = F1.ramp(f, at, 8);
    return p <= 0 ? "" : `<div style="position:absolute;left:196px;top:${y}px;width:8px;height:${F1.n(64 * p)}px;background:${T.ink}"></div><div style="position:absolute;left:180px;top:${y + 58}px;width:0;height:0;border-left:20px solid transparent;border-right:20px solid transparent;border-top:26px solid ${T.ink};opacity:${F1.n(p, 3)}"></div>`;
  };
  const art = F1.join(
    K.kicker(f, { text: "PASAL 95-96 · ALIH DAYA", out }),
    K.title(f, { y: 296, size: 66, out, html: `Hanya <span style="color:${T.teal}">5 jasa penunjang</span>` }),
    `<div style="opacity:${F1.n(1 - 0.55 * dim, 3)}">${slots}${tiles}</div>`,
    K.card(f, { at: w("luar"), out, x: 300, y: 1010, w: 480, dashed: true, pad: "14px 24px", html: `<div style="font:700 48px Oswald;color:${T.ink2};text-align:center">DI LUAR ITU?</div>` }),
    K.kicker(f, { at: bumn - 4, y: 250, text: "PASAL 97 · BUMN" }),
    node(bumn, 72, 330, 560, "BUMN", "PERUSAHAAN NEGARA"),
    arrow(w("wajib"), 476),
    node(w("anak"), 72, 570, 700, "ANAK USAHA (PT)", "WAJIB LEWAT", T.teal),
    arrow(w("perseroan") + 6, 716),
    node(w("perseroan") + 10, 72, 810, 620, "JASA PENUNJANG", "HANYA UNTUK"),
    K.pen(f, { at: w("perseroan"), x: 545, y: 650, w: 170, h: 80 }),
    K.src(f, { y: 1170, text: "UU 27/2026 Pasal 95 ayat (2)-(3), Pasal 96, Pasal 97 · Kompas.com Money 12 Okt 2026 · Okezone 9 Okt 2026" }),
  );
  const at = { x: 200, y: 1200, w: 320 };
  return F1.join(K.page(f, D, art), K.head(f, D, { step: 4, label: "ALIH DAYA" }), K.cast(S, f, [{ src: K.CAST.muklis, ...at }, { src: K.CAST.beniKaget, ...at }, { src: K.CAST.muklis, ...at }]));
});
