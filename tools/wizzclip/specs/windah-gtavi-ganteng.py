yt = '03qhcshfeMY'
base = {'P3374': (3374.0, 0)}
cuts = [('P3374', 3374.65, 3392.40)]
# in-game cutscene subtitles (one reads 'Patron: Dickheads') sit at source px y~940-990: blur that strip for the whole clip
blurs = {1: (1120, 80, 400, 925, 0)}
hook = ('CUMA DI STREAM WINDAH', 'JASON-NYA GANTENG WKWK')
subs = [('P3374', 3374.70, 3375.76, 'CUMA DI STREAM GUE'), ('P3374', 3375.94, 3376.50, P + 'JASON-NYA GANTENG' + V),
        ('P3374', 3376.58, 3377.00, 'SETUJU GAK?'), ('P3374', 3377.72, 3379.14, 'EMANG SELERA-SELERA LAKI'),
        ('P3374', 3379.26, 3380.70, P + 'GLOW UP' + V + ' ADA DI GUE'), ('P3374', 3380.92, 3381.80, 'LIAT'),
        ('P3374', 3381.86, 3383.36, 'CUKUR, KUMIS TIPIS'), ('P3374', 3383.42, 3385.36, 'RAMBUT PENDEK'),
        ('P3374', 3386.00, 3387.40, 'L SEMUA'), ('P3374', 3387.40, 3388.94, 'YANG BIKIN JASON ' + P + 'GONDRONG' + V),
        ('P3374', 3388.94, 3390.20, P + 'CLIP THAT!' + V), ('P3374', 3391.00, 3392.36, 'BOCIL JENGGOT MENYERANG GAK?')]
freeze = 0; endcap = None
srcdesc = ("Source = .cache/wizzclip/windah-gtavi-ganteng/source.mp4 (also Drive clip-src/windah-gtavi-ganteng.mp4): TWO parts of stream-1832-1932.mp4 "
           "(Windah live 03qhcshfeMY 'GAMEPLAY #4', t 0 = 20 Nov 2026 18:32:03 WIB) re-encoded to 1080p30 and one part: local 0-19 = t 3374-3393.")
beats = ("Beats: 19:28:17 'Cuma di stream gue Jasonnya ganteng, setuju gak? Emang gue selera-selera laki, glow up kayaknya ada di gue guys. Liat, cukur, kumis tipis, rambut pendek. L semua yang bikin Jason gondrong. Clip that!' and 'bocil jenggot menyerang gak?' "
         "(over the pause menu and the Brian cutscene). The cutscene subtitle strip (source px x400-1520 y925-1005; one line reads 'Patron: Dickheads') is box-blurred for the whole clip. Dropped the later 'Jason ganteng banget rambutnya begini' (19:28:53): it plays over Donnie, not Jason, and next to Donnie's subtitle swear. No guns, no Windah swears.")
what = "Windah brags that only in his stream Jason looks handsome (short hair, thin moustache) and literally says 'clip that' (idea C2)."
