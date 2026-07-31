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
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const isProgrammaticScroll = useRef(false)
  const scrollTimeoutRef = useRef<number | null>(null)
  const lastReportedPage = useRef<number>(props.currentPage)

  const onPageChangeRef = useRef(props.onPageChange)
  onPageChangeRef.current = props.onPageChange
  const currentPageRef = useRef(props.currentPage)
  currentPageRef.current = props.currentPage

  const pages = useMemo(() => {
    return Array.from({ length: props.document.totalPages }, (_, i) => getDocumentPage(props.document, i + 1))
  }, [props.document])

  useEffect(() => {
    const container = viewportRef.current
    if (!container) return

    const visibleRatios = new Map<number, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll.current) return

        entries.forEach((entry) => {
          const pageNum = Number(entry.target.getAttribute('data-page-number'))
          if (pageNum) {
            visibleRatios.set(pageNum, entry.intersectionRatio)
          }
        })

        let maxRatio = 0
        let mostVisiblePage = currentPageRef.current

        visibleRatios.forEach((ratio, pageNum) => {
          if (ratio > maxRatio) {
            maxRatio = ratio
            mostVisiblePage = pageNum
          }
        })

        if (maxRatio > 0.05 && mostVisiblePage !== currentPageRef.current) {
          lastReportedPage.current = mostVisiblePage
          onPageChangeRef.current(mostVisiblePage)
        }
      },
      {
        root: container,
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0]
      }
    )

    pageRefs.current.forEach((el) => observer.observe(el))

    return () => {
      observer.disconnect()
    }
  }, [props.document.id, pages])

  useEffect(() => {
    if (lastReportedPage.current === props.currentPage) return

    const targetEl = pageRefs.current.get(props.currentPage)
    if (targetEl && viewportRef.current) {
      isProgrammaticScroll.current = true
      lastReportedPage.current = props.currentPage

      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' })

      if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = window.setTimeout(() => {
        isProgrammaticScroll.current = false
      }, 600)
    }
  }, [props.currentPage])

  useEffect(() => {
    if (viewportRef.current) {
      isProgrammaticScroll.current = true
      viewportRef.current.scrollTo({ top: 0, behavior: 'instant' })
      lastReportedPage.current = 1
      if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = window.setTimeout(() => {
        isProgrammaticScroll.current = false
      }, 300)
    }
  }, [props.document.id])

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
          {pages.map((page) => (
            <div
              key={`${props.document.id}-${page.pageNumber}`}
              data-page-number={page.pageNumber}
              ref={(el) => {
                if (el) pageRefs.current.set(page.pageNumber, el)
                else pageRefs.current.delete(page.pageNumber)
              }}
            >
              <DocumentPageCard document={props.document} page={page} active={page.pageNumber === props.currentPage} zoom={props.zoom} selectedText={props.selectedText} onActivate={(pageNumber) => { if (pageNumber !== props.currentPage) props.onPageChange(pageNumber) }} onSelect={props.onSelectText} onClear={props.onClearSelection} onAsk={props.onAskSelected} onCopy={copy} />
            </div>
          ))}
        </div>
        <PageNavigation currentPage={props.currentPage} totalPages={props.document.totalPages} onChange={props.onPageChange} />
      </div>
    </div>
  )
}

