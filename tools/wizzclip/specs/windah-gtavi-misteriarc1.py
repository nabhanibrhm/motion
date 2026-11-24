# Part 1/2 of the Windah GTA VI stream #8 mystery arc (yt z6sBvvg_004, 23 Nov 2026; h4 file t 0 = 22:04 WIB, p5 file t 0 = 23:04 WIB).
# Facecam-below layout, stream #8 cam (FACES['live8']). Cuts are in FILE seconds of the recordings (h4 = windah-live8/stream-2204-2304.mp4,
# p5 = stream-2304-2346.mp4); the source is the pieces joined in output order (windah_src.py), so every cut stays in source order.
# The first cut is a ~1.2 s teaser (frame 0).
yt = 'z6sBvvg_004'
layout = 'face'; face = 'live8'
# source x656-1520, y0-486: right of the browser poll/chat window (x<650, usernames) and above the taskbar; the cam (x>=1550) stays out
game = (656, 0, 864)
tag = 'WINDAH BASUDARA · GTA VI · PART 1 DARI 2'
# base[key] = (file second where the piece starts, its local second in source.mp4)
base = {'T': (2263.1, 0.0), 'A': (1943.05, 2.4), 'B': (1955.65, 5.65), 'C': (2067.7, 12.45), 'D': (3262.85, 20.3), 'E1': (1741.4, 26.05), 'E2': (1773.0, 31.35), 'E3': (1782.6, 37.4), 'F': (1787.6, 42.0)}
cuts = [('T', 2263.70, 2264.90),    # TEASER p5 37:43.7-37:44.9: the pineapple-shaped bus stop seen from the car (silent, frame 0)
        ('A', 1943.65, 1945.70),    # h4 32:23.65-32:25.7: "Oke, satu misi lagi kita misteri, setuju gak?"
        ('B', 1956.25, 1961.85),    # h4 32:36.25-32:41.85: "Guys, satu misi lagi, abis itu gue misteri, sumpah... gitu aja ya?" (blur on the mission tooltip)
        ('C', 2068.30, 2074.95),    # h4 34:28.3-34:34.95: "misteri kode laptop... abis itu misteri setan-setanan"
        ('D', 3263.45, 3268.00),    # h4 54:23.45-54:28: "Makanya dicari dulu, bang. Eh, kalau dicari terus misinya berat, gue mati kocak, hilang semua" (starts after a van with an abbreviated swear on its door, 54:21-54:23)
        ('E1', 1742.00, 1746.10),   # p5 29:02-29:06.1: "yaudah, go voting x3, misteri apa, misteri apa voting?" (the option names after it are left out)
        ('E2', 1773.60, 1778.45),   # p5 29:33.7-29:38.45: "oke, kita hitung sama-sama: satu, dua, tiga"
        ('E3', 1783.20, 1786.60),   # p5 29:43.2-29:46.6: "delapan, sembilan, sepuluh!" (jump-count)
        ('F', 1788.20, 1791.40)]    # p5 29:48.2-29:51.4: "Ya udah gue pecahin ya. Gue Google tapi gue gak spoiler ya." (cliffhanger)
hours = {'T': 5, 'A': 4, 'B': 4, 'C': 4, 'D': 4, 'E1': 5, 'E2': 5, 'E3': 5, 'F': 5}
hook = ('SATU MISI LAGI, SUMPAH', 'HABIS ITU MISTERI')
subs = [('A', 1943.76, 1944.68, 'OKE, ' + P + 'SATU MISI LAGI' + V),
        ('A', 1944.68, 1945.65, 'KITA ' + P + 'MISTERI' + V + ', SETUJU?'),
        ('B', 1956.36, 1957.55, 'GUYS, ' + P + 'SATU MISI LAGI' + V),
        ('B', 1957.55, 1958.75, 'ABIS ITU GUE ' + P + 'MISTERI' + V),
        ('B', 1959.62, 1960.95, 'SUMPAH, ABIS ITU ' + P + 'MISTERI' + V),
        ('B', 1961.20, 1961.80, 'GITU AJA YA'),
        ('C', 2068.40, 2069.58, 'EH, MISTERI YA,'),
        ('C', 2069.62, 2070.60, 'MISTERI ' + P + 'KODE LAPTOP' + V),
        ('C', 2070.60, 2072.10, 'GIMANA GUYS, AYO PECAHKAN'),
        ('C', 2072.12, 2073.75, 'ABIS INI GUE PECAHKAN ' + P + 'KODE' + V),
        ('C', 2073.78, 2074.92, 'ABIS ITU ' + P + 'MISTERI SETAN-SETANAN' + V),
        ('D', 3263.63, 3264.65, 'MAKANYA DICARI DULU, BANG'),
        ('D', 3264.71, 3266.00, 'KALAU DICARI TERUS ' + P + 'MISINYA BERAT' + V),
        ('D', 3266.11, 3267.95, 'GUE ' + P + 'MATI KOCAK' + V + ', HILANG SEMUA'),
        ('E1', 1742.02, 1744.50, 'YAUDAH, ' + P + 'VOTING' + V + '!'),
        ('E1', 1744.56, 1746.05, P + 'MISTERI APA' + V + '? VOTING'),
        ('E2', 1773.72, 1775.06, 'OKE, KITA ' + P + 'HITUNG' + V + ' SAMA-SAMA'),
        ('E2', 1775.08, 1777.30, 'SATU, DUA,'),
        ('E2', 1777.64, 1778.40, P + 'TIGA' + V),
        ('E3', 1783.28, 1784.30, 'DELAPAN,'),
        ('E3', 1784.40, 1785.30, 'SEMBILAN,'),
        ('E3', 1785.40, 1786.55, P + 'SEPULUH!' + V),
        ('F', 1788.26, 1789.45, 'YA UDAH, GUE ' + P + 'PECAHIN' + V),
        ('F', 1789.52, 1791.35, 'GUE GOOGLE, TAPI ' + P + 'GAK SPOILER' + V)]
labels = []
# blur over the in-game mission tooltip that sits at the top edge of the game crop during cut B (index 1-based: T1 A2 B3)
blurs = {3: (520, 120, 1030, 400, 0)}
freeze = 0; endcap = None
srcdesc = ("Source = .cache/wizzclip/windah-gtavi-misteriarc1/source.mp4 (also Drive clip-src/windah-gtavi-misteriarc1.mp4): nine pieces (0.6 s padding each) of "
           "windah-live8/stream-2204-2304.mp4 (h4) and stream-2304-2346.mp4 (p5) in output order, 1080p30 re-encoded and joined.")
beats = ("Beats in stream order: frame-0 teaser (p5 37:44, the pineapple-shaped bus stop from the car, 1.2 s); the running joke 'satu misi lagi, abis itu misteri' (h4 32:24, 32:36, 34:28), "
         "'kalau dicari terus misinya berat' (54:23); chat votes on the mystery and he counts to ten (p5 29:02-29:46, jump-count); "
         "cliffhanger 'gue Google tapi gue gak spoiler' (29:48). Word timings from short-window faster-whisper medium with VAD. "
         "CUT: the vote's option names (a cartoon character, p5 29:06, 29:26) and every spoken character name; 'anjir' at p5 30:08 and 33:48 (outside the cuts); h4 34:56-35:00 'misi dulu' (a strip-club street with an 'adult entertainment' sign) and the first 2 s of 54:21 (a van marked WTF). "
         "The game crop (656,0,864) leaves out the browser poll/chat window with usernames and the Windows taskbar. No guns, gore or revealing outfits in frame.")
what = "Mystery arc part 1/2: the running joke of one more mission before the mystery, then chat votes on the mystery and Windah counts to ten."
