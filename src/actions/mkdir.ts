import fs from 'fs';

import pExec from '../utils/p-exec';
import { TaskOptions } from '../types';

export interface MkdirTask {
  source: string;
  absoluteSource: string;
}

const mkdirAction = async (tasks: MkdirTask[], taskOptions: TaskOptions): Promise<void> => {
  const { runTasksInSeries, logger, handleError } = taskOptions;

  logger.debug(`processing mkdir tasks. tasks: ${tasks}`);

  await pExec(runTasksInSeries, tasks, async (task: MkdirTask) => {
    try {
      await fs.promises.mkdir(task.absoluteSource, { recursive: true });
      logger.info(`created directory. ${task.source}`);
    } catch (err) {
      logger.error(`unable to create directory: ${task.source}. ${err}`);
      handleError(err);
    }
  });

  logger.debug(`mkdir tasks complete. tasks: ${tasks}`);
};

export default mkdirAction;
