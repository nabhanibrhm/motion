# Part 1/4 of the chronological UFO mini-story from Windah's GTA VI stream #5 (yt lF_QYSm2T-Q, file t 0 = 21 Nov 2026 19:16:01 WIB).
# Facecam-below layout, stream #5 cam (FACES['live5']). Cuts are in HOUR-FILE seconds of each recording; the source is the pieces joined in output
# order (windah_src.py), so every cut stays in source order and no cut needs its own seeked input. The first cut is a ~1.2 s teaser (frame 0).
yt = 'lF_QYSm2T-Q'
layout = 'face'; face = 'live5'
tag = 'WINDAH BASUDARA · GTA VI · PART 1 DARI 4'
# base[key] = (hour-file second where the piece starts, its local second in source.mp4)
base = {'T': (1684.6, 0.0), 'A': (327.7, 2.4), 'B': (1032.3, 7.5), 'C': (1520.65, 12.8), 'D': (1526.92, 17.0), 'E': (1560.4, 20.8), 'F': (1613.2, 27.0), 'G': (1644.85, 34.3), 'H': (1664.4, 37.65), 'I': (1680.8, 48.85), 'J': (1715.4, 53.65)}
cuts = [('T', 1685.20, 1686.40),   # TEASER h4 28:05.2-28:06.4: the glowing disc and beam in photo mode (frame 0)
        ('A', 328.30, 332.20),     # h1 5:28.3-5:32.2: "misteri UFO di akhiran, kita misi-misi dulu lah" (chat has spammed UFO since the start)
        ('B', 1032.90, 1037.00),   # h4 17:12.9-17:17.0: "harus malem kalau UFO? yaudah, google aja deh"
        ('C', 1521.25, 1524.25),   # h4 25:21.3-25:24.3: "12 AM, ideal buat ketemu misteri UFO itu?"
        ('D', 1527.52, 1530.12),   # h4 25:27.5-25:30.1: "ideal, go now, go now"
        ('E', 1561.00, 1566.00),   # h4 26:01-26:06: night drive, traffic ("macet banget ini jalannya") + label MALAM INI
        ('F', 1613.80, 1619.90),   # h4 26:53.8-26:59.9: Lucia on the dark forest road, "ada orang di luar sana?"
        ('G', 1645.45, 1647.60),   # h4 27:25.45-27:27.6: "ke tengah hutan, ada apa ini?"
        ('H', 1665.00, 1675.00),   # h4 27:45-27:55: glow behind the trees, the beam, Lucia's silhouette, phone camera comes up (silent)
        ('I', 1681.40, 1685.00),   # h4 28:01.4-28:05: photo-mode zoom on the disc and beam
        ('J', 1716.00, 1722.05)]   # h4 28:36-28:42.05: a figure descends in the beam; Windah: "itu kenapa ada ibu-ibu gemoy?" (cut before Lucia's reaction)
hours = {'T': 4, 'A': 1, 'B': 4, 'C': 4, 'D': 4, 'E': 4, 'F': 4, 'G': 4, 'H': 4, 'I': 4, 'J': 4}
hook = ('PART 1 · UFO DI GTA VI', 'CHAT NAGIH UFO 3 JAM')
subs = [('A', 328.35, 329.90, 'YA OKE, SETUJU YA'),
        ('A', 329.93, 330.95, 'MISTERI ' + P + 'UFO' + V + ' DI AKHIRAN'),
        ('A', 330.95, 332.15, 'KITA ' + P + 'MISI-MISI' + V + ' DULU LAH'),
        ('B', 1033.09, 1034.95, 'HARUS MALEM KALAU ' + P + 'UFO' + V + '?'),
        ('B', 1035.63, 1036.95, 'YAUDAH, ' + P + 'GOOGLE' + V + ' AJA DEH'),
        ('C', 1521.35, 1522.84, '12 AM, IDEAL BUAT'),
        ('C', 1522.84, 1524.20, 'KETEMU MISTERI ' + P + 'UFO' + V + ' ITU?'),
        ('D', 1527.56, 1528.90, 'IDEAL, ' + P + 'GO NOW' + V + '!'),
        ('D', 1528.90, 1530.10, 'GO NOW, GO NOW!'),
        ('E', 1561.87, 1563.45, 'MACET BANGET INI JALANNYA'),
        ('E', 1563.45, 1565.95, 'ADA ' + P + 'PERBAIKAN JALAN' + V),
        ('F', 1613.95, 1615.11, 'ADA ORANG DI SANA?'),
        ('F', 1616.97, 1619.85, 'ADA ORANG DI ' + P + 'LUAR SANA' + V + '?'),
        ('G', 1645.45, 1646.05, 'KE TENGAH ' + P + 'HUTAN' + V + ','),
        ('G', 1646.05, 1647.50, 'ADA APA INI?'),
        ('J', 1720.30, 1721.28, 'ITU KENAPA ADA'),
        ('J', 1721.28, 1722.00, P + 'IBU-IBU GEMOY' + V + '?')]
labels = [('E', 1561.00, 1564.30, 'MALAM INI')]
freeze = 0; endcap = None
srcdesc = ("Source = .cache/wizzclip/windah-gtavi-ufoarc1/source.mp4 (also Drive clip-src/windah-gtavi-ufoarc1.mp4): eleven pieces (0.6 s padding each) of the stream #5 hour files in output order "
           "(windah-live5/stream-2216-2316.mp4 = h4, stream-1916-2016.mp4 = h1), 1080p30 re-encoded and joined.")
beats = ("Beats in stream order: frame-0 teaser (h4 28:05, the glowing disc in photo mode, 1.2 s), then the running gag (h1 5:28 'misteri UFO di akhiran, kita misi-misi dulu lah'; chat spams UFO from VOD 2:04), "
         "h4 17:13 Google says UFO only at night, h4 25:21 '12 AM, ideal buat ketemu misteri UFO' and 'go now', label MALAM INI over the night drive (h4 26:01), "
         "the dark forest road 'ada orang di luar sana?' (26:54), 'ke tengah hutan, ada apa ini?' (27:25), the glow, the beam and the phone camera (27:45-27:55), the photo-mode zoom (28:01-28:05), "
         "and the cliffhanger: a figure descends in the beam and Windah says 'itu kenapa ada ibu-ibu gemoy?' (28:36-28:42). Word timings from short-window faster-whisper medium with VAD. "
         "CUT: h4 26:20 'what the f...' and 26:41 'anjir' (outside the cuts), 27:39-27:42 'hell no', 28:08.3-28:09.4 'what the f' (swear), the in-game subtitle 'Lucia: What... the fuck?' (28:41-28:45; it sits below source y846, which the face layout crops away, and the cut ends at 28:42.05 before the voice line); "
         "27:25.4 first word is 'anjing/anjir?' by medium (cut starts after it; check by ear). No guns, gore, drugs, bra top or shirtless Jason in these frames.")
what = "UFO mini-story part 1/4: the wait, the night drive, the beam in the forest, and a figure descending in the light."
