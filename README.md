<div align="center">
  <img src="assets/filemanager.png" />
  <h1>FileManager Webpack Plugin</h1>
  <p>This Webpack plugin allows you to copy, archive (.zip/.tar/.tar.gz), move, delete files and directories before and after builds</p>
  <p>
    <a href="https://github.com/gregnb/filemanager-webpack-plugin/actions?query=workflow%3ATests" alt="Testst">
      <img src="https://github.com/gregnb/filemanager-webpack-plugin/workflows/Tests/badge.svg">
    </a>
    <a href="https://npmcharts.com/compare/filemanager-webpack-plugin?minimal=true" alt="NPM weekly downloads">
      <img src="https://badgen.net/npm/dw/filemanager-webpack-plugin">
    </a>
    <a href="https://www.npmtrends.com/filemanager-webpack-plugin" alt="NPM total downloads">
      <img src="https://badgen.net/npm/dt/filemanager-webpack-plugin">
    </a>
    <a href="https://npmjs.com/filemanager-webpack-plugin" alt="NPM version">
      <img src="https://badgen.net/npm/v/filemanager-webpack-plugin">
    </a>
    <a href="https://david-dm.org/gregnb/filemanager-webpack-plugin" alt="Dependencies status">
      <img src="https://david-dm.org/gregnb/filemanager-webpack-plugin/status.svg">
    </a>
  </p>
</div>

## Install

```bash
npm install filemanager-webpack-plugin --save-dev
# or
yarn add filemanager-webpack-plugin --dev
```

## Usage

```js
// webpack.config.js:

const FileManagerPlugin = require('filemanager-webpack-plugin');

module.exports = {
  plugins: [
    new FileManagerPlugin({
      onEnd: {
        copy: [
          { source: '/path/fromfile.txt', destination: '/path/tofile.txt' },
          { source: '/path/**/*.js', destination: '/path' },
        ],
        move: [
          { source: '/path/from', destination: '/path/to' },
          { source: '/path/fromfile.txt', destination: '/path/tofile.txt' },
        ],
        delete: ['/path/to/file.txt', '/path/to/directory/'],
        mkdir: ['/path/to/directory/', '/another/directory/'],
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
                level: 1,
              },
              globOptions: {
                nomount: true,
              },
            },
          },
        ],
      },
    }),
  ],
};
```

# Options

```js
new FileManagerPlugin(fileEvents);
```

## File Events

- `onStart`: Commands to execute before Webpack begins the bundling process
- `onEnd`: Commands to execute after Webpack has finished the bundling process

## File Actions

### Copy

Copy individual files or entire directories from a source folder to a destination folder. Also supports glob pattern.

```js
[
  { source: '/path/from', destination: '/path/to' },
  { source: '/path/**/*.js', destination: '/path' },
  { source: '/path/fromfile.txt', destination: '/path/tofile.txt' },
  { source: '/path/**/*.{html,js}', destination: '/path/to' },
  { source: '/path/{file1,file2}.js', destination: '/path/to' },
];
```

**Options**

- source[`string`] - a file or a directory or a glob
- destination[`string`] - a file or a directory.

**Caveats**

- if source is a `glob`, destination must be a directory
- if souce is a `file`, if destination is a directory, the file will be copied into the directory

### Delete

Delete individual files or entire directories. Also supports glob pattern

```js
['/path/to/file.txt', '/path/to/directory/', '/another-path/to/directory/**.js'];
```

### Move

Move individual files or entire directories.

```js
[
  { source: '/path/from', destination: '/path/to' },
  { source: '/path/fromfile.txt', destination: '/path/tofile.txt' },
];
```

**Options**

- source[`string`] - a file or a directory or a glob
- destination[`string`] - a file or a directory.

### Mkdir

Create a directory path with given path

```js
['/path/to/directory/', '/another/directory/'];
```

### Archive

Archive individual files or entire directories. Defaults to .zip unless 'format' and 'options' provided. Uses [node-archiver]

```js
[
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
        level: 1,
      },
      globOptions: {
        nomount: true,
      },
    },
  },
];
```

- source[`string`] - a file or a directory or a glob
- destination[`string`] - a file.
- format[`string`] - Optional. Defaults to extension in destination filename.
- options[`object`] - Refer https://www.archiverjs.com/archiver

#### File Actions

|     Name      | Description                                                                                                                                                                | Example                                                                                                                                                                  |
| :-----------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  **`copy`**   | Copy individual files or entire directories from a source folder to a destination folder. Also supports glob pattern                                                       | copy: [<br /> { source: 'dist/bundle.js', destination: '/home/web/js/'<br /> }<br />]                                                                                    |
| **`delete`**  | Delete individual files or entire directories.                                                                                                                             | delete: [<br />'file.txt', '/path/to'<br />]                                                                                                                             |
|  **`move`**   | Move individual files or entire directories.                                                                                                                               | move: [<br /> { source: 'dist/bundle.js', destination: '/home/web/js/'<br /> }<br />]                                                                                    |
|  **`mkdir`**  | Create a directory path. Think mkdir -p                                                                                                                                    | mkdir: [ <br />'/path/to/directory/', '/another/path/' <br/> ]                                                                                                           |
| **`archive`** | Archive individual files or entire directories. Defaults to .zip unless 'format' and 'options' provided. Uses [node-archiver](https://github.com/archiverjs/node-archiver) | archive: [<br />{ source: 'dist/bundle.js', destination: '/home/web/archive.zip'<br />format: 'tar' or 'zip'<br />options: { options passed to archiver }<br /> }<br />] |

[node-archiver]: https://github.com/archiverjs/node-archiver

```

```
