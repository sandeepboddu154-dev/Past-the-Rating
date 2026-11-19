# Asset Ingestion Design

## 1. Project folder contract

```
<Project>/
  inbox/
    veo/          *.mp4 (+ optional <name>.prompt.txt | <name>.json with prompt/seed/model)
    images/       *.png *.jpg *.jpeg *.webp (+ optional .prompt.txt)
    footage/      licensed or project footage (+ <name>.license.txt REQUIRED)
    narration/    ElevenLabs *.mp3/*.wav (+ optional *.json alignment from the /with-timestamps API)
    music/        *.mp3/*.wav
    sfx/          *.mp3/*.wav
  Script/script.json          (existing convention)
  Project_Files/engine/…      (existing SVG/Three.js scenes, if any)
```
Classification uses folder first and extension second, then is confirmed by ffprobe stream types. A misplaced file (e.g. an MP4 in `images/`) is reclassified and flagged, never silently dropped.

## 2. `ingest.py` pipeline (read-only on inputs)

```
for each file:
  1. identity    sha256, size, mtime, relative path          → dedupe exact copies
  2. probe       ffprobe -v error -show_streams -show_format -of json
  3. derive      orientation, DAR, rotation (side_data), VFR flag, colour tags,
                 has_audio, codec, bit depth, duration, frame count
  4. analyse     (video)  one decode pass, scaled to 480 px:
                   blackdetect + freezedetect + signalstats(YAVG,SATAVG) + scene score
                 (audio)  ebur128 + astats (peak, clipping count) + silencedetect
                 (image)  Pillow: size, mode, alpha, EXIF orientation, dHash
  5. keyframes   first / middle / last + scene changes → JPEG thumbs + 6-up contact sheet
  6. pHash       64-bit dHash per keyframe (Pillow + numpy)  → near-duplicate detection
  7. provenance  sidecar prompt/seed/model/license; source = veo|image_gen|elevenlabs|licensed|unknown
  8. flags       computed against the project canvas (below)
write Project_Files/catalog.json  (stable ids = "cat:" + sha256[:12]; re-ingest is idempotent)
```
Inputs are never modified or moved. Derived thumbnails go to `Project_Files/catalog/`.

### Commands (all available in FFmpeg 6.1.1 here)
```bash
ffprobe -v error -show_streams -show_format -of json IN
ffmpeg -v info -i IN -an -vf "scale=480:-2,blackdetect=d=0.4:pix_th=0.025:pic_th=0.995,freezedetect=n=0.0005:d=1.0,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=yavg.txt,select='gt(scene,0.30)',metadata=print:key=lavfi.scene_score:file=scenes.txt" -f null -
ffmpeg -v error -i IN -vf "select='eq(n,0)+eq(n,N/2)+gt(scene,0.30)',scale=384:-2,tile=6x1" -frames:v 1 sheet.jpg
ffmpeg -hide_banner -i AUDIO -af "ebur128=peak=true,astats=metadata=0,silencedetect=n=-45dB:d=1.0" -f null -
```
The black and freeze thresholds reuse `qc.py:18-19` so ingest and final QC agree. Freeze `d` is 1.0 s at ingest (stricter) because AI clips are short.

## 3. `catalog.json` entry

```json
{
  "id": "cat:7f3a9c01b2de",
  "path": "inbox/veo/mumbai_street_dusk_01.mp4",
  "kind": "video", "source": "veo",
  "sha256": "7f3a9c01b2de…", "bytes": 18734211,
  "video": {"codec": "h264", "w": 1920, "h": 1080, "sar": "1:1", "dar": "16:9", "rotation": 0,
            "r_frame_rate": "24/1", "avg_frame_rate": "24/1", "vfr": false, "frames": 192, "duration": 8.0,
            "pix_fmt": "yuv420p", "color": {"space": "bt709", "range": "tv", "primaries": "bt709", "transfer": "bt709"}},
  "audio": {"present": true, "codec": "aac", "rate": 48000, "channels": 2, "lufs": -23.4, "true_peak": -6.1},
  "analysis": {"black": [], "freeze": [[6.9, 8.0]], "yavg_mean": 71.2, "scene_cuts": [], "motion_score": 0.41},
  "keyframes": ["catalog/7f3a…_0.jpg", "catalog/7f3a…_m.jpg", "catalog/7f3a…_l.jpg"],
  "phash": ["d1c3e0f0f8783c1c", "…"],
  "provenance": {"prompt": "Busy Mumbai street at dusk…", "model": "veo (user-reported)", "seed": null, "license": "generated"},
  "flags": ["has_audio", "tail_freeze_1.1s"],
  "description": null,
  "usable": true
}
```
`description` stays null until the director writes a visual description after looking at the keyframes. It is never guessed from the filename.

## 4. Flags computed at ingest

| Flag | Rule | Effect |
|---|---|---|
| `below_canvas` | short side < canvas short side (e.g. 720p on a 1080p canvas) | Allowed with upscale; **review** if scale > 1.5× |
| `below_4k_canvas` | source < 2160p on a 4K project (Video_001 is 4K) | Review: upscaling AI clips to 4K is visible |
| `aspect_mismatch` | DAR ≠ canvas DAR | Requires an explicit frame mode in the plan |
| `vfr` | `r_frame_rate` ≠ `avg_frame_rate` | Forced `fps=24` conform |
| `non_24` | fps ∉ {24, 23.976} | Conform with judder warning (see processing design) |
| `rotation` | rotate side-data ≠ 0 | Apply rotation before scaling |
| `has_audio` | audio stream present | Default `audio: drop`; optional extraction for the mix |
| `freeze_head/tail/mid` | freezedetect ≥ 1 s | Trim around it or reject |
| `black_*` | blackdetect | Trim or reject |
| `near_duplicate_of:<id>` | dHash Hamming ≤ 6 on any keyframe pair | Director must justify reuse |
| `exact_duplicate_of:<id>` | same sha256 | Keep one catalog entry, list all paths |
| `no_license` | `footage/` without `.license.txt` | **Block** use (matches the rights rule in `docs/07-workflow-and-qc.md:46`) |
| `low_bitrate` | < 0.05 bits/pixel/frame | Review |

## 5. Narration import (`vo_import.py`)

The existing contract `timeline.py` reads is `Voiceover/scenes/<id>.mp3` plus `<id>.json` = `{hash, id, text, duration, words[{w,s,e}]}` (`tts.py:49`, `timeline.py:23,32`). Import produces exactly that.

| Input supplied | Procedure | Cost |
|---|---|---|
| Per-scene MP3 **with** ElevenLabs `/with-timestamps` JSON | Convert the alignment with the same grouping as `tts.words_from_alignment` (`tts.py:20-30`); duration from ffprobe | Free |
| Per-scene MP3 without timestamps | ElevenLabs forced alignment (audio + known script text) to get word times | Uses credits (estimate via `budget.py`; rate NOT VERIFIED) |
| One long narration file | Forced alignment of the full script, split at scene-text boundaries (cut in the inter-sentence gap, with 30 ms fades) into per-scene files | Uses credits once |
| No script text | STT with word timestamps (ElevenLabs STT); the transcript becomes the scene text after human review | Uses credits |

Local free alternative: none with the current install (Whisper or aeneas-class aligners need extra installs, and torch for Whisper). Optional phase.

**Safety rule (important):** imported sidecars carry `"source": "import"`, and their `hash` will not match `tts.py`'s `sha1([text, voice])`. **Running the existing `tts.py` on an imported project would re-voice it, spending credits and overwriting the user's narration** (`tts.py:39-44`). `build.py` must refuse to run `tts.py` when any sidecar has `source: import`; the docs must warn against running it by hand.

## 6. Music and SFX import
Catalogued with loudness and peak. In phase 1 they are referenced from the project's own copy of `mix.py` (the existing per-project convention: placements are code, `mix.py:22-55`). A data-driven `mix_plan.json` is a later milestone (`IMPLEMENTATION_SEQUENCE.md` M9), so existing `mix.py` files stay untouched.
