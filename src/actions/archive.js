import fs from 'fs';
import path from 'path';

import archiver from 'archiver';
import isGlob from 'is-glob';
import fsExtra from 'fs-extra';

const archive = async (task) => {
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
};

const archiveAction = async (tasks) => {
  const taskMap = tasks.map(archive);

  for (const task of taskMap) {
    await task;
  }
};

export default archiveAction;
