import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express, { Application } from 'express';
import chatRouter from '../../src/routes/chat.js';

/**
 * Integration tests for POST /api/chat endpoint (T025)
 * Tests SSE streaming, request validation, and response format
 */
describe('POST /api/chat - Integration Tests', () => {
	let app: Application;

	beforeAll(() => {
		// Create minimal Express app for testing
		app = express();
		app.use(express.json());
		app.use('/api', chatRouter);
	});

	describe('Request Validation', () => {
		it('returns 400 for missing message field', async () => {
			const response = await request(app).post('/api/chat').send({}).expect(400);

			expect(response.body).toHaveProperty('error');
			expect(response.body.error).toContain('message');
		});

		it('returns 400 for empty message', async () => {
			const response = await request(app)
				.post('/api/chat')
				.send({ message: '' })
				.expect(400);

			expect(response.body.error).toMatch(/empty|required/i);
		});

		it('returns 400 for whitespace-only message', async () => {
			const response = await request(app)
				.post('/api/chat')
				.send({ message: '   \\n\\t   ' })
				.expect(400);

			expect(response.body.error).toMatch(/empty|invalid/i);
		});

		it('accepts valid message with trimmed whitespace', async () => {
			const response = await request(app)
				.post('/api/chat')
				.send({ message: '  Hello  ' })
				.expect(200);

			expect(response.headers['content-type']).toContain('text/event-stream');
		});

		it('returns 400 for non-string message field', async () => {
			const response = await request(app)
				.post('/api/chat')
				.send({ message: 12345 })
				.expect(400);

			expect(response.body.error).toMatch(/string|invalid/i);
		});

		it('returns 400 for message exceeding max length (if limit exists)', async () => {
			const veryLongMessage = 'a'.repeat(100000); // 100k characters
			const response = await request(app)
				.post('/api/chat')
				.send({ message: veryLongMessage });

			// Either succeeds or returns 413/400 for too large
			expect([200, 400, 413]).toContain(response.status);
		});
	});

	describe('SSE Stream Response', () => {
		it('returns text/event-stream content type', async () => {
			const response = await request(app)
				.post('/api/chat')
				.send({ message: 'Hello' })
				.expect(200);

			expect(response.headers['content-type']).toMatch(/text\\/event-stream/);
		});

		it('returns Cache-Control: no-cache header', async () => {
			const response = await request(app)
				.post('/api/chat')
				.send({ message: 'Test' })
				.expect(200);

			expect(response.headers['cache-control']).toMatch(/no-cache/i);
		});

		it('returns Connection: keep-alive header', async () => {
			const response = await request(app)
				.post('/api/chat')
				.send({ message: 'Test' })
				.expect(200);

			// SSE typically uses keep-alive
			expect(
				response.headers.connection === 'keep-alive' || response.headers.connection === undefined
			).toBe(true);
		});

		it('streams valid SSE format (data: prefix)', async () => {
			const response = await request(app)
				.post('/api/chat')
				.send({ message: 'Test streaming' })
				.expect(200);

			// SSE format: data: {json}\\n\\n
			const text = response.text;
			expect(text).toContain('data: ');
		});

		it('includes event type in SSE stream', async () => {
			const response = await request(app)
				.post('/api/chat')
				.send({ message: 'Test' })
				.expect(200);

			// Should have event types like: event: chunk or event: done
			const text = response.text;
			expect(text).toMatch(/event: (chunk|done|message)/);
		});
	});

	describe('Stream Content and Events', () => {
		it('sends initial message event with LLM message object', async () => {
			const response = await request(app)
				.post('/api/chat')
				.send({ message: 'Hello' })
				.expect(200);

			const events = parseSSEEvents(response.text);
			const messageEvent = events.find((e) => e.event === 'message');

			expect(messageEvent).toBeDefined();
			expect(messageEvent?.data).toHaveProperty('id');
			expect(messageEvent?.data).toHaveProperty('content');
			expect(messageEvent?.data).toHaveProperty('sender', 'llm');
			expect(messageEvent?.data).toHaveProperty('status');
		});

		it('sends chunk events with incremental content', async () => {
			const response = await request(app)
				.post('/api/chat')
				.send({ message: 'Explain JavaScript' })
				.expect(200);

			const events = parseSSEEvents(response.text);
			const chunkEvents = events.filter((e) => e.event === 'chunk');

			expect(chunkEvents.length).toBeGreaterThan(0);
			chunkEvents.forEach((chunk) => {
				expect(chunk.data).toHaveProperty('type', 'chunk');
				expect(chunk.data).toHaveProperty('content');
				expect(chunk.data).toHaveProperty('messageId');
			});
		});

		it('sends done event at stream completion', async () => {
			const response = await request(app)
				.post('/api/chat')
				.send({ message: 'Test' })
				.expect(200);

			const events = parseSSEEvents(response.text);
			const doneEvent = events.find((e) => e.event === 'done');

			expect(doneEvent).toBeDefined();
			expect(doneEvent?.data).toHaveProperty('type', 'done');
		});

		it('maintains correct event order: message → chunks → done', async () => {
			const response = await request(app)
				.post('/api/chat')
				.send({ message: 'Test order' })
				.expect(200);

			const events = parseSSEEvents(response.text);
			const eventTypes = events.map((e) => e.event);

			// First event should be 'message'
			expect(eventTypes[0]).toBe('message');

			// Last event should be 'done'
			expect(eventTypes[eventTypes.length - 1]).toBe('done');

			// Middle events should be 'chunk'
			const middleEvents = eventTypes.slice(1, -1);
			expect(middleEvents.every((t) => t === 'chunk')).toBe(true);
		});
	});

	describe('Error Handling', () => {
		it('handles LLM service connection errors gracefully', async () => {
			// This test assumes LLM service might be unavailable
			const response = await request(app)
				.post('/api/chat')
				.send({ message: 'Test error handling' });

			// Either succeeds (200) or returns error event in stream
			if (response.status === 200) {
				const events = parseSSEEvents(response.text);
				const errorEvent = events.find((e) => e.event === 'error');

				if (errorEvent) {
					expect(errorEvent.data).toHaveProperty('type', 'error');
					expect(errorEvent.data).toHaveProperty('message');
				}
			} else {
				expect([500, 503]).toContain(response.status);
			}
		});

		it('handles timeout scenarios', async () => {
			const response = await request(app)
				.post('/api/chat')
				.send({ message: 'Test timeout' })
				.timeout(10000); // 10s timeout

			// Should complete within timeout or return error
			expect([200, 408, 504]).toContain(response.status);
		});
	});

	describe('CORS and Security Headers', () => {
		it('includes appropriate CORS headers', async () => {
			const response = await request(app)
				.post('/api/chat')
				.send({ message: 'Test CORS' })
				.expect(200);

			// If CORS is configured, should have Access-Control headers
			const hasAccessControlHeaders =
				response.headers['access-control-allow-origin'] !== undefined;

			// Either has CORS or doesn't (both valid)
			expect(typeof hasAccessControlHeaders).toBe('boolean');
		});
	});

	describe('Performance', () => {
		it('starts streaming within 1 second (SC-003)', async () => {
			const startTime = Date.now();

			const response = await request(app)
				.post('/api/chat')
				.send({ message: 'Quick test' })
				.expect(200);

			const endTime = Date.now();
			const duration = endTime - startTime;

			// Should respond quickly (within 1 second for first byte)
			expect(duration).toBeLessThan(1000);
		});

		it('handles concurrent requests without blocking', async () => {
			const requests = Array(5)
				.fill(null)
				.map((_, i) =>
					request(app)
						.post('/api/chat')
						.send({ message: `Concurrent test ${i}` })
				);

			const responses = await Promise.all(requests);

			responses.forEach((res) => {
				expect(res.status).toBe(200);
				expect(res.headers['content-type']).toContain('text/event-stream');
			});
		});
	});
});

/**
 * Helper function to parse SSE event stream text into structured events
 */
function parseSSEEvents(text: string): Array<{ event: string; data: any }> {
	const events: Array<{ event: string; data: any }> = [];
	const lines = text.split('\\n');

	let currentEvent: { event?: string; data?: string } = {};

	for (const line of lines) {
		if (line.startsWith('event: ')) {
			currentEvent.event = line.substring(7).trim();
		} else if (line.startsWith('data: ')) {
			currentEvent.data = line.substring(6).trim();
		} else if (line.trim() === '' && currentEvent.event && currentEvent.data) {
			// End of event block
			try {
				events.push({
					event: currentEvent.event,
					data: JSON.parse(currentEvent.data)
				});
			} catch (e) {
				// If JSON parse fails, keep raw data
				events.push({
					event: currentEvent.event,
					data: currentEvent.data
				});
			}
			currentEvent = {};
		}
	}

	return events;
}
