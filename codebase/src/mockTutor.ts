import { getDocumentPage } from './data/documents'
import type { AnswerMode, ChatItem, SelectedText, TutorDocument } from './types'

const normalize = (text: string) => text
  .toLocaleLowerCase('vi')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')

const has = (text: string, words: string[]) => words.some((word) => normalize(text).includes(normalize(word)))
const id = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export function mockTutorResponse(
  question: string,
  currentPage: number,
  selectedText: SelectedText | null,
  mode: AnswerMode,
  document: TutorDocument
): ChatItem {
  const page = getDocumentPage(document, currentPage)
  const source = selectedText?.text ?? page.blocks.map((block) => block.text).join(' ')
  let content = ''

  if (selectedText && selectedText.text.trim().length <= 2) {
    content = `Đoạn “${selectedText.text.trim()}” quá ngắn để xác định khái niệm. Bạn hãy chọn thêm một câu đầy đủ hoặc cho mình biết muốn giải thích phần nào trên trang ${currentPage}.`
  } else if (mode === 'current-page-only' && has(question, ['transformer', 'alphago', 'lịch sử AI'])) {
    content = 'Trang này chưa cung cấp đủ thông tin để trả lời đầy đủ. Mình sẽ không dùng kiến thức từ trang khác; bạn có thể chuyển đến trang liên quan rồi hỏi lại.'
  } else if (mode === 'simple' || has(question, ['đơn giản', 'dễ hiểu'])) {
    content = has(source, ['tool calling', 'hàm bên ngoài', 'công cụ'])
      ? 'Hiểu đơn giản, tool calling giống như AI biết khi nào cần nhờ một công cụ khác làm việc. Ví dụ, khi bạn hỏi thời tiết, AI gọi công cụ xem thời tiết thay vì tự đoán. Ứng dụng vẫn phải kiểm tra trước khi cho công cụ chạy.'
      : `Hiểu đơn giản, trang ${currentPage} đang trình bày “${page.title}”. Bạn có thể xem đây là một quy tắc thực hành rồi áp dụng vào tình huống quen thuộc.`
  } else if (has(question, ['câu hỏi ôn tập', 'quiz'])) {
    content = `Ba câu để bạn tự kiểm tra:\n1. ${page.title} giải quyết vấn đề gì?\n2. Nội dung nào cần được kiểm tra trước khi thực thi?\n3. Bạn sẽ áp dụng nguyên tắc này vào ví dụ thực tế nào?`
  } else if (has(question, ['tóm tắt', 'tổng quan'])) {
    content = `Trang ${currentPage} có các ý chính:\n${page.blocks.slice(0, 3).map((block, index) => `${index + 1}. ${block.heading ? `${block.heading}: ` : ''}${block.text}`).join('\n')}`
  } else if (has(question, ['ghi nhớ', 'quan trọng', 'note'])) {
    content = `Điểm cần ghi nhớ: ${page.blocks.at(-1)?.text ?? page.subtitle} Hãy luôn kiểm tra nguồn và giới hạn hành động thay vì mặc định output của mô hình luôn đúng.`
  } else if (has(question, ['ví dụ', 'thực tế'])) {
    content = has(source, ['tool calling', 'công cụ'])
      ? 'Ví dụ: người học hỏi deadline bài tập. Tutor không tự đoán mà gọi công cụ tra lịch chính thức với mã môn học; hệ thống kiểm tra tham số trước khi trả kết quả.'
      : `Ví dụ, bạn có thể biến nội dung “${page.title}” thành một checklist nhỏ rồi dùng checklist đó để rà lại yêu cầu.`
  } else if (has(question, ['tool calling', 'function calling', 'tool'])) {
    content = 'Tool calling cho phép mô hình yêu cầu ứng dụng thực thi một công cụ hoặc hàm cụ thể. Mô hình xác định tên tool và tham số; ứng dụng xác thực, chạy tool rồi trả kết quả lại. JSON Schema giúp cấu trúc ổn định hơn nhưng vẫn cần validation và phân quyền.'
  } else if (has(question, ['few-shot', 'few shot'])) {
    content = 'Few-shot prompting đưa một vài ví dụ input–output trước yêu cầu thật để mô hình nhận ra cách phân loại và định dạng cần tạo. Chất lượng ví dụ quyết định độ ổn định của kết quả.'
  } else if (has(question, ['system prompt'])) {
    content = 'System prompt đặt vai trò, phạm vi và nguyên tắc ưu tiên. Với Tutor này, nguyên tắc quan trọng nhất là chỉ dùng nguồn được cung cấp và nói rõ khi trang hiện tại chưa đủ căn cứ.'
  } else if (has(question, ['agent'])) {
    content = 'Agent vận hành theo vòng lặp quan sát, quyết định, hành động và kiểm tra. Khác chatbot chỉ tạo câu trả lời, agent có thể gọi công cụ nhưng vẫn cần giới hạn và guardrail.'
  } else if (selectedText) {
    content = `Đoạn bạn chọn nhấn mạnh: “${selectedText.text}” Nói cách khác, mô hình có thể đề xuất nhưng ứng dụng vẫn giữ trách nhiệm kiểm tra và thực thi an toàn.`
  } else {
    content = `Dựa riêng trên trang ${currentPage}, nội dung chính là “${page.title}”. ${page.blocks[0]?.text ?? 'Trang hiện tại chưa có đủ nội dung chi tiết.'}`
  }

  if (mode === 'current-page-only' && !content.startsWith('Trang này chưa')) {
    content = `Chỉ dựa trên nội dung Trang ${currentPage}: ${content}`
  }

  return {
    id: id(),
    role: 'tutor',
    content,
    citations: [currentPage],
    timestamp: new Date(),
    answerMode: mode,
    sourcePage: currentPage
  }
}
