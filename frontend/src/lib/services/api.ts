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