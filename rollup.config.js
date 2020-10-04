import { babel } from '@rollup/plugin-babel';
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
    babel({
      babelHelpers: 'bundled',
    }),
    nodeResolve({
      preferBuiltins: true,
    }),
  ],
  external: ['archiver', 'cpy', 'make-dir', 'mv', 'rimraf', 'schema-utils', 'cp-file', 'fs', 'path'],
  output: {
    file: 'lib/index.js',
    format: 'cjs',
    sourcemap: true,
    exports: 'default',
  },
};
