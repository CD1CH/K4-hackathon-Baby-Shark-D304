import { CornerDownLeft, Send, Sparkles, Mic, MicOff, Globe } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export type VoiceOptions = { isVoice?: boolean; lang?: string }
type Props = { disabled?: boolean; hasSelection: boolean; onSend: (question: string, options?: VoiceOptions) => void; onNotify?: (message: string, tone?: 'success' | 'error' | 'info') => void; voiceLang: string; onChangeVoiceLang: (lang: string) => void; voiceSpeed: number; onChangeVoiceSpeed: (speed: number) => void }

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function TutorInput({ disabled, hasSelection, onSend, onNotify, voiceLang, onChangeVoiceLang, voiceSpeed, onChangeVoiceSpeed }: Props) {
  const [value, setValue] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [hasSupport, setHasSupport] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setHasSupport(true)
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = voiceLang;
          
          recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setIsListening(false);
            if (transcript.trim()) {
               onSend(transcript.trim(), { isVoice: true, lang: voiceLang });
            }
          };

          recognitionRef.current.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            if (event.error === 'not-allowed') {
              onNotify?.('Trình duyệt đang chặn Micro. Vui lòng cấp quyền trên thanh địa chỉ (URL) để sử dụng giọng nói.', 'error');
            } else if (event.error !== 'no-speech') {
              onNotify?.(`Lỗi giọng nói: ${event.error}`, 'error');
            }
            setIsListening(false);
          };

          recognitionRef.current.onend = () => {
            setIsListening(false);
          };

          recognitionRef.current.start();
          setIsListening(true);
        }
      } catch (e) {
        console.error(e);
        setIsListening(false);
      }
    }
  };

  const send = () => { const question = value.trim(); if (!question || disabled) return; onSend(question); setValue('') }
  return <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
    {hasSelection && <p className="mb-2 flex items-center gap-1.5 text-[10px] font-medium text-amber-700 dark:text-amber-300"><Sparkles size={12} /> Tutor ưu tiên giải thích đoạn đang chọn</p>}
    <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900">
      <textarea value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send() } }} rows={1} disabled={disabled} className="app-scrollbar max-h-32 min-h-10 flex-1 resize-none bg-transparent px-1.5 py-2 text-sm leading-5 text-slate-800 outline-none focus:ring-0 focus:border-transparent border-0 placeholder:text-slate-400 dark:text-slate-100" style={{ boxShadow: 'none' }} placeholder="Nhập câu hỏi hoặc bôi đen tài liệu..." aria-label="Nhập câu hỏi" />
      {hasSupport && (
        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <select 
            value={voiceLang} 
            onChange={(e) => onChangeVoiceLang(e.target.value)}
            disabled={disabled || isListening}
            className="bg-transparent text-xs font-medium text-slate-600 outline-none cursor-pointer dark:text-slate-300 pr-1"
            title="Ngôn ngữ nhận diện & Đọc"
          >
            <option value="vi-VN">VN</option>
            <option value="en-US">EN</option>
            <option value="zh-CN">CN</option>
          </select>
          <div className="w-px h-3 bg-slate-200 dark:bg-slate-700 mx-0.5"></div>
          <select 
            value={voiceSpeed} 
            onChange={(e) => onChangeVoiceSpeed(Number(e.target.value))}
            disabled={disabled}
            className="bg-transparent text-xs font-medium text-slate-600 outline-none cursor-pointer dark:text-slate-300 pr-1"
            title="Tốc độ đọc"
          >
            <option value={0.5}>0.5x</option>
            <option value={0.75}>0.75x</option>
            <option value={1.0}>1x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
            <option value={2.0}>2x</option>
          </select>
          <button type="button" onClick={toggleListening} disabled={disabled} className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition ${isListening ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'} disabled:cursor-not-allowed disabled:opacity-50`} aria-label="Giọng nói">
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
        </div>
      )}
      <button type="button" onClick={send} disabled={!value.trim() || disabled} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-700 text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700" aria-label="Gửi câu hỏi"><Send size={17} /></button>
    </div>
    <p className="mt-1.5 flex items-center justify-center gap-1 text-[9px] text-slate-400"><CornerDownLeft size={10} /> Enter để gửi · Shift + Enter để xuống dòng</p>
  </div>
}
