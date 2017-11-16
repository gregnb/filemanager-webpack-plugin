
<div align="center">
  <img src="https://user-images.githubusercontent.com/19170080/29996498-a5ed1944-8fcd-11e7-8729-625eb997dbfe.png" />
</div>

# Webpack File Manager Plugin

[![Build Status](https://travis-ci.org/gregnb/filemanager-webpack-plugin.svg?branch=master)](https://travis-ci.org/gregnb/filemanager-webpack-plugin)
[![dependencies Status](https://david-dm.org/gregnb/filemanager-webpack-plugin/status.svg)](https://david-dm.org/gregnb/filemanager-webpack-plugin)
[![npm version](https://badge.fury.io/js/filemanager-webpack-plugin.svg)](https://badge.fury.io/js/filemanager-webpack-plugin)

This Webpack plugin allows you to copy, move, delete files and directories before and after builds


## Install

`npm install filemanager-webpack-plugin --save-dev `

## Usage

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
          { source: '/path/from', destination: '/path/to' },
          { source: '/path/fromfile.txt', destination: '/path/tofile.txt' }
        ],
        move: [
          { source: '/path/from', destination: '/path/to' },
          { source: '/path/fromfile.txt', destination: '/path/tofile.txt' }
        ],
        delete: [
         '/path/to/file.txt',
         '/path/to/directory/'
        ],
        mkdir: [
         '/path/to/directory/',
         '/another/directory/'
        ]
      }
    })
  ],
  ...
}
```

If you need to preserve the order in which operations will run you can set the onStart and onEnd events to be Arrays. In this example below, in the onEnd event the copy action will run first, and then the delete after:

```js
const FileManagerPlugin = require('filemanager-webpack-plugin');

module.exports = {
  ...
  ...
  plugins: [
    new FileManagerPlugin({
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
    })
  ],
  ...
}


```


## Options


```js
new FileManagerPlugin(object)
```

#### Event Options
* `onStart`: Commands to execute before Webpack begins the bundling process
* `onEnd`: Commands to execute after Webpack has finished the bundling process

#### File Management Options

|Name|Description|Example
|:--:|:----------|:-----|
|**`copy`**|Copy individual files or entire directories from a source folder to a destination folder|copy: [<br /> { source: 'dist/bundle.js', destination: '/home/web/js/'<br /> }
|**`delete`**|Delete individual files or entire directories. |delete: [<br />'file.txt', '/path/to'<br />]
|**`move`**|Move individual files or entire directories. |move: <br /> { source: 'dist/bundle.js', destination: '/home/web/js/'<br /> }
|**`mkdir`**|Create a directory path. Think mkdir -p |mkdir: [ <br />'/path/to/directory/', '/another/path/' <br/> ]
|**`verbose`**|Enable verbose logging |verbose: true
|**`moveWithMkdirp`**|Enable creating paths while moving. |moveWithMkdirp: true
