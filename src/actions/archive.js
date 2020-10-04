import fs from 'fs';
import path from 'path';

import archiver from 'archiver';

/**
 * Execute mkdir action
 *
 * @param {Object} command - Command data for given action
 * @return {Function|null} - Function that returns a promise or null
 */
function archiveAction(command, options) {
  const { context } = options;

  const source = path.resolve(context, command.source);
  const destination = path.resolve(context, command.destination);

  return () =>
    new Promise((resolve, reject) => {
      const fileRegex = /(\*|\{+|\}+)/g;
      const matches = fileRegex.exec(command.source);

      const isGlob = matches !== null;

      fs.lstat(source, (sErr, sStats) => {
        if (!fs.existsSync(path.dirname(destination))) {
          fs.mkdirSync(path.dirname(destination), { recursive: true });
        }

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
