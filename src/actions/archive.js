import fs from 'fs';
import path from 'path';

import archiver from 'archiver';
import isGlob from 'is-glob';
import fsExtra from 'fs-extra';

const archiveAction = async (tasks) => {
  const taskMap = tasks.map(archive);

  for (const task of taskMap) {
    await task;
  }
};

const archive = async (task) => {
  const { source, absoluteSource, absoluteDestination, options = {}, context } = task;
  const format = task.format || path.extname(absoluteDestination).replace('.', '');

  // Exclude destination file from archive
  const destFile = path.basename(absoluteDestination);
  const destDir = path.dirname(absoluteDestination);

  const ignore = ((Array.isArray(options.ignore) && options.ignore) || []).concat(destFile);
  const globOptions = Object.assign({ ignore }, options.globOptions || {});

  await fsExtra.ensureDir(destDir);

  const output = fs.createWriteStream(absoluteDestination);
  const archive = archiver(format, options);
  archive.pipe(output);

  if (isGlob(source)) {
    const gOptions = {
      ...globOptions,
      cwd: context,
    };

    await archive.glob(source, gOptions).finalize();
  } else {
    const sStat = fs.lstatSync(absoluteSource);

    if (sStat.isDirectory()) {
      const gOptions = {
        ...globOptions,
        cwd: absoluteSource,
      };

      await archive.glob('**/*', gOptions).finalize();
    }

    if (sStat.isFile()) {
      const options = {
        name: path.basename(source),
      };

      await archive.file(absoluteSource, options).finalize();
    }
  }

  // output.close()
};

export default archiveAction;
