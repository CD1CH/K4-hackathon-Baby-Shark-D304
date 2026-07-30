import { useEffect, useMemo, useRef, useState } from 'react'
import { getDocumentPage } from '../data/documents'
import type { SelectedText, TutorDocument } from '../types'
import { DocumentPageCard } from './DocumentPageCard'
import { DocumentToolbar, type ViewerTool } from './DocumentToolbar'
import { PageNavigation } from './PageNavigation'

type Props = {
  document: TutorDocument
  currentPage: number
  zoom: number
  selectedText: SelectedText | null
  onPageChange: (page: number) => void
  onZoomChange: (zoom: number) => void
  onSelectText: (selection: SelectedText) => void
  onClearSelection: () => void
  onAskSelected: () => void
  onNotify: (message: string) => void
}

export function DocumentViewer(props: Props) {
  const [activeTool, setActiveTool] = useState<ViewerTool>('read')
  const viewportRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<HTMLDivElement>(null)
  const pages = useMemo(() => {
    const result = [getDocumentPage(props.document, props.currentPage)]
    if (props.currentPage < props.document.totalPages) result.push(getDocumentPage(props.document, props.currentPage + 1))
    return result
  }, [props.document, props.currentPage])

  useEffect(() => {
    viewportRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [props.currentPage, props.document.id])

  const download = () => {
    const url = URL.createObjectURL(new Blob([`Prototype: ${props.document.name}`], { type: 'text/plain' }))
    const anchor = window.document.createElement('a'); anchor.href = url; anchor.download = `${props.document.shortName}-prototype.txt`; anchor.click(); URL.revokeObjectURL(url)
    props.onNotify('Đã tạo bản tải xuống mô phỏng.')
  }

  const copy = async (text: string) => { await navigator.clipboard.writeText(text); props.onNotify('Đã sao chép đoạn được chọn.') }

  return (
    <div ref={viewerRef} className="flex h-[calc(100dvh-64px)] min-w-0 flex-col bg-[#edf2f8] dark:bg-slate-900">
      <DocumentToolbar currentPage={props.currentPage} totalPages={props.document.totalPages} zoom={props.zoom} activeTool={activeTool} hasSelection={Boolean(props.selectedText)} onToolChange={setActiveTool} onZoomChange={props.onZoomChange} onDownload={download} onFullscreen={async () => window.document.fullscreenElement ? window.document.exitFullscreen() : viewerRef.current?.requestFullscreen()} onUndo={props.onClearSelection} />
      <div ref={viewportRef} className="panel-scroll min-h-0 flex-1 overflow-y-scroll px-3 py-5 sm:px-6">
        <div className="mx-auto max-w-[980px] space-y-7 pb-6">
          {pages.map((page) => <DocumentPageCard key={`${props.document.id}-${page.pageNumber}`} document={props.document} page={page} active={page.pageNumber === props.currentPage} zoom={props.zoom} selectedText={props.selectedText} onActivate={(pageNumber) => { if (pageNumber !== props.currentPage) props.onPageChange(pageNumber) }} onSelect={props.onSelectText} onClear={props.onClearSelection} onAsk={props.onAskSelected} onCopy={copy} />)}
        </div>
        <PageNavigation currentPage={props.currentPage} totalPages={props.document.totalPages} onChange={props.onPageChange} />
      </div>
    </div>
  )
}
