# Implementation Sequence (for approval; nothing started)

Each milestone ships behind the golden suite: G1–G8 must stay green, and none of them edits an existing file.

| # | Milestone | New modules | Done when | Est. effort |
|---|---|---|---|---|
| **M0** | Regression harness | `pipeline/hybrid/tests/golden.sh` | G1–G8 automated and green on a scratch extraction of `a0dad6a` | 0.5 day |
| **M1** | Ingest & catalog (read-only) | `ingest.py` | `catalog.json` + contact sheets for a sample inbox; exact and near duplicates and all §4 flags shown | 1 day |
| **M2** | One external clip → engine-spec segment | `media_render.py` (video path only), `segcheck.py` | A Veo clip becomes `segments/<id>.mp4` that passes the SPS/PPS + ffprobe compare against a real engine segment, and concat-copy plays cleanly with correct colour | 1.5 days |
| **M3** | Plan, unified view, orchestrator | `scene_timeline.py`, `build.py`, `media_plan` schema | **Smallest useful milestone** (below) passes end to end | 1 day |
| **M4** | Stills with camera moves | Pillow camera path in `media_render.py` | Sub-pixel push/pan with no visible stair-stepping on a 20 s still; freeze QC sees continuous motion | 1 day |
| **M5** | QC gate | `qc_gate.py` | G10 passes; exit codes 0/1/2; `build_report.json` | 1 day |
| **M6** | Visual Director procedure | plan scoring fields, review table generator | One real chapter directed with scores and rationale, and approved by you | 0.5 day + your review |
| **M7** | Budget manager | `budget.py`, `budget/*.json` | Exact TTS re-voice estimate for Video_001 matches the cache logic; a wrapped ElevenLabs job records its balance delta | 1 day |
| **M8** | Narration import | `vo_import.py` | User ElevenLabs MP3 + timestamps JSON → sidecars; `timeline.py` (unchanged) builds from them | 1 day (more if forced alignment is needed) |
| **M9** | Later, separately approved | data-driven `mix_plan.json` mixer, xfade handles, engine-still scene, MTS `three` pin, optional parallax/CLIP | — | — |

Effort figures are rough planning estimates, not measurements.

## Smallest useful milestone (end of M3)
**"Swap one scene in a real film for an external clip, without touching anything else."**

Inputs: the ₹1 Crore film and **one** clip supplied by you (Veo or any MP4) for one narration scene, with the director's choice approved.

1. **Recover MTS's engine segments losslessly from the committed final MP4.** All 30 segment starts were verified to fall on keyframes (152 keyframes, 0 misaligned). Each segment is extracted with stream copy at exact frame counts (`round(dur*24)`), so the MTS 3D engine (currently not re-renderable, see compat plan §3) doesn't need to run at all.
2. **Verify the recovery.** Re-concatenate all 30 recovered segments with the unchanged `assemble.py` logic and compare frame hashes (`-f framemd5`) with the committed final. Expected identical; this proves the segment model before anything new is added.
3. Replace one segment (e.g. `S02` "open_question") with the clip through `media_render.py` (`mts_v1` profile).
4. `segcheck.py` → unchanged `assemble.py` logic, using the existing `final_mix.wav` (reproducible, G6) and SRT (G4) → `qc.py` → `qc_gate.py`.
5. **Pass criteria:**
   - Every frame outside S02 matches the original final (framemd5).
   - Audio and subtitles are bit-identical.
   - S02 has the exact frame count, correct colour (no BT.601/709 shift) and no freeze or black frames.
   - The gate exits 0 or 2, never 1.

Why the ₹1 Crore film and not the Hyatt film: the Hyatt film's editorial policy excludes AI footage of a real tragedy (production_report.md §1), so it is the wrong test subject for synthetic media. It remains the **regression** subject (G1, G3, G5, G7–G9).

## Development risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Concat-copy header mismatch (x264 tune, B-frames, level differ) | High without checks | Corrupt or glitching output | `segcheck.py` byte compare; exact per-project encode profiles |
| Colour mismatch BT.709 ↔ BT.601-tagged stream | High | Visible shift on every AI shot | Explicit conversion + tags; test in M2 on a colour bar + skin-tone clip |
| Veo clips (about 8 s) shorter than narration scenes (median 18.2 s in Video_001 and 17.0 s in MTS; 50 of 51 narrated scenes exceed 8 s) | Certain | Scenes need multiple shots | `shots[]` + word anchors; director prefers splitting a scene into several shots over slowing a clip down |
| Look mismatch (photoreal AI next to vector diagrams) | Medium–high | Film feels stitched together | Shared grade, grain, vignette, HUD; director continuity score; a human look review in M3 |
| Credit overspend from retries or re-voicing | Medium | Real money | Budget wrapper, idempotency keys, retry cap 2, stop-loss |
| Overwriting user narration via `tts.py` | Medium | Data loss + credits | Hard refusal in `build.py`; sidecar marker |
| MTS 3D engine not reproducible | Certain (pre-existing) | Can't change MTS engine scenes | Segment recovery for testing; separate pin task (compat §3) |
| Toolchain drift changes golden hashes | Medium | False alarms | Re-baseline procedure; versions in the report |
| Director bias toward available assets | Medium | Off-topic footage | Zero points for availability; semantic ≥ 4 with a cited visible justification; human approval |
| CPU-only rendering time for 4K hybrid films | Medium | Slow iterations | Per-segment caching for media segments; 1080p previews |
