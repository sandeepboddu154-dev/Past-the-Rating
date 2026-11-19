# Audio & Synchronization Analysis

Branch audited: `claude/past-the-rating-monetization-n5o38k`. This is the most mature part of the system.

## 1. How narration is loaded
Narration is **generated, not loaded**. `tts.py` calls ElevenLabs once per scene:

```
POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/with-timestamps?output_format=mp3_44100_192   (tts.py:7)
body = {text, model_id, voice_settings, previous_text, next_text}                                       (tts.py:41-43)
```
- The voice, model (`eleven_v4`) and settings come from `script.json → voice`. Speed is 0.86 for Video_001 and 0.9 for MTS.
- `previous_text`/`next_text` request stitching keeps prosody continuous across separate scene files.
- Results are cached by `sha1([text, voice])[:12]`, so only changed lines are re-voiced (`tts.py:37-40`).
- Pre-existing ElevenLabs files supplied by a user **are not supported**. They would have no `.json` word-timing sidecar, and `timeline.py:23` requires one.

## 2. Segmentation
Yes. **One MP3 per scene** (`Voiceover/scenes/S01.mp3` … `S27.mp3`), and the split is set by the author in `script.json`. The full narration MP3s in `Voiceover/` are deliverable exports, not pipeline inputs.

## 3. Timestamps
- Word timings come from the ElevenLabs `normalized_alignment` (or `alignment`) character arrays and are grouped into words on whitespace (`tts.py:20-30,46`).
- Scene duration comes from `ffprobe` of the MP3 (`tts.py:47`).
- Absolute time: `start(scene) + lead + word.s` (`timeline.py:31,35`).
- Everything is snapped to the 24 fps frame grid (`timeline.py:12-13`).

## 4. Subtitles vs speech
They are synchronized to the **synthesized speech's own alignment**, which matches the actual audio closely.
- `subs.py:9-28` breaks cues at sentence ends, gaps over 0.6 s, 42 characters, 5.5 s maximum, or a scene change, and adds 0.25 s of display padding.
- Side effect: because `normalized_alignment` is preferred, some numbers appear spelled out ("around sixteen hundred people came", `Video_001_en.srt:159`) while others stay as digits ("1981.", `:527`). The style is inconsistent.
- Long-form uses a soft `mov_text` track. Shorts burn karaoke captions inside the engine, highlighting the active word in orange (`engine_v.html:483-487`).

## 5–7. Music, volume, ducking
- **Music is generated** with the ElevenLabs Music API, one cue per chapter (7 cues in Video_001, 8 in MTS). Each has a fixed length and a shared style prompt (`gen_audio.py:7-25,57-58`).
- **Placement** is derived from timeline anchors (chapter starts, specific words), not hard-coded seconds (`mix.py:22-31`; commit `c1d519f` "Music placements now derived from the timeline").
- **Volume:** per-cue gain −2 to −4 dB (`mix.py:24-30`), then the whole music bus at −9 dB (`mix.py:90`).
- **Ducking is implemented** with a real sidechain:
  ```
  [0:a]asplit=2[v1][vkey];[1:a]volume=-9dB[m];
  [m][vkey]sidechaincompress=threshold=0.02:ratio=6:attack=25:release=450:makeup=1[md];
  [v1][md][2:a]amix=inputs=3:normalize=0[o]                                  (mix.py:90-91)
  ```
  Shorts use ratio 5, attack 20, release 350 (`shorts_mix.py:41`).
- **Loudness:** two-pass `loudnorm` to I=−14, TP=−1.0, LRA=11 (Shorts use LRA=9) (`mix.py:93-98`). Measured −14.2 LUFS / −0.8 dBFS (`qc_longform.json`, `MTS qc.json`).

## 8. Sound effects
- Generated with the ElevenLabs Sound Effects API, `prompt_influence 0.55` (`gen_audio.py:65-66`).
- **Positioned by word cue**: `cue(scene_id, word, k, offset)` finds the k-th occurrence of a normalized word in that scene's timings (`mix.py:13-19`).
- Each placement is hand-authored, e.g. `("stamp", cue("S16","stamp")+0.05, -4)` (`mix.py:47`). The MTS list has about 30 entries (`MTS mix.py:19-31`).
- Selection is **manual**. A human or Claude chose each SFX for each word while writing `mix.py`.

## 9. Narration ↔ visuals
Synchronization is structural and exact:
- Each segment's visual duration equals its narration plus padding (`timeline.py:30`).
- Scene animations key off word times through `cueFn(seg)` in the engine (`engine.html` `cueFn`). For example, `S.failure` triggers the split on `c('split')` and the drop on `c('dropped')` (`engine.html:378-395`).

## 10. Narration longer than footage
This cannot happen, because footage length is *computed from* narration. With external clips it would be an unhandled case: there is no freeze-extend, slow-down, loop or fill logic.

## Hard-coded timing values and assumptions

| Value | Where | Risk |
|---|---|---|
| `FPS = 24` | `timeline.py:7`, `shorts_timeline.py:4` | Assumes all visuals are 24 fps |
| `CHAPTER_LEN 2.6`, `DEFAULT_LEAD 0.35`, `DEFAULT_TAIL 0.65` | `timeline.py:8-10` | Fixed pacing |
| Shorts lead 0.05 s, tail 0.1 s (0.45 s on the last scene) | `shorts_timeline.py:11` | |
| `atempo={26.5 / LIMIT}` stretches the cold-open cue to land on "limit" | `mix.py:24` | 26.5 is a magic number tied to one music file |
| Shorts music source offsets `50.0 / 60.0 / 78.0 s` | `shorts_mix.py:16` | Breaks if the music is regenerated |
| Every SFX placement | `mix.py:34-55`, `shorts_mix.py:17-21` | Re-scripting breaks cues; `cue()` raises `KeyError` if a word is missing (fail-loud, which is good) |
| Shorts length 30–40 s | `shorts_timeline.py:19` | Warns only; does not block |
| `NOHUD = {"S03","S20","S26","S27"}` | `timeline.py:21` | Project-specific data inside a "generic" script |

## Known residual issue
`qc.py` found silences of 3.0 s (330.2–333.1) and 1.7 s (464.7–466.4) in Video_001. The production report says these were intentional (respectful silence and a breath).
