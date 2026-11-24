# Windah GTA VI stream #9 (yt zYTPbx83wCQ, 24 Nov 2026; p2 file t 0 = 20:59 WIB): the dirt-bike jump over the valley ("misteri lompat dengan motor").
# Facecam-below layout, stream #9 cam (FACES['live9']). Cuts are in FILE seconds of windah-live9/stream-2059-2124.mp4 (p2).
# The first cut is a ~1.2 s teaser (frame 0 = the bike in the air, cinematic cam).
yt = 'zYTPbx83wCQ'
layout = 'face'; face = 'live9'
# source x704-1504, y410-860: the rider and the valley; leaves out the cinematic-cam hint text and the tutorial box (x<480), the
# 'Stunt Jumps' counter (x>1580) and the minimap (y>900); the cam (x>=1550) stays out
game = (704, 410, 800)
tag = 'WINDAH BASUDARA · GTA VI'
base = {'T': (208.7, 0), 'A': (200.75, 2.4), 'B': (206.8, 9.15), 'C': (214.7, 17.5)}
cuts = [('T', 209.30, 210.50),     # TEASER p2 3:29.3-3:30.5: the bike in the air over the valley (frame 0, cinematic cam)
        ('A', 201.35, 206.90),     # p2 3:21.35-3:26.9: "Misteri lompat dengan motor dan salto..." (the run-up to the ramp)
        ('B', 207.40, 214.55),     # p2 3:27.4-3:34.55: the jump from the cinematic cam, "gak bisa 2x" (landing)
        ('C', 215.30, 224.25)]     # p2 3:35.3-3:44.25: "Epic! ... Yes! ... stunt jumps 5 of 130 ... nice"
hours = {'T': 2, 'A': 2, 'B': 2, 'C': 2}
hook = ('MISTERI LOMPAT MOTOR', 'SALTO DI UDARA')
subs = [('A', 201.50, 203.90, 'MISTERI ' + P + 'LOMPAT' + V),
        ('A', 203.92, 205.10, 'DENGAN MOTOR'),
        ('A', 205.12, 206.85, 'DAN ' + P + 'SALTO' + V),
        ('B', 212.70, 214.50, 'NGGAK BISA ' + P + '2X' + V),
        ('C', 215.58, 216.60, P + 'EPIC' + V),
        ('C', 217.58, 218.20, P + 'YES' + V),
        ('C', 218.24, 221.26, 'STUNT JUMPS 5 / 130'),
        ('C', 223.32, 224.20, P + 'NICE' + V)]
labels = []
blurs = {}
freeze = 0; endcap = None
srcdesc = ("Source = .cache/wizzclip/windah-gtavi-lompat/source.mp4 (also Drive clip-src/windah-gtavi-lompat.mp4): four pieces (0.6 s padding each) of "
           "windah-live9/stream-2059-2124.mp4 (p2, file t 0 = 20:59 WIB) in output order, 1080p30 re-encoded and joined.")
beats = ("Beats in stream order: frame-0 teaser (p2 3:29, the bike in the air, cinematic cam, 1.2 s); 'misteri lompat dengan motor dan salto...' over the run-up (3:21); "
         "the jump from the cinematic cam and the landing, 'gak bisa 2x' (3:27-3:34); 'epic', 'yes', 'stunt jumps 5 of 130', 'nice' (3:35-3:44). "
         "Word timings from medium faster-whisper (the 'gak bisa 2x' line is a low-confidence transcription: check by ear). "
         "NOT USED: the run-up tail 5:45-6:27 (the recording ends mid run-up, no result) and the 'ritual setan' remarks (5:56). "
         "The game crop (704,410,800) leaves out the on-screen hint boxes and counters; no brand text, guns or revealing outfits in frame. "
         "The facecam crop (1568,516,352,264) stops above the chest logo on his shirt.")
what = "Windah rides a dirt bike to the 'lompat dengan motor' mystery and launches off a ramp over a valley: the cinematic-cam jump, 'epic', 'nice'."
