import path from 'path';
import fse from 'fs-extra';
import fg from 'fast-glob';

const defaultOptions = {
  flat: false,
  cwd: process.cwd(),
};

const destPath = (pattern, file, options = defaultOptions) => {
  if (options.flat) {
    return path.posix.basename(file);
  }

  const pathArr = pattern.split('/');
  const globIndex = pathArr.findIndex((item) => (item ? fg.isDynamicPattern(item) : false));
  const normalized = pathArr.slice(0, globIndex).join('/');

  const absolutePath = path.isAbsolute(normalized) ? normalized : path.posix.join(options.cwd, normalized);

  return path.relative(absolutePath, file);
};

const globCopy = async (pattern, destination, options = defaultOptions, globOptions = {}) => {
  await fse.ensureDir(destination);

  const matches = await fg(pattern, { dot: true, ...globOptions, absolute: true, cwd: options.cwd });

  const entries = matches.map((file) => {
    const destDir = path.isAbsolute(destination) ? destination : path.posix.join(options.cwd, destination);
    const destFileName = destPath(pattern, file, options);

    return {
      from: file,
      destDir,
      destFileName,
      to: path.posix.join(destDir, destFileName),
    };
  });

  const cpPromises = entries.map(async (entry) => {
    const copyOptions = {
      overwrite: true,
      preserveTimestamps: true,
    };

    return fse.copy(entry.from, entry.to, copyOptions);
  });

  return Promise.all(cpPromises);
};

export default globCopy;
