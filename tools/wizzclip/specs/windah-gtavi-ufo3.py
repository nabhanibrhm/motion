# Part 3/3 of the UFO arc from Windah's GTA VI stream #5 (yt lF_QYSm2T-Q, file t 0 = 21 Nov 2026 19:16:01 WIB).
# Facecam-below layout, stream #5 cam (FACES['live5']). Cuts are in HOUR-FILE seconds (h5 = stream-2316-0014.mp4).
yt = 'lF_QYSm2T-Q'
layout = 'face'; face = 'live5'
base = {'A': (2861.0, 0.0), 'B': (2881.0, 18.0)}
cuts = [('A', 2863.00, 2878.60),   # h5 47:43.0-47:58.6: photo mode on the alien on the slab, "viralin guys, alien nyata di bumi, kasih filter, bukan AI", filters cycle
        ('B', 2881.90, 2886.90)]   # h5 48:01.9-48:06.9: photo mode ends, "viralin!", "eh? dia bayi." (cut before "anak-anak...")
hook = ('ALIEN KETEMU DI GTA VI', 'WINDAH: BUKAN AI!')
subs = [('A', 2865.58, 2867.80, P + 'VIRALIN' + V + ' GUYS!'),
        ('A', 2868.13, 2869.95, 'ALIEN NYATA DI ' + P + 'BUMI' + V + '!'),
        ('A', 2871.56, 2872.45, 'KASIH FILTER'),
        ('A', 2873.71, 2876.05, P + 'BUKAN AI!' + V),
        ('B', 2882.15, 2883.65, P + 'VIRALIN!' + V),
        ('B', 2884.60, 2885.75, 'EH?'),
        ('B', 2885.90, 2886.85, P + 'DIA BAYI' + V + '.')]
freeze = 0; endcap = None
srcdesc = ("Source = .cache/wizzclip/windah-gtavi-ufo3/source.mp4 (also Drive clip-src/windah-gtavi-ufo3.mp4): two pieces of stream-2316-0014.mp4 (stream #5 hour 5, file t 0 = 23:16 WIB) "
           "in output order, 1080p30 re-encoded and joined: h5 t2861-2879 and t2881-2887.5.")
beats = ("Beats: h5 47:42 (00:02 WIB) Windah raises the phone camera on the alien lying on a slab in an old cryo chamber (photo mode, 4:5 picture with blurred side bars): "
         "'viralin guys, alien nyata di bumi' (47:45.6-47:49.9), 'kasih filter' (47:51.6), 'bukan AI' x4 (47:53.7-47:56), the filters cycle (silent, 47:56-47:58.6), photo mode closes, 'viralin!' (48:02), 'eh? dia bayi.' (48:05-48:06.8). "
         "Word timings from short VAD runs (the hour transcript put 'viralin' at 47:35, about 10 s early). Outside the cuts: the 'No fucking way' in-game line at 47:28 (clip starts at 47:43), the weapon wheel at 47:13, "
         "'motion clip' self-promo at 46:41, the grey-alien tail h5 49:34-49:45 (Lucia's tank-top chest in close-up, and 49:32 'what the fu-' just before), the rifle from 53:20. "
         "Frames: alien on slab, photo filters, Lucia from behind in the lab; no guns, no gore, no drugs.")
what = "UFO arc part 3/3: Windah finds the alien on a slab, takes photos ('viralin, alien nyata di bumi, bukan AI') and realises it is a baby, payoff first."
