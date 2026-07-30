import { Check, ChevronDown, FileText, Layers3, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { TutorDocument } from '../types'

type SourcePickerProps = {
  documents: TutorDocument[]
  documentId: string
  currentPage: number
  onSelect: (documentId: string, page: number) => void
}

export function SourcePicker({ documents, documentId, currentPage, onSelect }: SourcePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [draftDocumentId, setDraftDocumentId] = useState(documentId)
  const [draftPage, setDraftPage] = useState(currentPage)

  const currentDocument = documents.find((item) => item.id === documentId) ?? documents[0]
  const draftDocument = documents.find((item) => item.id === draftDocumentId) ?? documents[0]

  useEffect(() => {
    if (!isOpen) {
      setDraftDocumentId(documentId)
      setDraftPage(currentPage)
    }
  }, [currentPage, documentId, isOpen])

  const handleDocumentChange = (id: string) => {
    setDraftDocumentId(id)
    setDraftPage(1)
  }

  const handleApply = () => {
    onSelect(draftDocumentId, draftPage)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className={`inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition ${
          isOpen
            ? 'border-brand-500 bg-brand-50 text-brand-700'
            : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-brand-700'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Layers3 size={13} />
        <span className="truncate">{currentDocument.name.replace('.pdf', '')}</span>
        <span className="shrink-0 text-slate-400">· Trang {currentPage}</span>
        <ChevronDown size={12} className={`shrink-0 transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Chọn tài liệu và trang"
          className="absolute bottom-full left-0 z-40 mb-2 w-[min(340px,calc(100vw-48px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          <div className="flex items-start justify-between border-b border-slate-100 px-4 py-3.5">
            <div>
              <p className="text-sm font-bold text-ink">Chọn tài liệu & trang</p>
              <p className="mt-0.5 text-[11px] text-slate-400">AI Tutor sẽ sử dụng nguồn bạn chọn.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
              aria-label="Đóng bộ chọn nguồn"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Tài liệu</p>
            <div className="space-y-1.5">
              {documents.map((item) => {
                const isSelected = draftDocumentId === item.id

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleDocumentChange(item.id)}
                    className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-xs font-semibold transition ${
                      isSelected
                        ? 'border-blue-200 bg-brand-50 text-brand-700'
                        : 'border-transparent text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <FileText size={15} className={isSelected ? 'text-brand-600' : 'text-slate-400'} />
                    <span className="flex-1 truncate">{item.name}</span>
                    {isSelected && <Check size={14} />}
                  </button>
                )
              })}
            </div>

            <div className="my-4 h-px bg-slate-100" />

            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Trang slide</p>
            <div className="app-scrollbar grid max-h-32 grid-cols-6 gap-2 overflow-y-auto pr-1">
              {draftDocument.pages.map((_, index) => {
                const page = index + 1
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setDraftPage(page)}
                    className={`rounded-lg border py-2 text-xs font-bold transition ${
                      draftPage === page
                        ? 'border-brand-600 bg-brand-600 text-white shadow-sm shadow-blue-200'
                        : 'border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-blue-50'
                    }`}
                    aria-label={`Chọn trang ${page}`}
                  >
                    {page}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-3">
            <span className="text-[11px] text-slate-400">{draftDocument.shortName} · Trang {draftPage}</span>
            <button
              type="button"
              onClick={handleApply}
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-700"
            >
              Chọn nguồn này
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
