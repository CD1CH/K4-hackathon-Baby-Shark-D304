import os
import sys
from pathlib import Path
import pypdf

# Set up paths
BACKEND_DIR = Path(__file__).parent.resolve()

from env_loader import load_lab_env
from providers import make_provider

def extract_text_from_pdf(pdf_path: Path) -> str:
    """Đọc và trích xuất nội dung từ file PDF"""
    reader = pypdf.PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted + "\n"
    return text

def main():
    # Load environment variables (API keys)
    load_lab_env(BACKEND_DIR)
    
    # Choose provider (mặc định dùng openrouter theo yêu cầu)
    provider_name = os.getenv("STUDENT_AI_PROVIDER", "openrouter")
    
    try:
        provider = make_provider(provider_name)
        selected_model = getattr(provider, "default_model", None)
    except Exception as e:
        print(f"Lỗi khởi tạo provider AI: {e}")
        return

    slides_dir = BACKEND_DIR / "slides"
    if not slides_dir.exists():
        print(f"Lỗi: Thư mục {slides_dir} không tồn tại.")
        return
        
    pdfs = list(slides_dir.glob("*.pdf"))
    if not pdfs:
        print("Không tìm thấy file PDF nào trong thư mục slides.")
        return
        
    print("Các file slide bài giảng có sẵn:")
    for i, pdf in enumerate(pdfs):
        print(f"{i + 1}. {pdf.name}")
        
    try:
        choice_str = input("\nChọn số thứ tự của slide bạn muốn AI đọc: ")
        choice = int(choice_str) - 1
        if choice < 0 or choice >= len(pdfs):
            print("Lựa chọn không hợp lệ.")
            return
    except ValueError:
        print("Lựa chọn không hợp lệ.")
        return
        
    selected_pdf = pdfs[choice]
    print(f"\nĐang trích xuất nội dung file: {selected_pdf.name} ...")
    
    try:
        slide_text = extract_text_from_pdf(selected_pdf)
    except Exception as e:
        print(f"Lỗi khi đọc file PDF: {e}")
        return
        
    if not slide_text.strip():
        print("Cảnh báo: Không trích xuất được văn bản nào từ file PDF này.")
        
    print("\nĐã tải slide thành công! Bạn có thể bắt đầu đặt câu hỏi.")
    print("Gõ 'exit' hoặc 'quit' để thoát.\n")
    
    system_prompt = f"""Bạn là một trợ giảng AI xuất sắc, nhiệm vụ của bạn là hỗ trợ học sinh học tập dựa trên nội dung slide bài giảng được cung cấp.

Quy tắc hoạt động:
1. NGUỒN KIẾN THỨC: Trả lời các câu hỏi dựa trên thông tin trong NỘI DUNG SLIDE. Bạn được phép phân tích, suy luận, đánh giá và tổng hợp nội dung để trả lời các câu hỏi mang tính khái quát (ví dụ: "trong bài có toán không?", "chủ đề chính là gì?"). Tuyệt đối KHÔNG bịa đặt các dữ kiện/kiến thức chuyên môn nằm ngoài slide.
2. NGÔN NGỮ TRẢ LỜI: BẮT BUỘC phải trả lời bằng ĐÚNG NGÔN NGỮ mà học sinh sử dụng để đặt câu hỏi (ví dụ: học sinh hỏi tiếng Việt -> trả lời tiếng Việt).
3. VAI TRÒ TRỢ GIẢNG: Khuyến khích sử dụng kỹ năng sư phạm:
   - Dịch thuật (dịch thuật ngữ, đoạn văn).
   - Tóm tắt, tổng hợp thông tin, đưa ra nhận định về các nội dung quan trọng.
   - Giải thích, phân tích các khái niệm phức tạp một cách dễ hiểu.
4. TỪ CHỐI BỊA ĐẶT: CHỈ TỪ CHỐI trả lời khi học sinh bắt bạn phải cung cấp một định nghĩa, dữ kiện chuyên sâu hoàn toàn không có trong slide (ví dụ bắt giải toán khi slide không dạy toán). Tuy nhiên, nếu học sinh chỉ hỏi xem một chủ đề (như toán học, lịch sử...) CÓ XUẤT HIỆN trong slide hay không, bạn hãy phân tích và trả lời Có/Không kèm giải thích dựa trên slide, CHỨ KHÔNG ĐƯỢC TỪ CHỐI. Nếu bắt buộc phải từ chối, hãy nói (bằng ngôn ngữ của học sinh) rằng thông tin này không có trong slide.

NỘI DUNG SLIDE:
{slide_text}
"""
    
    messages = []
    
    while True:
        try:
            user_input = input("Học sinh: ")
            if user_input.strip().lower() in ['exit', 'quit']:
                break
            if not user_input.strip():
                continue
                
            messages.append({"role": "user", "content": user_input})
            
            full_messages = [{"role": "system", "content": system_prompt}] + messages
            
            response = provider.complete(messages=full_messages, model=selected_model)
            ai_text = response.text or ""
            
            print(f"AI: {ai_text}\n")
            
            messages.append({"role": "assistant", "content": ai_text})
            
        except KeyboardInterrupt:
            print("\nThoát chương trình.")
            break
        except Exception as e:
            print(f"\nLỗi khi gọi AI: {e}")

if __name__ == "__main__":
    main()
