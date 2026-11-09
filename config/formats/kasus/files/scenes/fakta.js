// Fakta: three sourced facts, each ticked on the word that introduces it.
scene((f, { w, C, W }) => `${C.progress(f, { step: 2, label: "FAKTA" })}
${W.checklist(f, {
  x: 72,
  y: 380,
  w: 880,
  title: "FAKTA RESMI",
  items: [
    { t: "Fakta resmi pertama", src: "Media A" },
    { t: "Fakta resmi kedua", src: "Media B" },
    { t: "Fakta resmi ketiga", src: "Media C" },
  ],
  ticks: [w("pertama"), w("kedua"), w("ketiga")],
})}`);
