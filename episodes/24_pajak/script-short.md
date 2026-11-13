# KASUS #15 · Gaji di Bawah Rp10 Juta Bebas Pajak? (`pajak`, episode 24)

Research and script Fri 13 Nov 2026 (WSL, ~17:15 WIB). Planned post: Sat 14 Nov. Scaffolded with `new pajak --format kasus`.
Narator: Muklis (mog), Nisa (wec), Beni (bog), Cartesia. 7 baris, 6 scenes, 30 fps, tanpa bed. Not voiced yet (Cartesia credits are out).
Tax topic: on screen and in the caption "Ringkasan PMK 105/2025 dan pernyataan pejabat, bukan nasihat pajak" (not spoken). No company, payroll-app or bank names.

**Verdict:** a plan, not a rule. Menko Airlangga said on Mon 9 Nov that PPh 21 DTP will go to workers in all sectors with pay up to Rp10 juta in 2027 (S4), but no PMK for 2027 exists (searched through 13 Nov), Ditjen Pajak is still calculating the revenue impact and has not decided the form (S5). The current rule, PMK 105/2025, covers only five industries and ends with Masa Pajak Desember 2026 (S1). It is not "bebas pajak": PPh 21 is still calculated and the government's share is paid to the worker in cash with the wage (S1 Pasal 5). PTKP will not rise in January 2027 (S6).

## Retensi (cek sebelum voice)

- Topik: mengubah sesuatu buat penonton biasa (gaji, cuti, harga, dokumen, denda). Topik pasar/prosedur hanya kalau ada sudut "kamu".
- Hook: klaim dengan "kamu" di dalamnya ("Kantor nahan ijazahmu? Sekarang dilarang UU."), bukan lembaganya.
- Baris 2: apa artinya buat kamu. Latar, angka pembukuan dan prosedur belakangan, atau cukup di layar.
- Pertanyaan komentar sekitar detik 20 (Beni bertanya), lalu diulang di vonis.

Check for this script: hook "Gajimu ... bebas pajak tahun depan, tapi aturannya belum ada" (-mu + claim + twist; "aturannya belum ada" lands at ~4,3 s); line 2 is the payslip (tax still calculated, paid back in cash, take-home intact); Beni's "Gajimu di bawah sepuluh juta atau nggak?" starts at ~19-20 s; verdict repeats it. Sector list, KLU, worker counts and PTKP amount are on screen only.

## Naskah

| # | Scene | Speaker | Line | Sources |
|---|---|---|---|---|
| 1 | hook | Nisa | Gajimu di bawah sepuluh juta katanya bebas pajak tahun depan, tapi aturannya belum ada. | claim: S3, S4; belum ada: S5, S8 (no PMK found) |
| 2 | slip | Muklis | Kalau skemanya sama seperti tahun ini, PPh dua puluh satu di slip gajimu tetap dihitung, tapi pemerintah yang menanggung dan kantormu membayarkannya tunai ke kamu. Jadi gaji yang kamu terima tetap utuh. | S1 Pasal 5 (1)-(3) + Lampiran B; S2; "skema sama": S3 |
| 3 | slip | Beni | Gajimu di bawah sepuluh juta atau nggak? Tulis di komentar. | (comment question, ~19,7 s) |
| 4 | sektor | Muklis | Tahun ini cuma pekerja industri padat karya dan pariwisata yang dapat, dan aturannya berakhir Desember. | S1 Pasal 2 (3), Pasal 3 (1); S2 |
| 5 | rencana | Nisa | Senin lalu Menko Airlangga bilang tahun depan diperluas ke semua sektor. Tapi Ditjen Pajak masih menghitung dampaknya dan bentuknya belum diputuskan. | S3, S4; DJP: S5 |
| 6 | ptkp | Muklis | PTKP alias batas penghasilan bebas pajak juga tidak naik Januari nanti. Kata Airlangga pembahasannya belum selesai. | S6 |
| 7 | vonis | Nisa | Kasus ditutup: rencananya ada tapi aturannya belum terbit. Gajimu di bawah sepuluh juta? Tulis di komentar ya! (`after: 1.2`, title cover follows) | S1, S4, S5 |

Length: 825 characters, 125 words (say-expanded 837). Estimate at the `kerja` rate (15,6 chars/s, mog at 1.08): ~53,5 s speech + gaps + 1,2 s tail ≈ **55-58 s**. Line starts (estimate): 0,2 / 6,1 / 19,7 / 23,9 / 30,8 / 40,7 / 48,9 s. No [pause]; no line ends on a spoken number; numbers written as words.

`say` map (in `narration.json` under `cartesia.say`, matched case-insensitively per word): PPh "pe pe ha", PTKP "pe te ka pe". "DTP", "DJP", "APBN" and "PMK" are not spoken (screen only), so they need no entry. Menko, Ditjen and Airlangga are read as words.

Time words: "Senin lalu" (line 5) is right for a post up to Sun 15 Nov (Airlangga spoke Mon 9 Nov). Later, change to "Senin pekan lalu" or re-check. "Tahun ini ... berakhir Desember" (line 4) holds until the end of December 2026.

## Scenes (notes for the scene builder)

All scenes: casefile kit (`const K = F1.casefile;`), theme `casefile`, `runtime.case` = KASUS #15, 6 steps, name "PAJAK GAJI DI BAWAH RP10 JT". Text x 72-960, lower ~15% and right 120 px clear. Every card lands on its cue word; nothing static for more than ~3 s. Every figure carries a "Sumber: ..." line. No faces, no company or payroll-app names, no logos. The scaffold's `fakta.js` and `sisi.js` are not used: the scenes to build are `slip.js`, `sektor.js`, `rencana.js`, `ptkp.js` (plus the existing `hook.js` and `vonis.js`, rewritten).

### 1 · hook (LAPORAN MASUK)
- **Frame 0 (static, already visible):** large payslip card "SLIP GAJI" with rows "GAJI + TUNJANGAN TETAP ≤ Rp10.000.000" and, in bold, "**PPh 21: Rp0?**"; title "GAJI DI BAWAH RP10 JUTA BEBAS PAJAK 2027?"; tag chip "KLAIM · PPh 21 DTP 2027". Sumber: Menko Perekonomian, 9 Nov 2026.
- `sepuluh`: pen ring on "Rp10.000.000".
- `bebas`: highlighter on "BEBAS PAJAK" in the title.
- `belum` (~4,5 s, stamp sfx): red stamp **BARU RENCANA** across the slip; small status line "PMK 2027: BELUM TERBIT (cek 13 Nov)".
- Stills: 0 s = payslip "PPh 21: Rp0?" + title; 5 s = BARU RENCANA stamp.

### 2 · slip (BUKTI 1 · SLIP GAJIMU)
*[Sumber: PMK 105/2025 Pasal 5 ayat (1)-(3), Lampiran B contoh 1.]*
- Payslip worked example from the PMK (shown as an example, not "your" numbers): "GAJI Rp8.000.000 · TK/0".
- `dihitung` (tick): row "PPh 21 DIHITUNG: Rp120.000" ticks (still at 10 s: this row visible with the DTP chip coming in).
- `menanggung`: chip on the row "DITANGGUNG PEMERINTAH (DTP)".
- `tunai` (cash sfx): arrow from the row to a cash tile "DIBAYAR TUNAI BERSAMA GAJI"; small "tidak dihitung sebagai penghasilan kena pajak".
- `utuh` (ding): bottom row "DITERIMA: Rp8.000.000" with a tick; footnote "Contoh Lampiran B PMK 105/2025 (aturan 2026). Skema 2027 belum ada."
- `nggak` (Beni): question card "GAJIMU DI BAWAH RP10 JUTA?" with chips YA / TIDAK.
- `komentar`: comment-bubble icon "TULIS DI KOMENTAR".

### 3 · sektor (BUKTI 2 · ATURAN 2026)
*[Sumber: PMK 105/2025 Pasal 1 angka 6, Pasal 2 ayat (3), Pasal 3, Pasal 4; Lampiran A (133 KLU, per DJP).]*
- Five tiles (icons, no brands): ALAS KAKI · TEKSTIL & PAKAIAN JADI · FURNITUR · KULIT & BARANG KULIT · PARIWISATA (hotel, restoran, agen perjalanan).
- `padat` (tick): the first four tiles tick together, label "PADAT KARYA".
- `pariwisata` (tick): fifth tile ticks.
- Under the tiles, small checklist (already drawn, fades in after `pariwisata`): "Pegawai tetap (termasuk kontrak penuh waktu): gaji tetap ≤ Rp10 jt di Januari 2026 / bulan pertama kerja" · "Tidak tetap: ≤ Rp500 rb/hari atau ≤ Rp10 jt/bulan" · "NPWP/NIK terintegrasi DJP" · "Kode KLU kantor ada di lampiran".
- `Desember` (click): `calendar` strip "MASA PAJAK JAN-DES 2026" with a red pen ring on DES, chip "SETELAH ITU: PERLU ATURAN BARU".

### 4 · rencana (BUKTI 3 · RENCANA 2027)
*[Sumber: DDTCNews 9 Nov; IKPI 9 Nov; Katadata 9 Nov; DDTCNews 4 Okt; Bloomberg Technoz.]*
- `Airlangga`: quote card (no photo) “PPh ditanggung pemerintah untuk [pekerja] dengan gaji sampai Rp10 juta” · Menko Perekonomian, 9 Nov 2026.
- `semua` (swoosh): chip "2027: SEMUA SEKTOR · RENCANA".
- `Ditjen`: second quote card “Untuk bentuknya, apakah berupa PPh 21 DTP ataukah insentif, potongan lain nanti akan kami sampaikan” · Dirjen Pajak, Okt 2026.
- `diputuskan` (stamp): red stamp **BELUM DIPUTUSKAN**; chip "PMK 2027: BELUM ADA (cek 13 Nov)".

### 5 · ptkp (BUKTI 4 · PTKP)
*[Sumber: IKPI 5 Nov; Fortune IDN 5 Nov; PMK 105/2025 Lampiran B (PTKP Rp54.000.000).]*
- Card "PTKP SEKARANG: Rp54 JUTA/TAHUN · lajang tanpa tanggungan · ±Rp4,5 jt/bulan".
- `batas`: highlighter on "Rp54 JUTA/TAHUN".
- `Januari` (click): `calendar` "JANUARI 2027" with a red strike through "NAIK?".
- `selesai` (tick): quote “Jadi pembahasannya ini belum selesai, dan ini tidak akan diberlakukan di Januari.” · Menko Perekonomian, 5 Nov 2026. Small: "Besaran baru: belum ditetapkan."

### 6 · vonis (VONIS)
- Folder card: "2026: BERLAKU · 5 SEKTOR" ticked; "2027 SEMUA SEKTOR: RENCANA" with red "?"; "PTKP: TIDAK NAIK JANUARI".
- `ditutup`: stamp KASUS DITUTUP.
- `Tulis`: question card "GAJIMU DI BAWAH RP10 JUTA?" + comment icon.
- Small: "Ringkasan PMK 105/2025 dan pernyataan pejabat, bukan nasihat pajak".
- **Cover (last ~1 s, `K.cover`):** the subject object large: payslip "SLIP GAJI" with the bold row "**PPh 21: Rp0?**"; title "GAJI DI BAWAH RP10 JUTA BEBAS PAJAK 2027?"; chip "PPh 21 DTP · BARU RENCANA"; case stamp KASUS #15. No faces.

## Sumber (dua media untuk tiap klaim, atau buang klaimnya)

| # | Klaim | Media, tanggal |
|---|---|---|
| S1 | Primary text. PMK 105/2025 "Pajak Penghasilan Pasal 21 atas Penghasilan Tertentu yang Ditanggung Pemerintah dalam Rangka Stimulus Ekonomi Tahun Anggaran 2026", ditetapkan 29 Des 2025, diundangkan 31 Des 2025. Pasal 2 (3): "Masa Pajak Januari 2026 sampai dengan Masa Pajak Desember 2026". Pasal 3 (1): industri "1. alas kaki; 2. tekstil dan pakaian jadi; 3. furnitur; 4. kulit dan barang dari kulit; atau 5. pariwisata" + KLU di Lampiran A. Pasal 4 (2): pegawai tetap with NPWP/NIK "telah terintegrasi dengan sistem administrasi Direktorat Jenderal Pajak", "penghasilan bruto yang bersifat tetap dan teratur tidak lebih dari Rp10.000.000,00" in Masa Pajak Januari 2026 (or the first month of work), not receiving another PPh 21 DTP; (3): pegawai tidak tetap "rata-rata 1 (satu) hari tidak lebih dari Rp500.000,00" or monthly ≤ Rp10.000.000. Pasal 1 angka 6: Pegawai Tetap includes contract workers "sepanjang ... bekerja penuh". Pasal 5 (1): DTP "harus dibayarkan secara tunai oleh Pemberi Kerja pada saat pembayaran penghasilan"; (2) "tidak diperhitungkan sebagai penghasilan yang dikenakan pajak"; (3) "harus dibuatkan bukti pemotongan". Lampiran B contoh 1: gaji Rp8.000.000, TK/0, PPh 21 Rp120.000/bulan (Desember Rp540.000, setahun Rp1.860.000) all DTP, "Penghasilan setelah DTP" Rp8.000.000; PTKP "untuk wajib pajak sendiri Rp54.000.000,00". | JDIH BPK https://peraturan.bpk.go.id/Details/341778/pmk-no-105-tahun-2025 (PDF `/Download/404917/2025pmkeuangan105.pdf`, read 13 Nov) |
| S2 | DJP explainer: 5 sectors, 133 KLU, cash payment, employer may not keep the DTP; pariwisata covers hotels, villas, restaurants, travel agents, MICE. (Written by a DJP employee, "pendapat pribadi".) Five sectors also in Kontan / Katadata / Bisnis, Jan 2026. | pajak.go.id 8 Jan 2026 https://www.pajak.go.id/id/artikel/resmi-pph-21-dtp-2026-melalui-pmk-1052025-strategi-pemerintah-jaga-daya-beli-dan ; Katadata Jan 2026 https://katadata.co.id/amp/berita/industri/695b335b974bc/pekerja-di-lima-sektor-padat-karya-ini-bebas-pph-berikut-ketentuannya/ |
| S3 | Airlangga after the ratas, Wed 30 Sep: "Ini akan dilanjutkan di tahun depan, dan ini diberikan untuk sekitar 7,5 juta pekerja"; "yang tahun depan diberikan ke seluruh sektor yang gajinya di bawah 10 juta"; scheme as in the previous years; PTKP "sedang kami hitung bersama dengan Menteri Keuangan". | CNBC Indonesia 1 Okt https://www.cnbcindonesia.com/news/20260930202755-4-772310/mulai-2027-semua-pajak-gaji-di-bawah-rp10-juta-ditanggung-pemerintah ; IKPI 1 Okt https://ikpi.or.id/articles/mulai-2027-insentif-pph-21-karyawan-berlaku-di-seluruh-sektor ; CNA 1 Okt https://www.cna.id/indonesia/insentif-2027-pph-21-kpr-subsidi-pekerja-51411 |
| S4 | Airlangga at Kemenko Perekonomian, Mon 9 Nov: "PPh DTP kebanyakan untuk sektor formal, dan PPh ditanggung pemerintah untuk [pekerja] dengan gaji sampai Rp10 juta"; 2027 for all sectors; plan, no technical rule yet. Worker count reported differently from the same remarks (see Belum pasti). | DDTCNews 9 Nov 17:45 https://news.ddtc.co.id/berita/nasional/1823972/gaji-754-juta-karyawan-bakal-bebas-pajak-ini-kata-airlangga ; IKPI 9 Nov https://ikpi.or.id/articles/sebanyak-754-juta-pekerja-bakal-dapat-insentif-pph-21-dtp-pada-2027 ; Katadata 9 Nov 14:29 https://katadata.co.id/finansial/makro/6af1764e9c395/13-juta-pekerja-bergaji-di-bawah-rp10-juta-bakal-dapat-insentif-pajak ; Investortrust 9 Nov 16:09 https://investortrust.id/macro/121983/pemerintah-akan-perluas-target-insentif-pph-21-dtp-pada-2027 ; IDN Times 9 Nov |
| S5 | Dirjen Pajak Bimo Wijayanto: "Jadi, ini belum diputuskan"; "DJSEF sedang mengolah hal tersebut, kami juga sedang submit hasil perhitungan dampak per layer wajib pajak"; "Untuk bentuknya, apakah berupa PPh 21 DTP ataukah insentif, potongan lain nanti akan kami sampaikan" (DDTC, 4 Okt). Bloomberg Technoz: options include PPh 21 DTP or other incentives; "Pemerintah belum menetapkan ... mekanisme final insentif PPh Pasal 21". IKPI 9 Nov: Bimo, incentive only "kalau memang kami masih bisa mempertahankan basis untuk bisa sustain"; still "dalam tahap pembahasan". | DDTCNews 4 Okt https://news.ddtc.co.id/berita/nasional/1822984/pph-pekerja-mau-ditanggung-pemerintah-djp-masih-hitung-dampaknya ; Bloomberg Technoz https://www.bloombergtechnoz.com/detail-news/123444/gaji-di-bawah-rp10-juta-bakal-bebas-pph-cek-penjelasannya/2 ; IKPI 9 Nov https://ikpi.or.id/articles/pekerja-formal-bakal-jadi-penerima-utama-insentif-pph-21-dtp-2027 |
| S6 | Airlangga, press conference Thu 5 Nov: "Jadi pembahasannya ini belum selesai, dan ini tidak akan diberlakukan di Januari." "Jadi mungkin setelah Januari baru kita akan berlakukan." PTKP now Rp54 juta/tahun (TK/0, ~Rp4,5 jt/bulan), unchanged since 2016. | Fortune IDN 5 Nov 19:51 https://www.fortuneidn.com/news/penyesuaian-ptkp-setelah-januari-2027-00-6cmtl-1th2vk ; IKPI 5 Nov https://ikpi.or.id/articles/kenaikan-ptkp-tak-berlaku-januari-2027-airlangga-ungkap-alasannya ; IKPI 6 Nov (PTKP "belum dapat diterapkan" in January) |
| S7 | Wamenkeu Juda Agung: "Insentif untuk 2027 sebagian sudah ada di dalam APBN, sebagian [lagi] tentu saja ini perlu adjustment". Does not say whether PPh 21 DTP is budgeted. Background only, not used in narration. | DDTCNews 5 Okt https://news.ddtc.co.id/berita/nasional/1823028/banyak-insentif-pajak-di-2027-wamenkeu-sudah-diperhitungkan-di-apbn |
| S8 | Newest found: nothing new after 9 Nov. Suara 10 Nov calls it "wacana", details "dinamis" pending RAPBN/PMK; Radar Kediri 12 Nov repeats the 9 Nov remarks, no PMK, no DJP statement. No 2027 PMK found on the BPK JDIH listing or in the news through 13 Nov. | Suara 10 Nov https://www.suara.com/bisnis/2026/11/10/073459/pekerja-gaji-10-juta-bebas-pajak-ini-penjelasan-wacana-perluasan-pph-21-dtp-2027 ; Radar Kediri 12 Nov https://radarkediri.jawapos.com/ekonomi/2611120028/2-insentif-pekerja-menanti-di-2027-pph-21-dtp-dan-bantuan-subsidi-upah |

Not opened: periskop.id (HTTP 520). jdih.kemenkeu.go.id not needed (BPK copy read).

## Jangan dipakai

- "Bebas pajak" or "pasti mulai Januari 2027" as a fact. Wamanews' "siap dieksekusi serentak Januari 2027" is single-source and pre-dates the DJP caveat.
- A worker count in narration: Airlangga's 9 Nov remark is reported as 7,54 juta (DDTC, IKPI) and as 13 juta (Katadata, Investortrust, IDN Times, Suara). 7,5 juta (30 Sep) is double-sourced but now superseded; leave it off screen too.
- "2,2 juta pekerja penerima 2026" (IDN Times only).
- "Tambahan gaji Rp60-600 ribu per bulan" (DJP employee op-ed, single). Use only the PMK's own example (Rp120.000 on Rp8 juta, TK/0), labelled as an example.
- KSPI's demand to raise PTKP to Rp7,5 juta/bulan (Kontan only; an opinion).
- A budget figure for PPh 21 DTP 2027 (none published); belanja perpajakan 2027 Rp632 T is not this incentive.
- The Menteri Keuangan's name or a Menkeu quote: none found on this topic.
- "Hanya pegawai tetap": the 2026 rule also covers pegawai tidak tetap (S1 Pasal 4 (3)).
- Payroll-app, company or bank names; ASN/PNS-specific incentives (other rules, not checked).
- Mixing in BSU (Rp3 juta vs Rp3,5 juta confusion in 9 Nov reports); BSU is episode 23.

## Belum pasti

- Whether 2027 keeps the DTP form at all (S5: DTP "ataukah insentif, potongan lain").
- The Rp10 juta ceiling, the January basis month, whether pegawai tidak tetap stay in, and whether any sector or KLU list remains: only Airlangga's "semua sektor" (S3, S4); no text.
- Start date (January 2027 is implied, not stated in a regulation) and whether it sits in APBN 2027 (S7 is general).
- Number of workers: 7,54 juta vs 13 juta (same 9 Nov remark, S4).
- PTKP: new amount and date; "mungkin setelah Januari" (S6).
- Wording on the payslip itself: the PMK requires cash payment and a bukti pemotongan showing the DTP (S1 Pasal 5, Lampiran B note b); how each employer prints the slip is not regulated.

## Switch-over (if the 2027 PMK is issued before posting)

- Read the new PMK first (BPK JDIH / jdih.kemenkeu.go.id): ceiling, sectors/KLU, pegawai tetap/tidak tetap, basis month, period, cash payment.
- Hook: "..., tapi aturannya belum ada." → "..., dan aturannya sudah terbit." plus a check of what it covers; frame-0 stamp BARU RENCANA → "PMK [nomor]/2026 · TERBIT [tanggal]".
- Line 2: drop "Kalau skemanya sama seperti tahun ini"; keep the cash/payslip sentence only if the new PMK keeps Pasal 5-style cash payment.
- Line 4 (sektor): becomes "Tahun ini cuma lima industri; mulai Januari [cakupan baru]".
- Line 5 (rencana): replace the DJP sentence with the PMK's main condition; drop "Senin lalu".
- Vonis: "Kasus ditutup: aturannya sudah terbit, cek syaratnya." Caption first line: "PPh 21 DTP 2027 resmi: PMK [nomor]/2026".
- Re-voice only the changed lines (hook, slip-0, sektor, rencana, vonis) and only with the user's go-ahead (Cartesia credits are out). Post a same-day follow-up while searches spike.

## Caption (draft, 684 characters incl. line breaks)

```
Gaji di bawah Rp10 juta bebas pajak (PPh 21) 2027? Baru rencana. Senin (9/11) Menko Airlangga bilang PPh 21 DTP diperluas ke semua sektor tahun depan, tapi aturannya belum terbit dan Ditjen Pajak masih menghitung dampaknya.

Tahun ini (PMK 105/2025) hanya pekerja industri alas kaki, tekstil & pakaian jadi, furnitur, kulit, dan pariwisata, gaji tetap maks Rp10 juta/bulan, sampai Desember 2026. PPh 21 tetap dihitung, tapi dibayar tunai ke pekerja bersama gaji.

PTKP (Rp54 juta/tahun) tidak naik Januari 2027.

Gajimu di bawah Rp10 juta? Tulis di komentar.

Sumber: PMK 105/2025, IKPI, DDTCNews, Katadata, Fortune IDN. Bukan nasihat pajak.
#PPh21 #pajakgaji #gaji #bebaspajak #kasus
```

## Cek dengar (setelah voice)

PPh ("pe pe ha"), "PPh dua puluh satu", PTKP ("pe te ka pe"), Ditjen, Menko, Airlangga, "membayarkannya", "pembahasannya", "kantormu", "nggak", "sepuluh juta" (three times; keep the stress even). Hook pacing must stay even (no fast-to-slow).

## Kredit foto

- None. Illustrations and kit icons only.
