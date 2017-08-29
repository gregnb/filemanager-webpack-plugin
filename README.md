# Webpack File Manager Plugin

This plugin allows you to manage files and directories before or after Webpack builds.  


## Install

`npm install filemanager-webpack-plugin --save-dev `

## Setup

Webpack.config.js:

```js
const FileManagerPlugin = require('filemanager-webpack-plugin');

module.exports = {
  ...
  ...
  plugins: [
    new FileManagerPlugin({
      onEnd: {
        copy: [
          { 'src', 'destination' }
        ],
        delete: [
         '/path/to/file.txt',
         '/path/to/directory/'
        ]
      }
    })
  ],
  ...
}
```