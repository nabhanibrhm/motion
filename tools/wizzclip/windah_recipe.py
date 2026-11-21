"""Generate a Windah GTA VI short recipe (JSON + ASS) from a spec: tools/wizzclip/specs/<slug>.py.

Usage (repo root):  python tools/wizzclip/windah_recipe.py SLUG [LN|measure] [hook_fs]
  measure   print the loudnorm first-pass numbers for the clip's audio (paste them back as LN)
  LN        'measured_I=..:measured_TP=..:measured_LRA=..:measured_thresh=..:offset=..' for the two-pass loudnorm
  hook_fs   hook font size (default 68)
Writes tools/wizzclip/recipes/<slug>.{json,ass}; render with `python tools/wizzclip/wizzclip.py recipe <slug>`.
Never regenerate a recipe that was already posted: write a NEW spec/slug so old renders stay reproducible.
Env: WINDAH_SPECS (specs dir, default tools/wizzclip/specs), WINDAH_OUT (output dir, default tools/wizzclip/recipes; for tests).

A spec defines: yt, base, cuts, hook, subs, freeze, endcap, srcdesc, beats, what, optional blurs.
Optional: srcslug (reuse another clip's .cache/wizzclip/<srcslug>/source.mp4, default = slug),
          layout ('classic' default | 'face'), face, game,
          tag (credit line, default 'WINDAH BASUDARA · GTA VI'),
          labels = [(cutkey, start, end, 'TEXT'), ...] small Paper bridge labels (Audex 52 at y450, over the gameplay panel; same timing rules as subs).

Layouts (1080x1920 canvas, Ink #0E0F12 background, Volt/Paper text, campaign banner at y1417-1596, 4 s outro):
  classic  whole 16:9 source frame scaled to 1080x608 at y656 (Windah's corner facecam stays inside it);
           hook an2 at (540,600), subs centred at y960, tag at y1290.
  face     'facecam below': the gameplay is cropped tighter so the corner facecam falls outside it, and the facecam is
           cropped from the same source and shown below the gameplay. Keeps clear of TikTok's UI (bottom caption area
           y>1400, right icon column x>960): all content ends by y1392, nothing is wider than x276-804 below y990.
             hook   an2 at (540,318), Audex HS px, 2 lines
             tag    an8 at (540,326), 30 px (credit line between hook and gameplay)
             game   source crop (x,y,w) with h = w*9/16, default (0,0,1504) -> 1504x846, scaled to 1080x608, panel y364-972
             face   source crop (x,y,w,h), 4:3, scaled to 520x390 inside a 4 px Volt frame -> panel 528x398 at x276, y994-1392
             subs   an5 at (540,905): lower part of the gameplay panel, never over the face panel
           Use in a spec:  layout = 'face'; face = 'live4'      (a key of FACES below, or an explicit (x,y,w,h) tuple)
           Optional:       game = (x, y, w) for a different game crop (must stay left of the cam: x+w <= the cam's left edge);
                           e.g. game = (0, 64, 1488) for a letterboxed cutscene (black bars at source y0-62 and y1020-1080).
           Blurs outside the game crop are skipped. Pull a still (wizzclip.py frame / ffmpeg -ss) and check the cam
           position before using a stream that is not in the table.

Windah's facecam is baked into the stream recordings (bottom-right of the 1920x1080 frame, person keyed over the game
with no visible box). Measured 21 Nov 2026 on 12 stills per recording (windah-live3 = stream #3, windah-live4 = stream #4),
person extent in source px (x0-x1, head top - bottom edge):
  FACES key  recordings                                                    cam extent (person)       face crop (x,y,w,h)
  live4      windah-live4/stream-1832-1932, -1932-2032, -2032-2132,        x1550-1920, y570-890      (1480, 560, 440, 330)
             -2132-2224 (black tee; the cam box ends in a flat edge at
             y890 with game footage and HUD below it, so the crop stops there)
  live3      windah-live3/stream-2215-2315, -2315-0015, -0015-0017         x1420-1920, y690-1080     (1480, 686, 440, 330)
             (black polo; person reaches the frame bottom; hand/arm
             gestures reach x1420 near the bottom; cutscene letterbox bars
             cover y1018-1080, so the crop stops at y1016)
  live5      windah-live5/stream-1916-2016, -2016-2116, -2116-2216,    x1550-1920, y560-868      (1480, 538, 440, 330)
             -2216-2316, -2316-0014 (black tee; same spot as stream #4,
             but the flat bottom edge of the cam box is at y868, not 890,
             so the crop is moved up 22 px to stop on it; head top y570-600)
  All crops are 4:3 (440x330 -> 520x390, x1.18). Position inside a recording drifts a little (he leans); 48 + 30 spot
  checks across the recordings kept head and shoulders inside live3/live4, and 60 stills (12 per hour, all 5 hours of stream #5,
  22 Nov 2026) did for live5. Stream #4 moved the cam up and in compared with stream #3 (head top y570-650 vs y690-780).
  The default game crop (0,0,1504,846) is clear of all three cams (left edge x1550/x1420/x1550, the left-most hand gestures
  stay right of x1520; raised hands on his head can reach y~500 above the live5 crop, which is rare and cropped, not blurred).
"""
import json, sys, subprocess, re, os
from pathlib import Path
REPO = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
R = os.environ.get('WINDAH_OUT') or (HERE / 'recipes').as_posix()
R = R.rstrip('/') + '/'
SPECS = os.environ.get('WINDAH_SPECS') or (HERE / 'specs').as_posix()
FACES = {'live4': (1480, 560, 440, 330), 'live3': (1480, 686, 440, 330), 'live5': (1480, 538, 440, 330)}
# 'face' layout geometry (output px)
GAME_Y, FACE_X, FACE_Y, FACE_IW, FACE_IH, FACE_B = 364, 276, 994, 520, 390, 4
HOOK_Y, TAG_Y, SUB_Y = 318, 326, 905
LABEL_Y = 450
P = r'{\c&H00EFF3F4&}'; V = r'{\c&H0029FCE6&}'
slug = sys.argv[1]; arg = sys.argv[2] if len(sys.argv) > 2 else None
HS = int(sys.argv[3]) if len(sys.argv) > 3 else 68
blurs = {}; layout = 'classic'; face = None; game = None; srcslug = slug
tag = 'WINDAH BASUDARA · GTA VI'; labels = []
exec(open(os.path.join(SPECS, slug + '.py'), encoding='utf-8').read())
FACE_LAYOUT = layout == 'face'
if layout not in ('classic', 'face'):
    raise SystemExit(f'unknown layout {layout!r}')
if FACE_LAYOUT:
    if isinstance(face, str):
        face = FACES[face]
    if not face or len(face) != 4:
        raise SystemExit("layout 'face' needs face = (x,y,w,h) in source px or a FACES key (live3/live4/live5)")
    gx, gy, gw = game or (0, 0, 1504); gh = gw * 9 // 16
    if gw * 9 % 16:
        raise SystemExit('game crop width must be a multiple of 16')
    if face[2] * 3 != face[3] * 4:
        raise SystemExit('face crop must be 4:3')
    # blurs entirely outside the game crop are not visible: drop them
    blurs = {i: b for i, b in blurs.items() if not (b[2] >= gx + gw or b[2] + b[0] <= gx or b[3] >= gy + gh or b[3] + b[1] <= gy)}
hook_y, tag_y, sub_y = (HOOK_Y, TAG_Y, SUB_Y) if FACE_LAYOUT else (600, 1290, 960)
# --- timeline
def loc(k, t): b, l = base[k]; return round(l + t - b, 3)
outs = []; o = 0.0
for k, s, e in cuts:
    outs.append(round(o, 2)); o = round(o + e - s, 2)
main = round(o + freeze, 2)

# out-of-order cuts get their own seeked input
order = [loc(k, s) for k, s, e in cuts]
inputs = [{"path": "source", "args": ["-threads", "3"]}, {"path": "campaign:watermark-windah-gtavi.png"},
          {"path": "campaign:../../../../.cache/wizzclip/windah-gtavi/GTAVI_OutroVideo.mov"}]
src_of = []; last = -1
for i, (k, s, e) in enumerate(cuts):
    a, b = loc(k, s), loc(k, e)
    later_needed = any(order[j] < a for j in range(i + 1, len(cuts)))
    if later_needed:  # this cut comes before earlier source material: seek it separately
        ss = int(a)
        inputs.append({"path": "source", "args": ["-threads", "3", "-ss", str(ss), "-t", str(int(b - ss) + 2)]})
        src_of.append((len(inputs) - 1, a - ss, b - ss))
    else:
        src_of.append((0, a, b))

def t(x):
    m, s = divmod(x, 60); return f"0:{int(m):02d}:{s:05.2f}"
B = chr(92)
ass = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Hook,Audex,92,&H0029FCE6,&H0029FCE6,&H00120F0E,&H00120F0E,0,0,0,0,100,100,0,0,1,0,0,5,60,60,0,1
Style: Sub,Audex,72,&H0029FCE6,&H0029FCE6,&H00120F0E,&H00120F0E,0,0,0,0,100,100,0,0,1,7,3,5,60,60,0,1
Style: Tag,Audex,30,&H0099908C,&H0099908C,&H00120F0E,&H00120F0E,0,0,0,0,100,100,0,0,1,0,0,5,60,60,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,{t(0)},{t(main)},Hook,,0,0,0,,{{{B}an2{B}pos(540,{hook_y}){B}fs{HS}}}{{{B}c&H00EFF3F4&}}{hook[0]}{B}N{{{B}c&H0029FCE6&}}{hook[1]}
Dialogue: 0,{t(0)},{t(main)},Tag,,0,0,0,,{{{B}an8{B}pos(540,{tag_y})}}{tag}
"""
for k, s, e, x in subs:
    for i, (ck, cs, ce) in enumerate(cuts):
        if ck == k and cs - 0.05 <= s < ce:
            os_ = outs[i] + max(0, s - cs); oe = outs[i] + min(e, ce) - cs
            ass += f"Dialogue: 1,{t(os_)},{t(oe)},Sub,,0,0,0,,{{{B}an5{B}pos(540,{sub_y})}}{x}\n"; break
    else:
        raise SystemExit(f'caption outside cuts: {x}')
for k, s, e, x in labels:
    for i, (ck, cs, ce) in enumerate(cuts):
        if ck == k and cs - 0.05 <= s < ce:
            os_ = outs[i] + max(0, s - cs); oe = outs[i] + min(e, ce) - cs
            ass += f"Dialogue: 2,{t(os_)},{t(oe)},Sub,,0,0,0,,{{{B}an5{B}pos(540,{LABEL_Y}){B}fs52}}{{{B}c&H00EFF3F4&}}{x}\n"; break
    else:
        raise SystemExit(f'label outside cuts: {x}')
if endcap:
    ass += f"Dialogue: 1,{t(main - freeze - 0.4)},{t(main)},Sub,,0,0,0,,{{{B}an5{B}pos(540,{sub_y})}}{endcap}\n"
open(R + slug + '.ass', 'w', encoding='utf-8', newline='\n').write(ass)

fc = []; afc = []

n = len(cuts)
for i, ((k, s, e), (inp, a, b)) in enumerate(zip(cuts, src_of), 1):
    pad = f",tpad=stop_mode=clone:stop_duration={freeze}" if (i == n and freeze) else ""
    if i in blurs:
        w, h, x, y, st = blurs[i]
        fc.append(f"[{inp}:v]trim={a:.2f}:{b:.2f},setpts=PTS-STARTPTS,fps=30,split=2[b{i}a][b{i}b];")
        fc.append(f"[b{i}b]crop={w}:{h}:{x}:{y},boxblur=luma_radius={min(30, min(w, h) // 4 - 1)}:luma_power=3[b{i}c];")
        fc.append(f"[b{i}a][b{i}c]overlay={x}:{y}:enable='gte(t,{st:.2f})'{pad}[v{i}];")
    else:
        fc.append(f"[{inp}:v]trim={a:.2f}:{b:.2f},setpts=PTS-STARTPTS,fps=30{pad}[v{i}];")
for i, ((k, s, e), (inp, a, b)) in enumerate(zip(cuts, src_of), 1):
    d = round(e - s, 2)
    pad = f",apad=pad_dur={freeze}" if (i == n and freeze) else ""
    afc.append(f"[{inp}:a]atrim={a:.2f}:{b:.2f},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.04,afade=t=out:st={d - 0.1:.2f}:d=0.1{pad}[a{i}];")
fc += afc
fc.append(''.join(f"[v{i}][a{i}]" for i in range(1, n + 1)) + f"concat=n={n}:v=1:a=1[cv][ca];")
if FACE_LAYOUT:
    fx, fy, fw, fh = face
    fc += [f"[cv]split=2[cg][cf];",
           f"[cg]crop={gw}:{gh}:{gx}:{gy},scale=1080:608:flags=lanczos,pad=1080:1920:0:{GAME_Y}:color=0x0E0F12,format=yuv420p[gm];",
           f"[cf]crop={fw}:{fh}:{fx}:{fy},scale={FACE_IW}:{FACE_IH}:flags=lanczos,"
           f"pad={FACE_IW + 2 * FACE_B}:{FACE_IH + 2 * FACE_B}:{FACE_B}:{FACE_B}:color=0xE6FC29,format=yuv420p[fc];",
           f"[gm][fc]overlay={FACE_X}:{FACE_Y}:shortest=1,format=yuv420p[stk];"]
else:
    fc += ["[cv]scale=1080:608:flags=lanczos,pad=1080:1920:0:656:color=0x0E0F12,format=yuv420p[stk];"]
fc += ["[stk]subtitles={ass}:fontsdir={fontsdir}[subd];",
       "[subd][1:v]overlay=0:0,format=yuv420p,setsar=1[vm];",
       "[2:v]scale=1080:1920,fps=30,setsar=1,format=yuv420p[vo];",
       "[ca]aresample=48000,aformat=channel_layouts=stereo[am];",
       "[2:a]atrim=0:4.0,asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo[ao];",
       "[vm][am][vo][ao]concat=n=2:v=1:a=1[v][ra];"]

if arg == 'measure':
    src = f'{REPO.as_posix()}/.cache/wizzclip/{srcslug}/source.mp4'
    cmd = ['ffmpeg', '-hide_banner', '-nostats', '-threads', '3']
    for inp in inputs:
        p = src if inp['path'] == 'source' else inp['path'].replace('campaign:', f'{REPO.as_posix()}/tools/wizzclip/campaigns/motionklip/')
        cmd += [x for x in inp.get('args', []) if x not in ('-threads', '3')] + ['-i', p]
    g = ''.join(afc) + ''.join(f"[a{i}]" for i in range(1, n + 1)) + f"concat=n={n}:v=0:a=1,aresample=48000,aformat=channel_layouts=stereo[am];" \
        + "[2:a]atrim=0:4.0,asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo[ao];[am][ao]concat=n=2:v=0:a=1,loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json[a]"
    r = subprocess.run(cmd + ['-filter_complex', g, '-map', '[a]', '-f', 'null', '-'], capture_output=True, text=True)
    m = re.search(r"\{[^{}]*input_i[^{}]*\}", r.stderr, re.S)
    if not m: print(r.stderr[-3000:]); raise SystemExit(1)
    j = json.loads(m.group(0))
    print(f"measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}")
    raise SystemExit

LN = arg
fc.append(f"[ra]loudnorm=I=-14:TP=-1.0:LRA=11:{LN}:linear=true,asetpts=N/SR/TB[a]" if LN else "[ra]loudnorm=I=-14:TP=-1.0:LRA=11,asetpts=N/SR/TB[a]")
cutdesc = '; '.join(f"{k} t {s:.2f}-{e:.2f} = local {loc(k, s):.2f}-{loc(k, e):.2f} -> output {outs[i]:.2f}-{outs[i] + e - s:.2f}" + (f" (seeked input {src_of[i][0]})" if src_of[i][0] else '')
                    for i, (k, s, e) in enumerate(cuts))
if FACE_LAYOUT:
    lay = (f"Facecam-below layout (windah_recipe.py layout 'face'): gameplay = source crop {gw}x{gh} at ({gx},{gy}) scaled to 1080x608 at y{GAME_Y} (the corner facecam is outside the crop, no blur), "
           f"Windah's facecam = source crop {fw}x{fh} at ({fx},{fy}) scaled to {FACE_IW}x{FACE_IH} in a {FACE_B} px Volt frame, centred at x{FACE_X}, y{FACE_Y}-{FACE_Y + FACE_IH + 2 * FACE_B}, clear of TikTok's bottom caption area and right icon column; "
           f"hook line 1 Paper '{hook[0]}', line 2 Volt '{hook[1]}', Audex {HS}, bottom-anchored at y{HOOK_Y}; credit tag y{TAG_Y}; subs at y{SUB_Y} over the lower gameplay panel.")
else:
    lay = f"Clean layout as windah-gtavi-sepatu; hook line 1 Paper '{hook[0]}', line 2 Volt '{hook[1]}', Audex {HS}."
desc = (what + ' ' + srcdesc + ' Cuts: ' + cutdesc + '. ' + beats +
        f" Main {main:.2f} s + 4.0 s outro. Short format (user, 19 Nov: clips 45-60 s lost viewers at ~10 s, so aim for 20-30 s, payoff first). {lay} "
        "Word timings from faster-whisper medium on boosted audio. Cuts on input 0 stay in source order; an earlier-shown later moment has its own seeked input.")
rec = {"description": desc, "campaign": "motionklip", "campaign_brief": "Windah GTA VI",
       "source": {"slug": srcslug, "youtube": yt, "url": "https://www.youtube.com/watch?v=" + yt, "section": None},
       "inputs": inputs, "subtitles": slug + '.ass', "fontsdir": "tools/wizzclip/fonts", "fonts": ["Audex-Regular.ttf"],
       "filter_complex": fc, "output": slug + '.mp4'}
open(R + slug + '.json', 'w', encoding='utf-8', newline='\n').write(json.dumps(rec, indent=2, ensure_ascii=False) + '\n')
print(slug, 'main', main, 'outs', outs, 'inputs', [(i['args'] if 'args' in i else '') for i in inputs])
