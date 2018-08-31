const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');

/**
 * Execute mkdir action
 *
 * @param {Object} command - Command data for given action
 * @return {Function|null} - Function that returns a promise or null
 */
function archiveAction(command, options) {
  const { verbose } = options;

  return () =>
    new Promise((resolve, reject) => {
      if (!command.source || !command.destination) {
        if (verbose) {
          console.log(
            '  - FileManagerPlugin: Warning - archive parameter has to be formated as follows: { source: <string>, destination: <string> }',
          );
        }
        reject();
      }

      const fileRegex = /(\*|\{+|\}+)/g;
      const matches = fileRegex.exec(command.source);

      const isGlob = matches !== null;

      fs.lstat(command.source, (sErr, sStats) => {
        const output = fs.createWriteStream(command.destination);
        const archive = archiver(command.format, command.options);

        archive.on('error', err => reject(err));
        archive.pipe(output);

        // Exclude destination file from archive
        const destFile = path.basename(command.destination);
        const globOptions = Object.assign({ ignore: destFile }, (command.options.globOptions || {}) );

        if (isGlob) archive.glob(command.source, globOptions);
		else if (sStats.isFile()) archive.file(command.source, { name: path.basename(command.source) });
		else if (sStats.isDirectory()) archive.glob('**/*', {
			cwd: command.source,
			ignore: destFile
		});
        archive.finalize().then(() => resolve());
      });
    });
}

export default archiveAction;
