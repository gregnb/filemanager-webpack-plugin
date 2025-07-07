import fs, { existsSync } from 'node:fs';
import { join } from 'node:path';

import { test as baseTest, expect, describe } from 'vitest';
import { deleteAsync } from 'del';
import JSZip from 'jszip';

import compile from './utils/compile';
import getCompiler from './utils/getCompiler';
import tempy from './utils/tempy';

import FileManagerPlugin from '../src';

const zipHasFile = async (zipPath: string, fileName: string) => {
  const data = await fs.promises.readFile(zipPath);
  const zip = await JSZip.loadAsync(data);
  return Object.keys(zip.files).includes(fileName);
};

describe('Archive Action', () => {
  const test = baseTest.extend<{ tmpdir: string }>({
    // oxlint-disable-next-line no-empty-pattern
    tmpdir: async ({}, use) => {
      const tmpdir = await tempy.dir({ suffix: 'archive-action' });
      await use(tmpdir);
      await deleteAsync(tmpdir);
    },
  });

  test('should archive(ZIP) a directory to a destination ZIP', async ({ tmpdir }) => {
    await tempy.file(tmpdir, 'file');

    const zipName = tempy.getZipName();

    const config = {
      context: tmpdir,
      events: {
        onEnd: {
          archive: [{ source: './', destination: zipName }],
        },
      },
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    const zipPath = join(tmpdir, zipName);
    expect(existsSync(zipPath)).toBe(true);
  });

  test('should archive(ZIP) a single file to a destination ZIP', async ({ tmpdir }) => {
    await tempy.file(tmpdir, 'file');

    const zipName = tempy.getZipName();

    const config = {
      context: tmpdir,
      events: {
        onEnd: {
          archive: [{ source: './', destination: zipName }],
        },
      },
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    const zipPath = join(tmpdir, zipName);
    expect(existsSync(zipPath)).toBe(true);
    expect(await zipHasFile(zipPath, 'file')).toBe(true);
  });

  test('should archive(ZIP) a directory glob to destination ZIP', async ({ tmpdir }) => {
    await tempy.file(tmpdir, 'file');

    const zipName = tempy.getZipName();

    const config = {
      context: tmpdir,
      events: {
        onEnd: {
          archive: [{ source: '**/*', destination: zipName }],
        },
      },
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    const zipPath = join(tmpdir, zipName);
    expect(existsSync(zipPath)).toBe(true);
    expect(await zipHasFile(zipPath, 'file')).toBe(true);
  });

  test('should archive(TAR) a directory glob to destination TAR when format is provided', async ({ tmpdir }) => {
    await tempy.file(tmpdir, 'file');

    const zipName = tempy.getZipName('.tar');

    const config = {
      context: tmpdir,
      events: {
        onEnd: {
          archive: [{ source: '**/*', destination: zipName, format: 'tar' as const }],
        },
      },
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    const zipPath = join(tmpdir, zipName);
    expect(existsSync(zipPath)).toBe(true);
  });

  test('should archive(TAR.GZ) a directory glob to destination TAR.GZ', async ({ tmpdir }) => {
    await tempy.file(tmpdir, 'file');

    const zipName = tempy.getZipName('.tar.gz');

    const config = {
      context: tmpdir,
      events: {
        onEnd: {
          archive: [
            {
              source: '**/*',
              destination: zipName,
              format: 'tar' as const,
              options: {
                gzip: true,
                gzipOptions: {
                  level: 1,
                },
              },
            },
          ],
        },
      },
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    const zipPath = join(tmpdir, zipName);
    expect(existsSync(zipPath)).toBe(true);
  });

  // https://github.com/gregnb/filemanager-webpack-plugin/issues/37
  test('should not include the output zip into compression', async ({ tmpdir }) => {
    await tempy.file(tmpdir, 'file');

    const zipName = tempy.getZipName();

    const config = {
      context: tmpdir,
      events: {
        onEnd: {
          archive: [{ source: './', destination: zipName }],
        },
      },
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    const zipPath = join(tmpdir, zipName);
    expect(await zipHasFile(zipPath, zipName)).toBe(false);
  });

  test('should include files in the archive', async ({ tmpdir }) => {
    await tempy.file(tmpdir, 'file1');
    await tempy.file(tmpdir, 'file2');

    const zipName = tempy.getZipName();

    const config = {
      context: tmpdir,
      events: {
        onEnd: {
          archive: [{ source: './', destination: zipName }],
        },
      },
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    const zipPath = join(tmpdir, zipName);

    expect(await zipHasFile(zipPath, 'file1')).toBe(true);
    expect(await zipHasFile(zipPath, 'file2')).toBe(true);
  });

  test('should ignore files in the archive correclty if ignore is an array', async ({ tmpdir }) => {
    await tempy.file(tmpdir, 'file1');
    await tempy.file(tmpdir, 'file2');

    const zipName = tempy.getZipName();

    const config = {
      context: tmpdir,
      events: {
        onEnd: {
          archive: [
            {
              source: './',
              destination: zipName,
              options: {
                globOptions: {
                  ignore: ['**/**/file2'],
                },
              },
            },
          ],
        },
      },
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    const zipPath = join(tmpdir, zipName);

    expect(await zipHasFile(zipPath, 'file1')).toBe(true);
    expect(await zipHasFile(zipPath, 'file2')).toBe(false);
  });

  test('should ignore files in the archive correclty if ignore is a string', async ({ tmpdir }) => {
    await tempy.file(tmpdir, 'file1');
    await tempy.file(tmpdir, 'file2');

    const zipName = tempy.getZipName();

    const config = {
      context: tmpdir,
      events: {
        onEnd: {
          archive: [
            {
              source: './',
              destination: zipName,
              options: {
                globOptions: {
                  ignore: ['**/**/file2'],
                },
              },
            },
          ],
        },
      },
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    const zipPath = join(tmpdir, zipName);

    expect(await zipHasFile(zipPath, 'file1')).toBe(true);
    expect(await zipHasFile(zipPath, 'file2')).toBe(false);
  });
});
