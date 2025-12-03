import type {ChatRequest} from "../../../../shared/types"

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function sendMessage(message:string): Promise<ChatRequest> {
  const abortController = new AbortController();

  try {
    const request: ChatRequest = {message}
    const response = await fetch(`${API_BASE_URL}/chat/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      console.error('API error:', error);
    }
    throw error;
  }
}

export interface StreamCallbacks {
  onStart?: () => void
  onTextStart?: () => void
  onTextDelta?: (content: string) => void
  onTextEnd?: () => void
  onReasoningStart?: () => void
  onReasoningDelta?: (content: string) => void
  onReasoningEnd?: () => void
  onFinish?: () => void
  onError?: (error: string) => void
}

export async function sendMessageStream(
  message: string,
  callbacks: StreamCallbacks
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    if (!response.body) {
      throw new Error('No response body')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n\n')
      buffer = lines.pop() || ''

      for (const eventBlock of lines) {
        if (!eventBlock.trim()) continue

        const eventLines = eventBlock.split('\n')
        let eventType = 'message'
        let eventData = ''

        for (const line of eventLines) {
          if (line.startsWith('event: ')) eventType = line.slice(7).trim()
          if (line.startsWith('data: ')) eventData = line.slice(6).trim()
        }

        try {
          const data = JSON.parse(eventData)

          switch (eventType) {
            case 'start':
              callbacks.onStart?.()
              break
            case 'text-start':
              callbacks.onTextStart?.()
              break
            case 'text-delta':
              callbacks.onTextDelta?.(data.content || '')
              break
            case 'text-end':
              callbacks.onTextEnd?.()
              break
            case 'reasoning-start':
              callbacks.onReasoningStart?.()
              break
            case 'reasoning-delta':
              callbacks.onReasoningDelta?.(data.content || '')
              break
            case 'reasoning-end':
              callbacks.onReasoningEnd?.()
              break
            case 'finish':
              callbacks.onFinish?.()
              return
            case 'error':
              callbacks.onError?.(data.error || 'Unknown error')
              return
          }
        } catch (parseError) {
          console.error('[SSE PARSE ERROR]', parseError)
        }
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Streaming error:', error)
      callbacks.onError?.(error.message)
    }
    throw error
  }
}