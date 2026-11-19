# Image & Video Processing Design (`media_render.py`)

Every media segment goes through one chain, so all external visuals share one look and one encoder spec:

```
SOURCE ─► 1 CONFORM ─► 2 FIT TO DURATION ─► 3 FRAME (scale/crop/pad) ─► 4 MOTION (stills only)
       ─► 5 GRADE ─► 6 BRAND FINISH (vignette · grain · HUD · labels) ─► 7 TRANSITION EDGES
       ─► 8 ENCODE TO ENGINE SPEC ─► segments/<id>.mp4 ─► segcheck.py
```

## 1. Static images → cinematic scenes

### Honest framing
Every local technique below is **simulated camera movement over a still**. None of them produce new information: no object motion, no changing light, no true parallax or occlusion. They are **not equivalent to AI-generated motion** (Veo or I2V), and the plan labels them `ai_image` (still with camera move), never `ai_video`.

### Options evaluated

| Technique | How | Local and free? | Quality / limits | Verdict |
|---|---|---|---|---|
| **Ken Burns via FFmpeg `zoompan`** | `zoompan=z=…:x=…:y=…:d=N:s=WxH:fps=24` | Yes | zoompan rounds crop positions to whole pixels, so slow moves **stair-step (jitter)**. Partly mitigated by upscaling 4× first, which is heavy at 4K | Fallback only |
| **Sub-pixel Ken Burns (Python/Pillow)** | Per frame: affine transform with BICUBIC resampling on a float camera path, eased with the engine's `eio`, piped as raw RGB to FFmpeg | **Yes** (Pillow 12.3 + numpy installed) | Smooth, deterministic; same easing family as `engine.html:20-22`. About 30–60 ms/frame at 1080p (estimate, NOT MEASURED) | **Recommended v1** |
| **Engine-rendered still** (SVG `<image>` inside a new generic engine page, reusing the `cam()` idea from `engine.html:37`) | Chromium screenshot per frame | Yes | Sub-pixel and antialiased; can layer word-timed labels and diagrams over the photo | v2, for "image + annotation" scenes |
| **2.5D parallax (manual layers)** | User or editor supplies fg/mid/bg PNGs; each layer moves at a different rate | Yes | Convincing if layers are clean; needs manual cut-outs | v2, optional |
| **Depth-based parallax** | Monocular depth model (e.g. Depth-Anything-class) → displacement or layered mesh | Only after installing torch + weights; CPU-only here | Stretching and halo artifacts at edges without inpainting; slow on 4 CPUs | v3; experiment only |
| **Image-to-video (AI)** | `free-video-gen/generate.py --image` (LTX, Wan 2.2) on a free Kaggle/Colab GPU; or paid Veo/Higgsfield | **Not in this container** (no GPU). Free only on external GPU quotas, run by the user | Real generated motion; 480–704p, 5 s clips, needs conforming; quality varies | Through the budget manager only |

### Camera move vocabulary (plan → renderer)
`push_in`, `pull_out`, `pan_l`, `pan_r`, `tilt_u`, `tilt_d`, `drift` (slow combined), `hold`. Limits that keep it cinematic:
- Zoom 1.00–1.15 over the segment, or at most 0.012 zoom/s.
- Pan at most 3% of frame width per second.
- Ease `eio`.
- The move direction must alternate between consecutive still scenes. Two stills in a row with the same move are flagged (anti-repetition).

### Core math (v1, sub-pixel)
```
for frame i in 0..N-1:  u = eio(i/(N-1))
  z = lerp(z0,z1,u); cx = lerp(cx0,cx1,u); cy = lerp(cy0,cy1,u)
  crop_w = W_src / z ; crop_h = crop_w * H_out / W_out          # keep the canvas aspect
  box = (cx*W_src - crop_w/2, cy*H_src - crop_h/2, …)          # floats, clamped inside the image
  frame = img.transform((W_out,H_out), Image.EXTENT, box, Image.BICUBIC)
```
Source images smaller than `crop` at z0 are flagged `below_canvas` at ingest (review).

## 2. Veo and other video clips

| Stage | Design |
|---|---|
| **Inspect** | From `catalog.json`: size, fps, VFR, rotation, colour tags, audio, freeze/black ranges, motion score |
| **Assign to narration** | Visual Director (separate doc); the result is `asset_ref` + `processing.shots[]` in `media_plan.json` |
| **Trim** | `in_point` chosen to skip flagged head or tail freezes and black frames; length = segment frames. Trim uses frame-accurate decode (`-ss` after `-i`, or the `trim=start_frame` filter), never stream copy |
| **Fit when the clip is shorter than the segment** (common: Veo clips are about 8 s, scenes are up to 28.6 s in Video_001) | In order: (1) **split into multiple shots** (`shots[]`, optionally word-anchored); (2) slow to at most 0.85× with `setpts` (no `minterpolate`, which smears AI footage); (3) hand the remainder to a still or engine scene. **Never loop silently.** Freezing the last frame is allowed only as an explicit `hold`, at most 0.5 s |
| **Fit when the clip is longer** | Trim to the best window (highest motion score, no flags) |
| **Scale** | `scale=W:H:flags=lanczos` (same kernel as `finish_1080.sh:11`); upscale factor recorded; > 1.5× → review |
| **Frame-rate normalize** | 24 and 23.976 → `fps=24` (tiny retime). 25/30/50/60 → `fps=24` (drops frames; slight judder on pans, flagged). VFR → `fps=24` mandatory. No motion interpolation by default |
| **Aspect ratio** | Same AR → scale. 9:16 into 16:9 → `frame.mode` = `pillar_plate` (clip centred over the project's dark grid plate plus engine-style frame) or `blur_fill` (scaled blurred copy behind). 16:9 into 9:16 Shorts → `scale_crop` with `focus_x` (this mirrors the existing `focus` field the Shorts timelines already carry, `shorts_timeline.py:14`). Any crop removing > 45% of the area → review |
| **Colour match** | (a) **Colourspace normalize**: Veo clips are typically BT.709, while engine segments are BT.601 (`bt470bg`, limited range, verified). Convert with `colorspace=all=bt601-6-625:iall=bt709:range=tv` (or `zscale`) so the final stream, which carries one set of colour tags, displays both correctly. (b) **Look**: optional project LUT (`lut3d`) toward the engine palette (carbon `#0B0B0C`, steel, orange accent). (c) **Exposure match**: target the neighbouring engine segments' mean luma (`signalstats` YAVG) within ±8 using `eq=brightness/contrast`; no auto-grading beyond that |
| **Brand finish** | `vignette` similar to the engine's radial gradient; grain by overlaying the engine's own grain set (`engine/grain/g0–5.png`, cycled per frame like `engine.html:507`; Video_001 only, MTS has none) at matched opacity; the HUD rendered once from the engine as a transparent PNG and overlaid (Video_001 HUD is static per segment, `engine.html:476-482`); `AI-GENERATED` / `RECONSTRUCTION` label where required by `docs/07-workflow-and-qc.md:47` |
| **Transitions** | Default = the engine's own edge: fade in over 0.16 s and out over the last 0.12 s **to the carbon background colour, not black**: `fade=t=in:st=0:d=0.16:color=0x0B0B0C,fade=t=out:st=D-0.12:d=0.12:color=0x0B0B0C`. Cross-dissolve between two adjacent media segments uses **handles**: the outgoing segment's last k frames are rendered as `xfade` against the incoming clip's first k frames, and the incoming segment starts after its head. Each segment stays a standalone file, so concat-copy still works |
| **Audio** | Default `audio: drop` (`-an`). Option `extract`: write `Sound_Effects/clip_<id>.wav`, loudness-normalized, for the project's mix to place like any SFX (`mix.py` bus items are `(file, start, gain)`) |

### Example FFmpeg graph (Veo clip → MTS 1080p segment)
```bash
ffmpeg -v error -y -ss 1.25 -i inbox/veo/mumbai_street_dusk_01.mp4 \
  -framerate 24 -stream_loop -1 -i overlays/grain_%d.png -i overlays/hud_S02.png \
  -filter_complex "[0:v]fps=24,scale=1920:1080:flags=lanczos:force_original_aspect_ratio=increase,crop=1920:1080,
      colorspace=all=bt601-6-625:iall=bt709:range=tv,lut3d=looks/mts_navy.cube,eq=brightness=-0.02,
      vignette=PI/5[base];[base][1:v]overlay=format=auto:shortest=1[g];[g][2:v]overlay[h];
      [h]fade=t=in:st=0:d=0.16:color=0x0B0B0C,fade=t=out:st=17.505:d=0.12:color=0x0B0B0C,format=yuv420p[v]" \
  -map "[v]" -an -frames:v 423 <ENCODE_PROFILE_ARGS> segments/S02.tmp.mp4
```
(`-frames:v` = `round(dur*24)`, exactly like `render.js:58`.)

## 3. Licensed or project footage
Same chain as Veo clips, plus a mandatory `license` provenance entry (ingest blocks without it) and an on-screen credit option in the plan.

## 4. Encode to engine spec: the critical integration point

`assemble.py` joins segments with `-f concat … -c:v copy`. The MP4 output keeps **one** set of codec headers (SPS/PPS) and **one** set of colour tags, taken from the first segment. Every media segment must therefore match the engine encoder **exactly**, not approximately.

| Encode profile | Exact args (copied from source) | Source |
|---|---|---|
| `ptr_v1` (Video_001, 4K and Shorts) | `-c:v libx264 -preset medium -crf 17 -tune animation -pix_fmt yuv420p -r 24 -g 48 -bf 2 -x264-params threads=2` | `Video_001/Project_Files/engine/render.js:59-61` |
| `mts_v1` (MTS, 1080p) | `-c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p -r 24 -g 48 -x264-params threads=2` | `MTS_Video_001/Project_Files/engine/render.js:18`; `finish_1080.sh:11` |

Consequences:
- Video_001-style projects must encode photographic media with `-tune animation`, even though that tune is meant for flat content. It changes reference frames and B-frames, which changes the headers. CRF 17 makes the quality cost small. Changing this would mean re-encoding the whole film at assembly, which is a deliberate later decision, not part of this design.
- The source colour tags are written to match the engine output (`bt470bg`, `tv`), after the pixel conversion in §2.
- `segcheck.py` **verifies rather than trusts**: per segment it compares ffprobe `profile, level, width, height, pix_fmt, sample_aspect_ratio, time_base, r_frame_rate, has_b_frames, refs, color_space, color_range`. It also compares the SPS/PPS headers byte for byte (`ffmpeg -i seg.mp4 -c copy -bsf:v trace_headers -f null -`) against a reference engine segment. Any mismatch blocks assembly. Observed: a 1080p engine test render reported `level=50`, while the MTS final reports `level=40`, so level is resolution and settings dependent and must be checked, not assumed.

## 5. Performance
- The video chain is a single FFmpeg pass per segment, faster than real time at 1080p on 4 CPUs (estimate, NOT MEASURED).
- The Pillow still path is CPU-bound and parallel per segment.
- Media segments get their own cache key (`scene_timeline.cache_key`), so unchanged media segments are never re-encoded, matching the `render.js:55-57` behaviour.
