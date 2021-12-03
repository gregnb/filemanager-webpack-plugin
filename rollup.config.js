import { defineConfig } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

const config = defineConfig({
  input: 'src/index.js',
  plugins: [
    json(),
    nodeResolve({
      preferBuiltins: true,
    }),
  ],
  external: ['normalize-path', 'archiver', 'fast-glob', 'del', 'fs-extra', 'is-glob', 'schema-utils', 'fs', 'path'],
  output: {
    file: 'dist/index.cjs',
    format: 'cjs',
    sourcemap: true,
    exports: 'auto',
  },
});

export default config;
