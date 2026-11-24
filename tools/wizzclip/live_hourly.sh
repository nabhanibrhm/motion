#!/usr/bin/env bash
# Record a YouTube live stream in hourly batches with live_range.py (DASH, live-from-start).
# Waits until the stream is live, then, once each full hour has passed, downloads fragments
# [k*3600, (k+1)*3600) (sq N = N seconds after the actual start) as stream-HHMM-HHMM.mp4.
# After the stream ends, it downloads the remaining part. Each file is copied to DRIVE.
# Chat: once the stream is live, chat_capture.sh runs in the background (nohup, ends with the stream)
# and saves .cache/wizzclip/chat/<id>.live_chat.json + <id>.start (stream start epoch, because live
# chat has timestamps only); scan_next.sh then runs chat_spikes.py per hour. Opt out: CHAT=0 or --no-chat.
# Usage: bash tools/wizzclip/live_hourly.sh VIDEO_ID OUT_DIR DRIVE_DIR [--no-chat]
# Example: bash tools/wizzclip/live_hourly.sh QSPPyA1736U .cache/wizzclip/windah-live2 "/g/My Drive/GTA6/live2-2026-11-19"
ID="$1"; OUT="$2"; DRIVE="$3"
[ "$4" = "--no-chat" ] && CHAT=0
URL="${LIVE_URL:-https://www.youtube.com/watch?v=$ID}"  # LIVE_URL overrides it, e.g. https://www.youtube.com/@windahbasudara/live when the watch URL says "unavailable"
ROOT="/d/Dev/motion"
PY="$ROOT/.venv/Scripts/python"
YTDLP="$ROOT/.venv/Scripts/yt-dlp.exe"
YT=("$YTDLP" --cookies-from-browser firefox --js-runtimes node --remote-components ejs:github --ignore-no-formats-error)
export COOKIES_BROWSER=firefox FORMAT="${FORMAT:-299+140/298+140/bv*[height<=1080]+ba}" CONCURRENCY="${CONCURRENCY:-4}"
mkdir -p "$OUT" "$DRIVE"; cd "$ROOT" || exit 1
LOG="$OUT/hourly.log"
log(){ echo "$(date '+%F %T') $*" | tee -a "$LOG"; }
status(){ "${YT[@]}" --print live_status "$URL" 2>/dev/null | tail -1; }

# 1. Wait for the stream to go live (poll every 60 s, give up at 23:59).
while true; do
  s=$(status)
  [ "$s" = "is_live" ] && break
  [ "$s" = "was_live" ] || [ "$s" = "post_live" ] && { log "stream already ended ($s)"; break; }
  [ "$(date +%H%M)" -ge 2350 ] && { log "gave up waiting"; exit 1; }
  log "status=$s, waiting"; sleep 60
done
START=$("${YT[@]}" --print release_timestamp "$URL" 2>/dev/null | tail -1)
[[ "$START" =~ ^[0-9]+$ ]] || START=$(date +%s)
log "live; actual start $(date -d @"$START" '+%F %T') (epoch $START), format $FORMAT"
if [ "${CHAT:-1}" != 0 ]; then
  echo "$ID" > "$OUT/chat.id"
  nohup bash tools/wizzclip/chat_capture.sh "$ID" "$START" >/dev/null 2>&1 &
  log "chat capture started in background (pid $!), log .cache/wizzclip/chat/$ID.log"
fi

grab(){ # $1=start sq  $2=end sq  $3=name
  local tries=0
  while [ $tries -lt 3 ]; do
    tries=$((tries+1)); log "batch $3 sq $1-$2 try $tries"
    if "$PY" tools/wizzclip/live_range.py "$URL" "$1" "$2" "$OUT/$3.%(ext)s" >>"$LOG" 2>&1 && [ -s "$OUT/$3.mp4" ]; then
      d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/$3.mp4")
      log "batch $3 done, duration $d s, size $(du -h "$OUT/$3.mp4" | cut -f1)"
      cp "$OUT/$3.mp4" "$DRIVE/$3.mp4" && log "copied to $DRIVE/$3.mp4"
      return 0
    fi
    log "batch $3 failed, retrying in 60 s"; sleep 60
  done
  log "batch $3 FAILED after 3 tries"
}
name(){ echo "stream-$(date -d @$((START+$1)) +%H%M)-$(date -d @$((START+$2)) +%H%M)"; }

# 2. One batch per full hour while live; the remainder after it ends.
k=0
while true; do
  s=$(status)
  if [ "$s" = "is_live" ]; then
    due=$((START+(k+1)*3600+120))
    if [ "$(date +%s)" -ge "$due" ]; then
      grab $((k*3600)) $(((k+1)*3600)) "$(name $((k*3600)) $(((k+1)*3600)))"; k=$((k+1))
    else
      sleep 60
    fi
  else
    log "stream not live any more (status=$s)"
    END=$(( $(date +%s) - START ))
    grab $((k*3600)) 10000000 "$(name $((k*3600)) $END)"
    break
  fi
done
log "done"
