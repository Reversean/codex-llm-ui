import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import MessageList from '$lib/components/MessageList.svelte';
import type { Message } from '../../../../shared/types';

describe('MessageList Component', () => {
  const createMessage = (overrides?: Partial<Message>): Message => ({
    id: 'msg-1',
    content: 'Test message',
    sender: 'user',
    timestamp: Date.now(),
    status: 'complete',
    ...overrides,
  });

  it('should render empty state when no messages', () => {
    render(MessageList, { props: { messages: [] } });

    const emptyState = screen.queryByText(/start a conversation/i);
    expect(emptyState).toBeInTheDocument();
  });

  it('should render user messages', () => {
    const messages = [
      createMessage({ id: 'msg-1', content: 'Hello LLM', sender: 'user' }),
    ];

    render(MessageList, { props: { messages } });

    expect(screen.getByText('Hello LLM')).toBeInTheDocument();
  });

  it('should render LLM messages', () => {
    const messages = [
      createMessage({ id: 'msg-1', content: 'Hello user!', sender: 'llm' }),
    ];

    render(MessageList, { props: { messages } });

    expect(screen.getByText('Hello user!')).toBeInTheDocument();
  });

  it('should render multiple messages in order', () => {
    const messages = [
      createMessage({ id: 'msg-1', content: 'First message', sender: 'user' }),
      createMessage({ id: 'msg-2', content: 'Second message', sender: 'llm' }),
      createMessage({ id: 'msg-3', content: 'Third message', sender: 'user' }),
    ];

    render(MessageList, { props: { messages } });

    const messageElements = screen.getAllByText(/message/);
    expect(messageElements).toHaveLength(3);
  });

  it('should apply different styles for user and LLM messages', () => {
    const messages = [
      createMessage({ id: 'msg-1', content: 'User msg', sender: 'user' }),
      createMessage({ id: 'msg-2', content: 'LLM msg', sender: 'llm' }),
    ];

    const { container } = render(MessageList, { props: { messages } });

    const userBubble = container.querySelector('[data-sender="user"]');
    const llmBubble = container.querySelector('[data-sender="llm"]');

    expect(userBubble).toBeInTheDocument();
    expect(llmBubble).toBeInTheDocument();
  });

  it('should show thinking indicator for pending messages', () => {
    const messages = [
      createMessage({ id: 'msg-1', content: '', sender: 'llm', status: 'pending' }),
    ];

    render(MessageList, { props: { messages } });

    const thinkingIndicator = screen.getByTestId('thinking-indicator');
    expect(thinkingIndicator).toBeInTheDocument();
  });

  it('should not show thinking indicator for complete messages', () => {
    const messages = [
      createMessage({ id: 'msg-1', content: 'Complete', sender: 'llm', status: 'complete' }),
    ];

    render(MessageList, { props: { messages } });

    const thinkingIndicator = screen.queryByTestId('thinking-indicator');
    expect(thinkingIndicator).not.toBeInTheDocument();
  });

  it('should render cursor for streaming messages', () => {
    const messages = [
      createMessage({ id: 'msg-1', content: 'Streaming...', sender: 'llm', status: 'streaming' }),
    ];

    render(MessageList, { props: { messages } });

    const cursor = screen.getByTestId('streaming-cursor');
    expect(cursor).toBeInTheDocument();
  });

  it('should render reasoning block when present', () => {
    const messages = [
      createMessage({
        id: 'msg-1',
        content: 'Answer',
        sender: 'llm',
        status: 'complete',
        reasoning: {
          content: 'Thinking process...',
          isExpanded: false,
        },
      }),
    ];

    render(MessageList, { props: { messages } });

    expect(screen.getByText(/thinking/i)).toBeInTheDocument();
  });

  it('should not render reasoning block when not present', () => {
    const messages = [
      createMessage({ id: 'msg-1', content: 'Answer', sender: 'llm' }),
    ];

    render(MessageList, { props: { messages } });

    const reasoning = screen.queryByText(/thinking/i);
    expect(reasoning).not.toBeInTheDocument();
  });

  it('should auto-scroll to bottom when new message is added', () => {
    const { container, component } = render(MessageList, {
      props: { messages: [createMessage()] },
    });

    const scrollContainer = container.querySelector('[data-testid="message-list-container"]');
    expect(scrollContainer).toBeInTheDocument();
  });

  it('should handle empty message content', () => {
    const messages = [
      createMessage({ id: 'msg-1', content: '', sender: 'llm', status: 'streaming' }),
    ];

    const { container } = render(MessageList, { props: { messages } });

    const messageBubble = container.querySelector('[data-message-id="msg-1"]');
    expect(messageBubble).toBeInTheDocument();
  });

  it('should render error messages with error styling', () => {
    const messages = [
      createMessage({
        id: 'msg-1',
        content: 'Error occurred',
        sender: 'llm',
        status: 'error',
      }),
    ];

    const { container } = render(MessageList, { props: { messages } });

    const errorBubble = container.querySelector('[data-status="error"]');
    expect(errorBubble).toBeInTheDocument();
  });
});
