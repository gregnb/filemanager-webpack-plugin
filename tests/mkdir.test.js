import path from 'path';

import { serial as test } from 'ava';
import del from 'del';

import compile from './utils/compile';
import getCompiler from './utils/getCompiler';
import fsFixtures from './utils/fs-fixtures';

import FileManagerPlugin from '../lib';

const fixturesDir = path.resolve(__dirname, 'fixtures');

const { existsSync, mkdir, writeFile } = fsFixtures(fixturesDir);

test.before(async () => {
  await del('*', {
    cwd: fixturesDir,
    onlyDirectories: true,
  });
});

test('should create the given directories', async (t) => {
  const config = {
    events: {
      onStart: {
        mkdir: ['testing-mkdir-start', 'testing-mkdir2-start'],
      },
      onEnd: {
        mkdir: ['testing-mkdir-end', 'testing-mkdir2-end'],
      },
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(existsSync('testing-mkdir-start'));
  t.true(existsSync('testing-mkdir2-start'));
  t.true(existsSync('testing-mkdir-end'));
  t.true(existsSync('testing-mkdir2-end'));
  t.pass();
});

test('should create nested directories', async (t) => {
  const config = {
    events: {
      onEnd: {
        mkdir: ['testing-mkdir/deep', 'testing-mkdir/deep/deep1'],
      },
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(existsSync('testing-mkdir/deep'));
  t.true(existsSync('testing-mkdir/deep/deep1'));
  t.pass();
});

test('should not overwite existing directories', async (t) => {
  await mkdir('testing-mkdir-exist');
  await writeFile('testing-mkdir-exist/file1');

  const config = {
    events: {
      onEnd: {
        mkdir: ['testing-mkdir-exist'],
      },
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(existsSync('testing-mkdir-exist'));
  t.true(existsSync('testing-mkdir-exist/file1'));
  t.pass();
});
