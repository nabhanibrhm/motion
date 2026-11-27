# Windah GTA VI stream #12 (yt WnVFoAGVftc, 26 Nov 2026): Windah plays stylist and picks Lucia's casual outfit (track jacket, short pants, high sneakers, black top); chat calls it 'jamet'.
# Facecam-below layout, stream #12 cam (FACES['live12']). Cuts are in FILE seconds of windah-live12/stream-2104-2204.mp4 (h3, file t 0 = 21:04 WIB); the source is the pieces joined in output order (windah_src.py, 0.6 s padding each).
# Frame 0 = teaser (cut T): Lucia walking outside in the finished look (h3 48:40.6).
yt = 'WnVFoAGVftc'
layout = 'face'; face = 'live12'
game = (0, 0, 1504)
base = {'T': (2920.0, 0.0), 'A': (2826.6, 2.4), 'B': (2840.2, 8.8), 'C': (2847.7, 13.6), 'D': (2858.6, 17.3), 'E': (2863.8, 20.7), 'F': (2883.6, 25.4), 'G': (2929.6, 34.0), 'H': (2968.9, 45.2)}
cuts = [
        ('T', 2920.60, 2921.80),    # h3 48:40.6: Lucia outside in the finished look (teaser)
        ('A', 2827.20, 2832.40),    # h3 47:07.2: 'just do it ... oke gue suka ini, keren keren, I like this' (ends before 'realis banget anjir' at 2832.7)
        ('B', 2840.80, 2844.40),    # h3 47:20.8: 'oke ini bagus, ini bagus, tinggal celananya'
        ('C', 2848.30, 2850.80),    # h3 47:28.3: 'digabung sama ini, ya digabung sama itu'
        ('D', 2859.20, 2861.40),    # h3 47:39.2: 'celananya pakai celana ini, celana pendek'
        ('E', 2864.40, 2867.90),    # h3 47:44.4: 'bagus ya, setelan gue ya, topinya buka aja nih'
        ('F', 2884.20, 2886.20),    # h3 48:04.2: 'sepatu ganti, bosan gue pakai sepatunya'
        ('F', 2889.00, 2891.60),    # h3 48:09: 'sepatunya yang tinggi, guys, oke' (the shorts close-ups at 48:18-48:21 are left out)
        ('G', 2930.20, 2933.30),    # h3 48:50.2: 'ganti, kayaknya atasannya kurang sih'
        ('G', 2936.20, 2940.20),    # h3 48:56.2: 'gue ganti yang lebih ... ha ini aja nih, yang lebih hitam'
        ('H', 2969.50, 2971.50),    # h3 49:29.5: walking out of the shop in the final look (payoff)
        ]
hours = {k: 0 for k in base}
hook = ('WINDAH JADI STYLIST', 'BAJU SANTAI LUCIA')
_subs = [
 ('A', 2827.3, 2828.9, 'JUST DO IT'),
 ('A', 2829.16, 2830.8, 'OKE GUE <SUKA> INI'),
 ('A', 2830.9, 2832.35, '<KEREN>, I LIKE THIS'),
 ('B', 2840.92, 2842.9, 'OKE INI <BAGUS>'),
 ('B', 2843.2, 2844.35, 'TINGGAL <CELANANYA>'),
 ('C', 2848.38, 2849.7, 'DIGABUNG SAMA INI'),
 ('C', 2849.74, 2850.75, 'YA, <DIGABUNG>'),
 ('D', 2859.32, 2860.75, 'CELANANYA PAKAI INI'),
 ('D', 2860.82, 2861.35, '<CELANA PENDEK>'),
 ('E', 2864.48, 2866.4, 'BAGUS YA, <SETELAN GUE>'),
 ('E', 2866.54, 2867.85, '<TOPINYA> BUKA AJA'),
 ('F', 2884.32, 2886.15, 'SEPATU GANTI, <BOSAN>'),
 ('F', 2889.08, 2891.55, 'SEPATUNYA YANG <TINGGI>'),
 ('G', 2930.28, 2933.25, 'KAYAKNYA <ATASANNYA> KURANG'),
 ('G', 2936.3, 2938.6, 'GUE GANTI YANG LEBIH...'),
 ('G', 2938.68, 2940.15, 'INI AJA, YANG <HITAM>')]
subs = [(k, s, e, x.replace('<', P).replace('>', V)) for k, s, e, x in _subs]
labels = [('B', 2840.9, 2844.3, 'CHAT: "JAMET!"'), ('H', 2969.6, 2971.45, 'JAMET ATAU KEREN?')]
blurs = {}
freeze = 0; endcap = None
srcdesc = ('Source = .cache/wizzclip/windah-gtavi-stylist/source.mp4 (also Drive clip-src/windah-gtavi-stylist.mp4): '
           '9 pieces (0.6 s padding each) of windah-live12/stream-2104-2204.mp4 (h3) in output order, 1080p30 re-encoded and joined.')
beats = ("Beats in stream order: frame-0 teaser (h3 48:40, the finished look outside); 'gue suka ini, keren' at the track jacket (h3 47:07); chat 'jamet' while he says 'ini bagus, tinggal celananya' (h3 47:20); mixing pieces, short pants, 'setelan gue', hat off (h3 47:28-47:47); high sneakers (h3 48:04-48:11); 'atasannya kurang', the black top (h3 48:50-49:00); walking out in the final look (h3 49:29). Word timings from faster-whisper medium on the scan's voice-boosted audio. "
         "CUT: 'realis banget anjir' (47:12.7), 'anjir' at 48:38, the close-ups on Lucia's shorts/legs (48:18-48:21) and the shop's swimwear corner. Store and shoe brand names on screen are the game's own fictional brands. Lucia wears the game's tube/crop tops in some store previews (wide or mid shots only). No guns or gore.")
what = "Windah plays stylist for Lucia's casual outfit in GTA VI (track jacket, short pants, high sneakers, black top) while chat calls it 'jamet'."
