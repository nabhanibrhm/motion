// Larangan (BUKTI 3): the 10 banned PHK reasons of Pasal 230 ayat (1) a-j as a 2x5 grid; the five spoken ones get the
// highlighter on their word. Ayat (2): batal demi hukum.
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const t0 = w("sepuluh");
  const items = [
    ["A", "SAKIT (SURAT DOKTER)", w("sakit")], ["B", "TUGAS NEGARA", null], ["C", "IBADAH", null], ["D", "MENIKAH", w("menikah")],
    ["E", "HAMIL / MENYUSUI", w("hamil")], ["F", "SAUDARA SEKANTOR", null], ["G", "IKUT SERIKAT", w("serikat")],
    ["H", "LAPOR KEJAHATAN", w("melaporkan")], ["I", "AGAMA, SUKU, POLITIK", null], ["J", "CACAT / SAKIT KERJA", null],
  ];
  const grid = items.map(([k, t, hl], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const label = hl != null ? `<span style="${K.hl(f, hl)}">${t}</span>` : t;
    return K.box(f, { at: t0 + 2 * i, x: 72 + col * 452, y: 520 + row * 104, w: 436, html: `<div style="display:flex;gap:14px;align-items:center;padding:16px 18px;border:4px solid ${T.ink};border-radius:12px;background:${T.card}"><span style="font:800 26px ${mono};color:${T.red}">${k}</span><span style="font:700 32px/1 Oswald;white-space:nowrap">${label}</span></div>` });
  }).join("");
  const art = F1.join(
    K.kicker(f, { at: -10, text: "PASAL 230 AYAT (1)" }),
    K.title(f, { at: t0 - 6, y: 300, size: 92, html: `<span style="color:${T.red}">10</span> ALASAN PHK<br>YANG DILARANG` }),
    grid,
    K.chip(f, { at: w("perusahaan"), x: 72, y: 1050, text: "PHK KARENA INI = BATAL DEMI HUKUM", red: true, size: 28 }),
    K.src(f, { at: -10, y: 1120, text: "UU 27/2026 Pasal 230 ayat (1) huruf a-j, ayat (2)" }),
  );
  return F1.join(K.page(f, D, art), K.head(f, D, { step: 4, label: "BUKTI 3 · DILARANG" }), K.cast(S, f, [{ src: K.CAST.nisa, x: 200, y: 1200, w: 320 }]));
});
