import { CheckCircle2, FileText, Highlighter, X } from 'lucide-react'
import type { SelectedText, TutorDocument } from '../types'

type Props = { document: TutorDocument; currentPage: number; selectedText: SelectedText | null; onClear: () => void }

export function TutorContextCard({ document, currentPage, selectedText, onClear }: Props) {
  return (
    <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300"><FileText size={14} className="shrink-0 text-brand-600" /><span className="truncate">{document.name}</span></span>
        <span className="shrink-0 rounded-full border border-brand-200 bg-white px-2 py-1 text-[10px] font-bold text-brand-700 dark:border-brand-800 dark:bg-slate-950 dark:text-brand-200">Trang {currentPage}</span>
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300"><CheckCircle2 size={12} /> Câu trả lời được khóa vào nguồn hiện tại</p>
      {selectedText && <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/40">
        <div className="flex items-center justify-between"><span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300"><Highlighter size={13} /> Đoạn đang chọn</span><button type="button" className="rounded-md p-1 text-amber-700 hover:bg-amber-100 dark:text-amber-300" onClick={onClear} aria-label="Xóa đoạn chọn"><X size={13} /></button></div>
        <p className="mt-1.5 line-clamp-3 text-[11px] leading-5 text-amber-950 dark:text-amber-100">“{selectedText.text}”</p>
      </div>}
    </div>
  )
}
