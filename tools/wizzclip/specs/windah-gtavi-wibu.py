# Windah GTA VI stream #12 (yt WnVFoAGVftc, 26 Nov 2026): Jason's car was just painted plain white, then Yago secretly wraps it in an anime livery - 'Yago wibu, kocak!'.
# Facecam-below layout, stream #12 cam (FACES['live12']). Cuts are in FILE seconds of windah-live12/stream-1904-2004.mp4 (file t 0 = 19:04 WIB); the source is the pieces joined in output order (windah_src.py, 0.6 s padding each).
# Frame 0 = teaser (cut T): the finished anime-wrapped car outside the shop (h1 19:36.2).
yt = 'WnVFoAGVftc'
layout = 'face'; face = 'live12'
game = (0, 64, 1488)
# base[key] = (file second where the piece starts, its local second in source.mp4)
base = {'T': (1175.6, 0.0), 'A': (1125.0, 2.4), 'B': (1148.9, 6.0), 'C': (1159.2, 14.3), 'D': (1180.0, 31.3), 'E': (1193.45, 34.9)}
cuts = [
        ('T', 1176.20, 1177.40),    # h1 19:36.2: the wrapped car outside the shop (frame 0, teaser, no speech from Windah)
        ('B', 1149.50, 1156.60),    # h1 19:09.5: Yago 'missing one little thing' / 'ada satu hal yang belum ada ... apa yang belum ada?'
        ('C', 1159.80, 1162.45),    # h1 19:19.8: the reveal, Windah's shocked face (ends before 'mampus' at 1162.56)
        ('C', 1163.15, 1166.40),    # h1 19:23.15: 'bocil ganti-ganti desain, desainnya suka-suka Yago, kocak' (ends before the 2nd 'mampus' at 1166.50)
        ('C', 1168.75, 1175.60),    # h1 19:28.75: 'Yago wibu kocak ... mana nih bocil desain livery ... suka-suka Yago'
        ('D', 1180.60, 1183.00),    # h1 19:40.6: 'gila, Yago wibu rupanya' (ends before the hood close-up at ~1183.2)
        ('E', 1194.05, 1197.40),    # h1 19:54: driving off, 'pasti nggak ada gunanya gue cat putih tadi, biar lebih masuk warnanya ya'
        ]
hours = {'T': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0}
hook = ('MOBIL GUE DIUBAH', 'JADI MOBIL WIBU')
_subs = [
 ('B', 1150.3, 1152.5, 'SATU HAL <BELUM ADA>'),
 ('B', 1153.1, 1155.5, 'APA YANG <BELUM ADA>?'),
 ('C', 1163.2, 1164.65, 'BOCIL <GANTI-GANTI DESAIN>'),
 ('C', 1164.7, 1166.35, 'SUKA-SUKA YAGO, <KOCAK>'),
 ('C', 1168.8, 1171.2, 'YAGO <WIBU>, KOCAK'),
 ('C', 1171.24, 1173.1, 'MANA NIH BOCIL, DESAIN <LIVERY>?'),
 ('C', 1174.2, 1175.55, '<SUKA-SUKA> YAGO'),
 ('D', 1180.76, 1182.95, 'GILA, YAGO <WIBU> RUPANYA'),
 ('E', 1194.08, 1195.55, 'PERCUMA GUE <CAT PUTIH>'),
 ('E', 1195.6, 1197.3, 'BIAR LEBIH <MASUK> WARNANYA')]
subs = [(k, s, e, x.replace('<', P).replace('>', V)) for k, s, e, x in _subs]
labels = [('B', 1150.6, 1153.0, 'BARU DICAT PUTIH'), ('C', 1159.9, 1162.4, 'DIKERJAIN YAGO')]
blurs = {}
freeze = 0; endcap = None
srcdesc = ('Source = .cache/wizzclip/windah-gtavi-wibu/source.mp4 (also Drive clip-src/windah-gtavi-wibu.mp4): '
           '6 pieces (0.6 s padding each; piece A, the mod shop at h1 18:45, is unused: the facecam moves into the mod-shop menu there) of windah-live12/stream-1904-2004.mp4 (h1) in output order, 1080p30 re-encoded and joined.')
beats = ("Beats in stream order: frame-0 teaser (h1 19:36, the wrapped car); Yago 'missing one little thing' over the plain white car, 'apa yang belum ada?' (h1 19:09); the reveal and 'bocil ganti-ganti desain ... Yago wibu, kocak' (h1 19:19-19:35); 'gila, Yago wibu rupanya' (h1 19:40); driving off, 'gak ada gunanya gue cat putih tadi' (h1 19:54). Word timings from faster-whisper medium on a short window. "
         "CUT: both 'mampus' (h1 19:22.6, 19:26.5) and the hood close-up from ~19:43 (the anime girl on the hood shows cleavage); the wide side shots keep the livery small. Shop and livery logos are the game's own fictional brands. No guns, gore or revealing outfits in frame.")
what = "Jason's freshly painted white car gets secretly wrapped in an anime livery by Yago: 'Yago wibu, kocak!'"
