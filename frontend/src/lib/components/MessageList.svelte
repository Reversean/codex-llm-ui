<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { Message } from '../../../../shared/types.js';
	import MessageBubble from './MessageBubble.svelte';

	let { messages }: { messages: Message[] } = $props();

	let scrollContainer: HTMLDivElement;

	async function scrollToBottom() {
		await tick();
		if (scrollContainer) {
			scrollContainer.scrollTop = scrollContainer.scrollHeight;
		}
	}

	$effect(() => {
		if (messages.length > 0) {
			scrollToBottom();
		}
	});

	onMount(() => {
		scrollToBottom();
	});
</script>

<div class="message-list-container" data-testid="message-list-container" bind:this={scrollContainer}>
	{#if messages.length === 0}
		<div class="empty-state">
			<h2>Start a conversation</h2>
			<p>Ask anything to get started!</p>
		</div>
	{:else}
		<div class="messages">
			{#each messages as message (message.id)}
				<MessageBubble {message} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.message-list-container {
		flex: 1;
		overflow-y: auto;
		padding: var(--spacing-lg);
		background-color: var(--color-bg-primary);
		scroll-behavior: smooth;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--color-text-secondary);
		text-align: center;
		gap: var(--spacing-md);
	}

	.empty-state h2 {
		font-size: var(--font-size-xl);
		font-weight: 600;
		color: var(--color-llm-text);
		margin: 0;
	}

	.empty-state p {
		font-size: var(--font-size-base);
		margin: 0;
	}

	.messages {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		max-width: 1000px;
		margin: 0 auto;
	}
</style>
