# "Mending balap": the running joke that heists pay almost nothing, stream #7 (yt MWQtXTTAgeM, 22 Nov 2026, file t 0 = 21:59 WIB).
# Facecam-below layout, stream #7 cam (FACES['live7']). Cuts are in HOUR-FILE seconds of windah-live7/stream-2259-0001.mp4 (hour 2, WIB = local + 22:59);
# the source is the pieces joined in output order (windah_src.py). Frame 0 = 1.5 s teaser of the punchline (the last shot, played in full at the end).
yt = 'MWQtXTTAgeM'
layout = 'face'; face = 'live7'
base = {'T': (1839.4, 0), 'K1': (1225.7, 2.7), 'K2': (1764.6, 9.6), 'K2b': (1771.2, 15.6), 'K3': (1805.2, 20.0), 'K4': (1808.4, 23.4), 'K5': (1837.6, 26.45)}
cuts = [('T', 1840.00, 1841.50),    # TEASER 30:40.0-30:41.5: 4-star chase in the white sedan, "bintang empat, lima ratus dolar" (frame 0)
        ('K1', 1226.30, 1232.00),   # 20:26.3-20:32: boat on the river, "mending gua balap ga sih guys? cuma lima ratus dolar. Non-lethal, nice. Clean getaway, nice" (ends well before the 20:39 status page)
        ('K2', 1765.20, 1770.00),   # 29:25.2-29:30: white sedan on a dirt road, "mending go balap, ga harus muter-muter ga jelas gini, dapet lima ribu"
        ('K2b', 1771.80, 1775.00),  # 29:31.8-29:35: "ya dapet dua ribu, ini udah dikejar polisi sana sini"
        ('K3', 1805.80, 1808.00),   # 30:05.8-30:08: "balap gue juara satu terus, Joy"
        ('K4', 1809.00, 1810.85),   # 30:09-30:10.85: "lima ratus dolar? What?"
        ('K5', 1838.20, 1841.50)]   # 30:38.2-30:41.5: "aduh, udah capek-capek bintang empat, lima ratus dolar" (stops before "babi-babi" at 30:42.2)
hours = {k: 2 for k in base}
hook = ('RAMPOK CAPEK-CAPEK', 'MENDING BALAP')
subs = [('T', 1840.05, 1840.70, 'BINTANG EMPAT'),
        ('T', 1840.76, 1841.48, P + 'LIMA RATUS DOLAR' + V),
        ('K1', 1226.74, 1228.16, 'MENDING GUA ' + P + 'BALAP' + V),
        ('K1', 1228.16, 1228.72, 'GA SIH, GUYS?'),
        ('K1', 1228.76, 1229.40, 'CUMA ' + P + 'LIMA RATUS' + V),
        ('K1', 1229.42, 1230.86, P + 'NON-LETHAL' + V + ', NICE!'),
        ('K1', 1230.88, 1231.98, 'CLEAN GETAWAY, NICE!'),
        ('K2', 1765.56, 1766.64, 'MENDING GO ' + P + 'BALAP' + V),
        ('K2', 1766.66, 1767.82, 'GA HARUS MUTER-MUTER'),
        ('K2', 1767.84, 1768.66, 'GA JELAS GINI,'),
        ('K2', 1768.68, 1769.95, 'DAPET ' + P + 'LIMA RIBU' + V),
        ('K2b', 1771.88, 1772.90, 'YA, DAPET ' + P + 'DUA RIBU' + V),
        ('K2b', 1772.92, 1774.40, 'INI UDAH DIKEJAR POLISI'),
        ('K2b', 1774.42, 1774.98, 'SANA, SINI'),
        ('K3', 1805.88, 1806.92, 'BALAP GUE ' + P + 'JUARA SATU' + V),
        ('K3', 1806.94, 1807.95, 'TERUS, JOY!'),
        ('K4', 1809.16, 1810.40, P + 'LIMA RATUS DOLAR' + V + '?'),
        ('K4', 1810.44, 1810.80, 'WHAT?'),
        ('K5', 1838.30, 1840.02, 'ADUH, UDAH CAPEK-CAPEK'),
        ('K5', 1840.04, 1840.72, 'BINTANG EMPAT'),
        ('K5', 1840.76, 1841.48, P + 'LIMA RATUS DOLAR' + V)]
freeze = 0; endcap = None
srcdesc = ("Source = .cache/wizzclip/windah-gtavi-mending-balap/source.mp4 (also Drive clip-src/windah-gtavi-mending-balap.mp4): seven pieces (0.6 s padding each) of the stream #7 hour-2 recording "
           "(windah-live7/stream-2259-0001.mp4, WIB = local + 22:59) in output order, 1080p30 re-encoded and joined.")
beats = ("Running joke: heists pay next to nothing, so Windah would rather race. Frame-0 teaser = the punchline shot (30:40 'bintang empat, lima ratus dolar', 1.5 s), then stream order: "
         "20:26 on the boat after the getaway, 'mending gua balap ga sih guys? cuma lima ratus dolar' with the 'Non-Lethal' and 'Clean Getaway' toasts (cut ends 20:32, before the character status page that starts ~20:39); "
         "29:25 'mending go balap, ga harus muter-muter ga jelas gini, dapet lima ribu' and 29:32 'dapet dua ribu, ini udah dikejar polisi' (white sedan, 4-star chase, no gunfire or people on screen); "
         "30:06 'balap gue juara satu terus, Joy', 30:09 'lima ratus dolar? What?', and the closing 30:38 'udah capek-capek bintang empat, lima ratus dolar'. Word timings from faster-whisper medium with VAD on short windows (+-5 s). "
         "CUT: 20:09 'anjir, cuma 500 dolar', 20:22 in-game 'mereka membunuh anakmu', 20:40-20:55 Lucia bikini status page, 29:22-29:24 'mending go balap, anjir' (swear), the two 'bullshit' lines at 29:59-30:03, 30:42 'babi-babi', 29:35-30:05 filler. "
         "Amounts are what medium hears ('500 dolar' x3, 'Rp5.000', 'Rp2.000'); the small model heard '50 dolar'. Check by ear before posting. Digits are avoided in subs (Audex draws 5 like S). "
         "No guns, gore, bikini, gambling, real brand or self-promo in the played frames.")
what = "Windah Basudara's running joke in GTA VI: the heist barely pays, so he would rather race (mending balap)."
