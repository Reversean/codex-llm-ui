import { Router } from 'express';
import type { ChatRequest, StreamChunk } from '../../../shared/types.js';
import { mockLLMResponse } from '../services/llm.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { message } = req.body as ChatRequest;

    if (!message || message.trim() === '') {
      res.status(400).json({
        error: 'Message is required',
        code: 'INVALID_REQUEST',
        timestamp: Date.now(),
      });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    try {
      for await (const chunk of mockLLMResponse(message)) {
        const streamChunk: StreamChunk = {
          type: chunk.type,
          content: chunk.content,
          messageId,
        };

        res.write(`data: ${JSON.stringify(streamChunk)}\n\n`);

        if (chunk.type === 'done') {
          break;
        }
      }

      res.end();
    } catch (streamError) {
      const errorChunk: StreamChunk = {
        type: 'error',
        content: streamError instanceof Error ? streamError.message : 'Stream error occurred',
        messageId,
      };

      res.write(`data: ${JSON.stringify(errorChunk)}\n\n`);
      res.end();
    }
  } catch (error) {
    console.error('[CHAT ERROR]', error);

    if (!res.headersSent) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal Server Error',
        code: 'INTERNAL_ERROR',
        timestamp: Date.now(),
      });
    } else {
      res.end();
    }
  }
});

export default router;
