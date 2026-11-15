#!/usr/bin/env python3
"""Generate the score (ElevenLabs Music) and SFX (ElevenLabs Sound Effects). Cached: existing files are skipped.
Usage: python3 gen_audio.py [music|sfx|all]"""
import json, os, sys, time, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = ("Instrumental only, no vocals, no choir. Cinematic investigative documentary underscore. "
        "Key of D minor, 70 BPM. Restrained, intelligent, modern. Palette: low cello and double bass, "
        "soft analog synth pulse, felt piano, subtle metallic textures. Leaves space for narration. ")
MUSIC = {
  "M1_coldopen":   (40, BASE + "Opening: a single sustained low drone with a quiet ticking synth pulse; tension rises steadily for 35 seconds, "
                         "subtle metallic shimmer, building to a held peak, then ends abruptly on silence."),
  "M2_atrium":     (132, BASE + "Curious and observational. Gentle steady analog pulse, sparse felt-piano motif of three notes, warm low strings underneath. "
                          "Calm forward motion like examining blueprints. Very consistent energy, no big drops, no drums."),
  "M3_change":     (134, BASE + "Growing unease. The same pulse becomes a tighter ticking clock, low strings slowly swell, occasional dissonant piano notes. "
                          "Gradual build over two minutes without climax. No drums."),
  "M4_day":        (36, BASE + "Dread. Slow low string swell over a heartbeat-like sub pulse, high faint harmonics, tension rising continuously "
                          "for 30 seconds to an unresolved peak, then stops suddenly."),
  "M5_memorial":   (20, "Instrumental only, no vocals. Solemn, respectful, quiet. Solo felt piano, very slow, sparse notes in D minor with long "
                         "silences and soft room reverb. Mournful but dignified. No percussion."),
  "M6_aftermath":  (120, BASE + "Reflective and resolute. Steady medium-low pulse, felt piano motif returns in a more hopeful voicing, "
                          "warm cello lines, measured and serious, like an investigation reaching conclusions. No drums."),
  "M7_closing":    (40, BASE + "Closing theme: the three-note piano motif over warm strings, a slow build to a quiet, confident resolution "
                         "in D major at the end, gentle fade out. No drums."),
}
SFX = {
  "strain_tink":   (3.0, "Heavy steel beam creaking under extreme strain, then a single sharp high metallic tink, large empty hall reverb"),
  "hit_low":       (3.0, "Deep cinematic sub boom impact with long dark tail, documentary trailer hit, no music"),
  "whoosh_soft":   (1.5, "Soft airy cinematic whoosh transition, subtle, clean"),
  "tick_ui":       (0.6, "Single soft precise mechanical click, like a measuring instrument"),
  "stamp":         (1.0, "Rubber stamp pressed firmly onto paper on a wooden desk, single thud"),
  "weld_crack":    (2.5, "Steel weld seam cracking and tearing under load, sharp metallic snap and groan, no explosion"),
  "rumble":        (4.0, "Distant heavy low rumble of a structure giving way, muffled, deep, no screams, no voices"),
  "hall_ambience": (12.0, "Large hotel atrium ambience with a big crowd murmuring softly and distant big band music, muffled, reverberant"),
  "clock_tick":    (6.0, "Slow mechanical wall clock ticking in a quiet room"),
  "hydraulic":     (3.0, "Laboratory hydraulic press slowly applying load to steel, mechanical hum and creak"),
  "chapter_tick":  (1.2, "Soft cinematic tick with a short reverse swell, minimal, for a title card"),
}

def post(url, body, out, timeout=600):
    req = urllib.request.Request(url, data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json", "xi-api-key": "proxy-injected"})
    for a in range(3):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                open(out, "wb").write(r.read()); return
        except Exception as e:
            msg = e.read()[:300] if hasattr(e, "read") else e
            print("  retry", a + 1, msg); time.sleep(5 * (a + 1))
    raise SystemExit(f"failed: {out}")

def main(which):
    if which in ("music", "all"):
        d = os.path.join(ROOT, "Music"); os.makedirs(d, exist_ok=True)
        for k, (secs, prompt) in MUSIC.items():
            out = os.path.join(d, f"{k}.mp3")
            if os.path.exists(out): print(k, "cached"); continue
            post("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_192",
                 {"prompt": prompt, "music_length_ms": secs * 1000}, out); print(k, "ok")
        json.dump({k: v[1] for k, v in MUSIC.items()}, open(os.path.join(d, "prompts.json"), "w"), indent=1)
    if which in ("sfx", "all"):
        d = os.path.join(ROOT, "Sound_Effects"); os.makedirs(d, exist_ok=True)
        for k, (secs, prompt) in SFX.items():
            out = os.path.join(d, f"{k}.mp3")
            if os.path.exists(out): print(k, "cached"); continue
            post("https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_192",
                 {"text": prompt, "duration_seconds": secs, "prompt_influence": 0.55}, out); print(k, "ok")
        json.dump({k: v[1] for k, v in SFX.items()}, open(os.path.join(d, "prompts.json"), "w"), indent=1)

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "all")
