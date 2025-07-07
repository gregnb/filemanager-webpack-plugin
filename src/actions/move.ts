import fsExtra from 'fs-extra';

import pExec from '../utils/p-exec';
import { Logger } from '../types';

export interface MoveTask {
  source: string;
  absoluteSource: string;
  destination: string;
  absoluteDestination: string;
}

interface MoveTaskOptions {
  runTasksInSeries: boolean;
  logger: Logger;
}

const moveAction = async (tasks: MoveTask[], options: MoveTaskOptions): Promise<void> => {
  const { runTasksInSeries, logger } = options;

  logger.debug(`processing move tasks. tasks: ${tasks}`);

  await pExec(runTasksInSeries, tasks, async (task: MoveTask) => {
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
