#!/usr/bin/env bash
# Download a finished YouTube stream (VOD) in hourly batches: [k*3600, (k+1)*3600) as
# stream-HHMM-HHMM.mp4 (local WIB time from the stream start). Logs "batch NAME done" to
# OUT/hourly.log, the same lines live_hourly.sh writes, so scan_next.sh works on it.
# Each file is copied to DRIVE.
# Chat: at the start, chat_capture.sh runs in the background (live stream: captures live chat;
# ended stream: downloads the chat replay; none: logs "no chat replay") into
# .cache/wizzclip/chat/<id>.live_chat.json + <id>.log. It never blocks or fails the batches; after
# the last batch this script waits for a still-running replay download. Opt out: CHAT=0 or --no-chat.
# OUT/chat.id remembers the id so scan_next.sh can run the per-hour chat spikes.
# Usage: bash tools/wizzclip/vod_hourly.sh VIDEO_ID OUT_DIR DRIVE_DIR [--no-chat]
# Example: bash tools/wizzclip/vod_hourly.sh 03qhcshfeMY .cache/wizzclip/windah-live4 "/g/My Drive/GTA6/live4-2026-11-20"
ID="$1"; OUT="$2"; DRIVE="$3"
[ "$4" = "--no-chat" ] && CHAT=0
URL="https://www.youtube.com/watch?v=$ID"
ROOT="/d/Dev/motion"
YTDLP="$ROOT/.venv/Scripts/yt-dlp.exe"
YT=("$YTDLP" --cookies-from-browser firefox --js-runtimes node --remote-components ejs:github)
FORMAT="${FORMAT:-299+140/137+140/298+140/bv*[height<=1080]+ba}"
mkdir -p "$OUT" "$DRIVE"; cd "$ROOT" || exit 1
LOG="$OUT/hourly.log"
log(){ echo "$(date '+%F %T') $*" | tee -a "$LOG"; }

CHATPID=""
if [ "${CHAT:-1}" != 0 ]; then
  echo "$ID" > "$OUT/chat.id"
  nohup bash tools/wizzclip/chat_capture.sh "$ID" >/dev/null 2>&1 &
  CHATPID=$!; log "chat capture started in background (pid $CHATPID), log .cache/wizzclip/chat/$ID.log"
fi

read -r START DUR < <("${YT[@]}" --print "%(release_timestamp)s %(duration)s" "$URL" 2>/dev/null | tail -1)
[[ "$START" =~ ^[0-9]+$ && "$DUR" =~ ^[0-9]+$ ]] || { log "could not read start/duration (live stream? chat capture, if any, keeps running; use live_hourly.sh for the video)"; exit 1; }
# Git Bash on Windows has no tzdata, so shift to WIB (UTC+7) by hand.
hm(){ date -u -d @$((START+$1+7*3600)) +%H%M; }
log "VOD $ID start $(date -u -d @$((START+7*3600)) '+%F %T') WIB, duration $DUR s, format $FORMAT"

k=0
while [ $((k*3600)) -lt "$DUR" ]; do
  a=$((k*3600)); b=$(( (k+1)*3600 )); [ $b -gt "$DUR" ] && b=$DUR
  name="stream-$(hm $a)-$(hm $b)"
  if [ -s "$OUT/$name.mp4" ]; then log "batch $name exists, skipping"; k=$((k+1)); continue; fi
  ok=0
  for t in 1 2 3; do
    log "batch $name t $a-$b try $t"
    rm -f "$OUT/$name".*
    if "${YT[@]}" -f "$FORMAT" --merge-output-format mp4 --download-sections "*$a-$b" \
         -o "$OUT/$name.%(ext)s" "$URL" >>"$LOG" 2>&1 && [ -s "$OUT/$name.mp4" ]; then ok=1; break; fi
    log "batch $name failed, retrying in 30 s"; sleep 30
  done
  if [ $ok = 1 ]; then
    d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/$name.mp4")
    log "batch $name done, duration $d s, size $(du -h "$OUT/$name.mp4" | cut -f1)"
    cp "$OUT/$name.mp4" "$DRIVE/$name.mp4" && log "copied to $DRIVE/$name.mp4"
  else
    log "batch $name FAILED after 3 tries"
  fi
  k=$((k+1))
done
log "done"
if [ -n "$CHATPID" ] && kill -0 "$CHATPID" 2>/dev/null; then log "waiting for chat download (pid $CHATPID)"; wait "$CHATPID"; fi
if [ -n "$CHATPID" ]; then log "$(grep "chat $ID:" ".cache/wizzclip/chat/$ID.log" 2>/dev/null | tail -1 | cut -c1-140)"; fi
