# RUU Perampasan Aset (HOTWIZZ #12)

HotWizz Flash. Narrator: Nisa (wec, Cartesia). 6 lines, 784 chars (badak: 786 chars = 54.7 s), 30 fps, no baked bed. Researched Wed 18 Nov 2026 evening (Windows). Story broke Wed 18 Nov ~13:30-15:00 WIB (tingkat I); post right after the Thu 19 Nov paripurna with variant A, or Wed night/Thu morning with variant B.

Angle: Komisi III DPR and the government finished tingkat I on the RUU Perampasan Aset Terkait Tindak Pidana Korupsi dan Tindak Pidana Lainnya (Wed 18 Nov, chaired by Wakil Ketua DPR Sufmi Dasco Ahmad, all 8 fraksi agreed without notes). Viewer stake: victims of investasi/saham bodong can be compensated directly from the sale of the perpetrators' assets (Habiburokhman). Keep the condition: non-conviction seizure still goes through a court and, per the draft discussed, applies when the suspect fled, died or is permanently ill. Neutral: "disetujui tingkat I / rencananya dibawa ke paripurna" until two outlets report the plenary vote. Legal topic: "Bukan nasihat hukum" on screen (tanya sub, cover footer) and in the caption. Loop: `introCover: true`.

**Switched to variant A on Thu 19 Nov 2026 ~17:40 (Windows).** The paripurna (ke-13, Masa Sidang II 2026-2027, chaired by Ketua DPR Puan Maharani) passed the bill that day: detik, DDTC and Warta Ekonomi; Kompas headline. The hook person is now Puan (`people/puan.jpg`, plenary chair; Warta explicit, DDTC photo). The stamp cue is `mengesahkan`, and the cover title reads "*UU PERAMPASAN ASET*". New facts not used (one outlet each, so a second outlet is needed before use):
- 74 pasal (DDTC)
- pidana pajak dropped from the scope (DDTC)
- illicit enrichment left out (DDTC headline)
- "2 badan baru" (detik and DDTC headlines, articles not read)
- 361 of 573 members present (Warta)

The `syarat` line keeps "Di draf yang dibahas" because the final text's NCB triggers (kabur/meninggal/sakit permanen) are not yet reported by two outlets.

## Status switch (only the hook line, cover chip and stamp change)

| | Variant B (now, true Wed 18 Nov evening) | Variant A (after paripurna passes it, Thu 19 Nov) |
|---|---|---|
| hook line | Aset koruptor bakal bisa dirampas tanpa menunggu putusan pidana. RUU Perampasan Aset disetujui semua fraksi, dan rencananya besok dibawa ke paripurna. | Aset koruptor bakal bisa dirampas tanpa menunggu putusan pidana. DPR resmi mengesahkan RUU Perampasan Aset jadi undang-undang di rapat paripurna. |
| hook stamp | DISETUJUI TINGKAT I | DISAHKAN DPR |
| hook kicker / tag | KOMISI III · RABU 18 NOV / 8 FRAKSI SETUJU · PARIPURNA RENCANANYA KAMIS | PARIPURNA DPR · KAMIS 19 NOV / DISAHKAN JADI UU · TINGGAL DIUNDANGKAN |
| hook label | TINGKAT I | DISAHKAN |
| cover chip | DISETUJUI TINGKAT I | DISAHKAN DPR |
| caption line 2 | "...menyetujui RUU Perampasan Aset di tingkat I (18/11); rencananya dibawa ke paripurna Kamis 19/11." | "DPR mengesahkan RUU Perampasan Aset jadi undang-undang di paripurna Kamis (19/11); berlaku setelah diundangkan." |

`narration.json` holds variant B (marked in its `comment`). Switch to A only after two outlets report the plenary approval; if Bamus moves the plenary, B stays true but "besok" must become "di paripurna terdekat" (re-voice the hook only). Variant A keeps "bakal bisa" (a UU applies only after it is promulgated: UU 12/2011 Pasal 87, primary text).

## Script

| Section | Line (variant B) | On screen (template · kicker · text) | Sources |
|---|---|---|---|
| hook | Aset koruptor bakal bisa dirampas tanpa menunggu putusan pidana. RUU Perampasan Aset disetujui semua fraksi, dan rencananya besok dibawa ke paripurna. | hw-hook · KOMISI III · RABU 18 NOV · "ASET KORUPTOR / *DIRAMPAS TANPA VONIS*", claim "Bisa dirampas *tanpa menunggu putusan pidana*, tetap lewat pengadilan", tag "8 FRAKSI SETUJU · PARIPURNA RENCANANYA KAMIS", stamp DISETUJUI TINGKAT I | S1, S2, S4 (no-verdict procedure); S3, S5, S6, S7 (tingkat I, all fraksi); S8, S9, S10 (plenary "besok") |
| korban | Kalau kamu korban investasi bodong, kata Ketua Komisi Tiga Habiburokhman, ganti ruginya bisa langsung dari penjualan aset pelaku, bukan ke negara dulu. | hw-quote · KORBAN INVESTASI BODONG · "Bisa langsung mendapatkan *ganti kerugian* dengan penjualan aset para pelaku." (detik, Suara, kumparan, 18 Nov) | S11, S12, S10, S13 |
| tanya | Kamu setuju aset koruptor dirampas tanpa nunggu vonis? Tulis di komentar, lalu simak syaratnya. | hw-art gavel · TULIS DI KOMENTAR · "SETUJU DIRAMPAS / *TANPA VONIS*?", sub "Bukan nasihat hukum" (lands at ~21 s) | — |
| syarat | Prosesnya tetap lewat sidang pengadilan. Di draf yang dibahas, jalur ini untuk tersangka yang kabur, meninggal, atau sakit permanen. | hw-resmi · MENURUT DRAF · "Tetap lewat *sidang pengadilan*" / "Tersangka *kabur, meninggal*, sakit permanen" / "Ancaman pidana *tetap berlaku*" | S1, S4, S8 (court: point 4); S14, S15, S16 (draft conditions); S1, S2 (point 3 penalties stay) |
| lindung | Aset dikembalikan ke korban dan dipakai untuk kepentingan umum. Pihak ketiga yang beriktikad baik dilindungi, dan badan independen ikut mengawasi. | hw-resmi · 10 POKOK RUU · "Dikembalikan ke *korban*" / "Dipakai untuk *kepentingan umum*" / "Pihak ketiga beriktikad baik *dilindungi*" / "Diawasi *badan independen*" | S1, S4, S8, S7 (points 5, 6, 8) |
| penutup | Jadi, setuju aset koruptor dirampas tanpa nunggu vonis? Jawab di komentar, dan follow untuk update berikutnya. | hw-cover · JAWAB DI KOMENTAR / SETUJU *TANPA VONIS*? / FOLLOW UNTUK UPDATE, footer "Bukan nasihat hukum"; cover title "*RUU PERAMPASAN ASET* / RAMPAS ASET / TANPA VONIS", chip DISETUJUI TINGKAT I | — |

Cover title alternative (search words first): "*RUU PERAMPASAN ASET* / DISAHKAN?" (B) or "*UU PERAMPASAN ASET* / SAH" (A). Comment question uses "dirampas" (the legal term; "disita" is a different, earlier step in the bill's procedure).

## Sources (all 18 Nov 2026 WIB unless noted)

| # | Outlet, time | What it supports |
|---|---|---|
| S1 | CNBC Indonesia 13:38 ("Tok! RUU Perampasan Aset Disetujui DPR...") | Full title; Dasco chaired; Habiburokhman (Ketua Komisi III and Panja) reported; 397 DIM (160 tetap, 135 redaksional, 40 substansi, 44 dihapus, 18 substansi baru); 10 points: scope incl. "investasi bodong, perdagangan saham bodong"; penalties stay incl. pidana mati; point 4 "hukum acara perampasan aset tanpa putusan pidana" from penelusuran to "pemeriksaan di sidang pengadilan, putusan pengadilan"; point 5 "pihak ketiga yang beritikad baik"; point 6 return to victims + public use; point 7 "badan yang kompeten"; point 8 "badan yang independen"; point 9 no abuse of authority |
| S2 | Antara 14:32 | Tingkat I raker, Dasco's tingkat II question with the full title; Wamenkum Eddy Hiariej for the government; investasi/saham bodong; penalties incl. pidana mati; "rapat paripurna terdekat" |
| S3 | detikNews 14:23 (d-8758451) | "rapat pengambilan tingkat I"; "Seluruh fraksi menyatakan sepakat RUU tersebut dibawa ke paripurna"; fraksi and government signed the text; Wamensesneg Bambang Eko Suhariyanto, Wamenkum Eddy Hiariej |
| S4 | Katadata 17:50 | Same 10 points (point 4 "tanpa putusan pidana"); 397 DIM; final draft 74 pasal |
| S5 | CNN Indonesia 14:50 | Eight fraksi (all in Komisi III), "tanpa catatan"; no official plenary date; DPR commitment "paling lambat tanggal 15 Desember 2026" |
| S6 | kumparan 14:56 | Eight fraksi agreed; 10 points (kumparan words point 4 "tanpa tuntutan pidana": conflict, see below) |
| S7 | IDN Times 16:37 | Points 5, 6, 8 (third parties, victims + public, independent oversight); Habiburokhman "Iya (disahkan di rapat paripurna besok)" |
| S8 | CNBC Indonesia 15:13 ("DPR Sahkan RUU Perampasan Aset jadi Undang-Undang Besok") | Plenary Thu 19 Nov: Habiburokhman "Iya (rapat paripurna besok)"; points 4-6 |
| S9 | Beritasatu 16:04 | Habiburokhman: plenary likely Thu 19 Nov, could change if Bamus postpones ("Kapan tanggalnya kita masih menunggu, tetapi yang jelas terdekat"); Dasco "paripurna terdekat"; 87 RDPU |
| S10 | kumparan 16:36 | Habiburokhman "Iya (paripurna besok)"; victims of investasi/saham bodong compensated directly from asset sales, not via the state first |
| S11 | detikNews 15:18 (d-8758578) | Habiburokhman verbatim: "Kabar baik buat para korban investasi bodong ya, perdagangan saham bodong..."; "ganti kerugiannya nggak langsung kepada mereka, selama ini ke negara dulu"; "bisa langsung mendapatkan ganti kerugian dengan penjualan aset para pelaku" |
| S12 | Suara 19:21 | Same quote ("bisa langsung mendapatkan ganti kerugian dengan penjualan aset"); "peluang menjadikan undang-undang ini alat kekuasaan insyaallah sudah tertutup" |
| S13 | RRI 17:03 | "Karena ganti kerugiannya enggak langsung kepada mereka" (victims had complained to Komisi III) |
| S14 | IDN Times 9 Nov 20:29 | Draft (government DIM): Pasal 6 ayat 1 categories incl. suspect/defendant died, fled, permanently ill, perpetrator unknown; NCB stopped by penetapan hakim if the suspect is caught (agreed); NCB does not remove criminal liability (Pasal 6A, agreed) |
| S15 | CNBC Indonesia 12 Nov 08:05 | Draft (DIM 66, Timus-Timsin 11 Nov, "telah mendapatkan persetujuan tim perumus"): flee, die, permanent illness |
| S16 | Radar Malang (JawaPos group) 16:30 | Bill "nantinya mengatur" seizure when suspect/defendant dies, flees, is permanently ill or cannot be located; 8 fraksi "tanpa catatan" |
| P1 | UU 12/2011 Pasal 87 (primary) | A UU applies from promulgation unless it says otherwise (variant A "bakal bisa") |

Tonight check (~19:30-20:30 WIB): no report of a postponement found; no official Bamus schedule or DPR agenda for Thu 19 Nov found either (last listed plenary: ke-12 on 17 Nov, emedia.dpr.go.id). Dasco did not name a date; Habiburokhman and Nasir Djamil (PKS) said Thursday.

## Wording conflict

"tanpa putusan pidana" (CNBC S1/S8, Katadata S4, IDN Times S7) vs "tanpa tuntutan pidana" (kumparan S6). Narration says "tanpa menunggu putusan pidana" (majority wording; final text not published).

## Do not use (or only after the bill text is out)

- Value threshold "minimal Rp1 miliar" (Pasal 6 ayat 2): only in the draft (IDN Times 9 Nov, CNBC 12 Nov "persetujuan tim perumus"); no 18 Nov report confirms it survived into the final text (the 10 points only say "jenis, nilai, dan kriteria aset").
- "Unexplained wealth" / harta tak seimbang dengan penghasilan: not found in any 18 Nov report.
- Objection rights (keberatan/perlawanan) and a compensation mechanism beyond "ganti kerugian dari penjualan aset": not found. Only point 5 (third parties: burden of proof, chance to be heard).
- Agency name (Kejaksaan, DJKN, a new body): not named; only "badan yang kompeten" (management) and "badan yang independen" (oversight).
- "Disahkan" / "sah jadi UU" before two outlets report the plenary vote (the "Tok! ... Disetujui DPR" headline means tingkat I only).
- "Delapan fraksi DPR" as if it were the plenary: it is the 8 fraksi in Komisi III at tingkat I.
- "Sejak 2008" / "belasan tahun tertunda": not confirmed in today's reports.
- Four DPR leaders' 27 Aug pledge to resign if the bill misses 15 Dec (CNN only, not cross-checked).
- "74 pasal" (Katadata only); 87 RDPU is two outlets (Beritasatu, kumparan) but not needed.
- Hukuman mati: the bill only keeps existing death-penalty threats "sesuai ketentuan perundang-undangan"; never "koruptor dihukum mati".
- Order "korban dulu, baru kepentingan umum": point 6 lists both, no order stated.
- Rp/aset totals, case names, any named company or platform.

## Photos

- In the library: `people/dasco.jpg` (Wakil Ketua DPR, chaired the tingkat I meeting; DPR RI, public domain) used on hook + cover for now; `people/puan.jpg` (Ketua DPR, will chair or attend the plenary: good for variant A if she bangs the gavel; check who chairs).
- Missing, recommended: Habiburokhman (Ketua Komisi III and Panja; he is quoted and should be the cover face). Commons `File:DPR_Habiburokhman.jpg` (KPU infopemilu portrait, 4 Oct 2023, public domain in Indonesia under UU 28/2014 Pasal 43; used on en/id Wikipedia). Avoid `Habiburokhman_Ketua_Komisi_III.jpg` and `Habiburokhman_2024.jpg` (CC0 "own work" uploads of what look like official portraits: doubtful). After adding it (450x600, `people.json` entry), set `korban.person.photo` and switch the cover person to Habiburokhman; caption credit "Foto: KPU; DPR RI (domain publik)".
- Optional: Eddy Hiariej (Wamenkum, signed for the government) only if a scene shows the government side; not needed.

Check by ear after voicing: RUU ("er u u"), Habiburokhman ("Habiburohman"), "beriktikad", "Komisi Tiga".
