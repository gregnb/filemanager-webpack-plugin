import path from 'path';

import { validate } from 'schema-utils';

import { copyAction, moveAction, mkdirAction, archiveAction, deleteAction } from './actions';

import schema from './actions-schema';

const PLUGIN_NAME = 'FileManagerPlugin';

const resolvePaths = (stages, context) => {
  Object.keys(stages).forEach((stage) => {
    Object.keys(stages[stage]).forEach((action) => {
      stages[stage][action] = stages[stage][action].map((task) => {
        const source = typeof task === 'string' ? task : task.source;

        if (typeof task === 'string') {
          return {
            source,
            absoluteSource: path.isAbsolute(source) ? source : path.join(context, source),
          };
        }

        const { destination } = task;

        return {
          ...task,
          source: source,
          absoluteSource: path.isAbsolute(source) ? source : path.join(context, source),
          destination: destination,
          absoluteDestination: path.isAbsolute(destination) ? destination : path.join(context, destination),
          context,
        };
      });
    });
  });

  return stages;
};

class FileManagerPlugin {
  constructor(actions) {
    validate(schema, actions, {
      name: PLUGIN_NAME,
      baseDataPath: 'actions',
    });

    this.actions = actions;
  }

  async processAction(action, actionParams) {
    const options = {
      context: this.context,
    };

    await action(actionParams, options);
  }

  async execute(stage) {
    if (!this.actions[stage]) {
      return;
    }

    const stages = Object.keys(this.actions[stage]);

    const executionPromises = stages.map(async (actionType) => {
      const actionParams = this.actions[stage][actionType];

      switch (actionType) {
        case 'delete':
          return this.processAction(deleteAction, actionParams);

        case 'mkdir':
          return this.processAction(mkdirAction, actionParams);

        case 'copy':
          return this.processAction(copyAction, actionParams);

        case 'move':
          return this.processAction(moveAction, actionParams);

        case 'archive':
          return this.processAction(archiveAction, actionParams);

        default:
          return;
      }
    });

    for (const execution of executionPromises) {
      await execution;
    }
  }

  apply(compiler) {
    this.context = compiler.options.context;
    this.actions = resolvePaths(this.actions, this.context);

    const onStart = async () => {
      await this.execute('onStart');
    };

    const onEnd = async () => {
      await this.execute('onEnd');
    };

    compiler.hooks.beforeRun.tapPromise(PLUGIN_NAME, onStart);
    compiler.hooks.afterEmit.tapPromise(PLUGIN_NAME, onEnd);
  }
}

export default FileManagerPlugin;
