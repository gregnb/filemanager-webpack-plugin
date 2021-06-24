import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: 'src/index.js',
  plugins: [
    commonjs({
      include: 'node_modules/**',
    }),
    json(),
    nodeResolve({
      preferBuiltins: true,
    }),
  ],
  external: ['archiver', 'cpy', 'del', 'fs-extra', 'is-glob', 'schema-utils', 'node:fs', 'node:path'],
  output: {
    file: 'dist/index.cjs',
    format: 'cjs',
    sourcemap: true,
    exports: 'auto',
  },
};
