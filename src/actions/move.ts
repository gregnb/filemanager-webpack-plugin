import fsExtra from 'fs-extra';

import pExec from '../utils/p-exec';
import { TaskOptions } from '../types';

export interface MoveTask {
  source: string;
  absoluteSource: string;
  destination: string;
  absoluteDestination: string;
}

const moveAction = async (tasks: MoveTask[], taskOptions: TaskOptions): Promise<void> => {
  const { runTasksInSeries, logger, handleError } = taskOptions;

  logger.debug(`processing move tasks. tasks: ${tasks}`);

  await pExec(runTasksInSeries, tasks, async (task: MoveTask) => {
    try {
      await fsExtra.move(task.absoluteSource, task.absoluteDestination);
      logger.info(`moved ${task.source} to ${task.destination}`);
    } catch (err) {
      logger.error(`unable to move ${task.source}, ${err}`);
      handleError(err);
    }
  });

  logger.debug(`move tasks complete. tasks: ${tasks}`);
};

export default moveAction;
