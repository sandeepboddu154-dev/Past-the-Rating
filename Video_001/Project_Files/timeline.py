#!/usr/bin/env python3
"""Build the master timeline from script.json + per-scene narration metadata.
Output: Project_Files/timeline.json with segments (visual units) and absolute word timings."""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 24
CHAPTER_LEN = 2.6     # chapter card duration (no narration)
DEFAULT_LEAD = 0.35   # silence before narration within a scene
DEFAULT_TAIL = 0.65   # breathing room after narration

def snap(x):  # snap to frame grid so segment cuts are frame-exact
    return round(x * FPS) / FPS

def norm(w):
    return re.sub(r"[^a-z0-9']", "", w.lower())

def build(script_path, vo_dir, out_path):
    sc = json.load(open(script_path))
    segs, words_abs, t = [], [], 0.0
    NOHUD = {"S03", "S20", "S26", "S27"}; cur_ch = "Cold open"
    for s in sc["scenes"]:
        meta = json.load(open(os.path.join(vo_dir, f"{s['id']}.json")))
        if s.get("chapter"):
            d = snap(CHAPTER_LEN)
            segs.append({"id": f"CH{s['chapter']}", "visual": "chapter", "start": t, "dur": d,
                         "params": {"num": s["chapter"], "title": s["chapter_title"]}})
            t = snap(t + d); cur_ch = f"{s['chapter']} · {s['chapter_title']}"
        lead, tail = s.get("lead", DEFAULT_LEAD), s.get("tail", DEFAULT_TAIL)
        d = snap(lead + meta["duration"] + tail)
        words = [{"w": w["w"], "n": norm(w["w"]), "s": round(w["s"] + lead, 3), "e": round(w["e"] + lead, 3)} for w in meta["words"]]
        segs.append({"id": s["id"], "visual": s["visual"], "start": t, "dur": d, "vo": f"Voiceover/scenes/{s['id']}.mp3",
                     "vo_at": round(t + lead, 3), "vo_dur": meta["duration"], "words": words,
                     "hud": None if s["id"] in NOHUD else cur_ch})
        words_abs += [{"w": w["w"], "s": round(t + w["s"], 3), "e": round(t + w["e"], 3), "scene": s["id"]} for w in words]
        t = snap(t + d)
    json.dump({"fps": FPS, "duration": t, "segments": segs, "words": words_abs}, open(out_path, "w"), indent=1)
    print(f"timeline: {len(segs)} segments, {t:.2f}s ({int(t // 60)}:{t % 60:05.2f})")

if __name__ == "__main__":
    build(os.path.join(ROOT, "Script/script.json"), os.path.join(ROOT, "Voiceover/scenes"),
          os.path.join(ROOT, "Project_Files/timeline.json"))
