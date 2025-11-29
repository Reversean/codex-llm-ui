import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
  messages,
  addMessage,
  updateMessage,
  appendToMessage,
  updateMessageReasoning,
  toggleReasoningExpanded,
  clearMessages,
} from '$lib/stores/conversation';
import type { Message } from '../../../../shared/types';

describe('Conversation Store', () => {
  beforeEach(() => {
    clearMessages();
  });

  describe('messages store', () => {
    it('should initialize with empty array', () => {
      expect(get(messages)).toEqual([]);
    });
  });

  describe('addMessage', () => {
    it('should add a message to the store', () => {
      const message: Message = {
        id: 'msg-1',
        content: 'Hello',
        sender: 'user',
        timestamp: Date.now(),
        status: 'complete',
      };

      addMessage(message);

      const msgs = get(messages);
      expect(msgs).toHaveLength(1);
      expect(msgs[0]).toEqual(message);
    });

    it('should add multiple messages in order', () => {
      const message1: Message = {
        id: 'msg-1',
        content: 'First',
        sender: 'user',
        timestamp: Date.now(),
        status: 'complete',
      };

      const message2: Message = {
        id: 'msg-2',
        content: 'Second',
        sender: 'llm',
        timestamp: Date.now(),
        status: 'streaming',
      };

      addMessage(message1);
      addMessage(message2);

      const msgs = get(messages);
      expect(msgs).toHaveLength(2);
      expect(msgs[0].id).toBe('msg-1');
      expect(msgs[1].id).toBe('msg-2');
    });
  });

  describe('updateMessage', () => {
    it('should update specific message properties', () => {
      const message: Message = {
        id: 'msg-1',
        content: 'Initial',
        sender: 'llm',
        timestamp: Date.now(),
        status: 'streaming',
      };

      addMessage(message);
      updateMessage('msg-1', { status: 'complete' });

      const msgs = get(messages);
      expect(msgs[0].status).toBe('complete');
      expect(msgs[0].content).toBe('Initial');
    });

    it('should not affect other messages', () => {
      const message1: Message = {
        id: 'msg-1',
        content: 'First',
        sender: 'user',
        timestamp: Date.now(),
        status: 'complete',
      };

      const message2: Message = {
        id: 'msg-2',
        content: 'Second',
        sender: 'llm',
        timestamp: Date.now(),
        status: 'streaming',
      };

      addMessage(message1);
      addMessage(message2);
      updateMessage('msg-2', { status: 'complete' });

      const msgs = get(messages);
      expect(msgs[0]).toEqual(message1);
      expect(msgs[1].status).toBe('complete');
    });

    it('should handle non-existent message ID gracefully', () => {
      const message: Message = {
        id: 'msg-1',
        content: 'Test',
        sender: 'user',
        timestamp: Date.now(),
        status: 'complete',
      };

      addMessage(message);
      updateMessage('non-existent', { status: 'error' });

      const msgs = get(messages);
      expect(msgs).toHaveLength(1);
      expect(msgs[0]).toEqual(message);
    });
  });

  describe('appendToMessage', () => {
    it('should append content to existing message', () => {
      const message: Message = {
        id: 'msg-1',
        content: 'Hello',
        sender: 'llm',
        timestamp: Date.now(),
        status: 'streaming',
      };

      addMessage(message);
      appendToMessage('msg-1', ' World');

      const msgs = get(messages);
      expect(msgs[0].content).toBe('Hello World');
    });

    it('should handle multiple appends', () => {
      const message: Message = {
        id: 'msg-1',
        content: '',
        sender: 'llm',
        timestamp: Date.now(),
        status: 'streaming',
      };

      addMessage(message);
      appendToMessage('msg-1', 'Hello');
      appendToMessage('msg-1', ' ');
      appendToMessage('msg-1', 'World');

      const msgs = get(messages);
      expect(msgs[0].content).toBe('Hello World');
    });
  });

  describe('updateMessageReasoning', () => {
    it('should create reasoning block if not exists', () => {
      const message: Message = {
        id: 'msg-1',
        content: 'Answer',
        sender: 'llm',
        timestamp: Date.now(),
        status: 'streaming',
      };

      addMessage(message);
      updateMessageReasoning('msg-1', 'Thinking...');

      const msgs = get(messages);
      expect(msgs[0].reasoning).toBeDefined();
      expect(msgs[0].reasoning?.content).toBe('Thinking...');
      expect(msgs[0].reasoning?.isExpanded).toBe(true);
    });

    it('should append to existing reasoning content', () => {
      const message: Message = {
        id: 'msg-1',
        content: 'Answer',
        sender: 'llm',
        timestamp: Date.now(),
        status: 'streaming',
        reasoning: {
          content: 'Initial thought',
          isExpanded: false,
        },
      };

      addMessage(message);
      updateMessageReasoning('msg-1', ' continues');

      const msgs = get(messages);
      expect(msgs[0].reasoning?.content).toBe('Initial thought continues');
    });
  });

  describe('toggleReasoningExpanded', () => {
    it('should toggle reasoning expanded state', () => {
      const message: Message = {
        id: 'msg-1',
        content: 'Answer',
        sender: 'llm',
        timestamp: Date.now(),
        status: 'complete',
        reasoning: {
          content: 'Reasoning',
          isExpanded: false,
        },
      };

      addMessage(message);
      toggleReasoningExpanded('msg-1');

      const msgs = get(messages);
      expect(msgs[0].reasoning?.isExpanded).toBe(true);

      toggleReasoningExpanded('msg-1');
      const msgs2 = get(messages);
      expect(msgs2[0].reasoning?.isExpanded).toBe(false);
    });

    it('should handle message without reasoning', () => {
      const message: Message = {
        id: 'msg-1',
        content: 'Answer',
        sender: 'llm',
        timestamp: Date.now(),
        status: 'complete',
      };

      addMessage(message);
      toggleReasoningExpanded('msg-1');

      const msgs = get(messages);
      expect(msgs[0].reasoning).toBeUndefined();
    });
  });

  describe('clearMessages', () => {
    it('should clear all messages', () => {
      const message1: Message = {
        id: 'msg-1',
        content: 'First',
        sender: 'user',
        timestamp: Date.now(),
        status: 'complete',
      };

      const message2: Message = {
        id: 'msg-2',
        content: 'Second',
        sender: 'llm',
        timestamp: Date.now(),
        status: 'complete',
      };

      addMessage(message1);
      addMessage(message2);

      expect(get(messages)).toHaveLength(2);

      clearMessages();

      expect(get(messages)).toHaveLength(0);
    });

    it('should handle clearing when already empty', () => {
      expect(get(messages)).toHaveLength(0);
      clearMessages();
      expect(get(messages)).toHaveLength(0);
    });
  });
});
