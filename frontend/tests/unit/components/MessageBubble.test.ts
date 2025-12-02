import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import MessageBubble from '$lib/components/MessageBubble.svelte';
import type { Message } from '../../../../shared/types.js';

describe('MessageBubble Component', () => {
	describe('User Messages', () => {
		let userMessage: Message;

		beforeEach(() => {
			userMessage = {
				id: 'msg-1',
				content: 'Hello, how are you?',
				sender: 'user',
				timestamp: Date.now(),
				status: 'complete'
			};
		});

		it('renders user message with correct content', () => {
			render(MessageBubble, { props: { message: userMessage } });

			expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
		});

		it('applies user styling class', () => {
			const { container } = render(MessageBubble, { props: { message: userMessage } });
			const bubble = container.querySelector('.message-bubble');

			expect(bubble).toHaveClass('user');
			expect(bubble).not.toHaveClass('llm');
		});

		it('displays user message right-aligned (via CSS class)', () => {
			const { container } = render(MessageBubble, { props: { message: userMessage } });
			const bubble = container.querySelector('.message-bubble.user');

			expect(bubble).toBeInTheDocument();
		});

		it('displays user content as plain text (no Markdown rendering)', () => {
			userMessage.content = '**Bold** text with `code`';
			const { container } = render(MessageBubble, { props: { message: userMessage } });

			// Should show raw Markdown, not rendered HTML
			expect(screen.getByText(/\*\*Bold\*\* text with `code`/)).toBeInTheDocument();
			expect(container.querySelector('strong')).toBeNull();
			expect(container.querySelector('code')).toBeNull();
		});
	});

	describe('LLM Messages', () => {
		let llmMessage: Message;

		beforeEach(() => {
			llmMessage = {
				id: 'msg-2',
				content: 'Hello! I am doing well, thank you.',
				sender: 'llm',
				timestamp: Date.now(),
				status: 'complete'
			};
		});

		it('renders LLM message with correct content', () => {
			render(MessageBubble, { props: { message: llmMessage } });

			expect(screen.getByText(/Hello! I am doing well, thank you./)).toBeInTheDocument();
		});

		it('applies LLM styling class', () => {
			const { container } = render(MessageBubble, { props: { message: llmMessage } });
			const bubble = container.querySelector('.message-bubble');

			expect(bubble).toHaveClass('llm');
			expect(bubble).not.toHaveClass('user');
		});

		it('displays LLM message left-aligned without background bubble (via CSS class)', () => {
			const { container } = render(MessageBubble, { props: { message: llmMessage } });
			const bubble = container.querySelector('.message-bubble.llm');

			expect(bubble).toBeInTheDocument();
		});
	});

	describe('Markdown Rendering for LLM Messages', () => {
		it('renders bold text correctly', () => {
			const message: Message = {
				id: 'msg-3',
				content: 'This is **bold text**.',
				sender: 'llm',
				timestamp: Date.now(),
				status: 'complete'
			};

			const { container } = render(MessageBubble, { props: { message } });
			const strong = container.querySelector('strong');

			expect(strong).toBeInTheDocument();
			expect(strong?.textContent).toBe('bold text');
		});

		it('renders italic text correctly', () => {
			const message: Message = {
				id: 'msg-4',
				content: 'This is *italic text*.',
				sender: 'llm',
				timestamp: Date.now(),
				status: 'complete'
			};

			const { container } = render(MessageBubble, { props: { message } });
			const em = container.querySelector('em');

			expect(em).toBeInTheDocument();
			expect(em?.textContent).toBe('italic text');
		});

		it('renders headers correctly', () => {
			const message: Message = {
				id: 'msg-5',
				content: '# Heading 1\\n## Heading 2',
				sender: 'llm',
				timestamp: Date.now(),
				status: 'complete'
			};

			const { container } = render(MessageBubble, { props: { message } });

			expect(container.querySelector('h1')).toBeInTheDocument();
			expect(container.querySelector('h2')).toBeInTheDocument();
		});

		it('renders unordered lists correctly', () => {
			const message: Message = {
				id: 'msg-6',
				content: '- Item 1\\n- Item 2\\n- Item 3',
				sender: 'llm',
				timestamp: Date.now(),
				status: 'complete'
			};

			const { container } = render(MessageBubble, { props: { message } });
			const ul = container.querySelector('ul');
			const listItems = container.querySelectorAll('li');

			expect(ul).toBeInTheDocument();
			expect(listItems.length).toBe(3);
		});

		it('renders ordered lists correctly', () => {
			const message: Message = {
				id: 'msg-7',
				content: '1. First\\n2. Second\\n3. Third',
				sender: 'llm',
				timestamp: Date.now(),
				status: 'complete'
			};

			const { container } = render(MessageBubble, { props: { message } });
			const ol = container.querySelector('ol');
			const listItems = container.querySelectorAll('li');

			expect(ol).toBeInTheDocument();
			expect(listItems.length).toBe(3);
		});

		it('renders inline code correctly', () => {
			const message: Message = {
				id: 'msg-8',
				content: 'Use `console.log()` for debugging.',
				sender: 'llm',
				timestamp: Date.now(),
				status: 'complete'
			};

			const { container } = render(MessageBubble, { props: { message } });
			const code = container.querySelector('code');

			expect(code).toBeInTheDocument();
			expect(code?.textContent).toContain('console.log()');
		});

		it('renders code blocks correctly', () => {
			const message: Message = {
				id: 'msg-9',
				content: '```javascript\\nfunction hello() {\\n  console.log("Hello");\\n}\\n```',
				sender: 'llm',
				timestamp: Date.now(),
				status: 'complete'
			};

			const { container } = render(MessageBubble, { props: { message } });
			const pre = container.querySelector('pre');
			const code = container.querySelector('pre code');

			expect(pre).toBeInTheDocument();
			expect(code).toBeInTheDocument();
			expect(code?.textContent).toContain('function hello()');
		});

		it('renders links correctly', () => {
			const message: Message = {
				id: 'msg-10',
				content: 'Visit [OpenAI](https://openai.com) for more info.',
				sender: 'llm',
				timestamp: Date.now(),
				status: 'complete'
			};

			const { container } = render(MessageBubble, { props: { message } });
			const link = container.querySelector('a');

			expect(link).toBeInTheDocument();
			expect(link?.getAttribute('href')).toBe('https://openai.com');
			expect(link?.textContent).toBe('OpenAI');
		});
	});

	describe('Message Status States', () => {
		it('shows thinking indicator for pending messages', () => {
			const message: Message = {
				id: 'msg-11',
				content: '',
				sender: 'llm',
				timestamp: Date.now(),
				status: 'pending'
			};

			render(MessageBubble, { props: { message } });

			expect(screen.getByTestId('thinking-indicator')).toBeInTheDocument();
		});

		it('shows streaming cursor for streaming messages', () => {
			const message: Message = {
				id: 'msg-12',
				content: 'Partial response...',
				sender: 'llm',
				timestamp: Date.now(),
				status: 'streaming'
			};

			render(MessageBubble, { props: { message } });

			expect(screen.getByTestId('streaming-cursor')).toBeInTheDocument();
		});

		it('applies error styling for error messages', () => {
			const message: Message = {
				id: 'msg-13',
				content: 'Error occurred',
				sender: 'llm',
				timestamp: Date.now(),
				status: 'error'
			};

			const { container } = render(MessageBubble, { props: { message } });
			const bubble = container.querySelector('.message-bubble');

			expect(bubble).toHaveClass('error');
		});
	});

	describe('Data Attributes', () => {
		it('includes sender data attribute', () => {
			const message: Message = {
				id: 'msg-14',
				content: 'Test',
				sender: 'user',
				timestamp: Date.now(),
				status: 'complete'
			};

			const { container } = render(MessageBubble, { props: { message } });
			const bubble = container.querySelector('.message-bubble');

			expect(bubble?.getAttribute('data-sender')).toBe('user');
		});

		it('includes status data attribute', () => {
			const message: Message = {
				id: 'msg-15',
				content: 'Test',
				sender: 'llm',
				timestamp: Date.now(),
				status: 'streaming'
			};

			const { container } = render(MessageBubble, { props: { message } });
			const bubble = container.querySelector('.message-bubble');

			expect(bubble?.getAttribute('data-status')).toBe('streaming');
		});

		it('includes message-id data attribute', () => {
			const message: Message = {
				id: 'msg-unique-123',
				content: 'Test',
				sender: 'llm',
				timestamp: Date.now(),
				status: 'complete'
			};

			const { container } = render(MessageBubble, { props: { message } });
			const bubble = container.querySelector('.message-bubble');

			expect(bubble?.getAttribute('data-message-id')).toBe('msg-unique-123');
		});
	});

	describe('Edge Cases', () => {
		it('handles empty content gracefully', () => {
			const message: Message = {
				id: 'msg-16',
				content: '',
				sender: 'llm',
				timestamp: Date.now(),
				status: 'complete'
			};

			const { container } = render(MessageBubble, { props: { message } });

			expect(container.querySelector('.message-content')).toBeInTheDocument();
		});

		it('handles malformed Markdown gracefully (fallback to raw text)', () => {
			const message: Message = {
				id: 'msg-17',
				content: '**Unclosed bold and `unclosed code',
				sender: 'llm',
				timestamp: Date.now(),
				status: 'complete'
			};

			// Should not crash, should render something
			const { container } = render(MessageBubble, { props: { message } });

			expect(container.querySelector('.message-content')).toBeInTheDocument();
		});
	});
});
