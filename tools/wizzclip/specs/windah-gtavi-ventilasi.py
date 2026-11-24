# Windah GTA VI stream #9 (yt zYTPbx83wCQ, 24 Nov 2026; h1 file t 0 = 19:59 WIB): chat spams "ventilasi", Windah claims "tanpa bantuan viewer, nemu".
# Facecam-below layout, stream #9 cam (FACES['live9']). Cuts are in FILE seconds of windah-live9/stream-1959-2059.mp4 (h1).
yt = 'zYTPbx83wCQ'
layout = 'face'; face = 'live9'
# default game crop (0,0,1504): the cam (x>=1550) stays out
tag = 'WINDAH BASUDARA · GTA VI'
base = {'A': (2650.4, 0), 'B': (2666.1, 3.2), 'C': (2672.4, 8.25), 'D': (2680.6, 17.25)}
cuts = [('A', 2651.00, 2653.00),    # h1 44:11-44:13: "Cabut nih gua, lumayan 3000 dolar, guys." (frame 0: Jason crouched at the fence)
        ('B', 2666.70, 2670.55),    # h1 44:26.7-44:30.55: "oh berarti uang yang dimaksud detektif tadi tuh ya 3000 dolar itu" (stops before "gak nemu, anjir, goblok")
        ('C', 2673.00, 2680.80),    # h1 44:33-44:40.8: "udah rame banget padahal ... gue sendiri, tanpa bantuan viewer nemu. Ventilasi itu, cuy." (starts after both "anjir")
        ('D', 2681.20, 2682.90)]    # h1 44:41.2-44:42.9: "nice, nice, nice, nice" (laugh)
hours = {k: 1 for k, s, e in cuts}
hook = ('TANPA BANTUAN VIEWER', 'KATA WINDAH')
subs = [('A', 2651.14, 2652.95, 'CABUT NIH GUA, ' + P + 'LUMAYAN 3000 DOLAR' + V),
        ('B', 2666.72, 2668.25, 'OH, BERARTI UANG'),
        ('B', 2668.28, 2669.65, 'YANG DIMAKSUD DETEKTIF TADI'),
        ('B', 2669.68, 2670.50, P + '3000 DOLAR' + V + ' ITU'),
        ('C', 2673.02, 2674.65, 'UDAH ' + P + 'RAME' + V + ' BANGET PADAHAL'),
        ('C', 2674.98, 2675.85, 'GUE SENDIRI,'),
        ('C', 2676.45, 2678.30, P + 'TANPA BANTUAN VIEWER' + V + ', NEMU'),
        ('C', 2678.36, 2680.70, P + 'VENTILASI' + V + ' ITU, CUY'),
        ('D', 2681.25, 2682.85, P + 'NICE, NICE, NICE' + V)]
labels = [('A', 2651.05, 2653.00, 'CHAT: VENTILASI!')]
# B: in-game vehicle name pop-up (lower left, brand-style name); C/D: a building sign with a company name at the top of the frame (index 1-based: A1 B2 C3 D4)
blurs = {2: (300, 100, 20, 675, 0), 3: (560, 140, 480, 20, 6.0), 4: (560, 140, 480, 20, 0)}
freeze = 0; endcap = None
srcdesc = ("Source = .cache/wizzclip/windah-gtavi-ventilasi/source.mp4 (also Drive clip-src/windah-gtavi-ventilasi.mp4): four pieces (0.6 s padding each) of "
           "windah-live9/stream-1959-2059.mp4 (h1, file t 0 = 19:59 WIB) in output order, 1080p30 re-encoded and joined.")
beats = ("Beats in stream order: Windah leaves the apartment yard with 3000 dollars ('cabut nih gua', h1 44:11); 'the money the detective meant, that was the 3000' (44:26); "
         "then, after the missed-it swear, the claim 'gue sendiri, tanpa bantuan viewer, nemu. Ventilasi itu, cuy' (44:33-44:40) and 'nice nice nice' (44:41). "
         "Chat had spammed 'ventilasi' for minutes before (chat spike #1 43:13) and roasts the claim right after (#6 44:46); no chat is audible or on screen, the label and hook carry it. "
         "Word timings from medium faster-whisper, no VAD ('tiduran' before 'gue sendiri' at 44:34.7 is a doubtful word and is not subtitled: check by ear). "
         "CUT: 'gak nemu, anjir, goblok banget' (44:30.8-44:32.4) and the two 'anjir' right after it (cut C starts at 44:33.0); 44:19-44:27 'kita gak perlu takedown dua polisi itu' (violence mention); "
         "the in-game vehicle name pop-up (lower left, 44:26-44:30) is blurred and a building sign with a company name at the top of the frame (44:39+) is blurred. "
         "No viewer names on screen, no guns or gore, no brand text spoken. The car is a plain pink sports car, no badge readable.")
what = "Chat spams 'ventilasi' while Windah hunts for the hidden money; he then claims he found it alone, 'tanpa bantuan viewer, nemu. Ventilasi itu, cuy.'"
