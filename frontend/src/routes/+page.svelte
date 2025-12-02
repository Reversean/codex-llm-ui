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
      updateMessage(llmMsg.id, {
        content: llmResponse.message,
        status: 'complete',
      })
    } catch (error) {
      handleError(llmMsg.id, error as Error)
      setThinking(false)
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

  // ========== MARKDOWN RENDERING TEST ==========
  // Uncomment the block below to test all Markdown features
  //
  // addMessage({
  //   id: 'md-test-user',
  //   content: 'Show me examples of all Markdown features',
  //   sender: 'user',
  //   timestamp: Date.now(),
  //   status: 'complete',
  // })
  //
  // addMessage({
  //   id: 'md-test-llm',
  //   content: `# Markdown Features Demo
  //
  // ## Inline Formatting
  //
  // Here are the **bold text**, *italic text*, ~~strikethrough text~~, and \`inline code\` examples.
  //
  // You can also combine them: **bold and _italic_**, or ***bold italic***.
  //
  // ## Headers
  //
  // ### Level 3 Header
  // #### Level 4 Header
  // ##### Level 5 Header
  // ###### Level 6 Header
  //
  // ## Lists
  //
  // Unordered list:
  // - First item
  // - Second item
  //   - Nested item
  //   - Another nested item
  // - Third item
  //
  // Ordered list:
  // 1. First step
  // 2. Second step
  // 3. Third step
  //
  // ## Links
  //
  // Check out [Svelte](https://svelte.dev) and [TypeScript](https://www.typescriptlang.org/).
  //
  // ## Code Blocks
  //
  // JavaScript example:
  // \`\`\`javascript
  // function greet(name) {
  //   console.log(\`Hello, \${name}!\`);
  //   return true;
  // }
  // \`\`\`
  //
  // TypeScript example:
  // \`\`\`typescript
  // interface User {
  //   id: number;
  //   name: string;
  // }
  //
  // const user: User = { id: 1, name: "Alice" };
  // \`\`\`
  //
  // Python example:
  // \`\`\`python
  // def fibonacci(n):
  //     if n <= 1:
  //         return n
  //     return fibonacci(n-1) + fibonacci(n-2)
  // \`\`\`
  //
  // ## Tables
  //
  // | Feature | Supported | Notes |
  // | ------- | --------- | ----- |
  // | Bold | ✅ Yes | Use **text** |
  // | Italic | ✅ Yes | Use *text* |
  // | Strikethrough | ✅ Yes | Use ~~text~~ |
  // | Code | ✅ Yes | Use \`code\` |
  // | Tables | ✅ Yes | GFM syntax |
  //
  // ## Blockquotes
  //
  // > This is a blockquote.
  // > It can span multiple lines.
  // >
  // > And contain other Markdown elements like **bold** and *italic*.
  //
  // ## Horizontal Rule
  //
  // ---
  //
  // That's all the Markdown features we support!`,
  //   sender: 'llm',
  //   timestamp: Date.now(),
  //   status: 'complete',
  // })
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
    margin: 0 auto;
    overflow: hidden;
  }

  .chat-message-list {
    position: absolute;
    top: 87px;
    bottom: 107px;
    left: 0;
    right: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding-bottom: 124px;
  }

  .chat-input {
    position: fixed;
    bottom: 57px;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    z-index: 10;
  }
</style>
