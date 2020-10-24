import path from 'path';

import { validate } from 'schema-utils';

import schema from './actions-schema';
import { copyAction, moveAction, mkdirAction, archiveAction, deleteAction } from './actions';

const PLUGIN_NAME = 'FileManagerPlugin';

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

    return {
      ...task,
      source,
      absoluteSource: path.isAbsolute(source) ? source : path.join(context, source),
      destination: destination,
      absoluteDestination: path.isAbsolute(destination) ? destination : path.join(context, destination),
      context,
    };
  });
};

class FileManagerPlugin {
  constructor(events) {
    validate(schema, events, {
      name: PLUGIN_NAME,
      baseDataPath: 'actions',
    });

    this.events = events;
  }

  async applyAction(action, actionParams) {
    await action(resolvePaths(actionParams, this.context));
  }

  async run(event) {
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
          return;
      }
    }
  }

  async execute(eventName) {
    if (Array.isArray(this.events[eventName])) {
      const eventsArr = this.events[eventName];

      for (const event of eventsArr) {
        await this.run(event);
      }

      return;
    }

    const event = this.events[eventName];
    return await this.run(event);
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
