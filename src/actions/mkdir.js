import fs from 'fs';

import pExec from '../utils/p-exec';

const mkdirAction = async (tasks, options) => {
  const { runTasksInSeries } = options;

  await pExec(runTasksInSeries, tasks, async (task) => {
    await fs.promises.mkdir(task.absoluteSource, { recursive: true });
  });
};

export default mkdirAction;
