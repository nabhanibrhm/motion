# Part 3/4 of the chronological UFO mini-story from Windah's GTA VI stream #5 (yt lF_QYSm2T-Q, file t 0 = 21 Nov 2026 19:16:01 WIB).
# Facecam-below layout, stream #5 cam (FACES['live5']). Cuts are in HOUR-FILE seconds of stream-2316-0014.mp4 (h5, file t 0 = 23:16 WIB);
# the source is the pieces joined in output order (windah_src.py). The first cut is a ~1.2 s teaser (frame 0).
yt = 'lF_QYSm2T-Q'
layout = 'face'; face = 'live5'
tag = 'WINDAH BASUDARA · GTA VI · PART 3 DARI 4'
base = {'T': (1617.8, 0.0), 'A': (1521.3, 2.4), 'B': (1613.5, 5.7), 'C': (1669.0, 12.0), 'D': (1686.0, 14.6), 'E': (1744.4, 20.9), 'F': (1833.5, 25.1), 'G': (1862.3, 29.65), 'H': (2332.4, 32.75), 'I': (2380.4, 38.05), 'J': (2495.7, 42.25), 'K': (2515.9, 45.65), 'L': (2523.3, 52.75)}
cuts = [('T', 1618.40, 1619.60),   # TEASER h5 26:58.4-26:59.6: glowing teal and gold egg pods in the dark hall (frame 0)
        ('A', 1521.90, 1524.00),   # h5 25:21.9-25:24: the dream, a hall of lights, "guys, tapi lihat ini apa guys?"
        ('B', 1614.10, 1619.20),   # h5 26:54.1-26:59.2: egg hall, "jangan lari, kalau lari dia marah telurnya"
        ('C', 1669.60, 1671.00),   # h5 27:49.6-27:51: the solar-system room, "interstellar"
        ('D', 1686.60, 1691.70),   # h5 28:06.6-28:11.7: "bumi, bumi, bumi", the Earth zoom onto the compound, "rumah siapa tuh?"
        ('E', 1745.00, 1748.00),   # h5 29:05-29:08: Lucia walks to the keypad with the bars, "apaan itu?"
        ('F', 1834.10, 1837.45),   # h5 30:34.1-30:37.5: the three doors, "tengah UFO, voting deh... gue takut bad ending cuy"
        ('G', 1862.90, 1864.80),   # h5 31:02.9-31:04.8: Lucia walks through the middle door into the blue burst
        ('H', 2333.00, 2337.10),   # h5 38:53-38:57.1: the compound gate by day, "kenapa mimpi alien itu mengarahkan kesini?" + label SETELAH BANGUN
        ('I', 2381.00, 2384.00),   # h5 39:41-39:44: Lucia climbs the pylon tower stairs (silent)
        ('J', 2496.30, 2498.50),   # h5 41:36.3-41:38.5: down the dark stairs, "kenapa jadi horror ya?"
        ('K', 2516.50, 2522.40),   # h5 41:56.5-42:02.4: restricted-area keypad door, phone note 3241, "dari mana gue dapet kode itu?"
        ('L', 2523.90, 2528.20)]   # h5 42:03.9-42:08.2: "kode yang di alien di mimpi, guys!", the door opens and Lucia walks in
hours = {k: 5 for k, s, e in cuts}
hook = ('PART 3 · KODE DARI MIMPI', 'TERNYATA BUKA PINTU')
subs = [('A', 1521.96, 1522.94, 'GUYS, TAPI LIHAT INI'),
        ('A', 1522.94, 1523.95, 'INI ' + P + 'APA' + V + ' GUYS?'),
        ('B', 1614.24, 1616.10, 'JANGAN LARI, CUY'),
        ('B', 1617.14, 1617.75, 'KALAU LARI,'),
        ('B', 1617.75, 1619.15, 'DIA MARAH ' + P + 'TELURNYA' + V),
        ('C', 1669.87, 1670.90, P + 'INTERSTELLAR' + V),
        ('D', 1686.78, 1687.90, P + 'BUMI' + V + ', BUMI, BUMI'),
        ('D', 1690.80, 1691.60, 'RUMAH SIAPA TUH?'),
        ('E', 1745.05, 1747.30, 'APAAN ' + P + 'ITU' + V + '?'),
        ('F', 1834.19, 1835.87, 'TENGAH UFO, VOTING DEH'),
        ('F', 1835.95, 1837.40, 'TAKUT ' + P + 'BAD ENDING' + V + ', CUY'),
        ('H', 2333.56, 2334.70, 'ADA APA DI SINI?'),
        ('H', 2334.80, 2336.00, 'KENAPA ' + P + 'MIMPI ALIEN' + V),
        ('H', 2336.00, 2337.05, 'NGARAH KE SINI?'),
        ('J', 2496.40, 2498.30, 'KENAPA JADI ' + P + 'HORROR' + V + ' YA?'),
        ('K', 2517.00, 2518.05, '3241, GUE DAPET ' + P + 'NOTE' + V),
        ('K', 2518.12, 2519.10, 'DARI MANA NOTENYA?'),
        ('K', 2519.44, 2519.95, 'WAIT A MINUTE'),
        ('K', 2520.66, 2521.45, 'DARI MANA GUE'),
        ('K', 2521.45, 2522.35, 'DAPET ' + P + 'KODE' + V + ' ITU?'),
        ('L', 2524.12, 2525.68, 'KODE YANG DI ' + P + 'ALIEN' + V),
        ('L', 2525.72, 2526.60, 'DI ' + P + 'MIMPI' + V + ', GUYS!')]
labels = [('H', 2333.00, 2335.30, 'SETELAH BANGUN')]
freeze = 0; endcap = None
srcdesc = ("Source = .cache/wizzclip/windah-gtavi-ufoarc3/source.mp4 (also Drive clip-src/windah-gtavi-ufoarc3.mp4): thirteen pieces (0.6 s padding each) of "
           "windah-live5/stream-2316-0014.mp4 (stream #5 hour 5, file t 0 = 23:16 WIB) in output order, 1080p30 re-encoded and joined.")
beats = ("Beats in stream order: frame-0 teaser (h5 26:58, glowing teal and gold egg pods, 1.2 s); the dream (h5 25-31 min): hall of lights 'ini apa guys?' (25:22), eggs 'jangan lari, kalau lari dia marah telurnya' (26:54), "
         "solar system 'interstellar' (27:50), Earth zoom 'bumi bumi bumi... rumah siapa tuh?' (28:07), keypad 'apaan itu?' (29:05), the three doors 'tengah UFO, voting deh... gue takut bad ending cuy' (30:34), the middle door into the blue burst (31:03); "
         "label SETELAH BANGUN, then the real compound by day, 'kenapa mimpi alien itu mengarahkan kesini?' (38:53), the tower stairs (39:41), the dark stairs 'kenapa jadi horror ya?' (41:36) and the restricted-area door: "
         "'3241, gue dapet note, dari mana gue dapet kode itu? wait a minute... kode yang di alien, di mimpi, guys' (41:56-42:08). Word timings from short-window faster-whisper medium with VAD (the 3241 line reuses the ufo2 timings). "
         "CUT: 27:12-27:17 'oh s**t', 28:01 'Uranus' wordplay (the cut skips 27:51-28:06), the browser window with chat names (h5 30:46-30:56, between F and G), 'anjeng virus' at ~30:57-31:05 (G ends 31:04.8 before the voice; check by ear), "
         "33:50-34:25 Lucia in a bra top, the ride-share app screens (36:36-38:00), the body on the ground at 39:50, 41:45.7 'anjir', the in-game subtitles 'The hell..?' (25:49-25:52, outside the cuts) and 'Where am I'. "
         "In-game subtitles sit below source y846 and are cropped away by the face layout. No guns, gore, drugs in these frames.")
what = "UFO mini-story part 3/4: the dream (eggs, planets, Earth, the doors), then the real compound and the 3241 door from the dream."
