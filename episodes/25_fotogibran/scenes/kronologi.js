// Kronologi: the detik press photo of the group photo with Gibran's frame held upside down (Bima Bagaskara/detikJabar,
// 12 Nov 2026), B&W with a slow push-in; a red box marks the frame on "bersama"; three timeline rows draw on their cues.
// HotWizz minimal look drawn inline; step 3 of the progress strip.
scene((f, { S, D, w, n, FONT }) => {
  const BG = "#0b0b0c", TX = "#f2efe9", MU = "#8b8a86", LN = "#2a2a2c", RED = "#ff2d3d";
  const { mono, osw } = FONT;
  const X0 = 72, WIDE = 888;
  const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const pop = (at, len = 10) => F1.ramp(f, at, len, F1.expoOut);
  const esc = F1.esc;
  const mark = (t) => esc(t).replace(/\*([^*]+)\*/g, `<span style="color:${RED}">$1</span>`);

  const bg =
    `<div style="position:absolute;inset:0;background:${BG}"></div>` +
    `<div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,0.018) 0 2px,transparent 2px 5px)"></div>`;

  const CASE = F1.cine.CASE;
  const STEP = 3;
  const fill = cl(f / Math.max(1, D - 1));
  const segs = Array.from({ length: CASE.steps }, (_, i) => {
    const k = i + 1 < STEP ? 1 : i + 1 === STEP ? fill : 0;
    return `<div style="flex:1;height:5px;border-radius:3px;background:${LN};overflow:hidden"><div style="width:${n(100 * k, 2)}%;height:100%;background:${i + 1 === STEP ? RED : TX}"></div></div>`;
  }).join("");
  const strip = `<div style="position:absolute;left:${X0}px;top:140px;width:${WIDE}px">
<div style="font-family:${mono};font-weight:600;font-size:22px;letter-spacing:3px;color:${MU};white-space:nowrap">${esc(CASE.id)} <span style="color:${TX}">· KRONOLOGI</span></div>
<div style="display:flex;gap:8px;margin-top:14px">${segs}</div></div>`;

  // photo card (800x675 source shown at 888x749), slow push-in towards the frame
  const PY = 220, PW = WIDE, PH = 749;
  const pp = pop(0, 12);
  const zoom = 1 + 0.06 * cl(f / Math.max(1, D - 1));
  const tBox = w("bersama");
  const bp = pop(tBox, 10);
  const box = bp > 0
    ? `<div style="position:absolute;left:313px;top:389px;width:268px;height:306px;box-sizing:border-box;border:6px solid ${RED};border-radius:10px;opacity:${n(cl(bp * 1.5), 3)};transform:scale(${n(1.25 - 0.25 * bp, 3)})"></div>` +
      `<div style="position:absolute;left:313px;top:335px;padding:6px 12px 4px;background:${RED};font-family:${mono};font-weight:700;font-size:22px;letter-spacing:2px;color:${TX};white-space:nowrap;opacity:${n(cl(bp * 1.5), 3)}">FOTO TERBALIK</div>`
    : "";
  const photo =
    `<div style="position:absolute;left:${X0}px;top:${PY}px;width:${PW}px;height:${PH}px;border-radius:22px;overflow:hidden;background:#111;opacity:${n(pp, 3)};transform:translateY(${n((1 - pp) * 24)}px)">` +
    `<div style="position:absolute;inset:0;transform-origin:50% 62%;transform:scale(${n(zoom, 4)})">` +
    `<img src="public/photos/dprd-foto-terbalik.jpg" style="position:absolute;left:0;top:0;width:${PW}px;height:${PH}px;object-fit:cover;filter:grayscale(1) contrast(1.08)">` +
    box +
    `</div>` +
    `<div style="position:absolute;left:0;right:0;bottom:0;height:160px;background:linear-gradient(transparent,rgba(11,11,12,0.85))"></div>` +
    `<div style="position:absolute;left:22px;bottom:16px;font-family:${mono};font-weight:500;font-size:19px;letter-spacing:0.3px;color:${MU};white-space:nowrap">Foto: Bima Bagaskara/detikJabar · Ruang Banggar DPRD Jabar, 12 Nov</div>` +
    `</div>`;

  // timeline rows
  const rows = [
    { at: w("audiensi"), when: "KAMIS 12 NOV", text: "Audiensi *koalisi sipil* di DPRD", src: "detik, Kompas" },
    { at: w("bersama"), when: "SAAT FOTO BERSAMA", text: "Foto Gibran *diturunkan & dibalik*", src: "detik, kumparan" },
    { at: w("Jumat"), when: "JUMAT 13 NOV", text: "Foto *dipasang lagi*", src: "kumparan, JPNN" },
  ];
  const RY = PY + PH + 44, RP = 132;
  let html = "";
  rows.forEach((r, i) => {
    const p = pop(r.at, 10);
    if (p <= 0) return;
    const y = RY + i * RP;
    html +=
      `<div style="position:absolute;left:${X0}px;top:${y}px;width:${WIDE}px;opacity:${n(cl(p * 1.6), 3)};transform:translateX(${n((1 - p) * 28)}px)">` +
      `<div style="position:absolute;left:0;top:10px;width:14px;height:14px;border-radius:50%;background:${RED}"></div>` +
      (i < rows.length - 1 ? `<div style="position:absolute;left:6px;top:32px;width:2px;height:${RP - 28}px;background:${LN}"></div>` : "") +
      `<div style="position:absolute;left:34px;top:0;font-family:${mono};font-weight:600;font-size:22px;letter-spacing:3px;color:${MU};white-space:nowrap">${esc(r.when)} · ${esc(r.src)}</div>` +
      `<div style="position:absolute;left:34px;top:34px;font-family:${osw};font-weight:700;font-size:50px;line-height:1.05;letter-spacing:0.5px;color:${TX};white-space:nowrap">${mark(r.text)}</div>` +
      `</div>`;
  });

  return F1.join(
    F1.cine.stage(f, D, bg + photo + html, { zoom: 0.01 }),
    F1.cine.vignette(0.2, "50% 50%", 55),
    strip,
  );
});
