# Part 4/4 of the chronological UFO mini-story from Windah's GTA VI stream #5 (yt lF_QYSm2T-Q, file t 0 = 21 Nov 2026 19:16:01 WIB).
# Facecam-below layout, stream #5 cam (FACES['live5']). Cuts are in HOUR-FILE seconds of stream-2316-0014.mp4 (h5, file t 0 = 23:16 WIB);
# the source is the pieces joined in output order (windah_src.py). The first cut is a ~1.2 s teaser (frame 0).
yt = 'lF_QYSm2T-Q'
layout = 'face'; face = 'live5'
tag = 'WINDAH BASUDARA · GTA VI · PART 4 DARI 4'
base = {'T': (3026.8, 0.0), 'A': (2595.0, 2.4), 'R': (2731.6, 6.0), 'B1': (2864.3, 11.5), 'B2': (2870.8, 18.0), 'B3': (2883.7, 24.0), 'S': (2962.4, 27.85), 'S2': (2982.4, 38.05), 'S3': (2986.4, 41.55), 'U': (3021.4, 45.05), 'C1': (3365.4, 54.25), 'C2': (3376.4, 58.25)}
cuts = [('T', 3027.40, 3028.60),   # TEASER h5 50:27.4-50:28.6: the UFO with ring lights over the pylon tower, burning vans, Lucia in front (frame 0)
        ('A', 2595.60, 2598.00),   # h5 43:15.6-43:18: inside the red-lit control room, "guys, ini kayak di mimpi guys" + label MASUK KE DALAM
        ('R', 2732.20, 2736.50),   # h5 45:32.2-45:36.5: the radiation door, "mimpi itu pertanda, orang-orang di sini peneliti mati semua di ruang radiasi"
        ('B1', 2864.90, 2870.20),  # h5 47:44.9-47:50.2: photo mode on the alien baby on the slab, "viralin guys! alien nyata di bumi!"
        ('B2', 2871.40, 2876.20),  # h5 47:51.4-47:56.2: "kasih filter... bukan AI, bukan AI!" (photo filters cycle)
        ('B3', 2884.30, 2886.95),  # h5 48:04.3-48:06.95: "eh? dia bayi."
        ('S', 2963.00, 2972.00),   # h5 49:23-49:32: "let me get you out of here, little boy" (Lucia), "hah? cutscene?", "eh, sebenernya kita selamatin"
        ('S2', 2983.00, 2985.30),  # h5 49:43-49:45.3: Lucia carries the alien baby, it floats up in the light
        ('S3', 2987.00, 2989.30),  # h5 49:47-49:49.3: Lucia lifted toward the glowing orbs
        ('U', 3022.00, 3030.00),   # h5 50:22-50:30: the UFO hovers over the pylon tower, vans burning (silent)
        ('C1', 3366.00, 3368.80),  # h5 56:06-56:08.8: closing words: "udah satu yang kita tau, manusia jahat, alien baik"
        ('C2', 3377.00, 3379.90)]  # h5 56:17-56:19.9: "dan kita udah berhasil nolongin anak bayi aliennya, temen-temen ya"
hours = {k: 5 for k, s, e in cuts}
hook = ('PART 4 · ALIEN BAYI', 'LUCIA SELAMATIN ANAK ALIEN')
subs = [('A', 2596.23, 2597.47, 'INI KAYAK DI ' + P + 'MIMPI' + V + ', GUYS'),
        ('R', 2732.28, 2733.66, 'MIMPI ITU PERTANDA, GUYS'),
        ('R', 2733.66, 2734.80, 'ORANG DI SINI PENELITI'),
        ('R', 2734.86, 2736.50, P + 'MATI SEMUA' + V + ' DI RUANG RADIASI'),
        ('B1', 2865.58, 2867.80, P + 'VIRALIN' + V + ' GUYS!'),
        ('B1', 2868.13, 2870.15, 'ALIEN NYATA DI ' + P + 'BUMI' + V + '!'),
        ('B2', 2871.56, 2872.45, 'KASIH FILTER'),
        ('B2', 2873.71, 2876.05, P + 'BUKAN AI!' + V),
        ('B3', 2884.60, 2885.75, 'EH?'),
        ('B3', 2885.90, 2886.90, P + 'DIA BAYI' + V + '.'),
        ('S', 2963.83, 2965.80, 'KELUAR DARI SINI,'),
        ('S', 2965.80, 2966.40, P + 'NAK' + V + '.'),
        ('S', 2966.87, 2967.60, 'HAH? ' + P + 'CUTSCENE' + V + '?'),
        ('S', 2970.90, 2971.95, 'EH, KITA ' + P + 'SELAMATIN' + V),
        ('C1', 3366.07, 3367.15, 'UDAH SATU YANG KITA TAU'),
        ('C1', 3367.21, 3368.10, P + 'MANUSIA JAHAT' + V + ','),
        ('C1', 3368.23, 3368.78, P + 'ALIEN BAIK' + V),
        ('C2', 3377.05, 3378.09, 'KITA UDAH BERHASIL'),
        ('C2', 3378.09, 3379.85, P + 'NOLONGIN' + V + ' BAYI ALIEN')]
labels = [('A', 2595.60, 2597.90, 'MASUK KE DALAM')]
freeze = 0; endcap = None
srcdesc = ("Source = .cache/wizzclip/windah-gtavi-ufoarc4/source.mp4 (also Drive clip-src/windah-gtavi-ufoarc4.mp4): twelve pieces (0.6 s padding each) of "
           "windah-live5/stream-2316-0014.mp4 (stream #5 hour 5, file t 0 = 23:16 WIB) in output order, 1080p30 re-encoded and joined.")
beats = ("Beats in stream order: frame-0 teaser (h5 50:27, the UFO over the tower, 1.2 s); label MASUK KE DALAM, the red-lit control room 'guys, ini kayak di mimpi guys' (43:16); the radiation door 'mimpi itu pertanda... peneliti mati semua di ruang radiasi' (45:32); "
         "the alien baby on the slab in photo mode 'viralin guys! alien nyata di bumi... kasih filter... bukan AI' (47:45-47:56) and 'eh? dia bayi.' (48:05); the rescue (49:23-49:49): Lucia 'let me get you out of here, little boy', Windah 'hah? cutscene? eh, sebenernya kita selamatin', "
         "Lucia carries the baby, it floats up in the light, Lucia is lifted toward the orbs; the UFO over the tower with burning vans (50:22-50:30); closing words after he reloads and watches a walkthrough: 'manusia jahat, alien baik' (56:06) and "
         "'kita udah berhasil nolongin anak bayi aliennya' (56:17). Word timings from short-window faster-whisper medium with VAD (the ufo3 timings for the slab; 'little boy' and 'hah? cutscene?' are Lucia and Windah as heard). "
         "CUT: h5 46:35-46:50 and 54:05 'motion clip' promo, 47:13 weapon wheel, 47:22-47:31 subtitles incl. 'No fucking way', 49:33-49:35 'what the f...', 49:36-49:42 the tank-top chest close-up with the grey alien and 'oh, s...' (49:39), 49:50 'Lucia: Fuck.' (S3 ends at 49:49.3), "
         "the 50:21 vehicle explosion flash (U starts 50:22), the YouTube walkthrough (51:36-53:20) and the rifle (53:20-55:20). In-game subtitles sit below source y846 and are cropped away by the face layout. "
         "Frames: dark control room, radiation door with a hazmat suit in the tunnel (45:33-45:36), the alien baby, Lucia carrying it, fire and the UFO, a biplane at night; no guns, no shooting.")
what = "UFO mini-story part 4/4: inside the compound, the alien baby on the slab, Lucia rescues it, the UFO arrives and Windah's closing line."
