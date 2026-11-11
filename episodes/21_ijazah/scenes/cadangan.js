// Cadangan (BUKTI 3). Beni: the building tile, struck and stamped TUTUP on "bangkrut", then "uang siapa?".
// Muklis: the Pasal 253 folder card (highlighter on "wajib menyediakan"), "dikelola lembaga pemerintah" (perisai),
// micro and small business struck out on "mikro", then the four sanctions tick in, the last one red on "pencabutan".
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const muk = F1.line(S, 1).start;
  const oB = muk - 6;
  const sanc = ["PERINGATAN TERTULIS", "PEMBATASAN", "PENGHENTIAN SEMENTARA", "PENCABUTAN IZIN"];
  const sAt = [w("sanksi"), w("sanksi") + 5, w("sanksi") + 10, w("pencabutan")];
  const sBox = sanc.map((t, i) => {
    const red = i === 3;
    return K.box(f, {
      at: sAt[i], x: 72 + i * 227, y: 1004, w: 207, h: 132, frames: 8,
      style: { padding: "14px 14px", background: T.card, border: `4px solid ${red ? T.red : T.ink}`, borderRadius: 14, boxShadow: `6px 6px 0 ${red ? T.red : T.shadow}` },
      html: `<div style="font:800 24px ${mono};color:${red ? T.red : T.teal}">${i + 1}</div><div style="font:700 28px/1.05 Oswald;margin-top:8px;color:${red ? T.red : T.ink}">${t}</div>`,
    });
  });
  const art = F1.join(
    // Beni
    K.kicker(f, { at: -10, out: oB, text: "KALAU PERUSAHAAN BANGKRUT" }),
    K.tile(f, { at: -8, out: oB, x: 72, y: 310, w: 888, h: 300, num: "?", icon: "gedung", big: "PERUSAHAAN", bigSize: 96, small: "PESANGON DIBAYAR PAKAI UANG SIAPA?" }),
    f < oB ? K.strike(f, { at: w("bangkrut"), x: 90, y: 474, w: 470 }) : "",
    f < oB ? K.stamp(f, { at: w("bangkrut"), x: 620, y: 380, rot: -10, text: "TUTUP", size: 84 }) : "",
    K.card(f, { at: w("uang"), out: oB, x: 72, y: 650, w: 888, dashed: true, pad: "24px 32px", html: `<div style="font:700 80px/1 Oswald;color:${T.ink2}">DIBAYAR UANG SIAPA?</div>` }),
    // Muklis
    K.kicker(f, { at: muk, text: "DANA CADANGAN PESANGON · PASAL 253" }),
    K.card(f, {
      at: w("pengusaha"), x: 72, y: 300, w: 888, pad: "22px 30px",
      html: `<div style="font:700 24px ${mono};color:${T.teal};letter-spacing:2px">PASAL 253 AYAT (1)</div><div style="font:700 64px/1.05 Oswald;margin-top:6px">DANA CADANGAN PESANGON · <span style="color:${T.red}">WAJIB</span></div><div style="font:700 30px/1.4 'Nunito Sans',sans-serif;margin-top:10px">Pengusaha <span style="${K.hl(f, w("wajib"))}">wajib menyediakan</span> dana cadangan pesangon sebagai sumber pembayaran hak Pekerja/Buruh akibat Pemutusan Hubungan Kerja.</div>`,
    }),
    K.tile(f, { at: w("pemerintah"), x: 72, y: 684, w: 432, h: 266, num: "(3)", icon: "perisai", big: "DIKELOLA LEMBAGA PEMERINTAH", bigSize: 44, small: "PASAL 253 AYAT (3)" }),
    K.tile(f, { at: w("mikro"), x: 528, y: 684, w: 432, h: 266, num: "(4)", icon: "kantor", big: `<span style="position:relative;display:inline-block">USAHA MIKRO<br>&amp; KECIL${K.strike(f, { at: w("mikro") + 6, x: -8, y: 28, w: 250 })}</span>`, bigSize: 44, small: "DIKECUALIKAN · AYAT (4)" }),
    K.box(f, { at: w("sanksi"), x: 72, y: 970, html: `<div style="font:700 24px ${mono};color:${T.teal};letter-spacing:2px">SANKSI · PASAL 253 AYAT (6)</div>` }),
    ...sBox,
    K.src(f, { y: 1166, text: "UU 27/2026 Pasal 253 ayat (1)-(6)" }),
  );
  const at = { x: 200, y: 1200, w: 320 };
  return F1.join(K.page(f, D, art), K.head(f, D, { step: 4, label: "BUKTI 3 · DANA CADANGAN" }), K.cast(S, f, [{ src: K.CAST.beni, ...at }, { src: K.CAST.muklis, ...at }]));
});
