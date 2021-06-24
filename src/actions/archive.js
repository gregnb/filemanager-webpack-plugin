import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import isGlob from 'is-glob';
import fsExtra from 'fs-extra';

import pExec from '../utils/p-exec.js';

const archive = async (task, { logger }) => {
  const { source, absoluteSource, absoluteDestination, options = {}, context } = task;
  const format = task.format || path.extname(absoluteDestination).replace('.', '');

  // Exclude destination file from archive
  const destFile = path.basename(absoluteDestination);
  const destDir = path.dirname(absoluteDestination);

  const ignore = ((Array.isArray(options.ignore) && options.ignore) || []).concat(destFile);
  const archiverOptions = { ignore, ...(options.globOptions || {}) };

  await fsExtra.ensureDir(destDir);

  const output = fs.createWriteStream(absoluteDestination);
  const archive = archiver(format, options);
  archive.pipe(output);

  logger.log(`archiving src ${source}`);

  if (isGlob(source)) {
    const opts = {
      ...archiverOptions,
      cwd: context,
    };

    await archive.glob(source, opts).finalize();
  } else {
    const sStat = fs.lstatSync(absoluteSource);

    if (sStat.isDirectory()) {
      const opts = {
        ...archiverOptions,
        cwd: absoluteSource,
      };

      await archive.glob('**/*', opts).finalize();
    }

    if (sStat.isFile()) {
      const opts = {
        name: path.basename(source),
      };

      await archive.file(absoluteSource, opts).finalize();
    }
  }

  logger.info(`archive created at "${absoluteDestination}"`);
};

const archiveAction = async (tasks, options) => {
  const { runTasksInSeries, logger } = options;

  const taskOptions = {
    logger,
  };

  logger.debug(`processing archive tasks. tasks: ${tasks}`);
  await pExec(runTasksInSeries, tasks, async (task) => {
    try {
      await archive(task, taskOptions);
    } catch (err) {
      logger.error(`error while creating archive. task ${task}`);
    }
  });
  logger.debug(`archive tasks complete. tasks: ${tasks}`);
};

export default archiveAction;
