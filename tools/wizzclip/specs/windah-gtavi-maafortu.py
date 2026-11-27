# Windah GTA VI stream #12 (yt WnVFoAGVftc, 26 Nov 2026): after the game's 'sexy yoga' film shoot and an adult film on a TV in the mansion, a parent in chat writes 'gw sebagai ortu jaman skrg stres anak gw nonton ginian'; Windah pauses the game, reads it out and apologizes to parents.
# Facecam-below layout, stream #12 cam (FACES['live12']). Cuts are in FILE seconds of windah-live12/stream-2204-2304.mp4 (h4, file t 0 = 22:04 WIB); the source is the pieces joined in output order (windah_src.py, 0.6 s padding each).
yt = 'WnVFoAGVftc'
layout = 'face'; face = 'live12'
game = (0, 64, 1488)
tag = 'WINDAH BASUDARA · GTA VI'
base = {'A': (1539.7, 0.0), 'C': (2147.2, 2.5)}
cuts = [
        ('A', 1540.30, 1541.60),    # h4 25:40.3: 'sexy yoga, guys' over the film shoot (whole game panel blurred; after Jason's in-game swear at ~25:39)
        ('C', 2147.80, 2157.35),    # h4 35:47.8: game paused; reads the parent's chat line, 'bapak ibu, sebelumnya saya minta maaf ya ... minta maaf banget nih'
        ('C', 2157.42, 2162.30),    # h4 35:57.4: 'aku tidak menyalahkan bapak atau ibu, maafkan banget anaknya nonton gini'
        ('C', 2165.85, 2171.85),    # h4 36:05.9: 'dari awal gua udah bilang, dari episode 1, emang gamenya 21++, 18++' (ends before he reads the viewer's username)
        ('C', 2174.45, 2183.10),    # h4 36:14.5: 'aku juga udah usahakan semaksimal mungkin buat sensor; sekali lagi mohon maaf ya bapak dan ibu dari anak yang nonton ya, oke'
        ]
hours = {'A': 0, 'C': 0}
hook = ('ADA ORTU PROTES', 'WINDAH MINTA MAAF')
_subs = [
 ('A', 1540.45, 1541.55, 'SEXY YOGA, <GUYS>'),
 ('C', 2147.85, 2148.6, 'SEBENTAR, SEBENTAR'),
 ('C', 2148.64, 2150.12, 'GUA SEBAGAI <ORTU>'),
 ('C', 2150.16, 2151.5, 'STRES ANAK GUA <NONTON>'),
 ('C', 2152.62, 2155.3, 'BAPAK IBU, SAYA <MINTA MAAF>'),
 ('C', 2155.5, 2157.3, 'MINTA MAAF <BANGET> NIH'),
 ('C', 2158.72, 2160.3, 'AKU <GAK MENYALAHKAN>'),
 ('C', 2160.66, 2162.25, 'MAAF ANAKNYA <NONTON GINI>'),
 ('C', 2165.92, 2168.15, 'DARI AWAL GUA <UDAH BILANG>'),
 ('C', 2168.2, 2171.8, 'EMANG GAMENYA <18+>'),
 ('C', 2174.52, 2177.0, 'AKU JUGA UDAH <USAHAKAN>'),
 ('C', 2177.02, 2179.0, 'SEMAKSIMAL MUNGKIN <SENSOR>'),
 ('C', 2179.76, 2181.1, 'SEKALI LAGI <MOHON MAAF>'),
 ('C', 2181.14, 2183.05, 'BUAT BAPAK DAN IBU')]
subs = [(k, s, e, x.replace('<', P).replace('>', V)) for k, s, e, x in _subs]
labels = [('A', 1540.3, 1541.6, 'ADEGAN 18+ DISENSOR'), ('C', 2147.85, 2151.5, 'CHAT DARI ORANG TUA')]
# cut 1: whole game panel blurred; cuts 2-5: the streamer's chat window (usernames) blurred
blurs = {1: (1488, 836, 0, 64, 0), 2: (470, 540, 266, 362, 0), 3: (470, 540, 266, 362, 0), 4: (470, 540, 266, 362, 0), 5: (470, 540, 266, 362, 0)}
freeze = 0; endcap = None
srcdesc = ('Source = .cache/wizzclip/windah-gtavi-maafortu/source.mp4 (also Drive clip-src/windah-gtavi-maafortu.mp4): '
           '2 pieces (0.6 s padding each) of windah-live12/stream-2204-2304.mp4 (h4) in output order, 1080p30 re-encoded and joined.')
beats = ("Beats in stream order: 'sexy yoga, guys' over the in-game adult film shoot, fully blurred (h4 25:40); game paused, Windah reads a parent's chat line and apologizes to parents (h4 35:48-36:23). Word timings from faster-whisper medium on a short window. "
         "CUT: Jason's in-game swear (~25:39), the film shoot itself (blurred), the TV adult film before the pause, the viewer's username he reads out (h4 36:12.9-36:14.0) and the chat window (blurred). The pause-menu background is the game's own blur.")
what = "A parent in chat complains about the adult scenes; Windah pauses GTA VI and apologizes to parents ('dari awal gua udah bilang, gamenya 18+')."
