// Hook: frame 0 is fully drawn (it is the thumbnail), so the claim card starts at -12 and is already settled on f = 0,
// and the progress strip is drawn from f + 24 so its first segment is already full on f = 0.
scene((f, { S, w, C }) => `${C.progress(f + 24, { step: 1, label: "HOOK" })}
${C.card(f, { at: -12, x: 72, y: 420, w: 880, kicker: "KLAIM", big: "GANTI DENGAN KLAIM UTAMA", sub: "Kata sumber atau tokoh", src: "Media A, Media B", bigSize: 72 })}
${C.card(f, { at: w("klaim"), x: 72, y: 980, w: 880, tone: "dark", kicker: "DUDUK PERKARA", big: "Satu fakta pendukung", bigSize: 52, dir: 1 })}`);
