"""Source builder for the Windah GTA VI clips (companion of windah_recipe.py).

Builds .cache/wizzclip/<slug>/source.mp4: parts re-encoded to 1080p30 (libx264 veryfast crf17, aac 192k 48k) and joined
IN THE GIVEN (output) ORDER with the concat demuxer.
Usage (repo root): python tools/wizzclip/windah_src.py SLUG REC:START:END [REC:START:END ...]
REC is a path relative to .cache/wizzclip/ (e.g. windah-live4/stream-1832-1932.mp4).
The result keeps the whole 1920x1080 frame, Windah's baked-in facecam included (the 'face' layout of windah_recipe.py crops it)."""
import os, subprocess, sys
from pathlib import Path
C = (Path(__file__).resolve().parents[2] / '.cache' / 'wizzclip').as_posix() + '/'
slug, parts = sys.argv[1], sys.argv[2:]
out = C + slug + '/'; os.makedirs(out, exist_ok=True)
lst = []
for i, p in enumerate(parts):
    rec, s, e = p.rsplit(':', 2); s, e = float(s), float(e)
    f = f'{out}part{i}.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{s}', '-i', C + rec, '-t', f'{e - s}', '-vf', 'fps=30,scale=1920:1080',
                    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-g', '30', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2', f], check=True)
    lst.append(f"file 'part{i}.mp4'")
open(out + 'parts.txt', 'w').write('\n'.join(lst) + '\n')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', out + 'parts.txt', '-c', 'copy', '-movflags', '+faststart', out + 'source.mp4'], check=True)
for i in range(len(parts)): os.remove(f'{out}part{i}.mp4')
os.remove(out + 'parts.txt')
d = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out + 'source.mp4'], capture_output=True, text=True).stdout.strip()
print(slug, 'source', d, 's')
