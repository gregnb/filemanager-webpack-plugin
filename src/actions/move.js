import fs from 'fs';
import path from 'path';

import mv from 'mv';

/**
 * Execute move action
 *
 * @param {Object} command - Command data for given action
 * @return {Function|null} - Function that returns a promise or null
 */
function moveAction(command, options) {
  const { verbose, context } = options;

  const source = path.resolve(context, command.source);
  const destination = path.resolve(context, command.destination);

  if (fs.existsSync(source)) {
    return () =>
      new Promise((resolve, reject) => {
        if (verbose) {
          console.log(
            `  - FileManagerPlugin: Start move source: ${command.source} to destination: ${command.destination}`
          );
        }

        mv(source, destination, { mkdirp: false }, (err) => {
          if (err) {
            if (verbose) {
              console.log('  - FileManagerPlugin: Error - move failed', err);
            }
            reject(err);
          }

          if (verbose) {
            console.log(
              `  - FileManagerPlugin: Finished move source: ${command.source} to destination: ${command.destination}`
            );
          }

          resolve();
        });
      });
  } else {
    process.emitWarning('  - FileManagerPlugin: Could not move ' + command.source + ': path does not exist');
    return null;
  }
}

export default moveAction;
