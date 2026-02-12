import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import 'eslint-plugin-only-error'
import security from 'eslint-plugin-security'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig([
  {
    ignores: ['dist/', 'src/packages/cdm/generated/']
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  security.configs.recommended,
  prettier,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      'security/detect-object-injection': 'off',
      'no-duplicate-imports': 'error',
      'no-throw-literal': 'error'
    }
  }
])
