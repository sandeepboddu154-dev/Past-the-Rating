#!/usr/bin/env python3
"""Money To Scale #1 — score (ElevenLabs Music) + SFX (ElevenLabs Sound Effects). Cached."""
import json, os, sys, time, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = ("Instrumental only, no vocals. Modern explainer documentary score for a personal-finance channel. Key of F major, 92 BPM. "
        "Warm, curious, precise and intelligent, never cheesy or corporate. Palette: soft felt piano, warm analog synth arpeggio, light pizzicato strings, "
        "subtle brushed percussion, airy pads. Leaves space for narration. ")
MUSIC = {
 "M1_open":     (32, BASE+"Opening: sense of wonder and scale. A single felt-piano motif over a slow rising pad, gentle arpeggio enters, builds curiosity, ends on a suspended chord."),
 "M2_stack":    (88, BASE+"Playful and precise, like watching something being built piece by piece. Light ticking arpeggio, pizzicato, steady and consistent, no big drops."),
 "M3_saving":   (40, BASE+"Patient and slightly melancholic. Slower, sparse piano and soft strings, a feeling of a very long road. In D minor relative mood."),
 "M4_investing":(108,BASE+"Momentum that builds. Starts quiet and modest, then gradually accelerates and brightens over two minutes with layered arpeggios and light percussion, uplifting but restrained, ending confident."),
 "M5_inflation":(40, BASE+"Uneasy and thinning. Detuned pad, slow pulse, notes dropping away, a quiet sense of something shrinking."),
 "M6_enough":   (42, BASE+"Reflective and honest. Sparse piano with soft pad, contemplative, unresolved."),
 "M7_levers":   (78, BASE+"Purposeful and motivating. Clear rhythmic pulse, optimistic piano motif returns, steady build of energy, practical and hopeful."),
 "M8_close":    (50, BASE+"Closing theme: the opening piano motif returns over warm strings, resolving gently to a confident, calm ending. Fade out."),
}
SFX = {
 "bundle_set":   (1.0,"A thick bundle of paper banknotes placed down on a wooden table, soft papery thud, close and dry"),
 "riffle":       (2.0,"Banknote counting machine riffling quickly through a stack of notes, short burst"),
 "clock_fast":   (4.0,"Mechanical clock ticking quickly, time passing, clean"),
 "shrink":       (2.5,"Soft descending tonal whoosh, something shrinking, subtle"),
 "rise":         (2.5,"Soft ascending tonal swell, something growing, subtle, clean"),
}
def post(url, body, out):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={"Content-Type":"application/json","xi-api-key":"proxy-injected"})
    for a in range(3):
        try:
            with urllib.request.urlopen(req, timeout=600) as r: open(out,"wb").write(r.read()); return
        except Exception as e: print(" retry",a+1,getattr(e,'read',lambda:b'')()[:200] or e); time.sleep(5*(a+1))
    raise SystemExit("failed "+out)
for k,(sec,p) in MUSIC.items():
    o=os.path.join(ROOT,"Music",k+".mp3")
    if not os.path.exists(o): post("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_192",{"prompt":p,"music_length_ms":sec*1000},o); print(k,"ok")
for k,(sec,p) in SFX.items():
    o=os.path.join(ROOT,"Sound_Effects",k+".mp3")
    if not os.path.exists(o): post("https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_192",{"text":p,"duration_seconds":sec,"prompt_influence":0.55},o); print(k,"ok")
json.dump({"music":{k:v[1] for k,v in MUSIC.items()},"sfx":{k:v[1] for k,v in SFX.items()}},open(os.path.join(ROOT,"Music","prompts.json"),"w"),indent=1)
