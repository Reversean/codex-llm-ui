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

export async function sendMessageStream(
  message: string,
  callbacks: {
    onTextDelta: (content: string) => void
    onReasoningDelta: (content: string) => void
    onDone: () => void
    onError: (error: string) => void
  }
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
            case 'text-delta':
              callbacks.onTextDelta(data.content || '')
              break
            case 'reasoning-delta':
              callbacks.onReasoningDelta(data.content || '')
              break
            case 'done':
              callbacks.onDone()
              return
            case 'error':
              callbacks.onError(data.error || 'Unknown error')
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
      callbacks.onError(error.message)
    }
    throw error
  }
}