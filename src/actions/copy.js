import fs from 'fs';
import path from 'path';
import fsExtra from 'fs-extra';
import isGlob from 'is-glob';

import pExec from '../utils/p-exec.js';
import globCopy from '../utils/glob-copy.js';

const fsExtraDefaultOptions = {
  preserveTimestamps: true,
};

const copy = async (task, { logger }) => {
  const {
    source,
    absoluteSource,
    destination,
    absoluteDestination,
    context,
    toType,
    options = {},
    globOptions = {},
  } = task;

  logger.log(`copying from ${source} to ${destination}`);

  if (isGlob(source)) {
    const cpOptions = {
      ...options,
      cwd: context,
    };

    await globCopy(source, absoluteDestination, cpOptions, globOptions);
  } else {
    const isSourceFile = fs.lstatSync(absoluteSource).isFile();

    // if source is a file and target is a directory
    // create the directory and copy the file into that directory
    if (isSourceFile && toType === 'dir') {
      await fsExtra.ensureDir(absoluteDestination);

      const sourceFileName = path.posix.basename(absoluteSource);
      const filePath = path.resolve(absoluteDestination, sourceFileName);

      await fsExtra.copy(absoluteSource, filePath, fsExtraDefaultOptions);
      return;
    }

    await fsExtra.copy(absoluteSource, absoluteDestination, fsExtraDefaultOptions);
  }

  logger.info(`copied "${source}" to "${destination}`);
};

const copyAction = async (tasks, options) => {
  const { runTasksInSeries, logger } = options;

  const taskOptions = {
    logger,
  };

  logger.debug(`processing copy tasks. tasks: ${tasks}`);

  await pExec(runTasksInSeries, tasks, async (task) => {
    try {
      await copy(task, taskOptions);
    } catch (err) {
      logger.error(`error while copying. task ${err}`);
    }
  });
  logger.debug(`copy tasks complete. tasks: ${tasks}`);
};

export default copyAction;
