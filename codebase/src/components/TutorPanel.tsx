import { Bot, Eraser, History, Maximize2, Minimize2, ShieldCheck, Sparkles, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { suggestedQuestions } from '../data/documents'
import type { ChatItem, SelectedText, TutorDocument } from '../types'
import { ChatMessage } from './ChatMessage'
import { SuggestedQuestionChips } from './SuggestedQuestionChips'
import { TutorContextCard } from './TutorContextCard'
import { TutorInput } from './TutorInput'
import { SourcePicker } from './SourcePicker'

type Props = {
  document: TutorDocument
  documents: TutorDocument[]
  currentPage: number
  selectedText: SelectedText | null
  messages: ChatItem[]
  isTyping: boolean
  expanded: boolean
  onToggleExpanded: () => void
  onClose: () => void
  onClearChat: () => void
  onClearSelection: () => void
  onSend: (question: string) => void
  onCitation: (page: number) => void
  onSimplify: (message: ChatItem) => void
  onPageOnly: (message: ChatItem) => void
  onCopy: (message: ChatItem) => void
  onLike: (message: ChatItem) => void
  onDislike: (message: ChatItem) => void
  onSelectSource: (documentId: string, page: number) => void
}

export function TutorPanel(props: Props) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [props.messages, props.isTyping])

  return <div className="flex h-full min-h-0 flex-col border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 xl:sticky xl:top-16 xl:h-[calc(100dvh-64px)]">
    <header className="flex min-h-[64px] items-center gap-3 border-b border-slate-200 px-4 dark:border-slate-800">
      <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand-100 bg-brand-50 text-brand-700 dark:border-brand-900 dark:bg-brand-950 dark:text-brand-200"><Bot size={20} /><span className="absolute -bottom-.5 -right-.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-950" /></span>
      <div className="min-w-0 flex-1"><h2 className="font-extrabold text-slate-900 dark:text-white">VLearn Tutor</h2><p className="mt-.5 flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400"><ShieldCheck size={12} /> Trợ lý học theo ngữ cảnh</p></div>
      <button type="button" className="icon-button" onClick={props.onClearChat} aria-label="Xóa lịch sử" title="Xóa lịch sử">{props.messages.length ? <Eraser size={17} /> : <History size={17} />}</button>
      <button type="button" className="icon-button hidden xl:inline-flex" onClick={props.onToggleExpanded} aria-label={props.expanded ? 'Thu nhỏ Tutor' : 'Mở rộng Tutor'}>{props.expanded ? <Minimize2 size={17} /> : <Maximize2 size={17} />}</button>
      <button type="button" className="icon-button xl:hidden" onClick={props.onClose} aria-label="Đóng Tutor"><X size={18} /></button>
    </header>
    <TutorContextCard document={props.document} currentPage={props.currentPage} selectedText={props.selectedText} onClear={props.onClearSelection} />
    <div className="panel-scroll min-h-0 flex-1 overflow-y-scroll px-4 py-4" aria-live="polite">
      {props.messages.length === 0 ? <div className="space-y-5"><div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"><p className="mb-3 flex items-center gap-2 text-xs font-bold text-brand-700 dark:text-brand-300"><ShieldCheck size={15} /> Đúng trang · Có căn cứ</p><p className="text-sm leading-6 text-slate-700 dark:text-slate-200">Xin chào! Mình đang đọc <strong>trang {props.currentPage}</strong>. Hãy chọn một đoạn hoặc đặt câu hỏi; mọi câu trả lời sẽ gắn nguồn để bạn kiểm tra.</p></div><SuggestedQuestionChips questions={suggestedQuestions} disabled={props.isTyping} onSelect={props.onSend} /></div> : <div className="space-y-4">{props.messages.map((message) => <ChatMessage key={message.id} message={message} disabled={props.isTyping} onCitation={props.onCitation} onSimplify={props.onSimplify} onPageOnly={props.onPageOnly} onCopy={props.onCopy} onLike={props.onLike} onDislike={props.onDislike} />)}{props.isTyping && <div className="flex items-center gap-2.5" role="status"><span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-700 text-white"><Sparkles size={14} /></span><span className="flex gap-1 rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">{[0,1,2].map((item) => <i key={item} className="typing-dot h-1.5 w-1.5 rounded-full bg-brand-500" />)}</span></div>}<div ref={endRef} /></div>}
    </div>
    <div className="border-t border-slate-200 bg-white px-3 pt-3 dark:border-slate-800 dark:bg-slate-950">
      <SourcePicker
        documents={props.documents}
        documentId={props.document.id}
        currentPage={props.currentPage}
        onSelect={props.onSelectSource}
      />
    </div>
    <TutorInput disabled={props.isTyping} hasSelection={Boolean(props.selectedText)} onSend={props.onSend} />
  </div>
}
