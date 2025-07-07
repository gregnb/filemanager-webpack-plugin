import path from 'path';
import { validate } from 'schema-utils';
import normalizePath from 'normalize-path';
import type { Compiler, WebpackPluginInstance } from 'webpack';

import optionsSchema from './options-schema';
import pExec from './utils/p-exec';
import copyAction, { CopyActionOptions, CopyGlobOptions, CopyTask } from './actions/copy';
import deleteAction, { DeleteTask, DeleteOptions } from './actions/delete';
import moveAction, { MoveTask } from './actions/move';
import mkdirAction, { MkdirTask } from './actions/mkdir';
import archiveAction, { ArchiveTask, ArchiverOptions } from './actions/archive';

type CopyAction = {
  source: string;
  destination: string;
  options?: CopyActionOptions;
  globOptions?: CopyGlobOptions;
};

type DeleteAction =
  | {
      source: string;
      options: DeleteOptions;
    }
  | string;

type MoveAction = {
  source: string;
  destination: string;
};

type ArchiveAction = {
  source: string;
  destination: string;
  format?: 'zip' | 'tar';
  options?: ArchiverOptions;
};

type MkdirAction = string;

interface Actions {
  copy?: CopyAction[];
  delete?: DeleteAction[];
  move?: MoveAction[];
  mkdir?: MkdirAction[];
  archive?: ArchiveAction[];
}

interface FileManagerPluginOptions {
  events?: {
    /**
     * Commands to execute before Webpack begins the bundling process
     * Note: OnStart might execute twice for file changes in webpack context.
     */
    onStart?: Actions | Actions[];
    /**
     * Commands to execute after Webpack has finished the bundling process
     */
    onEnd?: Actions | Actions[];
  };
  /**
   * Run tasks in an action in series
   */
  runTasksInSeries?: boolean;
  /**
   * Run tasks only at first compilation in watch mode
   */
  runOnceInWatchMode?: boolean;
  /**
   * The directory, an absolute path, for resolving files. Defaults to webpack context
   */
  context?: string | null;
}

type ActionTask = string | CopyAction | DeleteAction | MoveAction | ArchiveAction;
type ResolvedActionTask = CopyTask | MoveTask | DeleteTask | MkdirTask | ArchiveTask;

const PLUGIN_NAME = 'FileManagerPlugin';

const defaultOptions: FileManagerPluginOptions = {
  events: {
    onStart: [],
    onEnd: [],
  },
  runTasksInSeries: false,
  context: null,
  runOnceInWatchMode: false,
};

function resolvePaths(action: ActionTask[], context: string): ResolvedActionTask[] {
  return action.map((task) => {
    if (typeof task === 'string') {
      const source = task;
      return {
        source,
        absoluteSource: path.isAbsolute(source) ? source : path.join(context, source),
      };
    }

    const { source } = task;

    // Handle delete actions that might not have a destination
    if ('options' in task && !('destination' in task)) {
      return {
        ...task,
        source,
        absoluteSource: path.isAbsolute(source) ? source : path.join(context, source),
      };
    }

    // Handle actions with destinations (copy, move, archive)
    const destination = 'destination' in task ? task.destination : undefined;

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
}

class FileManagerPlugin implements WebpackPluginInstance {
  private options: FileManagerPluginOptions;
  private context!: string;
  private logger!: ReturnType<Compiler['getInfrastructureLogger']>;

  constructor(options: FileManagerPluginOptions) {
    validate(optionsSchema, options, {
      name: PLUGIN_NAME,
      baseDataPath: 'actions',
    });

    this.options = { ...defaultOptions, ...options };
  }

  private async applyAction(action: unknown, actionParams: ActionTask[]): Promise<void> {
    const opts = {
      runTasksInSeries: this.options.runTasksInSeries ?? false,
      logger: this.logger,
    };

    if (typeof action === 'function') {
      await action(resolvePaths(actionParams, this.context), opts);
    }
  }

  private async run(event: Actions): Promise<void> {
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

  private async execute(eventName: 'onStart' | 'onEnd'): Promise<void> {
    const { events } = this.options;

    if (!events) return;

    if (Array.isArray(events[eventName])) {
      const eventsArr = events[eventName] as Actions[];

      await pExec(true, eventsArr, async (event: Actions) => await this.run(event));
      return;
    }

    const event = events[eventName] as Actions;
    await this.run(event);
  }

  apply(compiler: Compiler): void {
    this.context = this.options.context || compiler.options.context || process.cwd();
    this.logger = compiler.getInfrastructureLogger(PLUGIN_NAME);

    const onStart = async (): Promise<void> => {
      await this.execute('onStart');
    };

    const onEnd = async (): Promise<void> => {
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
