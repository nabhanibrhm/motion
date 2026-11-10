# Gibran Buka Suara: Tetap Fight di PTUN? (HOTWIZZ #07)

HotWizz Flash, follow-up to #06 `gibran`. Narrator: Nisa (wec, Cartesia). 6 lines, 741 chars (~50 s), 30 fps, no baked bed. **Story broke at: 10 Nov 2026 ~17:37 WIB** (Gibran at Istana Wapres; CNN 17:37, CNBC 17:46; Yusril: Antara 17:22, Republika 17:46, CNN 18:07). **Post within ~12 h: by ~05:30 on 11 Nov; aim for tonight.** Researched and scripted on WSL 10 Nov ~19:40.

Retention rules (README "Retention rules"), plus **loop**: the hook has `introCover: true`, so frame 0 and the last frame are the same title cover card (Gibran face, HOTWIZZ #07, "GIBRAN / TETAP FIGHT / DI PTUN", chip KATA GIBRAN). Pick either as the TikTok cover.

## Script

| Section | Line | Sources |
|---|---|---|
| hook | Gibran akhirnya buka suara soal niat mundurnya. Katanya, Presiden Prabowo menyarankan ia tetap fight di PTUN. | S1, S2 |
| kutipan | Di Istana Wakil Presiden, Gibran mengatakan ia tidak ingin dinamika ini menjadi polemik politik yang berkepanjangan. | S1 |
| saran | Menurut Gibran, sarannya: bawa dokumen pendidikan dari SD sampai S1 ke PTUN, dan minta Kementerian Pendidikan Dasar dan Menengah mengajukan PK ke Mahkamah Agung. | S2, S3 |
| yusril | Tapi Menko Yusril Ihza Mahendra menilai putusan MA sudah final, dan Gibran tidak bisa mengajukan PK karena bukan pihak dalam perkara. | S4, S5 |
| belum | Sampai malam ini, Gibran masih menjabat. Ia belum menyatakan mundur atau bertahan, dan surat pengunduran diri belum ada. | S6, S7 |
| penutup | Menurutmu Gibran sebaiknya mundur atau tetap fight di PTUN? Tulis di komentar dan follow untuk update. | — |

Frame 0 (= last frame): Gibran photo + "GIBRAN: TETAP FIGHT" + "Saran Prabowo: lewat PTUN" + tag "KATA GIBRAN · 10 NOV". Equal treatment: Gibran (kutipan) and Yusril (yusril) both get the same hw-quote card with an official portrait and a verbatim quote. Say map: fight → "fait", S1 → "es satu", PK → "pe ka". No line ends on a spoken number.

## Sources (two outlets per claim, or drop it)

| # | Claim | Outlets, date |
|---|---|---|
| S1 | Gibran spoke at Kantor/Istana Wapres, Tue 10 Nov: "Saya tidak ingin dinamika yang terjadi saat ini menjadi polemik politik yang berkepanjangan" (CNBC wording; CNN: "saya tidak ingin dinamika menjadi polemik politik berkepanjangan"); he did not plainly say he would resign (CNN) | CNBC Indonesia 17:46; CNN Indonesia 17:37 |
| S2 | "Salah satu saran beliau itu adalah agar saya tetap fight di PTUN … dengan menghadirkan seluruh dokumen-dokumen dari SD sampai S1" | CNBC; Kompas.id ("tetap 'fight' di PTUN"); Beritasatu; Media Indonesia ("Presiden sarankan saya berjuang di PTUN") |
| S3 | "berkoordinasi dengan Dikdasmen untuk mengajukan PK di MA" | CNBC; iNews ("Gibran siapkan PK"); Bloomberg Technoz ("Gibran minta Kemdikbud ajukan PK"); periskop |
| S4 | Yusril: "Memang ini sudah tidak bisa diapa-apakan lagi"; MA ruling final "oleh karena tidak ada pihak yang bisa mengajukan PK atas putusan itu" | Republika 17:46; Antara 17:22; Suara 19:04; CNN 18:07 ("Dan memang …") |
| S5 | Gibran can't appeal/PK: not a party (not tergugat intervensi). CNN quote: "Pak Wapres tidak bisa mengajukan PK karena beliau bukan pihak dalam perkara" | CNN; Antara & Suara (paraphrase); Republika (paraphrase) |
| S6 | Still in office, not formally resigned | Bisnis; Jakarta Globe; IDN Times (Mensesneg, Puan) |
| S7 | No resignation letter; he did not state resign or stay | CNN ("tidak secara gamblang"); CNBC; Tribunnews (DPR waits for an official letter) |

Context (not narrated): Yusril expects ("nampaknya") Kemendikdasmen will not file PK and will execute the ruling once the official copy arrives (Antara, Suara); a prediction, not an action. Yusril on PTUN: "Tidak ada gunanya" (CNN only). HMP: PKS (Mardani) says it continues despite the intent (Tribunnews, iNews); count 48 vs 50 conflicts. Wakil Ketua DPR Saan Mustopa: Gibran has the right to test it at PTUN (Tribunnews only). Suara: Gibran "disebut bertahan karena diminta ayahnya" (single outlet, unnamed source).

## Do not use

- "Gibran menolak mundur" / "Gibran bertahan" (he said neither).
- "Gibran batal mundur" (no outlet with a named source says so).
- "Kemendikdasmen tidak akan PK" as fact (Yusril's "nampaknya" only).
- "Jokowi menahan Gibran" (Suara, unnamed source).
- "PTUN tidak ada gunanya" on screen (CNN only).
- A single HMP signature count.
- Republika's "Gibran tidak memiliki ijazah SMA" framing (MA annulled the equivalency letter).

## Before voicing

1. Recheck (5 min): letter sent? Gibran withdrew the intent? Kemendikdasmen statement on PK? Update `belum` if so.
2. `node scripts/motion.mjs voice fight` (~741 Cartesia chars). Check by ear: "fight", "S1", "PK", "Yusril Ihza Mahendra", "Kementerian Pendidikan Dasar dan Menengah".
3. Stills at 0, 5, 10 s and the last frame (must match frame 0); render; caption `out/caption/18-fight-caption.txt`.
