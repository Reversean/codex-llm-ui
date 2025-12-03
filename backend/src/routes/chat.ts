import { Router, Request, Response } from 'express'
import { ChatRequest } from '../../../shared/types'
import { generateLLMResponse, streamLLMResponse } from '../services/llm'

const router = Router()

function generateMessageId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

router.post('/generate', async (req: Request, res: Response) => {
  try {
    let {message,sessionId} = req.body as ChatRequest

    if (!message || message.trim() === '') {
      res.status(400).json({
        error: 'Message is required',
        code: 'INVALID_REQUEST',
        timestamp: Date.now(),
      })
      return
    }

    sessionId = sessionId || generateMessageId()

    const llmResponse = await generateLLMResponse(message)

    res.status(200).json({
      message: llmResponse.text,
      sessionId,
    })
  } catch (error) {
    console.error('[CHAT ERROR]', error)
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal Server Error',
      code: 'INTERNAL_ERROR',
      timestamp: Date.now(),
    })
  }
})

// Helper function for SSE events
function sendSSEEvent(res: Response, event: string, data: any): void {
  res.write(`event: ${event}\n`)
  res.write(`data: ${JSON.stringify(data)}\n\n`)
}

// Streaming endpoint
router.post('/stream', async (req: Request, res: Response) => {
  try {
    const { message } = req.body as ChatRequest

    if (!message || message.trim() === '') {
      res.status(400).json({
        error: 'Message is required',
        code: 'INVALID_REQUEST',
        timestamp: Date.now(),
      })
      return
    }

    // Setup SSE headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')

    const messageId = generateMessageId()

    // Send initial message event
    sendSSEEvent(res, 'message', {
      id: messageId,
      content: '',
      sender: 'llm',
      timestamp: Date.now(),
      status: 'streaming',
    })

    // Stream from LLM
    await streamLLMResponse(message, (event) => {
      switch (event.type) {
        case "start":
        case "reasoning-start":
        case "reasoning-end":
        case "text-start":
        case "text-end":
          sendSSEEvent(res, event.type, {
            type: event.type,
            messageId,
          })
          break
        case "reasoning-delta":
        case "text-delta":
          sendSSEEvent(res, event.type, {
            type: event.type,
            content: event.delta || '',
            messageId,
          })
          break
        case "finish":
          sendSSEEvent(res, event.type, {
            type: event.type,
            messageId,
          })
          res.end()
          break
      }
    })
  } catch (error) {
    console.error('[CHAT STREAM ERROR]', error)
    sendSSEEvent(res, 'error', {
      error: error instanceof Error ? error.message : 'Internal Server Error',
      code: 'INTERNAL_ERROR',
      timestamp: Date.now(),
    })
    res.end()
  }
})

export default router
