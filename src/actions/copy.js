import fs from 'fs';
import path from 'path';

import makeDir from 'make-dir';
import cpy from 'cpy';
import cpFile from 'cp-file';

/**
 * Execute copy action
 *
 * @param {Object} command - Command data for given action
 * @return {Function|null} - Function that returns a promise or null
 */
function copyAction(command, options) {
  const { verbose, context } = options;

  return () =>
    new Promise((resolve, reject) => {
      // if source is a file, just copyFile()
      // if source is a NOT a glob pattern, simply append **/*
      const fileRegex = /(\*|\{+|\}+)/g;
      const matches = fileRegex.exec(command.source);

      if (matches === null) {
        const source = path.resolve(context, command.source);

        fs.lstat(source, (sErr, sStats) => {
          if (sErr) return reject(sErr);

          fs.lstat(command.destination, (dErr, dStats) => {
            if (sStats.isFile()) {
              const destination =
                dStats && dStats.isDirectory()
                  ? path.resolve(context, command.destination + '/' + path.basename(command.source))
                  : path.resolve(context, command.destination);

              if (verbose) {
                console.log(
                  `  - FileManagerPlugin: Start copy source: ${command.source} to destination: ${destination}`
                );
              }

              const pathInfo = path.parse(destination);
              if (pathInfo.ext === '') {
                makeDir(destination).then(() => {
                  cpFile(source, path.resolve(destination, path.basename(source)))
                    .then(resolve)
                    .catch(reject);
                });
              } else {
                cpFile(source, destination).then(resolve).catch(reject);
              }
            } else {
              const sourceDir = command.source + (command.source.substr(-1) !== '/' ? '/' : '') + '**/*';
              copy(sourceDir, command.destination, resolve, reject, options);
            }
          });
        });
      } else {
        copy(command.source, command.destination, resolve, reject, options);
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
function copy(source, destination, resolve, reject, options) {
  const { verbose, context } = options;

  /* cpy options */
  const cpyOptions = {
    cwd: context,
  };

  if (verbose) {
    console.log(`  - FileManagerPlugin: Start copy source file: ${source} to destination file: ${destination}`);
  }

  cpy(source, destination, cpyOptions)
    .then(() => {
      if (verbose) {
        console.log(`  - FileManagerPlugin: Finished copy source: ${source} to destination: ${destination}`);
      }

      resolve();
    })
    .catch((err) => {
      if (err && options.verbose) {
        console.log('  - FileManagerPlugin: Error - copy failed', err);
        return reject(err);
      }
    });
}

export default copyAction;
