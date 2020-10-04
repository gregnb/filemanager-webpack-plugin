const path = require('path');
const rimraf = require('rimraf');

/**
 * Execute delete action
 *
 * @param {Object} command - Command data for given action
 * @return {Function|null} - Function that returns a promise or null
 */
function deleteAction(command, options) {
  const { verbose, context } = options;

  return () =>
    new Promise((resolve, reject) => {
      if (verbose) {
        console.log(`  - FileManagerPlugin: Starting delete path ${command.source}`);
      }

      const source = path.resolve(context, command.source);

      rimraf(source, {}, (response) => {
        if (verbose && response === null) {
          console.log(`  - FileManagerPlugin: Finished delete path ${command.source}`);
        }
        resolve();
      });
    });
}

export default deleteAction;
