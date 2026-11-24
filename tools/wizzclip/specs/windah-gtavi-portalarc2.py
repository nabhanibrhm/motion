# Part 2/2 of the Windah GTA VI stream #10 portal arc (yt wJVeWiqMJ-M, 25 Nov 2026): the payoff, the portal opens. h3 file t 0 = 00:08 WIB.
# Facecam-below layout, stream #10 cam (FACES['live10']). Cuts are in FILE seconds of the recordings (h1 = windah-live10/stream-2208-2308.mp4, h2 = stream-2308-0008.mp4, h3 = stream-0008-0108.mp4; file t 0 = 22:08 / 23:08 / 00:08 WIB); the source is the pieces joined in output order (windah_src.py).
# Frame 0 = the portal ring (teaser, cut T).
yt = 'wJVeWiqMJ-M'
layout = 'face'; face = 'live10'
game = (0, 0, 1504)
tag = 'WINDAH BASUDARA · GTA VI · PART 2 DARI 2'
# base[key] = (file second where the piece starts, its local second in source.mp4)
base = {'T': (3084.4, 0.0), 'A': (3059.9, 2.4), 'B': (3099.35, 7.9), 'C': (3104.4, 13.35), 'D': (3110.3, 17.35), 'E': (3132.4, 21.6), 'F': (3163.4, 26.7), 'G': (3463.6, 36.3)}
cuts = [
        ('T', 3085.00, 3086.20),    # h3 51:25-51:26.2: the ring crackling up close (frame 0, teaser)
        ('A', 3060.50, 3064.80),    # h3 51:00.5-51:04.8: he walks toward the ring (silent)
        ('B', 3099.95, 3104.20),    # h3 51:39.95-51:44.2: "we did it bro / oh my god guys"
        ('C', 3105.00, 3107.80),    # h3 51:45-51:47.8: "i was here, i was here" (chat-style line)
        ('D', 3110.90, 3113.95),    # h3 51:50.9-51:53.95: "portal itu nyata, portal itu nyata"
        ('E', 3133.00, 3136.90),    # h3 52:13-52:16.9: photo mode, "portal itu nyata, portal mengerikan itu nyata"
        ('F', 3164.00, 3172.40),    # h3 52:44-52:52.4: selfie poses, then he walks in: "masuk, masuk, masuk!"
        ('G', 3464.20, 3467.60),    # h3 57:44.2-57:47.6: "oh, order minum doang guys" (the club letdown)
        ]
hours = {'T': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0, 'F': 0, 'G': 0}
hook = ('PORTAL ITU NYATA', 'AKHIRNYA TERBUKA')
_subs = [('B', 3100.0, 3101.4, '<WE DID IT>, BRO'),
 ('B', 3101.98, 3104.15, 'OH MY GOD, <GUYS>'),
 ('C', 3105.28, 3107.7, '<"I WAS HERE">'),
 ('D', 3111.3, 3112.4, '<PORTAL ITU NYATA>'),
 ('D', 3112.5, 3113.9, '<PORTAL ITU NYATA!>'),
 ('E', 3133.1, 3134.45, '<PORTAL ITU NYATA>'),
 ('E', 3134.5, 3136.75, 'PORTAL <MENGERIKAN> ITU NYATA'),
 ('F', 3169.65, 3171.6, '<MASUK, MASUK, MASUK!>'),
 ('G', 3464.45, 3466.05, 'OH, ORDER <MINUM DOANG>'),
 ('G', 3466.1, 3467.5, 'GUYS')]
subs = [(k, s, e, x.replace('<', P).replace('>', V)) for k, s, e, x in _subs]
_labels = [('A', 3060.6, 3064.7, 'PORTAL TERBUKA'), ('G', 3464.3, 3467.5, 'DI BALIK PORTAL: CLUB')]
labels = [(k, s, e, x) for k, s, e, x in _labels]
blurs = {}
freeze = 0; endcap = None
srcdesc = ('Source = .cache/wizzclip/windah-gtavi-portalarc2/source.mp4 (also Drive clip-src/windah-gtavi-portalarc2.mp4): '
           'Source = .cache/wizzclip/windah-gtavi-portalarc2/source.mp4 (also Drive clip-src/windah-gtavi-portalarc2.mp4): eight pieces (0.6 s padding each) of windah-live10/stream-0008-0108.mp4 (h3, file t 0 = 00:08 WIB) in output order, 1080p30 re-encoded and joined.')
beats = ("Beats in stream order: frame-0 teaser (h3 51:25, the ring crackling up close, 1.2 s); he walks up to the ring (h3 51:00-51:05, silent); 'we did it bro, oh my god guys' (51:40-51:44); 'I was here' x5 (51:45-51:48); 'portal itu nyata, portal itu nyata' (51:51-51:54); photo mode in front of the ring 'portal itu nyata, portal mengerikan itu nyata' (52:13-52:17); selfie poses and he walks in 'masuk, masuk, masuk!' (52:44-53:12); the letdown behind it: the club, 'oh, order minum doang guys' (57:44-57:47). Word timings from short-window faster-whisper medium (VAD on, and off for silent stretches). Viewer names, platform and brand names are not in any cut. CUT: the 4-star chase and the arrest (h3 39:40-50:50, armed guards), the club's dance floor and the screen-share with a platform name at 57:38-58:20 (this cut is the game window only, 57:44-57:47), 'what the f' at 53:48. The permanent chopper bike (piece 4) is left out to keep the arc short. Music: the club may play licensed-sounding tracks; the cut is 3.4 s, check by ear. No guns, gore or revealing outfits in frame (the club cut shows one NPC from behind in a pink top).")
what = "Portal arc part 2/2: the portal opens, 'portal itu nyata!', photo mode, he walks in, and behind it is only a bar: 'oh, order minum doang guys'."
