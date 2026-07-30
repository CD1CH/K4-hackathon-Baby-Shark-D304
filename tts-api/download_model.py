"""
Download model weights for the OmniVoice TTS API.

    python download_model.py
"""

import os
from pathlib import Path

APP_DIR = Path(__file__).parent / "app"

os.environ.setdefault("HF_HOME", str(APP_DIR / "tts" / ".hf_cache"))


def download():
    from huggingface_hub import snapshot_download

    # ── TTS: OmniVoice Vietnamese ────────────────────────────────────────────
    tts_dir = APP_DIR / "tts" / "checkpoints" / "splendor1811" / "omnivoice-vietnamese"
    audio_tok_dir = tts_dir / "audio_tokenizer"
    if (tts_dir / "model.safetensors").exists() and audio_tok_dir.is_dir():
        print("[1/1] OmniVoice TTS model already exists, skipping.")
    else:
        tts_dir.mkdir(parents=True, exist_ok=True)
        print("[1/1] Downloading OmniVoice Vietnamese TTS model...")
        snapshot_download(
            repo_id="splendor1811/omnivoice-vietnamese",
            local_dir=str(tts_dir),
            local_dir_use_symlinks=False,
        )
        print(f"      → {tts_dir}")
        if not (audio_tok_dir / "model.safetensors").exists():
            print("[1/1] Downloading HiggsAudio tokenizer (OmniVoice dependency)...")
            audio_tok_dir.mkdir(parents=True, exist_ok=True)
            snapshot_download(
                repo_id="eustlb/higgs-audio-v2-tokenizer",
                local_dir=str(audio_tok_dir),
                local_dir_use_symlinks=False,
            )
            print(f"      → {audio_tok_dir}")

    print("\nAll models ready.")


if __name__ == "__main__":
    download()
