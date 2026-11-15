#!/usr/bin/env python3
"""Timeline for a vertical Short: python3 shorts_timeline.py Shorts/SH-A"""
import json, os, sys
FPS = 24
snap = lambda x: round(x * FPS) / FPS
d = sys.argv[1]
sc = json.load(open(os.path.join(d, "script.json")))
segs, words, t = [], [], 0.0
for i, s in enumerate(sc["scenes"]):
    meta = json.load(open(os.path.join(d, "vo", f"{s['id']}.json")))
    lead, tail = 0.05, (0.45 if i == len(sc["scenes"]) - 1 else 0.1)
    dur = snap(lead + meta["duration"] + tail)
    w = [{"w": x["w"], "s": round(x["s"] + lead, 3), "e": round(x["e"] + lead, 3)} for x in meta["words"]]
    segs.append({"id": s["id"], "visual": s["visual"], "focus": s["focus"], "title": sc["title"], "start": t, "dur": dur,
                 "vo": os.path.join(d, "vo", f"{s['id']}.mp3"), "vo_at": round(t + lead, 3), "words": w})
    words += [{"w": x["w"], "s": round(t + x["s"], 3), "e": round(t + x["e"], 3), "scene": s["id"]} for x in w]
    t = snap(t + dur)
json.dump({"fps": FPS, "duration": t, "segments": segs, "words": words}, open(os.path.join(d, "timeline.json"), "w"), indent=1)
print(d, f"{t:.2f}s", "OK" if 30 <= t <= 40 else "OUT OF RANGE")
