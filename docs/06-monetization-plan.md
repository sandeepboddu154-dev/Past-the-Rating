# Deliverable 9 — Monetization Plan & Eligibility Tracker

## 1. The rules (India), as researched 15 Nov 2026

| Tier | What it unlocks | Requirement **until 31 Jan 2027** | Requirement **from 1 Feb 2027 (new applicants)** |
|---|---|---|---|
| Expanded YPP (early access) | Channel memberships, Super Thanks/Chat/Stickers, Shopping, Creator Partnerships. **No ad revenue.** | 500 subs + 3 public uploads in 90 days + (3,000 public watch hours in 12 months **or** 3M public Shorts views in 90 days) | **Unchanged** (500 subs + 3,000 qualified hours or 3M qualified Shorts views) |
| Full YPP (ad revenue) | Watch-page ads + Shorts feed revenue share | 1,000 subs + (4,000 public watch hours in 12 months **or** 10M public Shorts views in 90 days) | **1,000 subs + (8,000 qualified watch hours in 365 days or 20M qualified Shorts views in 90 days)** |

- **Shorts views never convert into watch hours.** The two paths are separate and don't combine.
- Only **public** videos count. Unlisted, private, deleted and Premiere-replay quirks don't.
- Applying is not the same as being accepted. After you meet thresholds, YouTube reviews the channel (typically about a month, sometimes longer). The review checks **inauthentic/reused content**, advertiser-friendliness, and policy compliance across the whole channel.
- **Also required:** live in an eligible country (India ✓), no active Community Guidelines strikes, 2-Step Verification on the Google account, an AdSense account linked in Studio → Earn.
- **Source quality:** the 1 Feb 2027 thresholds are quoted from YouTube's own help page ([Changes to the YouTube Partner Programme](https://support.google.com/youtube/answer/12843009)). This session's network couldn't open that page directly, so it was read through search snippets. **Before planning around exact wording ("qualified" hours, grandfathering), open that page yourself.** Open questions to check there: (a) are channels that *applied* before 1 Feb grandfathered, or only those *accepted*? (b) how are "qualified" hours defined?

## 2. What this means for us (the strategic insight)

The rule change creates a **78-day window** (15 Nov 2026 → 1 Feb 2027). In that window, the ad-revenue bar is half what it will be afterwards:

- **Stretch goal ("beat the deadline"):** 1,000 subs + 4,000 public watch hours, and the application submitted, **before 1 Feb 2027**.
- **Committed goal:** 500 subs + 3,000 watch hours (expanded tier). This threshold doesn't change in February, so it's the realistic, safe milestone.
- **After 1 Feb, if we miss the stretch:** we need 8,000 hours. That's why we build a long-form library *now*. Every evergreen long-form keeps earning hours for 12 months.

### The maths behind the stretch goal
4,000 hours = 240,000 watch minutes.
If a 12-minute video holds viewers for ~4.5 min on average (≈ 38% average view percentage, typical for good documentaries):
→ **≈ 53,000 long-form views needed**.
Target **~45 days of runway** (apply by ~5 Jan, leaving review margin): about 14 long-form videos (2/week), averaging **~3,800 views each**, or one breakout carrying the rest.

| Scenario | Long-form avg views | Hours by 5 Jan | Verdict |
|---|---|---|---|
| Conservative | 500 | ≈ 500 | Expanded tier ~Q1–Q2 2027 |
| Base | 1,500 | ≈ 1,600 | Expanded tier ~Feb–Mar 2027; full YPP under the new 8,000-h rule later in 2027 |
| Breakout (one video hits 100K+) | — | 4,000+ | Full YPP under **old** rules before 1 Feb |

**Honest assessment:** without a breakout, 4,000 hours from zero in ~50 days is unlikely. The plan is built so that a breakout is *possible* (strong packaging, a topic library with proven demand) while the base case still produces a durable asset.

### The Shorts path
3M Shorts views in 90 days unlocks only the *expanded* tier (no ad revenue). One breakout Short (1M+) is realistic in this niche (see competitor data), so Shorts may hit the expanded threshold before watch hours do. 10M Shorts views (full YPP, old rules) in 78 days needs several viral hits. Treat it as upside, not the plan.

### What 7 days can deliver (Day-7 targets)
| Metric | Day-7 target | Why it matters |
|---|---|---|
| Uploads | 6 Shorts + 1 long-form, all QC-passed | Builds the algorithm's audience model |
| Shorts "stayed to watch" | ≥ 70% | Hook quality |
| Shorts avg % viewed | ≥ 85% | Retention |
| LF-01 avg % viewed | ≥ 35% | Watch-hour efficiency |
| LF-01 impressions CTR | ≥ 5% | Packaging |
| Subscribers | 50–150 (base case) | Early proof |
| Watch hours | 20–100 (base case) | Starting the clock |

## 3. Monetization dashboard (update daily)
The live tracker is `tracker/monetization-tracker.csv`. Open it in Google Sheets or Excel, or ask me to build it as an Airtable base or a live dashboard page.

| Field | Formula / source |
|---|---|
| Subscribers (current) | Studio → Analytics → Overview |
| Required subs | 500 (expanded) / 1,000 (full) |
| Public watch hours, last 365 days | Studio → Earn → eligibility card |
| Required hours | 3,000 (expanded) / 4,000 until 31 Jan, then 8,000 (full) |
| Shorts views, last 90 days | Studio → Earn |
| Hours/day needed | (required − current) ÷ days remaining to target date |
| Uploads (Shorts / long-form) this week | Count |
| Status | Not eligible / Expanded eligible / Applied / Under review / Accepted |

## 4. Revenue roadmap beyond AdSense
| Stream | When | How |
|---|---|---|
| **Affiliate** (Amazon Associates India/US, specialist retailers) | From ~1,000 subs, and only on *Read the Rating* episodes | Products directly tied to the rating discussed (rated helmets, tyre pressure gauges, IP-rated cases). Disclose affiliate links. |
| **Sponsorships** | ~5K–10K subs with consistent long-form views | Engineering/learning brands (Brilliant-type), engineering software, tools, education platforms. One integrated read per long-form, placed after the first chapter. |
| **Memberships / Super Thanks** | Expanded tier (500 subs) | Members get the source pack (diagrams + references) for each episode. |
| **Digital products** | 10K+ subs | "Rated: The Engineering Failure Casebook" PDF (originals of our diagrams + case summaries) for students and engineering-ethics teachers. Licensing our diagrams to educators. |
| **Brand partnerships** | Later | Safety-equipment brands, insurance (risk education). Must fit the forensic tone. |

## 5. Integrity rules (non-negotiable)
No sub4sub, engagement pods, paid views, bot traffic, "promotion" services, reused clips as the main content, misleading thumbnails, or mass-produced AI uploads. Any of these can fail the YPP review even after thresholds are met, which is the most expensive failure possible.
