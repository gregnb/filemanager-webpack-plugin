import { copyAction, moveAction, mkdirAction, archiveAction, deleteAction } from './actions';

class FileManagerPlugin {
  constructor(options) {
    this.options = this.setOptions(options);
  }

  setOptions(userOptions) {
    const defaultOptions = {
      verbose: false,
      moveWithMkdirp: false,
      onStart: {},
      onEnd: {},
    };

    for (const key in defaultOptions) {
      if (userOptions.hasOwnProperty(key)) {
        defaultOptions[key] = userOptions[key];
      }
    }

    return defaultOptions;
  }

  checkOptions(stage) {
    if (this.options.verbose && Object.keys(this.options[stage]).length) {
      console.log(`FileManagerPlugin: processing ${stage} event`);
    }

    let operationList = [];

    if (this.options[stage] && Array.isArray(this.options[stage])) {
      this.options[stage].map(opts => operationList.push(...this.parseFileOptions(opts, true)));
    } else {
      operationList.push(...this.parseFileOptions(this.options[stage]));
    }

    if (operationList.length) {
      return operationList.reduce((previous, fn) => {
        return previous
          .then(retVal => fn(retVal))
          .catch(err => {
            throw err
          });
      }, Promise.resolve());
    }
  }

  replaceHash(filename) {
    return filename.replace('[hash]', this.fileHash);
  }

  processAction(action, params, commandOrder) {
    const result = action(params, this.options);

    if (result !== null) {
      commandOrder.push(result);
    }
  }

  parseFileOptions(options, preserveOrder = false) {
    let commandOrder = [];

    Object.keys(options).forEach(actionType => {
      const actionOptions = options[actionType];
      let actionParams = null;

      actionOptions.forEach(actionItem => {
        switch (actionType) {
          case 'copy':
            actionParams = Object.assign(
              { source: this.replaceHash(actionItem.source) },
              actionItem.destination && { destination: actionItem.destination },
            );

            this.processAction(copyAction, actionParams, commandOrder);

            break;

          case 'move':
            actionParams = Object.assign(
              { source: this.replaceHash(actionItem.source) },
              actionItem.destination && { destination: actionItem.destination },
            );

            this.processAction(moveAction, actionParams, commandOrder);

            break;

          case 'delete':
            if (!Array.isArray(actionOptions) || typeof actionItem !== 'string') {
              throw Error(`  - FileManagerPlugin: Fail - delete parameters has to be an array of strings`);
            }

            actionParams = Object.assign({ source: this.replaceHash(actionItem) });
            this.processAction(deleteAction, actionParams, commandOrder);

            break;

          case 'mkdir':
            actionParams = { source: this.replaceHash(actionItem) };
            this.processAction(mkdirAction, actionParams, commandOrder);

            break;

          case 'archive':
            actionParams = {
              source: this.replaceHash(actionItem.source),
              destination: actionItem.destination,
              format: actionItem.format ? actionItem.format : 'zip',
              options: actionItem.options ? actionItem.options : { zlib: { level: 9 } },
            };

            this.processAction(archiveAction, actionParams, commandOrder);

            break;

          default:
            break;
        }
      });
    });

    return commandOrder;
  }

  apply(compiler) {
    const that = this;

    const comp = compilation => {
      try {
        that.checkOptions('onStart');
      } catch (error) {
        compilation.errors.push(error);
      }
    };

    const afterEmit = (compilation, cb) => {
      that.fileHash = compilation.hash;

      try {
        that.checkOptions('onEnd')
          .then(() => cb())
          .catch(err => {
            throw err
          });
      } catch (error) {
        compilation.errors.push(error);
      }
    };

    if (compiler.hooks) {
      compiler.hooks.compilation.tap('compilation', comp);
      compiler.hooks.afterEmit.tapAsync('afterEmit', afterEmit);
    } else {
      compiler.plugin('compilation', comp);
      compiler.plugin('after-emit', afterEmit);
    }
  }
}

export default FileManagerPlugin;
