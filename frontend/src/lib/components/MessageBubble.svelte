<script lang="ts">
  import type { Message } from '../../../../shared/types'
  import { toggleReasoningExpanded } from '../stores/conversation'
  import MarkdownRenderer from './MarkdownRenderer.svelte'
  import chevron from '$lib/assets/chevron-down.svg'

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

  const renderedReasoning = $derived.by(() => {
    return message.reasoning?.content
  })

  const renderedContent = $derived.by(() => {
    return message.content
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
      <div class="reasoning-content">
        <MarkdownRenderer content={renderedReasoning || ''} />
      </div>
      {/if}
    </div>
  {:else if isPending}
    <span class='thinking-indicator'>Thinking...</span>
  {/if}
  <div class="message-content">
    {#if isUser}
      {message.content}
    {:else}
      <MarkdownRenderer content={renderedContent} />
    {/if}
  </div>
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
    min-width: 300px;
    max-width: 454px;
    flex-grow: 0;
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