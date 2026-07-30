import io
import os
import uuid
from collections import OrderedDict
import torch
import torchaudio
from pathlib import Path

HERE     = Path(__file__).resolve().parent
SPEAKERS = HERE / "speakers"

MODEL_ID = os.environ.get("TTS_MODEL_ID", "splendor1811/omnivoice-vietnamese")
if torch.cuda.is_available():
    DEVICE = "cuda"
elif torch.backends.mps.is_available():
    DEVICE = "mps"
else:
    DEVICE = "cpu"

USE_MLX = False
try:
    import mlx.core as mx
    USE_MLX = True
except ImportError:
    pass


# Cloned voice prompts are tokenized reference audio held on the GPU box for
# reuse. Unbounded, they only ever grow: this process runs for days, so every
# voice anyone ever created stays resident until a restart. An OrderedDict with
# a hard cap makes the oldest fall out instead — a visitor who cloned a voice
# hours ago and comes back gets a clear "voice not found" they can act on,
# which is better than the server running out of memory mid-demo.
MAX_CACHED_VOICES = int(os.getenv("TTS_MAX_CACHED_VOICES", "64"))


class TTSEngine:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._model = None
            cls._instance._voices = OrderedDict()
        return cls._instance

    def __init__(self):
        if self._model is None:
            self._load()

    def _load(self):
        # Prefer MLX model if available
        local_mlx = HERE / "checkpoints" / "splendor1811" / "omnivoice-vietnamese-mlx"
        if USE_MLX and (local_mlx / "model.safetensors").exists():
            from omnivoice.mlx import OmniVoiceMLX
            path = str(local_mlx)
            print(f"[tts] Loading OmniVoice MLX from {path}...")
            self._model = OmniVoiceMLX.from_pretrained(path)
            self._is_mlx = True
        else:
            from omnivoice import OmniVoice
            # Prefer local checkpoint if downloaded
            local = HERE / "checkpoints" / MODEL_ID
            path  = str(local) if (local / "model.safetensors").exists() else MODEL_ID
            print(f"[tts] Loading OmniVoice from {path}...")
            self._model = OmniVoice.from_pretrained(path, device_map=DEVICE, dtype=torch.float16)
            self._is_mlx = False
        print("[tts] Ready.")

    def _to_wav_bytes(self, audio) -> bytes:
        import numpy as np
        if isinstance(audio, torch.Tensor):
            audio = audio.detach().cpu().to(torch.float32).numpy()
            
        if np.isnan(audio).any() or np.isinf(audio).any():
            audio = np.nan_to_num(audio, nan=0.0, posinf=1.0, neginf=-1.0)
            
        if audio.ndim == 1:
            audio = np.expand_dims(audio, 0)
        elif audio.ndim > 2:
            audio = np.squeeze(audio)
            if audio.ndim == 1:
                audio = np.expand_dims(audio, 0)
        audio = audio - audio.mean()
        peak = np.abs(audio).max()
        if peak > 0:
            audio = audio / peak * 0.95
        import soundfile as sf
        buf = io.BytesIO()
        sf.write(buf, audio.T, self._model.sampling_rate, format='WAV', subtype='PCM_16')
        buf.seek(0)
        return buf.read()

    def create_voice(self, ref_audio_path: str, ref_text: str = None) -> tuple:
        """Tokenize reference audio once and store as a reusable voice prompt."""
        prompt = self._model.create_voice_clone_prompt(
            ref_audio_path, ref_text=ref_text or None
        )
        voice_id = str(uuid.uuid4())
        self._voices[voice_id] = prompt
        # Evict oldest-first once the cap is reached.
        while len(self._voices) > MAX_CACHED_VOICES:
            self._voices.popitem(last=False)
        return voice_id, prompt.ref_text

    def synthesize_with_voice(self, voice_id: str, text: str,
                               num_step: int = 32, speed: float = 1.0) -> bytes:
        prompt = self._voices.get(voice_id)
        if not prompt:
            raise ValueError(f"Voice '{voice_id}' not found.")
        # Touch on use, so an actively-used voice is not the one evicted.
        self._voices.move_to_end(voice_id)
        audios = self._model.generate(
            text=text, voice_clone_prompt=prompt, num_step=num_step, speed=speed
        )
        return self._to_wav_bytes(audios[0])

    def synthesize(self, text: str, ref_audio: str = None, ref_text: str = None,
                   instruct: str = None, num_step: int = 32, speed: float = 1.0) -> bytes:
        kwargs = {"text": text, "num_step": num_step, "speed": speed}
        if ref_audio:
            kwargs["ref_audio"] = ref_audio
            if ref_text:
                kwargs["ref_text"] = ref_text
        elif instruct:
            kwargs["instruct"] = instruct
        audios = self._model.generate(**kwargs)
        return self._to_wav_bytes(audios[0])
