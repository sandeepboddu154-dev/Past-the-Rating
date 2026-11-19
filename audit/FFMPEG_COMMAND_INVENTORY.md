# FFmpeg Command Inventory

Binary: `/usr/bin/ffmpeg` 6.1.1-3ubuntu5 (this container; versions in the original sessions are **NOT VERIFIED**, likely identical image). All paths on branch `claude/past-the-rating-monetization-n5o38k`.

## A. Video

| # | Operation | Command / filter (verbatim from source) | Location |
|---|---|---|---|
| V1 | **Frame encode** (screenshots → H.264) | `ffmpeg -y -loglevel error -f image2pipe -framerate 24 -c:v mjpeg -i - -c:v libx264 -preset medium -crf 17 -tune animation -pix_fmt yuv420p -r 24 -g 48 -bf 2 -x264-params threads=2 <id>.tmp.mp4` | `Video_001/Project_Files/engine/render.js:59-61` |
| V1b | Same, MTS (no `-tune animation`, no `-bf`) | `… -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p -r 24 -g 48 -x264-params threads=2 …` | `MTS_Video_001/Project_Files/engine/render.js:18` |
| V2 | **Downscale 4K → 1080p** (re-encode) | `ffmpeg -v error -y -i <4K seg> -vf scale=1920:1080:flags=lanczos -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p -r 24 <seg1080>` | `MTS_Video_001/Project_Files/finish_1080.sh:11` |
| V3 | **Concat + mux** | `ffmpeg -y -v error -f concat -safe 0 -i _concat.txt -i final_mix.wav -i subs.srt -map 0:v -map 1:a -map 2:s -c:v copy -c:a aac -b:a 320k -ar 48000 -c:s mov_text -metadata:s:s:0 language=eng -t <dur> -movflags +faststart -metadata title=… -metadata artist="Past The Rating" out.mp4` | `Video_001/Project_Files/assemble.py:20-24`; `finish_1080.sh:16` |
| — | Input loading of external clips/images | **None** | — |
| — | Crop / pad / letterbox | **None** (framing is done in the engine) | — |
| — | zoompan / Ken Burns | **None** (done with SVG `cam()` / Three.js camera) | `engine.html:37` |
| — | xfade / transitions | **None** (engine opacity dip) | `engine.html` renderFrame |
| — | Frame-rate conversion | Only `-r 24` on an already-24 fps source | V1, V2 |
| — | Subtitle burn-in | **None in FFmpeg.** Shorts captions are drawn by `engine_v.html:483-487`. | — |

Rendering itself is not FFmpeg: Chromium screenshots each frame as JPEG at quality 93 (`render.js:26`), then V1 decodes the MJPEG and encodes it to H.264.

## B. Audio

| # | Operation | Filter graph | Location |
|---|---|---|---|
| A1 | **Per-item bus** (VO, music or SFX stems) | `[i:a]aformat=sample_rates=48000:channel_layouts=stereo[,<extra>],volume=<g>dB,adelay=<ms>:all=1[ai]` … `amix=inputs=N:normalize=0:dropout_transition=0,apad,atrim=0:<DUR>[out]` → `pcm_s24le` | `mix.py:62-73` |
| A2 | VO polish (extra on VO items) | `highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2` | `mix.py:77` |
| A3 | Music cue shaping | `[atempo=…],afade=t=in:d=<fi>,afade=t=out:st=<…>:d=<fo>,atrim=0:<len>` | `mix.py:81-84` |
| A4 | **Sidechain duck + sum** | `[0:a]asplit=2[v1][vkey];[1:a]volume=-9dB[m];[m][vkey]sidechaincompress=threshold=0.02:ratio=6:attack=25:release=450:makeup=1[md];[v1][md][2:a]amix=inputs=3:normalize=0[o]` | `mix.py:89-91` |
| A5 | **Loudness pass 1** | `-af loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json -f null -` | `mix.py:93` |
| A6 | **Loudness pass 2** | `loudnorm=I=-14:TP=-1.0:LRA=11:measured_I=…:measured_TP=…:measured_LRA=…:measured_thresh=…:offset=…:linear=true,aresample=48000` | `mix.py:96-98` |
| A7 | Shorts single-graph mix | Same as A1–A4 in one graph, music `-ss <offset>` with `afade` in/out, `volume=-8dB`, ratio 5 / release 350; loudnorm LRA=9 | `shorts_mix.py:31-48` |
| A8 | Duration probe | `ffprobe -v error -show_entries format=duration -of csv=p=0 <mp3>` | `tts.py:47` |

## C. QC (analysis only)

| # | Filter | Location |
|---|---|---|
| Q1 | `ffprobe -show_streams -show_format -of json` | `qc.py:9` |
| Q2 | `scale=480:-2,blackdetect=d=0.4:pix_th=0.025:pic_th=0.995,freezedetect=n=0.0005:d=2.5` (run **twice**: once with `-v error` for decode errors, once `-hide_banner` for detections) | `qc.py:18-19` |
| Q3 | `silencedetect=n=-45dB:d=1.5,ebur128=peak=true` | `qc.py:24` |
| Q4 | Contact sheet: `fps=1/<every>,scale=384:-2,tile=6x<rows>` | `qc.py:31` |
| Q5 | Preview strips: ImageMagick `convert … +append -resize 50%` | `render.js:40` |

## D. Export settings (measured)

| | Video_001 long | MTS_Video_001 |
|---|---|---|
| Container | MP4, faststart | MP4, faststart |
| Video | H.264 High, 3840×2160, 24 fps, ~8.8 Mb/s | H.264, 1920×1080, 24 fps, **~641 kb/s** |
| Audio | AAC 48 kHz stereo ~291 kb/s | AAC 48 kHz stereo ~293 kb/s |
| Subs | mov_text (eng) | mov_text (eng) |
| Source | `qc_longform.json` | `MTS_Video_001/Production_Report/qc.json`; ffprobe of committed `Final_Exports/MTS001_1Crore_1080p.mp4` (444.33 s, 52.3 MB) |

## E. Performance bottlenecks
1. **Screenshot-per-frame rendering** is the dominant cost. Each frame does a DOM rebuild with `innerHTML` (`engine.html:494`), then a JPEG screenshot, then an MJPEG decode, then x264. The report states ≈65 min CPU for 8:23 at 4K (production_report.md §6). MTS adds WebGL through SwiftShader (software GPU, `MTS render.js:7`), which is slower again.
2. **Parallelism is limited**: 2–3 Playwright pages × `threads=2` x264 (`render.js:48,61`).
3. **QC decodes the full file 3 times** (Q2 twice, Q3 once).
4. Caching per segment (`render.js:55-57`, key = segment JSON + engine hash + width) works well and avoids re-renders.

## F. Quality-degradation points
1. **Generational loss**: JPEG q93 screenshot → x264 CRF 17. For MTS 4K segments, a second x264 pass after the Lanczos downscale (V2).
2. **CRF 17 with `-tune animation`** suits flat vector art; the MTS 3D path dropped `-tune animation`.
3. **MTS ~641 kb/s at 1080p** is very low for YouTube's 1080p ingest. Largely-static scenes compress well under CRF, but YouTube re-encodes, so any residual artifacts compound. Visual impact is **NOT VERIFIED** (no human review recorded).
4. **yuv420p chroma subsampling** on thin orange/steel linework softens coloured edges (inherent; flagged for awareness).
5. Concat with `-c:v copy` is lossless, which is good.
