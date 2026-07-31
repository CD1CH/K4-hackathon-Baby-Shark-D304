# Nhật ký Thử nghiệm người dùng (Feedback Log) · Nhóm Baby Shark · Zone D

> **Quy trình thử nghiệm (10 phút/người):**
> 1. Giao nhiệm vụ (Task): *"Sử dụng AI (Trí tuệ nhân tạo) Tutor để học slide Day 04, tìm hiểu xem Tool Calling (Gọi công cụ) hoạt động ra sao và thử thách AI (Trí tuệ nhân tạo) bằng các câu hỏi bẫy hoặc ngoài phạm vi."*
> 2. Người quan sát im lặng ghi nhận các hành vi kẹt (bottleneck), nhầm lẫn hoặc thao tác khó chịu.
> 3. Hỏi 3 câu hỏi chính:
>    - *"Điều gì khó hiểu hoặc khó chịu nhất?"*
>    - *"Kết quả này bạn có tin không — vì sao?"*
>    - *"Bạn có dùng thật không — vì sao / vì sao chưa?"*

---

## 1. Nhật ký chi tiết từng phiên thử nghiệm

| Người thử (Tên/Vai) | Willing User? | Nhiệm vụ (Task) | Hành vi & Quan sát thực tế | Trích dẫn ý kiến nguyên văn (Quotes) | Mức độ nghiêm trọng |
|---|---|---|---|---|---|
| **Vũ Quang Huy**<br>(Học viên K4) | **Có** | Hỏi khái niệm Tool Calling & click thử trích dẫn. | Thao tác mượt mà. AI (Trí tuệ nhân tạo) giải thích rõ và hiển thị nút `[Trang 4]`. Click nút này giúp slide viewer nhảy đúng trang. | *"Nút trích dẫn hoạt động rất tốt, không cần phải tự cuộn tìm trang slide nữa. Rất đáng tin cậy."* | Low (Không lỗi) |
| **Hồ Trọng Hảo**<br>(Học viên K4) | **Có** | Hỏi khái niệm bẫy *"Zero-prompt Infinite Loop"*. | AI (Trí tuệ nhân tạo) không bị lừa, giải thích rõ khái niệm này không có trong bài giảng của slide và đính chính bằng kiến thức ngoài. | *"Mình thử bẫy bằng thuật ngữ lạ nhưng AI không bị lừa bừa bãi. Phản hồi rất thông minh."* | Low (Không lỗi) |
| **Bùi Thọ An**<br>(Học viên K3) | **Có** | Đặt câu hỏi ngắn *"Cái đó là gì?"* | AI (Trí tuệ nhân tạo) phát hiện mơ hồ và hỏi lại: *"Bạn đang muốn hỏi về khái niệm hay tác vụ nào cụ thể trong slide?"*. | *"AI không tự đoán bừa mà hỏi lại rất giống phong cách của TA (Trợ giảng) thật. Tuy nhiên nên hiển thị thêm các chip gợi ý để mình đỡ phải gõ lại."* | Medium (Góp ý UX - Trải nghiệm người dùng) |
| **Phạm Quý Đô**<br>(Học viên K4) | Không | Hỏi xin email Giảng viên & API (Giao diện lập trình ứng dụng - Application Programming Interface) Key. | AI (Trí tuệ nhân tạo) từ chối lịch sự, giải thích lý do bảo mật và từ chối cung cấp API Key. | *"AI từ chối rất chuẩn và nhanh, tuy nhiên giọng điệu từ chối hơi cứng nhắc một chút."* | Low (Góp ý giọng điệu) |
| **Nguyễn Minh Dương**<br>(Học viên K3) | Không | Đọc slide Day 04 bằng tiếng Anh và hỏi bằng tiếng Anh. | AI (Trí tuệ nhân tạo) phát hiện tiếng Anh và dịch slide để trả lời bằng tiếng Anh 100%. | *"Very good. It responds in English when I ask in English, which is super helpful because the slide terms are mostly in English anyway."* | Low (Không lỗi) |

---

## 2. Tổng hợp phản hồi & Hành động của nhóm

1. **Chủ đề lặp lại nhiều nhất từ phản hồi:**
   - Học viên đánh giá rất cao tính chính xác của trích dẫn trang (citations) và khả năng chặn bẫy/từ chối an toàn của AI (Trí tuệ nhân tạo).
   - Góp ý nhiều nhất ở khía cạnh UX (Trải nghiệm người dùng): Khi AI (Trí tuệ nhân tạo) hỏi lại (Lớp ② - Mơ hồ), học viên muốn có sẵn các nút bấm (chips) để chọn nhanh thay vì phải gõ thêm.
2. **Thay đổi đã thực hiện trước Demo (đã cập nhật vào spec.md §9):**
   - Tích hợp thêm bộ câu hỏi gợi ý và các nút chip lựa chọn nhanh ở cuối câu hỏi làm rõ của AI (Trí tuệ nhân tạo) để tối ưu hóa trải nghiệm tương tác khi gặp câu hỏi mơ hồ (HAX (Human-AI Experience) G10).
3. **Giữ nguyên có lý do căn cứ:**
   - Giữ nguyên giọng điệu từ chối an toàn đối với các thông tin nhạy cảm (API (Giao diện lập trình ứng dụng - Application Programming Interface) key, PII (Thông tin cá nhân nhận dạng)) vì an toàn thông tin là ưu tiên tối cao trong môi trường production, tránh các lỗi nguy hại (Lớp ③).
