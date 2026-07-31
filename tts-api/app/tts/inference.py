import io
import os
import uuid

# In Vieneu, we can just save voices as file paths to the reference audios.
# Or we can store the cached tokens if Vieneu supports it. For now, just paths.
MAX_CACHED_VOICES = int(os.getenv("TTS_MAX_CACHED_VOICES", "64"))

class TTSEngine:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._model = None
            cls._instance._voices = {}
            cls._is_mlx = False
        return cls._instance

    def __init__(self):
        if self._model is None:
            self._load()

    def _load(self):
        from vieneu import Vieneu
        print("[tts] Loading Vieneu-TTS-v3-Turbo...")
        self._model = Vieneu()
        print("[tts] Ready.")

    def _to_wav_bytes(self, audio) -> bytes:
        import soundfile as sf
        import numpy as np
        buf = io.BytesIO()
        try:
            self._model.save(audio, buf)
            buf.seek(0)
            return buf.read()
        except:
            if isinstance(audio, tuple): # (sr, np_array)
                sr, wav = audio
            else:
                sr, wav = 48000, audio
            sf.write(buf, wav, sr, format='WAV', subtype='PCM_16')
            buf.seek(0)
            return buf.read()

    def create_voice(self, ref_audio_path: str, ref_text: str = None) -> tuple:
        """Tokenize reference audio once and store as a reusable voice prompt."""
        import shutil
        import os
        voice_id = str(uuid.uuid4())
        perm_path = f"app/tts/voices/{voice_id}.wav"
        shutil.copy(ref_audio_path, perm_path)
        
        # Store the path to the ref audio
        self._voices[voice_id] = perm_path
        
        if len(self._voices) > MAX_CACHED_VOICES:
            # Remove an arbitrary element
            oldest_id, oldest_path = next(iter(self._voices.items()))
            self._voices.pop(oldest_id)
            if os.path.exists(oldest_path):
                os.remove(oldest_path)
            
        return voice_id, ref_text or "custom_voice"

    def synthesize_with_voice(self, voice_id: str, text: str,
                               num_step: int = 32, speed: float = 1.0) -> bytes:
        ref_audio = self._voices.get(voice_id)
        if not ref_audio:
            raise ValueError(f"Voice '{voice_id}' not found.")
        
        audio = self._model.infer(text, ref_audio=ref_audio)
        return self._to_wav_bytes(audio)

    def synthesize(self, text: str, ref_audio: str = None, ref_text: str = None,
                   instruct: str = None, num_step: int = 32, speed: float = 1.0) -> bytes:
        kwargs = {}
        if ref_audio:
            kwargs["ref_audio"] = ref_audio
        else:
            voice = instruct if instruct and instruct in ["Minh Đức", "Phạm Tuyên", "Thái Sơn", "Xuân Vĩnh", "Thanh Bình", "Trúc Ly", "Ngọc Linh", "Đoan Trang", "Mai Anh", "Thục Đoan", "Minh Triết", "Thùy Dung", "Quang Sơn", "Ngọc Trân"] else "Ngọc Linh"
            kwargs["voice"] = voice
            
        audio = self._model.infer(text, **kwargs)
        return self._to_wav_bytes(audio)
