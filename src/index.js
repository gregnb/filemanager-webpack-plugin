import path from 'path';

import { validate } from 'schema-utils';

import optionsSchema from './options-schema';
import { copyAction, moveAction, mkdirAction, archiveAction, deleteAction } from './actions';

const PLUGIN_NAME = 'FileManagerPlugin';

const defaultOptions = {
  events: {
    onStart: [],
    onEnd: [],
  },
};

const resolvePaths = (action, context) => {
  return action.map((task) => {
    if (typeof task === 'string') {
      const source = task;
      return {
        source,
        absoluteSource: path.isAbsolute(source) ? source : path.join(context, source),
      };
    }

    const { source, destination } = task;

    const toType = /(?:\\|\/)$/.test(destination) ? 'dir' : 'file';

    return {
      ...task,
      source,
      absoluteSource: path.isAbsolute(source) ? source : path.join(context, source),
      destination,
      absoluteDestination: path.isAbsolute(destination) ? destination : path.join(context, destination),
      toType,
      context,
    };
  });
};

class FileManagerPlugin {
  constructor(options) {
    validate(optionsSchema, options, {
      name: PLUGIN_NAME,
      baseDataPath: 'actions',
    });

    this.options = { ...defaultOptions, ...options };
  }

  async applyAction(action, actionParams) {
    await action(resolvePaths(actionParams, this.context));
  }

  run(event) {
    for (const actionType in event) {
      const action = event[actionType];

      switch (actionType) {
        case 'delete':
          return this.applyAction(deleteAction, action);

        case 'mkdir':
          return this.applyAction(mkdirAction, action);

        case 'copy':
          return this.applyAction(copyAction, action);

        case 'move':
          return this.applyAction(moveAction, action);

        case 'archive':
          return this.applyAction(archiveAction, action);

        default:
          return Promise.resolve();
      }
    }
  }

  async execute(eventName) {
    const { events } = this.options;

    if (Array.isArray(events[eventName])) {
      const eventsArr = events[eventName];

      for (const event of eventsArr) {
        console.log(this.run().then);
        await this.run(event);
      }

      return;
    }

    const event = events[eventName];
    await this.run(event);
  }

  apply(compiler) {
    this.context = compiler.options.context;

    const onStart = async () => {
      await this.execute('onStart');
    };

    const onEnd = async () => {
      await this.execute('onEnd');
    };

    compiler.hooks.beforeRun.tapPromise(PLUGIN_NAME, onStart);
    compiler.hooks.watchRun.tapPromise(PLUGIN_NAME, onStart);
    compiler.hooks.afterEmit.tapPromise(PLUGIN_NAME, onEnd);
  }
}

export default FileManagerPlugin;
