// Patokan (BUKTI 2). Payslip card; highlighter on UPAH POKOK ("pokok") and TUNJANGAN TETAP ("tunjangan");
// arrow kantor -> BPJS on "dilaporkan"; pen ring + HRD chip on "keliru".
scene((f, { S, D, w }) => {
  const K = F1.casefile;
  const T = K.T;
  const mono = "'JetBrains Mono',monospace";
  const ap = F1.ramp(f, w("dilaporkan"), 14, F1.easeOut);
  const arrow = `<svg width="190" height="60" viewBox="0 0 190 60" style="position:absolute;left:420px;top:870px;overflow:visible"><path d="M6 30H170M138 8l32 22-32 22" fill="none" stroke="${T.ink}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="260" stroke-dashoffset="${F1.n(260 * (1 - ap))}"/></svg>`;
  const rowH = (label, at) => `<div style="font:700 64px/1.1 Oswald;margin-top:14px"><span style="${K.hl(f, at)}">${label}</span></div>`;
  const art = F1.join(
    K.kicker(f, { at: -10, text: "GAJI YANG DIHITUNG" }),
    K.card(f, { at: -10, x: 72, y: 310, w: 888, pad: "26px 36px", html: `<div style="display:flex;justify-content:space-between;font:700 24px ${mono};letter-spacing:2px;color:${T.ink2}"><span>SLIP GAJI (ILUSTRASI)</span><span style="color:${T.teal}">+ = YANG DIHITUNG</span></div>${rowH("UPAH POKOK", w("pokok"))}${rowH("+ TUNJANGAN TETAP", w("tunjangan"))}` }),
    K.tile(f, { at: w("dilaporkan") - 6, x: 72, y: 700, w: 340, h: 250, num: "1", icon: "kantor", big: "KANTOR", bigSize: 56 }),
    K.tile(f, { at: w("dilaporkan") - 2, x: 620, y: 700, w: 340, h: 250, num: "2", icon: "perisai", big: "BPJS TK", bigSize: 56 }),
    arrow,
    K.box(f, { at: w("dilaporkan"), x: 72, y: 980, w: 888, html: `<div style="font:700 24px ${mono};color:${T.ink2};letter-spacing:1px">UPAH TERAKHIR YANG DILAPORKAN KANTOR</div>` }),
    K.pen(f, { at: w("keliru"), x: 440, y: 872, w: 150, h: 56 }),
    K.chip(f, { at: w("keliru") + 6, x: 72, y: 1060, text: "DATA SALAH? MINTA HRD PERBAIKI", red: true }),
    K.src(f, { at: w("keliru") + 6, y: 1166, text: "Permenaker 16/2026 Pasal 4 · bsu.bpjsketenagakerjaan.go.id (tanya jawab)" }),
  );
  return F1.join(K.page(f, D, art), K.head(f, D, { step: 3, label: "BUKTI 2 · GAJI YANG DIHITUNG" }), K.cast(S, f, [{ src: K.CAST.muklis, x: 200, y: 1200, w: 320 }]));
});
