#!/usr/bin/env python3
"""Audio mix for a Short. Usage: python3 shorts_mix.py SH-A"""
import json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
K = sys.argv[1]; D = os.path.join(ROOT, "Shorts", K)
TL = json.load(open(os.path.join(D, "timeline.json"))); DUR = TL["duration"]
n = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())
def cue(word, k=1):
    c = 0
    for w in TL["words"]:
        if n(w["w"]) == n(word):
            c += 1
            if c == k: return w["s"]
    raise KeyError(word)
# (music file, offset into track)
MUSIC = {"SH-A": ("M3_change", 50.0), "SH-B": ("M6_aftermath", 60.0), "SH-C": ("M3_change", 78.0)}[K]
SFXMAP = {
 "SH-A": [("strain_tink", "double", -5), ("strain_tink", "both", -6), ("hit_low", "twice", -7)],
 "SH-B": [("hit_low", "weight", -6), ("tick_ui", "thirtyone", -5), ("strain_tink", "cut", -5), ("strain_tink", "doubled", -6)],
 "SH-C": [("tick_ui", "changed", -6), ("stamp", "stamped", -3), ("strain_tink", "doubled", -6), ("stamp", "stamp", -1)],
}[K]

def run(a):
    r = subprocess.run(a, capture_output=True, text=True)
    if r.returncode: print(r.stderr[-2000:]); raise SystemExit(1)
    return r

items = [(os.path.join(ROOT, s["vo"]) if not os.path.isabs(s["vo"]) else s["vo"], s["vo_at"], 0, "vo") for s in TL["segments"]]
items += [(os.path.join(ROOT, "Sound_Effects", "whoosh_soft.mp3"), max(0, s["start"] - 0.25), -16, "sfx") for s in TL["segments"][1:]]
items += [(os.path.join(ROOT, "Sound_Effects", f + ".mp3"), max(0, cue(w) - (0.4 if f == "strain_tink" else 0)), g, "sfx") for f, w, g in SFXMAP]
args = ["ffmpeg", "-y", "-v", "error"]; fl = []
for i, (p, st, g, kind) in enumerate(items):
    args += ["-i", p]
    pre = "highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2," if kind == "vo" else ""
    fl.append(f"[{i}:a]aformat=sample_rates=48000:channel_layouts=stereo,{pre}volume={g}dB,adelay={int(st * 1000)}:all=1[a{i}]")
vo_idx = [i for i, x in enumerate(items) if x[3] == "vo"]; sfx_idx = [i for i, x in enumerate(items) if x[3] == "sfx"]
m = len(items); args += ["-ss", str(MUSIC[1]), "-i", os.path.join(ROOT, "Music", MUSIC[0] + ".mp3")]
fl.append("".join(f"[a{i}]" for i in vo_idx) + f"amix=inputs={len(vo_idx)}:normalize=0,apad,atrim=0:{DUR}[vo]")
fl.append("".join(f"[a{i}]" for i in sfx_idx) + f"amix=inputs={len(sfx_idx)}:normalize=0,apad,atrim=0:{DUR}[sfx]")
fl.append(f"[{m}:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:{DUR},afade=t=in:d=0.6,afade=t=out:st={DUR - 1.6}:d=1.6,volume=-8dB[mus]")
fl.append("[vo]asplit=2[v1][vk];[mus][vk]sidechaincompress=threshold=0.02:ratio=5:attack=20:release=350[md];[v1][md][sfx]amix=inputs=3:normalize=0[o]")
pre = os.path.join(D, "premix.wav")
run(args + ["-filter_complex", ";".join(fl), "-map", "[o]", "-c:a", "pcm_s24le", pre])
r = run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1:LRA=9:print_format=json", "-f", "null", "-"])
mm = json.loads(r.stderr[r.stderr.rindex("{"):r.stderr.rindex("}") + 1])
run(["ffmpeg", "-y", "-v", "error", "-i", pre, "-af", f"loudnorm=I=-14:TP=-1:LRA=9:measured_I={mm['input_i']}:measured_TP={mm['input_tp']}:"
     f"measured_LRA={mm['input_lra']}:measured_thresh={mm['input_thresh']}:offset={mm['target_offset']}:linear=true,aresample=48000",
     "-c:a", "pcm_s24le", os.path.join(D, "mix.wav")])
os.remove(pre); print(K, "mix ok")
