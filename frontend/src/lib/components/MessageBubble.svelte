<script lang="ts">
	import type { Message } from '../../../../shared/types.js';
	import { toggleReasoningExpanded } from '$lib/stores/conversation';

	let { message }: { message: Message } = $props();

	const isUser = $derived(message.sender === 'user');
	const isStreaming = $derived(message.status === 'streaming');
	const isPending = $derived(message.status === 'pending');
	const isError = $derived(message.status === 'error');

	function handleReasoningToggle() {
		toggleReasoningExpanded(message.id);
	}
</script>

<div
	class="message-bubble"
	class:user={isUser}
	class:llm={!isUser}
	class:error={isError}
	data-sender={message.sender}
	data-status={message.status}
	data-message-id={message.id}
>
	{#if isPending}
		<div class="thinking-indicator" data-testid="thinking-indicator">
			<span class="dot"></span>
			<span class="dot"></span>
			<span class="dot"></span>
		</div>
	{:else}
		{#if message.reasoning && !isUser}
			<button class="reasoning-toggle" onclick={handleReasoningToggle} type="button">
				<span class="reasoning-icon">{message.reasoning.isExpanded ? '▼' : '▶'}</span>
				Thinking
			</button>

			{#if message.reasoning.isExpanded}
				<div class="reasoning-content">
					{message.reasoning.content}
				</div>
			{/if}
		{/if}

		<div class="message-content">
			{message.content}
			{#if isStreaming}
				<span class="cursor" data-testid="streaming-cursor"></span>
			{/if}
		</div>
	{/if}
</div>

<style>
	.message-bubble {
		max-width: 70%;
		padding: var(--spacing-md);
		border-radius: var(--radius-md);
		margin-bottom: var(--spacing-md);
		word-wrap: break-word;
		animation: fadeIn 0.2s ease-in;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.message-bubble.user {
		background-color: var(--color-user-bubble);
		color: var(--color-user-text);
		align-self: flex-end;
		margin-left: auto;
	}

	.message-bubble.llm {
		background-color: var(--color-llm-bubble);
		color: var(--color-llm-text);
		align-self: flex-start;
	}

	.message-bubble.error {
		background-color: var(--color-error);
		color: var(--color-user-text);
	}

	.thinking-indicator {
		display: flex;
		gap: var(--spacing-xs);
		align-items: center;
	}

	.dot {
		width: 8px;
		height: 8px;
		background-color: var(--color-llm-text);
		border-radius: 50%;
		animation: pulse 1.4s infinite ease-in-out;
	}

	.dot:nth-child(1) {
		animation-delay: 0s;
	}

	.dot:nth-child(2) {
		animation-delay: 0.2s;
	}

	.dot:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes pulse {
		0%,
		80%,
		100% {
			opacity: 0.3;
			transform: scale(0.8);
		}
		40% {
			opacity: 1;
			transform: scale(1);
		}
	}

	.reasoning-toggle {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		background: none;
		border: none;
		color: var(--color-reasoning-text);
		font-size: var(--font-size-sm);
		cursor: pointer;
		padding: var(--spacing-xs) 0;
		margin-bottom: var(--spacing-xs);
		font-family: var(--font-family);
	}

	.reasoning-toggle:hover {
		color: var(--color-llm-text);
	}

	.reasoning-icon {
		font-size: 10px;
	}

	.reasoning-content {
		background-color: var(--color-reasoning-bg);
		color: var(--color-reasoning-text);
		padding: var(--spacing-md);
		border-radius: var(--radius-sm);
		margin-bottom: var(--spacing-md);
		font-size: var(--font-size-sm);
		font-style: italic;
		border-left: 3px solid var(--color-reasoning-border);
	}

	.message-content {
		line-height: var(--line-height-normal);
		white-space: pre-wrap;
	}

	.cursor {
		display: inline-block;
		width: 2px;
		height: 1em;
		background-color: currentColor;
		margin-left: 2px;
		animation: blink 1s infinite;
	}

	@keyframes blink {
		0%,
		50% {
			opacity: 1;
		}
		51%,
		100% {
			opacity: 0;
		}
	}
</style>