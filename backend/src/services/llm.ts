/*
 * LLM Service
 * Handles LLM response generation (currently mock, will integrate real LLM API later)
 */

interface StreamChunk {
  type: 'chunk' | 'reasoning' | 'done' | 'error';
  content: string;
  messageId: string;
}

/**
 * Mock LLM response for development
 * @param message - User message
 * @returns AsyncGenerator yielding mock stream chunks
 */
export async function* mockLLMResponse(
  message: string
): AsyncGenerator<StreamChunk, void, unknown> {
  const words = `Mock response to: "${message}". This is a test response with streaming functionality.`.split(
    ' '
  );

  for (const word of words) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    yield {
      type: 'chunk',
      content: word + ' ',
      messageId: `msg-${Date.now()}`,
    };
  }

  yield {
    type: 'done',
    content: '',
    messageId: `msg-${Date.now()}`,
  };
}
