import type { ChatRequest, StreamChunk } from '../../../../shared/types.js';

/*
 * API Client
 * Handles communication with the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Send a message to the LLM and handle streaming response
 * @param message - The user's message
 * @param onChunk - Callback for each chunk received
 * @param onError - Callback for errors
 * @returns Promise that resolves when stream completes
 */
export async function sendMessage(
  message: string,
  onChunk: (chunk: StreamChunk) => void,
  onError?: (error: Error) => void
): Promise<void> {
  const abortController = new AbortController();

  try {
    const request: ChatRequest = {
      message,
      // sessionId can be added later for multi-session support
    };

    const response = await fetch(`${API_BASE_URL}/api/chat`, {
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

    // Handle Server-Sent Events
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // Decode chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE events
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '') continue;

        // Parse SSE format: "event: type\ndata: {...}"
        const eventMatch = line.match(/^event:\s*(.+)$/m);
        const dataMatch = line.match(/^data:\s*(.+)$/m);

        if (dataMatch) {
          try {
            const chunk: StreamChunk = JSON.parse(dataMatch[1]);
            onChunk(chunk);

            // Stop reading if we receive a 'done' chunk
            if (chunk.type === 'done') {
              reader.cancel();
              break;
            }
          } catch (error) {
            console.error('Failed to parse SSE data:', error);
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('API error:', error);
      if (onError) {
        onError(error);
      }
    }
    throw error;
  }
}

/**
 * Health check endpoint
 * @returns Promise resolving to health status
 */
export async function healthCheck(): Promise<{
  status: string;
  timestamp: number;
  uptime: number;
}> {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }

  return response.json();
}
