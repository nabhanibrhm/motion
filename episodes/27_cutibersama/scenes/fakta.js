// Fakta: Kemnaker quote + "tidak wajib" -> two-path card -> comment question -> Pasal 118 page + 12 hari tile.
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const a1 = w("Kalau") - 4;
  const a2 = w("Kantor") - 6;
  const a3 = w("Dasarnya") - 4;
  const one = F1.join(
    K.kicker(f, { at: -10, out: a1, text: "KATA KEMNAKER" }),
    K.title(f, { at: w("perusahaan") - 6, out: a1, y: 300, size: 100, html: `SWASTA<br><span style="color:${T.teal}">TIDAK WAJIB</span><br>IKUT CUTI BERSAMA` }),
    K.card(f, { at: w("Kemnaker"), out: a1, x: 72, y: 800, w: 888, pad: "24px 32px", html: `<div style="font:700 56px/1.05 Oswald">“JAWABANNYA TIDAK DIPAKSA”</div><div style="font:600 24px/1.4 ${mono};color:${T.ink2};margin-top:10px">— Dirjen PHI &amp; Jamsos Kemnaker, via Kompas</div>` }),
  );
  const path = (y, at, tickAt, head, headCol, sub) => K.card(f, { at, out: a2, x: 72, y, w: 888, pad: "22px 32px", html: `<div style="display:flex;align-items:center;gap:26px"><div style="flex:none;width:84px;height:84px">${K.tick(f, { at: tickAt, size: 84, color: T.teal })}</div><div><div style="font:700 26px ${mono};color:${headCol};letter-spacing:1px">${head}</div><div style="font:700 62px/1.05 Oswald;margin-top:6px">${sub}</div></div></div>` });
  const two = F1.join(
    K.kicker(f, { at: a1, out: a2, text: "ARTINYA BUAT KAMU" }),
    path(330, a1, w("utuh"), "KANTOR IKUT CUTI BERSAMA", T.teal, "CUTI TAHUNAN UTUH"),
    K.box(f, { at: w("tidak") + 14, out: a2, x: 72, y: 600, html: `<div style="font:700 40px Oswald;color:${T.ink2}">ATAU</div>` }),
    path(680, w("tidak") + 14, w("berkurang") - 6, "KANTOR TIDAK IKUT", T.ink2, "MASUK BIASA, CUTI UTUH"),
  );
  const chip = (txt, on) => `<div style="flex:1;text-align:center;font:700 60px/1 Oswald;padding:22px 0;border:5px solid ${T.ink};border-radius:12px;background:${on ? T.teal : T.card};color:${on ? T.paper : T.ink}">${txt}</div>`;
  const ask = F1.join(
    K.card(f, { at: a2, out: a3, x: 72, y: 340, w: 888, pad: "30px 34px", html: `<div style="font:700 24px ${mono};color:${T.teal};letter-spacing:2px">PERTANYAAN UNTUKMU</div><div style="font:700 78px/1 Oswald;margin-top:8px">KANTOR KAMU?</div><div style="display:flex;gap:28px;margin-top:26px">${chip("IKUT", true)}${chip("TETAP MASUK", false)}</div>` }),
    K.card(f, { at: w("komentar") - 6, out: a3, x: 72, y: 780, w: 888, bg: T.ink, pad: "22px 32px", html: `<div style="font:700 56px/1.05 Oswald;color:${T.paper}">TULIS DI <span style="color:${T.onInkA}">KOMENTAR</span></div>` }),
  );
  const pasal = F1.join(
    K.kicker(f, { at: a3, text: "DASAR HUKUM" }),
    K.card(f, { at: a3, x: 72, y: 330, w: 888, pad: "26px 34px", html: `<div style="font:700 26px ${mono};color:${T.ink2};letter-spacing:2px">UU 27/2026 · PASAL 118 AYAT (6)</div><div style="font:700 44px/1.2 Oswald;margin-top:12px">PELAKSANAAN CUTI BERSAMA PEMERINTAH <span style="${K.hl(f, w("berlaku") - 4)}">TIDAK MENGURANGI HAK CUTI TAHUNAN</span></div>` }),
    K.chip(f, { at: w("berlaku"), x: 72, y: 660, text: "BERLAKU 28 OKT 2026", teal: true }),
    K.tile(f, { at: w("minimal") - 4, x: 72, y: 760, w: 520, h: 340, num: "PASAL 118 (5)", icon: "kalender", big: "MIN. 12 HARI KERJA", bigSize: 60, small: "SETELAH SETAHUN BEKERJA" }),
  );
  const at = { x: 200, y: 1200, w: 320 };
  const art = F1.join(one, two, ask, pasal, f < a3 ? K.src(f, { at: -10, y: 1160, text: "Kompas 16 Nov · detikJatim 16 Nov" }) : K.src(f, { at: a3, y: 1160, text: "UU 27/2026 Pasal 118 ayat (5)-(6)" }));
  return F1.join(K.page(f, D, art), K.head(f, D, { step: 2, label: "BUKTI 1 · SYARATNYA" }), K.cast(S, f, [{ src: K.CAST.muklis, ...at }, { src: K.CAST.nisa, ...at }, { src: K.CAST.muklis, ...at }]));
});
