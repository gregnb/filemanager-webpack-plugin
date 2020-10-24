import path from 'path';

import { serial as test } from 'ava';
import del from 'del';
import JSZip from 'jszip';

import compile from './utils/compile';
import getCompiler from './utils/getCompiler';
import fsFixtures from './utils/fs-fixtures';

import FileManagerPlugin from '../lib';

const fixturesDir = path.resolve(__dirname, 'fixtures');

const { existsSync, readFile, writeFile, mkdir } = fsFixtures(fixturesDir);

const zipHasFile = async (zipPath, fileName) => {
  const data = await readFile(zipPath);
  const zip = await JSZip.loadAsync(data);
  return Object.keys(zip.files).includes(fileName);
};

test.before(async () => {
  await del('*', {
    cwd: fixturesDir,
    onlyDirectories: true,
  });
});

test('should archive(ZIP) a directory to a destination ZIP', async (t) => {
  const config = {
    onEnd: {
      archive: [{ source: './dist', destination: './testing/test1.zip' }],
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  const result = existsSync('./testing/test1.zip');
  t.true(result);
  t.pass();
});

test('should archive(ZIP) a single file to a destination ZIP', async (t) => {
  const config = {
    onEnd: {
      archive: [{ source: './dist/index.html', destination: './testing/test2.zip' }],
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  const result = existsSync('./testing/test2.zip');
  const fileExist = await zipHasFile('./testing/test2.zip', 'index.html');
  t.true(result);
  t.true(fileExist);
  t.pass();
});

test('should archive(ZIP) a directory glob to destination ZIP', async (t) => {
  const config = {
    onEnd: {
      archive: [{ source: 'dist/**/*', destination: './testing/test3.zip' }],
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  const result = existsSync('./testing/test3.zip');
  t.true(result);
  t.pass();
});

test('should archive(TAR) a directory glob to destination TAR when format is provided', async (t) => {
  const config = {
    onEnd: {
      archive: [{ source: 'dist/**/*', destination: './testing/test4.tar', format: 'tar' }],
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  const result = existsSync('./testing/test4.tar');
  t.true(result);
  t.pass();
});

test('should archive(TAR.GZ) a directory glob to destination TAR.GZ', async (t) => {
  const config = {
    onEnd: {
      archive: [
        {
          source: 'dist/**/*',
          destination: './testing/test5.tar.gz',
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
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  const result = existsSync('./testing/test5.tar.gz');
  t.true(result);
  t.pass();
});

// https://github.com/gregnb/filemanager-webpack-plugin/issues/37
test('should not include the output zip into compression', async (t) => {
  const config = {
    onEnd: {
      archive: [{ source: './testing/', destination: './testing/test7.zip' }],
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  const result = await zipHasFile('./testing/test7.zip', 'test7.zip');
  t.false(result);
});

test('should include files in the archive', async (t) => {
  await writeFile('testing/random-file.js');
  await mkdir('testing/nested');
  await writeFile('testing/nested/file.html');

  const config = {
    onEnd: {
      archive: [{ source: './testing/', destination: './testing/test8.zip' }],
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  const exist = await zipHasFile('./testing/test8.zip', 'random-file.js');
  const nestedExist = await zipHasFile('./testing/test8.zip', 'nested/file.html');
  t.true(exist);
  t.true(nestedExist);
});
