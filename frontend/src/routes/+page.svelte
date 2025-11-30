<script lang="ts">
  import {messages, addMessage, updateMessage, appendToMessage} from '$lib/stores/conversation'
  import {clearError, isStreaming, isThinking, setError, setThinking} from '$lib/stores/ui'
  import MessageList from '$lib/components/MessageList.svelte'
  import ChatInput from '$lib/components/ChatInput.svelte'
  import type {Message} from '../../../shared/types'
  import {sendMessage} from '$lib/services/api'

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
  //   id: '1001',
  //   content: 'Explain me the reason of error caught in my application: FinalizationRegistry is not defined',
  //   sender: 'user',
  //   timestamp: Date.now(),
  //   status: 'complete',
  // })
  //
  // addMessage({
  //   id: '1002',
  //   reasoning: {
  //     content: 'The user is asking for an explanation of the error “FinalizationRegistry ' +
  //       'is not defined.” I should describe what FinalizationRegistry is, why the error ' +
  //       'occurs, and in which environments it happens. Then I should explain how to fix ' +
  //       'it by updating the runtime or checking for feature support.\n\nI should also ' +
  //       'provide clear examples that illustrate the problem and its solutions, such as ' +
  //       'showing a code snippet that checks for the existence of FinalizationRegistry, ' +
  //       'and give practical advice for developers working in older Node.js or browser environments.',
  //     isExpanded: true,
  //     startTime: Date.now() - 4,
  //     endTime: Date.now(),
  //   },
  //
  //   content: 'The error “FinalizationRegistry is not defined” means that your JavaScript ' +
  //     'environment does not support the built-in __FinalizationRegistry__ API — a relatively ' +
  //     'new feature introduced in ES2021 (ES12).\n\nLet’s break this down 👇\n\n' +
  //     '### 🧩 What FinalizationRegistry Is\n\n' +
  //     'FinalizationRegistry is a JavaScript API that lets you register an object and a ' +
  //     'cleanup callback that will be called when the object is garbage-collected.\nExample:\n\n' +
  //     '```js\n' +
  //     'const registry = new FinalizationRegistry((heldValue) => {\n' +
  //     '  console.log(`${heldValue} has been garbage collected`);\n' +
  //     '});\n' +
  //     '\n' +
  //     'let obj = {};\n' +
  //     'registry.register(obj, "my object");\n' +
  //     '\n' +
  //     'obj = null; // Once garbage collected, callback runs eventually\n' +
  //     '```\n\n' +
  //     '### 🌟 Why You Get the Error\n\n' +
  //     'When your code runs in an environment that **does not implement** this API, you’ll see:\n\n' +
  //     '```\n' +
  //     'ReferenceError: FinalizationRegistry is not defined\n' +
  //     '```\n\n' +
  //     'Common causes:\n\n' +
  //     '| Environment | Reason |\n' +
  //     '| ----------- | ------ |\n' +
  //     '| Old Node.js version (< v14.6) | FinalizationRegistry wasn’t added yet |\n' +
  //     '| Browser too old | Not supported in some older versions of Chrome, Safari, Firefox, etc. |\n' +
  //     '| Serverless or embedded runtimes | Some JS runtimes (like older Cloudflare Workers or Electron) may disable or omit it |\n\n' +
  //     '### 🧰 How to Fix It\n\n' +
  //     '**Avoid Using It Directly.** If you only used it for cleanup, consider:\n\n' +
  //     '- Manual cleanup (explicit .dispose() methods)\n' +
  //     '- WeakRefs (if supported)\n' +
  //     '- Environment-specific wrappers',
  //   sender: 'llm',
  //   timestamp: Date.now(),
  //   status: 'complete',
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
