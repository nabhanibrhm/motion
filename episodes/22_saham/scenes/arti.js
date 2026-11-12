// Arti (BUKAN DELISTING). Three checklist rows tick on "tercatat", "dibeli", "pelanggaran"; BEI's disclaimer quote on
// "menegaskan".
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const art = F1.join(
    K.kicker(f, { at: -10, text: "APA ARTINYA BUAT PEMEGANG SAHAM?" }),
    K.title(f, { at: -10, y: 300, size: 76, lh: 1, html: `Keluar dari hitungan,<br><span style="color:${T.teal}">bukan dari bursa</span>` }),
    K.checkRow(f, { at: -6, tick: w("tercatat"), y: 500, label: "TETAP TERCATAT", sub: "BUKAN DELISTING" }),
    K.checkRow(f, { at: -2, tick: w("dibeli"), y: 640, label: "BISA DIPERDAGANGKAN", sub: "BELI DAN JUAL SEPERTI BIASA" }),
    K.checkRow(f, { at: 2, tick: w("pelanggaran"), y: 780, label: "BUKAN TANDA PELANGGARAN", sub: "MENURUT PENGUMUMAN BEI" }),
    K.card(f, { at: w("menegaskan"), x: 72, y: 950, w: 888, pad: "22px 30px", html: `<div style="font:700 22px ${mono};color:${T.teal};letter-spacing:2px">KUTIPAN PENGUMUMAN BEI</div><div style="font:700 32px/1.25 'Nunito Sans',sans-serif;margin-top:8px">“…tidak serta merta menunjukkan adanya pelanggaran terhadap peraturan perundang-undangan.”</div>` }),
    K.src(f, { y: 1166, text: "Pengumuman BEI 11 Nov 2026 (via kumparan, CNBC Indonesia) · investortrust 27 Okt" }),
  );
  return F1.join(K.page(f, D, art), K.head(f, D, { step: 4, label: "BUKAN DELISTING" }), K.cast(S, f, [{ src: K.CAST.nisa, x: 200, y: 1200, w: 320 }]));
});
