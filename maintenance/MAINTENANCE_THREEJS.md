# Maintenance: restore the pinned Three.js dependency for the MTS 3D engine

Date: 19 Nov 2026 · Change type: dependency pin only (new files). **No rendering logic, scene code, timeline, mix, subtitle or assembly file was modified.**

## Problem
- `MTS_Video_001/Project_Files/engine/engine.html:17` loads Three.js through an import map: `/Lab_MoneyToScale/node_modules/three/build/three.module.js`.
- `node_modules/` is gitignored (`.gitignore:12`), and no `package.json` existed for it anywhere in the repo.
- A fresh clone therefore could not render any MTS 3D scene, and the version used to produce *What ₹1 Crore Actually Looks Like* was not recorded.

## Investigation
| Evidence | Finding |
|---|---|
| Repo search (`package.json`, lockfiles, docs, commit messages) | No version recorded anywhere. `brand/lakhometer/src/package.json` has no `three` |
| Engine API usage | `outputColorSpace`, `SRGBColorSpace`, `ACESFilmicToneMapping`, `PCFSoftShadowMap`: modern API (r152+) |
| npm publish history vs. commit time | Three.js lab commit `2a584de` at 17 Nov 2026 14:33 UTC. The latest release then was **0.187.0** (published 30 Oct 2026), and it is still `latest` today. A bare `npm install three` at that time would have installed 0.187.0 |
| Frame comparison: probe frames (CH01 f30, S02 f120, S04 f100, S05 f150) vs the committed final | 0.187.0: 48–49 dB PSNR, SSIM 0.998 (1080-direct segments). Control 0.186.1: renders **byte-identical** to 0.187.0 for these frames, so frames alone cannot separate the two releases |
| Whole-segment re-render with the unmodified `MTS_Video_001/Project_Files/engine/render.js` (`ONLY=CH01,S02`, scale 1) vs the same frames of the committed final | CH01 (62 f): SSIM mean 0.99861 / min 0.99793, PSNR mean 51.7 / min 48.2 dB. S02 (279 f): SSIM 0.99864 / 0.99797, PSNR 52.8 / 48.0 dB. Frame counts exact. **Visually identical, not bit-exact.** The residual is consistent with toolchain drift (Chromium/SwiftShader/x264) |
| Side finding | CH01, S02 and S05 match the direct-1080p path; S04 matches the 4K → Lanczos 1080p path (47.4 vs 39.1 dB). This confirms `finish_1080.sh` mixed both paths |

**Decision:** pin `three` to exactly **0.187.0**, the release current when the film was made. 0.186.1 is also verified to be render-compatible for the tested frames.

## Change
- New `Lab_MoneyToScale/package.json`: `"three": "0.187.0"` (exact, no range).
- New `Lab_MoneyToScale/package-lock.json`, with registry integrity hash.
- This file.

## How to render MTS scenes from a clone
```bash
cd Lab_MoneyToScale && npm ci && cd ..
python3 -m http.server 8768 --bind 127.0.0.1 &          # MTS render.js loads http://127.0.0.1:8768/… (render.js:4)
ONLY=S02 node MTS_Video_001/Project_Files/engine/render.js full MTS_Video_001/Project_Files/timeline.json /tmp/out 1 1
```
(Playwright must be resolvable; in the cloud image, set `NODE_PATH=$(npm root -g)`.)

## Regression results after the pin (this tree, FFmpeg 6.1.1, Playwright 1.63.0)
| Gate | Result |
|---|---|
| G1 Hyatt `timeline.py` → `timeline.json` byte-identical | PASS |
| G2 MTS `timeline.py` byte-identical | PASS |
| G3 Hyatt `subs.py` → SRT byte-identical (210 cues) | PASS |
| G4 MTS SRT byte-identical (187 cues) | PASS |
| G5 Hyatt Shorts SH-A/B/C timelines byte-identical | PASS |
| G6 MTS `mix.py` → `final_mix.wav` md5 `2222870d4816…` | PASS |
| G7 Hyatt `mix.py` → `final_mix.wav` md5 `951c94bd23bf…` | PASS |
| G8 Hyatt engine render (`ONLY=CH01`, 1920) md5 `d3a4f1fa8a02…` | PASS |
| MTS engine render via `npm ci` dependency, CH01 vs final | 62/62 frames, SSIM ≥ 0.9979, no page errors |

`git status` after all runs listed only the new files: no tracked file was changed.
