# Pilot Scene S02: Inspection and Footage Brief

Project: **MTS_Video_001**, *What ₹1 Crore Actually Looks Like*. Source of truth: branch `claude/past-the-rating-monetization-n5o38k` @ `a0dad6a`. Everything below was read from the committed files or measured from the committed final MP4.

## 1. Exact narration
From `Script/script.json` (identical to `Voiceover/scenes/S02.json → text`):

> "And once we've built it, we'll ask three questions. How long does it really take to get there? What will it actually be worth when you do? And is it even enough?"

Voice: owner's ElevenLabs clone, `eleven_v4`, speed 0.9. This narration is **not regenerated or changed** by the pilot.

## 2. Duration and position (from `Project_Files/timeline.json`)

| Item | Value |
|---|---|
| Segment start | **16.875 s** (film frame 405) |
| Segment duration | **11.625 s = 279 frames @ 24 fps** |
| Segment end | 28.500 s (frame 684); next is `CH01` chapter card "01 · The Stack" |
| Narration starts | 17.225 s (lead 0.35 s) |
| Narration length | 10.606 s (ffprobe of `S02.mp3`) |
| Tail after narration | 0.669 s |
| Music under S02 | `M1_open` continues through S02 (`mix.py:16`, runs 0 → CH01 + 0.6 s). **No SFX cue falls inside S02** (`mix.py` has no `S02` reference) |
| Previous scene | `S01` "open_tower" ends on the 3D ₹1 crore stack (2.2 m) beside a 1.75 m figure with the "₹1,00,00,000" title, then fades out |

Word timings (seconds from segment start, lead included):
`And 0.35 · once 0.59 · we've 0.83 · built 1.07 · it, 1.39 · we'll 1.83 · ask 2.03 · three 2.47 · questions. 2.67 · How 3.83 · long 4.07 · does 4.27 · it 4.43 · really 4.67 · take 5.11 · to 5.27 · get 5.39 · there? 5.63 · What 6.27 · will 6.47 · it 6.59 · actually 6.91 · be 7.43 · worth 7.71 · when 7.95 · you 8.11 · do? 8.51 · And 8.91 · is 9.47 · it 9.59 · even 9.71 · enough? 10.03`

## 3. What S02 shows today and what it must keep
The current visual, `SC.open_question` in `engine.html:92-95` (see `S02_sheet.jpg`):
- It rebuilds S01's 3D scene (`SC.open_tower.build()`): the 2.2 m stack, the ruler and the human figure, with a slow camera sway.
- It reveals **three numbered on-screen questions**, each keyed to a narration word: "01 How long does it take?" on *long* (4.07 s), "02 What will it be worth?" on *worth* (7.71 s), "03 Is it even enough?" on *enough* (10.03 s).
- It shows the "Money To Scale" HUD.

**Visual requirement.** S02 is the film's **roadmap**: the three questions are the three acts that follow (time to save, inflation, sufficiency). Two things are load-bearing and must survive the swap:
1. **The three questions must be readable on screen**, timed to the words. They carry structure, not decoration.
2. **The first beat refers back to the tower** ("once we've *built it*"). Cutting away from the tower before the questions start would break that reference.

## 4. How many Veo clips: **3**
One 8 s clip is **not** sufficient. It is shorter than the 11.625 s scene, and one generic shot would only illustrate "money" in general, not three different questions. That would be footage chosen because it is available, which the design forbids.

The scene splits into four beats. Cuts are placed 0.10 s before each question's first word, snapped to the frame grid:

| Beat | Narration | Segment frames | Duration | Source |
|---|---|---|---|---|
| B0 | "And once we've built it, we'll ask three questions." | 0–88 | **3.708 s** (89 f) | **Original engine frames** (the tower), from the committed final. No Veo |
| B1 | "How long does it really take to get there?" | 89–147 | **2.458 s** (59 f) | **Veo clip 1: time** |
| B2 | "What will it actually be worth when you do?" | 148–210 | **2.625 s** (63 f) | **Veo clip 2: value / inflation** |
| B3 | "And is it even enough?" | 211–278 | **2.833 s** (68 f) | **Veo clip 3: enough / the future** |

Each Veo clip is used for under 3 s, so an 8 s generation leaves room to choose the cleanest window: avoid the first and last ~0.5 s, where AI clips most often stall or morph. If a supplied clip has a usable window shorter than its beat, the pilot **fails QC for that beat** rather than looping or freezing it.

## 5. How the remaining duration is filled
- **B0 (3.708 s) reuses the scene's own original engine frames.** These are decoded from the committed final (frames 405–493), not re-rendered, so it is exactly what viewers saw before, with its original fade-in. It keeps visual continuity from S01's tower and honours "once we've built it". It is re-encoded once, inside the new S02 segment; the loss is measured in the pilot reports.
- **The three questions are overlaid** on B1–B3 in the engine's style, at the engine's position (x = 1060 px, y = 330 / 450 / 570), as a cumulative list exactly like today:
  - orange `DejaVu Sans Mono` numbers "01/02/03" at 44 px;
  - white Inter Display Black text at 54 px;
  - each line fades in over 0.6 s around its word, as `engine.html:94` does (`P(t, tc-.4, tc+.2)`).

  This is word-timed overlay graphics, not AI.
- **Cuts inside S02** are hard cuts on the beat (the narration's own rhythm). **S02's outer edges** keep the MTS engine behaviour: B0 already carries the original fade-in, and B3 gets the engine's 0.12 s fade-out to the MTS background `#0E0F12` (`engine.html:6,58`), so the cut into CH01 looks the same as before.
- **No other scene, the narration, the music, the SFX or the subtitles change.**

## 6. Footage specification (please generate to this)

| Parameter | Requirement | Why |
|---|---|---|
| Aspect ratio | **16:9 landscape** | Canvas is 1920×1080 |
| Resolution | **1080p (1920×1080) preferred**; 720p accepted but flagged for review (1.5× upscale) | Matches the canvas without visible upscaling |
| Frame rate | **24 fps** | The timeline is 24 fps; other rates are converted and judder on camera moves |
| Length | **8 s each** (default Veo length is fine); minimum usable window 3.5 s | Room to pick a clean 2.5–2.9 s window |
| Count | **3 clips** (one per question). Optional: 1 extra take of each for choice | — |
| Audio | Any. It is **dropped** in the pilot | Narration and score stay untouched |
| On-screen text | **None**: no captions, logos, watermarks or numbers | We overlay the questions; AI text renders badly |
| Composition | Keep the **right ~45% of the frame calm and darker** | The questions sit at x ≥ 1060 px |
| Look | Low-key, dusk or night, warm practical light, muted colours, slow steady camera (slow push-in or gentle drift). No fast cuts or whip pans | Matches the film's dark navy-carbon 3D world, so the cut from B0 doesn't jar |
| Content limits | No close-ups of banknotes or readable currency (AI distorts notes and they would be factually wrong); no identifiable real people; faces preferably not in focus | Factual accuracy and the channel's rules (`docs/07-workflow-and-qc.md:45-48`) |

### Suggested prompts (edit freely)
1. **Time:** "Cinematic slow push-in on an analog wall clock in a dim Indian apartment at night, a laptop glowing on a desk below, warm lamp light, shallow depth of field, muted dark tones, the right side of the frame is a dark empty wall, no text, 24 fps."
2. **Value / inflation:** "Cinematic slow dolly along the counter of a small Indian kirana grocery shop at dusk, hands placing a few vegetables and packets on a steel scale, warm bulb light, muted colours, faces out of frame, the right side of the frame soft and dark, no readable text, no currency notes, 24 fps."
3. **Enough / the future:** "Cinematic wide shot from behind of an elderly Indian couple sitting on a balcony at dusk overlooking a city with lights coming on, gentle slow drift, warm and calm, faces not visible, darker sky on the right of the frame, no text, 24 fps."

## 7. Labelling and disclosure (decision for you)
The channel rule says AI-realistic imagery gets an on-screen label and the YouTube "Altered or synthetic content" disclosure (`docs/07-workflow-and-qc.md:47`). The rule's on-screen word is `RECONSTRUCTION`, but these shots reconstruct no real event. I recommend a small **"AI-GENERATED VISUALS"** tag in the bottom-left corner for B1–B3, plus the upload disclosure. Please confirm or choose otherwise.

## 8. How to supply
Put the clips in `MTS_Video_001/inbox/veo/` as `S02_q1_time.mp4`, `S02_q2_value.mp4`, `S02_q3_enough.mp4`. Optionally add a `<same name>.prompt.txt` with the prompt used. Upload them here or tell me their location.

## 9. What happens when the footage arrives (approved scope only)
`pipeline/hybrid/`:
1. ingest + ffprobe catalog
2. `media_plan.json` for S02
3. clip preprocessing: trim, scale, 24 fps, BT.709 → BT.601 colour, overlay
4. encoder-compatibility validation against the real MTS segments (byte-compared SPS/PPS)
5. lossless recovery of the 29 other segments from the committed final
6. assembly with the unchanged `assemble.py` logic, using the existing mix and SRT
7. the strict regression and QC gate

Then the five pilot reports. No Visual Director and no credit manager.
