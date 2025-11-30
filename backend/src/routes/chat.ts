import {Router, Request, Response} from 'express'
import {ChatRequest} from "../../../shared/types"
import {generateLLMResponse} from "../services/llm"

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

export default router
