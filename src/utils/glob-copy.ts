import path from 'path';
import fse, { CopyOptions } from 'fs-extra';
import fg from 'fast-glob';

type FsCopyOptions = Pick<CopyOptions, 'overwrite' | 'preserveTimestamps'>;
interface GlobCopyOptions extends FsCopyOptions {
  flat?: boolean;
  cwd?: string;
}

const defaultOptions: GlobCopyOptions = {
  flat: false,
  cwd: process.cwd(),
};

const destPath = (pattern: string, file: string, options: GlobCopyOptions = defaultOptions): string => {
  if (options.flat) {
    return path.posix.basename(file);
  }

  const pathArr = pattern.split('/');
  const globIndex = pathArr.findIndex((item) => (item ? fg.isDynamicPattern(item) : false));
  const normalized = pathArr.slice(0, globIndex).join('/');

  const absolutePath = path.isAbsolute(normalized) ? normalized : path.posix.join(options.cwd, normalized);

  return path.relative(absolutePath, file);
};

const globCopy = async (
  pattern: string,
  destination: string,
  options: GlobCopyOptions = defaultOptions,
  globOptions: Record<string, any> = {}
): Promise<void[]> => {
  const mergedOptions = { ...defaultOptions, ...options };

  await fse.ensureDir(destination);

  const matches = await fg(pattern, { dot: true, ...globOptions, absolute: true, cwd: mergedOptions.cwd });

  const entries = matches.map((file) => {
    const destDir = path.isAbsolute(destination) ? destination : path.posix.join(mergedOptions.cwd, destination);
    const destFileName = destPath(pattern, file, mergedOptions);

    return {
      from: file,
      destDir,
      destFileName,
      to: path.posix.join(destDir, destFileName),
    };
  });

  const cpPromises = entries.map(async (entry) => {
    const copyOptions = {
      overwrite: mergedOptions.overwrite,
      preserveTimestamps: mergedOptions.preserveTimestamps,
    };

    return fse.copy(entry.from, entry.to, copyOptions);
  });

  return Promise.all(cpPromises);
};

export default globCopy;
