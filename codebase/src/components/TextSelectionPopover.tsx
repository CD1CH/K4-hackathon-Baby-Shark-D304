import { Bot, Copy, X } from 'lucide-react'

type Props = { onAsk: () => void; onCopy: () => void; onClear: () => void }

export function TextSelectionPopover({ onAsk, onCopy, onClear }: Props) {
  return (
    <div className="absolute -bottom-11 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 p-1.5 text-white shadow-floating" role="toolbar" aria-label="Thao tác đoạn chọn">
      <button type="button" className="selection-action bg-brand-600 hover:bg-brand-500" onClick={onAsk}><Bot size={14} /> Hỏi AI</button>
      <button type="button" className="selection-action" onClick={onCopy} aria-label="Sao chép"><Copy size={14} /></button>
      <button type="button" className="selection-action" onClick={onClear} aria-label="Bỏ chọn"><X size={14} /></button>
      <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-slate-700 bg-slate-900" />
    </div>
  )
}
