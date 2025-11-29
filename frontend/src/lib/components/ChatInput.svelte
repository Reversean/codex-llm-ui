<script lang="ts">
	let { onSubmit, disabled = false }: { onSubmit: (message: string) => void; disabled?: boolean } = $props();

	let value = $state('');

	const placeholder = $derived(disabled ? 'Thinking...' : 'Ask anything...');

	function handleSubmit() {
		const trimmed = value.trim();
		if (!trimmed || disabled) return;

		onSubmit(trimmed);
		value = '';
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSubmit();
		}
	}
</script>

<div class="chat-input-container">
	<textarea
		bind:value
		{placeholder}
		{disabled}
		onkeydown={handleKeyDown}
		rows="1"
		class="chat-input"
	></textarea>
	<button onclick={handleSubmit} {disabled} class="send-button" type="button"> Send </button>
</div>

<style>
	.chat-input-container {
		display: flex;
		gap: var(--spacing-md);
		padding: var(--spacing-lg);
		background: var(--color-bg-primary);
		border-top: 1px solid var(--color-border);
	}

	.chat-input {
		flex: 1;
		padding: var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-family: var(--font-family);
		font-size: var(--font-size-base);
		line-height: var(--line-height-normal);
		resize: none;
		min-height: 44px;
		max-height: 200px;
		transition: border-color var(--transition-base);
	}

	.chat-input:focus {
		outline: none;
		border-color: var(--color-user-bubble);
	}

	.chat-input:disabled {
		background-color: var(--color-bg-secondary);
		cursor: not-allowed;
		opacity: 0.6;
	}

	.send-button {
		padding: var(--spacing-md) var(--spacing-lg);
		background-color: var(--color-user-bubble);
		color: var(--color-user-text);
		border: none;
		border-radius: var(--radius-md);
		font-family: var(--font-family);
		font-size: var(--font-size-base);
		font-weight: 600;
		cursor: pointer;
		transition: all var(--transition-base);
		min-width: 80px;
	}

	.send-button:hover:not(:disabled) {
		background-color: var(--color-user-bubble);
		opacity: 0.9;
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.send-button:active:not(:disabled) {
		transform: translateY(0);
	}

	.send-button:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
</style>
