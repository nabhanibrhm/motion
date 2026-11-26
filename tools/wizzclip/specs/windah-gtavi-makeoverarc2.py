# Part 2/2 of the Windah GTA VI stream #11 makeover arc (yt 5m-Xi8lgvWY, 25 Nov 2026): the barbershop, where the girls in chat vote on Jason's long hair (7) and Lucia's (6); ends on the finished couple.
# Facecam-below layout, stream #11 cam (FACES['live11']). Cuts are in FILE seconds (h4 = windah-live11/stream-2226-2326.mp4, file t 0 = 22:26 WIB); the source is the pieces joined in output order (windah_src.py, 0.6 s padding each).
# Frame 0 = teaser (cut T): Jason's long hair and beard close-up (h4 20:50.6). The streamer's chat/poll window with usernames covers source x40-660 y60-780 from h4 19:49.5 to 20:11 and 22:19.5 to 22:42: cuts D and J are blurred there.
yt = '5m-Xi8lgvWY'
layout = 'face'; face = 'live11'
game = (0, 0, 1504)
tag = 'WINDAH BASUDARA · GTA VI · PART 2 DARI 2'
# base[key] = (file second where the piece starts, its local second in source.mp4)
base = {'T': (1250.0, 0.0), 'A': (1161.4, 2.4), 'C': (1182.6, 7.6), 'D': (1197.2, 14.1), 'E': (1214.3, 21.1), 'F': (1243.4, 26.65), 'G': (1254.0, 34.15), 'H': (1303.4, 38.15), 'J': (1355.8, 43.85), 'K': (1441.5, 53.25)}
cuts = [
        ('T', 1250.60, 1251.80),    # h4 20:50.6-20:51.8: Jason's long hair and beard close-up (frame 0, teaser, no speech)
        ('A', 1162.00, 1166.00),    # h4 19:22-19:26: 'coba gondrong gini, suka gak cewe-cewe? suka? kalo mau gue gas nih'
        ('C', 1183.20, 1188.50),    # h4 19:43.2-19:48.5: 'ada 2 model gondrong, 6 atau 7? voting dimulai sekarang, cewe-cewe yang jawab ya' (the chat window opens at 19:49.5, after this cut)
        ('D', 1197.80, 1203.60),    # h4 19:57.8-20:03.6: 'oke, bocil-bocil cewe suka nomor 7, yaudah Jasonnya kita kasih nuansa baru' (chat window blurred)
        ('E', 1214.90, 1219.25),    # h4 20:14.9-20:19.25: 'coklatin dikit ya, pirangin dikit gitu, anjir kaya pangeran' (ends before 'bad, enggak enggak')
        ('F', 1244.00, 1250.30),    # h4 20:44-20:50.3: 'biar clean, clean, clean shave ... brewok? bagus, brewok'
        ('G', 1254.60, 1257.40),    # h4 20:54.6-20:57.4: 'tuh ada brewok dikit tuh ya, dah tuh cewek-cewek suka gak?'
        ('H', 1304.00, 1308.50),    # h4 21:44-21:48.5: Lucia's turn, '6 cantik, 8 juga cantik sih guys, 6 atau 8?' (starts after 'anjir' at 21:41)
        ('J', 1356.40, 1364.60),    # h4 22:36.4-22:44.6: 'cewek-cewek menjawab nomor 6 yang paling cantik, gas, kita kasih Lucia hairstyle terbaru, nomor 6' (chat window blurred; closes at 22:42)
        ('K', 1442.10, 1448.10),    # h4 24:02.1-24:08.1: the finished couple walking toward the camera, 'anjay cantik ... dan ganteng ya'
        ]
hours = {'T': 0, 'A': 0, 'C': 0, 'D': 0, 'E': 0, 'F': 0, 'G': 0, 'H': 0, 'J': 0, 'K': 0}
hook = ('RAMBUT JASON DIVOTING', 'HASILNYA KAYA PANGERAN')
_subs = [
 ('A', 1162.0, 1163.0, 'COBA <GONDRONG> GINI'),
 ('A', 1163.04, 1164.4, 'SUKA GAK, <CEWE-CEWE>?'),
 ('A', 1164.7, 1165.95, 'KALO MAU, GUE <GAS> NIH'),
 ('C', 1183.25, 1184.35, 'ADA 2 MODEL <GONDRONG>'),
 ('C', 1184.4, 1186.3, '<6> ATAU <7>?'),
 ('C', 1186.5, 1187.4, '<VOTING> DIMULAI'),
 ('C', 1187.44, 1188.45, 'CEWE-CEWE YANG JAWAB'),
 ('D', 1197.85, 1199.4, 'OKE, BOCIL-BOCIL'),
 ('D', 1199.45, 1201.2, 'CEWE SUKA <NOMOR 7>'),
 ('D', 1201.24, 1201.9, 'YAUDAH, JASON'),
 ('D', 1201.92, 1203.5, 'KITA KASIH <NUANSA BARU>'),
 ('E', 1214.9, 1215.9, '<COKLATIN> DIKIT YA'),
 ('E', 1216.9, 1218.35, '<PIRANGIN> DIKIT GITU'),
 ('E', 1218.38, 1219.2, 'ANJIR, <KAYA PANGERAN>'),
 ('F', 1244.05, 1246.4, 'BIAR CLEAN, <CLEAN SHAVE>'),
 ('F', 1247.0, 1247.6, '<BREWOK>?'),
 ('F', 1247.95, 1249.6, 'BAGUS, <BREWOK>'),
 ('G', 1254.65, 1256.2, 'TUH, ADA <BREWOK> DIKIT'),
 ('G', 1256.24, 1257.38, 'CEWEK-CEWEK <SUKA GAK>?'),
 ('H', 1304.1, 1305.3, '<6> CANTIK'),
 ('H', 1305.4, 1307.3, '<8> JUGA CANTIK SIH'),
 ('H', 1307.32, 1308.45, '<6> ATAU <8>?'),
 ('J', 1356.45, 1358.5, 'CEWEK-CEWEK JAWAB <NOMOR 6>'),
 ('J', 1358.54, 1359.85, 'PALING CANTIK, <GAS>'),
 ('J', 1360.5, 1362.9, 'LUCIA <HAIRSTYLE BARU>'),
 ('J', 1363.4, 1364.55, '<NOMOR 6>'),
 ('K', 1442.25, 1443.7, 'ANJAY, <CANTIK>'),
 ('K', 1447.0, 1448.05, 'DAN <GANTENG> YA')]
subs = [(k, s, e, x.replace('<', P).replace('>', V)) for k, s, e, x in _subs]
_labels = [('C', 1183.25, 1186.3, 'VOTING RAMBUT JASON'), ('H', 1304.1, 1307.3, 'GILIRAN LUCIA')]
labels = [(k, s, e, x) for k, s, e, x in _labels]
blurs = {4: (620, 720, 40, 60, 0), 9: (620, 720, 40, 60, 0)}
freeze = 0; endcap = None
srcdesc = ('Source = .cache/wizzclip/windah-gtavi-makeoverarc2/source.mp4 (also Drive clip-src/windah-gtavi-makeoverarc2.mp4): '
           '10 pieces (0.6 s padding each) of windah-live11/stream-2126-2226.mp4 (h3) and stream-2226-2326.mp4 (h4) in output order, 1080p30 re-encoded and joined.')
beats = ("Beats in stream order: frame-0 teaser (h4 20:50.6, Jason's long hair and beard); 'gondrong gini suka gak cewe-cewe?' (h4 19:22); the vote '6 atau 7' (h4 19:43); 'cewe suka nomor 7, kasih nuansa baru' (h4 19:58); 'pirangin dikit ... anjir kaya pangeran' (h4 20:15-20:19); 'clean shave ... bagus brewok' (h4 20:44-20:50); 'cewek-cewek suka gak?' (h4 20:55); Lucia's turn '6 atau 8' (h4 21:44); 'cewek-cewek jawab nomor 6' (h4 22:36-22:44); payoff, the finished couple walking, 'anjay cantik dan ganteng' (h4 24:02-24:08). Word timings from faster-whisper medium on short windows. The streamer's chat/poll window (usernames) is blurred in cuts D and J; the Windows taskbar at source y>1060 is outside the game crop. CUT: a game-character name at h4 21:12 and the swears around h4 21:41. No guns, gore or revealing outfits in frame.")
what = "Makeover arc part 2/2: the girls in chat vote on Jason's long hair (7, 'kaya pangeran', then a beard) and Lucia's hair (6); ends on the finished couple."
