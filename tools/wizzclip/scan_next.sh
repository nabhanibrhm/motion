#!/usr/bin/env bash
# Wait for the next finished hourly batch (live_hourly.sh log line "batch NAME done") that has no
# scan yet, scan it with hour_scan.py into OUT/scan-NAME/, then exit (so the caller is notified).
# Usage: bash tools/wizzclip/scan_next.sh OUT_DIR
OUT="$1"; cd /d/Dev/motion || exit 1
while true; do
  for n in $(grep -o 'batch stream-[0-9-]* done' "$OUT/hourly.log" 2>/dev/null | awk '{print $2}'); do
    [ -s "$OUT/scan-$n/transcript.done" ] && continue
    echo "scanning $n"
    .venv/Scripts/python tools/wizzclip/hour_scan.py "$OUT/$n.mp4" "$OUT/scan-$n" && date > "$OUT/scan-$n/transcript.done" && echo "SCANNED $n" && exit 0
    echo "SCAN FAILED $n"; exit 1
  done
  grep -q ' done$' "$OUT/hourly.log" 2>/dev/null && grep -q 'FAILED\|gave up' "$OUT/hourly.log" && { echo "recorder ended with failure"; tail -3 "$OUT/hourly.log"; exit 2; }
  grep -qx '.* done' "$OUT/hourly.log" 2>/dev/null && { echo "recorder finished, nothing left"; exit 0; }
  sleep 60
done
