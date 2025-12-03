<script lang="ts">
  import { messages, addMessage, updateMessage, appendToMessage } from '$lib/stores/conversation'
  import { clearError, isStreaming, isThinking, setError, setThinking } from '$lib/stores/ui'
  import MessageList from '$lib/components/MessageList.svelte'
  import ChatInput from '$lib/components/ChatInput.svelte'
  import type { Message } from '../../../shared/types'
  import { sendMessage } from '$lib/services/api'

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
  //   id: 'md-test-user',
  //   content: 'Show me examples of all Markdown features',
  //   sender: 'user',
  //   timestamp: Date.now(),
  //   status: 'complete',
  // })

  addMessage({
    id: 'md-test-llm',
    content: `# Markdown Features Demo

  ## Inline Formatting

  Here are the **bold text**, *italic text*, ~~strikethrough text~~ , and \`inline code\` examples.

  You can also combine them: **bold and _italic_**, or ***bold italic***.

  ## Headers

  # Level 1 Header
  ## Level 2 Header
  ### Level 3 Header
  #### Level 4 Header
  ##### Level 5 Header
  ###### Level 6 Header

  ## Lists

  Unordered list:
  - First item
  - Second item
    - Nested item
    - Another nested item
  - Third item

  Ordered list:
  1. First step
  2. Second step
  3. Third step

  ## Links

  Check out [Svelte](https://svelte.dev) and [TypeScript](https://www.typescriptlang.org/).

  ## Code Blocks

  JavaScript example:
  \`\`\`javascript
  function greet(name) {
    console.log(\`Hello, \${name}!\`);
    return true;
  }
  \`\`\`

  TypeScript example:
  \`\`\`typescript
  interface User {
    id: number;
    name: string;
  }

  const user: User = { id: 1, name: "Alice" };
  \`\`\`

  Python example:
  \`\`\`python
  def fibonacci(n):
      if n <= 1:
          return n
      return fibonacci(n-1) + fibonacci(n-2)
  \`\`\`

  ## Tables

  | Feature | Supported | Notes |
  | ------- | --------- | ----- |
  | Bold | ✅ Yes | Use **text** |
  | Italic | ✅ Yes | Use *text* |
  | Strikethrough | ✅ Yes | Use ~~text~~ |
  | Code | ✅ Yes | Use \`code\` |
  | Tables | ✅ Yes | GFM syntax |

  ## Blockquotes

  > This is a blockquote.
  > It can span multiple lines.
  >
  > And contain other Markdown elements like **bold** and *italic*.

  ## Horizontal Rule

  ---

  That's all the Markdown features we support!`,
    sender: 'llm',
    timestamp: Date.now(),
    status: 'complete',
  })
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
