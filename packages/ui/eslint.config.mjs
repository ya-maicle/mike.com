import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

/**
 * Minimal flat ESLint config for the UI package (no Next.js dependency).
 * - Parses TS/TSX with @typescript-eslint/parser
 * - Keeps rules minimal in Phase 0
 * - Avoids requiring eslint-config-next in this non-Next workspace package
 */
export default [
  {
    ignores: ['dist/**', 'storybook-static/**']
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }]
    }
  },
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }]
    }
  }
]
