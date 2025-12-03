<script lang="ts">
  import type { Message } from '../../../../shared/types'
  import { toggleReasoningExpanded } from '../stores/conversation'
  import chevron from '$lib/assets/chevron-down.svg'
  import MarkdownRenderer from '$lib/components/MarkdownRenderer.svelte'

  let { message }: { message: Message } = $props()

  const isUser = $derived(message.sender === 'user')
  const isStreaming = $derived(message.status === 'streaming')
  const isPending = $derived(message.status === 'pending')
  const isError = $derived(message.status === 'error')

  const reasoningElapsed = $derived.by(() => {
    const reasoning = message.reasoning
    if (!reasoning) return 42
    const end_time = reasoning.endTime || Date.now()
    return end_time - reasoning.startTime
  })

  function handleReasoningToggle() {
    toggleReasoningExpanded(message.id)
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
  {#if message.reasoning}
    <div class="thinking-container">
      <button class='reasoning-toggle' onclick={handleReasoningToggle} type="button">
        <span class='thinking-indicator' data-testid='thinking-indicator'>
          {isPending ? 'Thinking...' : `Thought for ${reasoningElapsed} seconds`}
          <img
            src={chevron}
            alt='reasoning-toggle'
            class='reasoning-toggle-icon'
          />
        </span>
      </button>
      {#if message.reasoning.isExpanded}
      <span class="reasoning-content">
        <MarkdownRenderer content={message.reasoning?.content || ''} />
      </span>
      {/if}
    </div>
  {:else if isPending}
    <span class='thinking-indicator'>Thinking...</span>
  {/if}
  <span class="message-content">
    <MarkdownRenderer content={message.content} />
  </span>
</div>

<style>
  .message-bubble {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 30px;
  }

  .thinking-indicator {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 5px;
    padding: 1px 0;
    font-size: 14px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.57;
    letter-spacing: normal;
    text-align: left;
    color: #777;
  }

  .thinking-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
  }

  .reasoning-toggle {
    background: none;
    border: none;
    color: #777;
  }

  .reasoning-content {
    font-size: 14px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.57;
    letter-spacing: normal;
    text-align: left;
    color: #777;
  }

  .message-content {
    /*min-width: 300px;*/
    /*flex-grow: 0;*/
    width: 100%;
    font-size: 14px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.57;
    letter-spacing: normal;
    text-align: left;
    color: #fff;
  }

  .message-bubble.user {
    padding: 12px 16px;
    border-radius: 15px;
    align-self: end;
    background-color: var(--color-bg-secondary);
  }

  .message-bubble.llm {
    align-self: start;
    background-color: var(--color-bg-primary);
  }
</style>