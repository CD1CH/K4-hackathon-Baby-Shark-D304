export type Theme = 'light' | 'dark'
export type AnswerMode = 'normal' | 'simple' | 'current-page-only'

export type DocumentPage = {
  pageNumber: number
  eyebrow: string
  title: string
  subtitle: string
  accent: 'blue' | 'violet' | 'cyan' | 'amber' | 'indigo'
  blocks: Array<{
    id: string
    heading?: string
    text: string
    kind?: 'text' | 'quote' | 'steps' | 'code'
  }>
}

export type TutorDocument = {
  id: string
  groupId: string
  name: string
  shortName: string
  totalPages: number
  courseCode: string
  breadcrumb: string
  pages: DocumentPage[]
}

export type DocumentGroupData = {
  id: string
  name: string
  meta: string
  documents: TutorDocument[]
}

export type SelectedText = {
  documentId: string
  pageNumber: number
  blockId: string
  text: string
}

export type FeedbackData = {
  type: 'like' | 'dislike'
  reason?: string
  detail?: string
}

export type ChatItem = {
  id: string
  role: 'user' | 'tutor'
  content: string
  citations?: number[]
  timestamp: Date
  answerMode?: AnswerMode
  sourcePage?: number
  feedback?: FeedbackData
}

export type ToastData = {
  id: number
  message: string
  tone?: 'success' | 'info' | 'warning' | 'error'
}
