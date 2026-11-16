#!/usr/bin/env python3
"""Final audio mix: narration + score (sidechain-ducked under VO) + word-cued SFX, loudness-normalised to -14 LUFS.
Usage: python3 mix.py → Project_Files/mix/final_mix.wav (+ stems)"""
import json, os, re, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "Project_Files/mix"); os.makedirs(OUT, exist_ok=True)
TL = json.load(open(os.path.join(ROOT, "Project_Files/timeline.json")))
DUR = TL["duration"]
seg = {s["id"]: s for s in TL["segments"]}
n = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())

def cue(sid, word, k=1, offset=0.0):
    s = seg[sid]; c = 0
    for w in s.get("words", []):
        if n(w["w"]) == n(word):
            c += 1
            if c == k: return s["start"] + w["s"] + offset
    raise KeyError(f"cue {word} not in {sid}")

# ── Music placements: (file, start, gain_dB, fade_in, fade_out_at(abs), fade_out_len, filters)
LIMIT = cue("S03", "limit")
MUSIC = [   # every point is derived from the timeline, so re-voicing or re-timing never desyncs the score
    ("M1_coldopen", 0.0, -3, 1.5, LIMIT + 0.7, 0.4, f"atempo={26.5 / LIMIT:.4f}"),   # 26.5 s of energy stretched to land on "limit"
    ("M2_atrium", seg["CH01"]["start"] - 2.6, -2, 1.2, seg["CH03"]["start"] - 1.2, 3.0, None),
    ("M3_change", seg["CH03"]["start"], -3, 1.5, seg["CH04"]["start"] + 1.0, 3.5, None),
    ("M4_day", seg["CH04"]["start"] - 1.6, -2, 1.5, cue("S19", "dropped") - 0.1, 0.25, None),   # cuts to silence on "dropped"
    ("M5_memorial", seg["S20"]["start"] + 0.8, -4, 2.5, seg["CH05"]["start"] - 0.5, 1.5, None),
    ("M6_aftermath", seg["CH05"]["start"] - 0.6, -3, 2.5, seg["S26"]["start"] + 0.2, 3.0, None),
    ("M7_closing", seg["S26"]["start"] + 2.6, -2, 2.0, DUR - 0.1, 3.0, None),
]
# ── SFX: (file, abs_time, gain_dB)
def sfx_list():
    L = []
    for w in ("beam", "bolt", "weld"): L.append(("tick_ui", cue("S01", w), -8))
    L += [("strain_tink", cue("S02", "doubled") - 0.4, -6),
          ("strain_tink", cue("S03", "limit") - 0.9, -3), ("hit_low", cue("S03", "limit") + 0.1, -1),
          ("whoosh_soft", cue("S03", "limit") + 1.5, -8), ("chapter_tick", cue("S03", "limit") + 2.3, -7)]
    for s in TL["segments"]:
        if s["visual"] == "chapter": L.append(("chapter_tick", s["start"] + 0.05, -6))
    L += [("hall_ambience", cue("S06", "tea") - 0.5, -20),
          ("tick_ui", cue("S08", "welded"), -8), ("tick_ui", cue("S08", "nut"), -8), ("strain_tink", cue("S08", "all") - 0.3, -8),
          ("tick_ui", cue("S10", "sixty"), -6),
          ("whoosh_soft", cue("S12", "instead"), -10),
          ("strain_tink", cue("S13", "everything") - 0.4, -5),
          ("hit_low", cue("S15", "twice"), -9),
          ("stamp", cue("S16", "stamp") + 0.05, -4),
          ("rumble", cue("S17", "collapsed"), -14),
          ("hall_ambience", seg["S18"]["start"] + 0.2, -19), ("clock_tick", seg["S18"]["start"] + 6.0, -14), ("clock_tick", seg["S18"]["start"] + 12.0, -13),
          ("weld_crack", cue("S19", "split") - 0.6, -4), ("strain_tink", cue("S19", "nuts"), -6), ("rumble", cue("S19", "dropped"), -6),
          ("hydraulic", cue("S21", "laboratory") - 0.3, -10), ("tick_ui", cue("S21", "thirtyone"), -6),
          ("stamp", cue("S24", "stamp"), -2)]
    for w in ("tightened", "fresh", "ethics"): L.append(("tick_ui", cue("S25", w) + 0.3, -8))
    L += [("hit_low", cue("S26", "how") - 0.1, -10), ("whoosh_soft", seg["S27"]["start"] + 0.1, -10)]
    return L

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print(r.stderr[-3000:]); raise SystemExit("ffmpeg failed")
    return r

def bus(name, items):
    """items: list of (path, start, gain_dB, extra_filter) → stem WAV of full duration"""
    args, fl = ["ffmpeg", "-y", "-v", "error"], []
    for i, (p, st, g, ex) in enumerate(items):
        args += ["-i", p]
        chain = f"[{i}:a]aformat=sample_rates=48000:channel_layouts=stereo"
        if ex: chain += f",{ex}"
        chain += f",volume={g}dB,adelay={int(round(st * 1000))}:all=1[a{i}]"
        fl.append(chain)
    fl.append("".join(f"[a{i}]" for i in range(len(items))) + f"amix=inputs={len(items)}:normalize=0:dropout_transition=0,apad,atrim=0:{DUR}[out]")
    out = os.path.join(OUT, f"{name}.wav")
    run(args + ["-filter_complex", ";".join(fl), "-map", "[out]", "-c:a", "pcm_s24le", out]); return out

def main():
    # Narration bus (light polish: high-pass, gentle compression, de-ess-ish presence control)
    vo_items = [(os.path.join(ROOT, s["vo"]), s["vo_at"], 0, "highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2")
                for s in TL["segments"] if s.get("vo")]
    vo = bus("stem_vo", vo_items)
    mus_items = []
    for f, st, g, fi, fo_at, fo_len, ex in MUSIC:
        flt = ",".join(x for x in [ex, f"afade=t=in:d={fi}", f"afade=t=out:st={max(0, fo_at - st - fo_len):.3f}:d={fo_len}",
                                    f"atrim=0:{fo_at - st:.3f}"] if x)
        mus_items.append((os.path.join(ROOT, "Music", f + ".mp3"), st, g, flt))
    mus = bus("stem_music_raw", mus_items)
    sfx = bus("stem_sfx", [(os.path.join(ROOT, "Sound_Effects", f + ".mp3"), t, g, None) for f, t, g in sfx_list()])
    # Duck music under narration (sidechain), then sum
    pre = os.path.join(OUT, "premix.wav")
    run(["ffmpeg", "-y", "-v", "error", "-i", vo, "-i", mus, "-i", sfx, "-filter_complex",
         "[0:a]asplit=2[v1][vkey];[1:a]volume=-9dB[m];[m][vkey]sidechaincompress=threshold=0.02:ratio=6:attack=25:release=450:makeup=1[md];"
         "[v1][md][2:a]amix=inputs=3:normalize=0[o]", "-map", "[o]", "-c:a", "pcm_s24le", pre])
    # Two-pass loudness normalisation to -14 LUFS / -1.0 dBTP (YouTube reference)
    r = run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json", "-f", "null", "-"])
    m = json.loads(r.stderr[r.stderr.rindex("{"):r.stderr.rindex("}") + 1])
    final = os.path.join(OUT, "final_mix.wav")
    run(["ffmpeg", "-y", "-v", "error", "-i", pre, "-af",
         f"loudnorm=I=-14:TP=-1.0:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:"
         f"measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample=48000", "-c:a", "pcm_s24le", final])
    print("mix ok:", final, "| measured in:", m["input_i"], "LUFS")

if __name__ == "__main__":
    main()
