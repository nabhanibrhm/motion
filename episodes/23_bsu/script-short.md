# KASUS #14 · BSU Rp900 Ribu: Kamu Dapat? (`bsu`, episode 23)

Research and script 13 Nov 2026 (WSL, ~11:00 WIB). Scaffolded with `new bsu --format kasus --number 23`.
Narator: Muklis (mog), Nisa (wec), Beni (bog), Cartesia. 7 baris, 6 scenes, 30 fps, tanpa bed. Not voiced yet.
Regulation topic: on screen and in the caption "Ringkasan Permenaker 16/2026, bukan nasihat hukum" (not spoken). No bank, company or app names; only the two official `.go.id` sites on screen.

**Verdict:** the rule is real and in force (Permenaker 16/2026, 28 Okt 2026), the money is **not** paid yet. As of 9 Nov the Menaker said the process is still at the Kementerian Keuangan; plan is November-Desember with no date; the status check on bsu.kemnaker.go.id is not open (checked 13 Nov).

## Retensi (cek sebelum voice)

- Topik: mengubah sesuatu buat penonton biasa (gaji, cuti, harga, dokumen, denda). Topik pasar/prosedur hanya kalau ada sudut "kamu".
- Hook: klaim dengan "kamu" di dalamnya ("Kantor nahan ijazahmu? Sekarang dilarang UU."), bukan lembaganya.
- Baris 2: apa artinya buat kamu. Latar, angka pembukuan dan prosedur belakangan, atau cukup di layar.
- Pertanyaan komentar sekitar detik 20 (Beni bertanya), lalu diulang di vonis.

Check for this script: hook "Kamu bisa dapat BSU ... belum cair" (kamu + claim + twist, shock fact "belum cair" lands at ~5 s); line 2 is the yes/no check; Beni's "Kamu masuk syarat ini atau nggak?" starts at ~18-19 s; verdict repeats it. Bookkeeping (13,3 juta pekerja, ~Rp12 T, regional caps) is on screen only.

## Naskah

| # | Scene | Speaker | Line | Sources |
|---|---|---|---|---|
| 1 | hook | Nisa | Kamu bisa dapat BSU sembilan ratus ribu rupiah, tapi sampai sekarang uangnya belum cair. | S1, S3, S7; belum cair: S5, S6, S9 |
| 2 | syarat | Muklis | Syaratnya kamu peserta aktif BPJS Ketenagakerjaan sampai Agustus dan gajimu paling banyak tiga koma lima juta atau UMK daerahmu kalau lebih tinggi. Kamu juga bukan ASN, TNI, atau Polri. | S1, S3, S4 |
| 3 | syarat | Beni | Kamu masuk syarat ini atau nggak? Tulis jawabanmu di komentar. | (comment question, ~19 s) |
| 4 | patokan | Muklis | Patokannya upah pokok plus tunjangan tetap yang dilaporkan kantormu ke BPJS. Kalau datanya keliru minta HRD memperbaikinya. | S1, S4, S6 |
| 5 | status | Nisa | Pekan ini Menaker bilang prosesnya masih di Kementerian Keuangan. Rencananya cair November sampai Desember. | S5, S6, S8; Nov-Des: S6, S9, S10 |
| 6 | waspada | Muklis | BSU tidak membuka pendaftaran mandiri. Abaikan tautan yang meminta data atau biaya di luar situs resmi pemerintah. | S4, S9, S11 |
| 7 | vonis | Nisa | Kasus ditutup: aturannya sudah berlaku tapi uangnya belum cair. Kamu masuk syaratnya? Tulis di komentar ya! (`after: 1.2`, title cover follows) | S1 |

Length: 786 characters, 117 words (say-expanded 825). Estimate at the `kerja` rate (15,6 chars/s, mog at 1.08): ~50 s speech + gaps + 1,2 s tail ≈ **54-56 s**. No [pause]; no line ends on a spoken number; numbers written as words.

`say` map (in `narration.json` under `cartesia.say`): BSU "be es u", BPJS "be pe je es", UMK "u em ka", ASN "a es en", TNI "te en i", HRD "ha er de". Polri and Menaker are read as words.

Note on `say`: for Cartesia, `cartesia.py` reads only `cartesia.say`; the top-level `say` (used by 21_ijazah, 22_saham and others) is read only by Supertonic. Proof: saham's `hook-0.wav` in `voice-lines/cartesia.json` has `chars: 93`, the raw hook length; with IHSG/BEI respelled it would be 102. So this episode puts the map under `cartesia.say`. Confirm by ear after voicing.

"Pekan ini" in line 5 is right for a post up to Sun 15 Nov (Menaker spoke Mon 9 Nov). Later than that, change it to "Senin lalu" or re-check the status first.

## Scenes (notes for the scene builder)

All scenes: casefile kit (`const K = F1.casefile;`), theme `casefile`, `runtime.case` = KASUS #14, 6 steps, name "BSU RP900 RIBU". Text x 72-960, lower ~15% and right 120 px clear. Every card lands on its cue word; nothing static for more than ~3 s. Every figure carries a "Sumber: ..." line. No bank logos or names, no faces.

### 1 · hook (LAPORAN MASUK)
- **Frame 0 (static, already visible):** large transfer slip / envelope card "BANTUAN SUBSIDI UPAH 2026 · **Rp900.000**" (icon `uang` or a drawn slip), title "BSU RP900 RIBU: KAMU DAPAT?", tag "PERMENAKER 16/2026 · BERLAKU 28 OKT 2026". Sumber: Permenaker 16/2026 Pasal 6.
- `sembilan` (cash sfx): chip under the amount "Rp300.000 × 3 BULAN (OKT-DES) · DIBAYAR SEKALIGUS".
- `sekarang`: small status line "STATUS 13 NOV: BELUM ADA TANGGAL CAIR".
- `cair` (~5 s, stamp sfx): red stamp **BELUM CAIR** slammed across the slip.
- Stills: 0 s = slip Rp900.000; 5 s = BELUM CAIR stamp.

### 2 · syarat (BUKTI 1 · SYARAT)
*[Sumber: Permenaker 16/2026 Pasal 3 ayat (2)-(3), Pasal 4 ayat (3)-(5) + Lampiran; Permenaker 5/2025 Pasal 5.]*
- Checklist (`checkRow`), first row already visible: "WNI, PUNYA NIK".
- `aktif`: "PESERTA AKTIF BPJS KETENAGAKERJAAN S.D. AGUSTUS 2026" ticks.
- `gajimu`: "GAJI/UPAH PALING BANYAK RP3,5 JUTA/BULAN" ticks.
- `daerahmu`: chip "UMK/UMP DI ATAS RP3,5 JT? BATASNYA UMK DIBULATKAN KE ATAS · CONTOH JAKARTA RP5,8 JT · BATAM RP5,4 JT" (Lampiran).
- `bukan`: row "ASN · TNI · POLRI" with red strike, label "DIKECUALIKAN". Small footer: "Diprioritaskan: yang tidak sedang menerima PKH".
- Still at 10 s: checklist with the BPJS row ticked.
- `masuk` (Beni): question card "KAMU MASUK?" with two chips YA / TIDAK (a finger can tap between them).
- `jawabanmu`: comment-bubble icon "TULIS DI KOMENTAR".

### 3 · patokan (BUKTI 2 · GAJI YANG DIHITUNG)
*[Sumber: Permenaker 16/2026 Pasal 4 ayat (1)-(2); bsu.bpjsketenagakerjaan.go.id, Tanya Jawab no. 15-16.]*
- Payslip card ("SLIP GAJI", illustration).
- `pokok`: highlighter on row "UPAH POKOK".
- `tunjangan`: highlighter on row "TUNJANGAN TETAP"; small "+" between them = "YANG DIHITUNG".
- `dilaporkan`: arrow from a `kantor` tile to a tile "BPJS KETENAGAKERJAAN", label "UPAH TERAKHIR YANG DILAPORKAN KANTOR".
- `keliru`: pen ring on the arrow + chip "DATA SALAH? MINTA HRD PERBAIKI".
- Optional, only if posted on Fri 13 Nov: chip "PENGKINIAN DATA: SEBELUM 14 NOV (BPJS KETENAGAKERJAAN)". Drop it on any later post.

### 4 · status (BUKTI 3 · KAPAN CAIR?)
*[Sumber: Liputan6 9 Nov; Aktual 9 Nov; Katadata 30 Sep; bsu.kemnaker.go.id (13 Nov).]*
- Timeline / `calendar`: "28 OKT · ATURAN BERLAKU" ticked (visible at start).
- `Menaker`: quote card "Sejauh ini prosesnya masih di Kementerian Keuangan." (Menaker, 9 Nov 2026).
- `Keuangan`: timeline point "9 NOV · ANGGARAN MASIH DI KEMENKEU".
- `Rencananya`: point "NOV-DES · RENCANA CAIR" with a red "?" (no date).
- `Desember`: two chips: "TARGET 13,3 JUTA PEKERJA · HAMPIR RP12 T (Menko Perekonomian, 30 Sep)" and "CEK STATUS DI BSU.KEMNAKER.GO.ID: BELUM DIBUKA".

### 5 · waspada (BUKTI 4 · WASPADA TAUTAN)
*[Sumber: bsu.bpjsketenagakerjaan.go.id Tanya Jawab no. 4 and 17; Kemnaker (Karo Humas) 7 Jan 2026; Harian Jogja 13 Nov.]*
- `pendaftaran`: stamp "TIDAK ADA PENDAFTARAN MANDIRI".
- `tautan`: a fake-message card with a redacted link (`K.redact`; never a real domain), red strike.
- `biaya`: tick row "GRATIS · TIDAK ADA BIAYA".
- `resmi`: two official domains, ticked: "bsu.kemnaker.go.id · info & cek status" and "bsu.bpjsketenagakerjaan.go.id · data peserta".

### 6 · vonis (VONIS)
- Folder card: "ATURAN: BERLAKU 28 OKT" ticked, "UANG: BELUM CAIR" with red "?".
- `ditutup`: stamp KASUS DITUTUP.
- `Tulis`: question card "KAMU MASUK SYARATNYA?" + comment icon.
- Small: "Ringkasan Permenaker 16/2026, bukan nasihat hukum".
- **Cover (last ~1 s, `K.cover`):** the subject object large: transfer slip / envelope "BSU 2026 · Rp900.000", title "BSU RP900 RIBU: KAMU DAPAT?", chip "CEK SYARATNYA", case stamp KASUS #14. No faces, no bank logos.

## Sumber (dua media untuk tiap klaim, atau buang klaimnya)

| # | Klaim | Media, tanggal |
|---|---|---|
| S1 | Primary text. Pasal 3 ayat (2): "a. Warga Negara Indonesia yang dibuktikan dengan kepemilikan nomor induk kependudukan; b. peserta aktif program jaminan sosial ketenagakerjaan BPJS Ketenagakerjaan sampai dengan bulan Agustus 2026; dan c. menerima Gaji/Upah paling banyak sebesar Rp3.500.000,00". Ayat (3): "dikecualikan bagi aparatur sipil negara, prajurit Tentara Nasional Indonesia, dan anggota Kepolisian Negara Republik Indonesia". Pasal 4 (1)-(2): upah = "Gaji/Upah terakhir yang dilaporkan oleh pengusaha atau pemberi kerja kepada BPJS Ketenagakerjaan", "terdiri atas upah pokok dan tunjangan tetap"; (3)-(4): UMK (or UMP if no UMK) above Rp3,5 jt, "dibulatkan ke atas hingga ratus ribuan penuh"; Lampiran: DKI Jakarta Rp5.800.000, Kota Batam Rp5.400.000, Kota Medan Rp4.400.000. Pasal 6: "Rp300.000,00 (tiga ratus ribu rupiah) per bulan untuk 3 (tiga) bulan yang dibayarkan sekaligus", based on eligible workers and "ketersediaan pagu anggaran". Pasal II: berlaku pada tanggal diundangkan, 28 Okt 2026 (BN 2026/732). | Permenaker 16/2026, JDIH Kemnaker https://jdih.kemnaker.go.id/peraturan/detail/3117 (PDF `asset/data_puu/2026pmnaker016.pdf`, abstract `26PMAbstrak016.pdf`) |
| S2 | Pasal 5 (not changed by 16/2026): "diprioritaskan bagi Pekerja/Buruh yang tidak sedang menerima program keluarga harapan pada tahun anggaran berjalan". Priority, not an exclusion. | Permenaker 5/2025, JDIH Kemnaker `asset/data_puu/2025pmnaker005.pdf`; repeated on S3 and S4 |
| S3 | Official site (read 13 Nov): same five criteria; "Data calon penerima Bantuan Subsidi Gaji/Upah berasal dari BPJS Ketenagakerjaan"; "Mekanisme pengecekan status penerima BSU 2026 akan diumumkan secara resmi oleh Kementerian Ketenagakerjaan"; eligible holders of a Himbara/BSI account get a direct transfer; recipients found ineligible "wajib mengembalikan dana BSU yang diterima ke Kas Negara"; "tidak memberikan data pribadi melalui tautan yang tidak terverifikasi". | https://bsu.kemnaker.go.id |
| S4 | BPJS Ketenagakerjaan data-update portal (read 13 Nov): "akan disalurkan melalui Bank Himbara (...) dan BSI"; Tanya Jawab 15: "Data calon penerima berasal dari laporan perusahaan ke BPJS Ketenagakerjaan. Jika datanya keliru, misalnya upah tercatat lebih tinggi, Anda bisa tidak terpilih" (fix: HRD); 16: "Kemungkinan perusahaan melaporkan upah lebih tinggi ... Minta HRD mengecek data upah"; 17: "BSU tidak membuka pendaftaran mandiri. Waspadai pihak yang menawarkan 'pendaftaran BSU'"; 4: "seluruh proses BSU gratis". | https://bsu.bpjsketenagakerjaan.go.id |
| S5 | Menaker Yassierli, press conference Mon 9 Nov: "Sejauh ini prosesnya masih di Kementerian Keuangan"; "Masih disiapkan, nanti akan kami kabarkan lebih lanjut"; data from BPJS TK will be cleansed first. Dirjen PHI-Jamsos Indah Anggoro Putri (release 8 Nov): not for all workers; ASN/TNI/Polri excluded; PKH priority. | Liputan6, 9 Nov 15:50 https://www.liputan6.com/bisnis/read/8331553/bsu-segera-disalurkan-menaker-garansi-pemutakhiran-data ; also kayonews 9 Nov |
| S6 | Indah Anggoro Putri: "Saat ini, proses penyaluran BSU 2026 masih dalam tahap koordinasi dan pengajuan anggaran kepada Kementerian Keuangan." Target Nov-Des; check service not open; wage = last reported to BPJS (pokok + tunjangan tetap), can differ from payslip. Its Rp11,97 T is its own calculation. | Aktual, 9 Nov 10:42 https://aktual.com/bsu-rp900-ribu-belum-cair-kemnaker-masih-ajukan-anggaran-ke-kemenkeu/ |
| S7 | Menko Airlangga after a ratas with the President: ~13,3 juta pekerja; "Ini kebutuhan anggarannya diperkirakan hampir Rp12 triliun"; "Bantuan subsidi upah ini diberikan satu kali untuk tiga bulan". | Katadata, 30 Sep 19:36 https://katadata.co.id/finansial/makro/6abd05a4a6730/pemerintah-gelontorkan-rp31-triliun-pada-akhir-tahun-bansos-hingga-subsidi-upah ; Aktual 9 Nov (S6); Okezone/iNews via RCTI+ (Okt) |
| S8 | Yassierli 27 Okt: "BSU kita masih menyiapkan dan kita masih koordinasi dengan Kementerian Keuangan"; Kemenko spokesman Haryo Limanseto: "Rp 300.000 per bulan diberikan selama 3 bulan (Oktober-Desember)". | Kontan, 27 Okt 16:51 https://nasional.kontan.co.id/news/bsu-2026-rp-900000-akan-segera-cair-kemnaker-ungkap-perkembangan-terbaru |
| S9 | Kemnaker: penyaluran "dijadwalkan berlangsung pada November hingga Desember 2026. Namun, belum ada tanggal pasti"; "tidak perlu mendaftar secara mandiri"; Kemnaker warns about links using the BSU name; data update deadline 13 Nov (before 14 Nov). | Harian Jogja, 13 Nov https://ekbis.harianjogja.com/r-1278708/hari-terakhir-pengkinian-data-bsu-2026-ini-cara-update |
| S10 | BPJS Ketenagakerjaan Instagram: "Segera lakukan pengkinian data calon penerima BSU sebelum 14 November 2026" (detikSulsel, Thu 12 Nov). Liputan6 11 Nov 12:15: deadline 13 Nov, Nov-Des plan, "pemerintah tidak pernah meminta biaya atau data sensitif lewat kanal tidak resmi". MerahPutih: same deadline. | detikSulsel 12 Nov https://www.detik.com/sulsel/berita/d-8750411/pengkinian-data-bpjs-ketenagakerjaan-ini-cara-dan-batas-waktunya ; Liputan6 11 Nov https://www.liputan6.com/hot/read/8332932/cek-pengkinian-data-bsu-2026 ; https://www.merahputih.com/post/read/pengkinian-data-bsu-2026-bpjs-ketenagakerjaan |
| S11 | Kemnaker Karo Humas Faried Abdurrahman Nur Yuliono: "BSU tidak memerlukan pendaftaran mandiri"; official info only on bsu.kemnaker.go.id and Kemnaker's official social media. | Investortrust, 7 Jan 2026 https://investortrust.id/national/90618/hati-hati-hoaks-bsu-2026-kemnaker-imbau-masyarakat-cek-kanal-resmi ; Kompas TV (Jan 2026) "Beredar Link Palsu BSU 2026" |

Not opened (blocked or certificate errors): Bisnis/kabar24 (403), Kompas TV, investortalk.id. Leads from the brief: Katadata 1 Nov "aktif per Agustus" is confirmed by S1; Okezone 4 Nov and Bisnis 6 Okt not needed.

## Jangan dipakai

- "Sudah cair", "cair hari ini", tahap/batch dates or recipient counts per tahap: nothing official as of 13 Nov.
- Bank names (BRI, BNI, Mandiri, BTN, BSI), "Himbara" as a brand, app names (JMO, Pospay, SIPP). If a channel is needed on screen: "rekening bank BUMN" only.
- Kantor Pos / PT Pos as a channel: the two official sites name only Himbara banks + BSI; Pos is in outlets (Aktual, Liputan6, MerahPutih) as a plan, and investortalk says Pos is dropped. Conflicting, so leave it out.
- Kartu Prakerja / BPUM recipients excluded: not in the current text. PKH is a **priority** rule, not an exclusion; never say "penerima PKH tidak dapat".
- Rp11,97 T as an official budget (it is 13,3 jt × Rp900 rb by the outlets); use "hampir Rp12 T" (Airlangga).
- "BSU untuk gaji di bawah Rp3 juta" (Kontan 9 Nov paraphrase of Airlangga): conflicts with S1.
- "Gaji Rp4 juta tetap dapat" headlines: true only in the listed UMK/UMP areas.
- "Kantor Pos tak dipakai lagi" (investortalk only, page not opened).
- 2025 BSU figures and procedures (rekening kolektif steps, 2025 cut-off April 2025).
- Any real fake-link domain on screen (don't advertise it).

## Belum pasti

- Disbursement date and Kemenkeu approval: still pending on 9 Nov (S5, S6); no newer official word found through 13 Nov.
- Status check: bsu.kemnaker.go.id says the mechanism "akan diumumkan" (S3, 13 Nov).
- Channel for workers without a Himbara/BSI account (Kantor Pos or a collective account): not stated officially for 2026.
- Data-update deadline 13 Nov ("sebelum 14 November"): BPJS TK Instagram via detik (S10). Time-sensitive: on screen only if the video goes up on 13 Nov; no news of an extension found.
- "sampai dengan bulan Agustus 2026": the text does not say whether contributions must be active for a whole period or only at the cut-off; keep the text's wording.

## Caption (draft, 694 characters incl. line breaks)

```
BSU 2026 Rp900 ribu: aturannya sudah berlaku (Permenaker 16/2026, 28 Okt), tapi per 9 Nov Menaker bilang prosesnya masih di Kemenkeu. Rencana cair Nov-Des, belum ada tanggal.

Syarat: WNI ber-NIK, peserta aktif BPJS Ketenagakerjaan s.d. Agustus 2026, gaji maks Rp3,5 juta (atau UMK/UMP dibulatkan di daerah yang lebih tinggi), bukan ASN/TNI/Polri. Prioritas: tidak sedang menerima PKH.

Tidak ada pendaftaran mandiri dan tidak ada biaya. Info resmi hanya bsu.kemnaker.go.id dan bsu.bpjsketenagakerjaan.go.id.

Kamu masuk syaratnya? Tulis di komentar.

Sumber: Permenaker 16/2026, Kemnaker, BPJS Ketenagakerjaan, Liputan6, Aktual, Katadata. Bukan nasihat hukum.
#BSU #subsidigaji #pekerja #kasus
```

## Cek dengar (setelah voice)

BSU, BPJS Ketenagakerjaan, UMK, ASN, TNI, Polri, HRD, Menaker, "tiga koma lima juta", "daerahmu", "memperbaikinya", "nggak". Hook pacing must stay even (no fast-to-slow).

## Kredit foto

- None. Illustrations and kit icons only.
