# Quality-Control Gap Analysis

Branch audited: `claude/past-the-rating-monetization-n5o38k`. A check is counted as existing **only if its implementation was found**.

## Automated checks that exist (`Video_001/Project_Files/qc.py`, identical copy in MTS)

| Check | Implementation | Gate or report? |
|---|---|---|
| Stream specs, duration, size | `ffprobe` (`qc.py:9-15`) | Report |
| Resolution matches expected | `res["resolution_ok"]` (`qc.py:16`) | Report |
| Decode errors | full decode, `-v error` (`qc.py:18,20`) | Report |
| Black frames | `blackdetect=d=0.4:pix_th=0.025:pic_th=0.995` (`qc.py:19,21`) | Report |
| Frozen frames | `freezedetect=n=0.0005:d=2.5` (`qc.py:19,22`) | Report |
| Silence gaps | `silencedetect=n=-45dB:d=1.5` (`qc.py:24-25`) | Report |
| Loudness / true peak | `ebur128=peak=true` (`qc.py:24-28`) | Report |
| Subtitle track present | count of subtitle streams (`qc.py:15`) | Report |
| Contact sheet for visual review | `tile` (`qc.py:31`) | Human/Claude review |
| Missing segment | `assemble.py:18` | **Hard fail** |
| Missing SFX cue word | `mix.py:19`, `shorts_mix.py:14` raise `KeyError` | **Hard fail** |
| Short length 30–40 s | `shorts_timeline.py:19` | Print only |

**Critical gap:** `qc.py` has **no thresholds and no exit code**. It prints JSON and always succeeds (no `sys.exit`/`SystemExit` in the file). Nothing blocks a failing export.

## Evidence the gap matters: MTS #1 shipped with 19 freeze detections
`MTS_Video_001/Production_Report/qc.json` lists **19 `freeze_segments`** (13.7 s, 50.2 s, 80 s … 419.8 s). The next commit (`fd87447`) committed the MP4 for download anyway. No commit message or document records a review of these detections.
- Likely cause: 3D scenes holding a static camera for more than 2.5 s (the `d=2.5` threshold). That would be an intentional hold, not a render fault. **NOT VERIFIED**: the frames were not inspected in this audit.
- Video_001 had 0 freezes and 0 black segments (`qc_longform.json`).

## Brief §8 item by item

| Issue | Handling today | Status |
|---|---|---|
| Duplicate clips | N/A: there are no clip libraries; segments are unique by ID | No check |
| Repeated images | N/A | No check |
| Black frames | `blackdetect` | Detected, not gated |
| Frozen frames | `freezedetect` | Detected, **not gated** (MTS shipped with 19) |
| Low-resolution footage | Only the *output* resolution is checked | No input check |
| Incorrect aspect ratio | Output W×H check only | Partial |
| Abrupt transitions | Engine dip-to-background on every cut; contact-sheet review | No automated check |
| Poorly synced narration | Structurally prevented (`timeline.py:30`). STT round-trip on the final audio is claimed in production_report.md §4 | **STT QC code NOT FOUND in repo → NOT VERIFIED as reproducible** |
| Visuals not matching narration | Manual contact-sheet review (production_report.md §4 lists the fixes made) | Manual only |
| Missing scenes | `assemble.py:18` hard fail; `KeyError` on unknown `visual` would throw in the engine | Hard fail |
| Narration misreads | Claimed: "ElevenLabs speech-to-text … zero misreads" (production_report.md §4) | **Code NOT FOUND → NOT VERIFIED** |
| Music has no vocals | Claimed: cues transcribed to confirm (production_report.md §4) | **Code NOT FOUND → NOT VERIFIED** |
| Audio clipping | `ebur128` peak, plus `loudnorm TP=-1.0` | Measured (−0.8 dBFS) |
| Fact accuracy | `Research/fact_check.md` (manual) | Manual |
| Bitrate sanity | None | MTS exported at ~641 kb/s, unflagged |
| Human listening test | Explicitly not possible ("I can't listen to audio", production_report.md §7) | Gap |

## Manual QC gate (documented, not enforced)
`docs/07-workflow-and-qc.md:35-58` defines a checklist (hook within 0.3 s, captions, −14 LUFS, safe zones, thumbnail shrink test, chapters) and a reject rule. No code enforces it.

## Gaps ranked
1. QC does not fail builds (no thresholds, no exit code).
2. The STT / vocal-detection checks cited in reports are not in the repo.
3. No bitrate or encode-quality check.
4. No input-asset QC at all, which an external-clip workflow would need.
5. Freeze detection can't tell intentional holds from stalls, so its results get ignored.
