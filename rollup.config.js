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
  external: ['archiver', 'cpy', 'del', 'schema-utils', 'fs', 'path', 'fs-extra'],
  output: {
    file: 'lib/index.js',
    format: 'cjs',
    sourcemap: true,
    exports: 'default',
  },
};
