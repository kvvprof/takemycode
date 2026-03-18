import { defineConfig } from 'eslint/config';
import base from './base.js';

export default defineConfig([
  ...base,
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
]);
