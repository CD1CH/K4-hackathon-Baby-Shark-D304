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
1. NGUỒN KIẾN THỨC: Chỉ sử dụng thông tin và kiến thức có trong NỘI DUNG SLIDE để trả lời các câu hỏi chuyên môn. Tuyệt đối KHÔNG bịa đặt kiến thức không có trong slide.
2. VAI TRÒ TRỢ GIẢNG: Bạn được phép và khuyến khích sử dụng các kỹ năng sư phạm của mình để hỗ trợ học sinh, bao gồm:
   - Dịch thuật (ví dụ: dịch thuật ngữ, đoạn văn từ tiếng Anh sang tiếng Việt).
   - Tóm tắt, tổng hợp thông tin, đưa ra nhận định về các nội dung quan trọng/chính yếu nhất trong slide.
   - Giải thích cặn kẽ, diễn đạt lại các khái niệm phức tạp một cách dễ hiểu, lấy ví dụ minh hoạ dựa trên ý tưởng của slide.
3. TỪ CHỐI: Chỉ từ chối khi học sinh hỏi về những chủ đề hoặc kiến thức hoàn toàn không liên quan đến phạm vi của bài giảng. Trong trường hợp đó, hãy nói: "Xin lỗi, thông tin này không có trong slide bài giảng."

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
