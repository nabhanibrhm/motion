# Part 2/4 of the chronological UFO mini-story from Windah's GTA VI stream #5 (yt lF_QYSm2T-Q, file t 0 = 21 Nov 2026 19:16:01 WIB).
# Facecam-below layout, stream #5 cam (FACES['live5']). Cuts are in HOUR-FILE seconds (h4 = stream-2216-2316.mp4, h5 = stream-2316-0014.mp4);
# the source is the pieces joined in output order (windah_src.py). The first cut is a ~1.2 s teaser (frame 0).
yt = 'lF_QYSm2T-Q'
layout = 'face'; face = 'live5'
tag = 'WINDAH BASUDARA · GTA VI · PART 2 DARI 4'
base = {'T': (1509.4, 0.0), 'A': (1726.8, 2.4), 'B': (1746.3, 7.6), 'C': (1765.7, 13.2), 'D': (1794.9, 20.1), 'E': (1889.4, 23.7), 'F': (1894.85, 27.5), 'G': (2324.3, 30.5), 'H': (1444.85, 34.8), 'I': (1455.25, 42.65), 'J': (1500.1, 47.05)}
cuts = [('T', 1510.00, 1511.20),   # TEASER h5 25:10-25:11.2: the black oval portal in the white void, Lucia in front (frame 0)
        ('A', 1727.40, 1731.40),   # h4 28:47.4-28:51.4: Lucia runs through the dark forest toward the beam; the HELP prompt appears (wide, dark shot)
        ('B', 1746.90, 1751.30),   # h4 29:06.9-29:11.3: the dazed woman on the ground, "oh Tuhan... kau tak apa-apa? kau ingat apa-apa?" (in-game voices)
        ('C', 1766.30, 1772.00),   # h4 29:26.3-29:32: "bring me my car" / "ya, oke" / "tunggu disini, oke?"
        ('D', 1795.50, 1797.90),   # h4 29:55.5-29:57.9: Windah: "bisa nggak gue deketin UFO-nya pas?"
        ('E', 1890.00, 1892.60),   # h4 31:30-31:32.6: "lah, ada lanjutan questnya: spam tidur?"
        ('F', 1895.45, 1897.25),   # h4 31:35.5-31:37.3: "yaudah, coba gue spam tidur ya"
        ('G', 2324.90, 2328.00),   # h4 38:44.9-38:48: after eight sleeps with nothing: "kita kombo sama aktivitas nih" + label SPAM TIDUR, GAK ADA MIMPI
        ('H', 1445.45, 1452.10),   # h5 24:05.5-24:12.1: motel, "gue ajak tidur Jason, apakah teori mimpi itu nyata? teori UFO?"
        ('I', 1455.85, 1459.05),   # h5 24:15.9-24:19: "karena kita akan tidur dalam keadaan Jason udah sembuh"
        ('J', 1500.70, 1506.30)]   # h5 25:00.7-25:06.3: the dream: white void, "dunia futuristik... hah? lubang" and the portal opens
hours = {'T': 5, 'A': 4, 'B': 4, 'C': 4, 'D': 4, 'E': 4, 'F': 4, 'G': 4, 'H': 5, 'I': 5, 'J': 5}
hook = ('PART 2 · MIMPI ALIEN', 'LUCIA MASUK LUBANG HITAM')
subs = [('B', 1747.38, 1748.66, 'OH, ' + P + 'TUHAN' + V + '...'),
        ('B', 1748.70, 1749.95, 'KAMU GAK APA-APA?'),
        ('B', 1750.02, 1751.00, 'KAMU ' + P + 'INGAT' + V + ' SESUATU?'),
        ('C', 1767.08, 1768.10, 'AMBILIN ' + P + 'MOBILKU' + V),
        ('C', 1768.26, 1769.55, 'YA, OKE'),
        ('C', 1770.12, 1771.65, 'TUNGGU DI SINI, OKE?'),
        ('D', 1795.61, 1797.85, 'DEKETIN ' + P + 'UFO' + V + '-NYA?'),
        ('E', 1890.09, 1891.05, 'LAH, ADA LANJUTAN'),
        ('E', 1891.05, 1892.55, P + 'SPAM TIDUR' + V + '?'),
        ('F', 1895.53, 1896.20, 'YAUDAH, COBA'),
        ('F', 1896.20, 1897.20, P + 'SPAM TIDUR' + V + ' YA'),
        ('G', 2325.06, 2326.38, 'KITA KOMBO SAMA ' + P + 'AKTIVITAS' + V),
        ('G', 2326.72, 2327.95, 'JAWAB PENASARAN KALIAN'),
        ('H', 1445.47, 1448.20, 'GUE AJAK TIDUR ' + P + 'JASON' + V + ','),
        ('H', 1448.31, 1449.60, P + 'TEORI MIMPI' + V + ' ITU NYATA?'),
        ('H', 1451.56, 1452.08, P + 'TEORI UFO?' + V),
        ('I', 1455.88, 1457.55, 'KITA TIDUR DALAM KEADAAN'),
        ('I', 1457.58, 1459.00, P + 'JASON UDAH SEMBUH' + V),
        ('J', 1502.26, 1504.70, 'DUNIA FUTURISTIK...'),
        ('J', 1504.82, 1506.20, 'HAH? ' + P + 'LUBANG' + V)]
labels = [('G', 2324.90, 2327.30, 'SPAM TIDUR, GAK ADA MIMPI')]
freeze = 0; endcap = None
srcdesc = ("Source = .cache/wizzclip/windah-gtavi-ufoarc2/source.mp4 (also Drive clip-src/windah-gtavi-ufoarc2.mp4): eleven pieces (0.6 s padding each) of the stream #5 hour files in output order "
           "(windah-live5/stream-2216-2316.mp4 = h4, stream-2316-0014.mp4 = h5), 1080p30 re-encoded and joined.")
beats = ("Beats in stream order: frame-0 teaser (h5 25:10, the black portal in the white dream void, 1.2 s); the woman from the beam (h4 28:46-29:32): Lucia runs through the dark forest, presses HELP on the dazed woman, "
         "'kau tak apa-apa? kau ingat apa-apa?', she asks Lucia to bring her car ('ya, oke, tunggu disini'); Windah tries to reach the UFO (29:55 'bisa gue deketin UFO-nya pas?'); "
         "he finds a sleep-skip lead (31:30 'ada lanjutan questnya: spam tidur?', 31:35 'coba gue spam tidur ya'); label SPAM TIDUR, GAK ADA MIMPI over the gym (38:45, after eight sleeps nothing happened: 'kita kombo sama aktivitas'); "
         "h5 24:05 'gue ajak tidur Jason, apakah teori mimpi itu nyata? teori UFO?' and 24:16 'karena kita akan tidur dalam keadaan Jason udah sembuh'; the dream begins: white void, 'dunia futuristik... hah? lubang' (25:01) and the portal opens (25:05). "
         "Word timings from short-window faster-whisper medium with VAD (in-game voices lines 'oh Tuhan', 'ya oke' etc. are captioned as heard, in Indonesian). "
         "CUT: h4 28:57.5-29:04 (Lucia's 'Oh... the fuck?', whisper 'Sial!' at 29:02.3-29:03), the in-game subtitle 'Lucia: What... the fuck?' at 28:41-28:45 (clip starts 28:45.7), h4 29:14-29:22 (woman close-ups and Lucia's cleavage at ~29:20), "
         "the sleep scenes with Lucia in a bra top and shirtless Jason (h4 31:50-37:50, 41:00-41:50, h5 24:20-24:45), the bench-press shots at 38:10-38:40, the dream's 'Where the hell is this?' subtitle (h5 24:48-24:55). "
         "Woman scene: only the dark wide shots of her. No guns, gore, drugs in these frames.")
what = "UFO mini-story part 2/4: Lucia helps the woman from the beam, the sleep spam does nothing, Jason is healed and the dream begins."
