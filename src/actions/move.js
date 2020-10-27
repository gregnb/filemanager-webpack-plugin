import fsExtra from 'fs-extra';

import pExec from '../utils/p-exec';

const moveAction = async (tasks, options) => {
  const { runTasksInSeries } = options;

  await pExec(runTasksInSeries, tasks, async (task) => {
    await fsExtra.move(task.absoluteSource, task.absoluteDestination);
  });
};

export default moveAction;
