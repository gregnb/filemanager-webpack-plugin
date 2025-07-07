import { existsSync } from 'node:fs';
import { basename, join, sep } from 'node:path';

import { test as baseTest, expect, describe } from 'vitest';
import { deleteAsync } from 'del';

import compile from './utils/compile';
import getCompiler from './utils/getCompiler';
import tempy from './utils/tempy';

import FileManagerPlugin, { FileManagerPluginOptions } from '../src';

describe('Copy Action', () => {
  const test = baseTest.extend<{ tmpdir: string }>({
    // oxlint-disable-next-line no-empty-pattern
    tmpdir: async ({}, use) => {
      const tmpdir = await tempy.dir({ suffix: 'archive-action' });
      await use(tmpdir);
      await deleteAsync(tmpdir);
    },
  });

  test('copy files to a directory given a glob source', async ({ tmpdir }) => {
    const file1 = await tempy.file(tmpdir);
    const file2 = await tempy.file(tmpdir);
    const dirName = tempy.getDirName();

    const config: FileManagerPluginOptions = {
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

  test('copy files to a directory given a glob absolute source', async ({ tmpdir }) => {
    const file1 = await tempy.file(tmpdir);
    const file2 = await tempy.file(tmpdir);
    const dirName = tempy.getDirName();

    const source = join(tmpdir, '*');

    const config: FileManagerPluginOptions = {
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

  test('deep copy files to directory given a glob source', async ({ tmpdir }) => {
    const file1 = await tempy.file(tmpdir);
    const nestedDir = await tempy.dir({ root: tmpdir });
    const file2 = await tempy.file(nestedDir);

    const dirName = tempy.getDirName();

    const config: FileManagerPluginOptions = {
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

  test('flat copy the files to directory given a glob source', async ({ tmpdir }) => {
    const file1 = await tempy.file(tmpdir);
    const nestedDir = await tempy.dir({ root: tmpdir });
    const file2 = await tempy.file(nestedDir);

    const dirName = tempy.getDirName();

    const config: FileManagerPluginOptions = {
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

  test('ignore file while copying glob source', async ({ tmpdir }) => {
    const file1 = await tempy.file(tmpdir);
    const file2 = await tempy.file(tmpdir);
    const file3 = await tempy.file(tmpdir);

    const dirName = tempy.getDirName();

    const config: FileManagerPluginOptions = {
      context: tmpdir,
      events: {
        onEnd: {
          copy: [
            {
              source: '**/*',
              destination: dirName,
              options: {},
              globOptions: {
                ignore: [`**/${basename(file2)}`],
              },
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
    expect(existsSync(join(tmpdir, dirName, basename(file2)))).toBe(false);
    expect(existsSync(join(tmpdir, dirName, basename(file3)))).toBe(true);
  });

  test(`create destination directory if it doesn't exist and copy files`, async ({ tmpdir }) => {
    const file = await tempy.file(tmpdir);
    const destDir = tempy.getDirName();

    const config: FileManagerPluginOptions = {
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

  test('copy and create destination directory given a glob source with extension', async ({ tmpdir }) => {
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

  test('copy source file to destination file', async ({ tmpdir }) => {
    await tempy.file(tmpdir, 'index.html');

    const config: FileManagerPluginOptions = {
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

  test('copy file into the directory given source is a file and destination is a directory', async ({ tmpdir }) => {
    const fileName = tempy.getFileName();
    await tempy.file(tmpdir, fileName);
    const destDir = tempy.getDirName('/');

    const config: FileManagerPluginOptions = {
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

  test('copy a file without extension to target folder', async ({ tmpdir }) => {
    const fileName = tempy.getFileName();
    await tempy.file(tmpdir, fileName);
    const destDir = tempy.getDirName('/');

    const config: FileManagerPluginOptions = {
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

  test('not copy a file that does not exist', async ({ tmpdir }) => {
    const config: FileManagerPluginOptions = {
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
