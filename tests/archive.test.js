import fs, { existsSync } from 'node:fs';
import { join } from 'node:path';

import { beforeEach, afterEach, test, expect, describe } from 'vitest';
import { deleteAsync } from 'del';
import JSZip from 'jszip';

import compile from './utils/compile.js';
import getCompiler from './utils/getCompiler.js';
import tempy from './utils/tempy.js';

import FileManagerPlugin from '../src/index.js';

const zipHasFile = async (zipPath, fileName) => {
  const data = await fs.promises.readFile(zipPath);
  const zip = await JSZip.loadAsync(data);
  return Object.keys(zip.files).includes(fileName);
};

describe('Archive Action', () => {
  let tmpdir;

  beforeEach(async () => {
    tmpdir = await tempy.dir({ suffix: 'archive-action' });
  });

  afterEach(async () => {
    await deleteAsync(tmpdir);
  });

  test('should archive(ZIP) a directory to a destination ZIP', async () => {
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

  test('should archive(ZIP) a single file to a destination ZIP', async () => {
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

  test('should archive(ZIP) a directory glob to destination ZIP', async () => {
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

  test('should archive(TAR) a directory glob to destination TAR when format is provided', async () => {
    await tempy.file(tmpdir, 'file');

    const zipName = tempy.getZipName('.tar');

    const config = {
      context: tmpdir,
      events: {
        onEnd: {
          archive: [{ source: '**/*', destination: zipName, format: 'tar' }],
        },
      },
    };

    const compiler = getCompiler();
    new FileManagerPlugin(config).apply(compiler);
    await compile(compiler);

    const zipPath = join(tmpdir, zipName);
    expect(existsSync(zipPath)).toBe(true);
  });

  test('should archive(TAR.GZ) a directory glob to destination TAR.GZ', async () => {
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
              format: 'tar',
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
  test('should not include the output zip into compression', async () => {
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

  test('should include files in the archive', async () => {
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

  test('should ignore files in the archive correclty if ignore is an array', async () => {
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

  test('should ignore files in the archive correclty if ignore is a string', async () => {
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
