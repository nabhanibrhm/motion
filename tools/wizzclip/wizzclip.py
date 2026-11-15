#!/usr/bin/env python
"""wizzclip: 16:9 stream VOD -> vertical YouTube Shorts clips."""
import argparse, hashlib, json, os, re, statistics, subprocess, sys, textwrap, wave
from pathlib import Path

TOOL = Path(__file__).resolve().parent
REPO = TOOL.parents[1]  # motion repo root
WORK = REPO / ".cache" / "wizzclip"  # git-ignored scratch per slug
OUT = REPO / "out" / "wizzclip"  # finished clips (out/ is Drive-synced)
CFG = TOOL / "config"
RECIPES = TOOL / "recipes"
CAMPAIGNS = TOOL / "campaigns"
FONTS = WORK / "_fonts"  # proprietary Arial Black / Impact for the recipe .ass files; never committed
W, H = 1080, 1920
FONT = "Audex"  # tools/wizzclip/fonts/Audex-Regular.ttf, one weight: never set Bold/Italic (no faux bold)
FONTS_BRAND = TOOL / "fonts"
# Wizz Clip brand colours as ASS &HBBGGRR&: Ink #0E0F12, Mist #8C9099, Paper #F4F3EF, Volt #E6FC29 (the one accent)
INK, MIST, PAPER, VOLT = "&H00120F0E", "&H0099908C", "&H00EFF3F4", "&H0029FCE6"
VOLT_T, PAPER_T = r"{\c&H29FCE6&}", r"{\c&HEFF3F4&}"  # inline colour overrides


def die(msg):
    sys.exit(f"error: {msg}")


def tsec(s):
    """'90', '1:30', '01:01:30.5' -> seconds."""
    p = [float(x) for x in str(s).split(":")]
    return sum(v * 60 ** i for i, v in enumerate(reversed(p)))


def mmss(t):
    return f"{int(t) // 60:02d}:{int(t) % 60:02d}"


def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace", **kw)
    if r.returncode:
        die(f"{cmd[0]} failed:\n{r.stderr[-1500:]}")
    return r


def wdir(slug):
    d = WORK / slug
    d.mkdir(parents=True, exist_ok=True)
    return d


def source(slug):
    p = wdir(slug) / "source.mp4"
    if not p.exists():
        die(f"{p} not found (run fetch first)")
    return p


def probe(p):
    r = run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:format=duration",
             "-of", "json", str(p)])
    j = json.loads(r.stdout)
    return j["streams"][0]["width"], j["streams"][0]["height"], float(j["format"]["duration"])


def load_json(p, default):
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else default


# ---------------------------------------------------------------- fetch / frame / streamer
def cmd_fetch(a):
    slug = a.name or "vod-" + hashlib.md5(a.url.encode()).hexdigest()[:6]
    out = wdir(slug)
    cmd = [sys.executable, "-m", "yt_dlp", "-f",
           "bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[height<=1080][ext=mp4]/b[height<=1080]",
           "--merge-output-format", "mp4", "-o", str(out / "source.%(ext)s"), "--no-playlist",
           "--js-runtimes", "node"]  # YouTube needs a JS runtime; Node is installed for motion
    if a.from_ or a.to:
        cmd += ["--download-sections", f"*{a.from_ or '0'}-{a.to or 'inf'}", "--force-keyframes-at-cuts"]
    subprocess.run(cmd + [a.url], check=True)
    print(f"saved {out / 'source.mp4'}\nnext: python tools/wizzclip/wizzclip.py find {slug}")


def cmd_frame(a):
    t = tsec(a.at)
    out = wdir(a.slug) / f"frame-{a.at.replace(':', '-')}.png"
    run(["ffmpeg", "-y", "-v", "error", "-ss", str(t), "-i", str(source(a.slug)), "-frames:v", "1", str(out)])
    print(out)


def cmd_streamer(a):
    p = CFG / "streamers.json"
    db = load_json(p, {})
    if a.action == "add":
        if not a.name or not a.facecam:
            die("streamer add <name> --facecam x,y,w,h")
        rect = [int(v) for v in a.facecam.split(",")]
        if len(rect) != 4:
            die("--facecam needs x,y,w,h")
        db[a.name] = {"facecam": rect, "credit": a.credit or a.name}
        if a.focus is not None:
            db[a.name]["focus"] = a.focus
        p.write_text(json.dumps(db, indent=2), encoding="utf-8")
        print(f"saved {a.name}: {db[a.name]}")
    else:
        for n, v in db.items():
            print(f"{n:15} facecam={v['facecam']} credit={v['credit']}")


# ---------------------------------------------------------------- transcript / loudness / find
def transcribe(slug, lang, model):
    tp = wdir(slug) / "transcript.json"
    if tp.exists():
        return json.loads(tp.read_text(encoding="utf-8"))
    import numpy as np
    from faster_whisper import WhisperModel
    print(f"transcribing with whisper '{model}' (cpu, int8) ...")
    m = WhisperModel(model, device="cpu", compute_type="int8")
    wav = wdir(slug) / "audio16k.wav"  # decode with ffmpeg; avoids PyAV version issues
    run(["ffmpeg", "-y", "-v", "error", "-i", str(source(slug)), "-vn", "-ac", "1", "-ar", "16000", str(wav)])
    with wave.open(str(wav)) as wf:
        audio = np.frombuffer(wf.readframes(wf.getnframes()), np.int16).astype(np.float32) / 32768
    segs, info = m.transcribe(audio, language=None if lang == "auto" else lang,
                              word_timestamps=True, vad_filter=True)
    words, segments = [], []
    for s in segs:
        segments.append({"s": s.start, "e": s.end, "text": s.text.strip()})
        words += [{"w": w.word.strip(), "s": w.start, "e": w.end} for w in s.words or []]
    data = {"language": info.language, "words": words, "segments": segments}
    tp.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    return data


def loudness(slug):
    """Per-second RMS level (dB) via astats."""
    lp = wdir(slug) / "loudness.json"
    if lp.exists():
        return json.loads(lp.read_text())
    r = run(["ffmpeg", "-v", "error", "-i", str(source(slug)), "-vn", "-af",
             "aresample=16000,asetnsamples=n=16000:p=0,astats=metadata=1:reset=1,"
             "ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-", "-f", "null", "-"])
    vals = [float(m) if m not in ("-inf", "inf") else -90.0
            for m in re.findall(r"RMS_level=(\S+)", r.stdout)]
    lp.write_text(json.dumps(vals))
    return vals


def norm(w):
    return re.sub(r"[^\w']", "", w.lower())


def find_candidates(words, rms, dur, lang, lo, hi, top):
    n = int(dur) + 1
    rms = (rms + [-90.0] * n)[:n]
    # loudness spike vs rolling median (61 s)
    spike = []
    for i in range(n):
        seg = rms[max(0, i - 30): i + 31]
        spike.append(max(0.0, min(rms[i] - statistics.median(seg), 15.0)) / 5.0)
    density = [0.0] * n
    for w in words:
        density[min(int(w["s"]), n - 1)] += 1
    density = [min(d / 3.0, 1.5) for d in density]
    kws = load_json(CFG / "keywords.json", {})
    klist = [k for lg, v in kws.items() if lang in ("auto", lg) for k in v]
    toks = [norm(w["w"]) for w in words]
    kwsec, kwhits = [0.0] * n, [[] for _ in range(n)]
    for k in klist:
        kt = [norm(x) for x in k.split()]
        for i in range(len(toks) - len(kt) + 1):
            if toks[i:i + len(kt)] == kt:
                s = min(int(words[i]["s"]), n - 1)
                kwsec[s] += 1.5
                kwhits[s].append(k)
    per = [spike[i] + density[i] + kwsec[i] for i in range(n)]
    pre = [0.0]
    for v in per:
        pre.append(pre[-1] + v)

    def snap(t, edge):
        """Move t to a nearby sentence/word gap."""
        if not words:
            return t
        best = None
        for i, w in enumerate(words):
            if edge == "start":
                x = w["s"]
                gap = x - words[i - 1]["e"] if i else 9
                punct = i and words[i - 1]["w"][-1:] in ".?!"
            else:
                x = w["e"]
                gap = (words[i + 1]["s"] - x) if i + 1 < len(words) else 9
                punct = w["w"][-1:] in ".?!"
            if abs(x - t) <= 3:
                cost = abs(x - t) - (1.5 if gap >= 0.35 or punct else 0)
                if best is None or cost < best[0]:
                    best = (cost, x)
        x = best[1] if best else t
        return max(0.0, x - 0.25) if edge == "start" else min(dur, x + 0.3)

    cands = []
    for L in sorted({lo, (lo + hi) // 2, hi}):
        for s in range(0, max(1, n - L + 1), 2):
            e = min(n, s + L)
            seg = per[s:e]
            peak = max(sum(seg[j:j + 5]) / 5 for j in range(max(1, len(seg) - 4)))
            cands.append(((pre[e] - pre[s]) / max(1, e - s) + 0.4 * peak, s, e))
    cands.sort(reverse=True)
    chosen = []
    for score, s, e in cands:
        if any(min(e, ce) - max(s, cs) > 0.3 * (e - s) for _, cs, ce, *_ in chosen):
            continue
        a, b = snap(s, "start"), snap(e, "end")
        if b - a > hi + 4 or b - a < lo - 4:
            a, b = float(s), float(e)
        reasons = []
        pk = max(range(s, min(e, n)), key=lambda i: spike[i])
        if spike[pk] > 0.4:
            reasons.append(f"loud +{spike[pk] * 5:.0f}dB @{mmss(pk)}")
        hits = sorted({k for i in range(s, min(e, n)) for k in kwhits[i]})
        if hits:
            reasons.append("kw: " + ",".join(hits[:6]))
        reasons.append(f"speech {sum(density[s:e]) * 3 / max(1, e - s):.1f} w/s")
        text = " ".join(w["w"] for w in words if a <= w["s"] <= b)
        chosen.append((score, s, e, a, b, reasons, text))
        if len(chosen) >= top:
            break
    return [{"rank": i + 1, "start": round(a, 2), "end": round(b, 2), "score": round(sc, 2),
             "reasons": r, "text": t} for i, (sc, _, _, a, b, r, t) in enumerate(chosen)]


def cmd_find(a):
    d = wdir(a.slug)
    _, _, dur = probe(source(a.slug))
    tr = transcribe(a.slug, a.lang, a.model)
    lang = a.lang if a.lang != "auto" else tr.get("language", "auto")
    cands = find_candidates(tr["words"], loudness(a.slug), dur, lang if lang in ("id", "en") else "auto",
                            a.min, a.max, a.top)
    (d / "candidates.json").write_text(json.dumps(cands, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{'#':>2} {'start':>8} {'end':>8} {'len':>4} {'score':>5}  reasons / text")
    for c in cands:
        print(f"{c['rank']:>2} {mmss(c['start']):>8} {mmss(c['end']):>8} {c['end'] - c['start']:4.0f} {c['score']:5.2f}"
              f"  {'; '.join(c['reasons'])}\n{'':32}\"{c['text'][:90]}\"")
    print(f"\nwrote {d / 'candidates.json'}\nnext: python tools/wizzclip/wizzclip.py cut {a.slug} --start <t> --end <t> --layout stack")


# ---------------------------------------------------------------- captions
def group_words(words, max_words=3, max_chars=22):
    """words: [(text, start, end)] -> list of groups of 2-4 words."""
    groups, cur = [], []
    for w in words:
        if cur and (len(cur) >= max_words or w[1] - cur[-1][2] > 0.7
                    or len(" ".join(x[0] for x in cur + [w])) > max_chars):
            groups.append(cur)
            cur = []
        cur.append(w)
        if w[0][-1:] in ".?!,":
            groups.append(cur)
            cur = []
    if cur:
        groups.append(cur)
    return groups


def parse_srt(p):
    out = []
    for blk in re.split(r"\n\s*\n", Path(p).read_text(encoding="utf-8-sig").strip().replace("\r", "")):
        ln = blk.split("\n")
        i = next((k for k, x in enumerate(ln) if "-->" in x), None)
        if i is not None:
            m = re.match(r"\s*(\S+)\s*-->\s*(\S+)", ln[i])
            out.append((tsec(m[1].replace(",", ".")), tsec(m[2].replace(",", ".")), " ".join(ln[i + 1:])))
    return out


def srt_words(cues):
    """Spread each cue's words over its duration by character count; max 4 words per group."""
    groups = []
    for s, e, txt in cues:
        ws = txt.split()
        if not ws:
            continue
        tot, t, g = sum(len(w) + 1 for w in ws), s, []
        for w in ws:
            d = (e - s) * (len(w) + 1) / tot
            g.append((w, t, t + d))
            t += d
        for i in range(0, len(g), 4):
            groups.append(g[i:i + 4])
    return groups


def ts_ass(t):
    return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"


def ts_srt(t):
    ms = round(max(t, 0) * 1000)
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def clean(t):
    return re.sub(r"[{}\\]", "", t).upper()


HOOK_LH = 60  # approx rendered line height of the 76 px Audex Title style (measured on a still)


def hook_lines(title, width=18):
    """Wrap the hook at `width` chars; words wrapped in *asterisks* (one or several) turn Volt."""
    ws, hl, on = [], [], False
    for raw in title.split():
        if raw.startswith("*"):
            on = True
        ws.append(clean(raw.strip("*")))
        hl.append(on)
        if raw.endswith("*"):
            on = False
    rows, cur = [], []
    for w, h in zip(ws, hl):
        if cur and len(" ".join(x for x, _ in cur + [(w, h)])) > width:
            rows.append(cur)
            cur = []
        cur.append((w, h))
    if cur:
        rows.append(cur)
    return r"\N".join(" ".join(VOLT_T + w + PAPER_T if h else w for w, h in r) for r in rows)


def build_ass(groups, dur, cap_y, title, credit, title_y=330):
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2

[V4+ Styles]
Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding
Style: Cap,{FONT},84,{PAPER},{PAPER},{INK},&H80{INK[4:]},0,0,0,0,100,100,0,0,1,9,2,5,40,40,0,1
Style: Title,{FONT},76,{PAPER},{PAPER},{INK},{INK},0,0,0,0,100,100,0,0,1,26,0,5,60,60,0,1
Style: Brand,{FONT},34,{MIST},{MIST},{INK},{INK},0,0,0,0,100,100,0,0,1,16,0,5,40,40,0,1

[Events]
Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text
"""
    ev = []
    for gi, g in enumerate(groups):
        nxt = groups[gi + 1][0][1] if gi + 1 < len(groups) else dur
        for i, (_, s, _e) in enumerate(g):
            end = g[i + 1][1] if i + 1 < len(g) else min(g[-1][2] + 0.15, nxt)  # never overlap next group
            txt = " ".join((VOLT_T + clean(w[0]) + PAPER_T) if j == i else clean(w[0]) for j, w in enumerate(g))
            ev.append(f"Dialogue: 1,{ts_ass(max(s, 0))},{ts_ass(end)},Cap,,0,0,0,,{{\\pos({W // 2},{cap_y})}}{txt}")
    if title:  # Paper text on an Ink rounded box (thick round-joined Ink outline); *key word* turns Volt
        lines = hook_lines(title)
        ev.append(f"Dialogue: 2,{ts_ass(0)},{ts_ass(min(3, dur))},Title,,0,0,0,,"
                  f"{{\\pos({W // 2},{title_y})\\fad(150,250)}}{lines}")
        # short Volt cut line under the box: box half-height ~ lines * HOOK_LH/2 + 26 px outline
        ly = int(title_y + (lines.count(r"\N") + 1) * HOOK_LH / 2 + 26 + 16)
        ev.append(f"Dialogue: 3,{ts_ass(0)},{ts_ass(min(3, dur))},Title,,0,0,0,,"
                  f"{{\\an7\\pos({W // 2 - 60},{ly})\\fad(150,250)\\bord0\\shad0\\c&H{VOLT[4:]}&\\p1}}m 0 0 l 120 0 120 8 0 8")
    # no burned-in brand text: the YouTube channel watermark (out/design/wizz-clip-watermark.png) covers it
    if credit:  # "SUMBER: @credit" in Mist on an Ink pill (thick Ink outline)
        ev.append(f"Dialogue: 0,{ts_ass(0)},{ts_ass(dur)},Brand,,0,0,0,,{{\\pos({W // 2},1800)}}{clean(credit)}")
    return head + "\n".join(ev) + "\n"


# ---------------------------------------------------------------- cut
def mute_filter(ranges):
    f = []
    for r in ranges:
        a, b = (float(x) for x in r.split("-"))
        f.append(f"volume='1-clip(min(t-{a - 0.05:.3f},{b + 0.05:.3f}-t)/0.05,0,1)':eval=frame")
    return ",".join(f)


def cmd_cut(a):
    src = source(a.slug)
    sw, sh, sdur = probe(src)
    start, end = tsec(a.start), min(tsec(a.end), sdur)
    dur = end - start
    if dur <= 0:
        die("end must be after start")
    d = wdir(a.slug)
    preset = load_json(CFG / "streamers.json", {}).get(a.streamer) if a.streamer else None
    if a.layout == "stack" and not preset:
        die("--layout stack needs --streamer <preset> (streamer add ...)")

    out_dir = OUT
    out_dir.mkdir(parents=True, exist_ok=True)
    n = 1
    while (out_dir / f"{a.slug}-{n:02d}.mp4").exists():
        n += 1
    out = out_dir / (f"{a.out}.mp4" if a.out else f"{a.slug}-{n:02d}.mp4")
    srt_out = d / f"clip-{n:02d}.srt"

    if a.srt:
        groups = srt_words(parse_srt(a.srt))
    else:
        tr = load_json(d / "transcript.json", None)
        if not tr:
            die("no transcript.json (run find first) or pass --srt")
        ws = [(w["w"], w["s"] - start, w["e"] - start) for w in tr["words"]
              if w["s"] >= start - 0.05 and w["e"] <= end + 0.05]
        groups = group_words(ws)
        srt_out.write_text("".join(
            f"{i}\n{ts_srt(g[0][1])} --> {ts_srt(g[-1][2])}\n{' '.join(x[0] for x in g)}\n\n"
            for i, g in enumerate(groups, 1)), encoding="utf-8")
        print(f"editable captions: {srt_out}")
    cap_y = int(H * (0.72 if a.layout == "blur" else 0.62))
    credit = f"Sumber: {preset['credit'] if preset else a.streamer}" if a.streamer else ""
    top = round(H * 0.38)
    title_y = top if a.layout == "stack" else 330  # stack: hook sits on the facecam/gameplay seam
    (d / "clip.ass").write_text(build_ass(groups, dur, cap_y, a.title, credit, title_y), encoding="utf-8")

    if a.layout == "stack":
        sc = sw / 1920
        x, y, w, h = (round(v * sc) for v in preset["facecam"])
        focus = a.focus if a.focus is not None else preset.get("focus", 0.5)
        # facecam fitted (not cropped) over a blurred fill, so cut-out cams keep the whole head
        vf = (f"[0:v]split=2[f][g];[f]crop={w}:{h}:{x}:{y},split=2[fa][fb];"
              f"[fa]scale={W}:{top}:force_original_aspect_ratio=increase,crop={W}:{top},boxblur=20:4,eq=brightness=-0.15[fbg];"
              f"[fb]scale={W}:{top}:force_original_aspect_ratio=decrease[ffg];[fbg][ffg]overlay=(W-w)/2:(H-h)/2[top];"
              f"[g]scale=-2:{H - top},crop={W}:{H - top}:(iw-{W})*{focus:.3f}:0[bot];[top][bot]vstack[v0]")
    elif a.layout == "blur":
        vf = (f"[0:v]split=2[a][b];[a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
              f"boxblur=25:5,eq=brightness=-0.1[bg];[b]scale={W}:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2[v0]")
    else:
        vf = f"[0:v]scale=-2:{H},crop={W}:{H}[v0]"
    fonts = Path(os.path.relpath(FONTS_BRAND, d)).as_posix()  # relative to cwd: no drive-colon escaping, same on Windows/WSL
    vf += f";[v0]fps=30,ass=filename=clip.ass:fontsdir={fonts}[v]"  # cwd=work/<slug>; Audex needs no system install

    af = mute_filter(a.mute.split(",")) if a.mute else ""
    seek = ["-ss", f"{start:.3f}", "-t", f"{dur:.3f}", "-i", str(src)]
    p1 = run(["ffmpeg", "-v", "info", "-nostats"] + seek + ["-vn", "-af",
             (af + "," if af else "") + "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-f", "null", "-"])
    m = json.loads(re.findall(r"\{[^{}]*\}", p1.stderr)[-1])
    ln = (f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    a_chain = "[0:a]" + (af + "," if af else "") + ln + ",aresample=48000[a]"
    run(["ffmpeg", "-y", "-v", "error"] + seek + ["-filter_complex", vf + ";" + a_chain, "-map", "[v]", "-map", "[a]",
         "-c:v", "libx264", "-crf", "20", "-preset", "fast", "-pix_fmt", "yuv420p", "-r", "30",
         "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", str(out)], cwd=d)
    print(f"wrote {out} ({dur:.1f}s)")


# ---------------------------------------------------------------- recipes (campaign clips)
def cmd_recipe(a):
    """Render a tracked campaign clip from recipes/<name>.json (cwd = repo root, so every path is repo-relative)."""
    if a.name is None:
        for p in sorted(RECIPES.glob("*.json")):
            r = json.loads(p.read_text(encoding="utf-8"))
            print(f"{p.stem:32} {r.get('campaign_brief', '')} -> out/wizzclip/{r['output']}")
        return
    rp = RECIPES / f"{a.name}.json"
    if not rp.exists():
        die(f"no recipe {rp} (python tools/wizzclip/wizzclip.py recipe  lists them)")
    r = json.loads(rp.read_text(encoding="utf-8"))
    src = r["source"]
    sp = WORK / src["slug"] / "source.mp4"
    if not sp.exists():
        sec = f" --from {src['section'][0]} --to {src['section'][1]}" if src.get("section") else ""
        die(f"source {sp.relative_to(REPO)} not found. Fetch it with:\n"
            f"  python tools/wizzclip/wizzclip.py fetch {src['url']}{sec} --name {src['slug']}")
    missing = [f for f in r.get("fonts", []) if not (FONTS / f).exists()]
    if missing:
        die(f"missing font(s) {', '.join(missing)} in {FONTS.relative_to(REPO)} (the .ass subtitles use Arial Black / "
            f"Impact; copy ariblk.ttf / impact.ttf from C:/Windows/Fonts there; they are proprietary, never commit them)")
    ass = RECIPES / r["subtitles"]
    if not ass.exists():
        die(f"subtitle file {ass} not found")
    out_dir = OUT
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / (f"{a.out}.mp4" if a.out else r["output"])
    if out.exists() and not a.force:
        die(f"{out.relative_to(REPO)} already exists (use --out <name> for a different file, or --force to replace it)")
    cmd = ["ffmpeg", "-v", "error", "-stats", "-y"]
    for i in r["inputs"]:
        p = i["path"]
        if p == "source":
            path = sp
        elif p.startswith("campaign:"):
            path = CAMPAIGNS / r["campaign"] / p[len("campaign:"):]
        else:
            die(f"recipe input {p!r} must be 'source' or 'campaign:<file>'")
        if not path.exists():
            die(f"recipe input {path} not found")
        cmd += i.get("args", []) + ["-i", str(path)]
    rel = lambda p: Path(os.path.relpath(p, REPO)).as_posix()  # repo-relative, forward slashes: no drive-colon escaping
    graph = "".join(r["filter_complex"]).replace("{ass}", rel(ass)).replace("{fontsdir}", rel(FONTS))
    cmd += ["-filter_complex", graph, "-map", "[v]", "-map", "[a]",
            "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
            "-movflags", "+faststart", str(out)]
    print(f"rendering {r['output'] if not a.out else a.out + '.mp4'} ...")
    if subprocess.run(cmd, cwd=REPO).returncode:
        out.unlink(missing_ok=True)
        die("ffmpeg failed (see output above)")
    w, h, d = probe(out)
    print(f"wrote {out} ({w}x{h}, {d:.1f}s)")


def main():
    p = argparse.ArgumentParser(prog="wizzclip", description=__doc__)
    sp = p.add_subparsers(dest="cmd", required=True)
    f = sp.add_parser("fetch", help="download a VOD (or a section) with yt-dlp")
    f.add_argument("url")
    f.add_argument("--from", dest="from_", metavar="HH:MM:SS")
    f.add_argument("--to", metavar="HH:MM:SS")
    f.add_argument("--name", help="work/<slug> name")
    f.set_defaults(fn=cmd_fetch)
    f = sp.add_parser("find", help="rank viral-moment candidates")
    f.add_argument("slug")
    f.add_argument("--lang", choices=["id", "en", "auto"], default="auto")
    f.add_argument("--top", type=int, default=10)
    f.add_argument("--min", type=int, default=20)
    f.add_argument("--max", type=int, default=60)
    f.add_argument("--model", default="small")
    f.set_defaults(fn=cmd_find)
    f = sp.add_parser("cut", help="render a vertical clip")
    f.add_argument("slug")
    f.add_argument("--start", required=True)
    f.add_argument("--end", required=True)
    f.add_argument("--layout", choices=["stack", "blur", "full"], default="stack")
    f.add_argument("--streamer")
    f.add_argument("--title")
    f.add_argument("--mute", help="e.g. 12.0-18.5,40-44 (seconds relative to clip start)")
    f.add_argument("--srt")
    f.add_argument("--out")
    f.add_argument("--focus", type=float, help="stack: gameplay crop centre 0=left..1=right (default: preset focus or 0.5)")
    f.set_defaults(fn=cmd_cut)
    f = sp.add_parser("streamer", help="add/list facecam presets")
    f.add_argument("action", choices=["add", "list"])
    f.add_argument("name", nargs="?")
    f.add_argument("--facecam", help="x,y,w,h in 1920x1080 pixels")
    f.add_argument("--credit")
    f.add_argument("--focus", type=float, help="default gameplay crop centre 0..1 for stack")
    f.set_defaults(fn=cmd_streamer)
    f = sp.add_parser("frame", help="save a PNG of the source at time t")
    f.add_argument("slug")
    f.add_argument("--at", required=True)
    f.set_defaults(fn=cmd_frame)
    f = sp.add_parser("recipe", help="render a tracked campaign clip (recipes/<name>.json); no name lists them")
    f.add_argument("name", nargs="?")
    f.add_argument("--out", help="output name (no .mp4) instead of the recipe's; for test renders")
    f.add_argument("--force", action="store_true", help="replace an existing output file")
    f.set_defaults(fn=cmd_recipe)
    a = p.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
