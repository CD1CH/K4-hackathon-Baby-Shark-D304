import type { ReactNode } from 'react'

type AppLayoutProps = {
  header: ReactNode
  sidebar: ReactNode
  viewer: ReactNode
  tutor: ReactNode
  sidebarOpen: boolean
  tutorOpen: boolean
  tutorExpanded: boolean
  onClosePanels: () => void
}

export function AppLayout({ header, sidebar, viewer, tutor, sidebarOpen, tutorOpen, tutorExpanded, onClosePanels }: AppLayoutProps) {
  return (
    <div className="min-h-dvh bg-canvas text-ink dark:bg-slate-950 dark:text-slate-100">
      {header}
      <div className={`app-grid min-h-[calc(100dvh-64px)] ${tutorExpanded ? 'app-grid--expanded' : ''}`}>
        <aside className={`fixed inset-y-0 left-0 z-50 w-[286px] -translate-x-[105%] border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-950 xl:static xl:z-auto xl:w-auto xl:translate-x-0 ${sidebarOpen ? 'translate-x-0' : ''}`} aria-label="Danh sách học liệu">
          {sidebar}
        </aside>
        <main className="min-w-0">{viewer}</main>
        <aside className={`fixed inset-y-0 right-0 z-50 w-full translate-x-[105%] bg-white transition-transform dark:bg-slate-950 sm:w-[420px] xl:static xl:z-auto xl:w-auto xl:translate-x-0 ${tutorOpen ? 'translate-x-0' : ''}`} aria-label="VLearn Tutor">
          {tutor}
        </aside>
      </div>
      {(sidebarOpen || tutorOpen) && <button type="button" className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[1px] xl:hidden" onClick={onClosePanels} aria-label="Đóng bảng điều khiển" />}
    </div>
  )
}
