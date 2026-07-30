import { AlertCircle, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { feedbackReasons } from '../data/documents'

type Props = { isOpen: boolean; onClose: () => void; onSubmit: (reason: string, detail?: string) => void }

export function FeedbackModal({ isOpen, onClose, onSubmit }: Props) {
  const [reason, setReason] = useState('')
  const [detail, setDetail] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return
    setReason(''); setDetail('')
    const timer = window.setTimeout(() => closeRef.current?.focus(), 0)
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab' || !dialogRef.current) return
      const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), textarea:not([disabled])'))
      const first = items[0], last = items.at(-1)
      if (!first || !last) return
      if (event.shiftKey && window.document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && window.document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    window.document.addEventListener('keydown', keydown)
    return () => { window.clearTimeout(timer); window.document.removeEventListener('keydown', keydown) }
  }, [isOpen, onClose])

  if (!isOpen) return null
  return <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-[2px]" onMouseDown={onClose} role="presentation">
    <div ref={dialogRef} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-floating dark:border-slate-700 dark:bg-slate-900" role="dialog" aria-modal="true" aria-labelledby="feedback-title" onMouseDown={(event) => event.stopPropagation()}>
      <div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300"><AlertCircle size={18} /></span><div className="min-w-0 flex-1"><h2 id="feedback-title" className="font-bold text-slate-900 dark:text-white">Câu trả lời chưa tốt ở đâu?</h2><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Phản hồi giúp Tutor cải thiện đúng vấn đề.</p></div><button ref={closeRef} type="button" className="icon-button" onClick={onClose} aria-label="Đóng"><X size={17} /></button></div>
      <div className="mt-4 grid grid-cols-2 gap-2">{feedbackReasons.map((item) => <label key={item} className={`cursor-pointer rounded-xl border px-3 py-2.5 text-xs font-medium transition ${reason === item ? 'border-brand-400 bg-brand-50 text-brand-800 ring-2 ring-brand-100 dark:border-brand-600 dark:bg-brand-950 dark:text-brand-200 dark:ring-brand-950' : 'border-slate-200 text-slate-600 hover:border-brand-200 dark:border-slate-700 dark:text-slate-300'}`}><input type="radio" name="feedback" className="sr-only" checked={reason === item} onChange={() => setReason(item)} />{item}</label>)}</div>
      {reason === 'Lý do khác' && <textarea value={detail} onChange={(event) => setDetail(event.target.value)} className="mt-3 min-h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="Mô tả ngắn vấn đề..." aria-label="Lý do khác" />}
      <div className="mt-5 flex justify-end gap-2"><button type="button" className="secondary-button" onClick={onClose}>Hủy</button><button type="button" className="primary-button" disabled={!reason || (reason === 'Lý do khác' && !detail.trim())} onClick={() => onSubmit(reason, detail.trim() || undefined)}>Gửi phản hồi</button></div>
    </div>
  </div>
}
