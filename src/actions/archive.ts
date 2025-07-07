import fs from 'fs';
import path from 'path';
import archiver, { type ArchiverOptions as ArchiverJSOptions } from 'archiver';
import isGlob from 'is-glob';
import fsExtra from 'fs-extra';

import pExec from '../utils/p-exec';
import { Logger } from '../types';

/** {@link https://github.com/Yqnn/node-readdir-glob#options} */
interface ReaddirGlobOptions {
  /** Glob pattern or Array of Glob patterns to match the found files with. A file has to match at least one of the provided patterns to be returned. */
  pattern?: string | string[];
  /** Glob pattern or Array of Glob patterns to exclude matches. If a file or a folder matches at least one of the provided patterns, it's not returned. It doesn't prevent files from folder content to be returned. Note: ignore patterns are always in dot:true mode. */
  ignore?: string | string[];
  /** Glob pattern or Array of Glob patterns to exclude folders. If a folder matches one of the provided patterns, it's not returned, and it's not explored: this prevents any of its children to be returned. Note: skip patterns are always in dot:true mode. */
  skip?: string | string[];
  /** Add a / character to directory matches. */
  mark?: boolean;
  /** Set to true to stat all results. This reduces performance. */
  stat?: boolean;
  /** When an unusual error is encountered when attempting to read a directory, a warning will be printed to stderr. Set the silent option to true to suppress these warnings. */
  silent?: boolean;
  /** Do not match directories, only files. */
  nodir?: boolean;
  /** Follow symlinked directories. Note that requires to stat all results, and so reduces performance. */
  follow?: boolean;
  /** Allow pattern to match filenames starting with a period, even if the pattern does not explicitly have a period in that spot. */
  dot?: boolean;
  /** Disable ** matching against multiple folder names. */
  noglobstar?: boolean;
  /** Perform a case-insensitive match. Note: on case-insensitive filesystems, non-magic patterns will match by default, since stat and readdir will not raise errors. */
  nocase?: boolean;
  /** Perform a basename-only match if the pattern does not contain any slash characters. That is, *.js would be treated as equivalent to ** /*.js, matching all js files in all directories. */
  matchBase?: boolean;
}

export type ArchiverOptions = ArchiverJSOptions & {
  globOptions?: ReaddirGlobOptions;
};

export interface ArchiveTask {
  source: string;
  absoluteSource: string;
  absoluteDestination: string;
  context?: string;
  format?: 'zip' | 'tar';
  options?: ArchiverOptions;
}

interface ArchiveActionOptions {
  runTasksInSeries: boolean;
  logger: Logger;
}

const archive = async (task: ArchiveTask, { logger }: { logger: Logger }): Promise<void> => {
  const { source, absoluteSource, absoluteDestination, options = {}, context = process.cwd() } = task;
  const format = task.format || (path.extname(absoluteDestination).replace('.', '') as 'zip' | 'tar');

  // Exclude destination file from archive
  const destFile = path.basename(absoluteDestination);
  const destDir = path.dirname(absoluteDestination);

  const { globOptions = {}, ...archiverOptions } = options;

  const ignore = Array.isArray(globOptions.ignore) ? [...globOptions.ignore, destFile] : [destFile];
  const fileToIgnore = typeof globOptions.ignore === 'string' ? [...ignore, globOptions.ignore] : ignore;
  const finalGlobOptions = { ...globOptions, ignore: fileToIgnore };

  await fsExtra.ensureDir(destDir);

  const output = fs.createWriteStream(absoluteDestination);
  const arch = archiver(format, archiverOptions);

  const streamClose = (): Promise<void> => new Promise((resolve) => output.on('close', () => resolve()));

  arch.pipe(output);

  logger.log(`archiving src ${source}`);

  if (isGlob(source)) {
    const opts = {
      ...finalGlobOptions,
      cwd: context,
    };

    await arch.glob(source, opts).finalize();
  } else {
    const sStat = fs.lstatSync(absoluteSource);

    if (sStat.isDirectory()) {
      const opts = {
        ...finalGlobOptions,
        cwd: absoluteSource,
      };

      await arch.glob('**/*', opts).finalize();
    }

    if (sStat.isFile()) {
      const opts = {
        name: path.basename(source),
      };

      await arch.file(absoluteSource, opts).finalize();
    }
  }

  await streamClose();

  logger.info(`archive created at "${absoluteDestination}"`);
};

const archiveAction = async (tasks: ArchiveTask[], options: ArchiveActionOptions): Promise<void> => {
  const { runTasksInSeries, logger } = options;

  const taskOptions = {
    logger,
  };

  logger.debug(`processing archive tasks. tasks: ${tasks}`);
  await pExec(runTasksInSeries, tasks, async (task: ArchiveTask) => {
    try {
      await archive(task, taskOptions);
    } catch {
      logger.error(`error while creating archive. task ${task}`);
    }
  });
  logger.debug(`archive tasks complete. tasks: ${tasks}`);
};

export default archiveAction;
