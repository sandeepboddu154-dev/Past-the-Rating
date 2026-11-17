#!/usr/bin/env python3
"""Generate per-scene narration with ElevenLabs (timestamps). Resumable: cached by text hash.
Usage: python3 tts.py <script.json> <out_dir>
The API key is injected by the session's network proxy; no key is read or stored here."""
import base64, hashlib, json, os, sys, time, urllib.request, subprocess

API = "https://api.elevenlabs.io/v1/text-to-speech/{vid}/with-timestamps?output_format=mp3_44100_192"

def call(vid, body):
    req = urllib.request.Request(API.format(vid=vid), data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json", "xi-api-key": "proxy-injected"})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                return json.load(r)
        except Exception as e:
            print("  retry", attempt + 1, e); time.sleep(4 * (attempt + 1))
    raise SystemExit("TTS failed")

def words_from_alignment(al):
    chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    words, cur, ws = [], "", None
    for c, s, e in zip(chars, st, en):
        if c.isspace():
            if cur: words.append({"w": cur, "s": ws, "e": pe}); cur = ""
        else:
            if not cur: ws = s
            cur += c; pe = e
    if cur: words.append({"w": cur, "s": ws, "e": pe})
    return words

def main(script_path, out_dir):
    sc = json.load(open(script_path)); v = sc["voice"]; os.makedirs(out_dir, exist_ok=True)
    scenes = sc.get("scenes") or sc.get("lines")
    for i, s in enumerate(scenes):
        text = s["vo"]
        key = hashlib.sha1(json.dumps([text, v], sort_keys=True).encode()).hexdigest()[:12]
        mp3, meta = os.path.join(out_dir, f"{s['id']}.mp3"), os.path.join(out_dir, f"{s['id']}.json")
        if os.path.exists(meta) and json.load(open(meta)).get("hash") == key and os.path.exists(mp3):
            print(s["id"], "cached"); continue
        body = {"text": text, "model_id": v["model_id"], "voice_settings": v["settings"]}
        if i > 0: body["previous_text"] = scenes[i - 1]["vo"]
        if i < len(scenes) - 1: body["next_text"] = scenes[i + 1]["vo"]
        d = call(v["voice_id"], body)
        open(mp3, "wb").write(base64.b64decode(d["audio_base64"]))
        al = d.get("normalized_alignment") or d.get("alignment")
        dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp3],
                                   capture_output=True, text=True).stdout)
        json.dump({"hash": key, "id": s["id"], "text": text, "duration": dur, "words": words_from_alignment(al)},
                  open(meta, "w"), indent=1)
        print(s["id"], f"{dur:.2f}s", len(text), "chars")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
