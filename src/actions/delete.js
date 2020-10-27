import del from 'del';

import pExec from '../utils/p-exec';

const deleteAction = async (tasks, options) => {
  const { runTasksInSeries } = options;

  await pExec(runTasksInSeries, tasks, async (task) => {
    await del(task.absoluteSource);
  });
};

export default deleteAction;
