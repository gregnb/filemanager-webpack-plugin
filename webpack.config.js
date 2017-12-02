const path = require('path');
const webpack = require('webpack');

const FileManagerPlugin = require('./lib');

module.exports = {
  watch: true,
  entry: path.resolve(__dirname, 'example/index.js'),
  stats: "verbose",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style!css' }
    ]
  },
  plugins: [
    new FileManagerPlugin({
      onEnd: {
        copy: [
          { source: "./dist", destination: "./testing1" },
          { source: "./dist", destination: "./testing2" },
          { source: "./dist/bundle.js", destination: "./newfile.js" }
        ],
      }
      /*
      onEnd: [
        {
          copy: [
            { source: "./dist/bundle.js", destination: "./newfile.js" }
          ]
        },
        {
          delete: [
            "./dist/bundle.js"
          ]
        }
      ]
      */

    }),
    new webpack.HotModuleReplacementPlugin()
  ]
};
