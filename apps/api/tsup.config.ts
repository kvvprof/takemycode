import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts'],
  target: 'node22',
  format: ['esm'],
  sourcemap: true,
  splitting: false,
  clean: true,
});
