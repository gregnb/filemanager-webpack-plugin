import { defineConfig } from 'tsdown';

export default defineConfig({
  failOnWarn: false,
  format: ['esm', 'cjs'],
  dts: {
    build: true,
  },
  outDir: 'dist',
});
