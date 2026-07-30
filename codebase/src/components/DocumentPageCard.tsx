import { CheckCircle2, FileSearch2 } from 'lucide-react'
import type { DocumentPage, SelectedText, TutorDocument } from '../types'
import { TextSelectionPopover } from './TextSelectionPopover'

type Props = {
  document: TutorDocument
  page: DocumentPage
  active: boolean
  zoom: number
  selectedText: SelectedText | null
  onActivate: (page: number) => void
  onSelect: (selected: SelectedText) => void
  onClear: () => void
  onAsk: () => void
  onCopy: (text: string) => void
}

const accents = {
  blue: 'from-brand-800 to-brand-600', violet: 'from-violet-800 to-indigo-600',
  cyan: 'from-cyan-800 to-cyan-600', amber: 'from-amber-700 to-orange-500',
  indigo: 'from-indigo-800 to-indigo-600'
}

export function DocumentPageCard({ document, page, active, zoom, selectedText, onActivate, onSelect, onClear, onAsk, onCopy }: Props) {
  const fallback = page.blocks[0]?.id.startsWith('fallback')
  return (
    <article id={`document-page-${page.pageNumber}`} className={`document-paper mx-auto transition ${active ? 'border-brand-300 ring-2 ring-brand-100 dark:ring-brand-950' : 'border-slate-200 dark:border-slate-700'}`} style={{ width: `${Math.min(100, Math.max(76, zoom * .92))}%` }} onClick={() => onActivate(page.pageNumber)}>
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 text-[11px] font-semibold text-slate-400 dark:border-slate-800 sm:px-7"><span>Trang {page.pageNumber} / {document.totalPages}</span><span className="max-w-[55%] truncate">{document.name}</span></div>
      <div className={`bg-gradient-to-r ${accents[page.accent]} px-6 py-7 text-white sm:px-9 sm:py-9`}>
        <div className="flex items-start justify-between gap-5">
          <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/70">{page.eyebrow}</p><h2 className="mt-3 max-w-2xl text-2xl font-extrabold leading-tight sm:text-3xl">{page.title}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">{page.subtitle}</p></div>
          <div className="hidden h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 sm:grid">{fallback ? <FileSearch2 size={24} /> : <CheckCircle2 size={24} />}</div>
        </div>
      </div>
      <div className="grid gap-4 p-5 sm:p-7">
        {page.blocks.map((block) => {
          const selected = selectedText?.documentId === document.id && selectedText.pageNumber === page.pageNumber && selectedText.blockId === block.id
          return (
            <div key={block.id} className="relative">
              <button type="button" className={`slide-block w-full text-left ${block.kind === 'quote' ? 'slide-block-quote' : ''} ${selected ? 'slide-block-selected' : ''}`} onClick={(event) => { event.stopPropagation(); onActivate(page.pageNumber); onSelect({ documentId: document.id, pageNumber: page.pageNumber, blockId: block.id, text: block.text }) }} aria-pressed={selected} title="Chọn đoạn này để hỏi AI">
                {block.heading && <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-100">{block.heading}</span>}
                {block.kind === 'code' ? <span className="block whitespace-pre-line rounded-xl bg-slate-900 px-4 py-3 font-mono text-[11px] leading-6 text-slate-100">{block.text}</span> : block.kind === 'steps' ? <span className="flex flex-wrap items-center gap-1.5 text-xs font-medium leading-6 text-slate-700 dark:text-slate-300">{block.text.split('→').map((step, index, all) => <span key={`${step}-${index}`} className="contents"><span className="rounded-lg bg-brand-50 px-2.5 py-1.5 dark:bg-slate-800">{step.trim()}</span>{index < all.length - 1 && <span className="text-brand-500">→</span>}</span>)}</span> : <span className="block text-sm leading-7 text-slate-600 dark:text-slate-300">{block.text}</span>}
              </button>
              {selected && <TextSelectionPopover onAsk={onAsk} onCopy={() => onCopy(block.text)} onClear={onClear} />}
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3 text-[10px] text-slate-400 dark:border-slate-800"><span>VINUNIVERSITY · AI THỰC CHIẾN</span><span>{String(page.pageNumber).padStart(2, '0')}</span></div>
    </article>
  )
}
