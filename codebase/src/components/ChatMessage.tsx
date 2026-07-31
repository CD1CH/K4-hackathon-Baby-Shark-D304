import { useState, useEffect } from 'react'
import { Check, Copy, RefreshCw, Sparkles, ThumbsDown, ThumbsUp, Volume2, Square, FileCode2, ExternalLink, Download } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ChatItem } from '../types'
import { CitationButton } from './CitationButton'

type Props = {
  message: ChatItem
  disabled?: boolean
  onCitation: (page: number) => void
  onSimplify: (message: ChatItem) => void
  onPageOnly: (message: ChatItem) => void
  onCopy: (message: ChatItem) => void
  onLike: (message: ChatItem) => void
  onDislike: (message: ChatItem) => void
  voiceLang?: string
  voiceSpeed?: number
  isReading?: boolean
  onToggleRead?: () => void
}

export function ChatMessage({ message, disabled, onCitation, onSimplify, onPageOnly, onCopy, onLike, onDislike, voiceLang = 'vi-VN', voiceSpeed = 1.0, isReading, onToggleRead }: Props) {
  const handleToggleRead = () => {
    if (onToggleRead) {
      onToggleRead()
    } else {
      if (isReading) {
        window.speechSynthesis.cancel()
        window.dispatchEvent(new Event('speech-end'))
      } else {
        window.speechSynthesis.cancel() // Stop others
        window.dispatchEvent(new Event('speech-end')) // Notify others to stop reading
        const utterance = new SpeechSynthesisUtterance(message.content)
        utterance.lang = voiceLang
        utterance.rate = voiceSpeed
        window.speechSynthesis.speak(utterance)
      }
    }
  }

  if (message.role === 'user') return <div className="flex justify-end"><div className="max-w-[88%] rounded-2xl rounded-br-md bg-brand-700 px-3.5 py-2.5 text-sm leading-6 text-white shadow-sm"><p className="whitespace-pre-line">{message.content}</p><p className="mt-1 text-right text-[9px] text-white/65">{message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p></div></div>

  return <div className="flex gap-2.5">
    <div className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-700 text-white"><Sparkles size={14} /></div>
    <div className="min-w-0 flex-1">
      <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white px-3.5 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          {message.answerMode === 'current-page-only' && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><Check size={11} /> Chỉ dùng Trang {message.sourcePage}</span>}
          {message.answerMode === 'simple' && <span className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">Giải thích đơn giản</span>}
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Nguồn đã kiểm tra</span>
        </div>
        <div className="prose prose-sm prose-slate dark:prose-invert max-w-none text-[13px] leading-6 text-slate-700 dark:text-slate-200">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '')
                if (!inline && match && match[1] === 'html') {
                  const content = String(children).replace(/\n$/, '')
                  
                  const handlePreview = () => {
                    const newWindow = window.open('', '_blank')
                    if (newWindow) {
                      newWindow.document.write(content)
                      newWindow.document.close()
                    } else {
                      alert("Trình duyệt đã chặn cửa sổ bật lên (popup). Vui lòng cho phép popup để xem bài kiểm tra, hoặc dùng nút Tải về máy.")
                    }
                  }

                  const handleDownload = () => {
                    const blob = new Blob([content], { type: 'text/html' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'quiz.html'
                    a.click()
                    URL.revokeObjectURL(url)
                  }

                  return (
                    <div className="my-4 overflow-hidden rounded-xl border border-brand-200 bg-brand-50 dark:border-brand-900/50 dark:bg-brand-900/20 not-prose">
                      <div className="flex items-center justify-between border-b border-brand-100 bg-white px-4 py-3 dark:border-brand-800 dark:bg-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900 dark:text-brand-400">
                            <FileCode2 size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200">Học liệu Tương tác</h4>
                            <p className="text-[11px] font-medium text-slate-500">Bài tập, Flashcard, Sơ đồ tư duy (HTML)</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 p-3">
                        <button onClick={handlePreview} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-xs font-bold text-white transition-colors hover:bg-brand-700">
                          <ExternalLink size={14} /> Mở xem trực tiếp
                        </button>
                        <button onClick={handleDownload} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-brand-200 bg-white py-2.5 text-xs font-bold text-brand-700 transition-colors hover:bg-brand-50 dark:border-brand-800 dark:bg-slate-900 dark:text-brand-400 dark:hover:bg-brand-900/50">
                          <Download size={14} /> Tải về máy
                        </button>
                      </div>
                    </div>
                  )
                }
                return <code className={className} {...props}>{children}</code>
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        {message.citations && <div className="mt-3 flex flex-wrap gap-1.5">{message.citations.map((page) => <CitationButton key={page} page={page} onClick={onCitation} />)}</div>}
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        <button type="button" className="message-action" onClick={() => onSimplify(message)} disabled={disabled}><Sparkles size={12} /> Đơn giản hơn</button>
        <button type="button" className="message-action" onClick={() => onPageOnly(message)} disabled={disabled}><RefreshCw size={12} /> Chỉ từ trang này</button>
        <button type="button" className="message-icon-action" onClick={() => onCopy(message)} aria-label="Sao chép"><Copy size={13} /></button>
        <button type="button" className={`message-icon-action ${isReading ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30' : ''}`} onClick={handleToggleRead} aria-label="Đọc văn bản">{isReading ? <Square size={13} /> : <Volume2 size={13} />}</button>
        <span className="mx-0.5 h-4 w-px bg-slate-200 dark:bg-slate-700" />
        <button type="button" className={`message-icon-action ${message.feedback?.type === 'like' ? 'message-icon-active' : ''}`} onClick={() => onLike(message)} aria-label="Hữu ích"><ThumbsUp size={13} /></button>
        <button type="button" className={`message-icon-action ${message.feedback?.type === 'dislike' ? 'message-icon-active text-rose-600' : ''}`} onClick={() => onDislike(message)} aria-label="Chưa tốt"><ThumbsDown size={13} /></button>
      </div>
    </div>
  </div>
}
