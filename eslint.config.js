import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import { importX } from 'eslint-plugin-import-x';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';

export default defineConfig([
  {
    ignores: ['node_modules/**', 'dist/**', 'src/components/ui/**']
  },
  pluginVue.configs['flat/essential'],
  {
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
          ignorePatterns: ['router-view'],
        },
      ],
      'vue/multi-word-component-names': 'off',
      'import-x/order': [
        'error',
        {
          groups: [
            'builtin', // Node.js 내장 모듈 (예: 'fs', 'path')
            'external', // 외부 라이브러리/npm 패키지
            'internal', // 프로젝트 내부에서 설정한 별칭(alias)으로 시작하는 모듈 (예: '@/', '~/')
            'parent', // 부모 디렉토리로 가는 상대 경로 모듈 (예: '../components')
            'sibling', // 형제 디렉토리로 가는 상대 경로 모듈 (예: './styles')
            'index', // 현재 파일 내에서 가져오는 모듈 (예: './index.css')
            'object', // 알 수 없는/나머지 모듈 (항상 마지막에 위치)
          ],
          pathGroups: [
            // Vue 프로젝트에서 자주 사용하는 별칭(Alias)을 최상단 내부 모듈로 처리
            {
              pattern: '@/**',
              group: 'internal',
            },
            // 예: import Utils from '~/utils/utils.js'
            {
              pattern: '~/**',
              group: 'internal',
            },
          ],
          'newlines-between': 'always', // 각 그룹 사이에 빈 줄을 강제
          alphabetize: {
            order: 'asc', // 같은 그룹 내에서는 알파벳 순으로 정렬
            caseInsensitive: true, // 대소문자 구분 없이 정렬
          },
        },
      ],
    },
  },
]);
