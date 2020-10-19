import fs from 'fs';
import path from 'path';

import archiver from 'archiver';
import isGlob from 'is-glob';
import fsExtra from 'fs-extra';

const archiveAction = async (tasks) => {
  const actionMap = tasks.map(archive);
  await Promise.all(actionMap);
};

const archive = async (task) => {
  const { source, absSource, absDestination, options = {}, context } = task;
  const format = task.format || path.extname(absDestination).replace('.', '');

  // Exclude destination file from archive
  const destFile = path.basename(absDestination);
  const destDir = path.dirname(absDestination);
  const globOptions = Object.assign({ ignore: destFile }, options.globOptions || {});

  await fsExtra.ensureDir(destDir);

  const output = fs.createWriteStream(absDestination);
  const archive = archiver(format, options);
  archive.pipe(output);

  if (isGlob(source)) {
    const gOptions = {
      ...globOptions,
      cwd: context,
    };

    await archive.glob(source, gOptions).finalize();
  } else {
    const sStat = fs.lstatSync(absSource);

    if (sStat.isDirectory()) {
      const gOptions = {
        ...globOptions,
        cwd: absSource,
      };

      await archive.glob('**/*', gOptions).finalize();
    }

    if (sStat.isFile()) {
      const options = {
        name: path.basename(source),
      };

      await archive.file(absSource, options).finalize();
    }
  }

  // output.close()
};

export default archiveAction;
