import fs from 'fs';
import path from 'path';
import fsExtra from 'fs-extra';
import isGlob from 'is-glob';
import type { Options as FgOptions } from 'fast-glob';
import type { CopyOptions } from 'fs-extra';

import pExec from '../utils/p-exec';
import globCopy from '../utils/glob-copy';
import { TaskOptions } from '../types';

type FsCopyOptions = Pick<CopyOptions, 'overwrite' | 'preserveTimestamps'>;

// Define internal types based on the exported types
export interface CopyActionOptions extends FsCopyOptions {
  /**
   * If true, the copy operation will not preserve the directory structure
   * and will copy all files to the destination directory.
   */
  flat?: boolean;
}

export type CopyGlobOptions = Omit<FgOptions, 'absolute' | 'cwd'>;

export interface CopyTask {
  source: string;
  absoluteSource: string;
  destination: string;
  absoluteDestination?: string;
  context?: string;
  toType?: 'dir' | 'file';
  options?: CopyActionOptions;
  globOptions?: CopyGlobOptions;
}

const fsExtraDefaultOptions = {
  preserveTimestamps: true,
};

const copy = async (task: CopyTask, { logger }: TaskOptions): Promise<void> => {
  const {
    source,
    absoluteSource,
    destination,
    absoluteDestination,
    context = process.cwd(),
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

  logger.info(`copied "${source}" to "${destination}"`);
};

const copyAction = async (tasks: CopyTask[], taskOptions: TaskOptions): Promise<void> => {
  const { runTasksInSeries, logger, handleError } = taskOptions;

  logger.debug(`processing copy tasks. tasks: ${tasks}`);

  await pExec(runTasksInSeries, tasks, async (task: CopyTask) => {
    try {
      await copy(task, taskOptions);
    } catch (err) {
      logger.error(`error while copying. task ${err}`);
      handleError(err);
    }
  });
  logger.debug(`copy tasks complete. tasks: ${tasks}`);
};

export default copyAction;
