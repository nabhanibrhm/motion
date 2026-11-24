# NSFW EXTRA (user-approved): Windah GTA VI stream #9 (yt zYTPbx83wCQ, 24 Nov 2026; h1 file t 0 = 19:59 WIB): the demon-realm finale, "Gua jadi raja Iblis, serius".
# Facecam-below layout, stream #9 cam (FACES['live9']). Cuts are in FILE seconds of windah-live9/stream-1959-2059.mp4 (h1).
yt = 'zYTPbx83wCQ'
layout = 'face'; face = 'live9'
# source x256-1504, y0-702: drops the creature bodies at the left edge of the fire cave (x<256); the cam (x>=1550) stays out
game = (256, 0, 1248)
tag = 'WINDAH BASUDARA · GTA VI · NSFW'
base = {'A': (3499.6, 0), 'B': (3529.7, 9.0), 'C': (3533.8, 14.2)}
cuts = [('A', 3500.20, 3508.00),    # h1 58:20.2-58:28: Jason fires into the fire cave, "item gendut, hati-hati" (shotgun, arms and muzzle flash blurred)
        ('B', 3530.30, 3534.30),    # h1 58:50.3-58:54.3: cutscene (Jason's face, blurry), "oke oke, we won ... mystery Iblis, ga?" (the red boss at 58:41-58:47 and the black screen are left out)
        ('C', 3534.40, 3538.88)]    # h1 58:54.4-58:58.9: "iya bener, berarti yang one-hit kill itu yang gendut item tuh. Gua jadi raja Iblis, serius." over the throne (ends before Jason turns)
hours = {k: 1 for k, s, e in cuts}
hook = ('GUA JADI RAJA IBLIS', 'SERIUS')
subs = [('A', 3505.36, 3506.55, 'GENDUT ITEM,'),
        ('A', 3506.56, 3507.80, P + 'HATI-HATI' + V),
        ('B', 3530.42, 3531.90, 'OKE, OKE, ' + P + 'WE WON' + V),
        ('B', 3532.00, 3534.25, 'MISTERI ' + P + 'IBLIS' + V + ', GA?'),
        ('C', 3534.50, 3535.28, 'IYA BENER, BERARTI'),
        ('C', 3535.30, 3535.98, 'YANG ONE-HIT KILL'),
        ('C', 3536.00, 3537.25, 'YANG GENDUT ITEM TUH'),
        ('C', 3537.28, 3538.55, P + 'GUA JADI RAJA IBLIS,' + V),
        ('C', 3538.56, 3538.86, P + 'SERIUS' + V)]
labels = []
# A: shotgun, raised arms and muzzle flash (source x480-960, y330-660 covers every position over the cut, 1-based cut index A1 B2 C3)
blurs = {1: (480, 330, 480, 330, 0)}
freeze = 0; endcap = None
srcdesc = ("Source = .cache/wizzclip/windah-gtavi-rajaiblis/source.mp4 (also Drive clip-src/windah-gtavi-rajaiblis.mp4): three pieces (0.6 s padding each) of "
           "windah-live9/stream-1959-2059.mp4 (h1, file t 0 = 19:59 WIB) in output order, 1080p30 re-encoded and joined.")
beats = ("NSFW EXTRA (violence/horror theme, user-approved): demon-realm finale in stream order: Jason fires into the fire cave, 'item gendut, hati-hati' (h1 58:20-58:28); "
         "after the boss dies and the black screen, the cutscene 'oke oke, we won ... mystery Iblis, ga?' (58:50-58:54); "
         "'iya bener, berarti yang one-hit kill itu yang gendut item tuh. Gua jadi raja Iblis, serius.' over the throne shot (58:54-58:59). "
         "Word timings from medium faster-whisper (chat spike #9 58:52 'gg' x91, loudest audio peak of the stream at 58:47 is in the dropped boss cut). "
         "BLURRED: the shotgun, Jason's raised arms and the muzzle flash in cut A (box source x480-960, y330-660 for the whole cut); the creature bodies at the left edge of the cave are cropped out (game crop starts at x256). "
         "DROPPED: the red horned boss and its gore close-ups (58:41-58:47: bodies and claws fill the frame, blur cannot hide it) and the black screen (58:47-58:50); "
         "the clip ends before Jason turns (58:59), whose shirt print reads 'Horny Devil Tour' and a tour list; 'oke what now' (59:01-59:04 afterwards) is left out. "
         "No swearing in the cuts; no nudity. The facecam is sharp, its crop stops above the chest logo.")
what = "NSFW extra: Windah wins the demon-realm fight and, over the throne, says 'Gua jadi raja Iblis, serius.'"
