const makeDir = require('make-dir');

/**
 * Execute mkdir action
 *
 * @param {Object} command - Command data for given action
 * @return {Function|null} - Function that returns a promise or null
 */
function mkdirAction(command, options) {
  const { verbose } = options;

  return () => {
    if (verbose) {
      console.log(`  - FileManagerPlugin: Creating path ${command.source}`);
    }

    if (typeof command.source !== 'string') {
      if (verbose) {
        console.log('  - FileManagerPlugin: Warning - mkdir parameter has to be type of string. Process canceled.');
      }
      return null;
    }

    return makeDir(command.source);
  };
}

export default mkdirAction;
