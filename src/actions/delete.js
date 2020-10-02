const fs = require('fs');
const rimraf = require('rimraf');

/**
 * Execute delete action
 *
 * @param {Object} command - Command data for given action
 * @return {Function|null} - Function that returns a promise or null
 */
function deleteAction(command, options) {
  const { verbose } = options;

  return () =>
    new Promise((resolve, reject) => {
      if (verbose) {
        console.log(`  - FileManagerPlugin: Starting delete path ${command.source}`);
      }

      if (typeof command.source !== 'string') {
        if (verbose) {
          console.log('  - FileManagerPlugin: Warning - delete parameter has to be type of string. Process canceled.');
        }
        reject();
      }

      rimraf(command.source, {}, (response) => {
        if (verbose && response === null) {
          console.log(`  - FileManagerPlugin: Finished delete path ${command.source}`);
        }
        resolve();
      });
    });
}

export default deleteAction;
