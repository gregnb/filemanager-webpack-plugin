const path = require('path');
const webpack = require('webpack');

const FileManagerPlugin = require('../../lib');

const plainConfig = {
  entry: path.resolve(__dirname, '../../example/index.js'),
  stats: "verbose",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
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
           { source: "./dist/bundle.js", destination: "./testing/newfile.js" },
           { source: "./dist/bundle.js", destination: "./testing/testing6" },
           { source: "./dist/doesnotexit.js", destination: "./testing/wontexist.js" }
        ],
        archive: [
           { source: "./dist", destination: "./testing/test1.zip" },
           { source: "./dist/bundle.js", destination: "./testing/test2.zip" },
           { source: "./dist/**/*", destination: "./testing/test3.zip" },
           { source: "./dist/**/*", destination: "./testing/test4.tar", format: 'tar' },
           { 
             source: "./dist/**/*", 
             destination: "./testing/test5.tar.gz", 
             format: 'tar',
             options: {
               gzip: true,
               gzipOptions: {
                level: 1
               }
             }
           },
           { source: "./testing/", destination: "./testing/test7.zip" }
		],
        mkdir: [
          './testing/testdir'
        ]
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

const hashConfig = {
  entry: path.resolve(__dirname, '../../example/index.js'),
  stats: "verbose",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle-[hash].js'
  },
  module: {
    rules: [
      { test: /\.css$/, loader: 'style!css' }
    ]
  },
  plugins: [
    new FileManagerPlugin({
      onEnd: {
        copy: [
           { source: "./dist/bundle-[hash].js", destination: "./testing/hashed-bundle.js" },
           { source: "./dist/bundle-[hash].js", destination: "./testing/[hash]-hashbundlecheck.js" }
        ],
      }
    })
  ]
};

module.exports = [
  plainConfig,
  hashConfig
];
