import { validateContent } from '../src/content/validate'

const errors = await validateContent()

if (errors.length > 0) {
  console.error(`content validation failed with ${errors.length} error(s):`)
  for (const error of errors) console.error(`  - ${error}`)
  process.exit(1)
}

console.log('content OK')
