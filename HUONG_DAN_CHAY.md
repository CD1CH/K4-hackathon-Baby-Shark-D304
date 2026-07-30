# Hướng dẫn Chạy và Dừng Phần mềm

Dự án hiện tại bao gồm 3 phần (services) chạy song song:
1. **Frontend (Vite + React)**: Giao diện người dùng
2. **Backend API (FastAPI)**: Xử lý logic chat, đọc file PDF
3. **TTS API (FastAPI + OmniVoice)**: Xử lý việc tạo giọng nói (Voice Clone) và Text-to-Speech

## 1. Cách Chạy (Start)

Bạn có thể chạy toàn bộ phần mềm thông qua các Terminal độc lập, hoặc chạy chung thông qua script (nếu thiết lập sẵn). 

### Bước 1: Chạy Backend (Port 8000)
Mở Terminal 1 và chạy lệnh sau từ thư mục gốc:
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt  # (Nếu cần)
python api.py
```
*Backend sẽ khởi động ở địa chỉ: `http://localhost:8000`*

### Bước 2: Chạy Dịch vụ Giọng nói TTS (Port 8002)
Mở Terminal 2 và chạy lệnh sau:
```bash
cd tts-api
# Sử dụng môi trường ảo (có cài đặt Pytorch, Transformers)
source ../backend/venv/bin/activate 
pip install torch torchaudio transformers soundfile uvicorn fastapi httpx python-multipart
python main.py
```
*Dịch vụ TTS sẽ khởi động ở địa chỉ: `http://localhost:8002`*

### Bước 3: Chạy Frontend (Port 5173)
Mở Terminal 3 và chạy lệnh sau:
```bash
cd codebase
npm install
npm run dev
```
*Giao diện web sẽ khởi động ở địa chỉ: `http://localhost:5173`*

---

## 2. Cách Dừng (Stop)

- Để dừng một dịch vụ đang chạy trong Terminal, bạn chỉ cần mở Terminal đó và nhấn tổ hợp phím **`Ctrl + C`**.
- Lặp lại cho cả 3 cửa sổ Terminal (Backend, TTS API, và Frontend).

> **Lưu ý**: Đối với tính năng Voice Clone, hệ thống sẽ gọi tới thư mục `tts-api`. Ở lần chạy đầu tiên, dịch vụ này có thể sẽ tải một vài mô hình AI nhỏ về máy nên sẽ mất vài phút.
