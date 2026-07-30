# Lectura AI Tutor

Prototype AI Tutor đọc tài liệu, xây dựng bằng React, Vite, TypeScript và Tailwind CSS. Toàn bộ tài liệu và câu trả lời đều là dữ liệu mock, không dùng backend hay API.

## Chạy dự án

```bash
npm install
npm run dev
```

Mở địa chỉ do Vite hiển thị (mặc định là `http://localhost:5173`).

## Build production

```bash
npm run build
npm run preview
```

## Cấu trúc chính

- `src/data/documents.ts`: dữ liệu 3 tài liệu, mỗi tài liệu 5 trang.
- `src/components/Sidebar.tsx`: chọn tài liệu.
- `src/components/DocumentViewer.tsx`: đọc và chọn đoạn văn.
- `src/components/PageNavigation.tsx`: chuyển trang.
- `src/components/TutorPanel.tsx`: quản lý hội thoại mock.
- `src/components/SourcePicker.tsx`: chọn nhanh tài liệu và trang ngay trong chat.
- `src/components/ChatMessage.tsx`: câu hỏi, câu trả lời và thao tác nhanh.
- `src/components/FeedbackModal.tsx`: ghi nhận lý do phản hồi tiêu cực.
