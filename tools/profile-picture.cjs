// Usage: node tools/profile-picture.cjs <outDir>  (option A = the current TikTok avatar, saved in assets/shared/brand/)
// Builds three 1080x1080 profile-picture options from the KASUS cast (Nisa, Muklis, Beni) in the casefile palette.
const sharp = require("sharp");
const fs = require("fs");
const OUT = process.argv[2];
const C = { bg: "#f2efe9", paper: "#fbf9f5", ink: "#151515", muted: "#4a4844", teal: "#1d6b6b", tealDark: "#145252", haze: "#e8e3d9", red: "#e8192c" };
const raw = (k, pre) => fs.readFileSync(require("path").join(__dirname, "..", "assets/shared/cast", `${k}.svg`), "utf8")
  .replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "")
  .replace(/id="([^"]+)"/g, `id="${pre}$1"`).replace(/url\(#([^)]+)\)/g, `url(#${pre}$1)`);
const CAST = { nisa: raw("nisa", "n_"), muklis: raw("muklis", "m_"), beni: raw("beni", "b_") };
// bust: crop the top of the 360x980 figure (head + shoulders), y 20..600
const bust = (k, x, y, w) => `<svg x="${x}" y="${y}" width="${w}" height="${(w * 760) / 360}" viewBox="0 20 360 760">${CAST[k]}</svg>`;
const trio = (y, w, gap, cx = 540) => {
  const side = w * 0.92;
  return bust("muklis", cx - side / 2 - gap, y + 50, side) + bust("beni", cx + gap - side / 2, y + 50, side) + bust("nisa", cx - w / 2, y, w);
};
const grain = `<filter id="gr"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.28  0 0 0 0 0.25  0 0 0 0.10 0"/></filter>`;
const svg = (body, defs = "") => `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080"><defs>${grain}${defs}</defs>${body}</svg>`;

const A = svg(`
<rect width="1080" height="1080" fill="${C.bg}"/><rect width="1080" height="1080" filter="url(#gr)"/>
<circle cx="540" cy="560" r="400" fill="${C.teal}"/>
<circle cx="540" cy="560" r="400" fill="none" stroke="${C.ink}" stroke-width="14"/>
<clipPath id="cb"><rect x="0" y="0" width="1080" height="450"/><circle cx="540" cy="560" r="393"/></clipPath>
<g clip-path="url(#cb)">${trio(110, 460, 275)}</g>
<g transform="translate(540 900) rotate(-6)"><rect x="-120" y="-44" width="240" height="88" rx="10" fill="none" stroke="${C.red}" stroke-width="10"/><text x="0" y="22" text-anchor="middle" font-family="Oswald, Impact, Arial Black, sans-serif" font-weight="700" font-size="62" letter-spacing="4" fill="${C.red}">KASUS</text></g>
`);

const B = svg(`
<rect width="1080" height="1080" fill="${C.teal}"/>
<g opacity="0.16" stroke="${C.paper}" stroke-width="3">${Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="${i * 96 + 40}" x2="1080" y2="${i * 96 + 40}"/>`).join("")}</g>
<circle cx="540" cy="600" r="380" fill="${C.paper}" stroke="${C.ink}" stroke-width="14"/>
<clipPath id="cc"><rect x="0" y="0" width="1080" height="490"/><circle cx="540" cy="600" r="373"/></clipPath>
<g clip-path="url(#cc)">${trio(150, 460, 275)}</g>
<circle cx="855" cy="285" r="58" fill="${C.red}" stroke="${C.ink}" stroke-width="10"/>
<text x="855" y="309" text-anchor="middle" font-family="Oswald, Impact, Arial Black, sans-serif" font-weight="700" font-size="68" fill="${C.paper}">!</text>
`);

const C3 = svg(`
<rect width="1080" height="1080" fill="${C.bg}"/><rect width="1080" height="1080" filter="url(#gr)"/>
<clipPath id="cd"><rect x="0" y="0" width="1080" height="760"/></clipPath>
<g clip-path="url(#cd)">${trio(190, 440, 290)}</g>
<path d="M120 700 H960 L930 960 q-3 22 -25 22 H175 q-22 0 -25 -22 Z" fill="${C.haze}" stroke="${C.ink}" stroke-width="12" stroke-linejoin="round"/>
<text x="200" y="830" font-family="JetBrains Mono, Consolas, monospace" font-weight="700" font-size="64" letter-spacing="4" fill="${C.teal}">KASUS</text>
<line x1="200" y1="880" x2="500" y2="880" stroke="${C.muted}" stroke-width="10" stroke-linecap="round" opacity="0.5"/>
<g transform="translate(760 850) rotate(-10)"><rect x="-120" y="-50" width="240" height="100" rx="10" fill="none" stroke="${C.red}" stroke-width="10"/><text x="0" y="22" text-anchor="middle" font-family="Oswald, Impact, Arial Black, sans-serif" font-weight="700" font-size="58" letter-spacing="3" fill="${C.red}">FAKTA</text></g>
`);

(async () => {
  const opts = { "pfp-A-teal-ring": A, "pfp-B-teal-ground": B, "pfp-C-casefile-folder": C3 };
  for (const [name, s] of Object.entries(opts)) {
    fs.writeFileSync(`${OUT}/${name}.svg`, s);
    await sharp(Buffer.from(s)).png().toFile(`${OUT}/${name}.png`);
  }
  // contact sheet: each option as a full square, a circle crop, and a tiny 110 px circle (how TikTok shows it)
  const mask = (d) => Buffer.from(`<svg width="${d}" height="${d}"><circle cx="${d / 2}" cy="${d / 2}" r="${d / 2}"/></svg>`);
  const comps = [];
  let i = 0;
  for (const name of Object.keys(opts)) {
    const png = `${OUT}/${name}.png`;
    const sq = await sharp(png).resize(420).toBuffer();
    const circ = await sharp(png).resize(420).composite([{ input: mask(420), blend: "dest-in" }]).png().toBuffer();
    const tiny = await sharp(png).resize(110).composite([{ input: mask(110), blend: "dest-in" }]).png().toBuffer();
    const y = 20 + i * 460;
    comps.push({ input: sq, left: 20, top: y }, { input: circ, left: 470, top: y }, { input: tiny, left: 930, top: y + 155 });
    i++;
  }
  await sharp({ create: { width: 1070, height: 1400, channels: 4, background: "#202020" } }).composite(comps).png().toFile(`${OUT}/pfp-options-sheet.png`);
  console.log("done");
})();
