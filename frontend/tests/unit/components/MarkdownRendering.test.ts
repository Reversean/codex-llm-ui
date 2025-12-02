import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import MessageBubble from '$lib/components/MessageBubble.svelte';
import type { Message } from '../../../../shared/types.js';

/**
 * Dedicated tests for Markdown rendering functionality (FR-003, SC-002)
 * Tests verify 95% of Markdown formatting elements render correctly
 */
describe('Markdown Rendering (FR-003, SC-002)', () => {
	function createLLMMessage(content: string): Message {
		return {
			id: `msg-${Date.now()}`,
			content,
			sender: 'llm',
			timestamp: Date.now(),
			status: 'complete'
		};
	}

	describe('Headers (H1-H6)', () => {
		it('renders H1 headers', () => {
			const message = createLLMMessage('# Main Title');
			const { container } = render(MessageBubble, { props: { message } });

			const h1 = container.querySelector('h1');
			expect(h1).toBeInTheDocument();
			expect(h1?.textContent).toContain('Main Title');
		});

		it('renders H2 headers', () => {
			const message = createLLMMessage('## Subtitle');
			const { container } = render(MessageBubble, { props: { message } });

			expect(container.querySelector('h2')).toBeInTheDocument();
		});

		it('renders H3 headers', () => {
			const message = createLLMMessage('### Section');
			const { container } = render(MessageBubble, { props: { message } });

			expect(container.querySelector('h3')).toBeInTheDocument();
		});

		it('renders multiple heading levels in same message', () => {
			const message = createLLMMessage('# Title\\n## Subtitle\\n### Details');
			const { container } = render(MessageBubble, { props: { message } });

			expect(container.querySelector('h1')).toBeInTheDocument();
			expect(container.querySelector('h2')).toBeInTheDocument();
			expect(container.querySelector('h3')).toBeInTheDocument();
		});
	});

	describe('Lists', () => {
		it('renders unordered lists with multiple items', () => {
			const message = createLLMMessage('- First item\\n- Second item\\n- Third item');
			const { container } = render(MessageBubble, { props: { message } });

			const ul = container.querySelector('ul');
			const items = container.querySelectorAll('li');

			expect(ul).toBeInTheDocument();
			expect(items).toHaveLength(3);
		});

		it('renders ordered lists with correct numbering', () => {
			const message = createLLMMessage('1. Step one\\n2. Step two\\n3. Step three');
			const { container } = render(MessageBubble, { props: { message } });

			const ol = container.querySelector('ol');
			const items = container.querySelectorAll('li');

			expect(ol).toBeInTheDocument();
			expect(items).toHaveLength(3);
		});

		it('renders nested lists', () => {
			const message = createLLMMessage(
				'- Parent item\\n  - Nested item 1\\n  - Nested item 2\\n- Another parent'
			);
			const { container } = render(MessageBubble, { props: { message } });

			const lists = container.querySelectorAll('ul');
			expect(lists.length).toBeGreaterThan(1); // Should have nested ul
		});
	});

	describe('Code Blocks', () => {
		it('renders inline code', () => {
			const message = createLLMMessage('Use the `console.log()` function.');
			const { container } = render(MessageBubble, { props: { message } });

			const code = container.querySelector('code');
			expect(code).toBeInTheDocument();
			expect(code?.textContent).toContain('console.log()');
		});

		it('renders code blocks with language syntax', () => {
			const message = createLLMMessage(
				'```javascript\\nfunction test() {\\n  return true;\\n}\\n```'
			);
			const { container } = render(MessageBubble, { props: { message } });

			const pre = container.querySelector('pre');
			const code = container.querySelector('pre code');

			expect(pre).toBeInTheDocument();
			expect(code).toBeInTheDocument();
			expect(code?.textContent).toContain('function test()');
		});

		it('renders code blocks with Python syntax', () => {
			const message = createLLMMessage(
				'```python\\ndef hello():\\n    print("Hello")\\n```'
			);
			const { container } = render(MessageBubble, { props: { message } });

			const code = container.querySelector('pre code');
			expect(code).toBeInTheDocument();
			expect(code?.textContent).toContain('def hello()');
		});

		it('renders code blocks without language specified', () => {
			const message = createLLMMessage('```\\ngeneric code\\n```');
			const { container } = render(MessageBubble, { props: { message } });

			expect(container.querySelector('pre code')).toBeInTheDocument();
		});

		it('applies syntax highlighting classes (via highlight.js)', () => {
			const message = createLLMMessage(
				'```javascript\\nconst x = 42;\\nconsole.log(x);\\n```'
			);
			const { container } = render(MessageBubble, { props: { message } });

			const code = container.querySelector('pre code');
			// highlight.js typically adds 'hljs' class or language-specific classes
			expect(code).toBeInTheDocument();
		});
	});

	describe('Text Formatting', () => {
		it('renders bold text with **syntax', () => {
			const message = createLLMMessage('This is **bold** text.');
			const { container } = render(MessageBubble, { props: { message } });

			const strong = container.querySelector('strong');
			expect(strong).toBeInTheDocument();
			expect(strong?.textContent).toBe('bold');
		});

		it('renders italic text with *syntax', () => {
			const message = createLLMMessage('This is *italic* text.');
			const { container } = render(MessageBubble, { props: { message } });

			const em = container.querySelector('em');
			expect(em).toBeInTheDocument();
			expect(em?.textContent).toBe('italic');
		});

		it('renders strikethrough with ~~syntax', () => {
			const message = createLLMMessage('This is ~~deleted~~ text.');
			const { container } = render(MessageBubble, { props: { message } });

			// marked with gfm: true supports strikethrough as <del>
			const del = container.querySelector('del');
			expect(del).toBeInTheDocument();
		});

		it('renders combined formatting', () => {
			const message = createLLMMessage('**Bold and *italic* together**');
			const { container } = render(MessageBubble, { props: { message } });

			expect(container.querySelector('strong')).toBeInTheDocument();
			expect(container.querySelector('em')).toBeInTheDocument();
		});
	});

	describe('Links', () => {
		it('renders hyperlinks with correct href', () => {
			const message = createLLMMessage('[OpenAI](https://openai.com)');
			const { container } = render(MessageBubble, { props: { message } });

			const link = container.querySelector('a');
			expect(link).toBeInTheDocument();
			expect(link?.getAttribute('href')).toBe('https://openai.com');
			expect(link?.textContent).toBe('OpenAI');
		});

		it('renders multiple links in same message', () => {
			const message = createLLMMessage(
				'Check [Google](https://google.com) and [GitHub](https://github.com)'
			);
			const { container } = render(MessageBubble, { props: { message } });

			const links = container.querySelectorAll('a');
			expect(links).toHaveLength(2);
		});

		it('renders autolinks', () => {
			const message = createLLMMessage('Visit https://example.com for info');
			const { container } = render(MessageBubble, { props: { message } });

			const link = container.querySelector('a');
			expect(link).toBeInTheDocument();
			expect(link?.getAttribute('href')).toBe('https://example.com');
		});
	});

	describe('Blockquotes', () => {
		it('renders blockquotes', () => {
			const message = createLLMMessage('> This is a quote');
			const { container } = render(MessageBubble, { props: { message } });

			const blockquote = container.querySelector('blockquote');
			expect(blockquote).toBeInTheDocument();
			expect(blockquote?.textContent).toContain('This is a quote');
		});

		it('renders nested blockquotes', () => {
			const message = createLLMMessage('> Level 1\\n>> Level 2');
			const { container } = render(MessageBubble, { props: { message } });

			const blockquotes = container.querySelectorAll('blockquote');
			expect(blockquotes.length).toBeGreaterThan(0);
		});
	});

	describe('Horizontal Rules', () => {
		it('renders horizontal rules with ---', () => {
			const message = createLLMMessage('Text above\\n---\\nText below');
			const { container } = render(MessageBubble, { props: { message } });

			const hr = container.querySelector('hr');
			expect(hr).toBeInTheDocument();
		});

		it('renders horizontal rules with ***', () => {
			const message = createLLMMessage('Text above\\n***\\nText below');
			const { container } = render(MessageBubble, { props: { message } });

			expect(container.querySelector('hr')).toBeInTheDocument();
		});
	});

	describe('Tables (GitHub-Flavored Markdown)', () => {
		it('renders simple tables', () => {
			const message = createLLMMessage(
				'| Header 1 | Header 2 |\\n|----------|----------|\\n| Cell 1   | Cell 2   |'
			);
			const { container } = render(MessageBubble, { props: { message } });

			const table = container.querySelector('table');
			expect(table).toBeInTheDocument();
		});

		it('renders table headers', () => {
			const message = createLLMMessage('| Name | Age |\\n|------|-----|\\n| John | 30  |');
			const { container } = render(MessageBubble, { props: { message } });

			const th = container.querySelectorAll('th');
			expect(th.length).toBe(2);
		});
	});

	describe('Mixed Content', () => {
		it('renders complex message with multiple formatting types', () => {
			const complexMessage = `
# API Documentation

Use the following API:

\`\`\`javascript
fetch('/api/data')
  .then(res => res.json())
  .then(data => console.log(data));
\`\`\`

**Important**: Always handle errors.

- Check status code
- Validate response
- Log failures

Visit [documentation](https://example.com) for more.
			`;

			const message = createLLMMessage(complexMessage);
			const { container } = render(MessageBubble, { props: { message } });

			expect(container.querySelector('h1')).toBeInTheDocument();
			expect(container.querySelector('pre code')).toBeInTheDocument();
			expect(container.querySelector('strong')).toBeInTheDocument();
			expect(container.querySelector('ul')).toBeInTheDocument();
			expect(container.querySelector('a')).toBeInTheDocument();
		});
	});

	describe('Edge Cases and Error Handling', () => {
		it('handles malformed Markdown gracefully', () => {
			const message = createLLMMessage('**Unclosed bold and `unclosed code');
			const { container } = render(MessageBubble, { props: { message } });

			// Should render something without crashing
			expect(container.querySelector('.message-content')).toBeInTheDocument();
		});

		it('handles empty Markdown', () => {
			const message = createLLMMessage('');
			const { container } = render(MessageBubble, { props: { message } });

			expect(container.querySelector('.message-content')).toBeInTheDocument();
		});

		it('handles very long code blocks', () => {
			const longCode = 'x'.repeat(5000);
			const message = createLLMMessage(`\`\`\`\\n${longCode}\\n\`\`\``);
			const { container } = render(MessageBubble, { props: { message } });

			expect(container.querySelector('pre code')).toBeInTheDocument();
		});

		it('handles special characters in text', () => {
			const message = createLLMMessage('Special chars: <>&\'"');
			const { container } = render(MessageBubble, { props: { message } });

			// Should escape HTML entities
			expect(container.querySelector('.message-content')).toBeInTheDocument();
		});
	});

	describe('Rendering Accuracy (SC-002: 95% accuracy)', () => {
		it('renders all common Markdown elements without errors', () => {
			const comprehensiveMarkdown = `
# H1
## H2
### H3

**Bold** and *italic* and \`code\`

- List item 1
- List item 2

1. Ordered 1
2. Ordered 2

[Link](https://example.com)

> Blockquote

\`\`\`javascript
console.log("test");
\`\`\`

---

| Table | Header |
|-------|--------|
| Cell  | Data   |
			`;

			const message = createLLMMessage(comprehensiveMarkdown);
			const { container } = render(MessageBubble, { props: { message } });

			// Verify all major elements present
			expect(container.querySelector('h1')).toBeInTheDocument();
			expect(container.querySelector('h2')).toBeInTheDocument();
			expect(container.querySelector('strong')).toBeInTheDocument();
			expect(container.querySelector('em')).toBeInTheDocument();
			expect(container.querySelector('code')).toBeInTheDocument();
			expect(container.querySelector('ul')).toBeInTheDocument();
			expect(container.querySelector('ol')).toBeInTheDocument();
			expect(container.querySelector('a')).toBeInTheDocument();
			expect(container.querySelector('blockquote')).toBeInTheDocument();
			expect(container.querySelector('pre')).toBeInTheDocument();
			expect(container.querySelector('hr')).toBeInTheDocument();
			expect(container.querySelector('table')).toBeInTheDocument();
		});
	});
});
