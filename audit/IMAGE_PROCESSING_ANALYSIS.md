# Image Processing Analysis

Branch audited: `claude/past-the-rating-monetization-n5o38k` (plus `ccr-fd21e1c4-nqq6r0` for `free-video-gen/`).

## Headline
**There is no code path that takes an input folder of AI-generated images and turns them into video.** Every answer below follows from that. Searches covering the whole branch for `zoompan`, `kenburns`, `ken burns`, `glob`, `listdir`, `.png`/`.jpg` inputs, `-loop 1` and `xfade` returned no pipeline matches.

## Answers to the 10 questions

| # | Question | Finding | Evidence |
|---|---|---|---|
| 1 | How are image files identified? | **Not implemented.** No directory scan exists. Every input path is hard-coded or derived from `script.json` scene IDs. | `timeline.py:32` builds `Voiceover/scenes/{id}.mp3`; `assemble.py:17` builds `{seg_dir}/{id}.mp4`. Nothing globs for images. |
| 2 | Image ↔ narration mapping | **Not implemented.** Each narration block is mapped to a *scene function name* (`"visual": "coldopen_rod"`), not to an image. | `Video_001/Script/script.json` scenes[].visual |
| 3 | Filenames, prompts, metadata or vision? | None for images. Claude vision was used only to **review rendered contact sheets** (production_report.md §4, "inspected via contact sheets at three stages"). | `render.js:29-45` preview mode |
| 4 | Image duration | N/A. *Scene* duration = `lead + narration duration + tail`, snapped to 1/24 s. | `timeline.py:30`, constants `timeline.py:8-10` |
| 5 | Static image → video | N/A. Frames are drawn by JavaScript each frame, not converted from stills. | `engine.html:488-509` `window.renderFrame(t)` |
| 6 | zoompan / Ken Burns / camera moves | No FFmpeg `zoompan`. Camera moves are **SVG transforms** (`cam()` helper: translate + scale) in Video_001, and **Three.js camera lerps** in MTS. | `Video_001/.../engine.html:37` `cam=(content,s,cx,cy,dx,dy)=>…scale(s)…`; `joint_zoom` scene `engine.html:213-217` zooms 1→4.2×; MTS `engine.html:70` `camTo`, `:74` `camLerp` |
| 7 | Generates extra images? | No AI images. It *does* render stills from the engine: thumbnails (`thumbnail.js`, `thumb.js`) and contact sheets. | `Video_001/Project_Files/thumbnail.js` |
| 8 | AI image-to-video? | **Not in the editing pipeline.** `free-video-gen/generate.py` supports `--image` (LTX / Wan 2.2 I2V), but nothing calls it and it needs an NVIDIA GPU, which this container does not have. | `ccr-fd21e1c4-nqq6r0:free-video-gen/generate.py:110,160-161` |
| 9 | Transitions between images | N/A. Between *scenes* there is a fixed in-engine dip: opacity ramps up over 0–0.16 s and down over the last 0.12 s, against a persistent background grid. Not a crossfade between two sources. | `engine.html` renderFrame: `edge=Math.min(1,P(t,0,.16)…)*(1-P(t,seg.dur-.12,seg.dur))` |
| 10 | Avoiding repetition | Each scene has its own hand-coded function (27 in Video_001, 24 in MTS), so no asset repeats. There is no automated repetition detector. | `engine.html:144-468` (`S.chapter` … `S.endcard`) |

## Image files the pipeline does read

| File | Use | Evidence |
|---|---|---|
| `Video_001/Project_Files/engine/grain/g0–g5.png` | Film-grain overlay, cycled per frame at 55% opacity | `engine.html:507` `<image href="grain/g${Math.floor(t*24)%6}.png" … opacity=".55">` |
| `brand/money_to_scale/renders/profile_800.png` | Logo in the MTS HUD and end card | MTS `engine.html:75,242` |

## Is motion "genuine AI motion" or simulated?
**Neither.** It is procedural vector and 3D animation written by hand per scene: SVG paths, eased interpolations (`eo`, `eio` in `engine.html:20-22`) and Three.js meshes with a scripted camera. Nothing photographic exists to animate.

## Implication for an image-based workflow
Building the brief's image workflow requires all of these, none of which exist yet:
- an ingest/inventory step
- an image↔narration mapping (manual or vision-based)
- a still-to-motion stage (FFmpeg `zoompan`/`crop`, the engine's `cam()`, or I2V)
- transitions between sources (`xfade`)
- a repetition guard
