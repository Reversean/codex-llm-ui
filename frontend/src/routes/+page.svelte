<script lang="ts">
  import {messages, addMessage, updateMessage, appendToMessage} from '$lib/stores/conversation'
  import {clearError, isStreaming, isThinking, setError, setStreaming, setThinking} from '$lib/stores/ui'
  import MessageList from "$lib/components/MessageList.svelte"
  import ChatInput from "$lib/components/ChatInput.svelte"
  import type {ChatRequest, Message} from "../../../shared/types"
  import {sendMessage} from "$lib/services/api"

  const isDisabled = $derived($isThinking || $isStreaming)

  async function handleSendMessage(userMessage: string) {
    clearError()

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      content: userMessage,
      sender: 'user',
      timestamp: Date.now(),
      status: 'complete',
    }

    addMessage(userMsg)

    const llmMsg: Message = {
      id: `llm-${Date.now()}`,
      content: '',
      sender: 'llm',
      timestamp: Date.now(),
      status: 'pending',
    }

    addMessage(llmMsg)
    setThinking(true)

    try {
      const llmResponse = await sendMessage(userMessage)
      setThinking(false)
      appendToMessage(llmMsg.id, llmResponse.message)
    } catch (error) {
      handleError(llmMsg.id, error as Error)
    }
  }

  function handleError(messageId: string, error: Error) {
    updateMessage(messageId, {
      status: 'error',
      content: error.message || 'Failed to get response',
    })
    setError(error.message || 'Failed to get response')
    setThinking(false)
  }

  // addMessage({
  //   id: '1',
  //   content: 'Explain me the reason of error caught in my application: FinalizationRegistry is not defined',
  //   sender: 'user',
  //   timestamp: Date.now(),
  //   status: 'pending'
  // })
  // addMessage({id: '2', content: 'test2', sender: 'llm', timestamp: Date.now(), status: 'streaming'})
  // addMessage({id: '3', content: 'test3', sender: 'user', timestamp: Date.now(), status: 'complete'})
  // addMessage({id: '4', content: 'test4', sender: 'llm', timestamp: Date.now(), status: 'error'})
  //
  // for (let i: number = 5; i < 42; i++) {
  //   addMessage({id: i.toString(), content: `test${i}`, sender: 'llm', timestamp: Date.now(), status: 'error'})
  // }
</script>

<div class="chat-container">
  <div class="chat-message-list">
    <MessageList messages={$messages}/>
  </div>
  <div class="chat-input">
    <ChatInput onSubmit={handleSendMessage} disabled={isDisabled}/>
  </div>
</div>

<style>
  .chat-container {
    position: relative;
    width: 600px;
    height: 100vh;
    max-height: 100vh;
    margin: 0 auto 0 auto;
    padding: 0 0 107px 0;
  }

  .chat-message-list {
    position: relative;
    overflow-y: scroll;
    width: 100%;
    height: 100%;
    padding-top: 87px;
  }

  .chat-input {
    position: relative;
    width: 100%;
    bottom: 107px;
  }
</style>
