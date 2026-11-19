# Editing Architecture — Current State, Dependencies, and Final Assessment

> Naming note: no "Archiva Studio" code exists. This document describes the only editing system in the repo, the Past The Rating / Money To Scale pipeline on branch `claude/past-the-rating-monetization-n5o38k`. "Archivra" is a separate YouTube channel linked to vidIQ (`docs/01-channel-audit.md:79`).

## 1. Architecture

```
            ┌───────────── authoring (Claude, in-session) ─────────────┐
            │ script.json (id, visual fn, vo text, lead/tail)          │
            │ engine.html scene fns S.*   mix.py cue lists   prompts   │
            └───────────────────────────┬──────────────────────────────┘
   ElevenLabs TTS ◄── tts.py            │
   ElevenLabs Music/SFX ◄── gen_audio.py│
                                        ▼
                     timeline.py ─► timeline.json (single source of timing truth)
                     │                │                 │
          render.js + Chromium     mix.py            subs.py
          (engine.html per frame)  (ffmpeg buses,    (SRT)
          → segments/*.mp4          duck, loudnorm)
                     └──────────► assemble.py (concat copy + mux) ─► qc.py (report)
```

The strength is the **timeline-centric design**: every downstream step (frames, music, SFX, subtitles) derives from `timeline.json`, which derives from the narration's measured word timings.

## 2. Project & asset management (brief §9)

| Question | Finding | Evidence |
|---|---|---|
| Project discovery | None. A project is a hard-coded folder (`Video_001/`, `MTS_Video_001/`). Scripts resolve `ROOT` relative to themselves. | `timeline.py:6`; `finish_1080.sh:4` hard-codes `/home/user/Past-the-Rating/MTS_Video_001` |
| File naming | Convention: `Voiceover/scenes/<SceneID>.mp3/.json`, `Music/M<n>_<name>.mp3`, `Sound_Effects/<name>.mp3`, `Visual_Assets/segments/<SegID>.mp4` | tree listing |
| Asset metadata | Per-scene TTS JSON (`hash, id, text, duration, words`); `Music/prompts.json`, `Sound_Effects/prompts.json`; `.key` stamps on rendered segments | `tts.py:49`; `gen_audio.py:60,68`; `render.js:69` |
| Cross-project tracking | None. Pipeline scripts are **copied** per project (`tts, timeline, subs, qc, assemble` are byte-identical across both projects by `diff`). | `diff` = empty |
| Searches prior videos for reusable clips | No | — |
| Duplicate detection | Only cache-hit checks (text hash for TTS, segment hash for renders) | `tts.py:37-40`; `render.js:55-57` |
| Generated clips have prompts | Music/SFX: yes (`prompts.json`). Visuals: no prompts; they are code. | — |
| Failed generations recorded | No. Retries print to stdout, then `SystemExit` (`tts.py:12-18`, `gen_audio.py:43-50`). Logs are gitignored (`.gitignore:9,16`). | — |
| Large outputs | MP4/WAV gitignored (`.gitignore:7`). Video_001's 4K MP4 existed only in an expired container. The MTS MP4 was committed (52 MB). | `.gitignore`; commit `fd87447` |

## 3. Dependency inventory (brief §11)

| Category | Item | Notes |
|---|---|---|
| Python | stdlib only (`json, os, re, subprocess, urllib, hashlib, base64`) | No `requirements.txt` for the pipeline. The report mentions numpy for grain and voice analysis, but that code is **not in the repo**. |
| Node | `playwright` (1.63.0 here), `three` (MTS) | **No `package.json` for Video_001/MTS/Lab**. `three` is imported from gitignored `/Lab_MoneyToScale/node_modules` (`MTS engine.html:17`), so the version is **unpinned and not reproducible from a clone**. |
| Browser | Chromium (pre-installed), SwiftShader WebGL flags | `MTS render.js:7` |
| Local server | MTS engine loads from `http://127.0.0.1:8768/…` | `MTS render.js:4`, `thumb.js`. **No script starts this server → NOT VERIFIED how it was launched** |
| Executables | `ffmpeg`/`ffprobe` 6.1.1, ImageMagick `convert` 6.9.12 | Version in the original runs NOT VERIFIED |
| Fonts | System `Inter Display` (`local()` in `engine.html:4-7`), DejaVu Sans Mono | Not vendored; present in this image (18 Inter Display faces) |
| AI APIs | ElevenLabs: `/v1/text-to-speech/{id}/with-timestamps`, `/v1/music`, `/v1/sound-generation`; Speech-to-Text (cited, code not found) | `tts.py:7`, `gen_audio.py:58,66` |
| AI models | `eleven_v4` TTS with the owner's cloned voice (`script.json`); earlier "George" stock voice takes kept | — |
| Connectors (session) | ElevenLabs via proxy-injected `xi-api-key` on environment **"past-the-rating"** (personal; secret name "ElevenLabs API key"; value not exposed). vidIQ, Higgsfield, Airtable MCPs are available but **unused by the pipeline**. | `get_environment`; `docs/07-workflow-and-qc.md:5-10` |
| Env vars | None read by the pipeline. `ONLY` (segment filter) and `V=1` (vertical engine) control `render.js` | `render.js:11,15` |
| Config files | `script.json`, `timeline.json`, `Shorts/*/script.json` | — |
| Prompt templates | Music `BASE` style prompt + per-cue text; SFX descriptions (both in source) | `gen_audio.py:7-37` |
| Separate toolkit | `free-video-gen` (torch, diffusers ≥0.35, transformers, accelerate…) | branch `ccr-fd21e1c4-nqq6r0`; needs a CUDA GPU; not integrated |

### Hard-coded / tightly coupled items
- Absolute paths, including a *previous session's* scratchpad: `finish_1080.sh:4,16,17`.
- Project text baked into the engine: `'CASE 001 · HYATT REGENCY · KANSAS CITY 1981'` in `hud()`; `NOHUD` scene IDs in `timeline.py:21`.
- SFX and music cue tables are code (`mix.py`, `shorts_mix.py`), so each video needs a code edit.
- The visual engine is a monolith per project (35–43 KB HTML each). Scenes can't be reused without copy-paste.
- The MTS render depends on a manually started HTTP server and on gitignored `node_modules`.

---

## 4. Final assessment (brief §13)

**1. How exactly are images converted into video?**
They aren't. No image-ingest path exists (see `IMAGE_PROCESSING_ANALYSIS.md`). Frames are *drawn* by JavaScript (`engine.html` `renderFrame(t)`), screenshotted by Playwright as JPEG q93, and piped to `ffmpeg -f image2pipe … -c:v libx264 -crf 17` (`render.js:59-61`). Motion is simulated: SVG transforms (`cam()`, `engine.html:37`) and a Three.js camera (`MTS engine.html:70-74`). It is not AI motion.

**2. How exactly are Veo videos edited?**
They never have been. No code reads external clips. Veo appears only as the motivation for `free-video-gen` ("Veo replacement"), which is standalone and unused.

**3. How are images and videos combined?**
They are not. The only "combination" is concatenating the pipeline's own uniform segments with `-f concat -c:v copy` (`assemble.py:20-23`).

**4. How is narration synchronized?**
- Narration is generated per scene with ElevenLabs `/with-timestamps` (`tts.py`), and each scene's visual duration is defined as `lead + VO + tail` (`timeline.py:30`).
- Animations, SFX and music anchor to word timestamps through `cue()`/`cueFn()`.
- Subtitles come from the same word timings (`subs.py`).
- Sync is exact by construction.

**5. How does visual selection work?**
Manually, at authoring time. `script.json` names a hand-coded scene function per narration block. There is no runtime selection, randomness, vision-based matching or filename heuristics.

**6. Is any footage reused from previous projects?**
No. Each project has its own engine and segments. Only *within* a project do the Shorts reuse long-form music and SFX (`shorts_mix.py:16-21`). Pipeline *code* is copied between projects.

**7. What causes the current output-quality problems?**
I found no written description of the problems you're seeing, so this is inferred from the evidence:
- (a) **The visual style is code-drawn diagrams, not cinematic footage.** That was by design and because of the zero budget (production_report.md §1, §7). If you expected Veo-style footage, this is the main gap.
- (b) **QC reports but never blocks.** MTS shipped with 19 freeze detections (`MTS qc.json`).
- (c) **The MTS 1080p export is very low bitrate (~641 kb/s)** and mixes natively-rendered and downscaled, double-encoded segments (`finish_1080.sh:9,11`).
- (d) **Every new video needs new hand-written scene code**, so quality depends on time spent per scene, and fixes are found by manual contact-sheet review (production_report.md §4 lists about 10 such fixes).
- (e) **Inconsistent subtitle number style** from normalized alignment (`Video_001_en.srt:159` vs `:527`).

Which of these match what you see is **NOT VERIFIED**.

**8. Five biggest architectural weaknesses**
1. **No asset-ingest layer.** It cannot accept Veo clips, AI images or your audio files, so the workflow in the brief cannot run.
2. **Bespoke, per-project, hand-coded visuals.** Scene functions, cue tables and HUD text live inside code (`engine.html`, `mix.py`). Nothing is data-driven, and it does not scale.
3. **Copy-paste pipeline per project.** There is no shared library and no orchestrator; there are hard-coded absolute paths (`finish_1080.sh`), and the dependencies are unpinned or missing (`three`, the HTTP server on :8768, numpy and STT scripts not committed).
4. **QC is non-blocking and partly undocumented in code.** There are no thresholds or exit codes, and the STT and vocal checks are cited but absent.
5. **Expensive, lossy frame path.** Per-frame DOM rebuild → screenshot JPEG → MJPEG → x264, with SwiftShader WebGL, a second encode for downscaled segments, and no bitrate floor.

**9. What should be improved first?**
Build the **asset-ingest and conform stage**: scan a project folder, ffprobe every clip, image and audio file, write a manifest, and conform everything to the timeline spec (fps, resolution, SAR, audio rate). Then plug it into the existing `timeline.json` model so external clips and images become segment sources next to the engine scenes. It is the prerequisite for everything in the brief. Second priority: make `qc.py` fail on thresholds, including a bitrate floor and a freeze whitelist for intentional holds.

**10. Components that should not be rewritten (they work)**
- `tts.py`: per-scene ElevenLabs with timestamps, request stitching and hash caching.
- `timeline.py`: narration-derived, frame-snapped timeline as the single source of truth.
- `mix.py` audio chain: bus → `sidechaincompress` ducking → two-pass `loudnorm` (measured −14.2 LUFS / −0.8 dBTP on both films).
- `subs.py`: word-timed SRT cue breaking.
- `assemble.py`: lossless concat-copy mux with soft subtitles and faststart.
- `render.js`: per-segment content-hash cache (resumable renders).
- `qc.py` detectors (keep the measurements; add gating around them).
- The word-cue mechanism (`cue()` / `cueFn()`) for SFX, music and animation sync.
