// Sektor (BUKTI 2). Five sector tiles; the first four tick on "padat" (PADAT KARYA chip), the fifth on "pariwisata",
// checklist after it. On "Desember" everything leaves and the Jan-Des 2026 strip lands with a red ring on DES.
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const q = w("Desember") - 4;
  const svg = (d) => `<svg width="80" height="80" viewBox="0 0 96 96" fill="none" stroke="${T.ink}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" style="display:block">${d}</svg>`;
  const ICO = {
    sepatu: svg('<path d="M10 66V30h16c0 14 10 20 22 22l30 8c6 2 8 6 8 10v4H10z"/><path d="M10 74h76"/>'),
    baju: svg('<path d="M32 14L10 28l10 16 10-6v46h36V38l10 6 10-16L64 14c-3 8-9 12-16 12s-13-4-16-12z"/>'),
    kursi: svg('<path d="M26 10h44v34H26zM20 44h56v14H20zM28 58v28M68 58v28"/>'),
    tas: svg('<rect x="12" y="34" width="72" height="50" rx="8"/><path d="M34 34V22c0-4 3-6 7-6h14c4 0 7 2 7 6v12M12 56h72"/>'),
    hotel: svg('<path d="M14 86V16h42v70M56 40h26v46M8 86h80"/><path d="M26 28h6M40 28h6M26 44h6M40 44h6M26 60h6M40 60h6"/>'),
  };
  const tile = (at, x, y, num, ico, label, tickAt) => K.card(f, { at, out: q, x, y, w: 430, h: 200, pad: "20px 26px", html: `<div style="display:flex;justify-content:space-between;align-items:flex-start"><span style="font:800 30px ${mono};color:${T.teal}">${num}</span>${ico}</div><div style="font:700 42px/1 Oswald;margin-top:12px">${label}</div>${K.tick(f, { at: tickAt, abs: true, x: 280, y: 18, size: 66 })}` });
  const tiles = F1.join(
    K.kicker(f, { at: -10, out: q, text: "5 SEKTOR YANG DAPAT (2026)" }),
    tile(-10, 72, 310, "01", ICO.sepatu, "ALAS KAKI", w("padat")),
    tile(-6, 530, 310, "02", ICO.baju, "TEKSTIL & PAKAIAN JADI", w("padat")),
    tile(-2, 72, 540, "03", ICO.kursi, "FURNITUR", w("padat")),
    tile(2, 530, 540, "04", ICO.tas, "KULIT & BARANG KULIT", w("padat")),
    tile(6, 72, 770, "05", ICO.hotel, "PARIWISATA", w("pariwisata")),
    K.chip(f, { at: w("padat") + 4, out: q, x: 540, y: 810, text: "01-04 = PADAT KARYA", teal: true, size: 28 }),
    K.box(f, { at: w("pariwisata") + 8, out: q, x: 72, y: 990, w: 888, html: `<div style="font:600 22px/1.45 ${mono};color:${T.ink2}">Hotel, restoran, agen perjalanan.<br>Pegawai tetap: gaji tetap ≤ Rp10 jt (Jan 2026) · tidak tetap: ≤ Rp500 rb/hari.<br>NPWP/NIK terintegrasi DJP · KLU kantor ada di lampiran.</div>` }),
    f < q ? K.src(f, { at: -10, y: 1166, text: "PMK 105/2025 Pasal 2-4, Lampiran A · DJP" }) : "",
  );
  const months = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];
  const cells = months.map((m, i) => `<div style="position:relative;text-align:center;padding:16px 0;border:3px solid ${T.ink};border-radius:8px;background:${i === 11 ? T.paper2 : T.card};font:700 34px/1 ${mono}">${m}${i === 11 ? K.pen(f, { at: w("Desember") + 2, x: 4, y: 6, w: 100, h: 34, sw: 7 }) : ""}</div>`).join("");
  const cal = F1.join(
    K.card(f, { at: w("Desember"), x: 72, y: 330, w: 888, pad: "26px 32px", html: `<div style="font:700 32px/1 Oswald;letter-spacing:2px">MASA PAJAK 2026</div><div style="display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin-top:20px">${cells}</div>` }),
    K.title(f, { at: w("Desember") + 8, y: 700, size: 100, lh: 0.98, html: `ATURAN 2026<br><span style="color:${T.teal}">BERAKHIR DESEMBER</span>` }),
    K.chip(f, { at: w("Desember") + 16, x: 72, y: 930, text: "SETELAH ITU: PERLU ATURAN BARU", red: true, size: 28 }),
    K.src(f, { at: w("Desember") + 16, y: 1166, text: "PMK 105/2025 Pasal 2 ayat (3)" }),
  );
  return F1.join(K.page(f, D, F1.join(tiles, cal)), K.head(f, D, { step: 3, label: "BUKTI 2 · ATURAN 2026" }), K.cast(S, f, [{ src: K.CAST.muklis, x: 200, y: 1200, w: 320 }]));
});
