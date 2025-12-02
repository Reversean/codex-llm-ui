<script lang="ts">
  import type {Message} from "../../../../shared/types"
  import MessageBubble from "$lib/components/MessageBubble.svelte"

  let {messages}: { messages: Message[] } = $props()
</script>

<div class="message-list-container">
  {#each messages as message (message.id)}
    <MessageBubble {message}/>
  {/each}
</div>

<style>
  .message-list-container {
    width: 100%;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    gap: 30px;
  }
</style>