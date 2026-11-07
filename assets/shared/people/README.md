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
