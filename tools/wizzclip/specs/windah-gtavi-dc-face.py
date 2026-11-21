# Same clip as windah-gtavi-dc (identical cuts, captions and hook) in the 'facecam below' layout (see windah_recipe.py).
# Source = the already built .cache/wizzclip/windah-gtavi-dc/source.mp4 (Drive clip-src/windah-gtavi-dc.mp4), so no new source file.
exec(open(os.path.join(SPECS, 'windah-gtavi-dc.py'), encoding='utf-8').read())
layout = 'face'; face = 'live3'; srcslug = 'windah-gtavi-dc'
srcdesc = (srcdesc.replace("Source = .cache/wizzclip/windah-gtavi-dc/source.mp4 (also Drive clip-src/windah-gtavi-dc.mp4)",
                           "Source = the dc source .cache/wizzclip/windah-gtavi-dc/source.mp4 (Drive clip-src/windah-gtavi-dc.mp4, shared with recipe windah-gtavi-dc)")
           + " Facecam-below layout (stream #3 cam, FACES['live3']).")
