# Part 2/3 of the UFO arc from Windah's GTA VI stream #5 (yt lF_QYSm2T-Q, file t 0 = 21 Nov 2026 19:16:01 WIB).
# Facecam-below layout, stream #5 cam (FACES['live5']). Cuts are in HOUR-FILE seconds (h5 = stream-2316-0014.mp4).
yt = 'lF_QYSm2T-Q'
layout = 'face'; face = 'live5'
base = {'A': (2515.0, 0.0), 'B': (1500.0, 14.0), 'C': (1613.0, 22.0), 'D': (1685.5, 30.0)}
cuts = [('A', 2516.50, 2522.40),   # h5 41:56.5-42:02.4: restricted-area keypad door, phone note 3241, "dari mana gue dapet kode itu?"
        ('A', 2523.90, 2528.20),   # h5 42:03.9-42:08.2: "kode yang di alien di mimpi, guys!", the door opens (42:06.8) and Lucia walks in
        ('B', 1502.00, 1506.25),   # h5 25:02.0-25:06.25: the dream, white void, the black oval portal, "lubang"
        ('C', 1614.10, 1619.20),   # h5 26:54.1-26:59.2: egg hall, "jangan lari, kalau lari dia marah telurnya"
        ('D', 1686.60, 1691.70)]   # h5 28:06.6-28:11.7: "bumi, bumi, bumi", the Earth zoom, "rumah siapa tuh?"
hook = ('KODE DARI MIMPI LUCIA', 'TERNYATA BUKA PINTU')
subs = [('A', 2517.00, 2518.05, '3241, GUE DAPET ' + P + 'NOTE' + V),
        ('A', 2518.12, 2519.10, 'DARI MANA NOTENYA?'),
        ('A', 2519.44, 2519.95, 'WAIT A MINUTE'),
        ('A', 2520.66, 2521.45, 'DARI MANA GUE'),
        ('A', 2521.45, 2522.35, 'DAPET ' + P + 'KODE' + V + ' ITU?'),
        ('A', 2524.12, 2525.68, 'KODE YANG DI ' + P + 'ALIEN' + V),
        ('A', 2525.72, 2526.60, 'DI ' + P + 'MIMPI' + V + ', GUYS!'),
        ('B', 1502.26, 1504.70, 'DUNIA FUTURISTIK...'),
        ('B', 1504.82, 1506.20, 'HAH? ' + P + 'LUBANG' + V),
        ('C', 1614.24, 1616.10, 'JANGAN LARI, CUY'),
        ('C', 1617.14, 1617.75, 'KALAU LARI,'),
        ('C', 1617.75, 1619.15, 'DIA MARAH ' + P + 'TELURNYA' + V),
        ('D', 1686.78, 1687.90, P + 'BUMI' + V + ', BUMI, BUMI'),
        ('D', 1690.80, 1691.60, 'RUMAH SIAPA TUH?')]
freeze = 0; endcap = None
srcdesc = ("Source = .cache/wizzclip/windah-gtavi-ufo2/source.mp4 (also Drive clip-src/windah-gtavi-ufo2.mp4): four pieces of stream-2316-0014.mp4 (stream #5 hour 5, file t 0 = 23:16 WIB) "
           "in output order, 1080p30 re-encoded and joined: h5 t2515-2529, t1500-1508, t1613-1621, t1685.5-1692.5.")
beats = ("Beats: opens on the payoff (h5 41:56, 23:57 WIB): the 'Restricted area' keypad door, the phone note shows 3241, Windah: 'tiga dua empat satu, gue dapet note, dari mana gue dapet notenya? "
         "wait a minute, dari mana gue dapet kode itu? ... kode yang di alien, di mimpi, guys'; then the dream (Lucia asleep, h5 24:45-33:40) in three beats: the black portal 'lubang' (25:04), "
         "the egg hall 'jangan lari, kalau lari dia marah telurnya' (26:54), the solar-system room and Earth zoom 'bumi bumi bumi ... rumah siapa tuh?' (28:07). "
         "Word timings from short VAD runs (the hour transcripts drift by up to ~10 s). Outside the cuts: h5 41:45 'anjir', the 41:42-41:56 basement walk, the 'Uranus/meganus' line (h5 28:01), "
         "'oh s**t' at h5 27:13, Lucia in a bra top at h5 24:20-24:45 and 33:50-34:25. In the dream Lucia wears a white tee and light trousers (checked on brightened frames). "
         "Frames: basement door, dream void, eggs, planets, Earth; no guns, no gore, no drugs.")
what = "UFO arc part 2/3: the code from Lucia's dream opens a restricted-area door, then a look back at the dream (portal, eggs, Earth), payoff first."
