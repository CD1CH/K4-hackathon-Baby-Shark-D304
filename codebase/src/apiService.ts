import type { ChatItem, TutorDocument } from './types'
import { getDocumentPage } from './data/documents'

const API_URL = 'http://localhost:8000/api/chat'

export async function askTutorAPI(
  messages: ChatItem[],
  document: TutorDocument,
  currentPage: number,
  onChunk?: (text: string) => void
): Promise<string> {
  const apiMessages = messages.map(msg => ({
    role: msg.role === 'tutor' ? 'assistant' : msg.role,
    content: msg.content
  }))

  const page = getDocumentPage(document, currentPage)
  const slideText = page.blocks.map(b => b.text).join('\n')

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: apiMessages,
        pdf_name: document.name,
        slide_text: slideText,
        current_page: currentPage
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    if (onChunk && response.body) {
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunkText = decoder.decode(value, { stream: true })
        fullText += chunkText
        onChunk(fullText)
      }
      return fullText
    } else {
      const text = await response.text()
      try {
        const data = JSON.parse(text)
        return data.text || 'Lỗi: Không nhận được phản hồi.'
      } catch {
        return text
      }
    }
  } catch (error) {
    console.error('Lỗi khi gọi API trợ giảng:', error)
    return 'Xin lỗi, hệ thống AI đang bận hoặc không thể kết nối. Vui lòng thử lại sau.'
  }
}
