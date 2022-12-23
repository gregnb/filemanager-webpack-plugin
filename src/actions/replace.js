import fs, { existsSync } from 'fs';
import pExec from '../utils/p-exec.js';

const replaceAction = async (tasks, options) => {
  const { runTasksInSeries, logger } = options;

  logger.debug(`processing replace tasks. tasks: ${tasks}`);

  await pExec(runTasksInSeries, tasks, async (task) => {
    const file = task.source;

    if (existsSync(file)) {
      fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
          logger.error(`unable to read ${file}, ${err}`);
        }

        task.mutations.forEach((mutation) => {
          let iterations = mutation.iterations ? mutation.iterations : 1;
          for (let index = 0; index < iterations; index++) {
            data = data.replace(mutation.pattern, mutation.replacement);
          }
        });

        fs.writeFile(file, data, 'utf8', function (err) {
          if (err) {
            logger.error(`unable to write ${file}, ${err}`);
          }
        });
      });
    } else {
      logger.error(`unable to find ${file}`);
    }
  });

  logger.debug(`replace tasks complete. tasks: ${tasks}`);
};

export default replaceAction;
