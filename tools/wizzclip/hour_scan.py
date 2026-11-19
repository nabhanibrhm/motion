"""Scan one recorded stream hour for clip ideas.
Usage: python tools/wizzclip/hour_scan.py IN.mp4 OUT_DIR [--model small]
Writes OUT_DIR/transcript.txt ([mm:ss] lines, whisper on boosted audio), peaks.txt (loudest
seconds = screams/reactions) and sheet-N.jpg (one frame every 20 s, 30 per sheet = 10 min).
Keeps ffmpeg/whisper at 3 threads so the laptop stays usable."""
import os, subprocess, sys, wave, shutil
import numpy as np

src, out = sys.argv[1], sys.argv[2]
model = sys.argv[sys.argv.index('--model') + 1] if '--model' in sys.argv else 'small'
os.makedirs(out, exist_ok=True)
wav = os.path.join(out, 'boost.wav')
ff = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-threads', '3']

def mmss(t):
    return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{int(t % 60):02d}"

if not os.path.exists(wav):
    subprocess.run(ff + ['-i', src, '-vn', '-ac', '1', '-ar', '16000', '-af',
                         'highpass=f=150,lowpass=f=5000,dynaudnorm=f=150:g=15', wav], check=True)
print('audio ok', flush=True)

# contact sheets (font copied next to the sheets so drawtext needs no path escaping)
if not os.path.exists(os.path.join(out, 'sheet-1.jpg')):
    shutil.copy('C:/Windows/Fonts/arial.ttf', os.path.join(out, 'arial.ttf'))
    subprocess.run(ff + ['-skip_frame', 'nokey', '-i', os.path.abspath(src), '-vf',
                         "fps=1/20,scale=384:-2,drawtext=fontfile=arial.ttf:text='%{pts\\:hms}':x=6:y=6:fontsize=22:fontcolor=yellow:box=1:boxcolor=black@0.6,tile=5x6",
                         '-fps_mode', 'vfr', 'sheet-%d.jpg'], check=True, cwd=out)
print('sheets ok', flush=True)

# loudness peaks (1 s RMS, top 30, at least 20 s apart)
w = wave.open(wav); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
n = 16000; r = np.sqrt((a[:len(a) // n * n].reshape(-1, n) ** 2).mean(1))
picked = []
for i in np.argsort(-r):
    if all(abs(i - j) >= 20 for j in picked): picked.append(int(i))
    if len(picked) >= 30: break
with open(os.path.join(out, 'peaks.txt'), 'w') as f:
    for i in sorted(picked): f.write(f"{mmss(i)} level {r[i]:.3f}\n")
print('peaks ok', flush=True)

# transcript
from faster_whisper import WhisperModel
m = WhisperModel(model, device='cpu', compute_type='int8', cpu_threads=3, num_workers=1)
segs, _ = m.transcribe(a, language='id', vad_filter=True, condition_on_previous_text=False, beam_size=3,
                       temperature=0, no_repeat_ngram_size=3,
                       initial_prompt='Windah Basudara live GTA 6, Jason, Lucia, Leonida, Vice City. Makasih donasinya.')
with open(os.path.join(out, 'transcript.txt'), 'w', encoding='utf-8') as f:
    for s in segs:
        f.write(f"[{mmss(s.start)}] {s.text.strip()}\n"); f.flush()
print('transcript ok', flush=True)
