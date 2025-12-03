<script lang="ts">
  import { messages, addMessage, updateMessage, appendToMessage } from '$lib/stores/conversation'
  import { clearError, isStreaming, isThinking, setError, setStreaming, setThinking } from '$lib/stores/ui'
  import MessageList from '$lib/components/MessageList.svelte'
  import ChatInput from '$lib/components/ChatInput.svelte'
  import type { Message } from '../../../shared/types'
  import { sendMessageStream } from '$lib/services/api'

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

    let reasoningContent = ''
    let reasoningStartTime = 0

    try {
      await sendMessageStream(userMessage, {
        onStart: () => {
          console.log('[STREAM] Generation started')
        },
        onReasoningStart: () => {
          reasoningStartTime = Date.now()
          reasoningContent = ''
          setThinking(true)
          updateMessage(llmMsg.id, {
            status: 'streaming',
            reasoning: {
              content: '',
              isExpanded: false,
              startTime: reasoningStartTime,
            },
          })
        },
        onReasoningDelta: (delta) => {
          reasoningContent += delta
          updateMessage(llmMsg.id, {
            reasoning: {
              content: reasoningContent,
              isExpanded: false,
              startTime: reasoningStartTime,
            },
          })
        },
        onReasoningEnd: () => {
          setThinking(false)
          updateMessage(llmMsg.id, {
            reasoning: {
              content: reasoningContent,
              isExpanded: false,
              startTime: reasoningStartTime,
              endTime: Date.now(),
            },
          })
        },
        onTextStart: () => {
          setStreaming(true)
          updateMessage(llmMsg.id, {
            status: 'streaming',
          })
        },
        onTextDelta: (delta) => {
          appendToMessage(llmMsg.id, delta)
        },
        onTextEnd: () => {
          setStreaming(false)
        },
        onFinish: () => {
          setThinking(false)
          setStreaming(false)
          updateMessage(llmMsg.id, {
            status: 'complete',
          })
        },
        onError: (error) => {
          handleError(llmMsg.id, new Error(error))
        },
      })
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
</script>

<div class="chat-container">
  <div class="chat-message-list">
    <MessageList messages={$messages}/>
  </div>
  <div class="chat-input">
    <ChatInput onSubmit={handleSendMessage} disabled={isDisabled} />
  </div>
</div>

<style>
  .chat-container {
    position: relative;
    width: 600px;
    height: 100%;
    margin: 0 auto;
  }

  .chat-message-list {
    position: absolute;
    top: 87px;
    bottom: 107px;
    width: 100%;
    overflow-y: auto;
    padding-bottom: 124px;
  }

  .chat-input {
    position: absolute;
    bottom: 57px;
    width: 100%;
  }
</style>
