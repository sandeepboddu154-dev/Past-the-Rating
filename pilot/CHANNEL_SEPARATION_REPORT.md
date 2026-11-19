# Channel Separation Report: Money To Scale vs Archivra

Date: 19 Nov 2026 · Investigation only. No production workflow, design doc or asset was modified.
Sources: production branch `claude/past-the-rating-monetization-n5o38k` @ `a0dad6a`; maintenance branch `maint/three-pin` @ `135b1f9` (local); dev branch `ccr-fa4ca15b-fdldjr`; this session's repository and session listings.

## 1. Confirmation: the S02 pilot belongs to Money To Scale only
- The pilot target is `MTS_Video_001`, *What ₹1 Crore Actually Looks Like*, a finance documentary for **Money To Scale**.
- Its narration (the owner's "Sandy Voice" clone), score prompts (`MTS_Video_001/Project_Files/gen_audio.py`), 3D engine (`MTS_Video_001/Project_Files/engine/engine.html`, Money To Scale HUD and logo) and the S02 footage brief (`pilot/S02_FOOTAGE_BRIEF.md`) are all Money To Scale material.
- **No Archivra asset, prompt, brand element or decision is used in the pilot**, and the pilot output is not a reference for Archivra.
- The S02 brief's look rules (dark navy/carbon, right-side space for numbered questions, no banknote close-ups) are Money To Scale rules and must not be carried into Archivra.

## 2. What exists for each channel

| Area | Money To Scale (finance) | Archivra (history, heritage, Telugu) |
|---|---|---|
| Repository | `sandeepboddu154-dev/Past-the-Rating`, the only repo this session can access (`list_repos`) | **None found.** No Archivra repo is accessible to this session |
| Branches / project folders | `Video_001/` (Hyatt, made under the earlier *Past The Rating* identity), `MTS_Video_001/` (₹1 Crore), `Lab_MoneyToScale/` | **None.** No folder, file or branch contains Archivra production work |
| Brand configuration | Three successive identities in `brand/`: `brand/src` + `brand/renders` (Past The Rating), `brand/money_to_scale/` (logo, banner, watermark, setup sheet), `brand/lakhometer/` (BRAND_GUIDE, fonts, renders; **newest, 18 Nov**) | **None** |
| Prompts | Music/SFX prompts in `*/Music/prompts.json`, `*/Sound_Effects/prompts.json`, `gen_audio.py`; S02 Veo prompts in `pilot/S02_FOOTAGE_BRIEF.md` | **None** |
| Assets | Narration MP3s, music, SFX, subtitles, thumbnails, final MTS MP4 (all under the two project folders) | **None** |
| Narration | ElevenLabs, voice "Sandy Voice (owner's clone)", `eleven_v4`, English; speed 0.86 (Hyatt) / 0.9 (MTS), set in each `Script/script.json` | **None.** Telugu narration has never been produced here |
| Rendering profiles | Hyatt: SVG engine, 4K, `-tune animation -bf 2`. MTS: Three.js engine, 1080p, no tune. Both 24 fps, CRF 17, BT.601 (`bt470bg`) tagging | **None** |
| Production history | 19 commits (15–18 Nov), production report, QC JSON | **None.** Archivra appears only as an outside channel in docs (below) |
| Prior Claude sessions | "Past The Rating 7-day monetization strategy" (both films) | No session titled or tagged for Archivra in `list_sessions`. Whether "Open source video generation repos" concerned Archivra is **NOT VERIFIED** |

**Where Archivra is mentioned in the production branch** (it's always described as a separate channel, never as a project):
- `docs/01-channel-audit.md:79-80`: vidIQ is signed in to a different Google account linked only to **Archivra (@archivraofficial, 118 subs, 107 videos)**; "must not be used to cross-post or reuse content into this channel".
- `STATUS.md:21-22`: "Is Archivra yours? … Never cross-post from it."
- `docs/07-workflow-and-qc.md:7`: vidIQ is connected to Archivra, not the finance channel.

The cinematic temple, historical and cultural documentaries you describe are **not in any location this session can reach**. If they exist elsewhere (another repo, a local folder, Drive), please point me to them.

## 3. Shared resources (one account or toolchain serving both channels)

| Resource | Current state | Separation risk |
|---|---|---|
| ElevenLabs | One account and API key, saved on the cloud environment **"past-the-rating"** (proxy-injected `xi-api-key`). One shared credit pool | Spend from one channel depletes the other's budget, and the owner's English voice clone is reachable from both. Needs channel-tagged spend records and a per-channel voice setting |
| vidIQ | Connected **only to Archivra** (4 credits, renews 26 Nov) | Finance-channel analytics are not available through it; anything pulled from vidIQ is Archivra data |
| Higgsfield | One account, 0 credits | Shared budget if used |
| Toolchain | FFmpeg 6.1.1, Chromium/Playwright 1.63, Inter Display, ImageMagick | Neutral, safe to share |
| Cloud environment | Named after the finance repo; personal | Archivra work in this environment inherits its network secrets |

## 4. Cross-channel contamination found
1. **My own Phase 1/2 documents use the "Archiva" name for Money To Scale work.** The first brief was titled "Archiva Studio", so the audit and design inherited the name:
   - `audit/ARCHIVA_EDITING_ARCHITECTURE_CURRENT_STATE.md` (filename);
   - mentions in `audit/CLAUDE_VIDEO_WORKFLOW_AUDIT.md`, `design/VISUAL_DIRECTOR_DESIGN.md` and `design/UNIFIED_SCENE_TIMELINE_SCHEMA.md`;
   - the schema id `"archiva.media_plan/1"` (`UNIFIED_SCENE_TIMELINE_SCHEMA.md:26`).

   These describe the **Money To Scale** production system only. Recommended correction (not done, awaiting your OK): rename to channel-neutral terms (e.g. `hybrid.media_plan/1`), add a `channel` field, and rename the audit file.
2. **Hard-coded artist metadata.** `assemble.py:24` in **both** project folders writes `artist=Past The Rating`. The committed MTS final was assembled by `finish_1080.sh`, which sets only a title (verified: the file has `title=What ₹1 Crore Actually Looks Like` and no artist tag), so nothing wrong shipped. But any future project that copies `assemble.py` will be mislabelled. This is latent, not active.
3. **The finance channel's identity is unresolved in the repo.** It ran Past The Rating (15 Nov) → Money To Scale (17 Nov) → **Lakhometer** (18 Nov, `brand/lakhometer/BRAND_GUIDE.md`: "Lakhometer · *Money, measured.*"). You now call it "Money To Scale". Which identity is current needs your confirmation. It doesn't affect the pilot, which must reproduce the ₹1 Crore film exactly as published with its Money To Scale branding.
4. **The design's editorial policy came from one film.** Visual Director rule R0 ("no photoreal AI depiction of a real tragedy") was derived from the Hyatt film. Archivra will need its own rules (e.g. depicting deities, temple interiors, historical figures, religious sensitivities, rights to temple photography). Policy has to be per channel, not global.

## 5. Can the current architecture support both channels?

**Partially. The core timing and audio logic is channel-neutral, but everything brand-related is hard-coded per project, and the text handling is not safe for Telugu.**

| Component | Channel-neutral? | Evidence |
|---|---|---|
| `tts.py`, `timeline.py`, `subs.py`, `mix.py` structure, `assemble.py` structure, `qc.py`, render caching | **Yes in logic.** Voice, model and speed come from each project's `script.json`; no channel name appears in the logic | Source read; byte-identical regeneration for both films |
| Engines (`engine.html`, `engine_v.html`, MTS `engine.html`) | **No.** Palette, fonts, HUD text, logo path and end card are literals | Hyatt `engine.html:180,470,481` ("PAST THE RATING", "CASE 001 · HYATT REGENCY…"); MTS `engine.html:75,91,95,239,242,246` ("Money To Scale", logo `brand/money_to_scale/renders/profile_800.png`, "EDUCATION ONLY · NOT FINANCIAL ADVICE") |
| Metadata | **No** | `assemble.py:24` `artist=Past The Rating` |
| Encode profiles | Per project (implicit in each `render.js`) | Hyatt `render.js:59-61`; MTS `render.js:18` |
| Music/SFX style | Per project (prompt literals) | `gen_audio.py:7` (Hyatt BASE), MTS `gen_audio.py` BASE |

### Telugu: blocking defects found by test (no files changed)
1. **Word cues silently resolve to the wrong time (critical).** The word normalizers strip everything except `a-z0-9`:
   - `timeline.py:15-16` uses `[^a-z0-9']`;
   - `mix.py` `cue()` (Hyatt `mix.py:11`) uses `[^a-z0-9]`;
   - the engine `cueFn` (`engine.html:486`) does the same.

   Every Telugu word therefore normalizes to an empty string. Test: `cue("గోపురం")`, intended at 2.9 s, **resolved to 0.35 s**, the first Telugu word in the scene, with no error. Sound effects, music hits and engine animations keyed to Telugu words would all fire at the wrong moment, silently. The existing code must not be used as-is for Telugu narration.
2. **No proper Telugu font is installed.** `fc-list :lang=te` finds only GNU Unifont (a bitmap fallback). On-screen Telugu text and burned captions would render badly. Archivra needs a vendored Telugu font (e.g. Noto Sans/Serif Telugu, OFL) in its own brand folder.
3. **Subtitle line length counts code points, not visible characters.** `subs.py` `max_chars=42`, while one Telugu word like శ్రీకాళహస్తి is 12 code points. Lines would break too early. This is cosmetic but needs a per-language setting.
4. **Telugu TTS quality and model support are NOT VERIFIED.** The pinned model `eleven_v4` and the English voice clone have never been tested in Telugu. A one-line test would cost credits, so it has not been run.
5. **What works for Telugu:** `subs.py` sentence splitting on `.?!` and whitespace (tested: produced a correct cue), ElevenLabs alignment-to-word grouping on whitespace (`tts.py:20-30`), and all FFmpeg audio and video steps.

## 6. Recommended separation model (proposal only, not implemented)

```
channels/
  money_to_scale/            (or lakhometer/ once you confirm the current identity)
    channel.json   name, language "en", voice {id, model, speed}, palette, fonts, logo, HUD/endcard text,
                   metadata {artist}, disclaimer, encode_profile, editorial_policy, label_rules
    brand/ → existing brand/money_to_scale (referenced, not moved)
    projects: MTS_Video_001 (+ Video_001 as legacy Past The Rating)
  archivra/
    channel.json   language "te", Telugu font, voice, palette, heritage editorial policy,
                   rights rules for temple and archival imagery, its own encode profile
    projects: …
```
- Each project and each `media_plan.json` declares one `channel`. The hybrid tools refuse to read a catalog, prompt, voice or brand asset from a different channel unless a per-asset exception is approved.
- Budget records carry `channel`, so shared ElevenLabs and Higgsfield spend is reported per channel.
- **Strong recommendation:** develop Archivra in **its own repository**, with its own cloud environment and its own vidIQ link. This repo is named after the finance channel, carries three generations of finance branding, and its environment holds the shared ElevenLabs key. A separate repo makes separation structural rather than a matter of discipline. Shared code (the hybrid pipeline, once proven) can later be extracted into a package both repos use.
- Existing Money To Scale projects stay exactly as they are (Decision 1). A `channels/` layer would only be read by new `pipeline/hybrid/` code.

## 7. Decisions needed from you
1. **Finance channel identity:** is its current name *Money To Scale* or *Lakhometer*? (The pilot keeps the published Money To Scale branding either way.)
2. **The Hyatt film:** confirm it belongs to the finance channel's history (made as *Past The Rating*), not to Archivra.
3. **Archivra location:** a separate repository (recommended), or a separate top-level `channels/archivra/` area in this repo?
4. **Existing Archivra materials:** where are the temple, history and Telugu projects you're developing? I found none in reachable locations.
5. **Correcting my documents:** may I replace the "Archiva" naming in the audit and design docs with channel-neutral terms plus a `channel` field?
6. **Earlier items still open:** the three S02 clips, permission to push `maint/three-pin`, and the S02 label wording.
