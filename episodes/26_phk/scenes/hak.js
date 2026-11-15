// Hak (BUKTI 1): wajib dipekerjakan kembali (Pasal 228 ayat 7) -> pengusaha menolak bisa dipidana (Pasal 294) ->
// TIDAK OTOMATIS: lewat jalur PHI. Nisa question card on "pernah", comment card on "komentar".
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const q = w("pernah") - 4;
  const hak = F1.join(
    K.kicker(f, { at: -10, out: q, text: "ARTINYA BUAT KAMU" }),
    K.title(f, { at: w("mempekerjakan") - 6, out: q, y: 300, size: 88, lh: 1, html: `PERUSAHAAN WAJIB<br><span style="color:${T.teal}">MEMPEKERJAKAN<br>KAMU KEMBALI</span>` }),
    K.card(f, { at: w("dipidana"), out: q, x: 72, y: 620, w: 888, bg: T.ink, pad: "22px 32px", html: `<div style="display:flex;align-items:center;gap:24px">${K.icon("palu", 84, T.paper)}<div><div style="font:700 52px/1.05 Oswald;color:${T.paper}">MENOLAK? <span style="color:${T.onInkA}">BISA DIPIDANA</span></div><div style="font:600 22px ${mono};color:${T.paper};opacity:.8;margin-top:6px">Penjara dan/atau denda · Pasal 294</div></div></div>` }),
    K.chip(f, { at: w("otomatis"), out: q, x: 72, y: 820, text: "TAPI TIDAK OTOMATIS", red: true, size: 34 }),
    K.card(f, { at: w("industrial") - 8, out: q, x: 72, y: 910, w: 888, pad: "20px 32px", html: `<div style="display:flex;align-items:center;gap:24px">${K.icon("dokumen", 80)}<div><div style="font:700 46px/1.05 Oswald">DITUNTUT LEWAT JALUR PHI</div><div style="font:600 22px ${mono};color:${T.ink2};margin-top:6px">Perselisihan hubungan industrial</div></div></div>` }),
    f < q ? K.src(f, { at: -10, y: 1120, text: "UU 27/2026 Pasal 228 ayat (7), Pasal 294 · bukan nasihat hukum" }) : "",
  );
  const chip = (txt, on) => `<div style="flex:1;text-align:center;font:700 64px/1 Oswald;padding:22px 0;border:5px solid ${T.ink};border-radius:12px;background:${on ? T.teal : T.card};color:${on ? T.paper : T.ink}">${txt}</div>`;
  const ask = F1.join(
    K.card(f, { at: w("pernah"), x: 72, y: 340, w: 888, pad: "30px 34px", html: `<div style="font:700 24px ${mono};color:${T.teal};letter-spacing:2px">PERTANYAAN UNTUKMU</div><div style="font:700 70px/1 Oswald;margin-top:8px;white-space:nowrap">PERNAH DI-PHK SEPIHAK?</div><div style="display:flex;gap:28px;margin-top:26px">${chip("PERNAH", true)}${chip("BELUM", false)}</div>` }),
    K.card(f, { at: w("komentar"), x: 72, y: 780, w: 888, bg: T.ink, pad: "22px 32px", html: `<div style="display:flex;align-items:center;gap:24px">${K.icon("dokumen", 80, T.paper)}<div style="font:700 56px/1.05 Oswald;color:${T.paper}">TULIS DI <span style="color:${T.onInkA}">KOMENTAR</span></div></div>` }),
  );
  const at = { x: 200, y: 1200, w: 320 };
  return F1.join(K.page(f, D, F1.join(hak, ask)), K.head(f, D, { step: 2, label: "BUKTI 1 · HAKMU" }), K.cast(S, f, [{ src: K.CAST.muklis, ...at }, { src: K.CAST.nisa, ...at }]));
});
