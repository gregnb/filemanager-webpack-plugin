import { deleteAsync, Options as DelOptions } from 'del';
import type { Compiler } from 'webpack';

import pExec from '../utils/p-exec';
import { Logger } from '../types';

export type { DelOptions as DeleteOptions };

export interface DeleteTask {
  source: string;
  absoluteSource: string;
  options?: DelOptions;
}

interface DeleteTaskOptions {
  runTasksInSeries: boolean;
  logger: Logger;
}

const deleteAction = async (tasks: DeleteTask[], taskOptions: DeleteTaskOptions): Promise<void> => {
  const { runTasksInSeries, logger } = taskOptions;

  logger.debug(`processing delete tasks. tasks: ${tasks}`);

  await pExec(runTasksInSeries, tasks, async (task: DeleteTask) => {
    const { options = {} } = task;

    try {
      await deleteAsync(task.absoluteSource, options);
      logger.info(`deleted ${task.source}`);
    } catch (err) {
      logger.error(`unable to delete ${task.source}. ${err}`);
    }
  });

  logger.debug(`delete tasks complete. tasks: ${tasks}`);
};

export default deleteAction;
