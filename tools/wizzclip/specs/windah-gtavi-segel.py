# "Segelnya Windah kebuka": Windah swears (raw, uncensored by the user's decision) while racing, stream #6 (yt u_Lb6sh9N0M, 22 Nov 2026).
# Facecam-below layout, stream #6 cam (FACES['live6']). Cuts are in HOUR-FILE seconds; the source is the pieces joined in output order (windah_src.py).
# Hour files: h1 = windah-live6/stream-1315-1415.mp4, hA = stream-1415-1515.mp4, hB = stream-1452-1515.mp4.
yt = 'u_Lb6sh9N0M'
layout = 'face'; face = 'live6'
# base[key] = (hour-file second where the piece starts, its local second in source.mp4); each piece = cut +-0.6 s
base = {'T': (403.6, 0.0), 'K1': (2582.8, 2.7), 'K2': (2785.0, 6.5), 'K3': (579.6, 10.5), 'K4': (1499.8, 14.6), 'K5': (403.4, 23.7), 'K6': (430.9, 29.2)}
cuts = [('T', 404.20, 405.70),      # TEASER hB 6:44.2-6:45.7: "ganjelan memek" (frame 0; the same line plays in full in K5)
        ('K1', 2583.40, 2586.00),   # h1 43:03.4-43:06: "anjir, laju banget itu orang" (a truck passes the rider)
        ('K2', 2785.60, 2788.40),   # h1 46:25.6-46:28.4: a truck jumps over him, "diinjak gua anjing"
        ('K3', 580.20, 583.10),     # hA 9:40.2-9:43.1: crash at the 87 car, "anjing, eh ulang"
        ('K4', 1500.40, 1508.30),   # hA 25:00.4-25:08.3: night race, bots ram him from behind: "ngentot... ngentot gaming, anjing, NPC-NPC ini anjing"
        ('K5', 404.00, 408.30),     # hB 6:44-6:48.3: hits the wall, drops to 9 of 16: "ganjelan memek, emang itu jam tangan rolek memek?"
        ('K6', 431.50, 434.45)]     # hB 7:11.5-7:14.45: pile-up, 13 to 16 of 16: "rolek anjing, logo rolek, babi emg"
hours = {'T': 2, 'K1': 1, 'K2': 1, 'K3': 2, 'K4': 2, 'K5': 2, 'K6': 2}
hook = ('SEGELNYA WINDAH', 'KEBUKA')
subs = [('T', 404.25, 405.68, 'GANJELAN ' + P + 'MEMEK' + V),
        ('K1', 2583.70, 2585.95, P + 'ANJIR' + V + ', LAJU BANGET ITU ORANG'),
        ('K2', 2786.38, 2788.00, 'DIINJAK GUA ' + P + 'ANJING' + V),
        ('K3', 581.88, 582.50, P + 'ANJING' + V + ','),
        ('K3', 582.50, 583.08, 'EH, ULANG!'),
        ('K4', 1500.45, 1501.26, 'TABRAK DARI BELAKANG TUH'),
        ('K4', 1501.26, 1502.20, 'EMANG ' + P + 'NGENTOT' + V),
        ('K4', 1502.98, 1504.00, P + 'NGENTOT' + V + ' GAMING'),
        ('K4', 1504.04, 1505.00, P + 'ANJING' + V + ', TEORI TABRAK'),
        ('K4', 1505.00, 1506.50, 'DARI BELAKANG, NPC-NPC INI'),
        ('K4', 1506.54, 1508.00, P + 'ANJING' + V),
        ('K5', 404.30, 405.80, 'GANJELAN ' + P + 'MEMEK' + V),
        ('K5', 405.80, 406.78, 'EMANG ITU JAM TANGAN'),
        ('K5', 406.80, 408.25, 'ROLEK ' + P + 'MEMEK' + V + '?'),
        ('K6', 431.85, 433.50, 'ROLEK ' + P + 'ANJING' + V + ', LOGO ROLEK'),
        ('K6', 433.55, 434.42, P + 'BABI' + V + ' EMANG')]
freeze = 0; endcap = None
srcdesc = ("Source = .cache/wizzclip/windah-gtavi-segel/source.mp4 (also Drive clip-src/windah-gtavi-segel.mp4): seven pieces (0.6 s padding each) of the stream #6 hour files in output order "
           "(windah-live6/stream-1315-1415.mp4 = h1, stream-1415-1515.mp4 = hA, stream-1452-1515.mp4 = hB), 1080p30 re-encoded and joined.")
beats = ("Rage compilation, swears RAW in audio and subtitles (user's explicit decision, 22 Nov 2026; breaks the MotionKlip no-swears rule, every other rule kept). Frame-0 teaser = hB 6:44 'ganjelan memek' (1.5 s), then stream order: "
         "h1 43:03 'anjir, laju banget itu orang', h1 46:26 'diinjak gua anjing' (truck jumps over his bike), hA 9:41 'anjing, eh ulang' after a crash, hA 25:00 'ngentot... ngentot gaming, anjing, NPC-NPC ini anjing' (bots ramming him at night), "
         "hB 6:44 'ganjelan memek, emang itu jam tangan rolek memek?' (wall hit, 4th to 9th of 16), hB 7:11 'rolek anjing, logo rolek, babi emg' (pile-up). Word timings from faster-whisper medium with VAD on short windows. "
         "CUT: in-game Lucia 'Huh, I always wondered what it was like to suck at this' (hB 7:15, also below the game crop) and Jason's 'fuck you too, sweetie' (hB 7:18.9), hB 7:01.1 'gimak anjing' (over the start grid), hA 25:11 repeat. "
         "'rolek' is a watch brand named in passing by Windah (no platform). Pause menus in K3 show only 'Restart Race / Quit Race'. No guns, gore, bikini, gambling or self-promo in these frames.")
what = "Windah Basudara's clean-streamer seal breaks: six racing meltdowns with raw swearing in GTA VI."
