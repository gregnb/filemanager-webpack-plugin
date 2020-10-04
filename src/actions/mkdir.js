import path from 'path';

import makeDir from 'make-dir';

/**
 * Execute mkdir action
 *
 * @param {Object} command - Command data for given action
 * @return {Function|null} - Function that returns a promise or null
 */
function mkdirAction(command, options) {
  const { verbose, context } = options;

  return () => {
    if (verbose) {
      console.log(`  - FileManagerPlugin: Creating path ${command.source}`);
    }

    const source = path.resolve(context, command.source);
    return makeDir(source);
  };
}

export default mkdirAction;
