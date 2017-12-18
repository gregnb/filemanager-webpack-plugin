const path = require('path');
const webpack = require('webpack');

const FileManagerPlugin = require('./lib');

module.exports = {
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
           { source: "./dist/*", destination: "./testing/testing1" },
           { source: "./dist/**/*", destination: "./testing/testing2"},
           { source: "./dist", destination: "./testing/testing3" },
           { source: "./dist/**/*.{html,js}", destination: "./testing/testing4" },
           { source: "./dist/{fake,bundle}.js", destination: "./testing/testing5" },
           { source: "./dist/bundle.js", destination: "./testing" },
           { source: "./dist/bundle.js", destination: "./testing/newfile.js" },
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
