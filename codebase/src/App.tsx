import { useEffect, useMemo, useRef, useState } from 'react'
import { AppLayout } from './components/AppLayout'
import { DocumentViewer } from './components/DocumentViewer'
import { FeedbackModal } from './components/FeedbackModal'
import { Sidebar } from './components/Sidebar'
import { Toast } from './components/Toast'
import { TopHeader } from './components/TopHeader'
import { TutorPanel } from './components/TutorPanel'
import { VoiceSettingsModal } from './components/VoiceSettingsModal'
import { documentGroups, documents } from './data/documents'
import type { ChatItem, SelectedText, Theme, ToastData } from './types'

const id = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

function App() {
  const [selectedDocumentId, setSelectedDocumentId] = useState('lecture-8')
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [selectedText, setSelectedText] = useState<SelectedText | null>(null)
  const [chatByDocument, setChatByDocument] = useState<Record<string, ChatItem[]>>({})
  const [isTyping, setIsTyping] = useState(false)
  const [feedbackTarget, setFeedbackTarget] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastData | null>(null)
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = window.localStorage.getItem('vlearn-theme')
    if (saved === 'dark' || saved === 'light') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [expandedGroups, setExpandedGroups] = useState(new Set(['slides']))
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tutorOpen, setTutorOpen] = useState(false)
  const [tutorExpanded, setTutorExpanded] = useState(false)
  const [autoTTS, setAutoTTS] = useState(true)
  const [voiceLang, setVoiceLang] = useState('vi-VN')
  const [voiceSpeed, setVoiceSpeed] = useState(1.0)
  
  // Voice Settings state
  const [voiceType, setVoiceType] = useState<'default' | 'cloned'>('default')
  const [voice, setVoice] = useState<'male' | 'female'>('female')
  const [voiceId, setVoiceId] = useState('')
  const [hasClonedVoice, setHasClonedVoice] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [readingMessageId, setReadingMessageId] = useState<string | null>(null)

  const activeAudioRef = useRef<HTMLAudioElement | null>(null)
  const cancelTTSRef = useRef<boolean>(false)
  const responseTimer = useRef<number | null>(null)
  const toastTimer = useRef<number | null>(null)

  const document = useMemo(() => documents.find((item) => item.id === selectedDocumentId) ?? documents[0], [selectedDocumentId])
  if (!document) throw new Error('Prototype cần ít nhất một tài liệu mock.')
  const messages = chatByDocument[document.id] ?? []

  useEffect(() => {
    window.document.documentElement.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem('vlearn-theme', theme)
  }, [theme])

  useEffect(() => () => {
    if (responseTimer.current) window.clearTimeout(responseTimer.current)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
  }, [])

  useEffect(() => {
    const handleSpeechEnd = () => {
      cancelTTSRef.current = true;
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
      setReadingMessageId(null);
    };
    window.addEventListener('speech-end', handleSpeechEnd);
    return () => window.removeEventListener('speech-end', handleSpeechEnd);
  }, []);

  const notify = (message: string, tone: ToastData['tone'] = 'success') => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    setToast({ id: Date.now(), message, tone })
    toastTimer.current = window.setTimeout(() => setToast(null), 2800)
  }

  const append = (documentId: string, message: ChatItem) => setChatByDocument((state) => ({ ...state, [documentId]: [...(state[documentId] ?? []), message] }))

  const ask = async (question: string, mode: 'normal' | 'simple' | 'current-page-only' = 'normal', addUser = true, _options?: { isVoice?: boolean; lang?: string }) => {
    if (!question.trim() || isTyping) return
    const sourceDocument = document
    const sourcePage = currentPage
    const currentDocumentMessages = messages
    
    const userMessage: ChatItem = {
      id: id(),
      role: 'user',
      content: question,
      timestamp: new Date(),
      sourcePage
    }
    
    if (addUser) append(sourceDocument.id, userMessage)
    
    setIsTyping(true)
    
    try {
      const { askTutorAPI } = await import('./apiService')
      
      let finalMessages = [...currentDocumentMessages]
      if (addUser) finalMessages.push(userMessage)
      
      if (selectedText) {
        finalMessages.push({
          id: 'temp-selection',
          role: 'user',
          content: `Vui lòng tập trung giải thích đoạn này: "${selectedText.text}"`,
          timestamp: new Date(),
          sourcePage
        })
      }
      
      const tutorMessageId = id()
      append(sourceDocument.id, {
        id: tutorMessageId,
        role: 'tutor',
        content: '',
        citations: [sourcePage],
        timestamp: new Date(),
        answerMode: mode,
        sourcePage
      })
      
      const apiResponseText = await askTutorAPI(finalMessages, sourceDocument, sourcePage, (fullText) => {
        updateMessage(tutorMessageId, { content: fullText })
      })
      
      updateMessage(tutorMessageId, { content: apiResponseText })
      
      if (autoTTS) {
        setReadingMessageId(tutorMessageId);
        playAudioQueue(apiResponseText).finally(() => {
          setReadingMessageId(current => current === tutorMessageId ? null : current);
        });
      }
    } catch (e) {
      notify('Lỗi kết nối tới AI Tutor.', 'error')
    } finally {
      setIsTyping(false)
    }
  }

  const questionFor = (message: ChatItem) => {
    const position = messages.findIndex((item) => item.id === message.id)
    for (let cursor = position - 1; cursor >= 0; cursor -= 1) if (messages[cursor]?.role === 'user') return messages[cursor]?.content ?? 'Giải thích nội dung này'
    return 'Giải thích nội dung này'
  }

  const selectDocument = (documentId: string) => {
    if (documentId === document.id) { setSidebarOpen(false); return }
    setSelectedDocumentId(documentId); setCurrentPage(1); setZoom(100); setSelectedText(null); setSidebarOpen(false)
    notify('Đã chuyển tài liệu. Lịch sử riêng được giữ lại.', 'info')
  }

  const changePage = (page: number) => {
    const safePage = Math.min(document.totalPages, Math.max(1, page))
    setCurrentPage(safePage)
    if (selectedText?.pageNumber !== safePage) setSelectedText(null)
  }

  const selectSource = (documentId: string, page: number) => {
    const nextDocument = documents.find((item) => item.id === documentId) ?? document
    setSelectedDocumentId(nextDocument.id)
    setCurrentPage(Math.min(nextDocument.totalPages, Math.max(1, page)))
    setSelectedText(null)
    notify(`Đã mở ${nextDocument.shortName} · Trang ${page}.`, 'info')
  }

  const playAudioQueue = async (text: string) => {
    cancelTTSRef.current = true;
    if (activeAudioRef.current) activeAudioRef.current.pause();
    window.speechSynthesis.cancel();

    if (voiceType !== 'cloned') {
      await new Promise<void>((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = voiceLang;
        utterance.rate = voiceSpeed;
        utterance.onend = () => {
          resolve();
        };
        utterance.onerror = () => {
          resolve();
        };
        window.speechSynthesis.speak(utterance);
      });
      return;
    }

    await new Promise(r => setTimeout(r, 50));
    cancelTTSRef.current = false;

    const chunks = text.match(/[^.?!;:\n]+[.?!;:\n]+/g) || [text];
    const validChunks = chunks.map(c => c.trim()).filter(c => c.length > 0);
    
    if (validChunks.length === 0) {
      window.dispatchEvent(new Event('speech-end'));
      return;
    }

    const fetchAudio = async (chunkText: string) => {
      try {
        const res = await fetch('http://localhost:8000/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: chunkText,
            lang: voiceLang.includes('en') ? 'en' : 'vi',
            voice,
            voice_id: voiceType === 'cloned' ? voiceId : null
          })
        });
        if (res.ok) return await res.blob();
      } catch (e) {
        console.error(e);
      }
      return null;
    };

    let nextBlobPromise = fetchAudio(validChunks[0]);

    for (let i = 0; i < validChunks.length; i++) {
      if (cancelTTSRef.current) break;

      const currentBlob = await nextBlobPromise;
      if (i + 1 < validChunks.length) {
        nextBlobPromise = fetchAudio(validChunks[i + 1]);
      }

      if (!currentBlob || cancelTTSRef.current) continue;

      const url = URL.createObjectURL(currentBlob);
      const audio = new Audio(url);
      activeAudioRef.current = audio;

      await new Promise<void>((resolve) => {
        audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
        audio.onerror = () => { URL.revokeObjectURL(url); resolve(); };
        if (!cancelTTSRef.current) {
           audio.play().catch(() => resolve());
        } else {
           URL.revokeObjectURL(url);
           resolve();
        }
      });
    }

    if (!cancelTTSRef.current) {
      window.dispatchEvent(new Event('speech-end'));
    }
  }

  const updateMessage = (messageId: string, patch: Partial<ChatItem>) => setChatByDocument((state) => ({
    ...state,
    [document.id]: (state[document.id] ?? []).map((message) => message.id === messageId ? { ...message, ...patch } : message)
  }))

  const submitFeedback = (reason: string, detail?: string) => {
    if (!feedbackTarget) return
    updateMessage(feedbackTarget, { feedback: { type: 'dislike', reason, detail } })
    setFeedbackTarget(null); notify('Cảm ơn bạn. Phản hồi đã được ghi nhận.')
  }

  return <>
    <AppLayout
      sidebarOpen={sidebarOpen}
      tutorOpen={tutorOpen}
      tutorExpanded={tutorExpanded}
      onClosePanels={() => { setSidebarOpen(false); setTutorOpen(false) }}
      header={<TopHeader document={document} theme={theme} onToggleTheme={() => setTheme((value) => value === 'light' ? 'dark' : 'light')} onOpenSidebar={() => setSidebarOpen(true)} onOpenTutor={() => setTutorOpen(true)} />}
      sidebar={<Sidebar groups={documentGroups} selectedId={document.id} expandedGroups={expandedGroups} onToggleGroup={(groupId) => setExpandedGroups((state) => { const next = new Set(state); next.has(groupId) ? next.delete(groupId) : next.add(groupId); return next })} onSelect={selectDocument} onClose={() => setSidebarOpen(false)} />}
      viewer={<DocumentViewer document={document} currentPage={currentPage} zoom={zoom} selectedText={selectedText} onPageChange={changePage} onZoomChange={setZoom} onSelectText={(selection) => { setSelectedText(selection); setCurrentPage(selection.pageNumber) }} onClearSelection={() => setSelectedText(null)} onAskSelected={() => { setTutorOpen(true); ask('Giải thích đoạn vừa chọn') }} onNotify={notify} />}
      tutor={<TutorPanel document={document} documents={documents} currentPage={currentPage} selectedText={selectedText} messages={messages} isTyping={isTyping} expanded={tutorExpanded} onToggleExpanded={() => setTutorExpanded((value) => !value)} onClose={() => setTutorOpen(false)} onClearChat={() => { if (!messages.length) notify('Tài liệu này chưa có lịch sử.', 'info'); else { setChatByDocument((state) => ({ ...state, [document.id]: [] })); notify('Đã xóa lịch sử tài liệu hiện tại.') } }} onClearSelection={() => setSelectedText(null)} onSelectSource={selectSource} onSend={(question, options) => ask(question, 'normal', true, options)} onCitation={(page) => { changePage(page); setTutorOpen(false); notify(`Đã mở nguồn tại Trang ${page}.`, 'info') }} onSimplify={(message) => ask(questionFor(message), 'simple', false)} onPageOnly={(message) => ask(questionFor(message), 'current-page-only', false)} onCopy={async (message) => { await navigator.clipboard.writeText(message.content); notify('Đã sao chép câu trả lời.') }} onLike={(message) => { updateMessage(message.id, { feedback: { type: 'like' } }); notify('Cảm ơn bạn đã phản hồi.') }} onDislike={(message) => setFeedbackTarget(message.id)} onNotify={notify} autoTTS={autoTTS} onToggleAutoTTS={() => setAutoTTS(v => { const next = !v; if (!next && activeAudioRef.current) { activeAudioRef.current.pause(); } else if (next && activeAudioRef.current) { activeAudioRef.current.play().catch(console.error); } return next; })} voiceLang={voiceLang} onChangeVoiceLang={setVoiceLang} voiceSpeed={voiceSpeed} onChangeVoiceSpeed={setVoiceSpeed} onOpenSettings={() => setIsSettingsOpen(true)} readingMessageId={readingMessageId} onStopRead={() => {
        cancelTTSRef.current = true;
        if (activeAudioRef.current) activeAudioRef.current.pause();
        window.speechSynthesis.cancel();
        setReadingMessageId(null);
      }} onReadMessage={async (messageId, text) => {
        setReadingMessageId(messageId);
        await playAudioQueue(text);
        setReadingMessageId(current => current === messageId ? null : current);
      }} />}
    />
    <FeedbackModal isOpen={Boolean(feedbackTarget)} onClose={() => setFeedbackTarget(null)} onSubmit={submitFeedback} />
    <Toast toast={toast} onClose={() => setToast(null)} />
    <VoiceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        voiceType={voiceType} setVoiceType={setVoiceType}
        voice={voice} setVoice={setVoice}
        voiceId={voiceId} setVoiceId={setVoiceId}
        hasClonedVoice={hasClonedVoice} setHasClonedVoice={setHasClonedVoice}
        language={voiceLang.includes('en') ? 'en' : 'vi'}
      />
  </>
}

export default App
