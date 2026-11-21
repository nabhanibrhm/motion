yt = '03qhcshfeMY'
base = {'P910': (909.5, 0), 'P947': (947.0, 13.5)}
cuts = [('P910', 909.95, 922.45), ('P947', 947.55, 949.95), ('P947', 949.95, 958.90), ('P947', 958.90, 961.50)]
# a pistol is handed over at t 947.5-950 and held at t 959-961: blur the picture (not the facecam, bottom-right) for those two cuts
blurs = {2: (1500, 1080, 0, 0, 0), 4: (1500, 1080, 0, 0, 0)}
hook = ('WINDAH BIKIN LAGU', 'BUAT JASON DAN LUCIA')
subs = [('P910', 910.08, 911.54, 'KISAH CINTA'), ('P910', 911.54, 914.12, P + 'DUA SEJOLI' + V),
        ('P910', 914.12, 916.32, 'MEREKA BERJUANG'), ('P910', 916.32, 918.50, 'DARI NOL'),
        ('P910', 918.50, 920.60, 'UNTUK MEMULAI'), ('P910', 920.60, 922.40, 'KEHIDUPAN YANG ' + P + 'LEBIH BAIK' + V),
        ('P947', 947.68, 949.14, 'TERPAKSA MEREKA'), ('P947', 949.16, 949.95, 'MELAKUKAN'),
        ('P947', 949.98, 951.92, P + 'KRIMINAL' + V), ('P947', 951.92, 953.52, 'NAMUN INI'), ('P947', 953.52, 955.62, 'SEMUA UNTUK'),
        ('P947', 956.16, 958.30, P + 'ANAK MEREKA' + V), ('P947', 959.00, 961.40, P + 'JASON DAN LUCIA' + V)]
freeze = 0; endcap = None
srcdesc = ("Source = .cache/wizzclip/windah-gtavi-lagu/source.mp4 (also Drive clip-src/windah-gtavi-lagu.mp4): TWO parts of stream-1932-2032.mp4 "
           "(Windah live 03qhcshfeMY 'GAMEPLAY #4', file t 0 = 20 Nov 2026 19:32:03 WIB) re-encoded to 1080p30 and joined: part 1 local 0-13.5 = t 909.5-923; part 2 local 13.5-28.5 = t 947-962.")
beats = ("Beats: Windah improvises a love song over the Jason/Lucia home cutscene: 19:47:13 'kisah cinta dua sejoli, mereka berjuang dari nol, untuk memulai kehidupan yang lebih baik' (opening verse); skipped 19:47:25-19:47:50 ('ada anak yang harus ditanggung… inilah kisah cinta dua sejoli' and the 'uuu yeee' run) because the cutscene there shows Jason lifting Lucia onto the counter while they make out (t 926-933); "
         "19:47:50 'terpaksa mereka melakukan kriminal, namun ini semua untuk anak mereka, Jason dan Lucia'. Stopped before 19:48:03 (the cutscene turns to a kiss on the floor and a pistol, t 971-979). "
         "Violence check: a pistol is handed over at t 947.5-950 and held at t 959-961, so the picture (source px x0-1500, the whole frame except the facecam column) is box-blurred for those two cuts; t 941-942 (pistol on the table) is outside the cuts. No swears.")
what = "Windah makes up a love song for Jason and Lucia ('kisah cinta dua sejoli… terpaksa melakukan kriminal, namun ini semua untuk anak mereka') during a home cutscene (idea E1)."
