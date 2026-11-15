# Deliverable 10 — Production Workflow, QC Gate & Daily Analytics Loop

## 1. Toolchain (audited 15 Nov 2026)

| Tool | Status | Use |
|---|---|---|
| **vidIQ (MCP)** | Connected, but to **Archivra**, not Past The Rating. **4 credits left**, renews 26 Nov | Keyword/outlier research; Studio analytics once Past The Rating is connected |
| **Higgsfield (MCP)** | Connected, **0 credits, free plan** | AI image/video generation. **Not used until you approve a purchase** |
| **Airtable (MCP)** | Connected | Optional: content pipeline and tracker base (needs your OK to create) |
| **Local: ffmpeg, Playwright/Chromium, ImageMagick, Python PIL, Inter fonts** | Available, free | Thumbnails, banner, Rating Bar motion graphics, caption burns (`brand/src/`) |
| **Your side (free):** DaVinci Resolve or CapCut, YouTube Audio Library, a USB mic or phone | — | Edit, music, narration |

**Spend policy:** nothing paid is used without your explicit approval. The cheapest effective upgrade, if you want one: a modest Higgsfield or similar image-credit pack *only* for reconstruction shots. Everything else in week 1 is doable for free.

## 2. Production pipeline (per video)

```
RESEARCH ──► SCRIPT ──► FACT-CHECK ──► VO ──► VISUALS ──► EDIT ──► QC GATE ──► PACKAGE ──► PUBLISH ──► 48h REVIEW
 (Claude)   (Claude)  (Claude+You)   (You)  (Claude+You) (You)  (Both)     (Claude)    (You)       (Claude)
```

| Step | Owner | Output | Time budget (Short / Long) |
|---|---|---|---|
| Research & angle | Claude | Topic brief + sources | done / done |
| Script | Claude | `production/...md` | done / done |
| Fact-check | Claude drafts the sheet; **you sign off** after checking the sources | ✅ column ticked | 15 min / 60 min |
| Voiceover | **You** (phone in a closet with clothes = good booth) | WAV, −14 LUFS | 10 min / 45 min |
| Visuals | Claude renders diagrams/graphics from `brand/src/`; you add archival/stock | PNG/MP4 assets | 45 min / 4–6 h |
| Edit | You (CapCut/Resolve) using the scene table | Master export | 45 min / 4–6 h |
| QC gate | Both. See §3 | Pass/fail | 10 min / 30 min |
| Package | Claude | Title, cover, description, tags, chapters (retimed to the real edit) | done |
| Publish | **You** (needs account access) | Live URL | 5 min |
| Review | Claude, with Studio data | Notes into the next brief | daily |

## 3. QC gate: publish only if every box is ticked

**Hook & retention**
- [ ] First frame shows the number/Rating Bar; the first spoken line lands within 0.3 s
- [ ] The hook is an object plus a violated expectation, not a question about the viewer
- [ ] A new piece of information or a visual change at least every 3 s (Shorts) / 20 s (long-form)
- [ ] Payoff delivers a specific number; ending loops (Shorts) or poses the signature question (long-form)
- [ ] Short is **30–40 s**. Measure the actual export, not the script estimate.

**Truth & policy**
- [ ] Every factual claim is ticked in the fact-check table
- [ ] No third-party footage as primary visual; every archival item is PD or licensed and credited
- [ ] AI-realistic imagery → `RECONSTRUCTION` on screen + "Altered or synthetic content" = Yes at upload
- [ ] No gore, no distressed faces, no casualty numbers in title or thumbnail
- [ ] Title and thumbnail are accurate (the video delivers what they promise)

**Craft**
- [ ] Captions burned in (Shorts) / SRT uploaded (long-form); spelling checked
- [ ] Audio: no clipping, VO −14 LUFS, music ducked
- [ ] Text clear of the Shorts UI safe zones
- [ ] Thumbnail readable at 160×90 px (shrink test)
- [ ] Long-form chapters retimed to the real edit (first chapter at 0:00, at least 3 chapters, each ≥ 10 s)

**Reject rule:** if any box fails and can't be fixed before the slot, **slip the upload.** A missed day costs little; a weak upload teaches the algorithm the wrong audience.

## 4. Daily analytics loop (from Day 2)
Each day at ~11:00 IST, I pull the following (once Studio is connected) and log changes in `STATUS.md`:

1. **Shorts:** stayed-to-watch vs swiped-away per Short (the hook verdict), avg % viewed, subs gained per 1K views.
2. **Long-form:** impressions CTR, average view duration, retention curve (find the exact second of each drop), traffic sources (Browse vs Suggested vs Search).
3. **Audience:** countries (are we reaching US/UK?), returning vs new viewers.
4. **Decision rules:**
   - Stayed-to-watch < 60% → rewrite hook pattern for the next Shorts
   - Avg % viewed < 70% on a Short → it's too long or the middle sags; cut 5 s next time
   - CTR < 3% after 1,000 impressions → swap the thumbnail (Test & Compare)
   - Retention drop > 10 points in one segment → note the segment type and avoid it in the next script
   - A pillar outperforming the others 2× → double its share in next week's calendar
5. **Weekly (Sundays):** a week-in-review covering top/bottom performer, why, and next week's calendar adjusted.

## 5. Week-2 production rhythm (steady state)
| Day | Shorts | Long-form |
|---|---|---|
| Mon | publish | LF-02 script + fact-check |
| Tue | publish | LF-02 VO + visuals |
| Wed | publish | LF-02 edit → **publish Wed 8:30 PM IST** |
| Thu | publish | LF-03 script + fact-check |
| Fri | publish | LF-03 VO + visuals |
| Sat | — | LF-03 edit → **publish Sat 8:30 PM IST** |
| Sun | batch-script next week's Shorts + weekly review | — |
