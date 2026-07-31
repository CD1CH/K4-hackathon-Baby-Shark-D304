# ĐẶC TẢ YÊU CẦU DỰ ÁN (SPEC.MD)

Đây là tài liệu đặc tả quan trọng nhất của hệ thống AI Tutor.

## 1. Bài toán (Problem)
Sinh viên, học sinh thường gặp khó khăn trong việc tự học và ôn tập từ các tài liệu slide bài giảng dài dòng, khô khan. Việc tìm kiếm thông tin, giải đáp thắc mắc và kiểm tra lại mức độ hiểu bài thường tốn nhiều thời gian và cần sự trợ giúp từ giáo viên. 
- **Nhu cầu:** Một trợ lý học tập AI thông minh, có khả năng "đọc" hiểu tài liệu (PDF, Slide), giải đáp thắc mắc sát với ngữ cảnh bài học, và hỗ trợ ôn tập kiến thức thông qua các hình thức tương tác sinh động (Bài kiểm tra, Flashcard, Giọng nói).

## 2. Bằng chứng (Evidence)
- Hệ thống có khả năng nhận diện trang tài liệu học sinh đang xem để trả lời theo đúng ngữ cảnh.
- Sinh viên tương tác tốt hơn với các nội dung học tập có tính "Gamification" hoặc thẻ ghi nhớ (Flashcard).
- Tính năng Text-to-Speech (Đọc văn bản) và Clone Voice (Giọng nói tùy chỉnh) giúp người học tiếp thu thông tin đa dạng qua thính giác, đặc biệt với những sinh viên lười đọc text dài.
- Cần có sự giải thích cặn kẽ (đúng/sai và lý thuyết liên quan) để sinh viên thực sự hiểu bản chất thay vì chỉ biết kết quả.

## 3. Lát cắt (Slice)
Phạm vi sản phẩm (MVP) tập trung vào các tính năng cốt lõi sau:
1. **Chat Contextual:** Hỏi đáp dựa trên file tài liệu (PDF) đã tải lên, trả lời đúng ngôn ngữ người dùng hỏi.
2. **Text-to-Speech & Voice Clone:** Đọc câu trả lời bằng giọng mặc định của trình duyệt hoặc giọng đọc AI (clone voice) thông qua backend TTS.
3. **Interactive Quiz Generator:** AI tự động tạo bài trắc nghiệm (HTML/JS) gồm ít nhất 10 câu hỏi, chấm điểm, giải thích chi tiết đúng/sai và giảng lại lý thuyết trực tiếp trên giao diện trình duyệt.
4. **Interactive Flashcard Generator:** AI tự động tạo bộ Flashcard lật mặt (HTML/JS) gồm ít nhất 10 thẻ có nút chuyển đổi qua lại để ôn tập nhanh khái niệm.

## 4. Quality bar (Tiêu chuẩn chất lượng)
- **Độ chính xác (Accuracy):** AI không được bịa đặt thông tin. Các câu trả lời và đề thi phải bám sát nội dung slide.
- **Trải nghiệm người dùng (UX):** Giao diện UI/UX mượt mà, render trực tiếp các HTML tương tác (Quiz/Flashcard) trong popup an toàn (không bị lỗi CORS, Block popup mà không có cảnh báo).
- **Phản hồi tức thì (Responsiveness):** Các logic tương tác tĩnh như chấm điểm Quiz hay lật Flashcard phải được xử lý tức thời bằng JavaScript ở client-side (hardcode), không bắt người dùng đợi load từ server.
- **Tính ổn định của Audio:** Việc phát âm thanh (TTS) phải đồng bộ với icon trạng thái (Play/Stop), không bị chồng chéo luồng âm thanh khi chuyển tiếp câu trả lời.
