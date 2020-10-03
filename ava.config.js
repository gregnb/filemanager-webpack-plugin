export default {
  files: ['tests/*.test.js'],
  babel: true,
  verbose: true,
  require: ['@babel/register', 'regenerator-runtime/runtime'],
};
