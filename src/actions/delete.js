import del from 'del';

import pExec from '../utils/p-exec';

const deleteAction = async (tasks, options) => {
  const { runTasksInSeries, logger } = options;

  logger.debug(`processing delete tasks. tasks: ${tasks}`);

  await pExec(runTasksInSeries, tasks, async (task) => {
    try {
      await del(task.absoluteSource);
      logger.info(`deleted ${task.source}`);
    } catch (err) {
      logger.error(`unable to delete ${task.source}. ${err}`);
    }
  });

  logger.debug(`delete tasks complete. tasks: ${tasks}`);
};

export default deleteAction;
