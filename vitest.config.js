import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/*.test.js'],
    pool: 'forks',
    testTimeout: 10000,
  },
});
