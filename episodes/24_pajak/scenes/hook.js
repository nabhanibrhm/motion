// Hook (casefile look). Frame 0 is fully drawn: tag chip, headline and the payslip "PPh 21: Rp0?".
// Pen ring on "Rp10.000.000" at "sepuluh", highlighter on BEBAS PAJAK at "bebas", BARU RENCANA stamp + status chip at "belum".
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const slip = K.card(f, {
    at: -20, x: 72, y: 690, w: 888, h: 330, rot: -2, pad: "24px 40px",
    html: `<div style="display:flex;justify-content:space-between;font:700 24px ${mono};letter-spacing:2px;color:${T.ink2}"><span>SLIP GAJI</span><span style="color:${T.teal}">KLAIM 2027</span></div><div style="font:700 26px ${mono};letter-spacing:1px;margin-top:12px">GAJI + TUNJANGAN TETAP <span style="position:relative;display:inline-block;white-space:nowrap">≤ Rp10.000.000${K.pen(f, { at: w("sepuluh") - 2, x: -4, y: 0, w: 290, h: 30, sw: 6 })}</span></div><div style="height:6px;background:${T.teal};margin-top:14px"></div><div style="font:700 124px/1 Oswald;color:${T.ink};margin-top:10px;white-space:nowrap">PPh 21: Rp0?</div>`,
  });
  const art = F1.join(
    K.chip(f, { at: -20, x: 72, y: 250, text: "KLAIM · PPh 21 DTP 2027", teal: true, size: 26 }),
    K.title(f, { at: -20, y: 322, size: 98, lh: 0.98, html: `GAJI DI BAWAH<br>RP10 JUTA<br><span style="${K.hl(f, w("bebas"))}">BEBAS PAJAK</span> 2027?` }),
    slip,
    K.stamp(f, { at: w("belum"), x: 380, y: 975, rot: -6, text: "BARU RENCANA", size: 64 }),
    K.chip(f, { at: w("belum") + 4, x: 72, y: 1100, text: "PMK 2027: BELUM TERBIT (CEK 13 NOV)", size: 24, red: true }),
    K.src(f, { y: 1166, at: w("belum") + 4, text: "Menko Perekonomian 9 Nov 2026 · BPK JDIH" }),
  );
  return F1.join(K.page(f, D, art, { slide: false }), K.head(f, D, { step: 1, label: "LAPORAN MASUK" }), K.cast(S, f, [{ src: K.CAST.nisa, x: 200, y: 1200, w: 320, at: -20 }]));
});
