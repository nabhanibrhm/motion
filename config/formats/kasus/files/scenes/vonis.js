// Vonis: the stamp slams on "ditutup", the question card on "Tulis", then the TikTok cover card over the outro tail.
scene((f, { S, C }) => `${C.verdict(f, S, {
  at: "word:ditutup",
  slogan: "GANTI <b>KESIMPULAN</b>",
  ask: { cue: "word:Tulis", kicker: "KOMENTAR", big: "GANTI PERTANYAAN PENUTUP?", sub: "TULIS DI KOMENTAR" },
})}
${C.cover(f, S, { lines: [{ t: "GANTI" }, { t: "JUDUL", accent: "COVER" }] })}`);
