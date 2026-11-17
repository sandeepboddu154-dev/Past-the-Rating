# Money To Scale #1 — Research & Fact-Check Record
**"What ₹1 Crore Actually Looks Like (And How Long It Really Takes)"** · checked 17 Nov 2026
All computations are reproducible in `Research/numbers.txt`.

## Sourced physical facts
| Claim | Value used | Source |
|---|---|---|
| ₹500 note (Mahatma Gandhi New Series) size | 150 × 66 mm | [RBI press release](https://rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=38524); [Wikipedia: MG Series](https://en.wikipedia.org/wiki/Mahatma_Gandhi_Series) |
| Banknote thickness | ≈ 110 microns (≈ 0.11 mm) | RBI specification table ([PDF](https://www.rbi.org.in/scripts/..\upload\content\pdfs\62916.pdf)). The table also lists 100 microns in another entry, so the narration says "around 110 microns", not "exactly". |
| ₹100 note size | 142 × 66 mm | RBI/Wikipedia note specifications |
| ₹10 note size | 123 × 63 mm | RBI/Wikipedia note specifications |
| Qutub Minar height | 72.5 m | ASI inventory / [IGNCA ASI report](https://ignca.gov.in/asi_reports/sd94qa0001a.pdf) |
| RBI inflation target | 4% (CPI, ±2% band) | RBI flexible inflation-targeting framework |
| "4% rule" origin | US research (Bengen 1994 / Trinity study) | Standard financial-planning literature. Flagged as optimistic for India on screen. |

## Computed values (deterministic maths)
| Claim | Value | Method |
|---|---|---|
| Notes in ₹1 crore (₹500) | 20,000 notes, 200 bundles | 1e7 / 500 |
| Stack height | 2.2 m | 20,000 × 0.11 mm |
| ₹100 notes / ₹10 notes height | 11 m / 110 m (1.52× Qutub Minar) | 1e5 and 1e6 notes × 0.11 mm |
| Counting 1 note/second | 5 h 33 min | 20,000 s |
| Saving ₹20,000/month, no growth | 500 months = 41 y 8 m | 1e7 / 20,000 |
| Investing ₹20,000/month at an *assumed* 12% p.a. (1%/month, start-of-month) | 179.2 months ≈ 14.9 years | Annuity-due future value |
| Lead after year 1 | ₹16,187 | FV(12) − 2,40,000 |
| Growth in year 10 / year 14 | ₹5.10 lakh / ₹9.70 lakh | FV(12y) − FV(12y−12) − 2,40,000 |
| Principal vs growth at ₹1 crore | ₹35.8 lakh / ₹64.2 lakh | 179.2 × 20,000 |
| Other assumed rates | 10% → 16.4 y; 8% → 18.3 y | Same formula |
| Real value of ₹1 crore in 20 years | 4% → ₹45.6 lakh; 6% → ₹31.2 lakh | 1e7 / (1+i)^20 |
| 4% withdrawal | ₹4 lakh/yr ≈ ₹33,333/month | 0.04 × 1e7 |
| ₹33,333 after 20 years at 6% inflation | ≈ ₹10,393 | 33,333 / 1.06^20 |
| Step-up SIP (₹20,000 start) | +5%/yr → 13 y 5 m; +10%/yr → 12 y | Month-by-month simulation |
| ₹10,000/month to age 60 at 12% | start 25 → ₹6.50 Cr; 30 → ₹3.53 Cr; 35 → ₹1.90 Cr | Annuity-due FV |
| Monthly SIP needed for ₹1 crore | 10 y → ₹43,041; 15 y → ₹19,819; 20 y → ₹10,009 | Solve annuity-due FV |

## Wording corrections made during fact-check
- "Barely a third of the way up" → **"only about a third"** (actual 35.8%)
- "About sixteen and a half years" at 10% → **"a little under sixteen and a half"** (16.4)
- "110 microns, to be exact" → **"around 110 microns"** (RBI table lists two values)
- "Roughly the thickness of your thumb" (11 mm bundle) → **"a little over a centimetre"**

## Compliance
- Every return rate is labelled **"assumed, not guaranteed"** on screen and in narration. Real returns vary and can be lower.
- The disclaimer "education, not financial advice" appears in narration, on the end card and in the description.
- No products, funds or platforms are named or recommended.
- All visuals are stylised 3D models built to the dimensions above. No realistic depiction of real people or events, so no synthetic-content disclosure is needed for the visuals. The narration is the creator's own ElevenLabs voice clone, disclosed in the description.
