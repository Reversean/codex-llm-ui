<script lang="ts">
  import { fromMarkdown } from 'mdast-util-from-markdown'
  import { gfmFromMarkdown } from 'mdast-util-gfm'
  import { gfm } from 'micromark-extension-gfm'
  import CodeBlock from './CodeBlock.svelte'

  let { content }: { content: string } = $props()

  const ast = $derived.by(() => {
    try {
      return fromMarkdown(
        content,
        {
          extensions: [gfm()],
          mdastExtensions: [gfmFromMarkdown()],
        },
      )
    } catch (e) {
      console.error('[MARKDOWN PARSE ERROR]', e)
      throw e
    }
  })

  function renderNode(node: any): string {
    switch (node.type) {
      case 'paragraph':
        return `<p>${node.children?.map(renderInline).join('') || ''}</p>`
      case 'heading': {
        const level = node.depth
        const content = node.children?.map(renderInline).join('') || ''
        return `<h${level}>${content}</h${level}>`
      }
      case 'list': {
        const listTag = node.ordered ? 'ol' : 'ul'
        const items = node.children?.map(renderNode).join('') || ''
        return `<${listTag}>${items}</${listTag}>`
      }
      case 'listItem':
        return `<li>${node.children?.map(renderNode).join('') || ''}</li>`
      case 'table':
        return `<table>${node.children?.map(renderNode).join('') || ''}</table>`
      case 'tableRow':
        return `<tr>${node.children?.map(renderTableCell).join('') || ''}</tr>`
      case 'thematicBreak':
        return '<hr/>'
      case 'code': {
        const highlighted = highlightCode(node.value || '', node.lang)

        const a = ``

        return `<pre><code class="hljs language-${node.lang || 'plaintext'}">${highlighted}</code></pre>`
      }
      default:
        return ''
    }
  }

  function renderInline(node: any): string {
    switch (node.type) {
      case 'text':
        return node.value
      case 'strong':
        return `<strong>${node.children?.map(renderInline).join('') || ''}</strong>`
      case 'emphasis':
        return `<em>${node.children?.map(renderInline).join('') || ''}</em>`
      case 'delete':
        return `<del>${node.children?.map(renderInline).join('') || ''}</del>`
      case 'inlineCode':
        return `<code class="inline-code">${node.children?.map(renderInline).join('') || ''}</code>`
      case 'link': {
        const linkText = node.children?.map(renderInline).join('') || ''
        return `<a href="${node.url}">${linkText}</a>`
      }
      case 'break':
        return `<br/>`
      default:
        return ''
    }
  }

  function renderTableCell(node: any): string {
    const tag = node.type === 'tableCell' ? 'td' : 'th'
    const content = node.children?.map(renderInline).join('') || ''
    return `<${tag}>${content}</${tag}>`
  }

  function highlightCode(code: string, lang?: string): string {
    if (!lang) {
      return code;
    }
    return code;
  }
</script>

<div class="markdown-content">
  {#each ast.children || [] as node, index (index)}
    {#if node.type === 'code'}
      <CodeBlock code={node.value || ''} language={node.lang || undefined} />
    {:else}
      {@html renderNode(node)}
    {/if}
  {/each}
</div>


<style>
  .markdown-content {
    flex-grow: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 26px;
    padding: 0;
    border-radius: 15px;
  }
</style>
