import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

export default tseslint.config(
  {
    ignores: ['.output/**', 'dist/**', '.tanstack/**', 'node_modules/**', 'src/routeTree.gen.ts'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      ...reactHooks.configs.flat.recommended.rules,
    },
  },
  {
    // Browser-side script injected into Unity WebGL builds (not a Node module).
    files: ['scripts/unity-loader-patch.js'],
    languageOptions: {
      globals: globals.browser,
    },
  },
)
