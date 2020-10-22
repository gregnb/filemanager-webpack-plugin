import fs from 'fs';
import path from 'path';

import fsExtra from 'fs-extra';
import cpy from 'cpy';
import isGlob from 'is-glob';

const copyAction = async (tasks) => {
  const taskMap = tasks.map(copy);

  for (const task of taskMap) {
    await task;
  }
};

const copy = async (task) => {
  const { source, absSource, absDestination, context } = task;

  try {
    if (isGlob(source)) {
      const src = path.posix.join(context, source);
      await cpy(src, absDestination);
    } else {
      const isFolderTarget = /(?:\\|\/)$/.test(absDestination);
      const isSourceFile = fs.lstatSync(absSource).isFile();

      // if source is a file and target is a directory
      // create the directory and copy the file into that directory
      if (isSourceFile && isFolderTarget) {
        await fsExtra.ensureDir(absDestination);

        const sourceFileName = path.basename(absSource);
        const filePath = path.resolve(absDestination, sourceFileName);

        await fsExtra.copy(absSource, filePath);
        return;
      }

      await fsExtra.copy(absSource, absDestination);
    }
  } catch (err) {}
};

export default copyAction;
