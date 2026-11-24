# Windah GTA VI stream #10 (yt wJVeWiqMJ-M, 24 Nov 2026; h1 file t 0 = 22:08 WIB): the running joke 'belum ada email gue nih' -> 'Email masuk!'.
# Facecam-below layout, stream #10 cam (FACES['live10']). Cuts are in FILE seconds of the recordings (h1 = windah-live10/stream-2208-2308.mp4, h2 = stream-2308-0008.mp4, h3 = stream-0008-0108.mp4; file t 0 = 22:08 / 23:08 / 00:08 WIB); the source is the pieces joined in output order (windah_src.py).
yt = 'wJVeWiqMJ-M'
layout = 'face'; face = 'live10'
game = (176, 0, 1328)
tag = 'WINDAH BASUDARA · GTA VI'
# base[key] = (file second where the piece starts, its local second in source.mp4)
base = {'A': (152.0, 0.0), 'B': (163.55, 4.3), 'C': (235.4, 7.05), 'D': (1576.9, 12.25)}
cuts = [
        ('A', 152.60, 155.70),    # h1 2:32.6-2:35.7: "belum ada yang email gue nih" x2 (the cut stops before the next sentence)
        ('B', 164.15, 165.70),    # h1 2:44.15-2:45.7: "sebentar, belum ada yang email gue nih"
        ('C', 236.00, 240.00),    # h1 3:56-4:00: "letaknya dimana, kalian ngasih tau dong, misteri portal" (gameplay only; the phone close-ups before it are skipped)
        ('D', 1577.50, 1589.45),    # h1 26:17.5-26:29.45: "email masuk! ... oh my god guys, thank you ... email masuk, pas banget bro" (shop-sign blur on cut 4; starts after the browser-window overlay)
        ]
hours = {'A': 0, 'B': 0, 'C': 0, 'D': 0}
hook = ('BELUM ADA EMAIL GUE NIH', 'AKHIRNYA MASUK')
_subs = [('A', 152.86, 153.62, '<BELUM ADA> EMAIL GUE NIH'),
 ('A', 153.64, 154.55, '<BELUM ADA> EMAIL GUE NIH'),
 ('A', 154.52, 155.65, 'NGOMONG-NGOMONG'),
 ('B', 164.2, 165.6, 'SEBENTAR, <BELUM ADA EMAIL>'),
 ('C', 236.0, 237.0, 'LETAKNYA DIMANA'),
 ('C', 237.02, 238.0, 'KALIAN NGASIH TAU DONG'),
 ('C', 238.02, 239.95, '<MISTERI PORTAL>'),
 ('D', 1577.62, 1579.3, '<EMAIL MASUK!>'),
 ('D', 1579.86, 1581.3, 'OH MY GOD, GUYS'),
 ('D', 1581.34, 1582.85, 'THANK YOU, THANK YOU'),
 ('D', 1582.88, 1584.2, '<EMAIL MASUK!>'),
 ('D', 1584.56, 1585.9, 'GUYS, PAS BANGET'),
 ('D', 1585.96, 1587.0, '<EMAIL MASUK>'),
 ('D', 1587.04, 1589.4, 'PAS BANGET, BRO')]
subs = [(k, s, e, x.replace('<', P).replace('>', V)) for k, s, e, x in _subs]
_labels = []
labels = [(k, s, e, x) for k, s, e, x in _labels]
blurs = {4: (330, 130, 700, 300, 0)}
freeze = 0; endcap = None
srcdesc = ('Source = .cache/wizzclip/windah-gtavi-email-masuk/source.mp4 (also Drive clip-src/windah-gtavi-email-masuk.mp4): '
           'Source = .cache/wizzclip/windah-gtavi-email-masuk/source.mp4 (also Drive clip-src/windah-gtavi-email-masuk.mp4): four pieces (0.6 s padding each) of windah-live10/stream-2208-2308.mp4 (h1, file t 0 = 22:08 WIB) in output order, 1080p30 re-encoded and joined.')
beats = ("Beats in stream order: the running joke 'belum ada yang email gue nih' x2 on the trail (h1 2:32-2:35); 'sebentar, belum ada yang email gue nih' (2:44); 'letaknya dimana, kalian ngasih tau dong, misteri portal' (3:56-4:00); payoff 'email masuk! ... oh my god guys, thank you ... pas banget bro' (26:17-26:29). Word timings from short-window faster-whisper medium (VAD on, and off for silent stretches). Viewer names, platform and brand names are not in any cut. CUT: the 3:44-3:55 phone close-ups (the app grid shows app-name labels; notifications from an in-game ride app), 26:09-26:17 (a browser window with a search-engine logo overlays the game at 26:14-26:15). The game crop (176,0,1328) keeps only the upper 747 px, so the in-game car-maker card (bottom-left) and the bottom-right in-game notifications are out of frame; a shop sign (a restaurant name, source x700-1030 y300-430) is blurred for the payoff cut (cut 4). No guns, gore or swearing.")
what = "Running joke: Windah keeps saying 'belum ada email gue nih', then 'Email masuk!' and thanks the chat."
