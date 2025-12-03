<script lang="ts">
  import CopyIcon from '../assets/copy-icon.svg'
  import hljs from 'highlight.js/lib/core'
  import javascript from 'highlight.js/lib/languages/javascript'
  import typescript from 'highlight.js/lib/languages/typescript'
  import python from 'highlight.js/lib/languages/python'
  import java from 'highlight.js/lib/languages/java'
  import cpp from 'highlight.js/lib/languages/cpp'
  import rust from 'highlight.js/lib/languages/rust'
  import go from 'highlight.js/lib/languages/go'
  import bash from 'highlight.js/lib/languages/bash'
  import json from 'highlight.js/lib/languages/json'
  import xml from 'highlight.js/lib/languages/xml'
  import css from 'highlight.js/lib/languages/css'
  import sql from 'highlight.js/lib/languages/sql'

  hljs.registerLanguage('javascript', javascript)
  hljs.registerLanguage('js', javascript)
  hljs.registerLanguage('typescript', typescript)
  hljs.registerLanguage('ts', typescript)
  hljs.registerLanguage('python', python)
  hljs.registerLanguage('py', python)
  hljs.registerLanguage('java', java)
  hljs.registerLanguage('cpp', cpp)
  hljs.registerLanguage('c++', cpp)
  hljs.registerLanguage('rust', rust)
  hljs.registerLanguage('go', go)
  hljs.registerLanguage('bash', bash)
  hljs.registerLanguage('sh', bash)
  hljs.registerLanguage('json', json)
  hljs.registerLanguage('xml', xml)
  hljs.registerLanguage('html', xml)
  hljs.registerLanguage('css', css)
  hljs.registerLanguage('sql', sql)

  let { code, language }: { code: string; language?: string } = $props()

  const displayLanguage = $derived(language || 'plaintext')

  const highlightedCode = $derived.by(() => {
    if (!language) {
      return hljs.highlightAuto(code).value
    }

    if (hljs.getLanguage(language)) {
      try {
        return hljs.highlight(code, { language }).value
      } catch (error) {
        console.error('[HIGHLIGHT ERROR]', error)
        return code
      }
    }

    return hljs.highlightAuto(code).value
  })

  async function handleCopy() {
  }
</script>

<div class="code-container">
  <div class="code-header">
    <span class="language-label">{displayLanguage}</span>
    <button class="copy-button" onclick={handleCopy} type="button">
      <img src={CopyIcon} alt='copy'/>
      <span class="copy-text">Copy</span>
    </button>
  </div>
  <div class="code-content">
    <pre><code class="hljs language-{displayLanguage}">{@html highlightedCode}</code></pre>
  </div>
</div>

<style>
  .code-container {
    width: 100%;
    flex-grow: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0;
    border-radius: 16px;
    border: solid 1px #191919;
    overflow: hidden;
  }

  .code-header {
    width: 100%;
    height: 38px;
    flex-grow: 0;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    border-bottom: solid 1px #191919;
    background-color: rgba(25, 25, 25, 0.3);
  }

  .language-label {
    font-size: 12px;
    font-weight: 500;
    color: #777;
  }

  .copy-button {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 4px;
    background: none;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    font-family: var(--font-family);
  }

  .copy-button:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  .copy-text {
    font-size: 12px;
    font-weight: 500;
    color: #777;
  }

  .code-content {
    width: 100%;
    flex-grow: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 16px;
    background-color: #0e0e0e;
    overflow-x: auto;
  }

  .code-content pre {
    margin: 0;
    width: 100%;
  }

  .code-content code {
    padding: 0;
    font-family: var(--font-family-code);
    font-size: 12px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.5;
    letter-spacing: normal;
    text-align: left;
    color: #e1e4e8;
    background: none;
  }
</style>