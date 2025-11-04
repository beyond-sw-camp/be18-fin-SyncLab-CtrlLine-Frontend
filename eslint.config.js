import js from '@eslint/js';
import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';
import { defineConfig } from 'eslint/config';
import { importX } from 'eslint-plugin-import-x';

export default defineConfig([
  pluginVue.configs['flat/essential'],
  {
    ignores: ['node_modules/**', 'dist/**'],
    files: ['**/*.{js,mjs,cjs,vue}'],
    plugins: { js },
    extends: ['js/recommended', importX.flatConfigs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      'import-x/resolver': {
        alias: {
          map: [['@', './src']],
          extensions: ['.vue', '.js', '.json'],
        },
      },
    },
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'vue/no-undef-components': [
        'error',
        {
          ignorePatterns: ['custom(\\-\\w+)+', 'g-gantt-chart', 'g-gantt-row'],
        },
      ],
      'vue/multi-word-component-names': 'off',
    },
  },
]);
