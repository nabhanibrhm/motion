"""Download one time range of a YouTube LIVE stream as synced DASH (video+audio merged).
yt-dlp cannot do --download-sections on a live stream; this wraps its live fragment
generator and only yields fragments [START_SQ, END_SQ). Fragment N = N seconds after the
stream start (verified on 45r3OyaxvFE: sq 4400 == second 4400 of the --live-from-start file).
Usage: .venv/Scripts/python tools/wizzclip/live_range.py URL START_SQ END_SQ OUTPUT_TEMPLATE
Example (stream started 18:30:31, want 21:00-22:00): ... 8969 12569 "stream-2100-2200.%(ext)s"
Tested with yt-dlp 2026.10.26 (patches YoutubeIE._live_adaptive_fragments)."""
import sys
from urllib.parse import parse_qs, urlparse

import yt_dlp
from yt_dlp.extractor.youtube._video import YoutubeIE

url, START, END, out = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
_orig = YoutubeIE._live_adaptive_fragments


def _ranged(self, *args, **kwargs):
    for frag in _orig(self, *args, **kwargs):
        sq = int(parse_qs(urlparse(frag['url']).query)['sq'][0])
        if sq < START:
            continue
        if sq >= END:
            return
        frag = dict(frag, fragment_count=END - START)
        yield frag


YoutubeIE._live_adaptive_fragments = _ranged

opts = {
    'live_from_start': True,
    'format': '299+140',
    'merge_output_format': 'mp4',
    'outtmpl': out,
    'js_runtimes': {'node': {}},
    'remote_components': {'ejs:github'},
    'concurrent_fragment_downloads': 4,
    'noprogress': True,
}
with yt_dlp.YoutubeDL(opts) as ydl:
    sys.exit(ydl.download([url]))
