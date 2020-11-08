import path from 'path';

import { validate } from 'schema-utils';

import optionsSchema from './options-schema';
import pExec from './utils/p-exec';
import { copyAction, moveAction, mkdirAction, archiveAction, deleteAction } from './actions';

const PLUGIN_NAME = 'FileManagerPlugin';

const defaultOptions = {
  events: {
    onStart: [],
    onEnd: [],
  },
  runTasksInSeries: false,
  context: null,
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
    const opts = {
      runTasksInSeries: this.options.runTasksInSeries,
    };

    await action(resolvePaths(actionParams, this.context), opts);
  }

  async run(event) {
    for (const actionType in event) {
      const action = event[actionType];

      switch (actionType) {
        case 'delete':
          await this.applyAction(deleteAction, action);
          break;

        case 'mkdir':
          await this.applyAction(mkdirAction, action);
          break;

        case 'copy':
          await this.applyAction(copyAction, action);
          break;

        case 'move':
          await this.applyAction(moveAction, action);
          break;

        case 'archive':
          await this.applyAction(archiveAction, action);
          break;

        default:
          throw Error('Unknown action');
      }
    }
  }

  async execute(eventName) {
    const { events } = this.options;

    if (Array.isArray(events[eventName])) {
      const eventsArr = events[eventName];

      await pExec(true, eventsArr, async (event) => await this.run(event));
      return;
    }

    const event = events[eventName];
    await this.run(event);
  }

  apply(compiler) {
    this.context = this.options.context || compiler.options.context;

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
