# Intelligent Visual Director Design

## 1. Role and boundaries
The Director decides, **per scene**, which visual source best serves the narration, and records why. It writes decisions into `media_plan.json`; **a person approves** before rendering or spending. It never renders, never spends credits, and **never selects an asset because it is available**: availability adds zero points.

Today, the same judgement is made implicitly when Claude hand-writes `script.json` (audit: `VISUAL_SELECTION_AND_EDITING_LOGIC.md`). This design makes it explicit, scored, reviewable and repeatable.

## 2. Inputs per scene
1. **Narration text and word timings** (`timeline.segments[].words`, VO sidecar `text`).
2. **Scene intent**: author-written `visual_description` / `narration_intent` (script or plan).
3. **Content-policy facts**: real tragedy, real person, factual claim requiring evidence, sponsor or finance claim.
4. **Catalog**: each asset's keyframe contact sheet, provenance prompt, technical flags, pHash, prior use.
5. **Engine capability**: whether a bespoke or generic engine scene exists or is cheap to write.
6. **Budget state**: from `budget.py` (balances, open approvals).

## 3. Decision ladder (first rule that fires wins; every step logged)

```
R0 POLICY      Real tragedy / identifiable victims / real private person?
               → no photoreal AI depiction. Use engine, motion graphics or licensed archival.
               (Encodes the existing editorial choice: production_report.md §1 "No AI-fabricated footage of a real tragedy")
R1 MEANING     Is the point a mechanism, number, comparison, process or data?
               → ENGINE / MOTION GRAPHICS (the engine's proven strength: Video_001 & MTS)
R2 EVIDENCE    Is it a claim about a real place, document or event that needs proof?
               → licensed / project footage or archival; AI only as labelled RECONSTRUCTION, with approval
R3 MOTION      Does the meaning *require* motion (people moving, crowds, weather, machinery running)?
               → yes: AI_VIDEO candidate      no: continue
R4 STILL       Is a single strong composition enough (object, place, portrait-free scene)?
               → AI_IMAGE + camera move (local, free)
R5 REUSE       Does an existing catalog asset score ≥ threshold on all axes (§4)?
               → reuse it (then stop)
R6 GENERATE    No adequate asset, and the scene is high-importance (hook, chapter open, payoff)?
               → propose generation with a cost estimate → budget approval required
               else → fall back to engine scene or AI_IMAGE
```
R5 is checked *inside* R3 and R4: reuse is preferred over generation once the type is decided. The type is always decided first, from meaning, never from what exists.

## 4. Scoring an asset against a scene

| Axis | 0–5 scale | Method |
|---|---|---|
| **Semantic fit** | 5 = depicts exactly what the narration says at that moment; 3 = related mood only; ≤ 2 = unrelated | Claude views the asset's contact sheet (first/mid/last/scene-change frames) and reads the narration span. The score comes with a one-sentence justification that cites visible content. The prompt sidecar is a hint, **never** a substitute for looking |
| **Technical fit** | Resolution vs canvas, AR, usable duration vs needed duration, flags | Computed from `catalog.json` |
| **Novelty** | Penalty if pHash is near any asset already used in this film (Hamming ≤ 6) or in the previous 3 scenes | Computed |
| **Continuity** | Lighting/palette proximity to neighbours (YAVG, saturation), screen direction | Computed + visual check |
| **Policy** | 0 if it violates R0/R2 or lacks a licence | Rule |

**Acceptance:** semantic ≥ 4 **and** policy = 5 **and** technical ≥ 3 **and** novelty ≥ 3. Anything else is rejected with the reason recorded. If no candidate passes, the scene falls to the next ladder option. Filler footage is not allowed.

## 5. Semantic matching: how it works in practice

**Phase 1 (no new spend, no new dependencies):** Claude does the direction in the working session.
1. `ingest.py` creates contact sheets.
2. Claude reads each scene's narration and intent, looks at the candidate sheets with vision, and writes the per-asset scores and justifications into `media_plan.json → decision`.
3. A human reviews the plan as a table (scene · narration excerpt · chosen asset thumbnail · score · rationale · alternatives) and sets `approved_by`.

This is the same vision-on-contact-sheet method already used for render QC (production_report.md §4), applied before rendering instead of after.

**Phase 2 (optional):** a local embedding pre-filter (CLIP-class model) ranks catalog assets against narration text so Claude only reviews the top-k. It needs a torch install (not present) and is useful only once catalogs exceed about 50 assets. Embedding similarity is a **pre-filter, never the decision**.

**Not proposed:** automated runtime calls to a hosted model for every scene. They add cost and nondeterminism with no evidence they are needed at this catalog size.

## 6. Visual inspection checks the Director performs
- Keyframes contain no text or watermark artifacts, malformed hands or faces, or incorrect objects (e.g. wrong currency design, an anachronism).
- Factual consistency with narration: the ₹ note colour and size in a money scene, the correct era or location.
- No visible AI-generation glitches in the chosen in/out window (checked on the mid and last frames of the trimmed window).

## 7. Output (excerpt of `media_plan.json → scenes.<id>.decision`)
```json
{"ladder": ["R0:pass", "R1:no (narration is cultural, not numeric)", "R3:yes motion needed (crowd)", "R5:reuse cat:7f3a…"],
 "candidates": [
   {"asset": "cat:7f3a9c01b2de", "semantic": 4, "technical": 5, "novelty": 5, "continuity": 4, "policy": 5,
    "why": "Mid frame shows pedestrians at an ATM at dusk, matching 'everyone in India talks about'"},
   {"asset": "cat:91bc22aa0f13", "semantic": 2, "why": "Generic skyline; no people; mood only", "rejected": true}],
 "chosen": "cat:7f3a9c01b2de", "generate": null, "approved_by": null}
```
