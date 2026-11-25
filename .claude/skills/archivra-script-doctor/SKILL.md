---
name: archivra-script-doctor
description: Diagnose and rewrite scripts for the Archivra YouTube channel (history, archives, hidden stories) so viewers stay longer. Use when the user shares a script, outline, voiceover draft or video topic, or asks to improve a hook, retention, pacing, storytelling or a Shorts script. Produces a scored diagnosis, then a rewritten script with hooks, open loops and re-hooks, and flags every factual claim that needs a source.
---

# Archivra Script Doctor

The goal of a script is to keep the right viewer watching until the end, and to leave them wanting the next video. YouTube's
recommendation system mainly measures what viewers do: did they click, how long did they watch, and were they satisfied (did they
like, share, comment, come back, keep watching more videos). A script controls most of the "how long" and "satisfied" parts.

## Inputs

Ask only for what is missing:
1. The script, outline or topic (required).
2. The format: long video (give the target length) or Short (under 60 s).
3. The planned title and thumbnail idea, if any. The opening must deliver on the promise they make.

## Step 1 — Diagnose (score out of 10 each)

| Area | What to check |
|---|---|
| **Hook (first 30 s; Shorts: first 2 s)** | Does it start inside the story, not with "Hi guys / welcome / today we will"? Is there a clear question, a mystery, or high stakes? Does it confirm what the title and thumbnail promised within about 10 s? |
| **Promise & stakes** | Does the viewer know why this matters, and what they will understand by the end? |
| **Open loops** | Are questions raised that only get answered later ("but that wasn't the strangest part")? |
| **Re-hooks** | Is there a turn, reveal or new question every 60–90 s in long videos? Each act should end on something unresolved. |
| **Specificity** | Names, dates, places, numbers, objects, real quotes. Vague words ("many people", "a long time ago") lose attention. |
| **Pacing** | Is there background info dumped before the viewer cares about it? Sentences longer than about 25 words in a voiceover? Repeated points? |
| **Visual cues** | Does each section say what is shown (archive photo, map, document, timeline, B-roll)? A faceless channel lives on its visuals. |
| **Payoff** | Is the main question answered well? Is the ending stronger than the middle? |
| **Ending** | Does it avoid a long goodbye that makes people leave? It should hand off to a specific next Archivra video. |
| **Accuracy** | Is every claim something a source supports? |

Report the 3 biggest problems first, each with the exact line and a concrete fix. Then give the scores in a table.

## Step 2 — Rewrite

Structure for a long video (adjust to length):
1. **Cold open (0:00–0:30):** the most dramatic moment or the strangest fact, shown and not explained. End it on a question.
2. **Promise (0:30–0:45):** one line saying what the viewer will find out. No channel intro and no subscribe request here.
3. **Context, only as much as needed:** the background, told as story (people who want something and face an obstacle).
4. **Escalation acts:** each act reveals something and opens the next question. Put a re-hook line at every act break.
5. **Climax / reveal:** the answer to the cold-open question.
6. **Meaning (15–30 s):** why it still matters, or what it changes.
7. **Hand-off:** "If this surprised you, the story of ___ is even stranger" and point to one specific video. Keep any subscribe request short and after the payoff.

Structure for a Short:
- 0–2 s: the strongest visual plus a hook line (a surprising fact or "This ___ was hidden for ___ years").
- 2–45 s: tension, 2–3 quick beats, no setup.
- End: the reveal, ideally in a line that loops back to the first frame. Optionally point to the long video.

Rewrite rules:
- Write for the ear: short sentences, active voice, and one idea per sentence.
- Add a `[VISUAL: ...]` cue on its own line for every beat.
- Mark re-hooks with `[RE-HOOK]` so the editor can add a sound or zoom there.
- Keep the creator's voice and facts. Do not add drama that the facts do not support.
- If the user writes in Hindi, Telugu or Hinglish, rewrite in that same language.

## Step 3 — Accuracy check (do not skip)

History channels lose trust fast when they get things wrong. List every date, number, name, quote and cause-and-effect claim in a table:
`Claim | Status (sourced / needs source / disputed) | Suggested source type`.
- Never invent quotes, dates, statistics or sources. If you are unsure, say so and mark it "needs source".
- Words like "legend says" and "historians disagree" are fine when true. They also work as open loops.

## Step 4 — Hand-off

End with:
- 3 alternative cold-open lines.
- The 3 strongest 20–45 s moments in the script that could become Shorts (give their timestamps or section names).
- A suggestion to run `archivra-reach` for the title, thumbnail and description.

If vidIQ tools are connected and have credits, `vidiq_before_scripts_outlines_and_edits` and `vidiq_video_transcript` (for comparing against a competitor that is doing well) can add data. Say what each one costs before using it.
