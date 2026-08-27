import matter from 'gray-matter'

export interface ParsedFile {
  data: Record<string, unknown>
  content: string
}

/** Split YAML frontmatter from markdown body. */
export function parseFrontmatter(raw: string): ParsedFile {
  const parsed = matter(raw)
  return {
    data: parsed.data as Record<string, unknown>,
    content: parsed.content.trim(),
  }
}

/** Human-readable error for invalid/missing frontmatter. */
export class ContentError extends Error {
  readonly file: string
  readonly issues: string[]

  constructor(file: string, issues: string[]) {
    super(`invalid content in ${file}\n${issues.map((i) => `  - ${i}`).join('\n')}`)
    this.name = 'ContentError'
    this.file = file
    this.issues = issues
  }
}

/** Format zod issues as readable lines. */
export function formatZodIssues(error: {
  issues: { path: PropertyKey[]; message: string }[]
}): string[] {
  return error.issues.map((i) => {
    const path = i.path.length ? i.path.join('.') : '(root)'
    return `${path}: ${i.message}`
  })
}
