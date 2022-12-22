import fs from 'fs';
import pExec from '../utils/p-exec.js';

const replaceAction = async (tasks, options) => {
  const { runTasksInSeries, logger } = options;

  logger.debug(`processing replace tasks. tasks: ${tasks}`);

  await pExec(runTasksInSeries, tasks, async (task) => {
    fs.readFile(task.source, 'utf8', function (err, data) {
      if (err) {
        logger.error(`unable to replace ${task.source}, ${err}`);
      }

      task.mutations.forEach((mutation) => {
        let iterations = mutation.iterations ? mutation.iterations : 1;
        for (let index = 0; index < iterations; index++) {
          data = data.replace(mutation.pattern, mutation.replacement);
        }
      });

      fs.writeFile(task.source, data, 'utf8', function (err) {
        if (err) {
          logger.error(`unable to write ${task.source}, ${err}`);
        }
      });
    });
  });

  logger.debug(`move tasks complete. tasks: ${tasks}`);
};

export default replaceAction;
