import { CornerDownLeft, Send, Sparkles } from 'lucide-react'
import { useState } from 'react'

type Props = { disabled?: boolean; hasSelection: boolean; onSend: (question: string) => void }

export function TutorInput({ disabled, hasSelection, onSend }: Props) {
  const [value, setValue] = useState('')
  const send = () => { const question = value.trim(); if (!question || disabled) return; onSend(question); setValue('') }
  return <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
    {hasSelection && <p className="mb-2 flex items-center gap-1.5 text-[10px] font-medium text-amber-700 dark:text-amber-300"><Sparkles size={12} /> Tutor ưu tiên giải thích đoạn đang chọn</p>}
    <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:ring-brand-950">
      <textarea value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send() } }} rows={1} disabled={disabled} className="app-scrollbar max-h-32 min-h-10 flex-1 resize-none bg-transparent px-1.5 py-2 text-sm leading-5 text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100" placeholder="Nhập câu hỏi hoặc bôi đen tài liệu..." aria-label="Nhập câu hỏi" />
      <button type="button" onClick={send} disabled={!value.trim() || disabled} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-700 text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700" aria-label="Gửi câu hỏi"><Send size={17} /></button>
    </div>
    <p className="mt-1.5 flex items-center justify-center gap-1 text-[9px] text-slate-400"><CornerDownLeft size={10} /> Enter để gửi · Shift + Enter để xuống dòng</p>
  </div>
}
