import dotenv from "dotenv";

dotenv.config({ path: '../.env' })

const LLM_API_URL = process.env['LLM_API_URL'];
const LLM_API_TOKEN = process.env['LLM_API_TOKEN'];

interface LLMGenerateResponse {
  text: string;
}

export async function generateLLMResponse(
  prompt: string
): Promise<LLMGenerateResponse> {
  const res = await fetch(`${LLM_API_URL}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': LLM_API_TOKEN || '',
    },
    body: JSON.stringify({prompt}),
  })
  return res.json();
}

interface LLMStreamEvent {
  type: 'text-delta' | 'reasoning-delta' | 'done' | 'error'
  data: string
}

export async function streamLLMResponse(
  prompt: string,
  onEvent: (event: LLMStreamEvent) => void
): Promise<void> {
  const response = await fetch(`${LLM_API_URL}/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/x-ndjson',
      'x-api-key': LLM_API_TOKEN || '',
    },
    body: JSON.stringify({ prompt }),
  })

  if (!response.ok) {
    throw new Error(`LLM API error: ${response.status} ${response.statusText}`)
  }

  if (!response.body) {
    throw new Error('No response body from LLM API')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        onEvent({ type: 'done', data: '' })
        break
      }

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter(line => line.trim())

      for (const line of lines) {
        try {
          const event = JSON.parse(line)
          if (event.type === 'text-delta') {
            onEvent({ type: 'text-delta', data: event.delta || '' })
          } else if (event.type === 'reasoning-delta') {
            onEvent({ type: 'reasoning-delta', data: event.delta || '' })
          } else if (event.type === 'error') {
            onEvent({ type: 'error', data: event.message || 'Unknown error' })
          }
        } catch (parseError) {
          console.error('[NDJSON PARSE ERROR]', parseError)
          // Continue processing other lines
        }
      }
    }
  } catch (error) {
    console.error('[STREAM ERROR]', error)
    onEvent({
      type: 'error',
      data: error instanceof Error ? error.message : 'Stream error'
    })
  } finally {
    reader.releaseLock()
  }
}
