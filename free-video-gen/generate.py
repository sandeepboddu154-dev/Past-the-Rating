#!/usr/bin/env python3
"""Free, open-source text-to-video / image-to-video generator.

Runs open-weight models locally through Hugging Face `diffusers`, so there is no
per-video API cost. You need an NVIDIA GPU: your own PC, or a free cloud GPU
on Kaggle (30 h/week) or Google Colab (T4). See README.md.

Examples:
  python generate.py --model wan "A golden retriever surfing a wave at sunset, cinematic"
  python generate.py --model ltx "Drone shot over a misty pine forest at dawn" --frames 121
  python generate.py --model ltx --image hero.png "The character turns and smiles"
  python generate.py --model wan22 "Neon city street in the rain, tracking shot"
  python generate.py --model cogvideox "A paper boat drifting down a stream"
"""
import argparse
import os
import time

import torch
from diffusers.utils import export_to_video, load_image

NEG_WAN = (
    "bright tones, overexposed, static, blurred details, subtitles, style, works, "
    "paintings, images, static, overall gray, worst quality, low quality, JPEG "
    "compression residue, ugly, incomplete, extra fingers, poorly drawn hands, "
    "poorly drawn faces, deformed, disfigured, misshapen limbs, fused fingers, "
    "still picture, messy background, three legs, many people in the background, "
    "walking backwards"
)
NEG_GENERIC = "worst quality, inconsistent motion, blurry, jittery, distorted"

# name: (hf repo, default width, height, frames, fps, steps, guidance)
MODELS = {
    # Best quality/VRAM trade-off. ~8 GB VRAM with CPU offload. Apache-2.0.
    "wan": ("Wan-AI/Wan2.1-T2V-1.3B-Diffusers", 832, 480, 81, 16, 30, 5.0),
    # Higher quality 720p text+image-to-video. Needs ~24 GB VRAM (or offload + patience).
    "wan22": ("Wan-AI/Wan2.2-TI2V-5B-Diffusers", 1280, 704, 121, 24, 50, 5.0),
    # Fastest. Runs on a free T4. Supports image-to-video. Open weights (LTXV license).
    "ltx": ("Lightricks/LTX-Video", 704, 480, 121, 24, 50, 3.0),
    # Older but light; 6-second clips at 8 fps. Apache-2.0.
    "cogvideox": ("THUDM/CogVideoX-2b", 720, 480, 49, 8, 50, 6.0),
}


def pick_dtype():
    if torch.cuda.is_available() and torch.cuda.is_bf16_supported():
        return torch.bfloat16
    return torch.float16


def load_pipeline(name, image_mode, low_vram):
    import diffusers as d

    repo = MODELS[name][0]
    dtype = pick_dtype()
    if name in ("wan", "wan22"):
        vae = d.AutoencoderKLWan.from_pretrained(repo, subfolder="vae", torch_dtype=torch.float32)
        cls = d.WanImageToVideoPipeline if image_mode else d.WanPipeline
        if image_mode and name == "wan":
            raise SystemExit("Wan2.1 1.3B is text-only. Use --model wan22 or --model ltx for --image.")
        pipe = cls.from_pretrained(repo, vae=vae, torch_dtype=dtype)
    elif name == "ltx":
        cls = d.LTXImageToVideoPipeline if image_mode else d.LTXPipeline
        pipe = cls.from_pretrained(repo, torch_dtype=dtype)
    elif name == "cogvideox":
        if image_mode:
            raise SystemExit("CogVideoX-2b is text-only. Use --model ltx for --image.")
        pipe = d.CogVideoXPipeline.from_pretrained(repo, torch_dtype=torch.float16)
    else:
        raise SystemExit(f"unknown model {name}")

    if not torch.cuda.is_available():
        print("WARNING: no CUDA GPU found. CPU generation takes hours and may run out of RAM.")
        return pipe
    if low_vram:
        pipe.enable_model_cpu_offload()
        if hasattr(pipe, "vae") and hasattr(pipe.vae, "enable_tiling"):
            pipe.vae.enable_tiling()
    else:
        pipe.to("cuda")
    return pipe


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("prompt")
    ap.add_argument("--model", choices=MODELS, default="wan")
    ap.add_argument("--image", help="first-frame image (path or URL) for image-to-video")
    ap.add_argument("--negative", help="negative prompt")
    ap.add_argument("--width", type=int)
    ap.add_argument("--height", type=int)
    ap.add_argument("--frames", type=int, help="number of frames (Wan: 4k+1, LTX: 8k+1)")
    ap.add_argument("--steps", type=int)
    ap.add_argument("--guidance", type=float)
    ap.add_argument("--fps", type=int)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--out", default="outputs")
    ap.add_argument("--full-vram", action="store_true", help="keep whole model on GPU (faster, needs more VRAM)")
    a = ap.parse_args()

    _, w, h, frames, fps, steps, cfg = MODELS[a.model]
    w, h = a.width or w, a.height or h
    frames, steps = a.frames or frames, a.steps or steps
    cfg, fps = a.guidance if a.guidance is not None else cfg, a.fps or fps
    neg = a.negative or (NEG_WAN if a.model.startswith("wan") else NEG_GENERIC)

    pipe = load_pipeline(a.model, bool(a.image), low_vram=not a.full_vram)
    kwargs = dict(prompt=a.prompt, negative_prompt=neg, width=w, height=h, num_frames=frames,
                  num_inference_steps=steps, guidance_scale=cfg,
                  generator=torch.Generator("cpu").manual_seed(a.seed))
    if a.model == "ltx":
        kwargs["frame_rate"] = fps
    if a.image:
        kwargs["image"] = load_image(a.image)

    t = time.time()
    video = pipe(**kwargs).frames[0]
    os.makedirs(a.out, exist_ok=True)
    path = os.path.join(a.out, f"{a.model}_{int(time.time())}_s{a.seed}.mp4")
    export_to_video(video, path, fps=fps)
    print(f"Saved {path}  ({len(video)} frames, {time.time() - t:.0f}s)")


if __name__ == "__main__":
    main()
