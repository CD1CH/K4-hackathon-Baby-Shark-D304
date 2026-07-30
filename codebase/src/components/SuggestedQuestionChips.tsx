import { Lightbulb } from 'lucide-react'

type Props = { questions: string[]; disabled?: boolean; onSelect: (question: string) => void }

export function SuggestedQuestionChips({ questions, disabled, onSelect }: Props) {
  return <div><p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-slate-400"><Lightbulb size={13} /> Hỏi nhanh</p><div className="flex flex-wrap gap-2">{questions.map((question) => <button key={question} type="button" onClick={() => onSelect(question)} disabled={disabled} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-[11px] font-semibold text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-brand-700 dark:hover:bg-brand-950">{question}</button>)}</div></div>
}
