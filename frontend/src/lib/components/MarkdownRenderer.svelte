<script lang="ts">
  import { fromMarkdown } from 'mdast-util-from-markdown'
  import { gfm } from 'micromark-extension-gfm'
  import { gfmFromMarkdown } from 'mdast-util-gfm'
  import CodeBlock from './CodeBlock.svelte'

  let { content }: { content: string } = $props()

  // Parse Markdown to AST with GFM support (tables, strikethrough, etc.)
  const ast = $derived.by(() => {
    try {
      return fromMarkdown(content, {
        extensions: [gfm()],
        mdastExtensions: [gfmFromMarkdown()]
      })
    } catch (error) {
      console.error('[MARKDOWN PARSE ERROR]', error)
      return { type: 'root', children: [{ type: 'text', value: content }] }
    }
  })

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

      case 'link':
        const linkText = node.children?.map(renderInline).join('') || ''
        return `<a href="${node.url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`

      case 'break':
        return '<br>'

      default:
        return node.children?.map(renderInline).join('') || ''
    }
  }

  function renderNode(node: any): string {
    switch (node.type) {
      case 'paragraph':
        return `<p>${node.children?.map(renderInline).join('') || ''}</p>`

      case 'heading':
        const level = Math.min(Math.max(node.depth || 1, 1), 6)
        const headingContent = node.children?.map(renderInline).join('') || ''
        return `<h${level}>${headingContent}</h${level}>`

      case 'code':
        // Handled by CodeBlock component in template
        return ''

      case 'blockquote':
        return `<blockquote>${node.children?.map(renderNode).join('') || ''}</blockquote>`

      case 'list':
        const listTag = node.ordered ? 'ol' : 'ul'
        const listItems = node.children?.map(renderNode).join('') || ''
        return `<${listTag}>${listItems}</${listTag}>`

      case 'listItem':
        return `<li>${node.children?.map(renderNode).join('') || ''}</li>`

      case 'table':
        return `<table>${node.children?.map(renderNode).join('') || ''}</table>`

      case 'tableRow':
        return `<tr>${node.children?.map(renderTableCell).join('') || ''}</tr>`

      case 'thematicBreak':
        return '<hr>'

      case 'html':
        // Sanitize HTML by escaping it (security)
        return `<p>${node.value}</p>`

      default:
        return ''
    }
  }

  function renderTableCell(node: any): string {
    const tag = node.type === 'tableCell' ? 'td' : 'th'
    const content = node.children?.map(renderInline).join('') || ''
    return `<${tag}>${content}</${tag}>`
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
    width: 100%;
    color: inherit;
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
    margin: 24px 0 16px 0;
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
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
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
    margin: 0 0 16px 0;
    padding-left: 24px;
  }

  .markdown-content :global(li) {
    margin: 4px 0;
  }

  .markdown-content :global(ul) {
    list-style-type: disc;
  }

  .markdown-content :global(ol) {
    list-style-type: decimal;
  }

  /* Code blocks */
  .markdown-content :global(pre) {
    margin: 16px 0;
    padding: 16px;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    overflow-x: auto;
  }

  .markdown-content :global(pre code) {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
    line-height: 1.5;
    color: #e6edf3;
  }

  /* Blockquotes */
  .markdown-content :global(blockquote) {
    margin: 16px 0;
    padding: 0 16px;
    border-left: 4px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.7);
  }

  /* Tables */
  .markdown-content :global(table) {
    width: 100%;
    margin: 16px 0;
    border-collapse: collapse;
    border-spacing: 0;
  }

  .markdown-content :global(th),
  .markdown-content :global(td) {
    padding: 8px 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    text-align: left;
  }

  .markdown-content :global(th) {
    background-color: rgba(255, 255, 255, 0.05);
    font-weight: 600;
  }

  .markdown-content :global(tr:nth-child(even)) {
    background-color: rgba(255, 255, 255, 0.02);
  }

  /* Horizontal rule */
  .markdown-content :global(hr) {
    margin: 24px 0;
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }

  /* Syntax highlighting theme (GitHub Dark) */
  .markdown-content :global(.hljs) {
    background: transparent;
  }

  .markdown-content :global(.hljs-comment) { color: #8b949e; }
  .markdown-content :global(.hljs-keyword) { color: #ff7b72; }
  .markdown-content :global(.hljs-string) { color: #a5d6ff; }
  .markdown-content :global(.hljs-number) { color: #79c0ff; }
  .markdown-content :global(.hljs-function) { color: #d2a8ff; }
  .markdown-content :global(.hljs-class) { color: #ffa657; }
  .markdown-content :global(.hljs-title) { color: #ffa657; }
  .markdown-content :global(.hljs-variable) { color: #ffa657; }
  .markdown-content :global(.hljs-built_in) { color: #ffa657; }
  .markdown-content :global(.hljs-attr) { color: #79c0ff; }
  .markdown-content :global(.hljs-attribute) { color: #79c0ff; }
  .markdown-content :global(.hljs-tag) { color: #7ee787; }
  .markdown-content :global(.hljs-operator) { color: #ff7b72; }
  .markdown-content :global(.hljs-punctuation) { color: #e6edf3; }
</style>
