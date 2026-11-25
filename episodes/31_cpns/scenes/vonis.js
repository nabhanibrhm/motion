// Vonis: folder summary, KASUS DITUTUP on "ditutup", comment ask on "Tulis", then the title cover with a November calendar (27 ringed).
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const sans = "'Nunito Sans',sans-serif";
  const folder = K.folder(f, {
    at: -12, y: 270, h: 600,
    html: `<div style="font:700 26px ${mono};color:${T.ink2}">BERKAS · ${F1.esc(F1.CONFIG.case.id)}</div><div style="font:700 66px/1.02 Oswald;text-transform:uppercase;margin-top:12px">CPNS 2026<br><span style="${K.hl(f, w("Jumat") + 2)}">dibuka Jumat 27 Nov</span></div><div style="font:700 30px/1.4 ${sans};margin-top:22px"><span style="color:${T.teal}">✓</span> DAFTAR DI SSCASN</div><div style="font:700 30px/1.4 ${sans}"><span style="color:${T.teal}">✓</span> UMUR 18–35 TAHUN</div><div style="font:700 30px/1.4 ${sans}"><span style="color:${T.teal}">✓</span> KEHUTANAN: 70.000 KURSI</div><div style="font:700 30px/1.4 ${sans};color:${T.ink2}"><span style="color:${T.red}">!</span> TANGGAL TUTUP BELUM DIUMUMKAN</div>`,
  });
  const art = F1.join(
    folder,
    K.stamp(f, { at: w("ditutup"), x: 300, y: 870, rot: -7, text: "KASUS DITUTUP", size: 76 }),
    K.card(f, { at: w("Tulis") - 6, x: 72, y: 1030, w: 888, bg: T.ink, pad: "22px 32px", html: `<div style="font:700 24px ${mono};color:${T.paper}">● TULIS DI KOMENTAR</div><div style="font:700 50px/1.1 Oswald;color:${T.paper};margin-top:6px">MAU DAFTAR <span style="color:${T.onInkA}">FORMASI APA?</span></div>` }),
    K.box(f, { at: -10, x: 72, y: 1208, w: 888, html: `<div style="font:600 20px ${mono};color:${T.ink2}">Ringkasan pengumuman 25 Nov 2026. Cek rincian di portal resmi.</div>` }),
  );
  const art2 = `<div style="margin-top:36px;position:relative;height:620px;width:100%">${K.calendar(f, { x: 20, y: 0, w: 840, month: "NOVEMBER 2026", first: 9, last: 30, ring: [27], ringAt: 0, note: "PENDAFTARAN CPNS DIBUKA" })}</div>`;
  return F1.join(
    K.page(f, D, art),
    K.head(f, D, { step: 4, label: "VONIS" }),
    K.cast(S, f, [{ src: K.CAST.nisa, x: 200, y: 1200, w: 320 }]),
    K.cover(f, S, { lines: [{ t: "CPNS 2026" }, { t: "DIBUKA JUMAT", accent: true }, { t: "KAMU BISA DAFTAR?", accent: true }], tag: "70.000 KURSI KEHUTANAN · SSCASN", size: 104, art: art2 }),
  );
});
