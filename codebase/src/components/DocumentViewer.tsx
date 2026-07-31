import { ChevronDown, ChevronUp, MessageSquare, Send, User } from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { getDocumentPage } from '../data/documents'
import type { SelectedText, TutorDocument } from '../types'
import { DocumentPageCard } from './DocumentPageCard'
import { DocumentToolbar, type ViewerTool } from './DocumentToolbar'

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

interface PageComment {
  id: string
  author: string
  role: string
  text: string
  time: string
}

export function DocumentViewer(props: Props) {
  const [activeTool, setActiveTool] = useState<ViewerTool>('read')
  const [viewMode, setViewMode] = useState<'pdf' | 'cards'>('pdf')
  const viewportRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<HTMLDivElement>(null)
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const isProgrammaticScroll = useRef(false)
  const scrollTimeoutRef = useRef<number | null>(null)
  const lastReportedPage = useRef<number>(props.currentPage)
  const lastWheelTime = useRef<number>(0)

  // Comments state mapped per page number
  const [commentsByPage, setCommentsByPage] = useState<Record<number, PageComment[]>>({
    1: [{ id: 'c1', author: 'Học viên K4', role: 'Học viên', text: 'Slide tổng quan phần AI & LLM Foundation rất rõ ràng!', time: '10:15' }],
    4: [
      { id: 'c2', author: 'Minh Hoàng', role: 'Trợ giảng', text: 'Chú ý: LLM là engine chung của cả Generative AI và Agentic AI.', time: '11:05' },
      { id: 'c4', author: 'Thu Trang', role: 'Học viên', text: 'Thầy cho em hỏi thêm về sự khác nhau giữa Agentic AI và LLM ạ?', time: '11:12' },
      { id: 'c5', author: 'Trợ giảng AI', role: 'AI Tutor', text: 'Agentic AI có khả năng tự lên kế hoạch (Plan) và sử dụng công cụ (Tools) vượt xa LLM thuần túy.', time: '11:13' }
    ],
    17: [{ id: 'c3', author: 'Phạm Tiến Hùng', role: 'Học viên', text: 'Khái niệm Tham số (parameter) là các khớp nối thần kinh mô hình học được.', time: '11:30' }]
  })

  const [inputComments, setInputComments] = useState<Record<number, string>>({})
  const [expandedCommentsPage, setExpandedCommentsPage] = useState<Record<number, boolean>>({})

  const onPageChangeRef = useRef(props.onPageChange)
  onPageChangeRef.current = props.onPageChange
  const currentPageRef = useRef(props.currentPage)
  currentPageRef.current = props.currentPage

  const pages = useMemo(() => {
    return Array.from({ length: props.document.totalPages }, (_, i) => getDocumentPage(props.document, i + 1))
  }, [props.document])

  // Mouse wheel scroll handler for PDF mode
  const handlePdfWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (viewMode !== 'pdf') return
    const now = Date.now()
    if (now - lastWheelTime.current < 280) return

    if (e.deltaY > 15) {
      if (props.currentPage < props.document.totalPages) {
        lastWheelTime.current = now
        props.onPageChange(props.currentPage + 1)
      }
    } else if (e.deltaY < -15) {
      if (props.currentPage > 1) {
        lastWheelTime.current = now
        props.onPageChange(props.currentPage - 1)
      }
    }
  }

  // Keyboard navigation listener (Arrow keys / PageUp / PageDown)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (props.currentPage < props.document.totalPages) {
          e.preventDefault()
          props.onPageChange(props.currentPage + 1)
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (props.currentPage > 1) {
          e.preventDefault()
          props.onPageChange(props.currentPage - 1)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [props.currentPage, props.document.totalPages, props.onPageChange])

  // Scroll listener for updating currentPage in real-time
  const handleScroll = () => {
    if (isProgrammaticScroll.current) return
    const container = viewportRef.current
    if (!container) return

    const containerTop = container.getBoundingClientRect().top + 50
    let minDistance = Infinity
    let closestPage = currentPageRef.current

    pageRefs.current.forEach((el, pageNum) => {
      const rect = el.getBoundingClientRect()
      const distance = Math.abs(rect.top - containerTop)
      if (distance < minDistance) {
        minDistance = distance
        closestPage = pageNum
      }
    })

    if (closestPage !== currentPageRef.current) {
      lastReportedPage.current = closestPage
      onPageChangeRef.current(closestPage)
    }
  }

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
      }, 700)
    }
  }, [props.currentPage])

  useEffect(() => {
    if (viewportRef.current) {
      isProgrammaticScroll.current = true
      viewportRef.current.scrollTo({ top: 0, behavior: 'instant' })
      lastReportedPage.current = props.currentPage
      if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = window.setTimeout(() => {
        isProgrammaticScroll.current = false
      }, 400)
    }
  }, [props.document.id, viewMode])

  const handleAddComment = (pageNum: number) => {
    const text = inputComments[pageNum]?.trim()
    if (!text) return

    const newComment: PageComment = {
      id: `${Date.now()}`,
      author: 'Bạn (Học viên)',
      role: 'Học viên',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setCommentsByPage((prev) => ({
      ...prev,
      [pageNum]: [...(prev[pageNum] ?? []), newComment]
    }))

    setInputComments((prev) => ({ ...prev, [pageNum]: '' }))
    props.onNotify(`Đã thêm bình luận mới cho Trang ${pageNum}!`)
  }

  const download = () => {
    const url = `/slides/${props.document.name}`
    const anchor = window.document.createElement('a'); anchor.href = url; anchor.download = props.document.name; anchor.click()
    props.onNotify('Đã khởi chạy tải tệp slide PDF gốc.')
  }

  const copy = async (text: string) => { await navigator.clipboard.writeText(text); props.onNotify('Đã sao chép đoạn được chọn.') }

  return (
    <div ref={viewerRef} className="flex h-[calc(100dvh-64px)] min-w-0 flex-col bg-[#edf2f8] dark:bg-slate-900">
      <DocumentToolbar
        currentPage={props.currentPage}
        totalPages={props.document.totalPages}
        zoom={props.zoom}
        activeTool={activeTool}
        viewMode={viewMode}
        hasSelection={Boolean(props.selectedText)}
        onPageChange={props.onPageChange}
        onToolChange={setActiveTool}
        onViewModeChange={setViewMode}
        onZoomChange={props.onZoomChange}
        onDownload={download}
        onFullscreen={async () => window.document.fullscreenElement ? window.document.exitFullscreen() : viewerRef.current?.requestFullscreen()}
        onUndo={props.onClearSelection}
      />
      <div
        ref={viewportRef}
        onScroll={handleScroll}
        onWheel={handlePdfWheel}
        className="panel-scroll min-h-0 flex-1 overflow-y-scroll scroll-smooth snap-y snap-mandatory px-3 py-4 sm:px-6"
      >
        {viewMode === 'pdf' ? (
          <div className="mx-auto flex w-full max-w-[1100px] flex-col space-y-8 pb-8">
            {pages.map((page) => {
              const pageComments = commentsByPage[page.pageNumber] ?? []
              const currentInput = inputComments[page.pageNumber] ?? ''
              const isExpanded = expandedCommentsPage[page.pageNumber] ?? false

              return (
                <div
                  key={`pdf-independent-${props.document.id}-${page.pageNumber}`}
                  data-page-number={page.pageNumber}
                  ref={(el) => {
                    if (el) pageRefs.current.set(page.pageNumber, el)
                    else pageRefs.current.delete(page.pageNumber)
                  }}
                  className="snap-start snap-always flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition dark:border-slate-800 dark:bg-slate-950"
                >
                  {/* Top Bar for each page card */}
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      📄 <span className="font-bold text-brand-700 dark:text-brand-300">Trang {page.pageNumber} / {props.document.totalPages}</span>
                    </span>
                    <span className="truncate max-w-[50%] text-slate-400">{props.document.name}</span>
                  </div>

                  {/* 100% Fit Widescreen 16:9 Single Slide Container - Cắt khít chuẩn 370px - 410px */}
                  <div className="relative h-[370px] sm:h-[390px] md:h-[410px] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <iframe
                      src={`/slides/${props.document.name}#page=${page.pageNumber}&navpanes=0&toolbar=0&view=FitH`}
                      className="h-[370px] sm:h-[390px] md:h-[410px] w-full border-none pointer-events-none"
                      title={`Slide Trang ${page.pageNumber}`}
                    />
                  </div>

                  {/* Bottom Section: Mục Bình luận & Ghi chú cho Trang X */}
                  <div className="border-t border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60 sm:p-5">
                    <div className="flex items-center justify-between">
                      <h4 className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <MessageSquare size={15} className="text-brand-600 dark:text-brand-400" />
                        <span>Bình luận & Ghi chú bài giảng (Trang {page.pageNumber})</span>
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                          {pageComments.length} thảo luận
                        </span>
                        {pageComments.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setExpandedCommentsPage((prev) => ({ ...prev, [page.pageNumber]: !isExpanded }))}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-sm transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-brand-600"
                            title={isExpanded ? 'Thu gọn danh sách bình luận' : 'Mở rộng tất cả bình luận'}
                          >
                            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            <span>{isExpanded ? 'Thu gọn' : 'Mở rộng'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Comments List: Dynamic height based on Expanded state */}
                    <div className={`mt-3 space-y-2 overflow-y-auto pr-1 transition-all ${isExpanded ? 'max-h-72' : 'max-h-24'}`}>
                      {pageComments.length > 0 ? (
                        pageComments.map((comment) => (
                          <div key={comment.id} className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                                <User size={12} className="text-slate-400" />
                                {comment.author}
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">{comment.role}</span>
                              </span>
                              <span className="text-[10px] text-slate-400">{comment.time}</span>
                            </div>
                            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{comment.text}</p>
                          </div>
                        ))
                      ) : (
                        <p className="py-2 text-center text-xs text-slate-400">Chưa có bình luận nào cho trang này. Hãy gửi ghi chú đầu tiên!</p>
                      )}
                    </div>

                    {/* Comment Input */}
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="text"
                        value={currentInput}
                        onChange={(e) => setInputComments((prev) => ({ ...prev, [page.pageNumber]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(page.pageNumber) }}
                        placeholder={`Nhập bình luận hoặc ghi chú cho Trang ${page.pageNumber}...`}
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddComment(page.pageNumber)}
                        disabled={!currentInput.trim()}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-40 dark:bg-brand-500 dark:hover:bg-brand-600"
                      >
                        <Send size={13} />
                        <span className="hidden sm:inline">Gửi</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <>
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
                  <DocumentPageCard
                    document={props.document}
                    page={page}
                    active={page.pageNumber === props.currentPage}
                    zoom={props.zoom}
                    selectedText={props.selectedText}
                    onActivate={(pageNumber) => { if (pageNumber !== props.currentPage) props.onPageChange(pageNumber) }}
                    onSelect={props.onSelectText}
                    onClear={props.onClearSelection}
                    onAsk={props.onAskSelected}
                    onCopy={copy}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
