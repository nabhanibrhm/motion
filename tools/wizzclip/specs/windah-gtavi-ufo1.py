# Part 1/3 of the UFO arc from Windah's GTA VI stream #5 (yt lF_QYSm2T-Q, file t 0 = 21 Nov 2026 19:16:01 WIB).
# Facecam-below layout, stream #5 cam (FACES['live5']). Cuts are in HOUR-FILE seconds of each recording; the source is the five pieces
# joined in output order (windah_src.py), so every cut stays in source order and no cut needs its own seeked input.
yt = 'lF_QYSm2T-Q'
layout = 'face'; face = 'live5'
# base[key] = (hour-file second where the piece starts, its local second in source.mp4)
base = {'A': (1667.0, 0.0), 'B': (326.0, 9.0), 'C': (1031.0, 17.0), 'D': (1520.0, 25.0), 'E': (1679.5, 31.0)}
cuts = [('A', 1667.90, 1674.40),   # h4 27:47.9-27:54.4: glow, the beam, phone camera comes up, photo mode opens
        ('B', 328.30, 332.20),     # h1 5:28.3-5:32.2: "misteri UFO di akhiran, kita misi-misi dulu lah"
        ('C', 1032.90, 1037.00),   # h4 17:12.9-17:17.0: "harus malem kalau UFO? yaudah, google aja deh"
        ('D', 1521.25, 1524.50),   # h4 25:21.3-25:24.5: "12 AM, ideal buat ketemu misteri UFO itu?"
        ('E', 1681.00, 1687.60)]   # h4 28:01.0-28:07.6: photo-mode zoom on the disc, a figure in the beam
hook = ('AKHIRNYA UFO MUNCUL', 'SETELAH MISI-MISI DULU')
subs = [('B', 328.35, 329.90, 'YA OKE, SETUJU YA'),
        ('B', 329.93, 330.95, 'MISTERI ' + P + 'UFO' + V + ' DI AKHIRAN'),
        ('B', 330.95, 332.15, 'KITA ' + P + 'MISI-MISI' + V + ' DULU LAH'),
        ('C', 1033.09, 1034.95, 'HARUS MALEM KALAU ' + P + 'UFO' + V + '?'),
        ('C', 1035.63, 1036.95, 'YAUDAH, ' + P + 'GOOGLE' + V + ' AJA DEH'),
        ('D', 1521.35, 1522.84, '12 AM, IDEAL BUAT'),
        ('D', 1522.84, 1524.45, 'KETEMU MISTERI ' + P + 'UFO' + V + ' ITU?')]
freeze = 0; endcap = None
srcdesc = ("Source = .cache/wizzclip/windah-gtavi-ufo1/source.mp4 (also Drive clip-src/windah-gtavi-ufo1.mp4): five pieces of the stream #5 hour files in output order "
           "(windah-live5/stream-2216-2316.mp4 = h4 t1667-1676, stream-1916-2016.mp4 = h1 t326-334, h4 t1031-1039, h4 t1520-1526, h4 t1679.5-1688), 1080p30 re-encoded and joined.")
beats = ("Beats: opens on the payoff (22:43 WIB, h4 27:48): glow behind the trees, the beam, Windah's in-game phone camera, photo mode; "
         "then the running gag in three short rewinds: h1 5:28 'misteri UFO di akhiran, kita misi-misi dulu lah' (chat spammed UFO from the start), h4 17:13 'harus malem kalau UFO? yaudah google aja deh', "
         "h4 25:21 '12 AM, ideal buat ketemu misteri UFO itu?'; back to the UFO with the photo-mode zoom on the disc and a figure in the beam (h4 28:01-28:07.6). "
         "Windah says nothing in the beam shots (short VAD runs of faster-whisper medium found no speech in h4 27:44-28:08); the hour transcripts' 'Aduh, apaan ini?' lines are not there, so no caption is claimed for them. "
         "CUT: h4 28:08.3-28:09.4 'Hey, what the f...' (swear, found by VAD at 1688.3-1689.4); the 26:20 swear and the 28:40 in-game subtitle swear are outside the cuts; "
         "Lucia's bra top and shirtless Jason (h4 24:00-24:50, 31:50+) are not used. Frames: forest, silhouette, phone, photo mode, two maps, Lucia running with a box; no guns, no gore, no drugs.")
what = "UFO arc part 1/3: the UFO beam appears in the forest after hours of 'misi dulu' (running gag), payoff first."
