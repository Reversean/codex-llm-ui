<script lang="ts">
	import { messages, addMessage, updateMessage, appendToMessage } from '$lib/stores/conversation';
	import { isThinking, isStreaming, setThinking, setStreaming, setError, clearError } from '$lib/stores/ui';
	import { sendMessage } from '$lib/services/api';
	import ChatInput from '$lib/components/ChatInput.svelte';
	import MessageList from '$lib/components/MessageList.svelte';
	import type { Message, StreamChunk } from '../../../shared/types.js';

	const isDisabled = $derived($isThinking || $isStreaming);

	async function handleSendMessage(userMessage: string) {
		clearError();

		const userMsg: Message = {
			id: `user-${Date.now()}`,
			content: userMessage,
			sender: 'user',
			timestamp: Date.now(),
			status: 'complete',
		};

		addMessage(userMsg);

		const llmMsg: Message = {
			id: `llm-${Date.now()}`,
			content: '',
			sender: 'llm',
			timestamp: Date.now(),
			status: 'pending',
		};

		addMessage(llmMsg);
		setThinking(true);

		try {
			await sendMessage(
				userMessage,
				(chunk: StreamChunk) => {
					handleStreamChunk(llmMsg.id, chunk);
				},
				(error: Error) => {
					handleError(llmMsg.id, error);
				}
			);
		} catch (error) {
			handleError(llmMsg.id, error as Error);
		}
	}

	function handleStreamChunk(messageId: string, chunk: StreamChunk) {
		if (chunk.type === 'chunk') {
			if ($isThinking) {
				setThinking(false);
				setStreaming(true);
				updateMessage(messageId, { status: 'streaming' });
			}

			appendToMessage(messageId, chunk.content);
		} else if (chunk.type === 'reasoning') {
			if ($isThinking) {
				setThinking(false);
				setStreaming(true);
				updateMessage(messageId, { status: 'streaming' });
			}
		} else if (chunk.type === 'done') {
			updateMessage(messageId, { status: 'complete' });
			setStreaming(false);
			setThinking(false);
		} else if (chunk.type === 'error') {
			updateMessage(messageId, {
				status: 'error',
				content: chunk.content || 'An error occurred',
			});
			setError(chunk.content || 'An error occurred');
			setStreaming(false);
			setThinking(false);
		}
	}

	function handleError(messageId: string, error: Error) {
		updateMessage(messageId, {
			status: 'error',
			content: error.message || 'Failed to get response',
		});
		setError(error.message || 'Failed to get response');
		setStreaming(false);
		setThinking(false);
	}
</script>

<div class="chat-container">
	<div class="chat-header">
		<h1>LLM Chat Interface</h1>
	</div>

	<MessageList messages={$messages} />

	<ChatInput onSubmit={handleSendMessage} disabled={isDisabled} />
</div>

<style>
	.chat-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		max-width: 100%;
		margin: 0 auto;
		background-color: var(--color-bg-primary);
	}

	.chat-header {
		padding: var(--spacing-lg);
		background-color: var(--color-bg-primary);
		border-bottom: 1px solid var(--color-border);
		text-align: center;
	}

	.chat-header h1 {
		font-size: var(--font-size-xl);
		font-weight: 700;
		color: var(--color-llm-text);
		margin: 0;
	}
</style>
