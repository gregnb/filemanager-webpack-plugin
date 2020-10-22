import path from 'path';

import { serial as test } from 'ava';
import del from 'del';
import JSZip from 'jszip';

import compile from './utils/compile';
import getCompiler from './utils/getCompiler';
import fsFixtures from './utils/fs-fixtures';

import FileManagerPlugin from '../lib';

const fixturesDir = path.resolve(__dirname, 'fixtures');

const { existsSync, readFile, writeFile } = fsFixtures(fixturesDir);

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

test('should archive (ZIP) a directory to destination ZIP when { source: "/source", destination: "/dest.zip" } provided', async (t) => {
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

test('should archive (ZIP) a single file to destination ZIP when { source: "/sourceFile.js", destination: "/dest.zip" } provided', async (t) => {
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

test('should archive (ZIP) a directory glob to destination ZIP when { source: "/source/**/*", destination: "/dest.zip" } provided', async (t) => {
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

test('should archive (TAR) a directory glob to destination TAR when { source: "/source/**/*", destination: "/dest.zip", format: "tar" } provided', async (t) => {
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

test('should archive (TAR.GZ) a directory glob to destination TAR.GZ when { source: "/source/**/*", destination: "/dest.tar.gz", format: "tar" } provided', async (t) => {
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
test('should exclude archive (ZIP) from destination ZIP when { source: "/source", destination: "/source/dest.zip" } provided', async (t) => {
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

test('should include root-level files in the archive (ZIP) from destination ZIP when { source: "/source", destination: "/source/dest.zip" } provided', async (t) => {
  await writeFile('testing/random-file.js');

  const config = {
    onEnd: {
      archive: [{ source: './testing/', destination: './testing/test8.zip' }],
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  const result = await zipHasFile('./testing/test8.zip', 'random-file.js');
  t.true(result);
});
