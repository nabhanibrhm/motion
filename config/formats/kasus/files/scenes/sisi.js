// Sisi lain: the counter-view on a dark card that slides in from the side on "bantahan".
scene((f, { w, C }) => `${C.progress(f, { step: 3, label: "SISI LAIN" })}
${C.card(f, { at: w("sisi"), x: 72, y: 420, w: 880, kicker: "SISI LAIN", big: "GANTI DENGAN SISI LAIN", sub: "Pihak yang berbeda", src: "Media D", bigSize: 60 })}
${C.card(f, { at: w("bantahan"), x: 72, y: 900, w: 880, tone: "dark", kicker: "BANTAHAN", big: "Bantahan atau penjelasan", src: "Media E", bigSize: 52, dir: -1 })}`);
