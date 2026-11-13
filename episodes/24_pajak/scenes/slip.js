// Slip (BUKTI 1). PMK 105/2025 Lampiran B example payslip: PPh 21 dihitung (tick) -> DTP chip -> dibayar tunai -> diterima utuh.
// Beni's line: the slip leaves, the GAJIMU < RP10 JT? card (YA / TIDAK) lands on "nggak", the comment card on "komentar".
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const q = w("nggak") - 4;
  const row = (l, r, extra = "") => `<div style="display:flex;justify-content:space-between;align-items:center;font:700 40px/1 Oswald;padding:14px 0;border-bottom:3px solid ${T.rule}"><span>${l}</span><span style="display:flex;align-items:center;gap:14px">${extra}${r}</span></div>`;
  const tickBox = `<span style="width:56px;height:56px;display:inline-block">${K.tick(f, { at: w("dihitung"), size: 56 })}</span>`;
  const slip = F1.join(
    K.kicker(f, { at: -10, out: q, text: "CONTOH RESMI DI PMK (BUKAN ANGKAMU)" }),
    K.card(f, { at: -10, out: q, x: 72, y: 310, w: 888, pad: "20px 36px", html: `<div style="display:flex;justify-content:space-between;font:700 24px ${mono};letter-spacing:2px;color:${T.ink2}"><span>SLIP GAJI · TK/0</span><span style="color:${T.teal}">PMK 105/2025</span></div>${row("GAJI", "Rp8.000.000")}${row("PPh 21 DIHITUNG", "Rp120.000", tickBox)}` }),
    K.chip(f, { at: w("menanggung"), out: q, x: 72, y: 640, text: "DITANGGUNG PEMERINTAH (DTP)", teal: true, size: 30 }),
    K.card(f, { at: w("tunai"), out: q, x: 72, y: 730, w: 888, pad: "20px 32px", html: `<div style="display:flex;align-items:center;gap:24px">${K.icon("kantor", 84)}<div><div style="font:700 50px/1.05 Oswald">↳ DIBAYAR TUNAI BERSAMA GAJI</div><div style="font:600 22px ${mono};color:${T.ink2};margin-top:6px">Tidak dihitung sebagai penghasilan kena pajak</div></div></div>` }),
    K.card(f, { at: w("utuh"), out: q, x: 72, y: 920, w: 888, bg: T.ink, pad: "20px 32px", html: `<div style="display:flex;justify-content:space-between;align-items:center"><div style="font:700 60px/1 Oswald;color:${T.paper}">DITERIMA <span style="color:${T.onInkA}">Rp8.000.000</span></div>${K.tick(f, { at: w("utuh") + 4, size: 64, color: T.onInkA })}</div>` }),
    K.box(f, { at: w("utuh") + 8, out: q, x: 72, y: 1070, w: 888, html: `<div style="font:600 22px/1.4 ${mono};color:${T.ink2}">Contoh Lampiran B (aturan 2026). Skema 2027 belum ada.</div>` }),
    f < q ? K.src(f, { at: -10, y: 1166, text: "PMK 105/2025 Pasal 5, Lampiran B · BPK JDIH" }) : "",
  );
  const chip = (txt, on) => `<div style="flex:1;text-align:center;font:700 64px/1 Oswald;padding:22px 0;border:5px solid ${T.ink};border-radius:12px;background:${on ? T.teal : T.card};color:${on ? T.paper : T.ink}">${txt}</div>`;
  const ask = F1.join(
    K.card(f, { at: w("nggak"), x: 72, y: 340, w: 888, pad: "30px 34px", html: `<div style="font:700 24px ${mono};color:${T.teal};letter-spacing:2px">PERTANYAAN BENI</div><div style="font:700 92px/1 Oswald;margin-top:8px;white-space:nowrap">GAJIMU &lt; RP10 JT?</div><div style="display:flex;gap:28px;margin-top:26px">${chip("YA", true)}${chip("TIDAK", false)}</div>` }),
    K.card(f, { at: w("komentar"), x: 72, y: 780, w: 888, bg: T.ink, pad: "22px 32px", html: `<div style="display:flex;align-items:center;gap:24px">${K.icon("dokumen", 80, T.paper)}<div style="font:700 56px/1.05 Oswald;color:${T.paper}">TULIS DI <span style="color:${T.onInkA}">KOMENTAR</span></div></div>` }),
  );
  const at = { x: 200, y: 1200, w: 320 };
  return F1.join(K.page(f, D, F1.join(slip, ask)), K.head(f, D, { step: 2, label: "BUKTI 1 · SLIP GAJIMU" }), K.cast(S, f, [{ src: K.CAST.muklis, ...at }, { src: K.CAST.beni, ...at }]));
});
