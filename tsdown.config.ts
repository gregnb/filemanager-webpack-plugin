import { defineConfig } from 'tsdown';

export default defineConfig({
  format: ['esm', 'cjs'],
  dts: {
    build: true,
  },
  outDir: 'dist',
});
