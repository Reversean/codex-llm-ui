<script lang="ts">
  import type {Message} from "../../../../shared/types"

  let {message}: { message: Message } = $props()

  const isUser = $derived(message.sender === 'user')
  const isStreaming = $derived(message.status === 'streaming')
  const isPending = $derived(message.status === 'pending')
  const isError = $derived(message.status === 'error')
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
  <span class="message-content">
    {message.content}
  </span>
</div>


<style>
  .message-bubble {
    min-width: 300px;
    max-width: 454px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-radius: 15px;

  }

  .message-content {
    width: 100%;
    height: 100%;
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

  .user {
    align-self: end;
    background-color: var(--color-bg-secondary);
  }

  .llm {
    align-self: start;
    background-color: var(--color-bg-primary);
  }
</style>