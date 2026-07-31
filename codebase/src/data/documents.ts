import type { DocumentGroupData, DocumentPage, TutorDocument } from '../types'
import { d1Pages, d2Pages, lecture8Pages } from './parsed_slides'

export const d1Document: TutorDocument = {
  id: 'd1-slide-hackathon',
  groupId: 'day01',
  name: 'd1-slide-hackathon.pdf',
  shortName: 'd1-slide-hackathon',
  totalPages: d1Pages.length,
  courseCode: 'COMP2010',
  breadcrumb: 'COMP2010 · Slide Bài Giảng · Day 01',
  pages: d1Pages
}

export const d2Document: TutorDocument = {
  id: 'd2-slide-hackathon',
  groupId: 'day02',
  name: 'd2-slide-hackathon.pdf',
  shortName: 'd2-slide-hackathon',
  totalPages: d2Pages.length,
  courseCode: 'COMP2010',
  breadcrumb: 'COMP2010 · Slide Bài Giảng · Day 02',
  pages: d2Pages
}

export const lecture8Document: TutorDocument = {
  id: 'lecture-8-stream-ciphers',
  groupId: 'lecture08',
  name: 'Lecture 8.Random Bit Generation and Stream Ciphers.pdf',
  shortName: 'Lecture 8 - Stream Ciphers',
  totalPages: lecture8Pages.length,
  courseCode: 'COMP2010',
  breadcrumb: 'COMP2010 · Slide Bài Giảng · Lecture 08',
  pages: lecture8Pages
}

export const documents: TutorDocument[] = [
  d1Document,
  d2Document,
  lecture8Document
]

export const documentGroups: DocumentGroupData[] = [
  { id: 'day01', name: 'Day 01 - AI Hackathon', meta: '1 slide · 29 trang', documents: [d1Document] },
  { id: 'day02', name: 'Day 02 - AI Hackathon', meta: '1 slide · 29 trang', documents: [d2Document] },
  { id: 'lecture08', name: 'Lecture 08 - Stream Ciphers', meta: '1 slide · 23 trang', documents: [lecture8Document] }
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
    eyebrow: 'SLIDE BÀI GIẢNG',
    title: `Trang ${pageNumber}: Nội dung bài giảng`,
    subtitle: 'Nội dung chi tiết slide bài giảng',
    accent: pageNumber % 2 ? 'blue' : 'cyan',
    blocks: [{
      id: `fallback-${pageNumber}`,
      heading: 'Nội dung trang',
      text: 'Tutor trả lời dựa trên toàn bộ tài liệu slide được chọn.'
    }]
  }
}
