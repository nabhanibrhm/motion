# Part 1/2 of the Windah GTA VI stream #10 portal arc (yt wJVeWiqMJ-M, 24-25 Nov 2026): the build-up, ending on a cliffhanger.
# Facecam-below layout, stream #10 cam (FACES['live10']). Cuts are in FILE seconds of the recordings (h1 = windah-live10/stream-2208-2308.mp4, h2 = stream-2308-0008.mp4, h3 = stream-0008-0108.mp4; file t 0 = 22:08 / 23:08 / 00:08 WIB); the source is the pieces joined in output order (windah_src.py).
# The first cut is a ~1.2 s teaser (frame 0): the purple lightning ring seen from afar.
yt = 'wJVeWiqMJ-M'
layout = 'face'; face = 'live10'
game = (0, 0, 1504)
tag = 'WINDAH BASUDARA · GTA VI · PART 1 DARI 2'
# base[key] = (file second where the piece starts, its local second in source.mp4)
base = {'T': (3057.4, 0.0), 'A': (2591.4, 2.4), 'B': (3106.1, 10.2), 'C': (3117.4, 17.0), 'D': (1967.4, 22.15), 'E': (1989.35, 32.95), 'F': (2017.9, 38.2), 'G': (2035.6, 48.5)}
cuts = [
        ('T', 3058.00, 3059.20),    # h3 50:58-50:59.2: the purple lightning ring from afar (frame 0, teaser)
        ('A', 2592.00, 2598.60),    # h2 43:12-43:18.6: "it is better be worth it men, sumpah, misteri tersulit ini, misteri tersulit di dunia, sumpah it is better be worth it"
        ('B', 3106.70, 3112.30),    # h2 51:46.7-51:52.3: "kalau berhasil dan membuka portal itu guys, ini menurut gue misteri tergila dan terannoying sih" (stops before the Bigfoot name)
        ('C', 3118.00, 3121.95),    # h2 51:58-52:01.95: "semoga it is better be worth it and epic" x2 (stops before the name at 52:02)
        ('D', 1968.00, 1977.60),    # h3 32:48-32:57.6: the last substation button, countdown "in 4, 5, 4, 3, 2, 1 ... yeah" (starts after youtube at 32:45)
        ('E', 1989.95, 1994.00),    # h3 33:09.95-33:14: "guys gue dapet sms guys, sumpah guys" over the phone message
        ('F', 2018.50, 2027.60),    # h3 33:38.5-33:47.6: "hah? berhasil? ... terus gimana, apa maksudnya, koordinat? U-235 ..."
        ('G', 2036.20, 2038.80),    # h3 33:56.2-33:58.8: "tunggu malam? gue udah boleh tidur berarti?" (ends well before the swear at 34:22)
        ]
hours = {'T': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0, 'F': 0, 'G': 0}
hook = ("IT'S BETTER BE WORTH IT", 'MISTERI TERSULIT DI DUNIA')
_subs = [('A', 2592.05, 2593.5, "IT'S BETTER BE <WORTH IT>"),
 ('A', 2593.64, 2595.45, 'SUMPAH, <MISTERI TERSULIT> INI'),
 ('A', 2595.5, 2597.3, '<MISTERI TERSULIT DI DUNIA>'),
 ('A', 2597.4, 2598.55, "IT'S BETTER BE <WORTH IT>"),
 ('B', 3106.8, 3108.7, 'KALAU BERHASIL <MEMBUKA PORTAL>'),
 ('B', 3108.72, 3109.5, 'ITU, GUYS'),
 ('B', 3109.55, 3110.4, 'MENURUT GUE'),
 ('B', 3110.42, 3111.2, 'MISTERI <TERGILA>'),
 ('B', 3111.25, 3112.25, 'DAN <ANNOYING>'),
 ('C', 3118.05, 3120.2, 'SEMOGA <WORTH IT> AND EPIC'),
 ('C', 3120.35, 3121.9, "<IT'S BETTER BE WORTH IT!>"),
 ('D', 1970.05, 1971.8, '4,'),
 ('D', 1971.84, 1973.2, '3,'),
 ('D', 1973.26, 1974.9, '2,'),
 ('D', 1975.0, 1976.9, '<1>'),
 ('D', 1977.0, 1977.55, '<YEAH!>'),
 ('E', 1990.2, 1991.6, 'GUYS, GUE <DAPET SMS>'),
 ('E', 1991.69, 1992.9, 'GUYS, <SUMPAH>'),
 ('E', 1992.97, 1993.95, 'GUE <DAPET SMS>'),
 ('F', 2018.7, 2020.5, 'HAH? <BERHASIL?>'),
 ('F', 2021.65, 2023.5, 'TERUS GIMANA? <APA MAKSUDNYA>?'),
 ('F', 2024.25, 2025.2, '<KOORDINAT?>'),
 ('F', 2025.4, 2027.5, '<U-235, 19:06>'),
 ('G', 2036.4, 2037.4, '<TUNGGU MALAM?>'),
 ('G', 2037.55, 2038.75, 'GUE UDAH BOLEH <TIDUR> BERARTI?')]
subs = [(k, s, e, x.replace('<', P).replace('>', V)) for k, s, e, x in _subs]
_labels = [('D', 1968.1, 1970.0, 'TOMBOL TERAKHIR'), ('F', 2018.6, 2023.4, 'PESAN MISTERIUS')]
labels = [(k, s, e, x) for k, s, e, x in _labels]
blurs = {}
freeze = 0; endcap = None
srcdesc = ('Source = .cache/wizzclip/windah-gtavi-portalarc1/source.mp4 (also Drive clip-src/windah-gtavi-portalarc1.mp4): '
           'Source = .cache/wizzclip/windah-gtavi-portalarc1/source.mp4 (also Drive clip-src/windah-gtavi-portalarc1.mp4): eight pieces (0.6 s padding each) of windah-live10/stream-2308-0008.mp4 (h2) and stream-0008-0108.mp4 (h3) in output order, 1080p30 re-encoded and joined.')
beats = ("Beats in stream order: frame-0 teaser (h3 50:58, the purple lightning ring from afar, 1.2 s); the running joke 'it's better be worth it' / 'misteri tersulit di dunia' (h2 43:12-43:19); 'kalau berhasil membuka portal... misteri tergila dan terannoying' (h2 51:46-51:52); 'semoga it's better be worth it and epic' (h2 51:58-52:02); the last substation countdown (h3 32:48-32:57); 'guys gue dapet sms' (h3 33:10-33:14); 'berhasil? ... koordinat? U-235' (h3 33:38-33:47); cliffhanger 'tunggu malam, gue udah boleh tidur berarti?' (h3 33:56-33:58). Word timings from short-window faster-whisper medium (VAD on, and off for silent stretches). Viewer names, platform and brand names are not in any cut. CUT: h2 51:36-51:47 and 51:52-51:57 (a platform name and the Bigfoot name), the swears at h3 34:22/34:35, every spoken viewer name and 'youtube' (h3 32:45 is before the first cut). The phone shows only a generic 'Unknown' thread, no app name. No guns, gore or revealing outfits in frame.")
what = "Portal arc part 1/2: the hardest mystery in the world, the last substation button, a text message with coordinates, and 'wait for night' (cliffhanger)."
