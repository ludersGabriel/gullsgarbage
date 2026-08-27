import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSanitize, { defaultSchema, type Options } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'

type HastNode = {
  type: string
  tagName?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

/** Add `target="_blank" rel="noopener noreferrer"` to absolute external links. */
function externalLinks() {
  return (tree: HastNode) => {
    const visit = (node: HastNode | undefined): void => {
      if (!node || typeof node !== 'object') return
      if (node.type === 'element') {
        if (
          node.tagName === 'a' &&
          typeof node.properties?.href === 'string' &&
          /^https?:\/\//i.test(node.properties.href)
        ) {
          node.properties.target = '_blank'
          node.properties.rel = 'noopener noreferrer'
        }
      }
      node.children?.forEach(visit)
    }
    visit(tree)
  }
}

const schema: Options = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a ?? []), 'target', 'rel'],
    code: [...(defaultSchema.attributes?.code ?? []), ['className', /^language-/]],
  },
}

/** Wrapper so unified sees a plain plugin (no options) — avoids `.use()` typing friction. */
function sanitize() {
  return rehypeSanitize(schema)
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(externalLinks)
  .use(sanitize)
  .use(rehypeStringify)

/** Render markdown (GFM) to sanitized HTML. */
export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await processor.process(markdown)
  return String(file)
}
