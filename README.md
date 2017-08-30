# Webpack File Manager Plugin

This plugin allows you to manage files and directories before or after Webpack builds.  


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