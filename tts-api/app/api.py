import os
import secrets

os.environ["TOKENIZERS_PARALLELISM"] = "false"

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.tts.router import router as tts_router

app = FastAPI(title="OmniVoice TTS API")

# Every request here holds the GPU for seconds on a single worker, so an
# unauthenticated caller can starve the service just by looping. Set TTS_API_KEY
# and the GuardGo backend sends it as X-API-Key; leave it unset and the service
# runs open, which is only defensible on a private network.
API_KEY = os.getenv("TTS_API_KEY", "").strip()


async def require_api_key(x_api_key: str = Header(default="")) -> None:
    if not API_KEY:
        return  # open mode: no key configured
    # compare_digest rather than ==, so a wrong key cannot be recovered one
    # character at a time by timing the response.
    if not secrets.compare_digest(x_api_key, API_KEY):
        raise HTTPException(status_code=401, detail="Invalid or missing X-API-Key.")


# No browser calls this service directly — the GuardGo backend does, server to
# server, where CORS does not apply. allow_origins=["*"] therefore bought
# nothing while letting any page on the internet drive this GPU from a visitor's
# browser. Default to none; TTS_CORS_ORIGINS opens it deliberately.
_origins = [o.strip() for o in os.getenv("TTS_CORS_ORIGINS", "").split(",") if o.strip()]
if _origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=_origins,
        allow_methods=["POST", "GET"],
        allow_headers=["Content-Type", "X-API-Key"],
    )

app.include_router(tts_router, tags=["TTS"], dependencies=[Depends(require_api_key)])


# Deliberately unauthenticated: a health check that needs a secret is no use to
# a container orchestrator, and it discloses nothing but liveness.
@app.get("/health")
async def health():
    return {"status": "ok", "auth": "required" if API_KEY else "open"}
