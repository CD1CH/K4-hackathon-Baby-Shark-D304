import { BookOpen, Check, ChevronDown, CirclePlay, FileText, Search, X } from 'lucide-react'
import type { DocumentGroupData } from '../types'

type SidebarProps = {
  groups: DocumentGroupData[]
  selectedId: string
  expandedGroups: Set<string>
  onToggleGroup: (id: string) => void
  onSelect: (id: string) => void
  onClose: () => void
}

export function Sidebar({ groups, selectedId, expandedGroups, onToggleGroup, onSelect, onClose }: SidebarProps) {
  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-950">
      <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand-100 bg-brand-50 text-brand-700 dark:border-brand-900 dark:bg-brand-950 dark:text-brand-200"><BookOpen size={20} /></span>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-slate-900 dark:text-white">Học liệu môn học</h2>
            <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">Chương, slide và tài liệu đã upload</p>
          </div>
          <button type="button" className="icon-button xl:hidden" onClick={onClose} aria-label="Đóng học liệu"><X size={17} /></button>
        </div>
        <label className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
          <Search size={15} className="text-slate-400" />
          <input type="search" className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200" placeholder="Tìm học liệu..." aria-label="Tìm học liệu" />
        </label>
      </div>

      <nav className="app-scrollbar flex-1 space-y-3 overflow-y-auto p-3" aria-label="Danh sách tài liệu">
        {groups.map((group) => {
          const expanded = expandedGroups.has(group.id)
          return (
            <section key={group.id} className={`rounded-2xl border transition ${expanded ? 'border-brand-200 bg-brand-50/35 dark:border-brand-900 dark:bg-brand-950/20' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}>
              <button type="button" onClick={() => onToggleGroup(group.id)} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60" aria-expanded={expanded}>
                <CirclePlay size={18} className="text-brand-700 dark:text-brand-300" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-slate-800 dark:text-slate-100">{group.name}</span>
                  <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[.12em] text-slate-400">{group.meta}</span>
                </span>
                <ChevronDown size={17} className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>

              {expanded && group.documents.length > 0 && (
                <div className="space-y-2 border-t border-brand-100 p-2.5 dark:border-brand-900/80">
                  {group.documents.map((document) => {
                    const active = document.id === selectedId
                    return (
                      <button key={document.id} type="button" onClick={() => onSelect(document.id)} className={`group relative w-full overflow-hidden rounded-xl border px-3 py-3 text-left transition ${active ? 'border-brand-300 bg-brand-50 shadow-sm dark:border-brand-700 dark:bg-brand-950/60' : 'border-slate-200 bg-white hover:border-brand-200 hover:bg-brand-50/50 dark:border-slate-800 dark:bg-slate-900'}`} aria-current={active ? 'page' : undefined}>
                        {active && <span className="absolute inset-y-0 left-0 w-1 bg-brand-700" />}
                        <span className="flex items-start gap-2.5">
                          <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg ${active ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-900' : 'bg-slate-50 text-slate-500 dark:bg-slate-800'}`}><FileText size={15} /></span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{document.shortName}</span>
                              {active && <span className="grid h-5 w-5 place-items-center rounded-full border border-brand-300 bg-white text-brand-700 dark:bg-slate-900"><Check size={11} strokeWidth={3} /></span>}
                            </span>
                            <span className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                              <span>{document.totalPages} trang</span>
                              {active && <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand-700 dark:bg-brand-900 dark:text-brand-200">Đang học</span>}
                            </span>
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
              {expanded && group.documents.length === 0 && <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-400 dark:border-slate-800">Tài liệu đã thu gọn trong prototype.</p>}
            </section>
          )
        })}
      </nav>
    </div>
  )
}
