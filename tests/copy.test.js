import path from 'path';

import { serial as test } from 'ava';
import glob from 'fast-glob';
import del from 'del';

import compile from './utils/compile';
import getCompiler from './utils/getCompiler';
import fsFixtures from './utils/fs-fixtures';

import FileManagerPlugin from '../lib';

const fixturesDir = path.resolve(__dirname, 'fixtures');
const { existsSync, writeFile } = fsFixtures(fixturesDir);

test.before(async () => {
  await del('*', {
    cwd: fixturesDir,
    onlyDirectories: true,
  });
});

test('should copy files to a directory given a glob source', async (t) => {
  const config = {
    events: {
      onEnd: {
        copy: [{ source: './dist/*', destination: './testing/testing1' }],
      },
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  const result = existsSync('./testing/testing1');
  t.true(result);
  t.pass();
});

test('should deep copy files to directory given a glob source', async (t) => {
  const config = {
    events: {
      onEnd: {
        copy: [{ source: './dist/**/*', destination: './testing/testing2' }],
      },
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  const result = existsSync('./testing/testing2');
  t.true(result);
  t.pass();
});

test(`should create destination directory if it doesn't exist and copy files`, async (t) => {
  const config = {
    events: {
      onEnd: {
        copy: [{ source: './dist', destination: './testing/testing3' }],
      },
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  const result = existsSync('./testing/testing3');
  t.true(result);
  t.pass();
});

test('should copy and create destination directory given a glob source with extension', async (t) => {
  const config = {
    events: {
      onEnd: {
        copy: [{ source: './dist/{fake,index}.html', destination: './testing/testing4' }],
      },
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  const result = existsSync('./testing/testing4/index.html');
  t.true(result);
  t.pass();
});

test('should copy source file to destination file', async (t) => {
  const config = {
    events: {
      onEnd: {
        copy: [
          { source: './dist/index.html', destination: './testing/newindex.html' },
          { source: './dist/index.html', destination: './testing/sub/newindex.html' },
        ],
      },
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(existsSync('./testing/newindex.html'));
  t.true(existsSync('./testing/sub/newindex.html'));
  t.pass();
});

test('should copy file into the directory given source is a file and destination is a directory', async (t) => {
  const config = {
    events: {
      onEnd: {
        copy: [{ source: './dist/index.html', destination: './testing/testing5/' }],
      },
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  const result = existsSync('./testing/testing5/index.html');
  t.true(result);
  t.pass();
});

test('should copy a file without extension to target folder', async (t) => {
  await writeFile('testing/file-without-ext');

  const config = {
    events: {
      onEnd: {
        copy: [{ source: 'testing/file-without-ext', destination: './testing/no-ext/' }],
      },
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  const result = existsSync('./testing/no-ext/file-without-ext');
  t.true(result);
  t.pass();
});

test('should not copy a file that does not exist', async (t) => {
  const config = {
    events: {
      onEnd: {
        copy: [{ source: './dist/doesnotexit.js', destination: './testing/wontexist.js' }],
      },
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  const result = existsSync('./testing/wontexist.js');
  t.false(result);
  t.pass();
});
