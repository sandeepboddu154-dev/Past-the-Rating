# Deliverable 5 — Brand Identity & Content Style

## Positioning
**One-liner:** *Everything is built for a number. We show what happens past it.*
**Signature question (closes every long-form):** *How far past the rating can it really go?*
**Category we own:** the numbers behind engineered limits, told as forensic stories, including the decisions and money behind them.

## Target audience
- **Core:** men and women aged 18–44 who are curious about how things work: engineering/STEM students and grads, tradespeople, aviation/auto/infrastructure enthusiasts, and documentary watchers.
- **Geography (deliberate mix):** narrate in clear international English and pick globally known stories (US/UK/EU), so we pull high-RPM US/UK/CA/AU viewers. India's large English-speaking engineering audience supplies volume and early subscribers. Add one India story per month (e.g. infrastructure ratings) once the channel has data.
- **Psychographic:** they distrust hype and love the "aha" of a mechanism. They'll comment to correct us, so we must be accurate.

## Brand personality
Forensic · calm · precise · quietly dramatic · respectful. Think *accident investigator*, not *YouTuber*.
- Never: "you won't BELIEVE", screaming text, gore, mocking victims, fake urgency.
- Always: the number, the mechanism, the decision, the consequence.

## Narration
- **Recommendation: you record it in your own voice.** A consistent human voice is the strongest protection against the 2026 inauthentic-content enforcement and the hardest thing for competitors to copy. Low, measured and unhurried. Any accent is fine if it's clear.
- If you choose AI TTS instead: use one fixed, properly licensed voice for every video, never switch it, and keep the scripting original.
- Pace: Shorts 160–170 wpm; long-form 145–155 wpm. Pause before every number reveal.
- Person: third-person storytelling; "you" only in the final line.

## Signature format device: **THE RATING BAR**
Every Short opens, and every thumbnail is built, around one horizontal gauge:
```
RATED ─────────────────────|100%─────────── ACTUAL 154% ▶▶ (orange)
```
- A steel-grey fill climbs to the **RATED** tick (100%). If reality exceeds it, the fill turns **Rating Orange** and the bar visibly *breaks* past the tick.
- A large mono number counts up in sync.
- On screen within the first 1.5 seconds of every Short, so viewers recognise the channel before they hear a word.
- A render template is in `brand/src/` and a sample animation is in `brand/renders/rating-bar-demo.mp4`.

## Visual language
| Element | Rule |
|---|---|
| Base | Near-black "carbon" backgrounds with a subtle blueprint grid |
| Diagrams | Clean 2D technical line drawings: steel-grey lines, orange for the failure path |
| Archival | Real public-domain photos and report figures, desaturated, with credit captions |
| AI imagery | Only for reconstructions of moments with no photo. Muted, documentary-realistic, **no faces in distress, no gore**, labelled "Reconstruction" on screen plus the YouTube altered-content disclosure |
| Motion | Slow push-ins (2–4% scale over 5 s); hard cuts on number reveals; no spinning transitions |
| Text | Max 3 words per on-screen phrase; numbers always mono |

## Colour palette
| Token | Hex | Use |
|---|---|---|
| Carbon | `#0B0B0C` | Backgrounds |
| Graphite | `#1C1F24` | Panels, grid |
| Steel | `#C9CDD2` | Lines, secondary text, "rated" fill |
| Signal White | `#F4F4F2` | Primary text |
| **Rating Orange** | `#FF5A1F` | The breach: overload, failure path, key number. **Max one orange element per frame.** |

## Typography (free, already installed locally)
- **Headlines:** Inter Display Black/ExtraBold, ALL CAPS, tight tracking (−2%).
- **Numbers:** DejaVu Sans Mono Bold, or JetBrains Mono (free) if installed.
- **Body/captions:** Inter SemiBold.

## Thumbnail identity
1. One subject (object or diagram), large and off-centre.
2. One Rating Bar or one big number in orange.
3. At most 3 words of text. The title and thumbnail must say *different* things.
4. Carbon background. The orange slash from the logo may cut through the subject at the failure point.
5. No faces in fear, no red arrows/circles, no fake explosions.

## Music & sound
- **Bed:** low cinematic drones, analog pulses, sparse piano. Sources: YouTube Audio Library (free, cleared for monetization), Pixabay Music (check per-track licence).
- **Signature sound:** a metallic *strain creak, then a single "tink"* at the moment the Rating Bar crosses 100%. The same sound every time becomes the audio logo.
- Duck music −18 dB under narration; silence for 0.5 s before the main reveal.

## Video structure
**Shorts (30–40 s):** `0–1.5 s` number + Rating Bar + hook line → `1.5–8 s` context (what, where, when) → `8–28 s` the mechanism in 2–3 beats → `28–36 s` the payoff number → `36–40 s` one-line "so what" that loops naturally back to the hook.

**Long-form (10–16 min):** Cold open with the moment of failure (0:00–0:45) → title card → *The Rating* (what it was designed for) → *The Decision* (what changed) → *The Load* (the day itself) → *The Money Line* (who paid, what it cost) → *The Fix* (what changed in codes or industry) → closing question plus next-video end screen.

## Playlists (create on day 1)
1. Past The Rating: Investigations
2. Tested to Destruction
3. Read the Rating: What Your Labels Really Mean
4. The Human Rating

## Updated channel description (ready to paste)
> Everything is built for a number: a load, a speed, a pressure, a limit.
> PAST THE RATING investigates what happens when reality goes beyond it.
>
> 🔶 Investigations: engineering failures, the decisions behind them, and what they cost.
> 🔶 Tested to Destruction: the tests, margins and survival stories that prove how far things can go.
> 🔶 Read the Rating: what the numbers on your phone, tyres and helmet really mean.
>
> Research-led. Built around the numbers. Reconstructions are clearly labelled.
> New Shorts most days, and a full investigation every Saturday.
>
> How far past the rating can it really go?
