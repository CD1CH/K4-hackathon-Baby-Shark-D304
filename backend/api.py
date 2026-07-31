import os
import sys
from pathlib import Path
# pyrefly: ignore [missing-import]
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
    full_document_text: Optional[str] = None
    current_page: Optional[int] = None

# In-memory document text cache
doc_cache: Dict[str, str] = {}
doc_text_cache: Dict[str, str] = doc_cache

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
    if pdf_path.name in doc_cache:
        return doc_cache[pdf_path.name]

    reader = pypdf.PdfReader(pdf_path)
    text = ""
    for i, page in enumerate(reader.pages):
        extracted = page.extract_text()
        if extracted:
            text += f"\n--- TRANG {i+1} ---\n{extracted}\n"
    
    doc_cache[pdf_path.name] = text
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
    input_text = request.full_document_text or request.slide_text or ""
    if request.pdf_name:
        slides_dir = BACKEND_DIR / "slides"
        pdf_path = slides_dir / request.pdf_name
        if pdf_path.exists():
            text_context = extract_text_from_pdf(pdf_path)
        else:
            doc_key = request.pdf_name
            if doc_key in doc_cache and not input_text:
                text_context = doc_cache[doc_key]
            else:
                text_context = input_text
                if text_context:
                    doc_cache[doc_key] = text_context
    else:
        text_context = input_text

    page_info = f"\nHọc sinh hiện tại đang xem và đặt câu hỏi tại TRANG SỐ {request.current_page} của bài giảng." if request.current_page else ""

    system_prompt = f"""Bạn là một trợ giảng AI xuất sắc, nhiệm vụ của bạn là hỗ trợ học sinh học tập dựa trên toàn bộ nội dung slide bài giảng được cung cấp.

Quy tắc hoạt động:
1. NGUỒN KIẾN THỨC & LIÊN KẾT TOÀN BỘ SLIDE: Bạn được cung cấp toàn bộ nội dung bài giảng (bao gồm tất cả các trang/slide từ đầu đến cuối).
   - Khi học sinh hỏi ở một trang bất kỳ (ví dụ Trang 6), bạn PHẢI chủ động đọc, đối chiếu và liên kết kiến thức từ các trang trước đó (ví dụ Trang 1, 2, 3, 4, 5...) cũng như toàn bộ bài giảng để đưa ra câu trả lời đầy đủ, hệ thống và chính xác nhất.
   - Tuyệt đối không giới hạn câu trả lời chỉ ở trang hiện tại; hãy kết nối mạch kiến thức với các trang liên quan khác trong bài giảng.
   - ĐẶC BIỆT: Trong trường hợp slide viết vắn tắt, thiếu nội dung hoặc chỉ có tiêu đề/hình ảnh, bạn CÓ QUYỀN sử dụng kiến thức chuyên môn bên ngoài của bản thân để giảng giải thật chi tiết, dễ hiểu cho học sinh. Tuy nhiên, khi dùng kiến thức bên ngoài, BẠN PHẢI GHI RÕ NGUỒN (ví dụ: "Theo kiến thức chuyên ngành khoa học máy tính...", "Nguồn bổ sung: ...").
2. NGỮ CẢNH: {page_info} Hãy ưu tiên dùng kiến thức toàn bài giảng để phục vụ việc giải thích nội dung trang học sinh đang xem.
3. TÓM TẮT TOÀN BỘ: Nếu học sinh yêu cầu tóm tắt toàn bộ file/bài giảng, bạn PHẢI thực hiện tóm tắt toàn bộ dựa trên NỘI DUNG SLIDE đã cung cấp. TUYỆT ĐỐI KHÔNG ĐƯỢC từ chối hoặc yêu cầu học sinh chọn từng trang để tóm tắt.
4. NGÔN NGỮ TRẢ LỜI: ĐÂY LÀ QUY TẮC TỐI QUAN TRỌNG. BẠN BẮT BUỘC PHẢI TRẢ LỜI BẰNG ĐÚNG NGÔN NGỮ MÀ HỌC SINH ĐÃ DÙNG ĐỂ HỎI. 
- Nếu học sinh hỏi bằng Tiếng Anh (ví dụ: "What is this?"), toàn bộ câu trả lời phải bằng Tiếng Anh. 
- Nếu học sinh hỏi bằng Tiếng Trung (ví dụ: "这是什么？"), toàn bộ câu trả lời phải bằng Tiếng Trung. 
- Nếu học sinh hỏi bằng Tiếng Việt, trả lời bằng Tiếng Việt.
- Dù nội dung slide là tiếng Việt, nhưng nếu câu hỏi là tiếng Anh, bạn phải dịch nội dung slide sang tiếng Anh để trả lời. Việc trả lời sai ngôn ngữ là vi phạm nghiêm trọng.
5. VAI TRÒ TRỢ GIẢNG: Khuyến khích sử dụng kỹ năng sư phạm: Dịch thuật, Tóm tắt, Giải thích khái niệm phức tạp một cách dễ hiểu, mở rộng kiến thức nếu cần thiết để học sinh hiểu bài.
6. TỪ CHỐI BỊA ĐẶT THÔNG TIN SAI LỆCH: Bạn được phép bổ sung kiến thức bên ngoài có thật và chính xác để giải thích bài giảng, nhưng KHÔNG ĐƯỢC bịa đặt các định nghĩa sai sự thật hoặc không liên quan đến chủ đề học.
7. PHÂN BIỆT RÕ TRANG TRỐNG VỚI KHÔNG CÓ TRANG: 
- Nếu trang/slide mà học sinh đang xem CÓ TỒN TẠI trong bài giảng (ví dụ Trang 9) nhưng chưa có nội dung chi tiết hoặc nội dung bị trống, BẠN PHẢI NÓI RÕ LÀ: "Trang [X] có tồn tại trong bài giảng nhưng hiện tại chưa có/chưa nạp nội dung chi tiết". 
- TUYỆT ĐỐI KHÔNG ĐƯỢC NÓI LÀ "không có trang/slide [X]" hay "bài giảng không có trang [X]", vì trang đó thực sự CÓ trong bài giảng nhưng chưa chứa nội dung chi tiết.
8. XỬ LÝ TỪ VIẾT TẮT:
- Khi học sinh sử dụng từ viết tắt: Bạn hãy dùng luôn từ viết tắt đó trong câu trả lời và khi giải thích hãy mở ngoặc giải thích rõ ý nghĩa của từ viết tắt đó (ví dụ: "AI (Trí tuệ nhân tạo)", "LLM (Mô hình ngôn ngữ lớn)").
- Trường hợp học sinh dùng từ viết tắt quá mơ hồ, lạ hoặc khó hiểu mà không thể suy luận chính xác từ ngữ cảnh bài giảng, TUYỆT ĐỐI KHÔNG ĐƯỢC ĐOÁN BỪA; hãy lịch sự hỏi lại học sinh ý nghĩa của cụm từ viết tắt đó để giải thích chính xác.
9. TẠO BÀI KIỂM TRA (QUIZ): Nếu học sinh yêu cầu tạo bài kiểm tra, bài tập, hoặc quiz để ôn tập, bạn BẮT BUỘC phải tạo ra một trang HTML hoàn chỉnh.
- Bọc toàn bộ mã HTML trong cặp thẻ ```html và ```. HTML phải chứa thẻ <meta charset="UTF-8"> để không lỗi font. Code HTML phải chứa CSS và JavaScript nội bộ để hiển thị đẹp mắt.
- YÊU CẦU NỘI DUNG: Luôn tạo ít nhất 10 câu hỏi trắc nghiệm (trừ khi học sinh chỉ định số lượng cụ thể khác). Các câu hỏi phải bao quát nội dung bài giảng.
- YÊU CẦU CHẤM ĐIỂM & GIẢI THÍCH CHUYÊN SÂU: Đây là yêu cầu BẮT BUỘC. Sau khi người dùng bấm "Nộp bài", code JavaScript phải tính điểm và tự động hiển thị trên màn hình:
  1. Số điểm (số câu đúng/tổng số câu) và Đánh giá tổng quan mức độ hiểu bài.
  2. GIẢI THÍCH CHI TIẾT TỪNG CÂU HỎI: Với MỖI câu hỏi, bất kể học sinh làm đúng hay sai, bạn phải in ra phần giải thích. Cụ thể:
     - Nếu học sinh chọn ĐÚNG: Khen ngợi và giải thích ngắn gọn tại sao đáp án đó đúng.
     - Nếu học sinh chọn SAI: BẮT BUỘC phải in ra đủ 3 ý:
       + Câu trả lời đúng là gì và TẠI SAO đáp án đó lại đúng.
       + TẠI SAO đáp án học sinh chọn lại sai (chỉ ra lỗi sai hoặc sự hiểu lầm).
       + GIẢNG LẠI LÝ THUYẾT: Tóm tắt ngắn gọn phần lý thuyết liên quan đến câu hỏi đó để học sinh ôn lại kiến thức.
LƯU Ý QUAN TRỌNG: Toàn bộ nội dung giải thích chi tiết và lý thuyết này phải được bạn code sẵn (hardcode) vào mảng dữ liệu JavaScript trong file HTML, để khi người dùng nộp bài là JavaScript sẽ lấy ra hiển thị được ngay. KHÔNG được lười biếng hay làm sơ sài phần này.

10. TẠO FLASHCARD ÔN TẬP: Nếu học sinh yêu cầu tạo flashcard để ôn tập, bạn BẮT BUỘC phải tạo ra một trang HTML hoàn chỉnh.
- Bọc toàn bộ mã HTML trong cặp thẻ ```html và ```. HTML phải chứa thẻ <meta charset="UTF-8">. Code HTML phải chứa CSS và JavaScript nội bộ.
- YÊU CẦU NỘI DUNG: Luôn tạo ít nhất 10 flashcard bao quát bài giảng. Toàn bộ 10 flashcard này phải được lưu trữ trong một MẢNG JAVASCRIPT (JavaScript array of objects).
- YÊU CẦU GIAO DIỆN & TƯƠNG TÁC: 
  + Chỉ hiển thị MỘT flashcard duy nhất trên màn hình tại một thời điểm.
  + Thẻ có hai mặt (trước: câu hỏi/thuật ngữ, sau: giải thích chi tiết). BẮT BUỘC dùng CSS/JS để tạo hiệu ứng lật thẻ (flip) khi click.
  + BẮT BUỘC phải có 2 nút "Quay lại" (Previous) và "Tiếp theo" (Next). Khi click vào các nút này, JavaScript phải cập nhật màn hình để chuyển sang thẻ flashcard tương ứng trong mảng. Không được lười biếng, phải code đầy đủ tính năng chuyển thẻ!
<<<<<<< HEAD
  
9. TẠO SƠ ĐỒ TƯ DUY (MINDMAP): Nếu học sinh yêu cầu tạo sơ đồ tư duy (mindmap) để tổng hợp bài giảng, bạn BẮT BUỘC tạo ra một trang HTML hoàn chỉnh chứa sơ đồ đó.
- Bọc mã HTML trong cặp thẻ ```html và ```. HTML phải chứa thẻ <meta charset="UTF-8">.
- YÊU CẦU CÔNG NGHỆ: Sử dụng thư viện Mermaid.js nhúng qua CDN để vẽ sơ đồ. Tạo thẻ `<div class="mermaid">...code mermaid ở đây...</div>` và chèn script khởi tạo Mermaid.
- LƯU Ý LỖI MERMAID SYNTAX ERROR (CỰC KỲ QUAN TRỌNG): Lỗi này xảy ra khi có ký tự đặc biệt (ngoặc kép, ngoặc đơn, dấu phẩy, v.v.) trong tên Node mà không được bọc đúng cách. Bạn BẮT BUỘC phải bọc toàn bộ nội dung (Label) của một Node vào trong cặp dấu ngoặc kép `""` nếu nó có chứa khoảng trắng hoặc ký tự đặc biệt. Ví dụ ĐÚNG: `A["Nội dung có dấu (kể cả ngoặc)"]`. Ví dụ SAI: `A[Nội dung có dấu (kể cả ngoặc)]`. Tuyệt đối KHÔNG dùng thẻ HTML bên trong Mermaid code.
- YÊU CẦU NỘI DUNG: Sơ đồ tư duy phải bao quát toàn bộ nội dung chính của bài giảng. Trang HTML cần có CSS cơ bản để hiển thị sơ đồ chính giữa màn hình.
=======
>>>>>>> 1fdc09ab7f19a06ddff1fc161ea4005750af74a1
>>>>>>> b18ab4fdea43f0d7d3906b044c8972e954e4d317

NỘI DUNG SLIDE TOÀN BỘ BÀI GIẢNG:
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
                payload = {"voice_id": req.voice_id, "text": req.text, "num_step": 16, "speed": 1.0}
                path = "/tts/synthesize"
            else:
                instruct = req.voice
                payload = {"text": req.text, "num_step": 16, "speed": 1.0, "instruct": instruct}
                path = "/tts/design"
            
            resp = await client.post(f"{TTS_BASE_URL}{path}", json=payload)
            resp.raise_for_status()
            return Response(content=resp.content, media_type="audio/wav")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi TTS: {type(e).__name__}: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
