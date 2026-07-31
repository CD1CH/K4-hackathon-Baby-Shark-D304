"""
Download model weights for the VieNeu TTS API.

    python download_model.py
"""

import os
from pathlib import Path

APP_DIR = Path(__file__).parent / "app"
os.environ.setdefault("HF_HOME", str(APP_DIR / "tts" / ".hf_cache"))

def download():
    print("[1/1] Downloading VieNeu-TTS-v3-Turbo model...")
    try:
        from vieneu import Vieneu
        # Instantiating Vieneu will automatically download the ONNX weights 
        # and audio tokenizer from HF to HF_HOME if not exists.
        Vieneu()
        print("\nAll models ready.")
    except ImportError:
        print("Vieneu is not installed yet. Run pip install vieneu")

if __name__ == "__main__":
    download()
