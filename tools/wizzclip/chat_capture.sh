#!/usr/bin/env bash
# Save the YouTube live chat of a stream to .cache/wizzclip/chat/<id>.live_chat.json (+ <id>.log).
#   live stream   -> captures the chat as it happens until the stream ends. yt-dlp writes one JSON
#                    object per line and flushes each fragment (--no-part, so the file is usable
#                    while it grows). Live lines carry wall-clock timestampUsec only (their offset
#                    is relative to when yt-dlp started), so <id>.start gets the stream start (epoch
#                    seconds) and chat_spikes.py is run with --start <id>.start.
#   ended stream  -> downloads the chat replay (videoOffsetTimeMsec = VOD seconds; no .start file).
#   no replay     -> logs "no chat replay" and exits. Always exits 0: it must never fail a caller.
# An existing non-empty chat file is kept (CHAT_FORCE=1 moves it to <id>.live_chat.json.old-<epoch>).
# Usage: bash tools/wizzclip/chat_capture.sh VIDEO_ID [STREAM_START_EPOCH]
# Called in the background by vod_hourly.sh and live_hourly.sh (opt out there with CHAT=0).
ID="$1"; START="$2"
URL="https://www.youtube.com/watch?v=$ID"
ROOT="/d/Dev/motion"
YT=("$ROOT/.venv/Scripts/yt-dlp.exe" --cookies-from-browser firefox --js-runtimes node --remote-components ejs:github --ignore-no-formats-error)
cd "$ROOT" || exit 0
DIR=".cache/wizzclip/chat"; mkdir -p "$DIR"
F="$DIR/$ID.live_chat.json"; LOG="$DIR/$ID.log"
log(){ echo "$(date '+%F %T') chat $ID: $*" | tee -a "$LOG"; }

st=$("${YT[@]}" --print live_status "$URL" 2>/dev/null | tail -1)
case "$st" in
  is_live|was_live|post_live|not_live) ;;
  *) log "status '$st', nothing to capture (no chat replay)"; exit 0;;
esac
if [ -s "$F" ]; then
  if [ "$CHAT_FORCE" = 1 ]; then mv "$F" "$F.old-$(date +%s)"; else log "chat file exists ($(du -h "$F" | cut -f1)), keeping it (CHAT_FORCE=1 to redo)"; exit 0; fi
fi
if [ "$st" = is_live ]; then
  [[ "$START" =~ ^[0-9]+$ ]] || START=$("${YT[@]}" --print release_timestamp "$URL" 2>/dev/null | tail -1)
  [[ "$START" =~ ^[0-9]+$ ]] || START=$(date +%s)   # last resort: capture start, offsets then only approximate
  echo "$START" > "$DIR/$ID.start"
  log "live capture started, stream start epoch $START -> $F"
else
  log "stream ended ($st), downloading chat replay -> $F"
fi
"${YT[@]}" --skip-download --write-subs --sub-langs live_chat --no-part \
  -o "$DIR/%(id)s.%(ext)s" "$URL" >>"$LOG" 2>&1
if [ -s "$F" ]; then
  log "chat saved: $(wc -l < "$F") lines, $(du -h "$F" | cut -f1)"
else
  rm -f "$F"; log "no chat replay"
fi
exit 0
