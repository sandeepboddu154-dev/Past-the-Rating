#!/usr/bin/env python3
"""Assemble final MP4: concat rendered segments (lossless stream copy) + mastered audio + soft subtitles.
Usage: python3 assemble.py long                → Final_Exports/PTR_Video001_Hyatt_Regency_4K.mp4
       python3 assemble.py short SH-A           → Shorts/PTR_Short_SH-A.mp4"""
import json, os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def run(a):
    r = subprocess.run(a, capture_output=True, text=True)
    if r.returncode: print(r.stderr[-2500:]); raise SystemExit(1)

def build(tl_path, seg_dir, audio, out, srt=None, title=None):
    tl = json.load(open(tl_path))
    lst = os.path.join(seg_dir, "_concat.txt")
    with open(lst, "w") as f:
        for s in tl["segments"]:
            p = os.path.join(seg_dir, f"{s['id']}.mp4")
            if not os.path.exists(p): raise SystemExit(f"missing segment {p}")
            f.write(f"file '{p}'\n")
    a = ["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst, "-i", audio]
    if srt: a += ["-i", srt]
    a += ["-map", "0:v", "-map", "1:a"] + (["-map", "2:s"] if srt else [])
    a += ["-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-ar", "48000"] + (["-c:s", "mov_text", "-metadata:s:s:0", "language=eng"] if srt else [])
    a += ["-t", f"{tl['duration']:.3f}", "-movflags", "+faststart", "-metadata", f"title={title or ''}", "-metadata", "artist=Past The Rating", out]
    run(a); print("wrote", out)

if __name__ == "__main__":
    if sys.argv[1] == "long":
        os.makedirs(os.path.join(ROOT, "Final_Exports"), exist_ok=True)
        build(os.path.join(ROOT, "Project_Files/timeline.json"), os.path.join(ROOT, "Visual_Assets/segments"),
              os.path.join(ROOT, "Project_Files/mix/final_mix.wav"),
              os.path.join(ROOT, "Final_Exports/PTR_Video001_Hyatt_Regency_4K.mp4"),
              os.path.join(ROOT, "Subtitles/Video_001_en.srt"), "The Drawing Change That Doubled the Load")
    else:
        k = sys.argv[2]; d = os.path.join(ROOT, "Shorts", k)
        build(os.path.join(d, "timeline.json"), os.path.join(d, "segments"), os.path.join(d, "mix.wav"),
              os.path.join(ROOT, "Shorts", f"PTR_Short_{k}.mp4"), None, k)
