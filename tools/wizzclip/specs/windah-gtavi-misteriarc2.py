# Part 2/2 of the Windah GTA VI stream #8 mystery arc (yt z6sBvvg_004, 23 Nov 2026; p5 file t 0 = 23:04 WIB).
# Facecam-below layout, stream #8 cam (FACES['live8']). Cuts are in FILE seconds of windah-live8/stream-2304-2346.mp4 (p5);
# the source is the pieces joined in output order (windah_src.py). The first cut is a ~1.2 s teaser (frame 0).
yt = 'z6sBvvg_004'
layout = 'face'; face = 'live8'
# source x700-1500, y0-450: sky and pineapple above Lucia's top (her neckline starts at y~480); the cam (x>=1550) stays out
game = (700, 0, 800)
tag = 'WINDAH BASUDARA · GTA VI · PART 2 DARI 2'
# base[key] = (file second where the piece starts, its local second in source.mp4)
base = {'T': (2360.4, 0.0), 'A': (2235.75, 2.42), 'B': (2259.95, 4.79), 'C': (2262.2, 8.24), 'D': (2274.4, 12.94), 'E': (2346.45, 16.64), 'F': (2357.85, 19.19), 'G': (2369.15, 24.16), 'H1': (2378.35, 30.46), 'H2': (2380.57, 33.35)}
cuts = [('T', 2361.00, 2362.22),    # TEASER p5 39:21-39:22.22: the pineapple-shaped bus stop up close (frame 0; audio tail "berbentuk nanas ya")
        ('A', 2236.35, 2237.52),    # p5 37:16.35-37:17.55: "guys, this is it, guys" (the name that follows is left out)
        ('B', 2260.55, 2262.80),    # p5 37:40.55-37:42.8: "Kita di sini! Terima kasih kerjanya!" (thanks the ride)
        ('C', 2262.80, 2266.30),    # p5 37:42.8-37:46.3: the bus stop comes into view (silent)
        ('D', 2275.00, 2277.50),    # p5 37:55-37:57.5: exploring around the pineapple (silent)
        ('E', 2347.05, 2348.40),    # p5 39:07.05-39:08.4: "di bawah coba-coba, di bawah" (the name before it is left out)
        ('F', 2358.45, 2362.22),    # p5 39:18.45-39:22.22: "gak ada. itu cuma halte yang berbentuk nanas ya" (the name that follows is left out)
        ('G', 2369.75, 2374.85),    # p5 39:29.75-39:34.85: "aduh jam 9.55 cuy, ngapain juga naik bus?" (the "taksi instan" sentence is left out)
        ('H1', 2378.95, 2380.64),   # p5 39:38.95-39:40.64: "guys, seriusan" (then "gak ada" + the name are excised)
        ('H2', 2381.30, 2384.95)]   # p5 39:41.3-39:44.95: "cuma rumahnya doang! cuma rumahnya doang!"
hours = {k: 5 for k, s, e in cuts}
hook = ('MISTERI SEPANJANG LIVE', 'CUMA ADA RUMAH NANAS')
subs = [('A', 2236.42, 2237.50, 'GUYS, ' + P + 'THIS IS IT' + V + ', GUYS'),
        ('B', 2260.77, 2261.30, P + 'KITA DI SINI!' + V),
        ('B', 2261.51, 2262.75, 'TERIMA KASIH KERJANYA!'),
        ('E', 2347.08, 2348.35, P + 'DI BAWAH' + V + ' COBA-COBA'),
        ('F', 2358.49, 2359.10, P + 'GAK ADA' + V),
        ('F', 2359.11, 2360.80, 'ITU CUMA HALTE YANG'),
        ('F', 2360.80, 2362.15, 'BERBENTUK ' + P + 'NANAS' + V + ' YA'),
        ('G', 2369.84, 2371.50, 'ADUH, JAM ' + P + '9.55' + V + ' CUY'),
        ('G', 2373.02, 2374.85, 'NGAPAIN JUGA ' + P + 'NAIK BUS' + V + '?'),
        ('H1', 2379.01, 2380.60, 'GUYS, ' + P + 'SERIUSAN' + V),
        ('H2', 2381.34, 2383.10, P + 'CUMA RUMAHNYA DOANG!' + V),
        ('H2', 2383.13, 2384.90, 'CUMA RUMAHNYA ' + P + 'DOANG!' + V)]
labels = [('B', 2260.60, 2262.70, 'SAMPAI DI MISTERINYA')]
blurs = {9: (130, 170, 1310, 250, 0), 10: (130, 170, 1310, 250, 0)}   # the bus-stop sign with an in-game brand word (H1, H2)
freeze = 0; endcap = None
srcdesc = ("Source = .cache/wizzclip/windah-gtavi-misteriarc2/source.mp4 (also Drive clip-src/windah-gtavi-misteriarc2.mp4): ten pieces (0.6 s padding each) of "
           "windah-live8/stream-2304-2346.mp4 (p5, file t 0 = 23:04 WIB) in output order, 1080p30 re-encoded and joined.")
beats = ("Beats in stream order: frame-0 teaser (p5 39:21, the pineapple-shaped bus stop up close, 1.2 s); 'guys, this is it' (37:16); the ride drops him off 'kita di sini, terima kasih kerjanya' (37:40); "
         "the bus stop comes into view and the search (37:42-37:57); 'di bawah coba-coba' (39:07); 'gak ada, itu cuma halte yang berbentuk nanas ya' (39:18); 'jam 9.55, ngapain naik bus' (39:30); "
         "payoff 'seriusan gak ada... cuma rumahnya doang!' (39:39-39:45). Word timings from short-window faster-whisper medium with VAD. "
         "CUT: every spoken cartoon character name in 37:16-39:44 (the payoff is cut around the name: 'seriusan' + 'cuma rumahnya doang', the 'gak ada' next to the name goes too); 'anjir' at 33:48 and 30:08 (outside the cuts); "
         "the 'taksi instan' sentence (ride-app idea). The game crop (700,0,800) keeps only the upper part of the frame, so Lucia's purple top (below y480) is out of frame and her face is the only part visible.")
what = "Mystery arc part 2/2: the ride to the mystery, the search at the pineapple bus stop and the letdown: just the house."
