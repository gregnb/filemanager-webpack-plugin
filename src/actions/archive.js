const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

/**
 * Execute mkdir action
 *
 * @param {Object} command - Command data for given action
 * @return {Function|null} - Function that returns a promise or null
 */
function archiveAction(command, options) {
  const { verbose, context } = options;

  const source = path.resolve(context, command.source);
  const destination = path.resolve(context, command.destination);

  return () =>
    new Promise((resolve, reject) => {
      if (!command.source || !command.destination) {
        if (verbose) {
          console.log(
            '  - FileManagerPlugin: Warning - archive parameter has to be formated as follows: { source: <string>, destination: <string> }'
          );
        }
        reject();
      }

      const fileRegex = /(\*|\{+|\}+)/g;
      const matches = fileRegex.exec(command.source);

      const isGlob = matches !== null;

      fs.lstat(source, (sErr, sStats) => {
        const output = fs.createWriteStream(destination);
        const archive = archiver(command.format, command.options);

        archive.on('error', (err) => reject(err));
        archive.pipe(output);

        // Exclude destination file from archive
        const destFile = path.basename(destination);
        const globOptions = Object.assign({ ignore: destFile }, command.options.globOptions || {});

        if (isGlob) {
          archive.glob(command.source, {
            ...globOptions,
            cwd: context,
          });
        } else if (sStats.isFile()) {
          archive.file(source, {
            name: path.basename(command.source),
            cwd: context,
          });
        } else if (sStats.isDirectory()) {
          archive.glob('**/*', {
            cwd: source,
            ignore: destFile,
          });
        }

        archive.finalize().then(resolve);
      });
    });
}

export default archiveAction;
