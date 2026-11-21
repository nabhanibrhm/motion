yt = '03qhcshfeMY'
base = {'P861': (861.5, 0), 'P892': (892.5, 14.5), 'P921': (921.0, 29.0)}
cuts = [('P861', 862.22, 868.10), ('P861', 873.12, 873.86), ('P861', 874.96, 875.55),
        ('P892', 893.15, 894.80), ('P892', 904.25, 906.42),
        ('P921', 921.74, 922.45), ('P921', 925.15, 926.50), ('P921', 927.95, 936.40)]
# cut 5: the in-game button prompt 'PLANT EXPLOSIVE / ENTER CODE' (source px ~x750-990 y805-905) is box-blurred for that whole cut
blurs = {5: (360, 140, 700, 790, 0)}
hook = ('CHAT LEBIH JELI DARI WINDAH', 'KODE BRANKAS KETEMU WKWK')
subs = [('P861', 862.30, 863.05, 'OH IYA, ITU TUH!'), ('P861', 863.20, 864.15, 'OH, DI JEMBATAN!'),
        ('P861', 864.20, 865.10, P + 'W VIEWER!' + V), ('P861', 865.50, 866.85, 'KALI INI ' + P + 'W VIEWER' + V),
        ('P861', 866.90, 868.05, 'GUE AKUI ' + P + 'W VIEWER' + V),
        ('P861', 873.20, 873.84, 'EH, ' + P + 'LIMA DIGIT' + V + '!'), ('P861', 875.00, 875.52, 'TAR DULU, GUYS'),
        ('P892', 893.20, 894.40, 'GAK ADA DIGIT KE-' + P + 'LIMA' + V), ('P892', 894.40, 894.78, 'GAK ADA, GUYS'),
        ('P892', 904.30, 905.75, P + '4-4-0-1-7' + V), ('P892', 905.80, 906.40, "LET'S DO IT!"),
        ('P921', 921.80, 922.42, 'KEBUKA, BRO!'), ('P921', 925.40, 926.48, 'EH, ' + P + 'KEBUKA SENDIRI' + V),
        ('P921', 928.10, 928.70, P + 'NICE!' + V), ('P921', 929.45, 931.75, "LET'S GO, " + P + 'TCG' + V + '!'),
        ('P921', 932.30, 934.55, 'ORANG PERTAMA DAPET ' + P + 'TCG' + V + '!'), ('P921', 935.10, 936.38, 'LAKI MAFIA!')]
freeze = 0; endcap = None
srcdesc = ("Source = .cache/wizzclip/windah-gtavi-kode/source.mp4 (also Drive clip-src/windah-gtavi-kode.mp4): THREE parts of stream-1832-1932.mp4 "
           "(Windah live 03qhcshfeMY 'GAMEPLAY #4', file t 0 = 20 Nov 2026 18:32:03 WIB) re-encoded to 1080p30 and joined: part 1 local 0-14.5 = t 861.5-876.0; part 2 local 14.5-29 = t 892.5-907.0; part 3 local 29-45 = t 921.0-937.0.")
beats = ("Beats: 18:46:27 (file 14:22) chat spots the safe code on the bridge postcard: 'oh iya itu tuh, oh di jembatan, W Viewer! kali ini W Viewer, gue akui W Viewer'; "
         "'eh 5 digit' (Windah's 'anjing' right after it, t 873.86-874.95, is cut, so is the repeat '5 digit guys'); 'tar dulu guys'; skipped the 4-0-1-7 attempts; 'gak ada digit ke 5, gak ada guys'; "
         "19:00:07 (file 15:04) '4,4,0,1,7, let's do it bro' (the in-game button prompt 'PLANT EXPLOSIVE / ENTER CODE' is box-blurred for the whole cut; dropped 'ini bisa plant explosive juga ya'); "
         "then the safe opens ('kebuka bro', 'eh kebuka sendiri'), the Collectible Card (TCG) appears: 'NICE! Let's go TCG... orang pertama yang dapet TCG, Laki Mafia kah?'. "
         "NOTE: the hourly transcript's 'Ayolah, ayolok...' chant (15:15-15:54) is a whisper hallucination, nothing like it is spoken; the real payoff is the card. "
         "Dropped everything else (drug missions nearby, the 'anjing' at 14:33, gunfire before 13:21). Frames: trailer interior, safe, card, no guns, no drugs, no swears.")
what = "Chat spots the safe code on a bridge postcard, Windah admits 'W Viewer', needs 5 digits, the safe opens and he gets a TCG card (idea C1)."
