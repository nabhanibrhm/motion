// Waspada (BUKTI 4). Stamp "tanpa pendaftaran mandiri" on "pendaftaran"; fake-message card with a blacked-out link, struck, on "tautan";
// GRATIS row ticks on "biaya"; the two official .go.id sites tick on "resmi".
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const site = (at, d, sub) => `<div style="display:flex;gap:20px;align-items:center;margin-top:10px"><div style="width:60px;height:60px;flex:none;border:5px solid ${T.ink};border-radius:10px;background:${T.card};display:flex;align-items:center;justify-content:center">${K.tick(f, { at, size: 50 })}</div><div><div style="font:700 34px ${mono};color:${T.teal}">${d}</div><div style="font:600 22px ${mono};color:${T.ink2}">${sub}</div></div></div>`;
  const art = F1.join(
    K.kicker(f, { at: -10, text: "WASPADA TAUTAN PALSU" }),
    K.stamp(f, { at: w("pendaftaran"), x: 72, y: 330, rot: -4, text: "TANPA PENDAFTARAN", sub: "MANDIRI", size: 84 }),
    K.card(f, { at: w("tautan"), x: 72, y: 600, w: 888, pad: "22px 30px", html: `<div style="font:700 22px ${mono};color:${T.ink2};letter-spacing:2px">PESAN MENCURIGAKAN (CONTOH)</div><div style="font:700 36px/1.25 'Nunito Sans',sans-serif;margin-top:6px">“Daftar BSU sekarang, isi data di sini:”</div><div style="height:46px;width:520px;background:${T.ink};border-radius:4px;margin-top:12px"></div>` }),
    K.strike(f, { at: w("tautan") + 14, x: 60, y: 760, w: 912, tilt: -2 }),
    K.checkRow(f, { at: w("biaya") - 10, tick: w("biaya"), y: 800, label: "GRATIS · TANPA BIAYA" }),
    K.card(f, { at: w("resmi") - 4, x: 72, y: 950, w: 888, pad: "18px 28px", html: `<div style="font:700 22px ${mono};color:${T.ink2};letter-spacing:2px">SITUS RESMI PEMERINTAH</div>${site(w("resmi") + 2, "bsu.kemnaker.go.id", "INFO &amp; CEK STATUS")}${site(w("resmi") + 10, "bsu.bpjsketenagakerjaan.go.id", "DATA PESERTA")}` }),
    K.src(f, { y: 1166, at: w("resmi"), text: "bsu.bpjsketenagakerjaan.go.id (tanya jawab) · Kemnaker" }),
  );
  return F1.join(K.page(f, D, art), K.head(f, D, { step: 5, label: "BUKTI 4 · WASPADA TAUTAN" }), K.cast(S, f, [{ src: K.CAST.muklis, x: 200, y: 1200, w: 320 }]));
});
