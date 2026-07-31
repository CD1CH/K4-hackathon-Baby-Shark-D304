import sys
from app.tts.inference import TTSEngine
try:
    engine = TTSEngine()
    res = engine.synthesize(text="Xin chào", instruct="[vi] female, normal speed, clear pronunciation")
    print("Success, bytes:", len(res))
except Exception as e:
    import traceback
    traceback.print_exc()
