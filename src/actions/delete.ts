import { deleteAsync, Options as DelOptions } from 'del';

import pExec from '../utils/p-exec';
import { TaskOptions } from '../types';

export type { DelOptions as DeleteOptions };

export interface DeleteTask {
  source: string;
  absoluteSource: string;
  options?: DelOptions;
}

const deleteAction = async (tasks: DeleteTask[], taskOptions: TaskOptions): Promise<void> => {
  const { runTasksInSeries, logger, handleError } = taskOptions;

  logger.debug(`processing delete tasks. tasks: ${tasks}`);

  await pExec(runTasksInSeries, tasks, async (task: DeleteTask) => {
    const { options = {} } = task;

    try {
      await deleteAsync(task.absoluteSource, options);
      logger.info(`deleted ${task.source}`);
    } catch (err) {
      logger.error(`unable to delete ${task.source}. ${err}`);
      handleError(err);
    }
  });

  logger.debug(`delete tasks complete. tasks: ${tasks}`);
};

export default deleteAction;
