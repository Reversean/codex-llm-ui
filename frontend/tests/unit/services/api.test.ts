import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sendMessage, healthCheck } from '$lib/services/api';
import type { StreamChunk } from '../../../../shared/types';

describe('API Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('sendMessage', () => {
    it('should handle successful SSE stream with content chunks', async () => {
      const chunks: StreamChunk[] = [];
      const mockChunks = [
        { type: 'chunk' as const, content: 'Hello ', messageId: 'msg-1' },
        { type: 'chunk' as const, content: 'World', messageId: 'msg-1' },
        { type: 'done' as const, content: '', messageId: 'msg-1' },
      ];

      const mockBody = new ReadableStream({
        start(controller) {
          mockChunks.forEach((chunk) => {
            const sseData = `data: ${JSON.stringify(chunk)}\n\n`;
            controller.enqueue(new TextEncoder().encode(sseData));
          });
          controller.close();
        },
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: mockBody,
      });

      await sendMessage(
        'test message',
        (chunk) => chunks.push(chunk),
      );

      expect(chunks).toHaveLength(3);
      expect(chunks[0]).toEqual(mockChunks[0]);
      expect(chunks[1]).toEqual(mockChunks[1]);
      expect(chunks[2]).toEqual(mockChunks[2]);
    });

    it('should handle reasoning chunks', async () => {
      const chunks: StreamChunk[] = [];
      const mockChunks = [
        { type: 'reasoning' as const, content: 'Thinking...', messageId: 'msg-1' },
        { type: 'chunk' as const, content: 'Answer', messageId: 'msg-1' },
        { type: 'done' as const, content: '', messageId: 'msg-1' },
      ];

      const mockBody = new ReadableStream({
        start(controller) {
          mockChunks.forEach((chunk) => {
            const sseData = `data: ${JSON.stringify(chunk)}\n\n`;
            controller.enqueue(new TextEncoder().encode(sseData));
          });
          controller.close();
        },
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: mockBody,
      });

      await sendMessage('test', (chunk) => chunks.push(chunk));

      expect(chunks).toHaveLength(3);
      expect(chunks[0].type).toBe('reasoning');
      expect(chunks[0].content).toBe('Thinking...');
    });

    it('should handle error chunks from API', async () => {
      const chunks: StreamChunk[] = [];
      const errorChunk = {
        type: 'error' as const,
        content: 'API Error occurred',
        messageId: 'msg-1',
      };

      const mockBody = new ReadableStream({
        start(controller) {
          const sseData = `data: ${JSON.stringify(errorChunk)}\n\n`;
          controller.enqueue(new TextEncoder().encode(sseData));
          controller.close();
        },
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: mockBody,
      });

      await sendMessage('test', (chunk) => chunks.push(chunk));

      expect(chunks).toHaveLength(1);
      expect(chunks[0].type).toBe('error');
    });

    it('should handle API HTTP errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const onError = vi.fn();

      await expect(
        sendMessage('test', () => {}, onError),
      ).rejects.toThrow('API error: 500 Internal Server Error');

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'API error: 500 Internal Server Error',
        }),
      );
    });

    it('should handle missing response body', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: null,
      });

      const onError = vi.fn();

      await expect(
        sendMessage('test', () => {}, onError),
      ).rejects.toThrow('No response body');

      expect(onError).toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const onError = vi.fn();

      await expect(
        sendMessage('test', () => {}, onError),
      ).rejects.toThrow('Network error');

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Network error',
        }),
      );
    });

    it('should stop reading after done chunk', async () => {
      const chunks: StreamChunk[] = [];
      const mockChunks = [
        { type: 'chunk' as const, content: 'Hello', messageId: 'msg-1' },
        { type: 'done' as const, content: '', messageId: 'msg-1' },
        { type: 'chunk' as const, content: 'Should not appear', messageId: 'msg-1' },
      ];

      const mockBody = new ReadableStream({
        start(controller) {
          mockChunks.forEach((chunk) => {
            const sseData = `data: ${JSON.stringify(chunk)}\n\n`;
            controller.enqueue(new TextEncoder().encode(sseData));
          });
          controller.close();
        },
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: mockBody,
      });

      await sendMessage('test', (chunk) => chunks.push(chunk));

      expect(chunks).toHaveLength(2);
      expect(chunks[chunks.length - 1].type).toBe('done');
    });

    it('should send correct request payload', async () => {
      const mockBody = new ReadableStream({
        start(controller) {
          const chunk = { type: 'done' as const, content: '', messageId: 'msg-1' };
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(chunk)}\n\n`));
          controller.close();
        },
      });

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        body: mockBody,
      });
      global.fetch = mockFetch;

      await sendMessage('Hello LLM', () => {});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: 'Hello LLM' }),
        }),
      );
    });
  });

  describe('healthCheck', () => {
    it('should return health status on success', async () => {
      const mockHealth = {
        status: 'ok',
        timestamp: Date.now(),
        uptime: 100,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockHealth,
      });

      const result = await healthCheck();

      expect(result).toEqual(mockHealth);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
      );
    });

    it('should throw error on failed health check', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      });

      await expect(healthCheck()).rejects.toThrow('Health check failed: 503');
    });
  });
});
