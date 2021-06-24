import fsExtra from 'fs-extra';

import pExec from '../utils/p-exec.js';

const moveAction = async (tasks, options) => {
  const { runTasksInSeries, logger } = options;

  logger.debug(`processing move tasks. tasks: ${tasks}`);

  await pExec(runTasksInSeries, tasks, async (task) => {
    try {
      await fsExtra.move(task.absoluteSource, task.absoluteDestination);
      logger.info(`moved ${task.source} to ${task.destination}`);
    } catch (err) {
      logger.error(`unable to move ${task.source}, ${err}`);
    }
  });

  logger.debug(`move tasks complete. tasks: ${tasks}`);
};

export default moveAction;
