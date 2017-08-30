import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  plugins: [
    babel({
      "presets": ["es2015-rollup"]
    })
  ],
  output: {
    file: 'lib/index.js',
    format: 'cjs'
  }
};
