#!/usr/bin/env python3
"""Find live-chat spikes in a YouTube chat download and map them to clip sources.

Usage:
  # whole stream (finished VOD with chat replay)
  python tools/wizzclip/chat_spikes.py CHAT_JSON OUT_DIR \
      --hours "0:stream-2215-2315,3600:stream-2315-0015,7200:stream-0015-0017" \
      [--dir .cache/wizzclip/windah-live3] [--top 25] [--gap 45]

  # one hour only (VOD seconds START:END; END may be empty = to the end of the chat)
  python tools/wizzclip/chat_spikes.py CHAT_JSON OUT_DIR --window 0:3600 \
      [--name stream-1832-1932] [--dir .cache/wizzclip/windah-live4] [--top 12] [--gap 45]

  # chat captured while the stream was live (timestamps only, see below)
  python tools/wizzclip/chat_spikes.py CHAT_JSON OUT_DIR --window 3600:7200 --start EPOCH_OR_FILE ...

CHAT_JSON is a yt-dlp `<id>.live_chat.json` (JSON lines). If it does not exist but
`<CHAT_JSON>.part` does, the .part file is read. --hours maps VOD start seconds to hour-file
stems (the stem of `<stem>.mp4`); if --dir is given, Windah's speech is read from
`<dir>/scan-<stem>/transcript.txt` (lines "[h:mm:ss] text", local to that hour file).

Time base. Two kinds of file exist:
  * replay (downloaded after the stream ended): each line is `replayChatItemAction` with
    `videoOffsetTimeMsec` = VOD seconds. Default; nothing else is needed.
  * live capture (yt-dlp run while the stream was live; lines carry "isLive": true): the
    offset is only relative to when yt-dlp started, NOT the VOD. Every message does carry a
    wall-clock `timestampUsec`, so pass --start = the stream start (unix seconds, yt-dlp
    `release_timestamp`) or a file holding it (vod_hourly.sh writes `<id>.start` next to the
    chat file). VOD second = timestamp - start. --start also works on replay files (about
    +-3 s of the offsets). A live file without --start is refused.

--window START:END analyses one hour but keeps the stream-wide context: the per-second counts,
the +-150 s baseline and the 75th-percentile threshold are computed from ALL chat read so far
(so a window near its edge still sees the neighbouring hour, and a spike scores the same as in
a whole-stream run); only spikes whose peak second lies in [START, END) are listed, ranked
inside the window. Output names carry --name (default: the stem of the --hours entry that
starts at START, else wSTART-END). Without --hours, local times are relative to START.

The file may still be growing: it is re-read from the start on every run, malformed lines (a
truncated last line, a cut multi-byte character) are skipped. Near the live edge the last
seconds are under-counted; that never creates a spike.

Method: per-second message bins -> 10 s rolling count (window centred on the peak second)
-> baseline = median of the rolling count over +-150 s -> score = count / max(baseline, 1).
Top spikes by score, at least --gap s apart, with count above the stream-wide 75th
percentile. Spikes where >=35% of messages are roll-call spam (aku/absen/hadir) are tagged ROLLCALL.
Chat lags the on-stream moment by ~5-15 s, so the transcript excerpt runs from
35 s before to 5 s after the peak.

Writes OUT_DIR/<id>-spikes.md and OUT_DIR/<id>-spikes.json (id = CHAT_JSON name before the
first dot); in window mode OUT_DIR/<id>-<name>-spikes.md/.json. Stdlib only.
"""
import argparse
import json
import re
import statistics
import sys
from collections import Counter
from pathlib import Path

WIN = 10          # rolling window, seconds
BASE = 150        # baseline half-width, seconds
TOK_STRIP = re.compile(r"^[^\w]+|[^\w]+$")
ATTEND = re.compile(r"^(aku+|absen+|hadir+|hadirr*|hallo|halo|hai)$")  # roll-call spam, not a moment


def runs_to_text(runs):
    """Return (display_text, tokens) for a runs[] list; emoji become their own tokens."""
    parts, toks = [], []
    for r in runs or []:
        if "text" in r:
            parts.append(r["text"])
            for w in r["text"].lower().split():
                w = TOK_STRIP.sub("", w)
                if len(w) > 1:
                    toks.append(w)
        elif "emoji" in r:
            e = r["emoji"]
            sym = e.get("emojiId", "")
            if not sym or len(sym) > 8:  # custom emoji: use first shortcut
                sc = e.get("shortcuts") or [sym]
                sym = sc[0]
            parts.append(sym)
            toks.append(sym.lower())
    return " ".join(p.strip() for p in parts if p.strip()), toks


def load_chat(path, start=None):
    """Return (msgs, paid, is_live): lists of (t_sec, text, tokens) on the VOD clock.

    start=None: t = videoOffsetTimeMsec (replay files). start=EPOCH: t = timestampUsec/1e6 - start.
    The offset sits inside replayChatItemAction in a replay file but at the top level of a
    live-capture line ("isLive": true), where it is relative to the capture start.
    """
    msgs, paid, is_live = [], [], False
    p = Path(path)
    if not p.exists() and Path(str(p) + ".part").exists():
        p = Path(str(p) + ".part")
    with open(p, encoding="utf-8", errors="replace") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                o = json.loads(line)
            except json.JSONDecodeError:
                continue  # truncated final line of a file that is still being written
            rc = o.get("replayChatItemAction")
            if not rc:
                continue
            if o.get("isLive"):
                is_live = True
            try:
                t0 = int(rc.get("videoOffsetTimeMsec", o.get("videoOffsetTimeMsec", "0"))) / 1000.0
            except ValueError:
                continue
            for a in rc.get("actions", []):
                item = a.get("addChatItemAction", {}).get("item", {})
                r = item.get("liveChatTextMessageRenderer") or item.get("liveChatPaidMessageRenderer")
                if not r:
                    continue
                t = t0
                if start is not None:
                    try:
                        t = int(r["timestampUsec"]) / 1e6 - start
                    except (KeyError, ValueError):
                        continue
                text, toks = runs_to_text(r.get("message", {}).get("runs"))
                if "liveChatTextMessageRenderer" in item:
                    if text:
                        msgs.append((t, text, toks))
                else:
                    amt = r.get("purchaseAmountText", {}).get("simpleText", "")
                    paid.append((t, f"[{amt}] {text}".strip(), toks))
    return msgs, paid, is_live


def read_start(v):
    """--start value: unix seconds, or a file whose first token is unix seconds."""
    try:
        return float(v)
    except ValueError:
        return float(Path(v).read_text().split()[0])


def parse_window(spec):
    a, _, b = spec.partition(":")
    return int(a or 0), (int(b) if b.strip() else None)


def parse_hours(spec):
    out = []
    for part in spec.split(","):
        part = part.strip()
        if not part:
            continue
        start, _, stem = part.partition(":")
        out.append((int(start), stem))
    return sorted(out)


def locate(t, hours):
    """VOD second -> (stem, local second)."""
    best = hours[0]
    for h in hours:
        if t >= h[0]:
            best = h
    return best[1], t - best[0]


def mmss(s):
    s = int(round(s))
    return f"{s // 60}:{s % 60:02d}" if s < 3600 else f"{s // 3600}:{s % 3600 // 60:02d}:{s % 60:02d}"


def load_transcript(path):
    rows = []
    p = Path(path)
    if not p.exists():
        return rows
    for line in p.read_text(encoding="utf-8", errors="replace").splitlines():
        m = re.match(r"\[(\d+):(\d\d):(\d\d)\]\s*(.*)", line)
        if m:
            rows.append((int(m[1]) * 3600 + int(m[2]) * 60 + int(m[3]), m[4]))
    return rows


def percentile(vals, q):
    s = sorted(vals)
    return s[min(len(s) - 1, int(q * len(s)))] if s else 0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("chat_json")
    ap.add_argument("out_dir")
    ap.add_argument("--hours", help='"0:stem-a,3600:stem-b,..." VOD start seconds : hour-file stem (required without --window)')
    ap.add_argument("--window", help="START:END in VOD seconds; only spikes in this window are listed (END empty = end of chat)")
    ap.add_argument("--name", help="window mode: hour name used in the output file names (default: hour stem or wSTART-END)")
    ap.add_argument("--start", help="stream start, unix seconds or a file holding it; use timestampUsec instead of the offset (live captures)")
    ap.add_argument("--dir", help="folder holding scan-<stem>/transcript.txt")
    ap.add_argument("--top", type=int, help="spikes to keep (default 25, or 12 with --window)")
    ap.add_argument("--gap", type=int, default=45)
    a = ap.parse_args()
    if not a.window and not a.hours:
        ap.error("--hours is required unless --window is given")

    cid = Path(a.chat_json).name.split(".")[0]
    start = read_start(a.start) if a.start else None
    msgs, paid, is_live = load_chat(a.chat_json, start)
    if is_live and start is None:
        sys.exit("live-capture file: its offsets are relative to the capture start; pass --start EPOCH_OR_FILE")
    if not msgs:
        sys.exit("no text messages found")
    n = int(max(m[0] for m in msgs)) + 2
    per = [0] * n
    for t, _, _ in msgs:
        if t >= 0:
            per[int(t)] += 1
    pre = [0]
    for v in per:
        pre.append(pre[-1] + v)

    def roll(i):  # window [i-5, i+4]
        lo, hi = max(0, i - WIN // 2), min(n, i + WIN // 2)
        return pre[hi] - pre[lo]

    cnt = [roll(i) for i in range(n)]
    base = [statistics.median(cnt[max(0, i - BASE):min(n, i + BASE + 1)]) for i in range(n)]
    score = [cnt[i] / max(base[i], 1) for i in range(n)]
    p75 = percentile(cnt, 0.75)

    lo, hi, name = 0, n, None
    if a.window:
        lo, hi = parse_window(a.window)
        hi = n if hi is None else min(hi, n)
        if lo >= n:
            sys.exit(f"window starts at {lo} s but the chat read so far only reaches {n} s")
        hours = parse_hours(a.hours) if a.hours else [(lo, a.name or f"w{lo}-{hi}")]
        name = a.name or next((st for s0, st in hours if s0 == lo), f"w{lo}-{hi}")
    else:
        hours = parse_hours(a.hours)
    top = a.top or (12 if a.window else 25)

    order = sorted(range(lo, hi), key=lambda i: (-score[i], -cnt[i]))
    picked = []
    for i in order:
        if cnt[i] <= p75:
            continue
        if all(abs(i - j) >= a.gap for j in picked):
            picked.append(i)
            if len(picked) >= top:
                break

    trans = {}
    spikes = []
    for rank, i in enumerate(picked, 1):
        stem, loc = locate(i, hours)
        win_msgs = [m for m in msgs if i - 10 <= m[0] < i + 10]
        tc = Counter()
        for _, _, toks in win_msgs:
            tc.update(set(toks))
        samples, seen = [], set()
        for _, text, _ in win_msgs:
            k = text.lower()
            if k not in seen and len(text) > 3:
                seen.add(k)
                samples.append(text[:120])
            if len(samples) == 3:
                break
        att = sum(1 for _, _, toks in win_msgs if any(ATTEND.match(w) for w in toks)) / max(len(win_msgs), 1)
        tl = []
        if a.dir:
            if stem not in trans:
                trans[stem] = load_transcript(Path(a.dir) / f"scan-{stem}" / "transcript.txt")
            tl = [f"[{mmss(t)}] {x}" for t, x in trans[stem] if loc - 35 <= t <= loc + 5]
        spikes.append({
            "rank": rank, "vod_s": i, "vod": mmss(i), "hour_file": stem, "local_s": round(loc),
            "local": mmss(loc), "score": round(score[i], 2), "msgs_10s": cnt[i],
            "baseline": base[i], "tokens": [[w, c] for w, c in tc.most_common(8)],
            "samples": samples, "paid_in_window": sum(1 for p in paid if i - 10 <= p[0] < i + 10),
            "attendance_share": round(att, 2), "transcript": tl,
        })

    out = Path(a.out_dir)
    out.mkdir(parents=True, exist_ok=True)
    stem_out = f"{cid}-{name}" if name else cid
    (out / f"{stem_out}-spikes.json").write_text(json.dumps(
        {"id": cid, "window": [lo, hi] if name else None, "name": name, "messages": len(msgs),
         "paid_messages": len(paid), "duration_s": n, "p75_msgs_10s": p75, "spikes": spikes},
        ensure_ascii=False, indent=1), encoding="utf-8")

    md = [f"# Chat spikes {cid}" + (f" {name} (VOD {mmss(lo)}-{mmss(hi)})" if name else ""), "",
          f"{len(msgs)} text messages, {len(paid)} paid, {n} s; 75th percentile of msgs/10s = {p75}; "
          f"median msgs/10s = {statistics.median(cnt):.1f}.", "",
          "| # | VOD | hour file | local | score | msgs/10s | base | top tokens |", "|---|---|---|---|---|---|---|---|"]
    for s in spikes:
        tk = " ".join(f"{w}({c})" for w, c in s["tokens"])
        if s["attendance_share"] >= 0.35:
            tk += " **ROLLCALL**"
        md.append(f"| {s['rank']} | {s['vod']} | {s['hour_file']} | {s['local']} | {s['score']} | "
                  f"{s['msgs_10s']} | {s['baseline']:.0f} | {tk} |")
    md.append("")
    for s in spikes:
        md += [f"## #{s['rank']} {s['hour_file']} @ {s['local']} (VOD {s['vod']}) score {s['score']}, "
               f"{s['msgs_10s']} msgs/10s, {s['paid_in_window']} paid", "",
               "Tokens: " + " ".join(f"{w}({c})" for w, c in s["tokens"]), ""]
        md += [f"- chat: {x}" for x in s["samples"]]
        md += ["", "Windah (-35 s .. +5 s):", ""]
        md += [f"    {x}" for x in s["transcript"]] or ["    (no transcript)"]
        md.append("")
    (out / f"{stem_out}-spikes.md").write_text("\n".join(md), encoding="utf-8")
    print(f"{cid}: {len(msgs)} msgs, {len(spikes)} spikes -> {out / (stem_out + '-spikes.md')}")


if __name__ == "__main__":
    main()
