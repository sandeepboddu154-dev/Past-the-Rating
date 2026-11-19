# Video Processing Analysis (Veo clips, mixed media, orientation)

Branch audited: `claude/past-the-rating-monetization-n5o38k`.

## Headline
**No Veo (or any externally generated) video clip has ever been ingested, inspected, trimmed or edited by this pipeline.** The only `.mp4` files it reads are segments it rendered itself (`Visual_Assets/segments/<id>.mp4`). The Veo questions are answered against that reality.

## Answers to the 10 questions

| # | Question | Finding | Evidence |
|---|---|---|---|
| 1 | Identify and inspect clips | **Not implemented** for external clips. `ffprobe` runs only on (a) TTS MP3s for duration and (b) the final export in QC. | `tts.py:47-48`; `qc.py:9` |
| 2 | Clip ↔ scene mapping | By **segment ID**, because the clip *is* the render of that scene: `{seg_dir}/{id}.mp4`. A missing file aborts the run. | `assemble.py:16-18` `raise SystemExit(f"missing segment {p}")` |
| 3 | Narration ↔ video mapping | 1:1 by construction. Each scene's visual duration is computed *from* its narration. | `timeline.py:30` `d = snap(lead + meta["duration"] + tail)` |
| 4 | Duration / resolution / AR / fps inspected? | Only at QC on the final file (resolution vs expected W×H, `r_frame_rate`). Inputs are never inspected because they are generated at a known spec. | `qc.py:13-16` |
| 5 | Trimming | No clip trimming. The final mux trims the whole output to the timeline duration: `-t {duration}`. | `assemble.py:24` |
| 6 | Concatenation | **Yes**: FFmpeg concat demuxer with `-c:v copy` (no re-encode). | `assemble.py:20-23`; `finish_1080.sh:16` |
| 7 | Mixed fps / resolution | Not handled. Concat-copy *requires* identical codec params, which works only because every segment comes from the same `libx264 -r 24 yuv420p` command. | `render.js:59-61` |
| 8 | Aspect-ratio mismatch | Not handled for inputs. 16:9 and 9:16 are **separate engines** (`engine.html` vs `engine_v.html`) chosen by env `V=1`, each drawn natively for its canvas. | `render.js:11-12,19` |
| 9 | Transitions | Generated **inside the engine**: a ~0.16 s fade-in and ~0.12 s fade-out of scene content over a persistent grid background. No `xfade`. Shorts add a `whoosh_soft` SFX at each cut. | `engine.html` renderFrame `edge=…`; `shorts_mix.py:29` |
| 10 | Avoiding jump cuts | The persistent background (grid, vignette, HUD, grain) runs across cuts, so only the foreground dips. Cuts are snapped to the frame grid. | `timeline.py:12-13` `snap()`; `engine.html:488-509` |

## Mixed-media scenarios (brief §4)

| Scenario | What happens today |
|---|---|
| 5 videos + 15 images | **Unsupported.** No code reads either. The files would be ignored. |
| 15 videos + 5 images | **Unsupported.** Same as above. |
| Only images | **Unsupported.** |
| Only videos | **Unsupported** for external clips. Concat of *self-rendered* segments works. |
| Portrait + landscape assets | Only for engine output: a long-form 16:9 render and a separate 9:16 Shorts render with their own scene code (`engine_v.html`). There is no crop/pad/blur-fill logic for foreign assets. |

## Limitations and inconsistencies found
1. **MTS mixed render scales in one timeline.** `finish_1080.sh:9` renders missing segments at `deviceScaleFactor 1` (native 1080p), while `:11` downscales finished 4K segments with Lanczos and **re-encodes** them (`-crf 17`). The final film therefore mixes two generation paths, and the 4K segments are encoded twice. The concat still works because both paths output libx264 / 24 fps / yuv420p.
2. **Stream-copy concat is fragile.** Any segment with different encoder params (SAR, profile, timebase) would desync or corrupt the concat. Nothing validates this beforehand.
3. **No external-clip path at all.** `free-video-gen/generate.py` writes `outputs/<model>_<ts>_s<seed>.mp4` at 704×480 / 832×480 / 1280×704 and 8–24 fps (`generate.py:80-89`). None of those match the 24 fps 1080p/4K timeline, and no step conforms them.
