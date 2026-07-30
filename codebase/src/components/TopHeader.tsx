import { BookOpen, ChevronLeft, Menu, Moon, PanelRightOpen, Sun } from 'lucide-react'
import type { Theme, TutorDocument } from '../types'

type TopHeaderProps = {
  document: TutorDocument
  theme: Theme
  onToggleTheme: () => void
  onOpenSidebar: () => void
  onOpenTutor: () => void
}

export function TopHeader({ document, theme, onToggleTheme, onOpenSidebar, onOpenTutor }: TopHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:px-5">
      <button type="button" className="icon-button hidden sm:inline-flex" aria-label="Quay lại" title="Quay lại">
        <ChevronLeft size={20} />
      </button>
      <button type="button" className="icon-button xl:hidden" onClick={onOpenSidebar} aria-label="Mở danh sách tài liệu" title="Học liệu">
        <Menu size={20} />
      </button>

      <div className="flex shrink-0 items-center gap-2.5">
        <div className="vlearn-mark" aria-hidden="true"><span /><span /></div>
        <span className="hidden text-xl font-extrabold tracking-tight text-brand-900 dark:text-white sm:block"><span className="text-rose-600">V</span>Learn</span>
      </div>
      <div className="hidden h-8 w-px bg-slate-200 dark:bg-slate-800 sm:block" />

      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <div className="hidden h-9 w-9 shrink-0 place-items-center rounded-xl border border-brand-100 bg-brand-50 text-brand-700 md:grid dark:border-brand-900 dark:bg-brand-950 dark:text-brand-200"><BookOpen size={18} /></div>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-bold text-slate-900 dark:text-white sm:text-base">{document.name}</h1>
          <p className="mt-0.5 hidden truncate text-xs text-slate-500 dark:text-slate-400 sm:block">{document.breadcrumb}</p>
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <button type="button" className="header-pill" aria-label="Đổi ngôn ngữ" title="Ngôn ngữ">VI</button>
        <button type="button" className="icon-button" onClick={onToggleTheme} aria-label={theme === 'light' ? 'Bật nền tối' : 'Bật nền sáng'} title={theme === 'light' ? 'Nền tối' : 'Nền sáng'}>
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <button type="button" className="icon-button xl:hidden" onClick={onOpenTutor} aria-label="Mở VLearn Tutor" title="Tutor"><PanelRightOpen size={18} /></button>
        <button type="button" className="ml-0.5 grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-700 text-xs font-bold text-white ring-2 ring-brand-100 dark:ring-brand-900" aria-label="Tài khoản">NH</button>
      </div>
    </header>
  )
}
