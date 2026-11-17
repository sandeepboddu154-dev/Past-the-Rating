#!/usr/bin/env python3
"""Automated QC for a rendered MP4. Usage: qc.py <file.mp4> <expected_w> <expected_h> <sheet_out.jpg> [sheet_every_s]
Checks: stream specs, duration, decode errors, true-black frames, frozen frames, silence gaps, loudness, subtitle track."""
import json, re, subprocess, sys

f, W, H, sheet = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
every = float(sys.argv[5]) if len(sys.argv) > 5 else 10
sh = lambda a: subprocess.run(a, capture_output=True, text=True)
info = json.loads(sh(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", f]).stdout)
v = next(s for s in info["streams"] if s["codec_type"] == "video"); a = next(s for s in info["streams"] if s["codec_type"] == "audio")
subs = [s for s in info["streams"] if s["codec_type"] == "subtitle"]
dur = float(info["format"]["duration"]); size = int(info["format"]["size"])
res = {"file": f, "duration_s": round(dur, 3), "size_MB": round(size / 1e6, 1), "video": f"{v['codec_name']} {v['width']}x{v['height']} {v['r_frame_rate']} {v.get('pix_fmt')} ~{int(v.get('bit_rate', 0)) // 1000} kb/s",
       "audio": f"{a['codec_name']} {a['sample_rate']} Hz {a['channels']}ch ~{int(a.get('bit_rate', 0)) // 1000} kb/s",
       "subtitle_tracks": len(subs), "frames": int(v.get("nb_frames", 0))}
res["resolution_ok"] = v["width"] == W and v["height"] == H
# Full decode pass: errors + black + freeze
r = sh(["ffmpeg", "-v", "error", "-i", f, "-vf", "scale=480:-2,blackdetect=d=0.4:pix_th=0.025:pic_th=0.995,freezedetect=n=0.0005:d=2.5", "-an", "-f", "null", "-"])
r2 = sh(["ffmpeg", "-hide_banner", "-i", f, "-vf", "scale=480:-2,blackdetect=d=0.4:pix_th=0.025:pic_th=0.995,freezedetect=n=0.0005:d=2.5", "-an", "-f", "null", "-"])
res["decode_errors"] = [l for l in r.stderr.splitlines() if l.strip()][:5]
res["black_segments"] = re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", r2.stderr)
res["freeze_segments"] = re.findall(r"freeze_start: ([\d.]+)", r2.stderr)
# Audio: silence gaps and loudness
r3 = sh(["ffmpeg", "-hide_banner", "-i", f, "-af", "silencedetect=n=-45dB:d=1.5,ebur128=peak=true", "-vn", "-f", "null", "-"])
res["silences"] = re.findall(r"silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)", r3.stderr)
summ = r3.stderr[r3.stderr.rfind("Summary"):]
m = re.search(r"I:\s+(-?[\d.]+) LUFS", summ); p = re.search(r"Peak:\s+(-?[\d.]+) dBFS", summ)
res["loudness_LUFS"] = float(m.group(1)) if m else None; res["true_peak_dBFS"] = float(p.group(1)) if p else None
# Contact sheet
n = max(1, int(dur // every))
sh(["ffmpeg", "-v", "error", "-y", "-i", f, "-vf", f"fps=1/{every},scale=384:-2,tile=6x{(n + 5) // 6}", "-frames:v", "1", sheet])
print(json.dumps(res, indent=1))
