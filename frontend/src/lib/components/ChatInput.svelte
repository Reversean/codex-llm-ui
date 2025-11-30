<script lang="ts">
  import type {Action} from 'svelte/action'
  import AttachIcon from '../assets/attach-icon.svg'
  import SendIcon from '../assets/send-icon.svg'

  let {onSubmit, disabled = false}: { onSubmit: (message: string) => void; disabled?: boolean } = $props()

  let value = $state('')

  const placeholder = $derived(disabled ? 'Thinking...' : 'Ask anything...')

  const autoresize: Action<HTMLTextAreaElement> = (node) => {
    const resize = () => {
      node.style.height = 'auto'
      node.style.height = `${node.scrollHeight}px`
    }

    resize()
    node.addEventListener('input', resize)

    return {
      destroy: () => node.removeEventListener('input', resize)
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  function handleSubmit() {
    console.log('clicked \'Send\'')
    const trimmed = value.trim()
    if (!trimmed || disabled) return

    onSubmit(trimmed)
    value = ''
  }
</script>

<div class="chat-input-wrapper">
  <div class="chat-input-shadow"></div>
  <div class="chat-input-container">
    <textarea
      bind:value
      use:autoresize
      {placeholder}
      {disabled}
      onkeydown={handleKeyDown}
      rows="1"
      class="resizable-textarea"
    ></textarea>

    <div class="chat-input-buttons-container">
      <button class="attach-button" type="button">
        <img src={AttachIcon} alt='attach'/>
        <span class="attach">Attach</span>
      </button>
      <button onclick={handleSubmit} {disabled} class="send-button" type="button">
        <img src={SendIcon} alt='send'/>
        <span class="send">Send</span>
      </button>
    </div>
  </div>
</div>

<style>
  .chat-input-wrapper {
    width: 100%;
    /*margin: 0 auto;*/
    position: relative;
  }

  .chat-input-shadow {
    /*vertical-align:top;*/
    position: absolute;
    width: 100%;
    height: 93px;
    background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0), var(--color-bg));
  }

  .chat-input-container {
    position: absolute;
    width: 100%;
    min-height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    gap: 22px;
    padding: 14px 16px;
    margin-top: 79px;
    border-radius: 16px;
    border: solid 1px #191919;
    background-color: #0e0e0e;
  }

  .resizable-textarea {
    width: 100%;
    max-height: 90px;
    resize: none;
    font-size: 14px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.57;
    letter-spacing: normal;
    text-align: left;
    overflow: scroll;
    color: var(--color-text-primary);
    background-color: transparent;
    border-style: none;
  }

  .resizable-textarea::placeholder {
    color: var(--color-text-secondary);
  }

  .resizable-textarea:focus {
    outline: none;
  }

  .chat-input-buttons-container {
    height: 28px;
    align-self: stretch;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
    padding: 0;
  }

  .attach-button {
    width: 86px;
    height: 28px;
    flex-grow: 0;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 4px;
    padding: 3px 11px;
    border-radius: 16px;
    border: solid 1px #191919;
    background-color: #0e0e0e;
  }

  .send-button {
    width: 77px;
    height: 28px;
    flex-grow: 0;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 4px;
    padding: 3px 11px;
    border-radius: 16px;
    background-color: #fff;
    font-size: 14px;
    font-weight: 500;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.57;
    letter-spacing: normal;
    text-align: left;

  }

  .attach {
    color: #777;
  }

  .send {
    color: var(--black);
  }
</style>