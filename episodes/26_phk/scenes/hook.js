// Hook (casefile look). Frame 0 shows the claim: title PHK TANPA KESEPAKATAN / BATAL DEMI HUKUM? and the PHK letter card.
// Highlighter on BATAL DEMI HUKUM at "batal", BATAL stamp on the letter at "hukum", pasal chip after it.
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const letter = K.card(f, {
    at: -20, x: 72, y: 640, w: 888, h: 360, rot: -2, pad: "26px 40px",
    html: `<div style="font:700 24px ${mono};letter-spacing:2px;color:${T.ink2}">SURAT PEMUTUSAN HUBUNGAN KERJA</div><div style="height:6px;background:${T.teal};margin-top:14px"></div><div style="font:700 52px/1.15 Oswald;margin-top:20px">KAMU DI-PHK<br>MULAI HARI INI.</div><div style="font:600 24px/1.5 ${mono};color:${T.ink2};margin-top:16px">Kesepakatan: - &nbsp;·&nbsp; Putusan PHI: -</div>`,
  });
  const art = F1.join(
    K.chip(f, { at: -20, x: 72, y: 250, text: "KLAIM · UU KETENAGAKERJAAN BARU", teal: true, size: 26 }),
    K.title(f, { at: -20, y: 322, size: 96, lh: 0.98, html: `PHK TANPA<br>KESEPAKATAN<br><span style="${K.hl(f, w("batal"))}">BATAL DEMI HUKUM?</span>` }),
    letter,
    K.stamp(f, { at: w("hukum"), x: 470, y: 820, rot: -8, text: "BATAL", size: 92 }),
    K.chip(f, { at: w("baru"), x: 72, y: 1050, text: "UU 27/2026 PASAL 228 AYAT (7)", size: 26, red: true }),
    K.src(f, { y: 1120, at: w("hukum") + 6, text: "UU 27/2026 (berlaku 28 Okt 2026) · BPK JDIH" }),
  );
  return F1.join(K.page(f, D, art, { slide: false }), K.head(f, D, { step: 1, label: "LAPORAN MASUK" }), K.cast(S, f, [{ src: K.CAST.nisa, x: 200, y: 1200, w: 320, at: -20 }]));
});
