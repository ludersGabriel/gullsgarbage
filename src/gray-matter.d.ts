/**
 * Ambient types for `gray-matter`. The package ships `gray-matter.d.ts` but
 * declares no `types` field, so TS can't discover it under Bundler resolution.
 * We declare only the surface this app uses.
 */
declare module 'gray-matter' {
  interface GrayMatterFile {
    data: Record<string, unknown>
    content: string
    excerpt?: string
    orig: string | Buffer
    language: string
    matter: string
    stringify(lang: string): string
  }

  function matter(input: string | Buffer | { content: string }): GrayMatterFile

  namespace matter {
    function read(fp: string): GrayMatterFile
    function stringify(file: string | { content: string }, data: object): string
    function test(str: string): boolean
  }

  export = matter
}
