# Production Report — Past The Rating · Video 001
**"The Drawing Change That Doubled the Load" (Hyatt Regency, 1981)** · Produced 15 Nov 2026

## 1. Creative decision
**Topic:** the Hyatt Regency walkway collapse, taken from the channel's own strategy (LF-01).
**Why it's the strongest first production:** it embodies the brand thesis (a rated connection, a change that doubled its load, a documented investigation, and an accountability/"money" layer). The mechanism is a diagram, so it plays to the highest-quality format available. It has evergreen search demand (taught in every engineering-ethics course). It is advertiser-safer than gore-driven disaster content, and it yields three independent Shorts.

**Creative direction:** a premium technical-documentary motion-graphics film. Blueprint-dark world, steel linework, a single orange accent for the failure path, a persistent case-file HUD, slow camera moves, film grain and vignette. **No AI-fabricated footage of a real tragedy** (ethical choice; it also means no synthetic-content disclosure is required). People are only ever abstract figures; the collapse is shown as line diagrams, then a silent memorial card.

## 2. Final deliverables

| # | Deliverable | Path |
|---|---|---|
| 1 | **Final long-form MP4 (4K)** | `Video_001/Final_Exports/PTR_Video001_Hyatt_Regency_4K.mp4` |
| 2 | **Short SH-A** "One change. Double the load." | `Video_001/Final_Exports/PTR_Short_SH-A.mp4` |
| 2 | **Short SH-B** "It wasn't overloaded." | `Video_001/Final_Exports/PTR_Short_SH-B.mp4` |
| 2 | **Short SH-C** "If your stamp is on it." | `Video_001/Final_Exports/PTR_Short_SH-C.mp4` |
| 3 | **Thumbnail** (upload) / 4K master | `Video_001/Final_Exports/thumbnail_1280x720.jpg` · `Video_001/Thumbnails/thumbnail_master_3840x2160.png` |
| 4 | **Final narration audio** | `Video_001/Voiceover/Video_001_narration_full.mp3` (WAV master alongside; per-scene files in `Voiceover/scenes/`) |
| 5 | **Complete script** | `Video_001/Script/Video_001_script.md` (timecoded) · `Script/script.json` · Shorts: `Script/script_short_SH-*.json` |
| 6 | **Subtitles (SRT)** | `Video_001/Final_Exports/Video_001_en.srt` (also embedded in the MP4) · Shorts: `Shorts/SH-*/SH-*.srt` |
| 7–8 | **Title, description, 3 alternative titles, tags, hashtags, pinned comment, schedule** | `Video_001/Final_Exports/youtube_package.md` |
| 9 | **Research & fact-check record** | `Video_001/Research/fact_check.md` |
| 10 | **This production report** + raw QC output | `Video_001/Production_Report/production_report.md` · `qc_longform.json` |
| 11 | **Reusable assets & pipeline** | `Video_001/Project_Files/` (engine, timeline, TTS, music/SFX generation, mix, subtitles, assembly, QC) · `Music/` · `Sound_Effects/` |

## 3. Technical specifications (measured from the exported files)

| | Long-form | SH-A | SH-B | SH-C |
|---|---|---|---|---|
| Duration | **8:37.25** (517.25 s) | **38.83 s** | **34.25 s** | **36.29 s** |
| Resolution | **3840×2160** (native 4K vector render) | 1080×1920 | 1080×1920 | 1080×1920 |
| Frame rate | 24 fps constant (12,414 frames) | 24 fps | 24 fps | 24 fps |
| Video | H.264 High, yuv420p, ~8.8 Mb/s | H.264, ~2.4 Mb/s | ~2.5 Mb/s | ~2.1 Mb/s |
| Audio | AAC-LC 48 kHz stereo ~282 kb/s | AAC 48 kHz stereo | same | same |
| Loudness | **−14.0 LUFS**, peak −0.8 dBFS | −14.0 LUFS | −14.0 LUFS | −14.0 LUFS |
| Subtitles | Embedded English track + SRT | Burned-in karaoke captions + SRT | same | same |
| File size | **588 MB** | 12.8 MB | 11.8 MB | 10.0 MB |

## 4. Quality control performed
- **Automated (every export):** full decode with zero errors; **no black frames, no frozen frames**; resolution and frame-rate check; loudness and peak; silence map.
- **Silence review:** three short silences remain on purpose: a 1.5 s breath before "04 · The Day", 3.0 s of respectful silence after the collapse, and a 1.5 s pause before the closing line. Two other dead-air gaps (title card, chapter cards) were found and fixed by re-timing music.
- **Narration accuracy:** ElevenLabs speech-to-text on the raw voice found **zero misreads** in ~1,150 words.
- **Intelligibility in the final mix:** the final export's audio was transcribed and **every narrated word was recovered** (remaining diffs are digits vs words, e.g. "114").
- **Music:** all 7 cues transcribed to confirm **no vocals**; spectrograms checked for arc and endings.
- **Visual review:** every scene was inspected via contact sheets at three stages. **Fixes made:** labels enlarged for mobile; crowd rendering cleaned; walkway clipping the wall; decimal counters; empty first seconds of the hook (now a moving Rating Bar from frame 1); clipped labels; HUD/text collisions; header-over-linework (added editorial plates); Shorts crop clipping; and a wrong shot order in SH-C (cue fallback bug).
- **Fact-check:** 21 claims verified; 4 claims removed or reworded (see `Research/fact_check.md`).
- **Rights:** no third-party footage, images, music or watermarks. All visuals are original code-rendered graphics; voice, music and SFX were generated under your ElevenLabs Creator subscription.

## 5. Tools actually used
| Tool | Role |
|---|---|
| **ElevenLabs** (your Creator plan, key supplied via the secure form) | Narration: voice "George" (premade, British narrative), model **Eleven v4**, speed 0.93 long-form / 1.0 Shorts, with request stitching for continuous prosody. **Music API** (7 score cues). **Sound Effects API** (11 SFX). **Speech-to-Text** (QC). |
| **Chromium + Playwright** (local) | Custom SVG motion-graphics engine, rendered frame-by-frame at native 3840×2160 (16:9) and 1080×1920 (9:16) |
| **FFmpeg** (local) | H.264 encoding, lossless segment concat, sidechain ducking, two-pass EBU R128 loudness, QC (blackdetect, freezedetect, silencedetect, ebur128) |
| **Python / numpy / ImageMagick** (local) | Timelines, word-timed subtitles, film grain, voice analysis, contact sheets |

**Not used, and why:** Higgsfield (0 credits; no spend without approval), vidIQ (not needed for production; 4 credits), any AI text-to-video or image generator (none available without new spend), stock or archival libraries (blocked by the sandbox network).

## 6. Costs
| Item | Usage | New cost |
|---|---|---|
| ElevenLabs (TTS, auditions, music, SFX, STT QC) | **20,070 credits** (19,051 → 39,121 of 363,000 this period, ≈5.5%) | **₹0 new.** Consumed from your existing Creator subscription |
| Higgsfield / vidIQ / other APIs | 0 | ₹0 |
| Compute | Local container CPU (≈65 min 4K render + ≈10 min Shorts) | ₹0 |
| **Total new spend** | | **₹0** |

## 7. Limitations and honest notes
- **ElevenLabs was not actually connected** when production started (no connector, no key). You supplied the key through the secure form. It's now saved on a personal cloud environment called **"past-the-rating"** created for this repository.
- **No AI cinematic footage.** This is motion graphics, not photoreal video, and that's deliberate for this subject. Future topics without a tragedy angle (e.g. the 777 wing test) could use generated cinematic B-roll *if* you approve Higgsfield credits.
- **The narration is AI** (stock ElevenLabs voice). It's disclosed in the description. The channel strategy still recommends moving to **your own voice** (or your own consented clone) for long-term authenticity and YPP review safety. The account contains a cloned voice called "Sandy Voice" that I deliberately did not use without your confirmation.
- **I can't listen to audio.** The mix was verified objectively (loudness, ducking, transcription, spectrograms, silence maps). Please give the music and SFX one listen before publishing; that's the one check a human ear does better.
- **Large files aren't in git** (MP4s, WAV masters, 4K segment cache; GitHub's 100 MB limit). They live in the session's working directory. **Download them before this cloud session expires.** Everything can be regenerated from the committed pipeline (ElevenLabs outputs are committed as MP3s, so re-rendering costs no credits).
- **Nothing was published or uploaded to YouTube.** Publishing requires your account.

## 8. How to reproduce or resume
```bash
cd Video_001
python3 Project_Files/tts.py Script/script.json Voiceover/scenes          # cached; regenerates only changed lines
python3 Project_Files/gen_audio.py all                                     # cached
python3 Project_Files/timeline.py
node Project_Files/engine/render.js full Project_Files/timeline.json Visual_Assets/segments 3840 3   # resumable per segment
python3 Project_Files/mix.py && python3 Project_Files/assemble.py long
python3 Project_Files/qc.py Final_Exports/PTR_Video001_Hyatt_Regency_4K.mp4 3840 2160 /tmp/sheet.jpg
# Shorts: shorts_timeline.py → V=1 render.js full … 1080 1 → shorts_mix.py → assemble.py short SH-A
```
