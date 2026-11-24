# NSFW EXTRA (user-approved): Windah GTA VI stream #10 (yt wJVeWiqMJ-M, 25 Nov 2026; h3 file t 0 = 00:08 WIB): raw rage while searching for the portal, ending on the portal reveal.
# Facecam-below layout, stream #10 cam (FACES['live10']). Cuts are in FILE seconds of the recordings (h1 = windah-live10/stream-2208-2308.mp4, h2 = stream-2308-0008.mp4, h3 = stream-0008-0108.mp4; file t 0 = 22:08 / 23:08 / 00:08 WIB); the source is the pieces joined in output order (windah_src.py).
# Frame 0 = the portal ring (teaser, cut T); then the rage in stream order.
yt = 'wJVeWiqMJ-M'
layout = 'face'; face = 'live10'
game = (0, 0, 1504)
tag = 'WINDAH BASUDARA · GTA VI · NSFW'
# base[key] = (file second where the piece starts, its local second in source.mp4)
base = {'T': (3084.4, 0.0), 'A': (2762.7, 2.4), 'B': (2774.7, 7.3), 'C': (2959.3, 11.2), 'D': (2971.85, 20.7), 'E': (3059.9, 22.95), 'F': (3099.35, 28.15), 'G': (3110.3, 33.6), 'H': (3132.4, 37.85)}
cuts = [
        ('T', 3085.00, 3086.20),    # h3 51:25-51:26.2: the ring crackling up close (frame 0, teaser)
        ('A', 2763.30, 2767.00),    # h3 46:03.3-46:07: "(mana si portalnya bro?) anjing, gua ga ada armor lagi" over the inventory screen (blurred)
        ('B', 2775.30, 2778.00),    # h3 46:15.3-46:18: running with a pistol (blurred), "portal-portalan tai"
        ('C', 2959.90, 2968.20),    # h3 49:19.9-49:28.2: map screen, "bocil ini pagi nih anjing, sesat banget ... reaktor 2, reaktor 1 nih"
        ('D', 2972.45, 2973.50),    # h3 49:32.45-49:33.5: "idiot, anjir" (stairs, before the arrest line)
        ('E', 3060.50, 3064.50),    # h3 51:00.5-51:04.5: walks toward the ring (silent)
        ('F', 3099.95, 3104.20),    # h3 51:39.95-51:44.2: "we did it bro / oh my god guys"
        ('G', 3110.90, 3113.95),    # h3 51:50.9-51:53.95: "portal itu nyata"
        ('H', 3133.00, 3136.90),    # h3 52:13-52:16.9: photo mode, "portal mengerikan itu nyata"
        ]
hours = {'T': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0, 'F': 0, 'G': 0, 'H': 0}
hook = ('PORTAL-PORTALAN?!', '...ADA, NYATA')
_subs = [('A', 2764.5, 2766.45, '<ANJING>, GUA GA ADA <ARMOR> LAGI'),
 ('B', 2775.5, 2777.05, '<PORTAL-PORTALAN>'),
 ('B', 2777.15, 2778.0, '<TAI>'),
 ('C', 2960.0, 2961.7, 'BOCIL INI PAGI NIH <ANJING>'),
 ('C', 2961.74, 2964.0, 'BOCIL INI PAGI SIH <SESAT BANGET>'),
 ('C', 2965.74, 2967.0, '<REAKTOR 2>, REAKTOR 2'),
 ('C', 2967.05, 2968.15, 'INI GUA <REAKTOR 1> NIH'),
 ('D', 2972.6, 2973.45, '<IDIOT>, ANJIR'),
 ('F', 3100.0, 3101.4, '<WE DID IT>, BRO'),
 ('F', 3101.98, 3104.15, 'OH MY GOD, <GUYS>'),
 ('G', 3111.3, 3112.4, '<PORTAL ITU NYATA>'),
 ('G', 3112.5, 3113.9, '<PORTAL ITU NYATA!>'),
 ('H', 3133.1, 3134.45, '<PORTAL ITU NYATA>'),
 ('H', 3134.5, 3136.75, 'PORTAL <MENGERIKAN> ITU NYATA')]
subs = [(k, s, e, x.replace('<', P).replace('>', V)) for k, s, e, x in _subs]
_labels = []
labels = [(k, s, e, x) for k, s, e, x in _labels]
blurs = {2: (730, 760, 620, 40, 0), 3: (440, 330, 620, 700, 0)}
freeze = 0; endcap = None
srcdesc = ('Source = .cache/wizzclip/windah-gtavi-portalan/source.mp4 (also Drive clip-src/windah-gtavi-portalan.mp4): '
           'Source = .cache/wizzclip/windah-gtavi-portalan/source.mp4 (also Drive clip-src/windah-gtavi-portalan.mp4): nine pieces (0.6 s padding each) of windah-live10/stream-0008-0108.mp4 (h3, file t 0 = 00:08 WIB) in output order, 1080p30 re-encoded and joined.')
beats = ("NSFW EXTRA (raw swearing, police chase, user-approved): frame-0 teaser (h3 51:25, the portal ring, 1.2 s); the rage in stream order: 'anjing, gua ga ada armor lagi' (h3 46:04-46:07, the inventory screen) and 'portal-portalan tai' (46:15-46:18); 'bocil ini pagi nih anjing, sesat banget ... reaktor 2, reaktor 1 nih' over the map (49:19-49:28) and 'idiot, anjir' (49:32); then the reveal: he walks up to the ring (51:00-51:04), 'we did it bro, oh my god guys' (51:40-51:44), 'portal itu nyata' (51:51-51:54) and photo mode 'portal mengerikan itu nyata' (52:13-52:17). The raw swears are kept raw (like the posted 'segel'); the on-screen subtitles spell them out too, and the caption censors them. Word timings from faster-whisper medium; 'mana si portalnya bro' at ~46:03 was NOT picked up by the transcript, so the first 1 s of cut 2 has no subtitle: check by ear. BLURRED: cut 2 (the inventory menu with weapon icons: box source x620-1350, y40-800); cut 3 (the pistol he holds at the hip while running: box x620-1060, y700-1030, covers the lower body). CUT: the arrest at h3 49:34-49:45 ('jangan bergerak, hands behind your back'; the cut ends at 49:33.5), the weapon wheel at 46:00-46:03, the armed guards (42:36-43:33) and every spoken viewer name.")
what = "NSFW extra: Windah rages while hunting the portal ('portal-portalan, tai'), then the portal opens: 'portal itu nyata'."
