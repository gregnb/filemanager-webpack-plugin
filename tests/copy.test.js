import { existsSync } from 'node:fs';
import { basename, join, sep } from 'node:path';

import { test as baseTest, expect, describe } from 'vitest';
import { deleteAsync } from 'del';

import compile from './utils/compile.js';
import getCompiler from './utils/getCompiler.js';
import tempy from './utils/tempy.js';

import FileManagerPlugin from '../src/index.js';

describe('Copy Action', () => {
  const test = baseTest.extend({
    tmpdir: async ({}, use) => {
      const tmpdir = await tempy.dir({ suffix: 'archive-action' });
      await use(tmpdir);
      await deleteAsync(tmpdir);
    },
  });

  test('should copy files to a directory given a glob source', async ({ tmpdir }) => {
    const file1 = await tempy.file(tmpdir);
    const file2 = await tempy.file(tmpdir);
    const dirName = tempy.getDirName();

    const config = {
      context: tmpdir,
      events: {
        onEnd: {
          copy: [{ source: '*', destination: dirName }],
        },
      },
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    expect(existsSync(join(tmpdir, dirName))).toBe(true);
    expect(existsSync(join(tmpdir, dirName, basename(file1)))).toBe(true);
    expect(existsSync(join(tmpdir, dirName, basename(file2)))).toBe(true);
  });

  test('should copy files to a directory given a glob absolute source', async ({ tmpdir }) => {
    const file1 = await tempy.file(tmpdir);
    const file2 = await tempy.file(tmpdir);
    const dirName = tempy.getDirName();

    const source = join(tmpdir, '*');

    const config = {
      context: tmpdir,
      events: {
        onEnd: {
          copy: [{ source, destination: dirName }],
        },
      },
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    expect(existsSync(join(tmpdir, dirName))).toBe(true);
    expect(existsSync(join(tmpdir, dirName, basename(file1)))).toBe(true);
    expect(existsSync(join(tmpdir, dirName, basename(file2)))).toBe(true);
  });

  test('should deep copy files to directory given a glob source', async ({ tmpdir }) => {
    const file1 = await tempy.file(tmpdir);
    const nestedDir = await tempy.dir({ root: tmpdir });
    const file2 = await tempy.file(nestedDir);

    const dirName = tempy.getDirName();

    const config = {
      context: tmpdir,
      events: {
        onEnd: {
          copy: [{ source: '**/*', destination: dirName }],
        },
      },
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    expect(existsSync(join(tmpdir, dirName))).toBe(true);
    expect(existsSync(join(tmpdir, dirName, basename(file1)))).toBe(true);
    expect(existsSync(join(tmpdir, dirName, nestedDir.split(sep).pop(), basename(file2)))).toBe(true);
  });

  test('should flat copy the files to directory given a glob source', async ({ tmpdir }) => {
    const file1 = await tempy.file(tmpdir);
    const nestedDir = await tempy.dir({ root: tmpdir });
    const file2 = await tempy.file(nestedDir);

    const dirName = tempy.getDirName();

    const config = {
      context: tmpdir,
      events: {
        onEnd: {
          copy: [
            {
              source: '**/*',
              destination: dirName,
              options: {
                flat: true,
              },
              globOptions: {},
            },
          ],
        },
      },
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    expect(existsSync(join(tmpdir, dirName))).toBe(true);
    expect(existsSync(join(tmpdir, dirName, basename(file1)))).toBe(true);
    expect(existsSync(join(tmpdir, dirName, basename(file2)))).toBe(true);
  });

  test(`should create destination directory if it doesn't exist and copy files`, async ({ tmpdir }) => {
    const file = await tempy.file(tmpdir);
    const destDir = tempy.getDirName();

    const config = {
      context: tmpdir,
      events: {
        onEnd: {
          copy: [{ source: '*', destination: destDir }],
        },
      },
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    expect(existsSync(join(tmpdir, destDir, basename(file)))).toBe(true);
  });

  test('should copy and create destination directory given a glob source with extension', async ({ tmpdir }) => {
    await tempy.file(tmpdir, 'index.html');
    const destDir = tempy.getDirName();

    const config = {
      context: tmpdir,
      events: {
        onEnd: {
          copy: [{ source: `**/*{fake,index}.html`, destination: destDir }],
        },
      },
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    expect(existsSync(join(tmpdir, destDir, 'index.html'))).toBe(true);
    expect(existsSync(join(tmpdir, destDir, 'fake'))).toBe(false);
  });

  test('should copy source file to destination file', async ({ tmpdir }) => {
    await tempy.file(tmpdir, 'index.html');

    const config = {
      context: tmpdir,
      runTasksInSeries: true,
      events: {
        onEnd: {
          copy: [
            { source: 'index.html', destination: './deep/index.html' },
            { source: 'index.html', destination: './deep/deep1/index.html' },
          ],
        },
      },
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    expect(existsSync(join(tmpdir, 'deep/index.html'))).toBe(true);
    expect(existsSync(join(tmpdir, 'deep/deep1/index.html'))).toBe(true);
  });

  test('should copy file into the directory given source is a file and destination is a directory', async ({
    tmpdir,
  }) => {
    const fileName = tempy.getFileName();
    await tempy.file(tmpdir, fileName);
    const destDir = tempy.getDirName('/');

    const config = {
      context: tmpdir,
      events: {
        onEnd: {
          copy: [{ source: fileName, destination: destDir }],
        },
      },
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    expect(existsSync(join(tmpdir, destDir, fileName))).toBe(true);
  });

  test('should copy a file without extension to target folder', async ({ tmpdir }) => {
    const fileName = tempy.getFileName();
    await tempy.file(tmpdir, fileName);
    const destDir = tempy.getDirName('/');

    const config = {
      context: tmpdir,
      events: {
        onEnd: {
          copy: [{ source: fileName, destination: destDir }],
        },
      },
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    expect(existsSync(join(tmpdir, destDir, fileName))).toBe(true);
  });

  test('should not copy a file that does not exist', async ({ tmpdir }) => {
    const config = {
      context: tmpdir,
      events: {
        onEnd: {
          copy: [{ source: 'doesnotexit.js', destination: 'wontexist.js' }],
        },
      },
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    expect(existsSync('./testing/wontexist.js')).toBe(false);
  });
});
