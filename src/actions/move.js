const fs = require('fs');
const mv = require('mv');

/**
 * Execute move action
 *
 * @param {Object} command - Command data for given action
 * @return {Function|null} - Function that returns a promise or null
 */
function moveAction(command, options) {
  const { verbose } = options;

  if (!command.source || !command.destination) {
    if (verbose) {
      console.log(
        '  - FileManagerPlugin: Warning - move parameter has to be formated as follows: { source: <string>, destination: <string> }'
      );
    }
    return null;
  }

  if (fs.existsSync(command.source)) {
    return () =>
      new Promise((resolve, reject) => {
        if (verbose) {
          console.log(
            `  - FileManagerPlugin: Start move source: ${command.source} to destination: ${command.destination}`
          );
        }

        mv(command.source, command.destination, { mkdirp: false }, (err) => {
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
