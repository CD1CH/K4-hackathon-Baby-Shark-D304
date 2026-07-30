import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'
import type { ToastData } from '../types'

export function Toast({ toast, onClose }: { toast: ToastData | null; onClose: () => void }) {
  if (!toast) return null
  const Icon = toast.tone === 'warning' ? TriangleAlert : toast.tone === 'info' ? Info : CheckCircle2
  return <div className="fixed bottom-5 left-1/2 z-[90] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-floating animate-toast-in dark:border-slate-700 dark:bg-slate-900" role="status"><Icon size={18} className={toast.tone === 'warning' ? 'text-amber-600' : toast.tone === 'info' ? 'text-brand-600' : 'text-emerald-600'} /><p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{toast.message}</p><button type="button" className="ml-1 rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={onClose} aria-label="Đóng thông báo"><X size={14} /></button></div>
}
