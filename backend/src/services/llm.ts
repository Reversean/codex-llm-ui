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

type LLMStreamEventType =
  'start' |
  'text-start' |
  'text-delta' |
  'text-end' |
  'reasoning-start' |
  'reasoning-delta' |
  'reasoning-end' |
  'finish'

interface LLMStreamEvent {
  type: LLMStreamEventType
  delta?: string | null
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
        break
      }

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter(line => line.trim())

      for (const line of lines) {
        try {
          const event: LLMStreamEvent = JSON.parse(line)
          onEvent(event)
        } catch (error) {
          console.error('[NDJSON PARSE ERROR]', error)
        }
      }
    }
  } catch (error) {
    console.error('[STREAM ERROR]', error)
    throw error
  } finally {
    reader.releaseLock()
  }
}
