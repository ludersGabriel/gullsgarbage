/** Renders sanitized, server-side-produced markdown HTML. */
export function Markdown({ html }: { html: string }) {
  return <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
}
