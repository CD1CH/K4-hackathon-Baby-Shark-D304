import { useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import type { SelectedText, TutorDocument } from '../types'
import { DocumentToolbar, type ViewerTool } from './DocumentToolbar'
import { PageNavigation } from './PageNavigation'

// Setup pdf.js worker using public folder file (most robust method)
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

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
  const [pdfError, setPdfError] = useState<Error | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  
  // Biến tạm để tránh vòng lặp vô tận khi tự động cuộn
  const isAutoScrolling = useRef(false)

  // Intersection Observer to detect which page is on screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isAutoScrolling.current) return;
        
        let visiblePages = entries.filter(e => e.isIntersecting)
        if (visiblePages.length > 0) {
          // Lấy trang chiếm nhiều diện tích nhất
          const mostVisible = visiblePages.reduce((prev, current) => 
            (prev.intersectionRatio > current.intersectionRatio) ? prev : current
          )
          
          const pageNum = Number(mostVisible.target.getAttribute('data-page-number'))
          if (pageNum && pageNum !== props.currentPage) {
            props.onPageChange(pageNum)
          }
        }
      },
      {
        root: containerRef.current,
        threshold: [0.1, 0.4, 0.6, 0.9], 
      }
    )

    const currentRefs = pageRefs.current
    currentRefs.forEach((node) => observer.observe(node))

    return () => {
      currentRefs.forEach((node) => observer.unobserve(node))
      observer.disconnect()
    }
  }, [props.currentPage, props.onPageChange]) // Phụ thuộc vào currentPage để lấy state mới nhất

  // Scroll to page when props.currentPage changes (e.g. Next/Prev button)
  useEffect(() => {
    const targetNode = pageRefs.current.get(props.currentPage)
    if (targetNode && containerRef.current) {
      const rect = targetNode.getBoundingClientRect()
      const containerRect = containerRef.current.getBoundingClientRect()
      
      const isVisible = (
        rect.top >= containerRect.top - 100 &&
        rect.bottom <= containerRect.bottom + 100
      )
      
      if (!isVisible) {
        isAutoScrolling.current = true
        targetNode.scrollIntoView({ behavior: 'smooth', block: 'start' })
        
        // Mở khóa observer sau khi cuộn xong (ước tính 800ms)
        setTimeout(() => {
          isAutoScrolling.current = false
        }, 800)
      }
    }
  }, [props.currentPage, props.document.id])

  const download = () => {
    const url = `/slides/${props.document.name}`
    const anchor = window.document.createElement('a'); anchor.href = url; anchor.download = props.document.name; anchor.click()
    props.onNotify('Đã tải xuống tài liệu.')
  }

  const pdfUrl = `/slides/${props.document.name}`

  return (
    <div ref={viewerRef} className="flex h-[calc(100dvh-64px)] min-w-0 flex-col bg-[#edf2f8] dark:bg-slate-900 relative">
      <DocumentToolbar currentPage={props.currentPage} totalPages={props.document.totalPages} zoom={props.zoom} activeTool={activeTool} hasSelection={Boolean(props.selectedText)} onToolChange={setActiveTool} onZoomChange={props.onZoomChange} onDownload={download} onFullscreen={async () => window.document.fullscreenElement ? window.document.exitFullscreen() : viewerRef.current?.requestFullscreen()} onUndo={props.onClearSelection} />
      <div ref={containerRef} className="panel-scroll min-h-0 flex-1 overflow-y-auto relative pb-32">
        <div className="mx-auto flex flex-col items-center gap-8 py-8 px-4">
          <Document 
            file={pdfUrl} 
            loading={<div className="p-10 text-slate-500 font-medium">Đang tải PDF...</div>}
            error={<div className="p-10 text-red-500 font-medium max-w-lg break-words">Lỗi tải PDF: {pdfError?.message || "Không xác định"}</div>}
            onLoadError={(err) => { console.error("PDF Load Error:", err); setPdfError(err); }}
            onLoadSuccess={() => {
              // Re-attach observers when document loads and renders
              setTimeout(() => {
                const currentRefs = pageRefs.current
                if (currentRefs.size > 0 && containerRef.current) {
                  const event = new Event('scroll');
                  containerRef.current.dispatchEvent(event);
                }
              }, 1000)
            }}
          >
            {Array.from(new Array(props.document.totalPages), (_, index) => (
              <div 
                key={`page_${index + 1}`} 
                ref={(el) => {
                  if (el) pageRefs.current.set(index + 1, el)
                  else pageRefs.current.delete(index + 1)
                }}
                data-page-number={index + 1}
                className={`bg-white transition-all duration-300 mb-8 mx-auto ${props.currentPage === index + 1 ? 'ring-4 ring-brand-500 shadow-xl' : 'ring-1 ring-slate-200 shadow-sm dark:ring-slate-700'}`}
              >
                <Page 
                  pageNumber={index + 1} 
                  scale={props.zoom / 100}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  loading={<div className="h-[800px] flex items-center justify-center text-slate-400 text-sm">Đang vẽ trang {index + 1}...</div>}
                />
              </div>
            ))}
          </Document>
        </div>
      </div>
      
      <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
          <div className="pointer-events-auto shadow-lg rounded-full">
            <PageNavigation currentPage={props.currentPage} totalPages={props.document.totalPages} onChange={props.onPageChange} />
          </div>
      </div>
    </div>
  )
}

