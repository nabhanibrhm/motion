# People photos (HotWizz Flash)

Portraits for the `hw-hook` and `hw-quote` templates, referenced from `episode.json` as `"photo": "people/<slug>.jpg"` with a `"credit"` string (validation fails without one). An episode may override a file at `episodes/<NN>_<id>/assets/people/<slug>.jpg`. Only files a scene references are staged into a build.

## File rules

- Name: `<slug>.jpg`, lowercase ASCII with hyphens (`prabowo.jpg`, `listyo-sigit.jpg`); add a suffix for a second photo of the same person (`listyo-ksp.jpg`).
- Crop: **450 × 600** (3:4), head and shoulders, eyes at roughly 30% from the top, face centred. The templates show it with `object-position: 50% 22%`.
- Grade: neutral. Normalise exposure and white balance only; no stylised filters, no unflattering frames. The template adds the same light grade (saturate 0.9, contrast 1.05) to everyone.
- JPEG quality about 85, under ~80 KB.
- **Equal treatment:** in one video, every person on both sides of a story gets the same crop, grade and card. If one side has no usable photo, use `"photo": null` (silhouette) for all of them.

## Licence rules

- Use Wikimedia Commons files that are public domain or CC BY / CC BY-SA, or official government photos released into the public domain (e.g. BPMI Setpres). No press-agency photos, screenshots of broadcasts or court footage.
- Be wary of Commons uploads credited to a news outlet by an "unknown author": they are likely press photos with a doubtful licence. Ask the user before using one, and switch everyone to silhouettes if it is deleted or a claim arrives.
- The `credit` string goes on screen as `Foto: <credit>`: author or institution, source, licence, e.g. `"BPMI Setpres (domain publik)"`, `"Nama Pemotret via Wikimedia Commons (CC BY-SA 4.0)"`. Repeat it in the TikTok caption.
- Record the source URL, author and licence of each file below when adding it.

## Files

| File | Person | Source URL | Author | Licence |
|---|---|---|---|---|
| prabowo.jpg | Prabowo Subianto | https://commons.wikimedia.org/wiki/File:Prabowo_Subianto_2024_official_portrait.jpg | Darwis Triadi & Ministry of State Secretariat | Public domain |
| gibran.jpg | Gibran Rakabuming Raka | https://commons.wikimedia.org/wiki/File:Gibran_Rakabuming_2024_official_portrait.jpg | Darwis Triadi & Ministry of State Secretariat | Public domain |
| jokowi.jpg | Joko Widodo | https://commons.wikimedia.org/wiki/File:Joko_Widodo_2019_official_portrait.jpg | Ministry of State Secretariat of the Republic of Indonesia (Kementerian Sekretariat Negara Republik Indonesia) | Public domain |
| listyo-sigit.jpg | Listyo Sigit Prabowo | https://commons.wikimedia.org/wiki/File:Listyo_Sigit_Prabowo,_Kepala_Staf_Presiden_(2026).jpg | Kantor Staf Presiden Republik Indonesia | Public domain |
| listyo-kapolri.jpg | Listyo Sigit Prabowo | https://commons.wikimedia.org/wiki/File:Kapolri_Jenderal_Polisi_Listyo_Sigit_Prabowo.jpg | Indonesian National Police | Public domain |
| suyudi.jpg | Suyudi Ario Seto | https://commons.wikimedia.org/wiki/File:Kapolri_Jenderal_Polisi_Suyudi_Ario_Seto.jpg | Divisi Hubungan Masyarakat Kepolisian Negara Republik Indonesia | Public domain |
| agus-subiyanto.jpg | Agus Subiyanto | https://commons.wikimedia.org/wiki/File:Panglima_TNI_Jenderal_TNI_Agus_Subiyanto.jpg | Indonesian National Armed Forces | Public domain |
| ksal-muhammad-ali.jpg | Muhammad Ali | https://commons.wikimedia.org/wiki/File:KASAL,Laksamana_TNI_Muhammad_Ali.jpg | Indonesian Navy Information Service | Public domain |
| prasetyo.jpg | Prasetyo Hadi | https://commons.wikimedia.org/wiki/File:Mensetneg_Prasetyo_Hadi.jpg | Minsitry of State Secretariat | Public domain |
| yusril.jpg | Yusril Ihza Mahendra | https://commons.wikimedia.org/wiki/File:Yusril_Ihza_Mahendra,_Menko_Kumham-Imipas_2026.jpg | PPID Kemenko Kumham-Imipas | Public domain |
| pramono.jpg | Pramono Anung | https://commons.wikimedia.org/wiki/File:Pramono_Anung_Gubernur_DKI.jpg | Government of Jakarta | Public domain |
| puan.jpg | Puan Maharani | https://commons.wikimedia.org/wiki/File:Puan_Maharani,_Ketua_DPR-RI_(2024%E2%80%932029).jpg | House of Representatives of the Republic of Indonesia | Public domain |
| dasco.jpg | Sufmi Dasco Ahmad | https://commons.wikimedia.org/wiki/File:Sufmi_Dasco_Ahmad,_Wakil_Ketua_DPR-RI_(2024%E2%80%932029).jpg | House of Representatives of the Republic of Indonesia | Public domain |
| suahasil.jpg | Suahasil Nazara | https://commons.wikimedia.org/wiki/File:Suahasil_Nazara,_Menteri_Keuangan_RI_(2026).jpg | Ministry of Finance, Republic of Indonesia | Public domain |
| bahlil.jpg | Bahlil Lahadalia | https://commons.wikimedia.org/wiki/File:Bahlil_Lahadalia_Official_Portrait.png | Indonesian Investment Ministry | Public domain |
| raffi-ahmad.jpg | Raffi Ahmad | https://commons.wikimedia.org/wiki/File:Raffi-Ahmad-2020_(cropped).jpg | Lautner of the king at Indonesian Wikipedia | CC BY 3.0 (2020 photo; the 2024 Setpres-style PD files are only ~190×280) |

Roles and on-screen `credit` strings per file: `people.json`. Roles as of Nov 2026 (Kapolri changed 1 Oct 2026; Listyo Sigit is now Kepala Staf Kepresidenan). Not included: Roy Suryo (only a 2017 DPR portrait, 550 px, formal costume, framing inconsistent with the rest) and Tifauzia Tyassuma (only a video screenshot); both use the silhouette.

| gibran-mpr-cnbc.jpg | Gibran Rakabuming Raka (12 Nov 2026, Gedung Nusantara III) | CNBC Indonesia press photo, supplied by the user | CNBC Indonesia | **Not public domain.** Used cropped (520x366) in HOTWIZZ #09 `surat` only; credit "Foto: CNBC Indonesia" in the caption. Not listed in people.json |
