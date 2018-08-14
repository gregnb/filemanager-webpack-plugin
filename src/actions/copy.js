const fs = require('fs');
const path = require('path');
const cpx = require('cpx');
const fsExtra = require('fs-extra');
const makeDir = require('make-dir');

/**
 * Execute copy action
 *
 * @param {Object} command - Command data for given action
 * @return {Function|null} - Function that returns a promise or null
 */
function copyAction(command, options) {
  const { verbose } = options;

  if (!command.source || !command.destination) {
    if (verbose) {
      console.log(
        '  - FileManagerPlugin: Warning - copy parameter has to be formated as follows: { source: <string>, destination: <string> }',
      );
    }
    return null;
  }

  return () =>
    new Promise((resolve, reject) => {
      // if source is a file, just copyFile()
      // if source is a NOT a glob pattern, simply append **/*
      const fileRegex = /(\*|\{+|\}+)/g;
      const matches = fileRegex.exec(command.source);

      if (matches === null) {
        fs.lstat(command.source, (sErr, sStats) => {
          if (sErr) return reject(sErr);

          fs.lstat(command.destination, (dErr, dStats) => {
            if (sStats.isFile()) {
              const destination =
                dStats && dStats.isDirectory()
                  ? command.destination + '/' + path.basename(command.source)
                  : command.destination;

              if (verbose) {
                console.log(
                  `  - FileManagerPlugin: Start copy source: ${command.source} to destination: ${destination}`,
                );
              }

              /*
               * If the supplied destination is a directory copy inside.
               * If the supplied destination is a directory that does not exist yet create it & copy inside
               */

              const pathInfo = path.parse(destination);

              const execCopy = (src, dest) => {
                fsExtra.copy(src, dest, err => {
                  if (err) reject(err);
                  resolve();
                });
              };

              if (pathInfo.ext === '') {
                makeDir(destination).then(mPath => {
                  execCopy(command.source, destination + '/' + path.basename(command.source));
                });
              } else {
                execCopy(command.source, destination);
              }
            } else {
              const sourceDir = command.source + (command.source.substr(-1) !== '/' ? '/' : '') + '**/*';
              copyDirectory(sourceDir, command.destination, resolve, reject, options);
            }
          });
        });
      } else {
        copyDirectory(command.source, command.destination, resolve, reject, options);
      }
    });
}

/**
 * Execute copy directory
 *
 * @param {string} source - source file path
 * @param {string} destination - destination file path
 * @param {Function} resolve - function used to resolve a Promise
 * @param {Function} reject - function used to reject a Promise
 * @return {void}
 */
function copyDirectory(source, destination, resolve, reject, options) {
  const { verbose } = options;

  /* cpx options */
  const cpxOptions = {
    clean: false,
    includeEmptyDirs: true,
    update: false,
  };

  if (verbose) {
    console.log(`  - FileManagerPlugin: Start copy source file: ${source} to destination file: ${destination}`);
  }

  cpx.copy(source, destination, cpxOptions, err => {
    if (err && this.options.verbose) {
      console.log('  - FileManagerPlugin: Error - copy failed', err);
      reject(err);
    }

    if (verbose) {
      console.log(`  - FileManagerPlugin: Finished copy source: ${source} to destination: ${destination}`);
    }

    resolve();
  });
}

export default copyAction;
