# Gibran Serahkan Surat Mundur? (HOTWIZZ #09)

HotWizz Flash, fast follow-up to #08 `makzul` (posted 11 Nov ~19:20 WIB). Narrator: Nisa (wec, Cartesia). 6 lines, 803 chars (~50–54 s), 30 fps, no baked bed. **Story broke: Wed 11 Nov 2026 ~19:05 WIB** (Suara 19:05, Republika/kumparan 19:16, Katadata 19:20, Viva 19:41, Pedoman 20:32). Researched and scripted on Windows 11 Nov ~20:30–21:00. **Post tonight or by Thu 12 Nov ~09:30** (before the 10:00-ish MPR/paripurna news lands); if official confirmation appears first, swap to Variant B.

Angle: the news is a **claim by Projo's chairman**, not yet official. Hook = the claim, attributed. Then what is confirmed vs not, what happens Thursday, the resignation road (Pasal 8 ayat 2), and whether the HMP still runs. Retention rules apply; loop: `introCover: true` on the hook, so frame 0 = last frame = the title cover ("SURAT MUNDUR / GIBRAN / SUDAH ADA?", red on the first line, chip KATA PROJO, stamp HOTWIZZ #09, **no face**; #06/#07 had the face, #08 had no face with red on the last line).

## Script: Thursday version "KE MPR HARI INI" (in narration.json now, 12 Nov ~09:30)

Tightened per the #08 lesson: 5 lines, 651 chars (~42 s), one procedure line, comment question in line 3 of 5. `besok` and `hmp` merged into `paripurna`. Variant A files backed up to `.cache/backup/20-surat-{narration,episode}.variantA.json`.

| Section | Scene | Line | Sources |
|---|---|---|---|
| hook | hw-hook (stamp BELUM DITERIMA on **hari**) | Wakil Ketua MPR menyebut Gibran dijadwalkan menyerahkan surat pengunduran diri ke pimpinan MPR hari ini. | S8 |
| status | hw-resmi STATUS KAMIS PAGI | Surat itu disebut sudah diserahkan ke Presiden Prabowo di Halim, kata Ketua Projo Budi Arie. Tapi Istana belum mengonfirmasi, dan Ketua MPR Ahmad Muzani mengaku belum melihat suratnya. | S1, S2, S9 |
| paripurna | hw-art dpr, stamp MENURUTMU? | Siang ini, paripurna DPR tetap mengumumkan usulan pemakzulan dari seratus dua puluh anggota. Menurutmu, usulan itu masih perlu jalan kalau Gibran mundur? Tulis di komentar. | S4, S10, S11 |
| mundur | hw-art dokumen (unchanged) | Kalau surat sampai ke MPR dan kursi wakil presiden kosong, MPR bersidang memilih pengganti dari dua calon usulan Presiden, paling lambat enam puluh hari. | L1 |
| penutup | hw-cover "*SURAT MUNDUR* / GIBRAN / KE MPR HARI INI?", chip KATA PIMPINAN MPR, Gibran photo | Follow untuk update hasilnya hari ini. (`after: 1.4`) | — |

"Siang ini" holds only if posted before the 14:00 paripurna; after it, rewrite `paripurna` to what it did.

### Switch after the MPR handover (5-line shape)

- **MPR confirms receipt (B-2):** hook "MPR menyatakan sudah menerima surat pengunduran diri Gibran dari jabatan wakil presiden." status "[Nama, jabatan] menyampaikannya Kamis [jam]. Sebelumnya, Ketua Projo Budi Arie menyebut surat itu diserahkan ke Presiden Prabowo di Halim." paripurna: keep, or "Sementara itu, paripurna DPR siang ini tetap mengumumkan usulan pemakzulan. Menurutmu, usulan itu masih perlu jalan? Tulis di komentar." (Mardani/PKS: HMP runs until the resignation is final at the MPR, S11). Cover "*SURAT MUNDUR*\nGIBRAN\nDITERIMA MPR", chip KATA MPR, hook stamp DITERIMA MPR. Re-voice hook, status (and paripurna if changed).
- **Gibran comes/hands over but MPR has not announced:** keep this version, swap "dijadwalkan menyerahkan" for the verified fact.
- **Denial (Istana/Setwapres):** hook "Istana membantah klaim bahwa Gibran sudah menyerahkan surat pengunduran diri." chip ISTANA MEMBANTAH.

## Script (Variant A, superseded 12 Nov 09:30)

| Section | Scene | Line | Sources |
|---|---|---|---|
| hook | hw-hook | Ketua Projo Budi Arie menyebut Gibran sudah menyerahkan surat pengunduran diri ke Presiden Prabowo di Halim. | S1 |
| status | hw-resmi | Sampai Rabu malam, Istana belum mengonfirmasi surat itu. Yang resmi baru niat mundur Gibran, kata Mensesneg hari Selasa, dan usulan hak menyatakan pendapat dari seratus dua puluh anggota DPR. | S2, S3, S4 |
| besok | hw-split (MPR / DPR) | Kamis besok jadi penentu. Surat itu dikabarkan dibawa ke MPR, dan di hari yang sama, paripurna DPR membahas usulan tersebut. | S6, S5 |
| mundur | hw-art (dokumen) | Kalau surat sampai ke MPR dan kursi wakil presiden kosong, MPR bersidang memilih pengganti dari dua calon usulan Presiden, paling lambat enam puluh hari. | L1 |
| hmp | hw-art (dpr) | Usulan pemakzulan sendiri belum berhenti. Sejumlah anggota DPR dan Mahfud menyebut prosesnya tetap jalan sampai surat resmi diterima. | S7 |
| penutup | hw-cover | Menurutmu, usulan pemakzulan sebaiknya tetap jalan? Tulis di komentar dan follow untuk update. (`after: 1.4`) | — |

Chars: hook 108, status 191, besok 124, mundur 153, hmp 133, penutup 94 = **803**.

Cues: hook headline pop on **menyerahkan**, stamp BELUM RESMI on **Halim**; status rows **Istana** → **niat** → **seratus**; besok MPR row on **MPR**, DPR row on **paripurna**; mundur headline on **memilih** (stamp MAKS 60 HARI 9 frames later); hmp headline on **jalan**; penutup **Menurutmu** → **usulan** → **Tulis** → **follow**.

Stills 0/5/10 s: 0 s = cover (SURAT MUNDUR GIBRAN SUDAH ADA?, KATA PROJO); ~5 s = hook with claim "Projo: surat diserahkan ke Prabowo di Halim" + BELUM RESMI stamp; ~10 s = status card with "Surat: belum dikonfirmasi Istana" / "niat mundur" rows.

Say map: DPR → "de pe er", MPR → "em pe er". No line ends on a spoken number. Spoken "Mahfud" (screen says MAHFUD MD) to avoid "MD" being read oddly. "Menyebut", "dikabarkan", never "resmi mundur".

## Variant B (official confirmation; swap tomorrow)

Pick B-1 or B-2 depending on what is official. Fill the [brackets] from the actual statement; two outlets as usual. Penutup and `mundur` stay as in A unless noted.

### B-1: Istana / Setwapres / Mensesneg confirms the letter (MPR has not received it yet)

Lines that change: **hook + status only** (2 lines, re-voice those two sections).

| Section | Line (B-1) |
|---|---|
| hook | Istana membenarkan Gibran sudah menyerahkan surat pengunduran diri ke Presiden Prabowo. |
| status | Konfirmasi itu disampaikan [Mensesneg Prasetyo Hadi] [Kamis pagi]. Sebelumnya, Ketua Projo Budi Arie menyebut surat diserahkan di Halim, dan seratus dua puluh anggota DPR mengajukan hak menyatakan pendapat. |

Props that change (episode.json):
- hook: `kicker`/`label` "RESMI"; `claim` "Istana: surat diserahkan ke *Prabowo*"; `tag` "[JABATAN NAMA] · [HARI TGL]"; `stamp.text` "DIKONFIRMASI" (cue "Prabowo") or drop the stamp; `cue` stays "menyerahkan".
- status: `title`/`label` "STATUS [KAMIS PAGI]", `kicker` "[TGL · JAM]"; items: "Surat *dikonfirmasi* Istana" (cue "Konfirmasi"), "Projo lebih dulu: *diserahkan di Halim*" (cue "Projo"), "120 anggota DPR *ajukan HMP*" (cue "seratus").
- penutup `cover`: title "*SURAT MUNDUR*\nGIBRAN\nDIKONFIRMASI", chip "KATA ISTANA".
- `besok` stays as long as the MPR handover is still only reported; if Istana itself names the MPR date, change "dikabarkan dibawa" to "dijadwalkan dibawa" (1 word, re-voice `besok`).

### B-2: MPR says it has received the letter

Lines that change: **hook, status, besok, hmp** (4 lines; `mundur` and penutup unchanged).

| Section | Line (B-2) |
|---|---|
| hook | MPR menyatakan sudah menerima surat pengunduran diri Gibran dari jabatan wakil presiden. |
| status | [Nama, jabatan] menyampaikannya [Kamis pagi]. Sebelumnya, Ketua Projo Budi Arie menyebut surat itu diserahkan ke Presiden Prabowo di Halim. |
| besok | [Kamis ini, paripurna DPR tetap membahas usulan hak menyatakan pendapat dari seratus dua puluh anggota DPR.] (rewrite to what the paripurna actually did) |
| hmp | Sejumlah anggota DPR dan Mahfud sebelumnya menyebut, begitu surat resmi diterima, usulan pemakzulan bisa dihentikan. |

Props: hook kicker "RESMI", claim "MPR: surat *sudah diterima*", stamp "DITERIMA MPR"; status items to match; besok split rows to the actual outcome; hmp headline "HMP\n*DIHENTIKAN?*", sub "Jika surat resmi diterima"; cover title "*SURAT MUNDUR*\nGIBRAN\nDITERIMA MPR", chip "KATA MPR".

If instead Istana/Setwapres **denies** the letter: hook "Istana membantah klaim Ketua Projo bahwa Gibran sudah menyerahkan surat pengunduran diri." and status updated; cover chip "ISTANA MEMBANTAH".

## Sources: law (primary text)

| # | Claim | Text |
|---|---|---|
| L1 | Pasal 8 (2) UUD 1945: "Dalam hal terjadi kekosongan Wakil Presiden, selambat-lambatnya dalam waktu enam puluh hari, Majelis Permusyawaratan Rakyat menyelenggarakan sidang untuk memilih Wakil Presiden dari dua calon yang diusulkan oleh Presiden." Same wording as #08 `mundur`. | UUD 1945 satu naskah, JDIH Kemenkeu (jdih.kemenkeu.go.id/download/9d9e91bd-e9f0-4e8c-86f1-c6841cf834f3/UUD1945dlmsatunaskah.pdf); Wikisource (id.wikisource.org/wiki/Undang-Undang_Dasar_Negara_Republik_Indonesia_Tahun_1945) |

## Sources: news (two outlets per claim, or drop it)

| # | Claim | Outlets, date/time (WIB), URL |
|---|---|---|
| S1 | Ketum Projo Budi Arie Setiadi, asked to confirm: "[Gibran mundur] betul" and "[Diserahkan di Halim] betul" — the resignation letter handed to Prabowo at Lanud Halim Perdanakusuma, Wed 11 Nov. Budi gave no further detail (no time, no announcement plan). | kumparan 11 Nov 19:16 (kumparan.com/kumparannews/projo-gibran-mundur-dari-wapres-sampaikan-surat-pengunduran-ke-prabowo-di-halim-28YMoRMqycm); Viva 11 Nov 19:41 (viva.co.id/berita/nasional/1942879-ketum-projo-sebut-gibran-mundur-dari-wapres); Suara 11 Nov 19:37 (suara.com/news/2026/11/11/193732/tunggu-prabowo-mendarat-di-halim-gibran-sampaikan-pengunduran-diri-dari-jabatan-wapres) and 19:05 (suara.com/news/2026/11/11/190544/…); Republika 11 Nov 19:16 ("Betul", mundur only; news.republika.co.id/berita/toc7ep409); IDN Times ("Gibran Beneran Mundur? Budi Arie: Betul", idntimes.com/news/indonesia/gibran-beneran-mundur-budi-arie-betul-00-jkxzp-yzmmxg; page would not load, seen via search) |
| S2 | No official confirmation of the letter from Istana / Setwapres as of Wed evening: Republika waited at Istana Wapres and got no official statement; Suara still trying to reach Setwapres; Katadata sought comment from Wapres special staff Tina Talisa (no reply reported); kumparan cites only Budi Arie. | Republika 11 Nov 19:16 (above); Suara 11 Nov 19:05 (above); Katadata 11 Nov 19:20 (katadata.co.id/berita/nasional/6af446ef66deb/wapres-gibran-dikabarkan-teken-surat-pengunduran-diri-sore-ini); Lintas Priangan 11 Nov ("Belum ada keterangan resmi yang memastikan surat pengunduran diri telah diajukan kepada MPR") |
| S3 | Mensesneg Prasetyo Hadi, Tue 10 Nov: Gibran "menyatakan niatan untuk mengundurkan diri" to Prabowo (~2.5 h meeting); Prabowo did not reject it; Gibran asked for a chance to prove the documents at PTUN. | CNN Indonesia 10 Nov 15:20 (cnnindonesia.com/nasional/20261110152027-32-1425457/pernyataan-lengkap-istana-soal-permohonan-gibran-untuk-mundur); detik (news.detik.com/berita/d-8746837); Kompas.id ("Mensesneg: Wapres Gibran Berniat Mengundurkan Diri"); Republika 11 Nov 19:16 recap |
| S4 | Wed 11 Nov midday: 120 DPR members from 8 factions formally submitted the HMP to the DPR leadership (Saan Mustopa). Republika's "HMP Lolos di DPR" headline (19:14) means filed with 120 signatures, not a vote. | CNN Indonesia 11 Nov 13:39 (cnnindonesia.com/nasional/20261111133951-32-1425862); Kompas.com 11 Nov 14:30 (nasional.kompas.com/read/2026/11/11/14302371); Katadata (katadata.co.id/berita/nasional/6af4203fb62f3); Suara 11 Nov 15:29 |
| S5 | HMP proposal goes to the DPR paripurna on Thu 12 Nov (Saan: "berdasarkan jadwal, rapat paripurna itu kita besok akan lakukan"; via rapim and Bamus or a replacement consultation meeting). | Suara 11 Nov 15:29 (suara.com/news/2026/11/11/152944/…); Beritasatu 11 Nov 14:59 (beritasatu.com/nasional/3040304); TIMES Indonesia/Antara (timesindonesia.co.id/politik/617183); Suara Surabaya 11 Nov 17:05 |
| S6 | Letter **reportedly** to be taken to MPR on Thu 12 Nov (unnamed sources). | Katadata 11 Nov 19:20 ("Setelah meneken surat pengunduran diri, Gibran akan menyerahkannya kepada MPR, Kamis (12/11)"; no clock time); Kaidah.id headline "…Surat Pengunduran Diri Diserahkan ke MPR Kamis Besok" (kaidah.id/headline/read/24087; page refused connection, seen via search; the search snippet says 10.00 WIB and "belum ada konfirmasi resmi") |
| S7 | HMP keeps running until an official resignation letter exists; DPR would drop it once there is one. | TribunWow ("DPR Tegaskan Tetap Lanjutkan Hak Menyatakan Pendapat Pemakzulan Gibran sebelum Ada Surat Resmi", wow.tribunnews.com/news/413349); Tribunnews ("DPR akan Batalkan Hak Menyatakan Pendapat jika Sudah Ada Surat Resmi…", tribunnews.com/nasional/7909533); PKB Khozin: "mekanisme di DPR jalan terus meski Gibran berniat mundur" (detik d-8747880; Suara 11 Nov 13:26); Mahfud MD: impeachment continues until a letter arrives, then "semua proses berpindah ke soal berhenti karena mengundurkan diri" (CNN 11 Nov 08:54, Suara 11 Nov 09:59; see #08 Context) |
| S8 | Wakil Ketua MPR Bambang Wuryanto (Pacul): Gibran "dijadwalkan menyerahkan surat pengunduran dirinya secara langsung kepada pimpinan MPR pada Kamis (12/11/2026)"; "Iya bener sudah terinfo"; "Ya pimpinan MPR standby menerima kedatangan Mas Wapres". **No time**: "Jam kedatangan belum dipastikan." | Liputan6 12 Nov 07:59 (liputan6.com/news/read/8333600); Merdeka 12 Nov 08:21 (merdeka.com/politik/read/8333609). Also Suara 11 Nov 22:39 (PAN's Sudding: "Iya infonya seperti itu") |
| S9 | Ketua MPR Ahmad Muzani, Wed 11 Nov evening: "Saya belum dengar, saya belum lihat. Jadi belum bisa ngambil (kesimpulan)." | Suara 12 Nov 05:28 (suara.com/news/2026/11/12/052811); IDN Times 12 Nov 07:15 (at NasDem's HUT event); Tribunnews 7910252 (403, seen via search) |
| S10 | DPR paripurna Thu 12 Nov, agenda "pengumuman usul penggunaan hak anggota" (HMP); moved from 10.00 to **14.00 WIB** by DPR letter B/15920/LG.01.01/11/2026. Announcement is not a decision to impeach. | Kompas.com 12 Nov 06:09 (nasional.kompas.com/read/2026/11/12/06094411); Suara 12 Nov 08:31 (suara.com/news/2026/11/12/083100); IDN Times 12 Nov 07:15; TIMES Indonesia 617310 |
| S11 | Mardani Ali Sera (PKS): "Jika pengunduran diri belum final maka kami akan terus jalan dengan HMP (di rapat paripurna)." | IDN Times 12 Nov 07:15 (idntimes.com/news/indonesia/pks-gibran-mundur-tak-hentikan-hmp-…); with S7 (PKB Khozin, Mahfud) for "tetap jalan" |
| S1+ | CNN Indonesia 11 Nov 19:39: "Betul (mundur), surat sudah diserahkan ke Presiden tadi sore di Halim," kata orang dekat Gibran (anonymous). Supports S1; still not official. | cnnindonesia.com/nasional/20261111180550-32-1426022 |

Context (not narrated):
- Halim timing: Prabowo flew from Halim to Aceh (Nagan Raya) on Wed morning (CNBC 11 Nov 09:38; Republika); Suara 19:05/19:37 says the letter was reportedly given as Prabowo landed back at Halim, with Gibran waiting for him. The hook says only "di Halim".
- Katadata 19:20: Gibran "dikabarkan meneken surat pengunduran diri" (unnamed sources, Wed afternoon to evening).
- Kepala Bakom Syahganda Nainggolan denied that Prabowo advised Gibran to "fight" at PTUN (CNN 10 Nov 23:17 and 11 Nov 05:59; Okezone; Republika).
- Yusril: no vacancy yet; a formal resignation needs a written statement to MPR; MPR then elects within 60 days from the President's letter (search summaries of Viva / Lintas Priangan; not checked in two outlets).
- Newest item found: Pedoman 11 Nov 20:32 "BREAKING NEWS: Gibran Resmi Mundur sebagai Wapres", based only on Budi Arie's "betul"; no official source. As of ~21:00 no Istana, Setwapres, Mensesneg, MPR or Gibran statement confirming or denying the letter.

## Do not use

- "Gibran resmi mundur" / "Gibran sudah mundur" as fact (Pedoman headline rests only on Budi Arie).
- Istana Wapres press conference "mendadak dibatalkan" tonight: IDN Times only (single source).
- "Surat ke MPR pukul 10.00": Katadata gives no time; Kaidah.id (only source for 10.00) could not be opened.
- Paripurna "pukul 10.00 WIB, Gedung Nusantara II": the outlets I could open (Suara, Beritasatu, TIMES/Antara, Suara Surabaya, Pelita Karawang) give no time; narration says only "Kamis". Add the time on screen only after two outlets show it.
- "MPR (Bambang Pacul): belum ada surat dari Gibran": Liputan6 13:17 and Okezone 15:58 show Pacul's "Ya belum ada lah" was about the DPR's HMP letter, not a Gibran resignation letter.
- Projo Sekjen Freddy Damanik "belum formal": not found in any outlet checked.
- Mediakompeten "12 Nov" Budi Arie quote ("Mas Gibran sudah mengundurkan diri"): unverified date, single outlet.
- 122 signatories (Beritasatu); use 120 (CNN, Kompas, Katadata, Suara).
- "makar", "Jokowi menahan Gibran", platform names.
- (12 Nov) "Surat ke MPR pukul 10.00": only Suara 22:39's unattributed lead and IDN's "diisukan"; Liputan6/Merdeka say the time is not set. Narration says "hari ini" only.
- (12 Nov) "172 anggota" (Kompas, said orally); use 120. IDN Times labels Muzani PKS (wrong: Gerindra). CNN photo caption "resmi mundur" (body says "dikabarkan"). Any claim that Gibran himself confirmed the letter (search summary only, no article).

## Photo credits

- Gibran Rakabuming Raka (hook, B&W): Darwis Triadi / Kemensetneg (domain publik), commons.wikimedia.org/wiki/File:Gibran_Rakabuming_2024_official_portrait.jpg. No Budi Arie photo in `assets/shared/people/`, so he is named in the line, kicker and tag only.

## Caption (draft)

```
Ketua Projo Budi Arie menyebut Gibran sudah menyerahkan surat pengunduran diri ke Presiden Prabowo di Halim, Rabu (11/11). Sampai Rabu malam belum ada konfirmasi resmi dari Istana. Yang resmi: niat mundur (Mensesneg, 10/11) dan usulan hak menyatakan pendapat dari 120 anggota DPR (11/11). Kamis (12/11): surat dikabarkan dibawa ke MPR, paripurna DPR bahas usulan HMP.

Sumber: kumparan, Viva, Suara, Republika (11/11 malam); Katadata (11/11); CNN Indonesia, Kompas, detik (10–11/11); UUD 1945 Pasal 8 ayat 2.
Foto: Darwis Triadi / Kemensetneg (domain publik).

#HotWizz #gibran #dpr #mpr #fyp
```

## Before voicing

1. Recheck (5 min): Istana / Setwapres / Mensesneg statement on the letter? MPR received it? Gibran himself? Paripurna time confirmed in two outlets? If confirmed, swap to Variant B-1 or B-2 (lines listed above); if denied, use the denial hook.
2. `node scripts/motion.mjs validate surat` (passes for Variant A).
3. `node scripts/motion.mjs voice surat` (~803 Cartesia chars; B-1 re-voices only hook + status). Check by ear: "Projo", "Budi Arie", "Halim", "Mensesneg", "DPR", "MPR", "hak menyatakan pendapat", "seratus dua puluh", "Mahfud".
4. Stills at 0, 5, 10 s and the last frame (must match frame 0); render; caption to `out/caption/20-surat-caption.txt`.
