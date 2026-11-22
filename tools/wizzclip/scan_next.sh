#!/usr/bin/env bash
# Wait for the next finished hourly batch (live_hourly.sh / vod_hourly.sh log line "batch NAME done")
# that has no scan yet, scan it with hour_scan.py into OUT/scan-NAME/, then exit (so the caller is
# notified).
# Chat: after the scan, if the stream's chat file exists (.cache/wizzclip/chat/<id>.live_chat.json,
# partial is fine), chat_spikes.py runs for that hour's window (taken from the "batch NAME t|sq A-B"
# log line, with the stream-wide +-150 s baseline). Result: .cache/wizzclip/chat/<id>-NAME-spikes.md
# (+ .json), copied to OUT/scan-NAME/chat-spikes.md so the hourly idea list can cite "chat spike #N".
# Live captures have timestamps only, so <id>.start (written by chat_capture.sh) is passed as --start.
# No chat file, no window or a spike failure is skipped without failing the scan.
# Usage: bash tools/wizzclip/scan_next.sh OUT_DIR [VIDEO_ID]
#   VIDEO_ID defaults to OUT_DIR/chat.id (written by vod_hourly.sh / live_hourly.sh).
OUT="$1"; cd /d/Dev/motion || exit 1
CHATID="${2:-$(cat "$OUT/chat.id" 2>/dev/null)}"
CHATDIR=.cache/wizzclip/chat

chat_hour(){ # $1 = hour name (stream-HHMM-HHMM)
  local f="$CHATDIR/$CHATID.live_chat.json" w a b S=()
  [ -n "$CHATID" ] && { [ -s "$f" ] || [ -s "$f.part" ]; } || return 0
  w=$(grep -ao "batch $1 \(t\|sq\) [0-9]*-[0-9]*" "$OUT/hourly.log" 2>/dev/null | tail -1 | awk '{print $4}')
  [ -n "$w" ] || return 0
  a=${w%-*}; b=${w#*-}
  [ -s "$CHATDIR/$CHATID.start" ] && S=(--start "$CHATDIR/$CHATID.start")
  if .venv/Scripts/python tools/wizzclip/chat_spikes.py "$f" "$CHATDIR" --window "$a:$b" --name "$1" \
       --hours "$a:$1" --dir "$OUT" "${S[@]}"; then
    cp "$CHATDIR/$CHATID-$1-spikes.md" "$OUT/scan-$1/chat-spikes.md" && echo "CHAT SPIKES $1 -> $OUT/scan-$1/chat-spikes.md"
  else
    echo "chat spikes skipped for $1"
  fi
  return 0
}

while true; do
  for n in $(grep -ao 'batch stream-[0-9-]* done' "$OUT/hourly.log" 2>/dev/null | awk '{print $2}'); do
    [ -s "$OUT/scan-$n/transcript.done" ] && continue
    echo "scanning $n"
    if .venv/Scripts/python tools/wizzclip/hour_scan.py "$OUT/$n.mp4" "$OUT/scan-$n"; then
      date > "$OUT/scan-$n/transcript.done"; echo "SCANNED $n"
      chat_hour "$n"
      exit 0
    fi
    echo "SCAN FAILED $n"; exit 1
  done
  grep -aq ' done$' "$OUT/hourly.log" 2>/dev/null && grep -aq 'FAILED\|gave up' "$OUT/hourly.log" && { echo "recorder ended with failure"; tail -3 "$OUT/hourly.log"; exit 2; }
  grep -aqx '.* done' "$OUT/hourly.log" 2>/dev/null && { echo "recorder finished, nothing left"; exit 0; }
  sleep 60
done
