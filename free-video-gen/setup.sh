#!/usr/bin/env bash
# One-time setup on a machine with an NVIDIA GPU (Linux / WSL / Kaggle / Colab).
set -e
cd "$(dirname "$0")"
python3 -m venv .venv
.venv/bin/pip install -U pip
.venv/bin/pip install -r requirements.txt
echo "Done. Try:  .venv/bin/python generate.py --model ltx \"A red fox running through snow, cinematic\""
