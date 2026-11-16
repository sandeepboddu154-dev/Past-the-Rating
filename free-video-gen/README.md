# Free video generation (Veo replacement)

These models are open-weight. You run them yourself, so there are **no API
calls and no per-video cost**. They need an NVIDIA GPU. If you don't have
one, use a free cloud GPU.

## Models

| `--model` | Model | License | Free T4 (16 GB)? | Output | Notes |
|---|---|---|---|---|---|
| `ltx` | [Lightricks LTX-Video](https://github.com/Lightricks/LTX-Video) | open weights (LTXV) | yes, fast | 704×480, 24 fps, ~5 s | Fastest; text- **and image-to-video** |
| `wan` | [Wan 2.1 T2V 1.3B](https://github.com/Wan-Video/Wan2.1) | Apache-2.0 | yes (~8 GB) | 832×480, 16 fps, 5 s | Best quality on a free GPU; text-to-video only |
| `wan22` | [Wan 2.2 TI2V 5B](https://github.com/Wan-Video/Wan2.2) | Apache-2.0 | slow/tight | 1280×704, 24 fps, 5 s | 720p, text+image; best on 24 GB+ |
| `cogvideox` | [CogVideoX-2B](https://github.com/THUDM/CogVideo) | Apache-2.0 | yes | 720×480, 8 fps, 6 s | Lightweight fallback |

Other open-source projects you can use:
- [ComfyUI](https://github.com/comfyanonymous/ComfyUI): node-based UI with Wan, LTX and Hunyuan workflows.
- [Wan2GP](https://github.com/deepbeepmeep/Wan2GP): Wan, Hunyuan and LTX tuned for low-VRAM GPUs (6 GB+).
- [HunyuanVideo](https://github.com/Tencent/HunyuanVideo): high quality, but needs 45 GB+ of VRAM.

## Option A: free cloud GPU (no GPU at home)

1. **Kaggle** (recommended, 30 free GPU hours a week): go to kaggle.com → New Notebook → File → Import Notebook → upload `free_video_gen.ipynb`. Under Settings, set Accelerator to *GPU T4 x2* and turn Internet *On*. You need to verify your phone number once.
2. **Google Colab**: open `free_video_gen.ipynb` in Colab and set Runtime → *T4 GPU*.
3. Edit `PROMPT` and run all cells. Download the MP4 from `outputs/`.

If the repo is private, the `wget` cell can't fetch the script. Upload `generate.py` manually instead.

## Option B: your own PC (NVIDIA GPU, 8 GB+ VRAM)

```bash
cd free-video-gen
./setup.sh                      # creates .venv and installs diffusers etc.
.venv/bin/python generate.py --model ltx "A red fox running through snow, cinematic"
.venv/bin/python generate.py --model wan "Aerial shot of a cricket stadium at night, floodlights"
.venv/bin/python generate.py --model ltx --image frame.png "The camera slowly zooms in"
```

On the first run, the model weights download from Hugging Face (LTX ~10 GB,
Wan 1.3B ~30 GB including the text encoder). They are cached after that.
Useful flags: `--frames`, `--steps`, `--seed`, `--width/--height`, and
`--full-vram` (faster if the model fits on your GPU).

## Tips
- Write prompts like a shot description: subject, action, camera move, lighting, style.
- To make longer videos, generate several 5-second clips and join them with `ffmpeg -f concat`.
- Hosted free tiers also exist, but they have daily quotas: Hugging Face Spaces (ZeroGPU), Kling and Hailuo free credits.
