import path from 'path';
import { validate } from 'schema-utils';
import normalizePath from 'normalize-path';

import optionsSchema from './options-schema.js';
import pExec from './utils/p-exec.js';
import { copyAction, moveAction, mkdirAction, archiveAction, deleteAction } from './actions/index.js';

const PLUGIN_NAME = 'FileManagerPlugin';

const defaultOptions = {
  events: {
    onStart: [],
    onEnd: [],
  },
  runTasksInSeries: false,
  context: null,
  runOnceInWatchMode: false,
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

    if (!destination) {
      return {
        ...task,
        source,
        absoluteSource: path.isAbsolute(source) ? source : path.join(context, source),
      };
    }

    const toType = /(?:\\|\/)$/.test(destination) ? 'dir' : 'file';

    const absoluteSource = path.isAbsolute(source) ? source : path.join(context, source);
    const absoluteDestination = path.isAbsolute(destination) ? destination : path.join(context, destination);

    return {
      ...task,
      source: normalizePath(source),
      absoluteSource: normalizePath(absoluteSource),
      destination: normalizePath(destination),
      absoluteDestination: normalizePath(absoluteDestination),
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
      logger: this.logger,
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
    this.logger = compiler.getInfrastructureLogger(PLUGIN_NAME);

    const onStart = async () => {
      await this.execute('onStart');
    };

    const onEnd = async () => {
      await this.execute('onEnd');
    };

    compiler.hooks.beforeRun.tapPromise(PLUGIN_NAME, onStart);
    compiler.hooks.afterEmit.tapPromise(PLUGIN_NAME, onEnd);

    let watchRunCount = 0;
    compiler.hooks.watchRun.tapPromise(PLUGIN_NAME, async () => {
      if (this.options.runOnceInWatchMode && watchRunCount > 0) {
        return;
      }

      ++watchRunCount;
      await onStart();
    });
  }
}

export default FileManagerPlugin;
