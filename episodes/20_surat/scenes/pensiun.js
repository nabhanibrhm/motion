// Pensiun: MUNDUR vs DIMAKZULKAN, same three rights (UU 7/1978 Pasal 6, 8) on both sides; the exception card
// ("tidak dengan hormat", Penjelasan Pasal 6) draws on the cue and turns the right-hand ticks into red asterisks.
// HotWizz minimal look drawn inline; step 5 of the progress strip.
scene((f, { S, D, w, n, FONT }) => {
  const BG = "#0b0b0c", TX = "#f2efe9", MU = "#8b8a86", DIM = "#5a5955", LN = "#2a2a2c", RED = "#ff2d3d";
  const { mono, osw } = FONT;
  const X0 = 72, WIDE = 888;
  const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const pop = (at, len = 10) => F1.ramp(f, at, len, F1.expoOut);
  const esc = F1.esc;

  const cRows = [w("dapat"), w("rumah"), w("mobil")];
  const tExc = w("gugur");
  const tNote = w("tegas");

  const bg =
    `<div style="position:absolute;inset:0;background:${BG}"></div>` +
    `<div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,0.018) 0 2px,transparent 2px 5px)"></div>`;

  const CASE = F1.cine.CASE;
  const STEP = 5;
  const fill = cl(f / Math.max(1, D - 1));
  const segs = Array.from({ length: CASE.steps }, (_, i) => {
    const k = i + 1 < STEP ? 1 : i + 1 === STEP ? fill : 0;
    return `<div style="flex:1;height:5px;border-radius:3px;background:${LN};overflow:hidden"><div style="width:${n(100 * k, 2)}%;height:100%;background:${i + 1 === STEP ? RED : TX}"></div></div>`;
  }).join("");
  const strip = `<div style="position:absolute;left:${X0}px;top:140px;width:${WIDE}px">
<div style="font-family:${mono};font-weight:600;font-size:22px;letter-spacing:3px;color:${MU};white-space:nowrap">${esc(CASE.id)} <span style="color:${TX}">· PENSIUN</span></div>
<div style="display:flex;gap:8px;margin-top:14px">${segs}</div></div>`;

  const hp = pop(4, 12);
  const header =
    `<div style="position:absolute;left:${X0}px;top:212px;width:${WIDE}px;opacity:${n(hp, 3)};transform:translateY(${n((1 - hp) * 20)}px)">
<div style="font-family:${mono};font-weight:600;font-size:26px;letter-spacing:3px;color:${MU};white-space:nowrap"><span style="color:${RED}">●</span> UU 7/1978 · PASAL 6 DAN 8</div>
<div style="margin-top:6px;font-family:${osw};font-weight:700;font-size:88px;line-height:1.0;letter-spacing:1px;color:${TX};text-transform:uppercase;white-space:nowrap">HAK <span style="color:${RED}">PENSIUN</span></div></div>`;

  // two columns
  const CW = 432, GAP = 24, XL = X0, XR = X0 + CW + GAP, HY = 392, RY = 520, RH = 168, RP = 190;
  const colHead = (x, t, on) =>
    `<div style="position:absolute;left:${x}px;top:${HY}px;width:${CW}px;font-family:${osw};font-weight:700;font-size:50px;line-height:1.1;letter-spacing:2px;color:${on ? TX : DIM};white-space:nowrap;opacity:${n(hp, 3)}">${esc(t)}</div>` +
    `<div style="position:absolute;left:${x}px;top:${HY + 66}px;width:${CW}px;height:3px;background:${on ? TX : LN}"></div>`;
  const excOn = pop(tExc, 8);
  let html = colHead(XL, "MUNDUR", true) + colHead(XR, "DIMAKZULKAN", true);

  const rows = [
    ["PENSIUN", "100% GAJI POKOK"],
    ["RUMAH", "KEDIAMAN + PERLENGKAPAN"],
    ["MOBIL", "KENDARAAN NEGARA + SOPIR"],
  ];
  rows.forEach(([t, s], i) => {
    const p0 = pop(10 + i * 6, 10); // dim placeholders from the start, lit on the cue word
    if (p0 <= 0) return;
    const lit = F1.ramp(f, cRows[i], 8, F1.easeOut);
    const y = RY + i * RP;
    [XL, XR].forEach((x, side) => {
      const cond = side === 1 && excOn > 0; // right column becomes conditional once the exception lands
      const border = cond ? RED : lit > 0 ? "#4a4a4d" : LN;
      const tick = F1.ramp(f, cRows[i] + 4, 8, F1.easeOut);
      const badge = cond
        ? `<div style="position:absolute;right:22px;top:${RH / 2 - 32}px;width:64px;height:64px;border-radius:50%;box-sizing:border-box;border:4px solid ${RED};display:flex;align-items:center;justify-content:center;font-family:${osw};font-weight:700;font-size:54px;line-height:1;padding-top:12px;color:${RED}">*</div>`
        : lit > 0
          ? `<div style="position:absolute;right:22px;top:${RH / 2 - 32}px;width:64px;height:64px;border-radius:50%;background:${TX};display:flex;align-items:center;justify-content:center"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="${BG}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5 L9.5 18 L20 6.5" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${n(1 - tick, 3)}"/></svg></div>`
          : `<div style="position:absolute;right:22px;top:${RH / 2 - 32}px;width:64px;height:64px;border-radius:50%;box-sizing:border-box;border:4px solid ${LN}"></div>`;
      html +=
        `<div style="position:absolute;left:${x}px;top:${y}px;width:${CW}px;height:${RH}px;box-sizing:border-box;border:3px solid ${border};border-radius:22px;background:rgba(255,255,255,${n(0.012 + 0.012 * lit, 3)});opacity:${n(cl(p0 * 1.6), 3)};transform:translateY(${n((1 - p0) * 22)}px)">` +
        `<div style="position:absolute;left:24px;top:30px;font-family:${osw};font-weight:700;font-size:54px;line-height:1.0;letter-spacing:1px;color:${lit > 0 ? TX : DIM};white-space:nowrap">${esc(t)}</div>` +
        `<div style="position:absolute;left:24px;top:100px;width:300px;font-family:${mono};font-weight:600;font-size:20px;letter-spacing:0.5px;color:${lit > 0 ? MU : "#3a3a3d"};white-space:nowrap">${esc(s)}</div>` +
        badge +
        `</div>`;
    });
  });

  // exception card
  const EY = RY + 3 * RP + 14;
  const ep = pop(tExc, 12);
  if (ep > 0) {
    const np = pop(tNote, 10);
    html +=
      `<div style="position:absolute;left:${X0}px;top:${EY}px;width:${WIDE}px;height:262px;box-sizing:border-box;border:4px solid ${RED};border-radius:24px;background:rgba(255,45,61,0.07);opacity:${n(cl(ep * 1.6), 3)};transform:translateY(${n((1 - ep) * 26)}px)">` +
      `<div style="position:absolute;left:30px;top:24px;font-family:${mono};font-weight:700;font-size:26px;letter-spacing:3px;color:${RED};white-space:nowrap">* KECUALI</div>` +
      `<div style="position:absolute;left:30px;top:66px;width:830px;font-family:${osw};font-weight:700;font-size:56px;line-height:1.05;letter-spacing:1px;color:${TX};text-transform:uppercase">MPR <span style="color:${RED}">TEGAS</span> NYATAKAN</div>` +
      `<div style="position:absolute;left:30px;top:130px;width:830px;font-family:${osw};font-weight:700;font-size:56px;line-height:1.05;letter-spacing:1px;color:${TX};text-transform:uppercase;opacity:${n(cl(np * 1.6), 3)}">“TIDAK DENGAN HORMAT”</div>` +
      `<div style="position:absolute;left:30px;bottom:16px;font-family:${mono};font-weight:500;font-size:20px;letter-spacing:0.5px;color:${MU};white-space:nowrap">Penjelasan Pasal 6 · tanpa itu, hak tetap</div>` +
      `</div>`;
  }

  const source = `<div style="position:absolute;left:${X0}px;top:1392px;width:${WIDE}px;font-family:${mono};font-weight:500;font-size:21px;letter-spacing:0.3px;line-height:1.3;color:${MU}">Sumber: UU 7/1978 Pasal 6, 8, Penj. Pasal 6; Suara (11 Nov), CNBC Indonesia (12 Nov). Bukan nasihat hukum.</div>`;

  return F1.join(
    F1.cine.stage(f, D, bg + header + html + source, { zoom: 0.02 }),
    F1.cine.vignette(0.25, "50% 50%", 55),
    strip,
  );
});
