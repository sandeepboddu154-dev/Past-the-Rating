#!/usr/bin/env python3
"""Build SRT subtitles from word-level timings. Usage: subs.py <timeline.json> <out.srt> [max_chars] [max_words]"""
import json, sys

def fmt(t):
    h, r = divmod(max(0, t), 3600); m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}".replace(",1000", ",999")

def cues(words, max_chars=42, max_dur=5.5, max_words=99):
    out, cur = [], []
    for i, w in enumerate(words):
        cur.append(w)
        text = " ".join(x["w"] for x in cur)
        end_sentence = w["w"][-1] in ".?!"
        soft = w["w"][-1] in ",;:"
        nxt = words[i + 1] if i + 1 < len(words) else None
        gap = (nxt["s"] - w["e"]) if nxt else 9
        too_long = nxt and len(text) + 1 + len(nxt["w"]) > max_chars
        if (end_sentence or gap > 0.6 or too_long or (soft and len(text) > max_chars * .55)
                or cur[-1]["e"] - cur[0]["s"] > max_dur or len(cur) >= max_words or not nxt
                or (nxt and nxt.get("scene") != w.get("scene"))):
            out.append((cur[0]["s"], cur[-1]["e"], text)); cur = []
    # small display padding without overlapping the next cue
    res = []
    for i, (s, e, t) in enumerate(out):
        nxt = out[i + 1][0] if i + 1 < len(out) else e + 1
        res.append((s, min(e + 0.25, nxt - 0.04), t))
    return res

def write(cs, path):
    with open(path, "w") as f:
        for i, (s, e, t) in enumerate(cs, 1):
            f.write(f"{i}\n{fmt(s)} --> {fmt(e)}\n{t}\n\n")

if __name__ == "__main__":
    tl = json.load(open(sys.argv[1]))
    mc = int(sys.argv[3]) if len(sys.argv) > 3 else 42
    mw = int(sys.argv[4]) if len(sys.argv) > 4 else 99
    cs = cues(tl["words"], mc, max_words=mw); write(cs, sys.argv[2]); print(len(cs), "cues →", sys.argv[2])
