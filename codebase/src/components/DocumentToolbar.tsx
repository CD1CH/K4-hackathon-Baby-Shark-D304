import { Download, Expand, Highlighter, Minus, MousePointer2, PenLine, Plus, RotateCcw } from 'lucide-react'

export type ViewerTool = 'read' | 'pen' | 'highlight'
export type ViewMode = 'pdf' | 'cards'

type DocumentToolbarProps = {
  currentPage: number
  totalPages: number
  zoom: number
  activeTool: ViewerTool
  viewMode: ViewMode
  hasSelection: boolean
  onPageChange: (page: number) => void
  onToolChange: (tool: ViewerTool) => void
  onViewModeChange: (mode: ViewMode) => void
  onZoomChange: (zoom: number) => void
  onDownload: () => void
  onFullscreen: () => void
  onUndo: () => void
}

export function DocumentToolbar(props: DocumentToolbarProps) {
  const tools = [
    { id: 'read' as const, label: 'Đọc', icon: MousePointer2 },
    { id: 'pen' as const, label: 'Bút', icon: PenLine },
    { id: 'highlight' as const, label: 'Highlight', icon: Highlighter }
  ]

  return (
    <div className="z-20 flex min-h-[58px] items-center gap-2 border-b border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:px-4">
      <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => props.onViewModeChange('pdf')}
          className={`toolbar-mode ${props.viewMode === 'pdf' ? 'toolbar-mode-active bg-white text-brand-700 shadow-sm dark:bg-slate-800 dark:text-brand-300' : ''}`}
          title="Xem định dạng PDF gốc"
        >
          📄 <span className="font-bold">PDF Gốc (Chuẩn)</span>
        </button>
        <button
          type="button"
          onClick={() => props.onViewModeChange('cards')}
          className={`toolbar-mode ${props.viewMode === 'cards' ? 'toolbar-mode-active bg-white text-brand-700 shadow-sm dark:bg-slate-800 dark:text-brand-300' : ''}`}
          title="Xem dạng thẻ học liệu"
        >
          📝 <span>Thẻ Chữ (AI Reader)</span>
        </button>
      </div>
      {props.viewMode === 'cards' && (
        <div className="hidden items-center rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900 md:flex">
          {tools.map((tool) => {
            const Icon = tool.icon
            return <button key={tool.id} type="button" onClick={() => props.onToolChange(tool.id)} className={`toolbar-mode ${props.activeTool === tool.id ? 'toolbar-mode-active' : ''}`} aria-pressed={props.activeTool === tool.id} title={tool.label}><Icon size={16} /><span className="hidden 2xl:inline">{tool.label}</span></button>
          })}
        </div>
      )}
      <div className="flex items-center gap-1 rounded-xl border border-brand-200 bg-brand-50 px-2 py-1 text-xs font-bold text-brand-800 dark:border-brand-900 dark:bg-brand-950 dark:text-brand-200">
        <button
          type="button"
          onClick={() => props.onPageChange(Math.max(1, props.currentPage - 1))}
          disabled={props.currentPage <= 1}
          className="grid h-6 w-6 place-items-center rounded-md hover:bg-brand-100 disabled:opacity-30 dark:hover:bg-brand-900"
          title="Trang trước"
        >
          ◀
        </button>
        <span className="px-1 font-bold">Trang {props.currentPage} / {props.totalPages}</span>
        <button
          type="button"
          onClick={() => props.onPageChange(Math.min(props.totalPages, props.currentPage + 1))}
          disabled={props.currentPage >= props.totalPages}
          className="grid h-6 w-6 place-items-center rounded-md hover:bg-brand-100 disabled:opacity-30 dark:hover:bg-brand-900"
          title="Trang sau"
        >
          ▶
        </button>
      </div>
      <div className="ml-auto flex items-center rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
        <button type="button" className="toolbar-icon" onClick={() => props.onZoomChange(Math.max(70, props.zoom - 10))} disabled={props.zoom <= 70} aria-label="Thu nhỏ"><Minus size={16} /></button>
        <span className="min-w-14 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">{props.zoom}%</span>
        <button type="button" className="toolbar-icon" onClick={() => props.onZoomChange(Math.min(130, props.zoom + 10))} disabled={props.zoom >= 130} aria-label="Phóng to"><Plus size={16} /></button>
      </div>
      <button type="button" className="icon-button" onClick={props.onDownload} aria-label="Tải tài liệu" title="Tải xuống"><Download size={17} /></button>
      <button type="button" className="icon-button hidden sm:inline-flex" onClick={props.onFullscreen} aria-label="Toàn màn hình" title="Toàn màn hình"><Expand size={17} /></button>
      <button type="button" className="icon-button hidden sm:inline-flex" onClick={props.onUndo} disabled={!props.hasSelection} aria-label="Bỏ đoạn chọn" title="Quay lại thao tác"><RotateCcw size={17} /></button>
    </div>
  )
}
