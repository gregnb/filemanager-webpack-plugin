import fs from 'fs';

import pExec from '../utils/p-exec.js';

const mkdirAction = async (tasks, options) => {
  const { runTasksInSeries, logger } = options;

  logger.debug(`processing mkdir tasks. tasks: ${tasks}`);

  await pExec(runTasksInSeries, tasks, async (task) => {
    try {
      await fs.promises.mkdir(task.absoluteSource, { recursive: true });
      logger.info(`created directory. ${task.source}`);
    } catch (err) {
      logger.error(`unable to create direcotry: ${task.source}. ${err}`);
    }
  });

  logger.debug(`mkdir tasks complete. tasks: ${tasks}`);
};

export default mkdirAction;
