export default {
  files: ['tests/*.test.js'],
  babel: true,
  serial: false,
  verbose: true,
  require: ['@babel/register', 'regenerator-runtime/runtime'],
};
