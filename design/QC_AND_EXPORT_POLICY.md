# QC & Export Policy

Builds on the existing measurements in `qc.py` (unchanged). `qc.py` measures; the new `qc_gate.py` **decides**, using the timeline and the media plan, and sets a non-zero exit code on any **BLOCK**. The audit's main QC gap was "measures but never blocks": MTS shipped with 19 unreviewed freeze detections.

## 1. Three checkpoints

| Checkpoint | Tool | When |
|---|---|---|
| **C1 Ingest** | `ingest.py` flags | Before planning |
| **C2 Segment** | `segcheck.py` (per segment, cheap) | After each segment is rendered or encoded, **before** `assemble.py` |
| **C3 Final** | existing `qc.py` → `qc_gate.py` | After `assemble.py` |

## 2. Intentional still vs accidental freeze

`freezedetect` cannot tell a deliberate hold from a stalled clip. The gate decides from **source and declared intent**: each `freeze_start/end` from `qc.py` is mapped to a segment using timeline `start/dur`.

| Segment `asset_type` / `motion_expectation` | Freeze inside it means | Result |
|---|---|---|
| `engine`, default `hold_ok` | A designed hold (e.g. a 3D scene settling) | **PASS** if ≤ 6 s; **REVIEW** if longer |
| `ai_image` with a camera move (`continuous`) | The camera path failed (it should always move) | **BLOCK** |
| `ai_image` with `hold` | Intended | PASS |
| `ai_video`, `licensed_footage`, `project_footage` (`continuous`) | Clip stalled, or an AI tail-freeze not trimmed | **BLOCK** if ≥ 1.0 s (`qc.py` reports ≥ 2.5 s, so C2 re-runs freezedetect at d=1.0 on media segments) |
| Freeze spanning a cut (two segments) | Identical frames across a boundary | **REVIEW** |

**Retro-test:** running this classification on `MTS_Video_001/Production_Report/qc.json` must label all 19 detections as engine holds (PASS or REVIEW), and produce a list for one-time human confirmation. This is a cheap acceptance test for the gate.

## 3. Check matrix

| Check | Measurement (existing → new) | BLOCK export | REVIEW (human) |
|---|---|---|---|
| Missing media | catalog/plan refs; `assemble.py:18` missing segment (existing hard fail) | any missing file | — |
| Segment spec / concat compatibility | `segcheck.py`: ffprobe fields + SPS/PPS bytes vs reference | any mismatch | — |
| Frame count | `nb_frames == round(dur*24)` per segment | ≠ | — |
| Black frames | `qc.py` blackdetect (d 0.4) | inside a media segment, not at a declared dip; any ≥ 0.4 s outside chapter dips | engine segments |
| Frozen frames | §2 | per §2 | per §2 |
| Duplicate scenes | dHash of 3 keyframes per segment across the film | same `asset_ref` + overlapping in-points in two segments without `reuse_ok` | near-duplicate (Hamming ≤ 6) |
| Aspect ratio | output W×H (`qc.py:16`, existing); per-segment SAR = 1:1; crop loss | wrong output size or SAR | crop > 45% of source area; any `blur_fill` |
| Low-resolution assets | ingest scale factor | upscale > 2.0× | 1.5–2.0× |
| Encoding quality | **SSIM** of each media segment vs its lossless pre-encode (FFmpeg `ssim`; no libvmaf in this build) | SSIM < 0.95 | 0.95–0.97; final bits-per-pixel < 0.02 (MTS was ~0.013: 641 kb/s ÷ (1920×1080×24)) |
| Audio clipping | `qc.py` ebur128 true peak; new `astats` clip count | true peak > −1.0 dBTP, or any clipped samples | −1.0 to −0.5 dBTP margin (both films measured −0.8 to −1.0) |
| Loudness | `qc.py` integrated LUFS | outside −14 ± 1.0 | ± 0.5–1.0 |
| Narration sync | deterministic: every `vo_at ≥ start` and `vo_at + vo_dur ≤ start + dur`; cross-correlation of `stem_vo.wav` against the final mix (numpy) must show 0 ± 1 frame offset | violation or offset > 1 frame | — |
| Subtitle sync | SRT cue start/end vs word times (`subs.py` pads +0.25 s, `subs.py:26-27`) | cue outside [first word − 0.05, last word + 0.30] | cue text ≠ spoken words (STT round-trip, optional, costs credits) |
| Unintended silence | `qc.py` silencedetect (−45 dB, 1.5 s) mapped to the timeline | silence inside a VO span (narration dropped) | silence outside VO not declared `intentional_silence` in the plan (Video_001's 3.0 s memorial pause would be declared) |
| Policy labels | plan: `ai_video`/`ai_image` of realistic subjects must carry a label | missing required label; R0 policy violation; `no_license` | — |
| Director approval | every non-engine scene has `approved_by` | unapproved scene | — |
| Visual/narration match | contact sheet (`qc.py:31`, existing) | — | always: one human pass on the final sheet |

## 4. Export decision
```
any BLOCK            → exit 1, no "final" export written (preview may still render, watermarked PREVIEW)
no BLOCK, any REVIEW → exit 2, export written as <name>_REVIEW.mp4 + build_report.json listing items
all PASS + reviews signed in build_report.json → exit 0, <name>.mp4
```
`build_report.json` keeps every check result, every decision and the identity of whoever signed each review item, so the next audit has evidence instead of reconstruction.
