# Backward Compatibility Plan

**Mandatory:** the Hyatt Regency documentary (`Video_001`) and the Money To Scale ₹1 Crore documentary (`MTS_Video_001`) keep rendering, mixing, subtitling and assembling exactly as they do at baseline commit `a0dad6a`.

## 1. Rules
1. **No edits** to any file under `Video_001/`, `MTS_Video_001/`, `Lab_MoneyToScale/` or `brand/`. New code goes under `pipeline/hybrid/` only.
2. `timeline.json` schema and bytes are unchanged; hybrid data never enters it, because `render.js:55` hashes the segment JSON into its cache key.
3. Hybrid behaviour is **opt-in** through `media_plan.json`. Absent file = legacy path, with nothing new invoked.
4. The legacy commands in `production_report.md` §8 remain the supported way to build the two films.
5. Any later change to an existing module (e.g. `M9` in the sequence) needs its own approval and must pass the golden suite below first.

## 2. Golden-master suite (baseline measured 19 Nov 2026 in this container)
Run on a scratch extraction of the baseline commit. All of these were **executed and verified** during the design work:

| # | Test | Baseline result |
|---|---|---|
| G1 | `Video_001/Project_Files/timeline.py` regenerates `timeline.json` | **Byte-identical** to committed (34 segments, 503.62 s) |
| G2 | `MTS_Video_001/Project_Files/timeline.py` | **Byte-identical** (30 segments, 444.33 s) |
| G3 | `subs.py` → `Video_001_en.srt` | **Byte-identical** (210 cues) |
| G4 | `subs.py` → `MTS001_en.srt` | **Byte-identical** (187 cues) |
| G5 | `shorts_timeline.py Shorts/SH-A` | **Byte-identical** (38.33 s) |
| G6 | `MTS mix.py` → `final_mix.wav` | MD5 prefix `2222870d4816`, **identical on rerun**; −14.2 LUFS, peak −1.0 dBFS (~39 s) |
| G7 | `Video_001 mix.py` → `final_mix.wav` | MD5 prefix `951c94bd23bf`; −14.2 LUFS, peak −0.9 dBFS (~44 s) |
| G8 | `render.js full … ONLY=CH01 1920 1` (Video_001 engine) | Two runs **byte-identical** (`d3a4f1fa8a02`); High, bt470bg, tb 1/12288, 62 frames, ~9 s |

These hashes depend on the FFmpeg 6.1.1 / Chromium / Playwright 1.63 versions in this image. On a toolchain change, re-baseline first, then test. The suite becomes `pipeline/hybrid/tests/golden.sh` in milestone M0.

Additional gates added with each milestone:
- **G9:** a Video_001 build through `build.py` with **no** `media_plan.json` produces outputs identical to G1–G8.
- **G10:** `qc_gate.py` on both committed `qc*.json` files passes Video_001 and lists MTS's 19 freezes as engine-hold REVIEW items, not BLOCK.

## 3. Pre-existing reproducibility gaps (not caused by this design; flagged for your decision)

| Gap | Evidence | Impact | Proposed handling (needs approval) |
|---|---|---|---|
| MTS 3D engine imports `three` from gitignored `Lab_MoneyToScale/node_modules`, with **no `package.json`** anywhere for it (version unknown) | `MTS engine.html:17`; `.gitignore:12` | MTS engine scenes **cannot be re-rendered from a clone** | Pin `three` in a *new* root `package.json`, after identifying the version that matches the committed final by re-rendering one segment and comparing frames. Existing files stay unchanged |
| MTS render needs an HTTP server on `127.0.0.1:8768`; no script starts it | `MTS render.js:4` | Same | Document the command (e.g. `python3 -m http.server 8768` from the repo root) in a new README; no code change |
| `finish_1080.sh` hard-codes `/home/user/…` and a previous session's scratchpad | `finish_1080.sh:4,16,17` | Breaks on another path | Leave it as is; `build.py` replaces it for new work |
| Video_001 4K segments and MP4 were never committed (gitignored) | `.gitignore:2,7` | A full re-render (~65 min) is needed to reassemble | Acceptable; the engine is deterministic (G8) |

## 4. Specific risks to existing behaviour and their guards

| Risk | Guard |
|---|---|
| Someone runs bare `render.js full` on a hybrid project: `S["media"]` is undefined, so `fn is not a function` crashes the run | `build.py` always passes `ONLY`; hybrid projects carry a README warning. Optional later: a one-line skip in `render.js`, which needs approval since it changes the engine hash for nothing else |
| `tts.py` run on a project with imported narration overwrites it and spends credits (hash mismatch, `tts.py:39-44`) | `build.py` refuses; sidecar `source: import`; README warning |
| Media segment with mismatched headers silently corrupts concat-copy | `segcheck.py` BLOCK (SPS/PPS byte compare) |
| Colour shift when BT.709 clips join a BT.601-tagged stream | Pixel conversion to BT.601 plus matching tags (`IMAGE_AND_VIDEO_PROCESSING_DESIGN.md` §2, §4) |
| Copying `mix.py` into a new hybrid project and editing cue tables breaks nothing old (per-project copies are the existing convention), but drifts | Accepted for phase 1; data-driven mixer is M9 |
