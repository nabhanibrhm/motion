// Alur pemakzulan: vertical route of 4 stations (usul HMP -> paripurna DPR -> MK -> MPR) that light up as she names them.
// HotWizz minimal look (drawn here because F1.hw is not guaranteed in a wrapped scene). Step 3 of the progress strip.
scene((f, { S, D, w, n, FONT }) => {
  const BG = "#0b0b0c", TX = "#f2efe9", MU = "#8b8a86", DIM = "#5a5955", LN = "#2a2a2c", RED = "#ff2d3d";
  const { mono, osw } = FONT;
  const X0 = 72, WIDE = 888;
  const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lin = (at, len) => cl((f - at) / len);
  const pop = (at, len = 10) => F1.ramp(f, at, len, F1.expoOut);
  const esc = F1.esc;

  // cue frames
  const cues = [w("Pertama"), w("paripurna"), w("Mahkamah"), w("Terakhir")];
  const tTerbukti = w("terbukti"), tDiteruskan = w("diteruskan");

  const bg =
    `<div style="position:absolute;inset:0;background:${BG}"></div>` +
    `<div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,0.018) 0 2px,transparent 2px 5px)"></div>`;

  // progress strip (step 3), same as the kit
  const CASE = F1.cine.CASE;
  const fill = cl(f / Math.max(1, D - 1));
  const segs = Array.from({ length: CASE.steps }, (_, i) => {
    const k = i + 1 < 3 ? 1 : i + 1 === 3 ? fill : 0;
    return `<div style="flex:1;height:5px;border-radius:3px;background:${LN};overflow:hidden"><div style="width:${n(100 * k, 2)}%;height:100%;background:${i + 1 === 3 ? RED : TX}"></div></div>`;
  }).join("");
  const strip = `<div style="position:absolute;left:${X0}px;top:140px;width:${WIDE}px">
<div style="font-family:${mono};font-weight:600;font-size:22px;letter-spacing:3px;color:${MU};white-space:nowrap">${esc(CASE.id)} <span style="color:${TX}">· ALUR PEMAKZULAN</span></div>
<div style="display:flex;gap:8px;margin-top:14px">${segs}</div></div>`;

  // header
  const hp = pop(4, 12);
  const header =
    `<div style="position:absolute;left:${X0}px;top:212px;width:${WIDE}px;opacity:${n(hp, 3)};transform:translateY(${n((1 - hp) * 20)}px)">
<div style="font-family:${mono};font-weight:600;font-size:26px;letter-spacing:3px;color:${MU};white-space:nowrap"><span style="color:${RED}">●</span> PASAL 7B UUD 1945</div>
<div style="margin-top:6px;font-family:${osw};font-weight:700;font-size:88px;line-height:1.0;letter-spacing:1px;color:${TX};text-transform:uppercase;white-space:nowrap">JALUR <span style="color:${RED}">PEMAKZULAN</span></div></div>`;

  // route geometry
  const TOP = 360, CH = 228, PITCH = 260, NX = 100, NODE = 26, CX = 170, CW = 790;
  const stTop = (i) => TOP + i * PITCH;
  const nodeY = (i) => stTop(i) + 62;
  const active = cues.reduce((a, c, i) => (f >= c ? i : a), -1);

  // connecting lines + travelling marker
  let route = "";
  for (let i = 0; i < 3; i++) {
    const y0 = nodeY(i) + NODE + 4, y1 = nodeY(i + 1) - NODE - 4;
    const p = lin(cues[i + 1] - 20, 18);
    route += `<div style="position:absolute;left:${NX - 2}px;top:${y0}px;width:4px;height:${y1 - y0}px;background:${LN};border-radius:2px"></div>`;
    if (p > 0) {
      const e = p * p * (3 - 2 * p);
      route += `<div style="position:absolute;left:${NX - 2}px;top:${y0}px;width:4px;height:${n((y1 - y0) * e, 1)}px;background:${RED};border-radius:2px"></div>`;
      if (p < 1) route += `<div style="position:absolute;left:${NX - 11}px;top:${n(y0 + (y1 - y0) * e - 11, 1)}px;width:22px;height:22px;border-radius:50%;background:${RED};box-shadow:0 0 18px ${RED}"></div>`;
    }
  }

  // visuals
  const dots25 = (st) => {
    const k = lin(w("minimal"), 42) * 25;
    let s = "";
    for (let i = 0; i < 25; i++) {
      const on = st !== "future" && i < k;
      const x = 15 + (i % 5) * 44, y = 12 + Math.floor(i / 5) * 38;
      s += `<div style="position:absolute;left:${x}px;top:${y}px;width:24px;height:24px;border-radius:50%;box-sizing:border-box;border:3px solid ${on ? RED : LN};background:${on ? RED : "transparent"}"></div>`;
    }
    return s;
  };
  const seats = (fHadir, fSetuju, hadirFrac, st) => {
    const N = 24, seatList = [];
    [[14, 112], [10, 74]].forEach(([c, r]) => {
      for (let i = 0; i < c; i++) {
        const th = Math.PI * (1 - i / (c - 1));
        seatList.push({ th, x: 125 + r * Math.cos(th), y: 168 - r * Math.sin(th) });
      }
    });
    seatList.sort((a, b) => b.th - a.th);
    const hN = Math.round(N * hadirFrac), sN = Math.round(hN * (2 / 3));
    const kH = st === "future" ? 0 : lin(fHadir, 22) * hN, kS = st === "future" ? 0 : lin(fSetuju, 26) * sN;
    return seatList
      .map((p, i) => {
        const h = i < kH, s = i < kS;
        const hs = i < hN; // quorum outline
        const col = s ? RED : h ? TX : LN;
        return `<div style="position:absolute;left:${n(p.x - 11, 1)}px;top:${n(p.y - 11, 1)}px;width:22px;height:22px;border-radius:50%;box-sizing:border-box;border:3px solid ${s ? RED : h ? TX : hs && hadirFrac < 1 ? DIM : LN};background:${s ? RED : h ? TX : "transparent"}"></div>`;
      })
      .join("");
  };
  const days = (st) => {
    const k = st === "future" ? 0 : lin(w("memutus"), w("hari") - w("memutus") + 4);
    const d = Math.round(90 * k);
    let ticks = "";
    for (let i = 0; i < 9; i++) {
      const on = k * 9 > i;
      ticks += `<div style="flex:1;height:16px;border-radius:3px;background:${on ? RED : LN}"></div>`;
    }
    return `<div style="position:absolute;left:0;top:14px;width:250px;text-align:right;font-family:${mono};font-weight:600;font-size:22px;letter-spacing:3px;color:${MU}">HARI</div>
<div style="position:absolute;left:0;top:34px;width:250px;text-align:right;font-family:${osw};font-weight:700;font-size:92px;line-height:1.0;color:${k > 0 ? TX : DIM}">${d}</div>
<div style="position:absolute;left:0;top:152px;width:250px;display:flex;gap:5px">${ticks}</div>`;
  };

  const stations = [
    { title: "USUL HMP", label: "≥ 25 ANGGOTA DPR", vis: dots25 },
    { title: "PARIPURNA DPR", label: "2/3 HADIR · 2/3 SETUJU", vis: (st) => seats(cues[1] + 6, w("setuju", 0), 1, st) },
    { title: "MAHKAMAH KONSTITUSI", label: "PUTUS ≤ 90 HARI", vis: days },
    { title: "MPR", label: "3/4 HADIR · 2/3 SETUJU", vis: (st) => seats(w("tiga"), w("dua", 2), 0.75, st) },
  ];

  let cards = "", nodes = "";
  stations.forEach((s, i) => {
    const top = stTop(i);
    const st = i === active ? "active" : i < active ? "done" : "future";
    const pIn = st === "future" ? 0 : pop(cues[i], 10);
    const border = st === "active" ? RED : st === "done" ? "#3a3a3d" : LN;
    const tc = st === "active" ? TX : st === "done" ? MU : DIM;
    const lc = st === "active" ? TX : st === "done" ? DIM : "#3a3a3d";
    const sc = st === "active" ? 1 + 0.012 * Math.sin(Math.PI * pIn) : 1;
    // extras in the left column
    let extra = "";
    if (i === 2) {
      const p = pop(tTerbukti, 6);
      if (p > 0)
        extra = `<div style="position:absolute;left:24px;top:156px;padding:6px 14px;border:4px solid ${RED};border-radius:10px;font-family:${mono};font-weight:700;font-size:26px;letter-spacing:1px;color:${RED};white-space:nowrap;opacity:${n(cl(p * 2), 3)};transform:rotate(-3deg) scale(${n(1.5 - 0.5 * p * p, 3)});transform-origin:0 50%;display:flex;align-items:center;gap:10px"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${RED}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5 L9.5 18 L20 6.5" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${n(1 - lin(tTerbukti + 3, 8), 3)}"/></svg>TERBUKTI? → DITERUSKAN</div>`;
    }
    if (i === 3) {
      const p = pop(w("Gibran"), 10);
      if (p > 0)
        extra = `<div style="position:absolute;left:24px;top:162px;font-family:${mono};font-weight:600;font-size:27px;letter-spacing:1px;color:${TX};white-space:nowrap;opacity:${n(p, 3)};transform:translateY(${n((1 - p) * 14)}px)"><span style="color:${RED}">▸</span> WAPRES BOLEH MEMBELA DIRI</div>`;
    }
    cards +=
      `<div style="position:absolute;left:${CX}px;top:${top}px;width:${CW}px;height:${CH}px;box-sizing:border-box;border:3px solid ${border};border-radius:22px;background:${st === "active" ? "rgba(255,45,61,0.06)" : "rgba(255,255,255,0.015)"};transform:scale(${n(sc, 4)});transform-origin:0 50%">` +
      `<div style="position:absolute;left:24px;top:26px;font-family:${osw};font-weight:700;font-size:52px;line-height:1.0;letter-spacing:1px;color:${tc};white-space:nowrap">${esc(s.title)}</div>` +
      `<div style="position:absolute;left:24px;top:94px;font-family:${mono};font-weight:600;font-size:28px;letter-spacing:1px;color:${lc};white-space:nowrap">${esc(s.label)}</div>` +
      extra +
      `<div style="position:absolute;right:16px;top:50%;margin-top:-104px;width:250px;height:208px;transform:scale(1.14);transform-origin:100% 50%;opacity:${st === "done" ? 0.55 : 1}">${s.vis(st)}</div></div>`;
    // node
    const tick = st === "done" ? lin(cues[i + 1] - 4, 10) : 0;
    nodes += `<div style="position:absolute;left:${NX - NODE}px;top:${nodeY(i) - NODE}px;width:${NODE * 2}px;height:${NODE * 2}px;border-radius:50%;box-sizing:border-box;border:4px solid ${st === "active" ? RED : st === "done" ? TX : LN};background:${st === "active" ? RED : st === "done" ? TX : BG};display:flex;align-items:center;justify-content:center">${
      st === "done"
        ? `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${BG}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5 L9.5 18 L20 6.5" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${n(1 - tick, 3)}"/></svg>`
        : `<span style="font-family:${mono};font-weight:700;font-size:26px;color:${st === "active" ? BG : DIM}">${i + 1}</span>`
    }</div>`;
  });

  const source = `<div style="position:absolute;left:${X0}px;top:1386px;width:${WIDE}px;font-family:${mono};font-weight:500;font-size:21px;letter-spacing:0.3px;line-height:1.3;color:${MU}">Sumber: UUD 1945 Pasal 7A, 7B; UU 17/2014 (MD3) Pasal 210</div>`;

  return F1.join(
    F1.cine.stage(f, D, bg + header + route + cards + nodes + source, { zoom: 0.02 }),
    F1.cine.vignette(0.25, "50% 50%", 55),
    strip,
  );
});
