import { writable } from 'svelte/store'
import type { Message } from '../../../../shared/types.js'

/*
 * Conversation Store
 * Manages the array of messages in the current conversation
 */

// Main messages store
export const messages = writable<Message[]>([])

/**
 * Add a new message to the conversation
 * @param message - The message to add
 */
export function addMessage(message: Message): void {
  messages.update((msgs) => [...msgs, message])
}

/**
 * Update an existing message by ID
 * @param id - Message ID to update
 * @param updates - Partial message updates
 */
export function updateMessage(id: string, updates: Partial<Message>): void {
  messages.update((msgs) =>
    msgs.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg))
  )
}

/**
 * Append content to an existing message (for streaming)
 * @param id - Message ID to update
 * @param content - Content to append
 */
export function appendToMessage(id: string, content: string): void {
  messages.update((msgs) =>
    msgs.map((msg) => (msg.id === id ? { ...msg, content: msg.content + content } : msg))
  )
}

/**
 * Update the reasoning block of a message
 * @param id - Message ID to update
 * @param reasoningContent - Reasoning content to set or append
 */
export function updateMessageReasoning(id: string, reasoningContent: string): void {
  messages.update((msgs) =>
    msgs.map((msg) => {
      if (msg.id === id) {
        return {
          ...msg,
          reasoning: {
            content: msg.reasoning
              ? msg.reasoning.content + reasoningContent
              : reasoningContent,
            isExpanded: true,
            startTime: msg.reasoning
              ? msg.reasoning.startTime
              : Date.now(),
          },
        }
      }
      return msg
    })
  )
}

export function stopMessageReasoning(id: string): void {
  messages.update((msgs) =>
    msgs.map((msg) => {
      if (msg.id === id && msg.reasoning) {
        return {
          ...msg,
          reasoning: {
            ...msg.reasoning,
            endTime: Date.now(),
          },
        }
      }
      return msg
    })
  )
}

/**
 * Toggle reasoning block expansion for a message
 * @param id - Message ID
 */
export function toggleReasoningExpanded(id: string): void {
  messages.update((msgs) =>
    msgs.map((msg) => {
      if (msg.id === id && msg.reasoning) {
        return {
          ...msg,
          reasoning: {
            ...msg.reasoning,
            isExpanded: !msg.reasoning.isExpanded,
          },
        }
      }
      return msg
    })
  )
}

/**
 * Clear all messages (reset conversation)
 */
export function clearMessages(): void {
  messages.set([])
}
