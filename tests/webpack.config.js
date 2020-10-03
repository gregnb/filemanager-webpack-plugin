const path = require('path');
const webpack = require('webpack');

const FileManagerPlugin = require('../lib');

const plainConfig = {
  context: __dirname,
  entry: path.resolve(__dirname, '../example/index.js'),
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  plugins: [
    new FileManagerPlugin({
      /*
      onEnd: [
        {
          delete: [
            "./dist/bundle.js"
          ]
        }
      ]
      */
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
};

module.exports = [plainConfig];
