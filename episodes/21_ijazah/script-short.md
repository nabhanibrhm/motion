# Ijazah Ditahan Kantor? Kini Dilarang UU (Short)

*Draft written 11 Nov 2026 in the KSP pacing style of `kerja` (one-line hook, no setup line, lines of 12+ words). Frame 0 shows the hook claim ("IJAZAH DITAHAN? DILARANG UU").*

Case id **KASUS #12**, episode id `ijazah` (episode 21). Sequel to `kerja` (KASUS #11, cuti bersama / PKWT / alih daya); this one covers what `kerja` did not, from the same law, **UU Nomor 27 Tahun 2026 tentang Pelindungan Ketenagakerjaan**: the ban on holding ijazah and personal documents as collateral, the change in PHK multipliers (pesangon), and the new dana cadangan pesangon. **Vertical 9:16, 1080x1920, 30 fps**, Bahasa Indonesia, 9 lines, **1,206 Cartesia characters, about 75-80 s** (estimate from `kerja`: 1,732 chars = 111 s), 6 scenes, casefile kit, quiet bed.

Cast (same as `kerja`): **Nisa** (`wec`, F2) leads and closes, **Muklis** (`mog`, M1) brings the pasal facts, **Beni** (`bog`, M4) is the worker asking "terus aku gimana?". Lines in *[brackets]* are on-screen notes. Every on-screen figure carries a "Sumber: ..." line. **[S#]** = Sources table. Facts checked 11 Nov 2026 against the primary text.

**Rules:** no sensitive words; no company, e-commerce or app brand named; numbers in speaker lines are spelled as words; no line ends on a spoken number; neutral tone, not legal advice (disclaimer on the verdict card).

---

## Script

| Section | Speaker | Line | Sources |
|---|---|---|---|
| `hook` | NISA | Perusahaan sekarang dilarang undang-undang meminta atau menahan ijazah karyawan sebagai jaminan kerja, termasuk paspor, buku nikah, dan BPKB. | S1, S2, S3 |
| `ijazah` | MUKLIS | Larangan di Pasal tujuh puluh delapan ini cuma punya satu pengecualian, yaitu ijazah atau sertifikat dari pelatihan yang dibiayai perusahaan dengan perjanjian kerja tertulis. | S1, S3 |
| `ijazah` | BENI | Kalau kantorku tetap menahan ijazahku, sanksinya apa? Ijazahnya bisa balik nggak? | - |
| `ijazah` | NISA | Sanksinya peringatan tertulis, denda administratif, sampai pembatasan kegiatan usaha, dan sanksi itu tidak menghapus kewajiban mengembalikan ijazahmu. | S4 |
| `pesangon` | MUKLIS | Soal pesangon, skalanya tetap satu sampai sembilan bulan upah, tapi PHK karena pailit atau tutup akibat rugi dua tahun kini tidak lagi dibayar setengah, melainkan satu kali penuh. | S5, S6, S7, S8 |
| `cadangan` | BENI | Kalau perusahaannya sudah bangkrut, pesangonnya dibayar pakai uang siapa? | - |
| `cadangan` | MUKLIS | Karena itu pengusaha wajib menyediakan dana cadangan pesangon yang dikelola lembaga pemerintah, kecuali usaha mikro dan kecil, dengan sanksi sampai pencabutan izin usaha. | S9 |
| `cek` | NISA | Rincian dana cadangan itu masih menunggu peraturan pemerintah paling lambat Oktober tahun depan, jadi cek kontrakmu soal ijazah dan pesangon. | S9, S10 |
| `vonis` | NISA | Kasus ditutup: ijazah bukan jaminan kerja. Ijazahmu pernah ditahan kantor? Cerita di komentar ya! (`after: 1.4`, title cover follows) | - |

`say` map: `BPKB` -> "be pe ka be", `PHK` -> "pe ha ka".

---

## Scenes (notes for the scene builder)

All scenes: casefile kit, `transit` palette as in `kerja`; `runtime.case.id` = `KASUS #12`, 6 steps. Every card lands on the cue word given; nothing sits still for more than ~3 s.

### 1 · Hook (`hook`, LAPORAN MASUK)
*[Frame 0 (static, already visible): big HUD "IJAZAH DITAHAN? DILARANG UU" over a document card labelled "IJAZAH" with a red redaction bar; small tag "UU 27/2026 · BERLAKU 28 OKT 2026" [S2]. Sumber: UU 27/2026 Pasal 78 ayat (1), Pasal 313.]*
- `ijazah` (word 1 cue `word:ijazah`): redaction bar slides off the IJAZAH card; strike across a small chip "JAMINAN KERJA".
- `jaminan`: pen ring around the word "SEBAGAI JAMINAN" (this is the condition: the ban is on requiring/holding *as collateral*; it is not a ban on showing a copy when applying).
- `paspor`, `nikah`, `BPKB`: three evidence tiles pop in one by one, icon `dokumen` each: "PASPOR", "BUKU NIKAH", "BPKB" (all labelled "ASLI").
- `undang-undang`: small chip "SEBELUMNYA: SURAT EDARAN MENAKER, MEI 2025" [S11], so "kini dilarang UU" is not read as "dulu boleh".
- KASUS #12 stamp on `Perusahaan` or on the last tile.

### 2 · Ijazah (`ijazah`, BUKTI 1 · IJAZAH)
*[Sumber: UU 27/2026 Pasal 78 ayat (1)-(2), Penjelasan Pasal 78, Pasal 79 ayat (1)-(2).]*
- `Pasal` (Muklis line): highlighter sweeps over the quoted text card: "Pemberi Kerja dilarang: a. mensyaratkan ijazah dan/atau dokumen pribadi ... b. menahan ijazah dan/atau dokumen pribadi ... sebagai jaminan dalam Hubungan Kerja." Label "PASAL 78 AYAT (1)".
- `pengecualian`: second card "KECUALI: DIPEROLEH DARI PENDIDIKAN DAN PELATIHAN YANG DIBIAYAI PEMBERI KERJA, BERDASARKAN PERJANJIAN KERJA TERTULIS" with a tick on `tertulis`. Label "PASAL 78 AYAT (2)".
- `sanksinya` (Beni): question card "SANKSINYA?" with `palu` tile.
- Nisa line, checkRow / numbered tiles on each word: `peringatan` -> "1 · PERINGATAN TERTULIS", `denda` -> "2 · DENDA ADMINISTRATIF", `pembatasan` -> "3 · PEMBATASAN KEGIATAN USAHA" (icons `dokumen`, `kantor`, `gedung`). Label "PASAL 79 AYAT (1)".
- `mengembalikan`: stamp "IJAZAH WAJIB DIKEMBALIKAN" with small "Pasal 79 ayat (2): sanksi tidak menghilangkan kewajiban mengembalikan".
- Do **not** write "pidana" anywhere in this scene: the ijazah sanction in UU 27/2026 is administrative only.

### 3 · Pesangon (`pesangon`, BUKTI 2 · PESANGON)
*[Sumber: UU 27/2026 Pasal 232 ayat (2), Pasal 237, Pasal 240, Pasal 250; PP 35/2021 Pasal 40 ayat (2), Pasal 44 ayat (1), Pasal 47; Katadata 6 & 8 Okt 2026.]*
- `skalanya`: compact bar ladder "MASA KERJA < 1 TH = 1 BULAN UPAH ... ≥ 8 TH = 9 BULAN UPAH" (9 steps), tag "SKALA SAMA SEPERTI SEBELUMNYA" (PP 35/2021 Pasal 40 ayat (2) has the same 1-9 ladder) [S5]. Small tag "PASAL 232 AYAT (2): PALING SEDIKIT".
- `pailit`: row "PAILIT" with old value "0,5×" struck through and new "1×" ticked [S6].
- `rugi`: row "TUTUP KARENA RUGI 2 TAHUN BERTURUT-TURUT" with "0,5×" struck, "1×" ticked [S7].
- `penuh`: chip "PENGALI 0,5 DIHAPUS" (Menaker quote source line: Katadata 6 Okt 2026) [S8].
- Footer small (no speech): "USAHA MIKRO & KECIL: BESARAN PESANGON SESUAI KESEPAKATAN (Pasal 250)". This is a real condition on the scale; keep it on screen.

### 4 · Cadangan (`cadangan`, BUKTI 3 · DANA CADANGAN)
*[Sumber: UU 27/2026 Pasal 253 ayat (1)-(6).]*
- `bangkrut` (Beni): `gedung` tile with a red "TUTUP" strike.
- `dana` (Muklis): folder card "DANA CADANGAN PESANGON · WAJIB" (Pasal 253 ayat (1)), highlighter on "wajib menyediakan".
- `pemerintah`: tile `perisai` "DIKELOLA LEMBAGA PEMERINTAH" (ayat (3)); no institution name (the text names none).
- `mikro`: tile with strike-through "USAHA MIKRO & KECIL: DIKECUALIKAN" (ayat (4)).
- `pencabutan`: ladder of sanctions ticking in quickly: "PERINGATAN TERTULIS · PEMBATASAN · PENGHENTIAN SEMENTARA · PENCABUTAN IZIN" with the last in red (ayat (6)).

### 5 · Cek (`cek`, CEK HAK KAMU)
*[Sumber: UU 27/2026 Pasal 253 ayat (5), Pasal 312, Pasal 313.]*
- `peraturan`: calendar flips from "28 OKT 2026 · BERLAKU" to "28 OKT 2027 · BATAS ATURAN TURUNAN" (`kalender`).
- `cek`: checklist ticking on `ijazah` and `pesangon`: "☐ ADA PASAL SERAH IJAZAH ASLI?" -> ticked with "TIDAK BOLEH (KECUALI PELATIHAN DIBIAYAI, TERTULIS)"; "☐ ALASAN PHK & PENGALINYA" ticked.
- Small footer: "Bukan nasihat hukum · naskah: peraturan.bpk.go.id".

### 6 · Vonis (`vonis`, VONIS)
*[Folder + stamp "KASUS DITUTUP" on `ditutup`; verdict text "IJAZAH BUKAN JAMINAN KERJA"; question card "IJAZAHMU PERNAH DITAHAN?" on `Ijazahmu`; disclaimer small "Ringkasan teks UU 27/2026, bukan nasihat hukum". **Title-only cover card in the last ~1 s**: "Ijazah Ditahan Kantor? Kini Dilarang UU".]*

---

## Sources

**Primary text read in full for the passages used:** UU Nomor 27 Tahun 2026 tentang Pelindungan Ketenagakerjaan, PDF from peraturan.bpk.go.id (Details/359755, file Download/425330; "Ditetapkan 28 Oktober 2026", "Diundangkan 28 Oktober 2026", "Berlaku 28 Oktober 2026", **LN 2026 (179), TLN 7222**; 176 pages). And **PP Nomor 35 Tahun 2021** (peraturan.bpk.go.id Details/161904, file Download/154582) for the "before" multipliers. The PDF text layers have OCR typos (e.g. "danlatau", "l2l"); quotes below are normalised to the obvious wording. P = primary text, M = media.

### Law text quoted

**UU 27/2026 Pasal 78**
> (1) Dalam membuat Perjanjian Kerja, Pemberi Kerja dilarang: a. mensyaratkan ijazah dan/atau dokumen pribadi milik Pekerja/Buruh; dan/atau b. menahan ijazah dan/atau dokumen pribadi milik Pekerja/Buruh, sebagai jaminan dalam Hubungan Kerja.
> (2) Ketentuan sebagaimana dimaksud pada ayat (1) dikecualikan untuk kepentingan yang dibenarkan secara hukum untuk ijazah dan/atau dokumen pribadi yang diperoleh melalui pendidikan dan pelatihan yang dibiayai oleh Pemberi Kerja berdasarkan Perjanjian Kerja tertulis.

**Penjelasan Pasal 78**
> Ayat (1): Yang dimaksud dengan "dokumen pribadi" adalah dokumen milik Pekerja/Buruh dalam bentuk asli, antara lain sertifikat kompetensi, paspor, akta kelahiran, buku nikah, dan buku pemilik kendaraan bermotor.
> Ayat (2): Dokumen pribadi yang dikecualikan adalah sertifikat kompetensi yang diperoleh Pekerja/Buruh dari pelatihan yang dibiayai oleh Pemberi Kerja.

**UU 27/2026 Pasal 79**
> (1) Setiap Pemberi Kerja yang melanggar ketentuan sebagaimana dimaksud dalam Pasal 78 ayat (1), dikenai sanksi administratif berupa: a. peringatan tertulis; b. denda administratif; dan/atau c. pembatasan kegiatan usaha.
> (2) Sanksi administratif sebagaimana dimaksud pada ayat (1) tidak menghilangkan kewajiban Pemberi Kerja untuk mengembalikan ijazah dan/atau dokumen pribadi kepada Pekerja/Buruh.
> (3) Ketentuan lebih lanjut mengenai tata cara pengenaan sanksi administratif ... diatur dalam Peraturan Pemerintah.

**UU 27/2026 Pasal 50 ayat (1) huruf b** (placement agencies, not used in speech): pelaksana Penempatan Tenaga Kerja dilarang "menahan ijazah dan/atau dokumen pribadi milik pencari kerja sebagai jaminan dalam penempatan kerja"; sanctions in Pasal 52 go up to "pencabutan perizinan berusaha".

**UU 27/2026 Pasal 232 ayat (2)**
> Uang pesangon sebagaimana dimaksud pada ayat (1) diberikan dengan ketentuan paling sedikit sebagai berikut: a. masa kerja kurang dari 1 (satu) tahun, mendapat 1 (satu) bulan Upah; ... i. masa kerja 8 (delapan) tahun atau lebih, mendapat 9 (sembilan) bulan Upah.

(Ayat (3) uang penghargaan masa kerja: 2 bulan for 3-6 years up to 10 bulan for ≥ 24 years. Ayat (4) uang penggantian hak: cuti tahunan belum diambil dan belum gugur, ongkos pulang, hal lain dalam PK/PP/PKB.)

**UU 27/2026 PHK multipliers (Pasal 236-247) vs PP 35/2021 (Pasal 41-52)**, both read in the PDFs:

| PHK reason | PP 35/2021 (before) | UU 27/2026 (now) |
|---|---|---|
| Perusahaan tutup karena rugi 2 tahun | Pasal 44 ayat (1): pesangon **0,5×** | Pasal 237: pesangon **1×**, UPMK 1×, UPH |
| Perusahaan pailit | Pasal 47: pesangon **0,5×** | Pasal 240 (PKPU atau pailit): pesangon **1×**, UPMK 1×, UPH |
| Tutup karena keadaan memaksa | Pasal 45 ayat (1): **0,5×** (ayat (2) not closing: 0,75×) | Pasal 239 (kahar): **1×** |
| PKPU karena rugi | Pasal 46 ayat (1): **0,5×** | Pasal 240: **1×** |
| Pelanggaran PK/PP/PKB setelah SP 1-3 | Pasal 52 ayat (1): **0,5×** | Pasal 244: **1×** |
| Pengambilalihan, pekerja tidak bersedia | Pasal 42 ayat (2): **0,5×** | Pasal 236 ayat (1): 1× |
| Efisiensi karena rugi | Pasal 43 ayat (1): **0,5×** | "efisiensi" is not in the Pasal 231 list of PHK reasons |
| Merger, pemberi kerja tidak mau menerima | Pasal 41: 1× | Pasal 236 ayat (2): **2×** |
| Permohonan PHK oleh pekerja karena perbuatan pemberi kerja | Pasal 48: 1× | Pasal 241 ayat (1): **2×** |

"0,5" appears nowhere in UU 27/2026 as a pesangon multiplier (the only "0,5" is the wage-formula alpha in the upah chapter). PP 35/2021 Pasal 40 ayat (2) has the same 1-9 month ladder ("diberikan dengan ketentuan sebagai berikut", without "paling sedikit").

**UU 27/2026 Pasal 250**
> Pemberi Kerja pada usaha mikro dan usaha kecil wajib membayar uang pesangon, uang penghargaan masa kerja, uang penggantian hak, dan/atau uang pisah ... dengan besaran ditentukan berdasarkan kesepakatan antara Pemberi Kerja pada usaha mikro dan usaha kecil dengan Pekerja/Buruh.

**UU 27/2026 Pasal 253 (BAB XVI DANA CADANGAN PESANGON)**
> (1) Pengusaha wajib menyediakan dana cadangan pesangon sebagai sumber pembayaran hak Pekerja/Buruh akibat Pemutusan Hubungan Kerja.
> (2) Tujuan penyediaan dana cadangan pesangon ... untuk menjamin terpenuhinya hak Pekerja/Buruh akibat Pemutusan Hubungan Kerja dengan alasan selain memasuki usia pensiun dan Pekerja/Buruh belum diikutsertakan dalam program pensiun.
> (3) Dana cadangan pesangon ... dikelola oleh lembaga pemerintah.
> (4) Ketentuan sebagaimana dimaksud pada ayat (1) dikecualikan bagi Pengusaha pada usaha mikro dan kecil.
> (5) Ketentuan lebih lanjut mengenai dana cadangan pesangon diatur dengan Peraturan Pemerintah.
> (6) Pengusaha yang tidak menyediakan dana cadangan pesangon ... dikenai sanksi administratif berupa: a. peringatan tertulis; b. pembatasan kegiatan usaha; c. penghentian sementara sebagian atau seluruh kegiatan usaha; dan/atau d. pencabutan perizinan berusaha.

**UU 27/2026 Pasal 295 ayat (1)** (context, not in speech): pemberi kerja "yang dengan sengaja tidak membayar uang pesangon dan/atau uang penghargaan masa kerja dan uang penggantian hak ... sebagaimana dimaksud dalam Pasal 232 ayat (1), dipidana dengan pidana penjara paling lama 4 (empat) tahun atau pidana denda paling banyak kategori IV".

**UU 27/2026 Pasal 310, 311, 312, 313**: old implementing regulations of UU 13/2003 and UU 6/2023 stay valid "sepanjang tidak bertentangan"; UU 13/2003 dicabut; "Peraturan pelaksanaan dari Undang-Undang ini harus ditetapkan paling lama 1 (satu) tahun terhitung sejak Undang-Undang ini diundangkan"; "Undang-Undang ini mulai berlaku pada tanggal diundangkan".

### Sources table

| # | Fact used | Pasal | Data date | Source | Type |
|---|---|---|---|---|---|
| S1 | Ban on requiring or holding ijazah / personal documents "sebagai jaminan dalam Hubungan Kerja"; one exception (employer-funded education/training, written PK) | UU 27/2026 Pasal 78 ayat (1)-(2) | 28 Oct 2026 | UU text; Gebrak.id 9 Nov 2026 "Resmi! Perusahaan Dilarang Tahan Ijazah Pekerja, Ini Isi Pasal 78 UU Nomor 27 Tahun 2026" (https://www.gebrak.id/?p=62144); Okezone via RCTI+ 11 Okt 2026 "6 Fakta Perusahaan Dilarang Tahan Ijazah Pekerja" (https://www.rctiplus.com/news/detail/ekonomi/5491134/6-fakta-perusahaan-dilarang-tahan-ijazah-pekerja) | P + M |
| S2 | UU 27/2026 disahkan, diundangkan and berlaku 28 Oct 2026; LN 2026 No. 179, TLN 7222 | Penutup; Pasal 313 | 28 Oct 2026 | peraturan.bpk.go.id Details/359755; UU text | P |
| S3 | "Dokumen pribadi" = originals, e.g. sertifikat kompetensi, paspor, akta kelahiran, buku nikah, BPKB; excepted document = sertifikat kompetensi from employer-funded training | Penjelasan Pasal 78 | 28 Oct 2026 | UU text (Penjelasan); same list in SE Menaker 2025 per detikFinance 20 May 2025 | P + M |
| S4 | Sanctions: peringatan tertulis, denda administratif, pembatasan kegiatan usaha; sanction does not remove duty to return the documents | Pasal 79 ayat (1)-(2) | 28 Oct 2026 | UU text (single primary; outlets checked did not detail Pasal 79) | P |
| S5 | Pesangon ladder 1 month (< 1 yr) to 9 months (≥ 8 yr), "paling sedikit"; same ladder in PP 35/2021 | UU 27/2026 Pasal 232 ayat (2); PP 35/2021 Pasal 40 ayat (2) | 28 Oct 2026 / 2021 | both texts | P |
| S6 | Pailit: 0,5× (PP 35/2021) -> 1× (UU 27/2026) | PP 35 Pasal 47; UU 27 Pasal 240 | 28 Oct 2026 | both texts | P |
| S7 | Tutup karena rugi 2 tahun: 0,5× -> 1× | PP 35 Pasal 44 ayat (1); UU 27 Pasal 237 | 28 Oct 2026 | both texts | P |
| S8 | "Tidak ada lagi pesangon dengan indeks pengali 0,5" (Menaker Yassierli); minimum multiplier 1× | - | 6-9 Oct 2026 | Katadata 6 Okt 2026 "UU Pelindungan Ketenagakerjaan Disahkan, Formula Uang Pesangon Berubah" (https://katadata.co.id/berita/nasional/6ac49691cef70/uu-pelindungan-ketenagakerjaan-disahkan-formula-uang-pesangon-berubah); Katadata 8 Okt 2026 "Aturan Pesangon dan PHK Berubah di UU Ketenagakerjaan" (https://katadata.co.id/lifestyle/varia/6ac727b24b04d/aturan-pesangon-dan-phk-berubah-di-uu-ketenagakerjaan); JournalArta 9 Okt 2026 "Pengali Pesangon 0,5 Dihapus, Siapa yang Dapat Kompensasi Lebih Besar?" (https://journalarta.com/news/2026/10/09/pengali-pesangon-05-dihapus-siapa-yang-dapat-kompensasi-lebih-besar/) | M (backs P) |
| S9 | Dana cadangan pesangon: wajib, managed by "lembaga pemerintah", exempt usaha mikro dan kecil, sanctions up to pencabutan perizinan berusaha, details by PP | Pasal 253 ayat (1)-(6) | 28 Oct 2026 | UU text; Katadata 6 Okt 2026 (PP to regulate); Okezone via RCTI+ 11 Okt 2026 (law sets dana cadangan pesangon) | P + M |
| S10 | Implementing regulations within 1 year of promulgation (by 28 Oct 2027) | Pasal 312 | 28 Oct 2026 | UU text | P |
| S11 | Before the UU, the ban existed only as SE Menaker No. M/5/HK.04.00/V/2025 (20 May 2025), with the same funded-training exception | - | 20 May 2025 | detikFinance 20 May 2025 "Pemerintah Resmi Larang Perusahaan Tahan Ijazah Pegawai!" (https://finance.detik.com/berita-ekonomi-bisnis/d-7923205/pemerintah-resmi-larang-perusahaan-tahan-ijazah-pegawai); Gebrak.id 9 Nov 2026; Bisnis 20 May 2025 (https://ekonomi.bisnis.com/read/20250520/12/1878423/tok-menaker-larang-pengusaha-tahan-ijazah-pekerja-ini-aturannya) | M |

## Context (not on screen unless noted)

- **What is actually new for ijazah:** the 2025 SE was a circular to governors/regents/mayors with no sanction of its own; Pasal 78-79 put the ban in a statute with administrative sanctions and an explicit duty to return the document. That is why the title says "Kini Dilarang UU", not "Sekarang Dilarang" alone.
- **No transition rule for ijazah already held.** Bab XXII (Pasal 300-306) has transition rules only for pending PHI cases, overseas apprenticeships, provincial labour inspection (up to 2 years), pending inspections/criminal cases, lembaga nonstruktural and outsourcing contracts. Pasal 78 ayat (1) is framed "Dalam membuat Perjanjian Kerja", so whether holding a document taken under a pre-28-Oct contract is a violation is a reading, not settled text. The script therefore says "tetap menahan" (Beni's question) and the answer only cites Pasal 79 ayat (2); it does not promise that every old case is covered.
- **Where to report:** the text puts labour inspection in a Kementerian unit "berkedudukan di pusat dan daerah" (Pasal 258), with provincial inspectors continuing for up to 2 years (Pasal 302-303). Neither the text nor two outlets give a worker complaint route for Pasal 78, so no "lapor ke Disnaker" line in speech.
- **Pesangon for usaha mikro dan kecil** is by agreement (Pasal 250); same idea existed in PP 35/2021. On screen as a footer in scene 3.
- **Efisiensi** is no longer in the Pasal 231 list of PHK reasons (Katadata 6 Okt quotes Yassierli on "alasan efisiensi"); left out of speech for time.
- **Pidana for unpaid pesangon** (Pasal 295) exists, but UU 13/2003 also had criminal sanctions for unpaid pesangon, so it is not a "new" fact.
- **Platform workers:** Pasal 102-103 call ojol/kurir-type work "hubungan pekerjaan tertentu" under perjanjian kemitraan with rights to "penghasilan yang layak, pelindungan K3 dan jaminan sosial", but the details are left to a separate *Undang-Undang* (Pasal 103 ayat (1)). Dropped for length; a possible next KASUS.
- **KHL:** a KHL survey section exists in the upah chapter (around the wage-formula pasal); not read closely, dropped.

## Do not use

- "Perusahaan tidak boleh minta ijazah saat melamar": the ban is on requiring or holding it **as collateral** ("sebagai jaminan dalam Hubungan Kerja"); showing a copy at recruitment is not addressed.
- "Pesangon lebih besar" as a blanket claim: the base ladder (1-9 months) is unchanged; only the multipliers for certain PHK reasons rose from 0,5× to 1× (and a few to 2×). JournalArta notes it is not "dua kali lipat" for everyone.
- "Perusahaan yang tahan ijazah bisa dipidana" (detikFinance 20 May 2025, Menaker quote on the SE): under UU 27/2026 the ijazah sanction is administrative only (Pasal 79).
- "Izin dicabut" for ijazah violations: revocation is in Pasal 253 (dana cadangan) and Pasal 52 (placement agencies), **not** in Pasal 79.
- Naming the body that will manage the dana cadangan (BPJS Ketenagakerjaan etc.): the text says only "lembaga pemerintah"; earlier BPJS reports were about the draft (Fortune IDN).
- "Masa transisi satu tahun" for the whole law (Katadata repeats it): Pasal 312 only gives implementing regulations one year; the law is in force since 28 Oct 2026.
- Any company, BUMN, app or e-commerce name (Tirto 2025 named BUMN cases: do not repeat).

## Before voicing checklist

- [ ] Episode folder `episodes/21_ijazah/` exists with `number: 21`, `runtime.case.id: "KASUS #12"`, 6 scenes (`hook`, `ijazah`, `pesangon`, `cadangan`, `cek`, `vonis`), case steps 6.
- [ ] `narration.json` section ids match the scene ids; final line `after: 1.4`.
- [ ] No line ends on a spoken number (checked: last words are BPKB, tertulis, nggak, ijazahmu, penuh, siapa, usaha, pesangon, ya).
- [ ] `say` map covers BPKB and PHK; listen for "pailit", "BPKB", "administratif".
- [ ] Frame 0 still shows "IJAZAH DITAHAN? DILARANG UU" (`stills ijazah --at 0`); 5 s and 10 s stills each show a different fact (document tiles, Pasal 78 highlight).
- [ ] Every on-screen figure has its "Sumber:" line; the "SEBELUMNYA: SURAT EDARAN 2025" chip is on the hook.
- [ ] Last ~1 s is the title-only cover "Ijazah Ditahan Kantor? Kini Dilarang UU".
- [ ] Caption says "ringkasan, bukan nasihat hukum".

## Caption (draft)

> Ijazah Ditahan Kantor? Kini Dilarang UU
>
> UU 27/2026: perusahaan dilarang meminta atau menahan ijazah dan dokumen pribadi asli (paspor, buku nikah, BPKB) sebagai jaminan kerja, kecuali dari pelatihan yang dibiayai perusahaan dengan perjanjian tertulis. Plus: pengali pesangon 0,5 kali untuk PHK karena pailit atau rugi dihapus, dan ada dana cadangan pesangon wajib (usaha mikro dan kecil dikecualikan). Ijazahmu pernah ditahan?
>
> Sumber: teks UU 27/2026 Pasal 78, 79, 232, 237, 240, 253 (peraturan.bpk.go.id, 28 Okt 2026); PP 35/2021 Pasal 44, 47; Katadata (6 & 8 Okt 2026); Gebrak.id (9 Nov 2026); detikFinance (20 Mei 2025).
>
> Ringkasan teks undang-undang, bukan nasihat hukum. Cek naskah resmi di JDIH.
>
> #KasusKita #fyp #UUKetenagakerjaan #HakPekerja #Ijazah #Pesangon
