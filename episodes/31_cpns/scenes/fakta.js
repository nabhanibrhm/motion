// Fakta: syarat (umur 18-35, SSCASN only, akun != daftar) -> comment question -> formasi breakdown (154.052, kehutanan 70.000, polhut 60.000).
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const a2 = w("Kamu", 1) - 6;
  const a3 = w("Totalnya") - 4;
  const one = F1.join(
    K.kicker(f, { at: -10, out: a2, text: "SYARAT UMUM" }),
    K.title(f, { at: w("umur") - 4, out: a2, y: 300, size: 100, html: `UMUR<br><span style="color:${T.teal}">18–35 TAHUN</span>` }),
    K.box(f, { at: w("melamar") - 4, out: a2, x: 72, y: 520, w: 888, html: `<div style="font:600 24px/1.4 ${mono};color:${T.ink2}">Saat melamar. Jabatan tertentu (dosen, dokter spesialis) s.d. 40 tahun.</div>` }),
    K.card(f, { at: w("portal") - 4, out: a2, x: 72, y: 640, w: 888, pad: "24px 32px", html: `<div style="font:700 24px ${mono};color:${T.ink2};letter-spacing:2px">DAFTAR HANYA DI PORTAL RESMI</div><div style="font:700 60px/1.05 Oswald;margin-top:6px;color:${T.teal}">sscasn.bkn.go.id</div>` }),
    K.card(f, { at: w("akun") - 4, out: a2, x: 72, y: 870, w: 888, bg: T.ink, pad: "22px 32px", html: `<div style="font:700 56px/1.05 Oswald;color:${T.paper}">BIKIN AKUN <span style="color:${T.onInkA}">≠</span> SUDAH DAFTAR</div>` }),
  );
  const chip = (txt, on) => `<div style="flex:1;text-align:center;font:700 46px/1 Oswald;padding:22px 0;border:5px solid ${T.ink};border-radius:12px;background:${on ? T.teal : T.card};color:${on ? T.paper : T.ink}">${txt}</div>`;
  const ask = F1.join(
    K.card(f, { at: a2, out: a3, x: 72, y: 340, w: 888, pad: "30px 34px", html: `<div style="font:700 24px ${mono};color:${T.teal};letter-spacing:2px">PERTANYAAN UNTUKMU</div><div style="font:700 74px/1 Oswald;margin-top:8px">MAU DAFTAR FORMASI APA?</div><div style="display:flex;gap:20px;margin-top:26px">${chip("KEHUTANAN", true)}${chip("DOSEN", false)}${chip("LAINNYA", false)}</div>` }),
    K.card(f, { at: w("komentar") - 6, out: a3, x: 72, y: 800, w: 888, bg: T.ink, pad: "22px 32px", html: `<div style="font:700 56px/1.05 Oswald;color:${T.paper}">TULIS DI <span style="color:${T.onInkA}">KOMENTAR</span></div>` }),
  );
  const bar = (at, y, label, num, pct, col) => K.card(f, { at, x: 72, y, w: 888, pad: "20px 30px", html: `<div style="display:flex;justify-content:space-between;align-items:baseline"><div style="font:700 26px ${mono};color:${T.ink2};letter-spacing:1px">${label}</div><div style="font:700 52px/1 Oswald;color:${col}">${num}</div></div><div style="margin-top:14px;height:22px;border:3px solid ${T.ink};border-radius:6px;overflow:hidden"><div style="height:100%;width:${(pct * F1.ramp(f, at + 4, 14)).toFixed(1)}%;background:${col}"></div></div>` });
  const formasi = F1.join(
    K.kicker(f, { at: a3, text: "RINCIAN FORMASI" }),
    K.tile(f, { at: a3, x: 72, y: 300, w: 888, h: 200, num: "TOTAL", icon: "gedung", big: "154.052 FORMASI", bigSize: 70 }),
    bar(w("Kehutanan") - 4, 540, "KEHUTANAN", "70.000", 45.4, T.teal),
    K.chip(f, { at: w("Kehutanan") + 12, x: 72, y: 700, text: "LULUSAN SMA/SMK – S1", teal: true }),
    bar(w("polisi") - 4, 790, "POLISI KEHUTANAN", "60.000", 38.9, T.teal),
    bar(w("polisi") + 10, 950, "DOSEN & TENDIK PT", "26.614", 17.3, T.ink2),
  );
  const at = { x: 200, y: 1200, w: 320 };
  const art = F1.join(one, ask, formasi, f < a3 ? K.src(f, { at: -10, y: 1160, text: "Kompas TV · Kaltim Post · Bisnis" }) : K.src(f, { at: a3, y: 1160, text: "Antara · Media Indonesia · Kompas TV" }));
  return F1.join(K.page(f, D, art), K.head(f, D, { step: 2, label: "BUKTI 1 · SYARATNYA" }), K.cast(S, f, [{ src: K.CAST.muklis, ...at }, { src: K.CAST.nisa, ...at }, { src: K.CAST.muklis, ...at }]));
});
