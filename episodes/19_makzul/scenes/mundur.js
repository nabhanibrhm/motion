// Dua jalan: impeachment route (4 stages, dimmed, from frame 0) vs the short "mundur" route that draws on the cue words.
// HotWizz minimal look drawn inline; step 4 of the progress strip.
scene((f, { S, D, w, n, FONT }) => {
  const BG = "#0b0b0c", TX = "#f2efe9", MU = "#8b8a86", DIM = "#5a5955", LN = "#2a2a2c", RED = "#ff2d3d";
  const { mono, osw } = FONT;
  const X0 = 72, WIDE = 888;
  const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lin = (at, len) => cl((f - at) / len);
  const pop = (at, len = 10) => F1.ramp(f, at, len, F1.expoOut);
  const esc = F1.esc;

  const cues = [w("kosong"), w("memilih"), w("paling")];
  const tPendek = w("pendek");

  const bg =
    `<div style="position:absolute;inset:0;background:${BG}"></div>` +
    `<div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,0.018) 0 2px,transparent 2px 5px)"></div>`;

  const CASE = F1.cine.CASE;
  const fill = cl(f / Math.max(1, D - 1));
  const segs = Array.from({ length: CASE.steps }, (_, i) => {
    const k = i + 1 < 4 ? 1 : i + 1 === 4 ? fill : 0;
    return `<div style="flex:1;height:5px;border-radius:3px;background:${LN};overflow:hidden"><div style="width:${n(100 * k, 2)}%;height:100%;background:${i + 1 === 4 ? RED : TX}"></div></div>`;
  }).join("");
  const strip = `<div style="position:absolute;left:${X0}px;top:140px;width:${WIDE}px">
<div style="font-family:${mono};font-weight:600;font-size:22px;letter-spacing:3px;color:${MU};white-space:nowrap">${esc(CASE.id)} <span style="color:${TX}">· DUA JALAN</span></div>
<div style="display:flex;gap:8px;margin-top:14px">${segs}</div></div>`;

  const hp = pop(4, 12);
  const header =
    `<div style="position:absolute;left:${X0}px;top:212px;width:${WIDE}px;opacity:${n(hp, 3)};transform:translateY(${n((1 - hp) * 20)}px)">
<div style="font-family:${mono};font-weight:600;font-size:26px;letter-spacing:3px;color:${MU};white-space:nowrap"><span style="color:${RED}">●</span> PASAL 7B · PASAL 8 AYAT 2</div>
<div style="margin-top:6px;font-family:${osw};font-weight:700;font-size:88px;line-height:1.0;letter-spacing:1px;color:${TX};text-transform:uppercase;white-space:nowrap">DUA <span style="color:${RED}">JALAN</span></div></div>`;

  // ---- top track: DIMAKZULKAN, 4 stages, dim from frame 0
  const TY = 372;
  const blockHead = (y, title, count, tc, cc) =>
    `<div style="position:absolute;left:${X0}px;top:${y}px;width:${WIDE}px;height:64px"><div style="position:absolute;left:0;top:0;font-family:${osw};font-weight:700;font-size:56px;line-height:1.1;letter-spacing:2px;color:${tc};white-space:nowrap">${esc(title)}</div>` +
    `<div style="position:absolute;right:0;top:20px;font-family:${mono};font-weight:700;font-size:30px;letter-spacing:3px;color:${cc};white-space:nowrap">${esc(count)}</div></div>`;
  const stages = [["DPR", "USUL ≥ 25"], ["PARIPURNA", "2/3 · 2/3"], ["MK", "≤ 90 HARI"], ["MPR", "3/4 · 2/3"]];
  const CW4 = 204, G4 = 24, CY = TY + 82, CH4 = 124;
  let top = blockHead(TY, "DIMAKZULKAN", "4 TAHAP", MU, MU);
  top += `<div style="position:absolute;left:${X0}px;top:${CY + CH4 / 2 - 2}px;width:${WIDE}px;height:4px;background:#3a3a3d"></div>`;
  stages.forEach(([a, b], i) => {
    const x = X0 + i * (CW4 + G4);
    top += `<div style="position:absolute;left:${x}px;top:${CY}px;width:${CW4}px;height:${CH4}px;box-sizing:border-box;border:3px solid #3a3a3d;border-radius:18px;background:#101011">
<div style="position:absolute;left:16px;top:18px;font-family:${osw};font-weight:700;font-size:34px;line-height:1.0;letter-spacing:0px;color:${MU};white-space:nowrap">${esc(a)}</div>
<div style="position:absolute;left:16px;top:74px;font-family:${mono};font-weight:600;font-size:23px;color:${DIM};white-space:nowrap">${esc(b)}</div></div>`;
  });

  // divider
  const DY = CY + CH4 + 50;
  const divider = `<div style="position:absolute;left:${X0}px;top:${DY}px;width:${WIDE}px;height:3px;background:${LN}"></div>`;

  // ---- bottom track: MUNDUR, short route drawn on the cues
  const BY = DY + 34;
  const bp = pop(tPendek, 10);
  const NX = 100, NODE = 26, CX = 170, CW = 790, CH = 168, PITCH = 192;
  const y0 = BY + 90;
  const cy = (i) => y0 + i * PITCH;
  const bottom = `<div style="opacity:${n(0.35 + 0.65 * bp, 3)}">${blockHead(BY, "MUNDUR", "1 SIDANG MPR", TX, RED)}</div>`;
  let route = "";
  for (let i = 0; i < 2; i++) {
    const a = cy(i) + CH / 2 + NODE + 4, b = cy(i + 1) + CH / 2 - NODE - 4;
    route += `<div style="position:absolute;left:${NX - 2}px;top:${a}px;width:4px;height:${b - a}px;background:${LN};border-radius:2px"></div>`;
    const p = lin(cues[i + 1] - 16, 14);
    if (p > 0) {
      const e = p * p * (3 - 2 * p);
      route += `<div style="position:absolute;left:${NX - 2}px;top:${a}px;width:4px;height:${n((b - a) * e, 1)}px;background:${RED};border-radius:2px"></div>`;
      if (p < 1) route += `<div style="position:absolute;left:${NX - 11}px;top:${n(a + (b - a) * e - 11, 1)}px;width:22px;height:22px;border-radius:50%;background:${RED};box-shadow:0 0 18px ${RED}"></div>`;
    }
  }
  const chips = [
    ["KURSI WAPRES KOSONG", "UUD 1945 PASAL 8 AYAT 2"],
    ["MPR PILIH PENGGANTI", "DARI 2 CALON USULAN PRESIDEN"],
    ["PALING LAMBAT", "BATAS WAKTU MPR"],
  ];
  const active = cues.reduce((a, c, i) => (f >= c ? i : a), -1);
  let cards = "", nodes = "";
  chips.forEach(([t, s], i) => {
    const st = i === active ? "active" : i < active ? "done" : "future";
    const pin = st === "future" ? 0 : pop(cues[i], 10);
    const border = st === "active" ? RED : st === "done" ? "#3a3a3d" : LN;
    const tc = st === "active" ? TX : st === "done" ? MU : DIM;
    const sub = st === "active" ? TX : st === "done" ? DIM : "#3a3a3d";
    let stamp = "";
    if (i === 2) {
      const p = pop(cues[2] + 8, 6);
      if (p > 0)
        stamp = `<div style="position:absolute;right:26px;top:46px;padding:4px 22px;border:6px solid ${RED};border-radius:12px;font-family:${osw};font-weight:700;font-size:62px;line-height:1.1;letter-spacing:3px;color:${RED};white-space:nowrap;opacity:${n(cl(p * 2), 3)};transform:rotate(-5deg) scale(${n(1.7 - 0.7 * p * p, 3)});transform-origin:50% 50%">≤ 60 HARI</div>`;
    }
    cards +=
      `<div style="position:absolute;left:${CX}px;top:${cy(i)}px;width:${CW}px;height:${CH}px;box-sizing:border-box;border:3px solid ${border};border-radius:22px;background:${st === "active" ? "rgba(255,45,61,0.06)" : "rgba(255,255,255,0.015)"};transform:scale(${n(1 + 0.012 * Math.sin(Math.PI * pin), 4)});transform-origin:0 50%">` +
      (st === "future"
        ? ""
        : `<div style="position:absolute;left:26px;top:34px;font-family:${osw};font-weight:700;font-size:${i === 2 ? 48 : 50}px;line-height:1.0;letter-spacing:1px;color:${tc};white-space:nowrap;opacity:${n(cl(pin * 1.6), 3)};transform:translateX(${n((1 - pin) * 24)}px)">${esc(t)}</div>` +
          `<div style="position:absolute;left:26px;top:100px;font-family:${mono};font-weight:600;font-size:27px;letter-spacing:1px;color:${sub};white-space:nowrap;opacity:${n(cl(pin * 1.6), 3)}">${esc(s)}</div>`) +
      stamp +
      `</div>`;
    const tick = st === "done" ? lin(cues[i + 1] - 4, 10) : 0;
    nodes += `<div style="position:absolute;left:${NX - NODE}px;top:${cy(i) + CH / 2 - NODE}px;width:${NODE * 2}px;height:${NODE * 2}px;border-radius:50%;box-sizing:border-box;border:4px solid ${st === "active" ? RED : st === "done" ? TX : LN};background:${st === "active" ? RED : st === "done" ? TX : BG};display:flex;align-items:center;justify-content:center">${
      st === "done"
        ? `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${BG}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5 L9.5 18 L20 6.5" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${n(1 - tick, 3)}"/></svg>`
        : `<span style="font-family:${mono};font-weight:700;font-size:26px;color:${st === "active" ? BG : DIM}">${i + 1}</span>`
    }</div>`;
  });

  const source = `<div style="position:absolute;left:${X0}px;top:1392px;width:${WIDE}px;font-family:${mono};font-weight:500;font-size:21px;letter-spacing:0.3px;line-height:1.3;color:${MU}">Sumber: UUD 1945 Pasal 7B; Pasal 8 ayat (2)</div>`;

  return F1.join(
    F1.cine.stage(f, D, bg + header + top + divider + bottom + route + cards + nodes + source, { zoom: 0.02 }),
    F1.cine.vignette(0.25, "50% 50%", 55),
    strip,
  );
});
