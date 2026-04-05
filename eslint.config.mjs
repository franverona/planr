import eslint from '@eslint/js'
import angular from 'angular-eslint'
import prettierConfig from 'eslint-config-prettier'

export default [
  eslint.configs.recommended,
  ...angular.configs.tsRecommended,
  {
    files: ['**/*.ts'],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
    },
  },
  ...angular.configs.templateRecommended,
  ...angular.configs.templateAccessibility,
  prettierConfig,
]
