# Hybrid Media Architecture

**Status:** design only; nothing implemented. **Date:** 19 Nov 2026.
**Baseline:** branch `claude/past-the-rating-monetization-n5o38k`, commit **`a0dad6ac3978d74f007549626246fbc2a8aa3e62`**. Every path below is on that branch unless stated otherwise. These docs live on `ccr-fa4ca15b-fdldjr`.

## 1. Design principle: a sidecar, not a rewrite

The existing pipeline already has the right shape. Everything downstream hangs off **one timeline** (`timeline.json`), and every visual unit is **one self-contained MP4 per segment** that `assemble.py` joins with a lossless concat. The hybrid design keeps both invariants:

> **Invariant A:** `timeline.json` keeps its current schema and is still produced only by the existing `timeline.py`.
> **Invariant B:** every segment, whatever its source, ends up as `Visual_Assets/segments/<id>.mp4`, encoded to the *project's exact engine spec*, so `assemble.py` joins it unchanged.

External media plugs in **beside** the engine, as a second segment producer that writes to the same folder:

```
                         ┌──────────────── EXISTING (untouched) ────────────────┐
 script.json ─► tts.py ─► Voiceover/scenes/*.mp3+.json ─► timeline.py ─► timeline.json
                                                                           │
 ┌──────────── NEW ────────────┐                                           │
 │ project folder (inbox/)      │                                          │
 │  Veo MP4, PNG/JPG, VO, music │                                          │
 │  SFX, prompts sidecars       │                                          │
 └──────────────┬───────────────┘                                          │
                ▼                                                          │
         ingest.py ─► catalog.json ──► director (Claude, in session) ─► media_plan.json
                                                   ▲ approve                │
                                    budget ledger ─┘                        │
                                                                            ▼
                                  scene_timeline.py ──► scene_timeline.json (derived, read-only view)
                                         │                                  │
                    engine segment ids   │                 media segment ids│
                                         ▼                                  ▼
             EXISTING render.js (ONLY=<ids>)              NEW media_render.py
             engine.html → segments/<id>.mp4      conform → grade → camera → finish → encode-to-spec
                                         └──────────────┬───────────────────┘
                                                        ▼
                                        NEW segcheck.py (spec + SPS/PPS compatibility gate)
                                                        ▼
   EXISTING mix.py ─► final_mix.wav     EXISTING subs.py ─► .srt     EXISTING assemble.py ─► final MP4
                                                        ▼
                              EXISTING qc.py ─► qc.json ─► NEW qc_gate.py (block / review / pass)
```

## 2. Why this shape (evidence)

| Fact verified on the baseline | Consequence for the design |
|---|---|
| `render.js:15-16` already filters segments with env `ONLY=<ids>` | Engine renders can be limited to engine segments **without editing render.js** |
| `assemble.py:16-18` only needs `<seg_dir>/<id>.mp4` to exist | Media segments placed in the same folder are joined with no code change |
| `mix.py`/`subs.py` read only `id, start, dur, vo, vo_at, words, visual` | Visual source doesn't matter to audio or subtitles; sync is preserved automatically |
| `timeline.py:30` sets `dur = lead + VO + tail` | Narration still drives scene length; external media is fitted *to* the segment, never the reverse |
| `render.js:55` cache key = `JSON.stringify(seg)` + engine hash + width | **Adding fields to `timeline.json` segments would invalidate every cached render.** Hybrid fields therefore live in `media_plan.json`, never in `timeline.json` |
| Engine output: H.264 High, yuv420p, **bt470bg (BT.601) limited range**, timebase 1/12288, `has_b_frames=2`, 24 fps, SAR 1:1 (ffprobe of a fresh render and of the MTS final) | Media segments must be encoded to the same spec, or concat-copy will mis-colour or corrupt them (see `IMAGE_AND_VIDEO_PROCESSING_DESIGN.md` §4) |
| Engine rendering is deterministic (same segment rendered twice → identical MD5 `d3a4f1fa8a02`) | Regression tests can compare bytes |

## 3. Components

| Component | Status | Responsibility |
|---|---|---|
| `tts.py`, `timeline.py`, `subs.py`, `assemble.py`, `qc.py`, `render.js`, `engine*.html`, per-project `mix.py` | **Existing, untouched** | Narration, timing, subtitles, assembly, engine visuals, mix, measurement |
| `pipeline/hybrid/ingest.py` | New | Scan the project inbox, ffprobe plus signal analysis, write `catalog.json` |
| `pipeline/hybrid/vo_import.py` | New | Turn user-supplied ElevenLabs narration into the `Voiceover/scenes/<id>.mp3 + .json` contract that `timeline.py` already reads |
| `pipeline/hybrid/scene_timeline.py` | New | Merge `timeline.json` with `media_plan.json` into `scene_timeline.json` (the unified view) |
| `pipeline/hybrid/media_render.py` | New | Produce media segments: conform, trim/fit, camera move for stills, grade, brand finish, encode to engine spec |
| `pipeline/hybrid/segcheck.py` | New | Check every segment matches the reference spec, including byte-equal SPS/PPS headers, before assembly |
| `pipeline/hybrid/qc_gate.py` | New | Read `qc.py` JSON with the plan; classify each finding as block, review or pass; set the exit code |
| `pipeline/hybrid/budget.py` | New | Estimates, approvals, ledger of actual spend |
| `pipeline/hybrid/build.py` | New | Orchestrator: runs the steps in order and passes `ONLY` to `render.js` |
| Visual Director | New (procedure plus schema) | Claude, in session, fills `media_plan.json` decisions with rationale; a person approves |

New code lives under a new top-level `pipeline/hybrid/`, so no existing project folder changes. A project opts in by containing `media_plan.json`. Without one, nothing new runs and the legacy commands behave exactly as before.

## 4. Data artefacts per project

| File | Producer | Committed? |
|---|---|---|
| `inbox/…` | User | Large media: no (gitignore); sidecars: yes |
| `Project_Files/catalog.json` | `ingest.py` | Yes |
| `Project_Files/media_plan.json` | Director + human | Yes (source of truth for visual decisions) |
| `Project_Files/scene_timeline.json` | `scene_timeline.py` | Yes (derived; regenerable) |
| `Project_Files/build_report.json` | `build.py` / `qc_gate.py` | Yes |
| `budget/ledger.jsonl`, `budget/approvals.json` (repo root) | `budget.py` | Yes (cross-project) |

## 5. Tool evaluation (summary; details in `ASSET_INGESTION_DESIGN.md`)

| Tool | Role | Verdict |
|---|---|---|
| **ffprobe** | Metadata authority: streams, codec, size, SAR/DAR, rotation, fps (`r_frame_rate` vs `avg_frame_rate` for VFR), colour tags, duration, audio presence | Use. Already used (`qc.py:9`, `tts.py:47`) |
| **FFmpeg filters** | Signal analysis (`blackdetect`, `freezedetect`, `signalstats`, `scdet`/`select=scene`, `ssim`, `ebur128`, `astats`) and all pixel processing (scale, crop, fps, `zscale`/`colorspace`, `lut3d`, `overlay`, `fade`, `xfade`) | Use. FFmpeg 6.1.1 has all of these. **No `libvmaf`** in this build, so use `ssim`/`psnr` |
| **Python (stdlib + Pillow + numpy)** | Orchestration, JSON, hashing, perceptual hashes, sub-pixel camera moves for stills | Use. Pillow 12.3 and numpy 2.5 are installed; nothing else needed |
| torch / OpenCV / CLIP / depth models | Depth parallax, embeddings, local I2V | **Not installed; no GPU** (4 CPU, 15 GB RAM). Optional later phase only |

## 6. Document map
`UNIFIED_SCENE_TIMELINE_SCHEMA.md` · `ASSET_INGESTION_DESIGN.md` · `IMAGE_AND_VIDEO_PROCESSING_DESIGN.md` · `VISUAL_DIRECTOR_DESIGN.md` · `CREDIT_MANAGEMENT_DESIGN.md` · `QC_AND_EXPORT_POLICY.md` · `BACKWARD_COMPATIBILITY_PLAN.md` · `IMPLEMENTATION_SEQUENCE.md`

---

## 7. Final recommendation

**1. Leave untouched:** `tts.py`, `timeline.py`, `subs.py`, `assemble.py`, `qc.py`, both `render.js`, `engine.html`, `engine_v.html`, the MTS `engine.html`, both projects' `mix.py`/`shorts_mix.py`/`shorts_timeline.py`/`gen_audio.py`, and `finish_1080.sh`. All of them are reused as they are. The integration works through existing seams: `ONLY` in `render.js:15`, the segments folder in `assemble.py:17`, and the `timeline.json` schema.

**2. Minimal extensions:** none are required for milestones M0–M8. Optional, separately approved later:
- a one-line skip for unknown `visual` names in `render.js` (a safety net for bare runs);
- a data-driven cue table *beside* `mix.py` for new projects (M9);
- a new root `package.json` pinning `three` to restore MTS re-rendering, which adds a file and changes none.

**3. New modules:** `ingest.py`, `vo_import.py`, `scene_timeline.py`, `media_render.py`, `segcheck.py`, `qc_gate.py`, `budget.py`, `build.py`, the golden test suite, the `media_plan.json` schema, and the Visual Director procedure. All live under `pipeline/hybrid/`.

**4. Smallest useful milestone (M3):** swap one narration scene of the ₹1 Crore film for an external clip. Every other frame, the audio and the subtitles must stay bit-identical, and the new segment must pass the spec, header and colour checks.

**5. Testing on one real documentary:** use **MTS ₹1 Crore**.
- Recover its 30 engine segments losslessly from the committed final MP4 (all 30 boundaries verified to be keyframes).
- Prove that re-concatenation is frame-identical.
- Swap one segment, rebuild with the reproducible mix (G6) and SRT (G4), then verify with framemd5 and the QC gate.

The Hyatt film stays the regression subject (G1–G9). It is excluded as a synthetic-media test on editorial grounds.

**6. Main risks:**
- concat header mismatch (high without `segcheck`)
- BT.709 vs BT.601 colour shift (high)
- Veo clips always shorter than scenes, which forces multi-shot scenes (certain)
- photoreal shots looking out of place next to vector graphics (medium–high)
- credit overspend and narration overwrite (medium, guarded)
- the pre-existing MTS engine non-reproducibility (certain, worked around)

Full table in `IMPLEMENTATION_SEQUENCE.md`.
