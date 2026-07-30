import type { DocumentGroupData, DocumentPage, TutorDocument } from '../types'

export const mockPages: DocumentPage[] = [
  {
    pageNumber: 1,
    eyebrow: 'PROMPT ENGINEERING · DAY 04',
    title: 'Prompt Engineering & Tool Calling',
    subtitle: 'Làm sao nói để AI hiểu đúng — và biết khi nào cần hành động?',
    accent: 'blue',
    blocks: [
      {
        id: 'p1-quote',
        kind: 'quote',
        text: 'Hai người hỏi AI cùng một việc, một người nhận kết quả xuất sắc, người kia nhận rác. Tại sao? Và cùng một agent, đôi khi nó gọi tool đúng, đôi khi gọi sai — do prompt hay do tool?'
      },
      {
        id: 'p1-goal',
        heading: 'Mục tiêu buổi học',
        text: 'Hiểu cách viết yêu cầu rõ ràng, cung cấp đúng ngữ cảnh và thiết kế công cụ để mô hình đưa ra quyết định đáng tin cậy.'
      }
    ]
  },
  {
    pageNumber: 2,
    eyebrow: 'NỀN TẢNG',
    title: 'Một prompt tốt gồm những gì?',
    subtitle: 'Specificity beats cleverness',
    accent: 'cyan',
    blocks: [
      { id: 'p2-role', heading: 'Role · Vai trò', text: 'Định hình góc nhìn, trình độ chuyên môn và giọng điệu mà mô hình nên sử dụng khi trả lời.' },
      { id: 'p2-task', heading: 'Task · Nhiệm vụ', text: 'Mô tả hành động cần thực hiện bằng động từ cụ thể, tránh những yêu cầu chung chung như “làm tốt hơn”.' },
      { id: 'p2-context', heading: 'Context · Bối cảnh', text: 'Cung cấp dữ liệu nền, đối tượng sử dụng, giới hạn và nguồn sự thật cần thiết để mô hình không phải đoán.' },
      { id: 'p2-format', heading: 'Format · Định dạng', text: 'Nêu cấu trúc đầu ra mong muốn: bảng, checklist, JSON hay một đoạn giải thích ngắn.' }
    ]
  },
  {
    pageNumber: 3,
    eyebrow: 'KIỂM SOÁT HÀNH VI',
    title: 'System Prompt là bản hiến pháp',
    subtitle: 'Đặt nguyên tắc trước khi nhận yêu cầu của người dùng',
    accent: 'indigo',
    blocks: [
      { id: 'p3-purpose', heading: 'Mục đích', text: 'System prompt xác định vai trò, phạm vi, thứ tự ưu tiên và cách mô hình hành xử khi thiếu thông tin hoặc gặp yêu cầu ngoài thẩm quyền.' },
      { id: 'p3-grounding', heading: 'Grounding', text: 'Chỉ trả lời bằng nguồn được cung cấp. Nếu tài liệu không đủ căn cứ, phải nói rõ giới hạn và đề nghị người học cung cấp thêm ngữ cảnh.' },
      { id: 'p3-rule', kind: 'code', text: 'Nguồn sự thật > yêu cầu người dùng > phong cách trình bày.\nKhông bịa nội dung hoặc số trang để hoàn thành câu trả lời.' }
    ]
  },
  {
    pageNumber: 4,
    eyebrow: 'TỪ NÓI ĐẾN HÀNH ĐỘNG',
    title: 'Tool Calling: cho model một hợp đồng rõ ràng',
    subtitle: 'Mô hình quyết định gọi gì; ứng dụng chịu trách nhiệm thực thi',
    accent: 'violet',
    blocks: [
      { id: 'p4-definition', heading: 'Tool calling là gì?', text: 'Tool calling cho phép mô hình yêu cầu hệ thống thực thi một hàm bên ngoài. Mô hình chọn tên công cụ và tạo tham số; ứng dụng kiểm tra, thực thi rồi gửi kết quả trở lại cho mô hình.' },
      { id: 'p4-flow', heading: 'Luồng thực thi', kind: 'steps', text: 'Người dùng đặt câu hỏi → Mô hình chọn tool → Ứng dụng xác thực → Tool chạy → Mô hình tổng hợp' },
      { id: 'p4-safety', heading: 'Điểm cần nhớ', text: 'JSON Schema làm output ổn định hơn nhưng không đảm bảo tool call luôn đúng về mặt nghiệp vụ. Ứng dụng vẫn cần validation, phân quyền và xử lý lỗi.' }
    ]
  },
  {
    pageNumber: 5,
    eyebrow: 'HỌC BẰNG VÍ DỤ',
    title: 'Few-shot Prompting',
    subtitle: 'Đưa một vài mẫu tốt để mô hình học cấu trúc đầu ra',
    accent: 'amber',
    blocks: [
      { id: 'p5-definition', heading: 'Nguyên lý', text: 'Few-shot prompting cung cấp một số cặp input–output mẫu trước yêu cầu thật để mô hình nhận ra tác vụ, nhãn và định dạng mong muốn.' },
      { id: 'p5-example', kind: 'code', text: 'Input: “Giao hàng rất nhanh” → Positive\nInput: “Sản phẩm bị lỗi” → Negative\nInput: “Thiết kế đẹp nhưng giao chậm” → Neutral' },
      { id: 'p5-note', heading: 'Lưu ý', text: 'Ví dụ phải đại diện cho trường hợp thực tế và nhất quán về định dạng; ví dụ sai có thể khiến mô hình lặp lại sai lệch.' }
    ]
  },
  {
    pageNumber: 6,
    eyebrow: 'AGENT WORKFLOW',
    title: 'Vòng lặp suy luận và hành động',
    subtitle: 'Observe → Decide → Act → Verify',
    accent: 'blue',
    blocks: [
      { id: 'p6-loop', heading: 'Agent không chỉ trả lời', text: 'Agent quan sát trạng thái, quyết định bước tiếp theo, gọi công cụ phù hợp và kiểm tra kết quả trước khi tiếp tục hoặc kết thúc.' },
      { id: 'p6-guardrail', heading: 'Guardrail', text: 'Mỗi hành động có ảnh hưởng thật cần giới hạn số bước, kiểm tra đầu vào và yêu cầu con người xác nhận khi chi phí sai cao.' }
    ]
  }
]

const createDocument = (id: string, name: string, totalPages: number): TutorDocument => ({
  id,
  groupId: 'day04',
  name,
  shortName: name.replace('.pdf', ''),
  totalPages,
  courseCode: 'COMP2010',
  breadcrumb: 'COMP2010 · Lecture material · Day04',
  pages: mockPages
})

export const documents: TutorDocument[] = [
  createDocument('basic', 'day04-prompt-engineering-basic.pdf', 43),
  createDocument('example', 'day04-prompt-engineering-example.pdf', 78),
  createDocument('tool-calling', 'day04-prompt-engineering-tool-calling.pdf', 98)
]

export const documentGroups: DocumentGroupData[] = [
  { id: 'day01', name: 'Day01', meta: '2 tài liệu · Published', documents: [] },
  { id: 'day02', name: 'Day02', meta: '1 tài liệu · Published', documents: [] },
  { id: 'day03', name: 'Day03', meta: '2 tài liệu · Published', documents: [] },
  { id: 'day04', name: 'Day04', meta: '3 tài liệu · Published', documents }
]

export const suggestedQuestions = [
  'Tóm tắt trang này',
  'Giải thích nội dung chính',
  'Cho ví dụ dễ hiểu',
  'Điểm nào cần ghi nhớ?',
  'Tạo 3 câu hỏi ôn tập'
]

export const feedbackReasons = [
  'Không chính xác',
  'Không liên quan',
  'Khó hiểu',
  'Trích dẫn sai',
  'Câu trả lời quá dài',
  'Lý do khác'
]

export function getDocumentPage(document: TutorDocument, pageNumber: number): DocumentPage {
  return document.pages.find((page) => page.pageNumber === pageNumber) ?? {
    pageNumber,
    eyebrow: 'NỘI DUNG BÀI GIẢNG',
    title: `Trang ${pageNumber}: Nội dung mở rộng`,
    subtitle: 'Trang mô phỏng cho prototype',
    accent: pageNumber % 2 ? 'blue' : 'cyan',
    blocks: [{
      id: `fallback-${pageNumber}`,
      heading: 'Chưa nạp nội dung chi tiết',
      text: 'Tutor chỉ trả lời dựa trên nội dung có sẵn và sẽ nói rõ khi trang hiện tại chưa đủ căn cứ.'
    }]
  }
}
