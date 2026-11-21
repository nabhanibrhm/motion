# Same clip as windah-gtavi-ganteng (identical cuts, captions and hook) in the 'facecam below' layout (see windah_recipe.py).
# Source = the already built .cache/wizzclip/windah-gtavi-ganteng/source.mp4 (Drive clip-src/windah-gtavi-ganteng.mp4), so no new source file.
exec(open(os.path.join(SPECS, 'windah-gtavi-ganteng.py'), encoding='utf-8').read())
layout = 'face'; face = 'live4'; srcslug = 'windah-gtavi-ganteng'
# the Brian cutscene is letterboxed (black bars at source y0-62 and y1020-1080): start the game crop below the top bar
game = (0, 64, 1488)
# the cutscene subtitle strip that ganteng blurs sits at source y925-1005, below the 1488x837 game crop: no blur needed
blurs = {}
srcdesc = (srcdesc.replace("Source = .cache/wizzclip/windah-gtavi-ganteng/source.mp4 (also Drive clip-src/windah-gtavi-ganteng.mp4)",
                           "Source = the ganteng source .cache/wizzclip/windah-gtavi-ganteng/source.mp4 (Drive clip-src/windah-gtavi-ganteng.mp4, shared with recipe windah-gtavi-ganteng)")
           + " TEST of the facecam-below layout (stream #4 cam, FACES['live4']).")
beats = beats.replace("The cutscene subtitle strip (source px x400-1520 y925-1005; one line reads 'Patron: Dickheads') is box-blurred for the whole clip.",
                      "The cutscene subtitle strip (source px x400-1520 y925-1005; one line reads 'Patron: Dickheads') lies below the gameplay crop (y64-901), so no blur is needed.")
