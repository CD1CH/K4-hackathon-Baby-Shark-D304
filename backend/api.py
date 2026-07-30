import os
import sys
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional, Dict
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
import pypdf
import base64
import httpx

# Set up paths
BACKEND_DIR = Path(__file__).parent.resolve()
sys.path.append(str(BACKEND_DIR))

from env_loader import load_lab_env
from providers import make_provider

app = FastAPI(title="Student AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]
    pdf_name: Optional[str] = None
    slide_text: Optional[str] = None
    current_page: Optional[int] = None

class VoiceCloneRequest(BaseModel):
    audio: str
    ref_text: str

class TtsRequest(BaseModel):
    text: str
    voice_id: Optional[str] = None
    voice: Optional[str] = 'female'
    lang: Optional[str] = 'vi'

TTS_BASE_URL = "http://localhost:8002"

def extract_text_from_pdf(pdf_path: Path) -> str:
    """Đọc và trích xuất nội dung từ file PDF"""
    reader = pypdf.PdfReader(pdf_path)
    text = ""
    for i, page in enumerate(reader.pages):
        extracted = page.extract_text()
        if extracted:
            text += f"\n--- TRANG {i+1} ---\n{extracted}\n"
    return text

@app.post("/api/chat")
async def chat(request: ChatRequest):
    load_lab_env(BACKEND_DIR)
    provider_name = os.getenv("STUDENT_AI_PROVIDER", "openrouter")
    
    try:
        provider = make_provider(provider_name)
        selected_model = getattr(provider, "default_model", None)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khởi tạo provider AI: {e}")

    text_context = ""
    if request.pdf_name:
        slides_dir = BACKEND_DIR / "slides"
        pdf_path = slides_dir / request.pdf_name
        if pdf_path.exists():
            text_context = extract_text_from_pdf(pdf_path)
        else:
            # Fallback to provided text if PDF not found
            text_context = request.slide_text or ""
    else:
        text_context = request.slide_text or ""

    page_info = f"\nHọc sinh đang xem TRANG SỐ {request.current_page} của bài giảng." if request.current_page else ""

    system_prompt = f"""Bạn là một trợ giảng AI xuất sắc, nhiệm vụ của bạn là hỗ trợ học sinh học tập dựa trên nội dung slide bài giảng được cung cấp.

Quy tắc hoạt động:
1. NGUỒN KIẾN THỨC & MỞ RỘNG: Trả lời các câu hỏi dựa trên thông tin trong NỘI DUNG SLIDE (bao gồm việc đọc các trang khác để bổ sung thông tin cho trang hiện tại nếu cần). ĐẶC BIỆT: Trong trường hợp slide viết vắn tắt, thiếu nội dung hoặc chỉ có tiêu đề/hình ảnh, bạn CÓ QUYỀN sử dụng kiến thức chuyên môn bên ngoài của bản thân để giảng giải thật chi tiết, dễ hiểu cho học sinh. Tuy nhiên, khi dùng kiến thức bên ngoài, BẠN PHẢI GHI RÕ NGUỒN (ví dụ: "Theo kiến thức chuyên ngành khoa học máy tính...", "Nguồn bổ sung: ...").
2. NGỮ CẢNH: {page_info} Bạn hãy ưu tiên liên hệ câu trả lời với nội dung của trang học sinh đang xem nếu câu hỏi có ý hỏi về "trang này", "ở đây".
3. TÓM TẮT TOÀN BỘ: Nếu học sinh yêu cầu tóm tắt toàn bộ file/bài giảng, bạn PHẢI thực hiện tóm tắt toàn bộ dựa trên NỘI DUNG SLIDE đã cung cấp. TUYỆT ĐỐI KHÔNG ĐƯỢC từ chối hoặc yêu cầu học sinh chọn từng trang để tóm tắt.
4. NGÔN NGỮ TRẢ LỜI: ĐÂY LÀ QUY TẮC TỐI QUAN TRỌNG. BẠN BẮT BUỘC PHẢI TRẢ LỜI BẰNG ĐÚNG NGÔN NGỮ MÀ HỌC SINH ĐÃ DÙNG ĐỂ HỎI. 
- Nếu học sinh hỏi bằng Tiếng Anh (ví dụ: "What is this?"), toàn bộ câu trả lời phải bằng Tiếng Anh. 
- Nếu học sinh hỏi bằng Tiếng Trung (ví dụ: "这是什么？"), toàn bộ câu trả lời phải bằng Tiếng Trung. 
- Nếu học sinh hỏi bằng Tiếng Việt, trả lời bằng Tiếng Việt.
- Dù nội dung slide là tiếng Việt, nhưng nếu câu hỏi là tiếng Anh, bạn phải dịch nội dung slide sang tiếng Anh để trả lời. Việc trả lời sai ngôn ngữ là vi phạm nghiêm trọng.
5. VAI TRÒ TRỢ GIẢNG: Khuyến khích sử dụng kỹ năng sư phạm: Dịch thuật, Tóm tắt, Giải thích khái niệm phức tạp một cách dễ hiểu, mở rộng kiến thức nếu cần thiết để học sinh hiểu bài.
6. TỪ CHỐI BỊA ĐẶT THÔNG TIN SAI LỆCH: Bạn được phép bổ sung kiến thức bên ngoài có thật và chính xác để giải thích bài giảng, nhưng KHÔNG ĐƯỢC bịa đặt các định nghĩa sai sự thật hoặc không liên quan đến chủ đề học.

NỘI DUNG SLIDE:
{text_context}
"""
    
    full_messages = [{"role": "system", "content": system_prompt}]
    
    # Add history
    for msg in request.messages:
        role = msg.get("role")
        # Ensure role is standard (user or assistant)
        if role == "tutor":
            role = "assistant"
        full_messages.append({"role": role, "content": msg.get("content", "")})
        
    try:
        from fastapi.responses import StreamingResponse
        if hasattr(provider, "stream"):
            def generate():
                for chunk in provider.stream(messages=full_messages, model=selected_model):
                    yield chunk
            return StreamingResponse(generate(), media_type="text/plain")
        else:
            response = provider.complete(messages=full_messages, model=selected_model)
            return {"text": response.text or ""}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/voice/clone")
async def voice_clone(req: VoiceCloneRequest):
    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            resp = await client.post(
                f"{TTS_BASE_URL}/tts/voice",
                files={"ref_audio": ("ref.wav", base64.b64decode(req.audio), "audio/wav")},
                data={"ref_text": req.ref_text},
            )
            resp.raise_for_status()
            return {"voice_id": resp.json().get("voice_id")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi tạo voice clone: {e}")

@app.post("/api/tts")
async def tts(req: TtsRequest):
    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            if req.voice_id:
                payload = {"voice_id": req.voice_id, "text": req.text, "num_step": 32, "speed": 1.0}
                path = "/tts/synthesize"
            else:
                instruct = req.voice
                payload = {"text": req.text, "num_step": 32, "speed": 1.0, "instruct": instruct}
                path = "/tts/design"
            
            resp = await client.post(f"{TTS_BASE_URL}{path}", json=payload)
            resp.raise_for_status()
            return Response(content=resp.content, media_type="audio/wav")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi TTS: {type(e).__name__}: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
