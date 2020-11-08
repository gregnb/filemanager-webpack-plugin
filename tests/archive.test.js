import fs, { existsSync } from 'fs';

import test from 'ava';
import del from 'del';
import JSZip from 'jszip';

import compile from './utils/compile';
import getCompiler from './utils/getCompiler';
import tempy from './utils/tempy';

import FileManagerPlugin from '../lib';
import { join } from 'path';

const zipHasFile = async (zipPath, fileName) => {
  const data = await fs.promises.readFile(zipPath);
  const zip = await JSZip.loadAsync(data);
  return Object.keys(zip.files).includes(fileName);
};

test.beforeEach(async (t) => {
  t.context.tmpdir = await tempy.dir({ suffix: 'archive-action' });
});

test.afterEach(async (t) => {
  await del(t.context.tmpdir);
});

test('should archive(ZIP) a directory to a destination ZIP', async (t) => {
  const { tmpdir } = t.context;
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
  t.true(existsSync(zipPath));
});

test('should archive(ZIP) a single file to a destination ZIP', async (t) => {
  const { tmpdir } = t.context;
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
  t.true(existsSync(zipPath));
  t.true(await zipHasFile(zipPath, 'file'));
});

test('should archive(ZIP) a directory glob to destination ZIP', async (t) => {
  const { tmpdir } = t.context;
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
  t.true(existsSync(zipPath));
  t.true(await zipHasFile(zipPath, 'file'));
});

test('should archive(TAR) a directory glob to destination TAR when format is provided', async (t) => {
  const { tmpdir } = t.context;
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
  t.true(existsSync(zipPath));
});

test('should archive(TAR.GZ) a directory glob to destination TAR.GZ', async (t) => {
  const { tmpdir } = t.context;
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
  t.true(existsSync(zipPath));
});

// https://github.com/gregnb/filemanager-webpack-plugin/issues/37
test('should not include the output zip into compression', async (t) => {
  const { tmpdir } = t.context;
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
  t.false(await zipHasFile(zipPath, zipName));
});

test('should include files in the archive', async (t) => {
  const { tmpdir } = t.context;
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

  t.true(await zipHasFile(zipPath, 'file1'));
  t.true(await zipHasFile(zipPath, 'file2'));
});
