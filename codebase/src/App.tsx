import { useEffect, useMemo, useRef, useState } from 'react'
import { AppLayout } from './components/AppLayout'
import { DocumentViewer } from './components/DocumentViewer'
import { FeedbackModal } from './components/FeedbackModal'
import { Sidebar } from './components/Sidebar'
import { Toast } from './components/Toast'
import { TopHeader } from './components/TopHeader'
import { TutorPanel } from './components/TutorPanel'
import { documentGroups, documents } from './data/documents'
import { mockTutorResponse } from './mockTutor'
import type { AnswerMode, ChatItem, SelectedText, Theme, ToastData } from './types'

const id = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

function App() {
  const [selectedDocumentId, setSelectedDocumentId] = useState('tool-calling')
  const [currentPage, setCurrentPage] = useState(4)
  const [zoom, setZoom] = useState(100)
  const [selectedText, setSelectedText] = useState<SelectedText | null>(null)
  const [chatByDocument, setChatByDocument] = useState<Record<string, ChatItem[]>>({})
  const [isTyping, setIsTyping] = useState(false)
  const [feedbackTarget, setFeedbackTarget] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastData | null>(null)
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = window.localStorage.getItem('vlearn-theme')
    if (saved === 'dark' || saved === 'light') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [expandedGroups, setExpandedGroups] = useState(new Set(['day04']))
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tutorOpen, setTutorOpen] = useState(false)
  const [tutorExpanded, setTutorExpanded] = useState(false)
  const responseTimer = useRef<number | null>(null)
  const toastTimer = useRef<number | null>(null)

  const document = useMemo(() => documents.find((item) => item.id === selectedDocumentId) ?? documents[0], [selectedDocumentId])
  if (!document) throw new Error('Prototype cần ít nhất một tài liệu mock.')
  const messages = chatByDocument[document.id] ?? []

  useEffect(() => {
    window.document.documentElement.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem('vlearn-theme', theme)
  }, [theme])

  useEffect(() => () => {
    if (responseTimer.current) window.clearTimeout(responseTimer.current)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
  }, [])

  const notify = (message: string, tone: ToastData['tone'] = 'success') => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    setToast({ id: Date.now(), message, tone })
    toastTimer.current = window.setTimeout(() => setToast(null), 2800)
  }

  const append = (documentId: string, message: ChatItem) => setChatByDocument((state) => ({ ...state, [documentId]: [...(state[documentId] ?? []), message] }))

  const ask = (question: string, mode: AnswerMode = 'normal', addUser = true) => {
    if (!question.trim() || isTyping) return
    const sourceDocument = document
    const sourcePage = currentPage
    const sourceSelection = selectedText
    if (addUser) append(document.id, { id: id(), role: 'user', content: question.trim(), timestamp: new Date(), sourcePage })
    setIsTyping(true)
    if (responseTimer.current) window.clearTimeout(responseTimer.current)
    responseTimer.current = window.setTimeout(() => {
      append(sourceDocument.id, mockTutorResponse(question, sourcePage, sourceSelection, mode, sourceDocument))
      setIsTyping(false)
      responseTimer.current = null
    }, 950)
  }

  const questionFor = (message: ChatItem) => {
    const position = messages.findIndex((item) => item.id === message.id)
    for (let cursor = position - 1; cursor >= 0; cursor -= 1) if (messages[cursor]?.role === 'user') return messages[cursor]?.content ?? 'Giải thích nội dung này'
    return 'Giải thích nội dung này'
  }

  const selectDocument = (documentId: string) => {
    if (documentId === document.id) { setSidebarOpen(false); return }
    setSelectedDocumentId(documentId); setCurrentPage(1); setZoom(100); setSelectedText(null); setSidebarOpen(false)
    notify('Đã chuyển tài liệu. Lịch sử riêng được giữ lại.', 'info')
  }

  const changePage = (page: number) => {
    const safePage = Math.min(document.totalPages, Math.max(1, page))
    setCurrentPage(safePage)
    if (selectedText?.pageNumber !== safePage) setSelectedText(null)
  }

  const selectSource = (documentId: string, page: number) => {
    const nextDocument = documents.find((item) => item.id === documentId) ?? document
    setSelectedDocumentId(nextDocument.id)
    setCurrentPage(Math.min(nextDocument.totalPages, Math.max(1, page)))
    setSelectedText(null)
    notify(`Đã mở ${nextDocument.shortName} · Trang ${page}.`, 'info')
  }

  const updateMessage = (messageId: string, patch: Partial<ChatItem>) => setChatByDocument((state) => ({
    ...state,
    [document.id]: (state[document.id] ?? []).map((message) => message.id === messageId ? { ...message, ...patch } : message)
  }))

  const submitFeedback = (reason: string, detail?: string) => {
    if (!feedbackTarget) return
    updateMessage(feedbackTarget, { feedback: { type: 'dislike', reason, detail } })
    setFeedbackTarget(null); notify('Cảm ơn bạn. Phản hồi đã được ghi nhận.')
  }

  return <>
    <AppLayout
      sidebarOpen={sidebarOpen}
      tutorOpen={tutorOpen}
      tutorExpanded={tutorExpanded}
      onClosePanels={() => { setSidebarOpen(false); setTutorOpen(false) }}
      header={<TopHeader document={document} theme={theme} onToggleTheme={() => setTheme((value) => value === 'light' ? 'dark' : 'light')} onOpenSidebar={() => setSidebarOpen(true)} onOpenTutor={() => setTutorOpen(true)} />}
      sidebar={<Sidebar groups={documentGroups} selectedId={document.id} expandedGroups={expandedGroups} onToggleGroup={(groupId) => setExpandedGroups((state) => { const next = new Set(state); next.has(groupId) ? next.delete(groupId) : next.add(groupId); return next })} onSelect={selectDocument} onClose={() => setSidebarOpen(false)} />}
      viewer={<DocumentViewer document={document} currentPage={currentPage} zoom={zoom} selectedText={selectedText} onPageChange={changePage} onZoomChange={setZoom} onSelectText={(selection) => { setSelectedText(selection); setCurrentPage(selection.pageNumber) }} onClearSelection={() => setSelectedText(null)} onAskSelected={() => { setTutorOpen(true); ask('Giải thích đoạn vừa chọn') }} onNotify={notify} />}
      tutor={<TutorPanel document={document} documents={documents} currentPage={currentPage} selectedText={selectedText} messages={messages} isTyping={isTyping} expanded={tutorExpanded} onToggleExpanded={() => setTutorExpanded((value) => !value)} onClose={() => setTutorOpen(false)} onClearChat={() => { if (!messages.length) notify('Tài liệu này chưa có lịch sử.', 'info'); else { setChatByDocument((state) => ({ ...state, [document.id]: [] })); notify('Đã xóa lịch sử tài liệu hiện tại.') } }} onClearSelection={() => setSelectedText(null)} onSelectSource={selectSource} onSend={(question) => ask(question)} onCitation={(page) => { changePage(page); setTutorOpen(false); notify(`Đã mở nguồn tại Trang ${page}.`, 'info') }} onSimplify={(message) => ask(questionFor(message), 'simple', false)} onPageOnly={(message) => ask(questionFor(message), 'current-page-only', false)} onCopy={async (message) => { await navigator.clipboard.writeText(message.content); notify('Đã sao chép câu trả lời.') }} onLike={(message) => { updateMessage(message.id, { feedback: { type: 'like' } }); notify('Cảm ơn bạn đã phản hồi.') }} onDislike={(message) => setFeedbackTarget(message.id)} />}
    />
    <FeedbackModal isOpen={Boolean(feedbackTarget)} onClose={() => setFeedbackTarget(null)} onSubmit={submitFeedback} />
    <Toast toast={toast} onClose={() => setToast(null)} />
  </>
}

export default App
