// Syarat (BUKTI 1). Checklist ticks on "aktif", "gajimu", the UMK card on "daerahmu", ASN/TNI/Polri struck on "bukan".
// Beni's line: the checklist leaves on "masuk", the KAMU MASUK? card (YA / TIDAK) lands, comment card on "jawabanmu".
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const q = w("masuk") - 4;
  const row = (o) => K.checkRow(f, { out: q, ...o });
  const list = F1.join(
    K.kicker(f, { at: -10, out: q, text: "SYARAT PENERIMA BSU" }),
    row({ at: -10, tick: -4, y: 310, label: "WNI, PUNYA NIK" }),
    row({ at: -4, tick: w("aktif"), y: 436, label: "PESERTA AKTIF BPJS TK", sub: "S.D. AGUSTUS 2026" }),
    row({ at: w("gajimu") - 14, tick: w("gajimu"), y: 562, label: "GAJI MAKS. RP3,5 JUTA", sub: "UPAH PER BULAN" }),
    K.card(f, { at: w("daerahmu"), out: q, x: 72, y: 700, w: 888, pad: "18px 28px", html: `<div style="font:700 24px ${mono};color:${T.teal};letter-spacing:2px">UMK/UMP DI ATAS RP3,5 JT?</div><div style="font:700 28px/1.3 'Nunito Sans',sans-serif;margin-top:6px">Batasnya UMK, dibulatkan ke atas. Contoh: Jakarta Rp5,8 jt · Batam Rp5,4 jt</div>` }),
    row({ at: w("bukan") - 12, tick: 1e9, y: 880, label: "ASN · TNI · POLRI", sub: "DIKECUALIKAN" }),
    f < q ? K.strike(f, { at: w("bukan") + 2, x: 150, y: 922, w: 520 }) : "",
    K.box(f, { at: w("bukan") + 10, out: q, x: 72, y: 1020, w: 888, html: `<div style="font:600 22px ${mono};color:${T.ink2}">Diprioritaskan: yang tidak sedang menerima PKH</div>` }),
    f < q ? K.src(f, { at: w("bukan") + 10, y: 1166, text: "Permenaker 16/2026 Pasal 3-4 + Lampiran · bsu.kemnaker.go.id" }) : "",
  );
  const chip = (txt, on) => `<div style="flex:1;text-align:center;font:700 64px/1 Oswald;padding:22px 0;border:5px solid ${T.ink};border-radius:12px;background:${on ? T.teal : T.card};color:${on ? T.paper : T.ink}">${txt}</div>`;
  const ask = F1.join(
    K.card(f, { at: w("masuk"), x: 72, y: 340, w: 888, pad: "30px 34px", html: `<div style="font:700 24px ${mono};color:${T.teal};letter-spacing:2px">PERTANYAAN BENI</div><div style="font:700 120px/1 Oswald;margin-top:8px">KAMU MASUK?</div><div style="display:flex;gap:28px;margin-top:26px">${chip("YA", true)}${chip("TIDAK", false)}</div>` }),
    K.card(f, { at: w("jawabanmu"), x: 72, y: 780, w: 888, bg: T.ink, pad: "22px 32px", html: `<div style="display:flex;align-items:center;gap:24px">${K.icon("dokumen", 80, T.paper)}<div style="font:700 56px/1.05 Oswald;color:${T.paper}">TULIS DI <span style="color:${T.onInkA}">KOMENTAR</span></div></div>` }),
  );
  const at = { x: 200, y: 1200, w: 320 };
  return F1.join(K.page(f, D, F1.join(list, ask)), K.head(f, D, { step: 2, label: "BUKTI 1 · SYARAT" }), K.cast(S, f, [{ src: K.CAST.muklis, ...at }, { src: K.CAST.beni, ...at }]));
});
