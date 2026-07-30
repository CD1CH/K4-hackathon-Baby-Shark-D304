import { FileText } from 'lucide-react'

export function CitationButton({ page, onClick }: { page: number; onClick: (page: number) => void }) {
  return <button type="button" onClick={() => onClick(page)} className="inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-2 py-1 text-[11px] font-bold text-brand-700 transition hover:border-brand-400 hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-200" aria-label={`Đi đến trang ${page}`}><FileText size={12} /> [Trang {page}]</button>
}
