// Message types
export type MessageStatus = 'pending' | 'streaming' | 'complete' | 'error';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'llm';
  timestamp: number;
  status: MessageStatus;
  reasoning?: ReasoningBlock | null;
}

// Reasoning block
export interface ReasoningBlock {
  content: string;
  isExpanded: boolean;
  startTime?: number | null;
  endTime?: number | null;
}

// Session types
export type SessionState = 'idle' | 'thinking' | 'streaming' | 'error';

export interface ConversationSession {
  messages: Message[];
  state: SessionState;
}

// Stream chunk types
export type ChunkType = 'chunk' | 'reasoning' | 'done' | 'error';

export interface StreamChunk {
  type: ChunkType;
  content: string;
  messageId: string;
}

// API request/response types
export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ErrorResponse {
  error: string;
  code: string;
  timestamp: number;
}
