# Unified Scene Timeline Schema

## 1. Three layers, one of them unchanged

| Layer | File | Owner | Changes? |
|---|---|---|---|
| Timing truth | `timeline.json` | existing `timeline.py` | **No**: schema and bytes unchanged (verified byte-identical on regeneration for both films) |
| Visual decisions | `media_plan.json` | Director + human | New, hand-reviewed, committed |
| Unified view | `scene_timeline.json` | `scene_timeline.py` = timeline ⊕ plan | New, derived, never hand-edited |

The unified view carries every field the brief asks for. Timing fields are **copied from `timeline.json`, never re-computed**, so narration sync is inherited and can't drift.

## 2. `script.json` convention for hybrid scenes (no code change)

`timeline.py` requires only `id`, `visual` and a VO sidecar per scene, and ignores unknown keys. Hybrid scenes therefore use the **reserved visual name `"media"`**:

```json
{"id": "S02", "chapter": null, "visual": "media", "vo": "It's the number everyone in India talks about…", "tail": 0.9}
```
Engine scenes keep their function names (`"coldopen_rod"`, …). `render.js` is never asked to render `"media"` segments, because the orchestrator passes `ONLY=<engine ids>`. See the compatibility note on bare `render.js` runs in `BACKWARD_COMPATIBILITY_PLAN.md` §4.

## 3. `media_plan.json` (authored)

```json
{
  "schema": "archiva.media_plan/1",
  "project": "MTS_Video_001",
  "canvas": {"w": 1920, "h": 1080, "fps": 24, "aspect": "16:9"},
  "encode_profile": "mts_v1",
  "look": {"lut": "looks/mts_navy.cube", "grain": "engine/grain/g%d.png", "vignette": true, "hud": "auto"},
  "scenes": {
    "S02": {
      "asset_type": "ai_video",
      "asset_ref": "veo/mumbai_street_dusk_01.mp4",
      "visual_description": "Busy Mumbai street at dusk, people walking past a bank ATM, warm light",
      "narration_intent": "Establish that ₹1 crore is a cultural milestone for ordinary Indians",
      "processing": {
        "in_point": 1.25, "fit": "trim",
        "frame": {"mode": "scale_crop", "focus_x": 0.5, "focus_y": 0.45},
        "speed": 1.0, "audio": "drop"
      },
      "transition_in":  {"type": "dip", "dur": 0.16},
      "transition_out": {"type": "dip", "dur": 0.12},
      "motion_expectation": "continuous",
      "label": "AI-GENERATED",
      "decision": {"by": "director", "score": {"semantic": 4, "technical": 5, "novelty": 5, "policy": 5},
                   "rationale": "Narration is about people, not numbers; engine has no human-scale shot",
                   "alternatives": ["engine:open_question"], "approved_by": null}
    },
    "S06": {
      "asset_type": "ai_image",
      "asset_ref": "images/counting_hands.png",
      "visual_description": "Close-up of hands counting ₹500 notes on a wooden counter",
      "processing": {"camera": {"type": "push_in", "from": {"zoom": 1.0, "cx": 0.5, "cy": 0.5},
                                "to": {"zoom": 1.12, "cx": 0.55, "cy": 0.48}, "ease": "eio"},
                     "overlay_engine_scene": null},
      "transition_in": {"type": "dip", "dur": 0.16}, "transition_out": {"type": "dip", "dur": 0.12},
      "motion_expectation": "continuous",
      "label": "AI-GENERATED",
      "decision": {"by": "director", "rationale": "Static subject; motion is not part of the meaning", "approved_by": null}
    }
  }
}
```
Segments absent from `scenes` default to `asset_type: "engine"` and are rendered exactly as today.

## 4. `scene_timeline.json` (derived): one entry per segment

| Field | Source | Notes |
|---|---|---|
| `scene_id` | `timeline.segments[].id` | e.g. `S02`, `CH03` |
| `narration` | `{vo, vo_at, vo_dur, text, words[]}` from the timeline + VO sidecar | `null` for chapter cards |
| `start`, `end`, `duration` | `start`, `start+dur`, `dur` from the timeline | Frame-snapped by `timeline.py:12-13`; frames = `round(dur*24)` as in `render.js:58` |
| `asset_type` | plan, or `engine` by default | `engine` · `motion_graphics` · `ai_video` · `ai_image` · `licensed_footage` · `project_footage` |
| `asset_ref` | plan → `catalog.json` id | Engine: `engine.html#S.<visual>` |
| `asset_meta` | `catalog.json` | Resolution, fps, duration, sha256, pHash, provenance |
| `visual_description` | plan (engine: from script) | Used by the director and QC review |
| `processing` | plan | Instructions for `media_render.py` |
| `transition_in/out` | plan; engine default `{dip 0.16 / 0.12}` | Engine dip constants come from `engine.html:491` |
| `aspect_ratio` | canvas, plus source AR | Source AR mismatch is recorded as a frame mode |
| `motion_expectation` | plan; engine default `hold_ok` | Lets QC tell intentional stills from accidental freezes |
| `quality_status` | written by `segcheck.py`/`qc_gate.py` | `pending` · `pass` · `review` · `blocked`, with reasons |
| `cache_key` | `sha1(plan entry + asset sha256 + encode profile + renderer version)` | Mirrors the `render.js` caching idea for media segments |

`motion_graphics` means generic, data-driven graphics such as lower thirds, number counters or a "RECONSTRUCTION" label rendered over media; `engine` means a bespoke `S.*` function. In phase 1 both render through the existing engine; the split only matters for the director's choices.

Sample derived entry:
```json
{"scene_id": "S02", "start": 13.375, "end": 31.0, "duration": 17.625,
 "narration": {"vo": "Voiceover/scenes/S02.mp3", "vo_at": 13.725, "vo_dur": 16.54, "words": "…"},
 "asset_type": "ai_video", "asset_ref": "cat:7f3a…", "aspect_ratio": {"canvas": "16:9", "source": "16:9"},
 "asset_meta": {"w": 1920, "h": 1080, "fps": "24/1", "dur": 8.0, "has_audio": true},
 "processing": {"fit": "split_shots", "shots": [{"ref": "cat:7f3a…", "in": 0.5, "dur": 7.4}, {"ref": "cat:91bc…", "in": 0.3, "dur": 10.225}]},
 "transition_in": {"type": "dip", "dur": 0.16}, "transition_out": {"type": "dip", "dur": 0.12},
 "motion_expectation": "continuous", "quality_status": {"state": "pending", "reasons": []}}
```
(Times are illustrative.)

## 5. Integration with word-level synchronization

1. **Segment boundaries:** unchanged. A media segment is exactly `round(dur*24)` frames starting at the timeline's frame-snapped `start`, so the VO, music cues (`mix.py:22-31`) and SFX cues (`mix.py:34-55`) land where they do today.
2. **Intra-scene beats:** the plan can key processing events to words, using the same `cue(word, k)` semantics as the engine's `cueFn` (`engine.html:486`):
   ```json
   "shots": [{"ref": "cat:a", "until_word": {"w": "bundle", "k": 1, "offset": -0.1}}, {"ref": "cat:b"}]
   ```
   `scene_timeline.py` resolves these to absolute times from `timeline.segments[].words` and fails loudly if a word is missing, like `mix.py:19`.
3. **Subtitles:** unaffected. `subs.py` reads only `timeline.words`.
4. **Overlays:** labels, counters or "RECONSTRUCTION" text can be word-timed on media the same way.
