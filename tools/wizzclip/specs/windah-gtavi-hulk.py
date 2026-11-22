# "Red Hulk": Windah's reaction to the giant red character, stream #7 (yt MWQtXTTAgeM, 22 Nov 2026, file t 0 = 21:59 WIB).
# Facecam-below layout, stream #7 cam (FACES['live7']). Cuts are in HOUR-FILE seconds of windah-live7/stream-2259-0001.mp4 (hour 2, WIB = local + 22:59).
yt = 'MWQtXTTAgeM'
layout = 'face'; face = 'live7'
base = {'T': (3132.9, 0), 'B1': (3183.0, 2.7), 'B1b': (3197.0, 10.8), 'B2': (3373.3, 14.3), 'B3': (3386.6, 25.0)}
cuts = [('T', 3133.50, 3135.00),    # TEASER 52:13.5-52:15: the red giant standing in front of the barn after the fight (no hits in the shot), frame 0
        ('B1', 3183.60, 3190.50),   # 53:03.6-53:10.5: SUV driving, 3 stars: "Gila, Red Hulk, nyata, Joy! Pulang dulu udah ada, kali ini gue ngalah sama polisi, gue pulang"
        ('B1b', 3197.60, 3199.90),  # 53:17.6-53:19.9: "kali ini gue ngalah segala-galanya ya" (map screen then driving)
        ('B2', 3373.90, 3383.40),   # 56:13.9-56:23.4: bench press, "ada cutscene guys pas Red Hulk? eh dia lompat kocak, dia terbang ke atas, apa sih bocil-bocil ngada-ngada mulu, orang dia bilang cari gue ya, terus dia terbang"
        ('B3', 3387.20, 3389.70)]   # 56:27.2-56:29.7: "orang dia bilang cari gue, terus dia Hulk Jump" (stops before 56:31 'nonton youtube')
hours = {k: 2 for k in base}
hook = ('RED HULK', 'BENERAN ADA DI GTA VI')
subs = [('T', 3133.55, 3134.95, 'RED HULK ITU ' + P + 'NYATA' + V),
        ('B1', 3184.00, 3184.98, 'GILA, ' + P + 'RED HULK' + V + ','),
        ('B1', 3184.98, 3186.40, P + 'NYATA' + V + ', JOY!'),
        ('B1', 3186.42, 3187.12, 'PULANG DULU,'),
        ('B1', 3187.16, 3188.30, 'KALI INI GUE ' + P + 'NGALAH' + V),
        ('B1', 3188.30, 3188.80, 'SAMA POLISI'),
        ('B1', 3189.08, 3190.45, 'GUE PULANG'),
        ('B1b', 3197.68, 3198.66, 'KALI INI GUE ' + P + 'NGALAH' + V + ','),
        ('B1b', 3198.68, 3199.85, 'SEGALA-GALANYA YA'),
        ('B2', 3374.00, 3375.80, 'ADA CUTSCENE GAK'),
        ('B2', 3375.80, 3377.58, 'PAS ' + P + 'RED HULK' + V + '?'),
        ('B2', 3377.58, 3379.10, 'EH, DIA ' + P + 'LOMPAT' + V + ' KOCAK'),
        ('B2', 3379.12, 3379.86, 'TERBANG KE ATAS'),
        ('B2', 3379.88, 3381.30, 'APA SIH, NGADA-NGADA MULU'),
        ('B2', 3381.30, 3382.50, 'ORANG DIA BILANG CARI GUE'),
        ('B2', 3382.52, 3383.35, 'TERUS DIA TERBANG'),
        ('B3', 3387.30, 3388.40, 'ORANG DIA BILANG CARI GUE,'),
        ('B3', 3388.45, 3389.65, 'TERUS DIA ' + P + 'HULK JUMP' + V)]
freeze = 0; endcap = None
srcdesc = ("Source = .cache/wizzclip/windah-gtavi-hulk/source.mp4 (also Drive clip-src/windah-gtavi-hulk.mp4): five pieces (0.6 s padding each) of the stream #7 hour-2 recording "
           "(windah-live7/stream-2259-0001.mp4, WIB = local + 22:59) in output order, 1080p30 re-encoded and joined.")
beats = ("Windah meets the giant red character (the Kyle side quest). Frame-0 teaser = the red giant standing at the barn door after the fight (52:13.5, 1.5 s, nobody hit in the shot), "
         "then stream order: 53:03.6 'Gila, Red Hulk, nyata, Joy!' and 'kali ini gue ngalah sama polisi, gue pulang' while driving away from the cops (3 stars, no gunfire on screen), 53:17.6 'kali ini gue ngalah segala-galanya ya', "
         "then 56:14 at the motel bench press, 'ada cutscene guys pas Red Hulk? eh dia lompat kocak, dia terbang ke atas ... terus dia Hulk Jump' (56:27). Word timings from faster-whisper medium with VAD on short windows. "
         "CUT: the whole fight 50:00-52:10 (throws, burning car, blood, bear hug at 52:00-52:08), the 52:37 swear ('anjir, beneran red'), 52:27-52:48 'polisi, babi', 53:24 whisper 'Red Bull' (misheard Hulk, brand), "
         "53:11-53:17 repeated 'gue pulang' over a menu, 56:30 onward ('nonton youtube doang', platform name, then the third-party video). 'Hulk' is a character nickname only. "
         "Teaser check: the giant's skin is red with some scars/stains and torn jeans; it stands still and nobody is hit in 52:13.5-52:15 (a bear hug on Jason happens at 52:10-52:12, just before).")
what = "Windah Basudara meets the Red Hulk in GTA VI: 'Gila, Red Hulk, nyata!', then 'dia Hulk Jump' over the bench press."
