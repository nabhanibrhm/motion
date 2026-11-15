// Syarat (BUKTI 2): PHK baru sah jika ada KESEPAKATAN atau PUTUSAN PHI berkekuatan hukum tetap (Pasal 228 ayat 3-7).
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const art = F1.join(
    K.kicker(f, { at: -10, text: "SYARAT PHK YANG SAH" }),
    K.title(f, { at: -10, y: 300, size: 96, html: `PHK BARU SAH<br>JIKA ADA:` }),
    K.checkRow(f, { at: w("kesepakatan") - 6, tick: w("kesepakatan"), y: 540, label: "KESEPAKATAN", sub: "Perusahaan dan pekerja setuju" }),
    K.box(f, { at: w("atau") - 2, x: 72, y: 690, html: `<div style="font:700 40px Oswald;color:${T.teal}">ATAU</div>` }),
    K.checkRow(f, { at: w("putusan") - 6, tick: w("tetap"), y: 760, label: "PUTUSAN PHI INKRACHT", sub: "Berkekuatan hukum tetap" }),
    K.box(f, { at: w("tetap") + 6, x: 72, y: 940, w: 888, html: `<div style="font:600 24px/1.45 ${mono};color:${T.ink2}">Sebelumnya: perundingan bipartit, paling lama 30 hari kerja.<br>Gagal? Lanjut ke jalur PHI.</div>` }),
    K.src(f, { at: -10, y: 1120, text: "UU 27/2026 Pasal 228 ayat (3)-(7)" }),
  );
  return F1.join(K.page(f, D, art), K.head(f, D, { step: 3, label: "BUKTI 2 · SYARAT" }), K.cast(S, f, [{ src: K.CAST.muklis, x: 200, y: 1200, w: 320 }]));
});
