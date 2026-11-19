# Visual Selection & Editing Logic

Branch audited: `claude/past-the-rating-monetization-n5o38k`.

## Headline
**There is no runtime visual-selection algorithm.** Visual "selection" happens once, at authoring time: Claude writes `script.json`, naming a bespoke scene function for every narration block, and then writes that function by hand in `engine.html`. The pipeline never picks among assets.

## Mechanism
```json
// Video_001/Script/script.json
{"id": "S03", "visual": "coldopen_limit", "tail": 4.5, "vo": "At about five past seven, it reached its limit."}
```
`render.js` → `window.setSegment(seg)` → `renderFrame(t)` → `S[seg.visual](t, dur, cue, params)` (`engine.html:488-490`).

There are 27 scene functions in Video_001 (`engine.html:145-468`: `chapter, coldopen_rod, …, endcard`) and 24 in MTS (`open_tower … endcard`). Each draws its own content and reads word cues to time actions.

## Checklist from the brief

| Does the system… | Answer | Evidence |
|---|---|---|
| Understand the meaning of narration? | **At authoring time only.** Claude wrote the script and designed each scene's content for it. There is no runtime semantic analysis. | `script.json` + hand-written `S.*` functions |
| Match visuals to narration context? | Yes: manually per scene, and at word level through `cueFn` (e.g. `S.failure` uses `c('split')`, `c('nuts')`, `c('dropped')`). | `engine.html:378-395` |
| Read scene descriptions? | `visual` is a function *name*, not a description. `production/longform/LF-01-hyatt-regency.md` holds prose shot plans that informed the authoring; no code reads them. | — |
| Use Claude vision on images? | Only to **review renders**. Contact sheets (6 frames per segment, `render.js:29-45`; QC sheet `qc.py:30-31`) were viewed, and fixes were recorded in production_report.md §4. Not used for selection. | production_report.md §4 |
| Extract video frames to understand clips? | Only from its own renders, for QC review. | `qc.py:31` `fps=1/{every},scale=384:-2,tile=6x…` |
| Select by filename? | Only in the sense that segment `id` maps to `id.mp4`. | `assemble.py:17` |
| Select by creation order? | No. Order is the `script.json` order. | `timeline.py:22` |
| Random selection? | **No.** No `random`, `shuffle` or seed exists in the pipeline. | grep: no matches in Project_Files |
| Reuse clips from previous videos? | **No.** Each project has its own engine and segments. Shorts reuse *long-form audio assets* (music cues at fixed offsets, SFX) and re-draw visuals in `engine_v.html`. | `shorts_mix.py:16`; `render.js:11-12` |
| Reuse images when video credits run out? | **No.** No credit-aware fallback exists. Code-drawn graphics were chosen *because* there were no video credits (Higgsfield 0 credits, `STATUS.md:26`; production_report.md §5). | — |

## AI models involved in editing decisions
None at runtime. The only models called by code are ElevenLabs TTS, Music and Sound Effects (plus Speech-to-Text for QC, whose code is not committed). The script, scene designs, SFX cue lists and music prompts were written by Claude during the session. They live in source (`gen_audio.py:7-37`, `mix.py:22-55`) and in `Music/prompts.json` and `Sound_Effects/prompts.json`. No prompt templates exist for visual selection.

## Consequence
The approach gives very tight sync and zero asset mismatch, but **it does not scale to a library of Veo clips or images**. Every new video needs new hand-coded scenes. That is the core reason the brief's workflow (folder in → edited video out) does not exist.
