
<div align="center">
  <img src="https://user-images.githubusercontent.com/19170080/29996498-a5ed1944-8fcd-11e7-8729-625eb997dbfe.png" />
</div>

# Webpack File Manager Plugin

[![Build Status](https://travis-ci.org/gregnb/filemanager-webpack-plugin.svg?branch=master)](https://travis-ci.org/gregnb/filemanager-webpack-plugin)
[![dependencies Status](https://david-dm.org/gregnb/filemanager-webpack-plugin/status.svg)](https://david-dm.org/gregnb/filemanager-webpack-plugin)
[![npm version](https://badge.fury.io/js/filemanager-webpack-plugin.svg)](https://badge.fury.io/js/filemanager-webpack-plugin)

This Webpack plugin allows you to copy, archive (.zip/.tar/.tar.gz), move, delete files and directories before and after builds


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
          { source: '/path/**/*.js', destination: '/path' },
          { source: '/path/fromfile.txt', destination: '/path/tofile.txt' },
          { source: '/path/**/*.{html,js}', destination: '/path/to' },
          { source: '/path/{file1,file2}.js', destination: '/path/to' },
          { source: '/path/file-[hash].js', destination: '/path/to' }
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
        ],
        archive: [
          { source: '/path/from', destination: '/path/to.zip' },
          { source: '/path/**/*.js', destination: '/path/to.zip' },
          { source: '/path/fromfile.txt', destination: '/path/to.zip' },
          { source: '/path/fromfile.txt', destination: '/path/to.zip', format: 'tar' },
          { 
             source: '/path/fromfile.txt', 
             destination: '/path/to.tar.gz', 
             format: 'tar',
             options: {
               gzip: true,
               gzipOptions: {
                level: 1
               },
               globOptions: {
                nomount: true
               }
             }
           }

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
new FileManagerPlugin(fileEvents, options)
```

#### File Events
* `onStart`: Commands to execute before Webpack begins the bundling process
* `onEnd`: Commands to execute after Webpack has finished the bundling process

#### File Actions

|Name|Description|Example
|:--:|:----------|:-----|
|**`copy`**|Copy individual files or entire directories from a source folder to a destination folder. Also supports glob pattern |copy: [<br /> { source: 'dist/bundle.js', destination: '/home/web/js/'<br /> }<br />]
|**`delete`**|Delete individual files or entire directories. |delete: [<br />'file.txt', '/path/to'<br />]
|**`move`**|Move individual files or entire directories. |move: [<br /> { source: 'dist/bundle.js', destination: '/home/web/js/'<br /> }<br />]
|**`mkdir`**|Create a directory path. Think mkdir -p |mkdir: [ <br />'/path/to/directory/', '/another/path/' <br/> ]
|**`archive`**|Archive individual files or entire directories. Defaults to .zip unless 'format' and 'options' provided. Uses [node-archiver](https://github.com/archiverjs/node-archiver) |archive: [<br />{ source: 'dist/bundle.js', destination: '/home/web/archive.zip'<br />format: 'tar' or 'zip'<br />options: { options passed to archiver }<br /> }<br />]
