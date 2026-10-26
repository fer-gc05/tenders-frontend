import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// Configuración de ESLint para TypeScript y Vue 3
export default [
  // Carpetas que ESLint debe ignorar
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
  },
  // Reglas recomendadas de JavaScript
  js.configs.recommended,
  // Reglas recomendadas de TypeScript
  ...tseslint.configs.recommended,
  // Reglas recomendadas de Vue
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      // Variables globales disponibles en navegador y Node.js
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      // Prohíbe el uso de any explícito en TypeScript
      '@typescript-eslint/no-explicit-any': 'error',
      // Permite nombres de componentes de una sola palabra
      'vue/multi-word-component-names': 'off',
    },
  },
]
