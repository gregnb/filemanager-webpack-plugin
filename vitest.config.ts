import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    pool: 'forks',
    testTimeout: 10000,
    exclude: ['node_modules', '.tsbuild'],
  },
});
