import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.js',
  plugins: [
    babel({
      babelHelpers: 'bundled',
    }),
    nodeResolve(),
  ],
  output: {
    file: 'lib/index.js',
    format: 'cjs',
    sourcemap: true,
    exports: 'default',
  },
};
