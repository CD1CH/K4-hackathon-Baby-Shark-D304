import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = { currentPage: number; totalPages: number; onChange: (page: number) => void }

export function PageNavigation({ currentPage, totalPages, onChange }: Props) {
  return (
    <div className="sticky bottom-4 z-20 mx-auto flex w-fit items-center gap-4 rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 shadow-floating backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
      <button type="button" className="icon-button" onClick={() => onChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} aria-label="Trang trước"><ChevronLeft size={18} /></button>
      <span className="min-w-24 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">Trang <strong className="text-slate-900 dark:text-white">{currentPage}</strong> / {totalPages}</span>
      <button type="button" className="icon-button" onClick={() => onChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} aria-label="Trang sau"><ChevronRight size={18} /></button>
    </div>
  )
}
