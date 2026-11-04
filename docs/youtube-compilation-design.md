# YouTube compilation: "8 Kasus Dompet" (16:9)

Status: **plan, not implemented** (3 Nov 2026). This is the first YouTube video and the pilot for the 16:9 format in [youtube-longform-design.md](youtube-longform-design.md). It reuses the eight finished shorts instead of new scene art.

## Reference study

Two videos were studied for format only. Nothing (art, wording, music or structure names) is copied.

| | Ngayal, "Kalau Indonesia Nggak Punya Presiden…" (12:04) | Tekotok, "Tujuan" (2:59) |
|---|---|---|
| Structure | One premise, five numbered chapters, then a recap table and one viewer question | One continuous monologue, no chapters |
| Chapter rhythm | Each chapter: what changes in your life → strengths → "harganya" (the cost) → "Faktanya" with real numbers and Indonesia's own history | Escalating questions to a quiet turn at the end |
| On screen | Flat infographic, a persistent chapter tab bar at the top showing progress, one big label per beat, a dial that returns between chapters | Hand-drawn characters, big bold captions, channel watermark |
| Voice | Second person ("kamu"), concrete daily-life moments | First person, personal, emotional |
| Close | Recap all chapters in one comparison table, ask "kamu pilih yang mana?", subscribe | A sincere dedication line |
| YouTube | Named chapters in the description | — |

**What we take as inspiration:** a premise that ties the chapters together, a progress bar that shows where you are among the cases, a returning visual between chapters, one comparison recap at the end, and a single question that asks the viewer to choose. From Tekotok, one short personal closing line. Our own look (the F1 cast, the KASUS stamp, dark HUD cards) stays.

## Concept

**"8 Kasus Dompet 2026: Siapa yang Menguras Uangmu?"** The detective agency reopens its eight files as one investigation. Each case is a suspect for the same crime: why the money in your wallet is worth less. The order runs from the big economy to personal traps, so each case leads into the next.

| # | Chapter (YouTube) | Short | Link to the next case |
|---|---|---|---|
| 0 | Laporan masuk: dompet makin tipis | new cold open, ~40 s | — |
| 1 | Kasus 1: Nasi goreng naik terus (inflasi) | 01 | Prices rise. What about the currency itself? |
| 2 | Kasus 2: Rupiah tembus Rp18.000 | 02 | A weak rupiah sends investors running… |
| 3 | Kasus 3: IHSG anjlok 10% | 03 | …to "safe" gold |
| 4 | Kasus 4: Emas katanya aman | 06 | Assets wobble. And salaries? |
| 5 | Kasus 5: Gaji naik 8%, kok kurang | 08 | When pay doesn't keep up, the middle class slips |
| 6 | Kasus 6: Kelas menengah hilang | 07 | Squeezed households reach for credit… |
| 7 | Kasus 7: Paylater | 04 | …or for a shortcut |
| 8 | Kasus 8: Judol lewat QRIS | 05 | — |
| 9 | Rekap: 8 tersangka, 1 dalang | new, ~60 s | — |
| 10 | Kasus ditutup | new, ~20 s | — |

The YouTube case numbers (Kasus 1–8) follow this story order. The on-screen "KASUS #NN" inside each short keeps its TikTok number, and the side panel shows both ("Berkas 4 · TikTok KASUS #06") so viewers can find the short.

## Screen layout (1920×1080)

```
┌──────────────────────────────────────────────────────────────┐
│ [K1][K2][K3][K4][K5][K6][K7][K8]         progress tab bar     │
│ ┌────────────┐   ┌───────────┐   ┌────────────────────────┐   │
│ │ BERKAS 4   │   │           │   │ BARANG BUKTI           │   │
│ │ Emas       │   │  short    │   │ • key figure 1 + src   │   │
│ │ katanya    │   │  9:16     │   │ • key figure 2 + src   │   │
│ │ aman       │   │ 608×1080  │   │ • (appear as spoken)   │   │
│ │ TikTok #06 │   │           │   │                        │   │
│ │ [suspect]  │   │           │   │ "Harganya": one line   │   │
│ └────────────┘   └───────────┘   └────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

- Centre: the finished short, scaled to 608×1080. Its burned-in captions stay readable.
- Left panel: the case file (Berkas N, title, TikTok number, a suspect mugshot of the case's "pelaku").
- Right panel: 3–4 evidence cards drawn from the short's existing sources, timed to when they're spoken, ending with one "Harganya" line (the cost to you). Only facts already in each `script-short.md`.
- Top: an 8-tab progress bar; the active case is lit and finished cases get a KASUS DITUTUP stamp.
- Between cases (5–8 s): a returning **evidence board** bridge. The finished case's folder is pinned and a red string runs to the next suspect, with one spoken link line.

## Audio and voice

- New narration (cold open, eight bridges, recap, close) is about 350 words (~2 min) with the existing voices. Muklis narrates, Nisa asks the "tapi tunggu" questions, and Beni reacts. It goes through the normal voice cache.
- Each short's own closing is trimmed in the compilation: the end card and its "tulis di komentar / follow" line, and the repeated "bukan saran investasi" chip stays only once on screen. Trim points come from each episode's `sync` timing (last section start).
- The shorts are already mastered at -14 LUFS. The compilation is a new mix (shorts + bridges + a low bed under bridges only) mastered once to -14 LUFS / -1 dBTP. The source shorts are read, never overwritten.

Estimated length: shorts without end cards ≈ 11:30, plus new parts ≈ 2:00, **≈ 13–14 min**.

## Recap and close

- **Recap table** (like a case summary): one row per case with Pelaku → Harganya → Langkahmu, all from the shorts' checklists. Closing line from Muklis: "Delapan tersangka, satu dalang: uang yang nilainya pelan-pelan turun, dan keputusan yang kita ambil waktu panik."
- **Question:** "Dari delapan kasus ini, mana yang paling kena di dompetmu? Tulis nomor kasusnya di komentar."
- **Personal last line (Nisa):** a short sincere note, for example "Kami bikin ini biar kamu nggak sendirian ngadepin harga yang terus naik."
- Subscribe and the Healing119 line on the end screen (because of the judol case).

## Build approach

Keep the shorts as finished video. Do not re-author their scenes.

1. A new episode `episodes/12_kompilasi/` (or a separate `compilations/` folder) with `format: long-16x9` and a manifest listing the source shorts in order with their trim points.
2. HyperFrames renders the 16:9 frame: panels, progress bar, bridges, cold open, recap and close, with a transparent or keyed centre slot. New scenes are needed only for these (~5 scene files).
3. FFmpeg places each short into the centre slot on the timeline and builds the audio. Then the normal mastering runs once.
4. Output `out/12-kompilasi-long.mp4`, with a `chapters.txt` (YouTube timestamps) and the full combined source list for the description.

This needs Phase 1–3 of [youtube-longform-design.md](youtube-longform-design.md) (the 16:9 format contract) plus one new pipeline step: compositing finished videos.

| Step | Model / effort (ai-routing) |
|---|---|
| Format contract + compilation manifest | Sonnet / high (contract review Opus / max) |
| Video compositing and audio mix step | Opus / high (mastering/audio) |
| Bridge, recap and close narration | Opus / high only if a line adds a new claim; otherwise Sonnet / medium |
| Frame scenes (panels, board, recap) | Sonnet / medium, one agent per scene |
| Description, chapters, title, thumbnail copy | Haiku |

## Before building

1. **Fix 03 (IHSG) and 08 (UMP) first.** Both have open editorial fixes, and the compilation would bake in the current versions.
2. Re-check dated figures (rupiah record, October inflation) against the publish date.
3. Decide: title, whether the side panels are worth the build cost (cheaper option: a plain branded background behind the short), and the case order above.
