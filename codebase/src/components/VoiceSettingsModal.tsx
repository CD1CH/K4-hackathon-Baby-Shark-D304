import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Mic, Square, Play, Trash2, RotateCw } from 'lucide-react'
import { recordingToWavBase64 } from '../utils/wav'

const MIN_CLONE_SECONDS = 5
const MAX_CLONE_SECONDS = 15
const CLONE_SCRIPTS = {
  vi: 'Tôi đang ghi âm một đoạn ngắn để ứng dụng học giọng nói của tôi. Tôi thích đi du lịch chậm rãi, gặp gỡ người dân địa phương và tìm món ăn ngon.',
  en: 'I am recording a short sample so the app can learn my voice. I like to travel slowly, meet local people, and find good food.'
}

type Props = {
  isOpen: boolean
  onClose: () => void
  voiceType: 'default' | 'cloned'
  setVoiceType: (t: 'default' | 'cloned') => void
  voice: 'male' | 'female'
  setVoice: (v: 'male' | 'female') => void
  voiceId: string
  setVoiceId: (id: string) => void
  hasClonedVoice: boolean
  setHasClonedVoice: (v: boolean) => void
  language: string
}

export function VoiceSettingsModal({
  isOpen, onClose, voiceType, setVoiceType, voice, setVoice,
  voiceId, setVoiceId, hasClonedVoice, setHasClonedVoice, language
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [cloneState, setCloneState] = useState<'idle'|'recording'|'uploading'|'error'|'done'>(hasClonedVoice ? 'done' : 'idle')
  const [elapsed, setElapsed] = useState(0)
  const [cloneError, setCloneError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startedAtRef = useRef(0)
  const discardRef = useRef(false)
  
  const scriptText = language === 'en' ? CLONE_SCRIPTS.en : CLONE_SCRIPTS.vi

  useEffect(() => {
    if (isOpen && hasClonedVoice) setCloneState('done')
  }, [isOpen, hasClonedVoice])

  const stopRecorder = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    } else {
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  useEffect(() => {
    return () => stopRecorder()
  }, [stopRecorder])

  if (!isOpen) return null

  const startRecording = async () => {
    setCloneError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      discardRef.current = false

      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data)
      }
      
      recorder.onstop = () => {
        streamRef.current?.getTracks().forEach(t => t.stop())
        if (discardRef.current) return
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        encodeAndSend(blob)
      }

      recorder.start()
      startedAtRef.current = Date.now()
      setElapsed(0)
      setCloneState('recording')
      
      timerRef.current = setInterval(() => {
        const secs = (Date.now() - startedAtRef.current) / 1000
        setElapsed(secs)
        if (secs >= MAX_CLONE_SECONDS) stopRecorder()
      }, 100)
    } catch (err) {
      setCloneError('Không thể truy cập Microphone.')
      setCloneState('error')
    }
  }

  const encodeAndSend = async (blob: Blob) => {
    setCloneState('uploading')
    try {
      const wav = await recordingToWavBase64(blob, { maxSeconds: MAX_CLONE_SECONDS })
      if (wav.durationSec < MIN_CLONE_SECONDS) {
        setCloneError('Đoạn ghi âm quá ngắn, hãy đọc hết câu.')
        setCloneState('error')
        return
      }

      const res = await fetch('http://localhost:8000/api/voice/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: wav.base64, ref_text: scriptText })
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      
      setVoiceId(data.voice_id)
      setHasClonedVoice(true)
      setCloneState('done')
    } catch (err) {
      setCloneError('Lỗi tạo giọng nói. Vui lòng thử lại.')
      setCloneState('error')
    }
  }

  const cancelRecording = () => {
    discardRef.current = true
    stopRecorder()
    setCloneState(hasClonedVoice ? 'done' : 'idle')
  }

  const playTest = async () => {
    setIsPlaying(true)
    const text = language === 'en' ? 'Hello, this is a test voice.' : 'Xin chào, đây là giọng nói thử nghiệm.'
    
    if (voiceType === 'default') {
      window.speechSynthesis.cancel()
      await new Promise(r => setTimeout(r, 50))
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language === 'en' ? 'en-US' : 'vi-VN'
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => setIsPlaying(false)
      window.speechSynthesis.speak(utterance)
      return
    }

    try {
      const res = await fetch('http://localhost:8000/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          lang: language === 'en' ? 'en' : 'vi',
          voice: voice,
          voice_id: voiceId
        })
      })
      if (!res.ok) { setIsPlaying(false); return }
      const blob = await res.blob()
      if (blob.size < 100) { setIsPlaying(false); return }
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.onended = () => { URL.revokeObjectURL(url); setIsPlaying(false) }
      audio.onerror = () => { URL.revokeObjectURL(url); setIsPlaying(false) }
      audio.play()
    } catch (e) {
      setIsPlaying(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Cài đặt Giọng nói AI</h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={20}/></button>
        </div>

        <div className="mb-6 flex gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button onClick={() => setVoiceType('default')} className={`flex-1 rounded-lg py-2 text-sm font-medium ${voiceType === 'default' ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-700 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400'}`}>Giọng mặc định</button>
          <button onClick={() => setVoiceType('cloned')} className={`flex-1 rounded-lg py-2 text-sm font-medium ${voiceType === 'cloned' ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-700 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400'}`}>Giọng Clone của tôi</button>
        </div>

        {voiceType === 'default' ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              Hệ thống sẽ sử dụng giọng nói mặc định của thiết bị. Giọng đọc sẽ tự động thay đổi theo ngôn ngữ của tài liệu.
            </div>
            <button onClick={playTest} disabled={isPlaying} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-50 py-3 text-sm font-bold text-brand-700 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400">
              <Play size={16}/> {isPlaying ? 'Đang phát...' : 'Nghe thử'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cloneState === 'idle' && (
              <div className="space-y-4 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">Ghi âm khoảng 10 giây giọng nói của bạn, AI sẽ học và trả lời bằng chính giọng của bạn.</p>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-sm italic dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">"{scriptText}"</div>
                <button onClick={startRecording} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-bold text-white hover:bg-brand-700"><Mic size={16}/> Bắt đầu thiết lập</button>
              </div>
            )}
            
            {cloneState === 'recording' && (
              <div className="space-y-4 text-center">
                <div className="flex items-center justify-center gap-3 text-2xl font-bold text-rose-600">
                  <span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500"></span></span>
                  {elapsed.toFixed(1)}s <span className="text-sm font-normal text-slate-500">/ {MAX_CLONE_SECONDS}s</span>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-sm italic dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">"{scriptText}"</div>
                <button onClick={stopRecorder} disabled={elapsed < MIN_CLONE_SECONDS} className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white ${elapsed < MIN_CLONE_SECONDS ? 'bg-slate-400' : 'bg-brand-600 hover:bg-brand-700'}`}><Square size={16}/> Hoàn tất & Tạo giọng</button>
                <button onClick={cancelRecording} className="text-sm text-slate-500 hover:text-slate-700">Hủy</button>
              </div>
            )}

            {cloneState === 'uploading' && (
              <div className="py-8 text-center text-sm font-medium text-slate-600">
                <RotateCw className="mx-auto mb-3 h-8 w-8 animate-spin text-brand-600"/> Đang khởi tạo giọng nói của bạn...
              </div>
            )}

            {cloneState === 'error' && (
              <div className="space-y-4 text-center">
                <p className="text-sm text-rose-600">{cloneError}</p>
                <button onClick={startRecording} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-bold text-white hover:bg-brand-700"><Mic size={16}/> Ghi âm lại</button>
                <button onClick={() => setCloneState(hasClonedVoice ? 'done' : 'idle')} className="text-sm text-slate-500 hover:text-slate-700">Hủy</button>
              </div>
            )}

            {cloneState === 'done' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-900/50 dark:bg-brand-900/20">
                  <div className="rounded-full bg-brand-100 p-2 text-brand-600 dark:bg-brand-900 dark:text-brand-400"><Mic size={24}/></div>
                  <div><p className="font-bold text-brand-900 dark:text-brand-100">Giọng Clone của tôi</p><p className="text-xs text-brand-600 dark:text-brand-400">Đã sẵn sàng sử dụng</p></div>
                </div>
                <button onClick={playTest} disabled={isPlaying} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-50 py-3 text-sm font-bold text-brand-700 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400">
                  <Play size={16}/> {isPlaying ? 'Đang phát...' : 'Nghe thử'}
                </button>
                <div className="flex gap-2">
                  <button onClick={() => setCloneState('idle')} className="flex-1 rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Thu âm lại</button>
                  <button onClick={() => { setVoiceId(''); setHasClonedVoice(false); setVoiceType('default'); setCloneState('idle') }} className="rounded-xl border border-rose-200 py-2 px-4 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-900/20"><Trash2 size={16}/></button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
