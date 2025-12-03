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
        return `<code class="inline-code">${node.value}</code>`
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
      <CodeBlock code={node.value || ''} language={node.lang || undefined}/>
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

  /* Typography */
  .markdown-content :global(p) {
    margin: 0 0 16px 0;
    line-height: 1.57;
  }

  .markdown-content :global(p:last-child) {
    margin-bottom: 0;
  }

  /* Headers */
  .markdown-content :global(h1),
  .markdown-content :global(h2),
  .markdown-content :global(h3),
  .markdown-content :global(h4),
  .markdown-content :global(h5),
  .markdown-content :global(h6) {
    margin-top: 24px;
    font-weight: 600;
    line-height: 1.25;
  }

  .markdown-content :global(h1:first-child),
  .markdown-content :global(h2:first-child),
  .markdown-content :global(h3:first-child),
  .markdown-content :global(h4:first-child),
  .markdown-content :global(h5:first-child),
  .markdown-content :global(h6:first-child) {
    margin-top: 0;
  }

  .markdown-content :global(h1) { font-size: 28px; }
  .markdown-content :global(h2) { font-size: 24px; }
  .markdown-content :global(h3) { font-size: 20px; }
  .markdown-content :global(h4) { font-size: 16px; }
  .markdown-content :global(h5) { font-size: 14px; }
  .markdown-content :global(h6) { font-size: 12px; }

  /* Inline formatting */
  .markdown-content :global(strong) {
    font-weight: 600;
  }

  .markdown-content :global(em) {
    font-style: italic;
  }

  .markdown-content :global(del) {
    text-decoration: line-through;
  }

  .markdown-content :global(.inline-code) {
    padding: 2px 6px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    font-family: var(--font-family-code);
    font-size: 0.9em;
  }

  /* Links */
  .markdown-content :global(a) {
    color: #58a6ff;
    text-decoration: none;
  }

  .markdown-content :global(a:hover) {
    text-decoration: underline;
  }

  /* Lists */
  .markdown-content :global(ul),
  .markdown-content :global(ol) {
    padding-left: 16px;
  }

  .markdown-content :global(li) {
    margin: 6px 0;
    line-height: 1.6;
  }

  .markdown-content :global(ul) {
    list-style-type: disc;
    list-style-position: outside;
  }

  .markdown-content :global(ol) {
    list-style-type: decimal;
    list-style-position: outside;
  }

  .markdown-content :global(ul ul) {
    list-style-type: circle;
  }

  .markdown-content :global(ul ul ul) {
    list-style-type: square;
  }

  /* Tables */
  .markdown-content :global(table) {
    width: 100%;
    border-collapse: collapse;
  }

  .markdown-content :global(th),
  .markdown-content :global(td) {
    padding: 10px 0;
    border-bottom: 1px solid #191919;
    text-align: left;
    vertical-align: top;
  }

  .markdown-content :global(th) {
    font-weight: 700;
  }

  /* Horizontal rule */
  .markdown-content :global(hr) {
    margin: 212x 0;
    border: none;
    width: 100%;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }
</style>
