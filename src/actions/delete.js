import { deleteAsync } from 'del';

import pExec from '../utils/p-exec.js';

const deleteAction = async (tasks, taskOptions) => {
  const { runTasksInSeries, logger } = taskOptions;

  logger.debug(`processing delete tasks. tasks: ${tasks}`);

  await pExec(runTasksInSeries, tasks, async (task) => {
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
