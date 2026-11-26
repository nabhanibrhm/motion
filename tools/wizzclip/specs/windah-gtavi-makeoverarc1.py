# Part 1/2 of the Windah GTA VI stream #11 makeover arc (yt 5m-Xi8lgvWY, 25 Nov 2026): the couple outfits in the fancy store, then chat steers him to a barber ('arah jam 6') - cliffhanger on 'gunting'.
# Facecam-below layout, stream #11 cam (FACES['live11']). Cuts are in FILE seconds (h3 = windah-live11/stream-2126-2226.mp4, file t 0 = 21:26 WIB; h4 = stream-2226-2326.mp4, t 0 = 22:26 WIB); the source is the pieces joined in output order (windah_src.py, 0.6 s padding each).
# Frame 0 = teaser (cut T): the finished couple look walking toward the camera (h4 24:00.5).
yt = '5m-Xi8lgvWY'
layout = 'face'; face = 'live11'
game = (0, 0, 1504)
tag = 'WINDAH BASUDARA · GTA VI · PART 1 DARI 2'
# base[key] = (file second where the piece starts, its local second in source.mp4)
base = {'T': (1439.9, 0.0), 'A': (1245.0, 2.4), 'B': (1287.9, 8.6), 'C': (1308.0, 18.6), 'D': (1324.3, 23.1), 'E': (1326.8, 25.8), 'F': (1362.4, 32.7), 'G': (1373.5, 41.2), 'H': (1378.4, 44.6), 'I': (1387.7, 49.8)}
cuts = [
        ('T', 1440.50, 1441.70),    # h4 24:00.5-24:01.7: the finished couple look, walking toward the camera (frame 0, teaser, no speech)
        ('A', 1245.60, 1250.60),    # h3 20:45.6-20:50.6: walking into the store hand in hand, 'orang kaya baru'
        ('B', 1288.50, 1297.30),    # h3 21:28.5-21:37.3: 'coba ada warna merah gak? ... yaudah yang hitam aja lah, cocok lah hitam' (black knit shirt; starts after the 'polo' brand words at 21:20/21:26)
        ('C', 1308.60, 1311.90),    # h3 21:48.6-21:51.9: 'udah bagus ini guys, ada merahnya ada hitamnya'
        ('D', 1324.90, 1326.40),    # h3 22:04.9-22:06.4: the couple in red and black, 'Lucianya cantik banget sih'
        ('E', 1327.40, 1333.10),    # h3 22:07.4-22:13.1: 'eh ada cukur rambut di sini ... coba mana cukur rambut, gambar gunting ya berarti' (map)
        ('F', 1363.00, 1370.30),    # h3 22:43-22:50.3: chat as GPS, 'arah jam 6, cukur rambut dari tempat gue arah jam 6' (after a TV lawyer's name at 22:27 and 'pintu polo' at 22:35)
        ('G', 1374.10, 1376.30),    # h3 22:54.1-22:56.3: 'arah jam 6, gelap, kocak'
        ('H', 1379.00, 1383.00),    # h3 22:59-23:03: 'arah jam 5, dari tempat gue arah jam 5' (after 'tato' at 22:58.7)
        ('I', 1388.30, 1390.30),    # h3 23:08.3-23:10.3: 'gambar apa sih itu? gunting' (cliffhanger)
        ]
hours = {'T': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0, 'F': 0, 'G': 0, 'H': 0, 'I': 0}
hook = ('ORANG KAYA BARU', 'MAKEOVER DIMULAI')
_subs = [
 ('A', 1245.8, 1250.5, '<ORANG KAYA BARU>'),
 ('B', 1288.6, 1290.4, 'ADA WARNA <MERAH> GAK?'),
 ('B', 1291.1, 1293.0, 'WARNA MERAH, <MASALAHNYA>'),
 ('B', 1295.2, 1296.4, 'YAUDAH <HITAM> AJA LAH'),
 ('B', 1296.45, 1297.25, 'COCOK LAH, <HITAM>'),
 ('C', 1308.7, 1310.4, 'UDAH <BAGUS> INI, GUYS'),
 ('C', 1310.45, 1311.85, 'ADA <MERAH>, ADA <HITAM>'),
 ('D', 1325.0, 1326.35, 'LUCIA <CANTIK BANGET>'),
 ('E', 1327.5, 1328.65, 'EH, ADA <CUKUR RAMBUT>'),
 ('E', 1328.66, 1329.35, 'DI SINI'),
 ('E', 1329.36, 1331.0, 'COBA MANA <CUKUR RAMBUT>?'),
 ('E', 1331.7, 1333.05, '<GAMBAR GUNTING> BERARTI'),
 ('F', 1363.1, 1364.4, 'ARAH <JAM 6>'),
 ('F', 1365.2, 1366.85, 'CUKUR RAMBUT DARI TEMPAT'),
 ('F', 1366.9, 1368.5, 'GUE, ARAH <JAM 6>'),
 ('F', 1368.52, 1370.25, 'INI TEMPAT GUE, <JAM 6>'),
 ('G', 1374.15, 1375.0, 'ARAH JAM 6?'),
 ('G', 1375.0, 1376.25, '<GELAP>, KOCAK'),
 ('H', 1379.05, 1380.3, 'ARAH <JAM 5>'),
 ('H', 1380.35, 1381.4, 'DARI TEMPAT GUE'),
 ('H', 1381.44, 1382.6, 'ARAH <JAM 5>'),
 ('I', 1388.35, 1389.45, 'GAMBAR APA SIH ITU?'),
 ('I', 1389.5, 1390.25, '<GUNTING>')]
subs = [(k, s, e, x.replace('<', P).replace('>', V)) for k, s, e, x in _subs]
_labels = [('B', 1288.6, 1291.0, 'BAJU COUPLE'), ('F', 1363.1, 1366.0, 'CHAT JADI GPS')]
labels = [(k, s, e, x) for k, s, e, x in _labels]
blurs = {}
freeze = 0; endcap = None
srcdesc = ('Source = .cache/wizzclip/windah-gtavi-makeoverarc1/source.mp4 (also Drive clip-src/windah-gtavi-makeoverarc1.mp4): '
           '10 pieces (0.6 s padding each) of windah-live11/stream-2126-2226.mp4 (h3) and stream-2226-2326.mp4 (h4) in output order, 1080p30 re-encoded and joined.')
beats = ("Beats in stream order: frame-0 teaser (h4 24:00.5, the finished couple look); 'orang kaya baru' into the fancy store (h3 20:45); red or black for the couple outfit (h3 21:28-21:37); 'ada merahnya ada hitamnya' (h3 21:48); 'Lucianya cantik banget' over the couple walking (h3 22:05); the barber hunt on the map, 'gambar gunting' (h3 22:07-22:13); chat as GPS 'arah jam 6' / 'arah jam 5' (h3 22:43-23:03); cliffhanger 'gambar apa sih itu? gunting' (h3 23:08). Word timings from faster-whisper medium on short windows. CUT: every spoken 'polo' (clothing brand, h3 21:20, 21:26, 22:35), a TV lawyer's name (h3 22:27), 'tato' (22:58.7), the film-title line at h3 19:51 and the swear at h3 20:16. The store's sign and item labels are the game's own fictional brand. Jason's tee in cut A has a small car print. No guns, gore or revealing outfits in frame.")
what = "Makeover arc part 1/2: Jason and Lucia go 'orang kaya baru', pick couple outfits in red and black, then chat turns into a GPS to find a barber ('arah jam 6!')."
