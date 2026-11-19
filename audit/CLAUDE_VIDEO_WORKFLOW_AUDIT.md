# Claude Video Workflow — Forensic Audit (master report)

Audit date: 19 Nov 2026 · Scope: investigation only, no code changed.

## 0. Read this first: what was actually found

| Expectation in the brief | What the evidence shows |
|---|---|
| An "Archiva Studio" editing pipeline | **Does not exist.** No file, branch, commit or repo names "Archiva Studio". The closest name is **"Archivra"**, a *separate YouTube channel* (@archivraofficial) that vidIQ is signed in to (`docs/01-channel-audit.md:79`, `docs/07-workflow-and-qc.md:7`). No video for Archivra was ever produced in this repo. |
| A folder of Veo clips is edited | **Never implemented.** No code reads `.mp4`/`.mov` inputs from a Veo or any other generator. Veo is mentioned only in `free-video-gen/README.md:1` ("Veo replacement"), a standalone toolkit that is not connected to the editing pipeline. |
| AI images are animated | **Never implemented.** No image-ingestion code, no `zoompan`, no Ken Burns. The only raster inputs are 6 film-grain PNGs and a logo PNG. |
| ElevenLabs narration, music and SFX | **Implemented and working**, but the pipeline *generates* these through the API itself. It never loads narration files you provide. |
| Script/scene descriptions drive the edit | **Yes.** `script.json` names a hand-coded scene function for every narration block. |

So the "current workflow" audited here is the one that actually produced the two finished videos:

1. **Video_001**, *"The Drawing Change That Doubled the Load"* (Past The Rating), 8:23, 4K, plus 3 Shorts. 15–16 Nov 2026.
2. **MTS_Video_001**, *"What ₹1 Crore Actually Looks Like"* (Money To Scale, later rebranded Lakhometer), 7:24, 1080p. 17 Nov 2026.

## 1. Where the code lives

| Branch | Contents | Relevant? |
|---|---|---|
| `main` / `ccr-fa4ca15b-fdldjr` (this session) | `README.md` only (one line: "# Past-the-Rating") | No pipeline |
| `claude/past-the-rating-monetization-n5o38k` | **The whole production system**: `Video_001/`, `MTS_Video_001/`, `Lab_MoneyToScale/`, `brand/`, `docs/` | **Yes: primary evidence** |
| `ccr-fd21e1c4-nqq6r0` | `free-video-gen/` (Wan / LTX-Video / CogVideoX via diffusers) | Standalone, never integrated |

Unless another branch is named, every path in these reports refers to `claude/past-the-rating-monetization-n5o38k`. Only one GitHub repo is accessible (`sandeepboddu154-dev/Past-the-Rating`, from `list_repos`).

## 2. End-to-end workflow (as implemented)

The exact command order is documented in `Video_001/Production_Report/production_report.md` §8 and matches the scripts:

```
Script/script.json ──► tts.py ──► Voiceover/scenes/Sxx.mp3 + Sxx.json (word timings)
   (hand-written:          (ElevenLabs TTS /with-timestamps)
    scene id, visual
    function name, VO text)
gen_audio.py ──► Music/M*.mp3, Sound_Effects/*.mp3   (ElevenLabs Music + Sound Effects APIs)
timeline.py  ──► Project_Files/timeline.json         (segment start/dur = lead + VO duration + tail, snapped to 24 fps)
engine/render.js full ──► Visual_Assets/segments/<id>.mp4
   (Playwright → engine.html draws SVG/Three.js for time t → JPEG screenshot → piped to ffmpeg libx264)
mix.py       ──► mix/final_mix.wav   (VO bus + music bus ducked by sidechain + SFX bus → 2-pass loudnorm −14 LUFS)
subs.py      ──► Subtitles/*.srt     (from ElevenLabs word timings)
assemble.py  ──► Final_Exports/*.mp4 (concat demuxer, video stream-copied, AAC 320k, mov_text subs)
qc.py        ──► Production_Report/qc*.json + contact sheet
```

Entry points (there is no single orchestrator):

| Step | Command (from production_report.md §8) |
|---|---|
| Narration | `python3 Project_Files/tts.py Script/script.json Voiceover/scenes` |
| Music + SFX | `python3 Project_Files/gen_audio.py all` |
| Timeline | `python3 Project_Files/timeline.py` |
| Visual render | `node Project_Files/engine/render.js full Project_Files/timeline.json Visual_Assets/segments 3840 3` |
| Mix + assemble | `python3 Project_Files/mix.py && python3 Project_Files/assemble.py long` |
| QC | `python3 Project_Files/qc.py <mp4> 3840 2160 <sheet.jpg>` |
| Shorts | `shorts_timeline.py` → `V=1 render.js full … 1080 1` → `shorts_mix.py` → `assemble.py short SH-A` |
| MTS 1080p finish | `MTS_Video_001/Project_Files/finish_1080.sh` (render missing segments, downscale 4K ones, concat, QC) |

## 3. Tools actually used (evidence: production_report.md §5, source)

- **ElevenLabs**: TTS `eleven_v4` with the owner's cloned voice (`script.json → voice`), Music API, Sound Effects API, Speech-to-Text (QC; see note in the QC report). Key injected by the network proxy (`tts.py:4`, header `"xi-api-key": "proxy-injected"`).
- **Chromium + Playwright 1.63.0**: renders every frame.
- **Three.js**: MTS engine only (`MTS_Video_001/Project_Files/engine/engine.html:17`).
- **FFmpeg 6.1.1** (Ubuntu build): encode, concat, mix, loudness, QC.
- **ImageMagick 6.9.12**: preview contact sheets (`render.js:40`, `convert +append`).
- **Not used:** Veo, Higgsfield (0 credits), any text-to-video or image generator, stock or archival footage (production_report.md §5 "Not used, and why").

## 4. Execution trace (observed vs assumed)

| Event | Evidence | Status |
|---|---|---|
| 15 Nov 12:23 UTC: strategy docs, brand renders | commit `2a07ace` | Observed |
| 15 Nov 13:05: pipeline + George narration + score + SFX | commit `42abd55` | Observed |
| 15 Nov 13:13–13:22: Shorts cue-order and crop fixes | commits `3f49b16`, `10e19bd` | Observed |
| 15 Nov 14:12: 4K final, 3 Shorts, QC | commit `70a8b00`, `qc_longform.json` | Observed |
| 16 Nov: re-voiced with "Sandy Voice"; music placements made timeline-derived | commit `c1d519f` | Observed |
| 17 Nov: Three.js lab → MTS engine → mix → 1080p finish → QC → MP4 committed | commits `2a584de`…`fd87447` | Observed |
| 18 Nov: Lakhometer rebrand (logos only, no video) | commits `c330626`…`a0dad6a` | Observed |
| Exact FFmpeg invocations at runtime | Reconstructed from source; no runtime logs are committed (`*.log` is gitignored, `.gitignore:9,16`) | **Inferred from source, runtime NOT VERIFIED** |
| AI requests made | Reconstructed from `tts.py`, `gen_audio.py`; credit usage of 20,070 is stated in production_report.md §6 | Partly observed (report), request logs **NOT VERIFIED** |
| Full transcript of the producing session (`Past The Rating 7-day monetization strategy`) | Exists; only its last page (18 Nov, logo work) was read | **NOT VERIFIED** beyond that page |

## 5. Index of detailed reports

| File | Covers brief section |
|---|---|
| `IMAGE_PROCESSING_ANALYSIS.md` | §2 |
| `VIDEO_PROCESSING_ANALYSIS.md` | §3, §4 |
| `AUDIO_SYNCHRONIZATION_ANALYSIS.md` | §5 |
| `VISUAL_SELECTION_AND_EDITING_LOGIC.md` | §6 |
| `FFMPEG_COMMAND_INVENTORY.md` | §7 |
| `QUALITY_CONTROL_GAP_ANALYSIS.md` | §8 |
| `ARCHIVA_EDITING_ARCHITECTURE_CURRENT_STATE.md` | §9, §11, §13 (final assessment) |
