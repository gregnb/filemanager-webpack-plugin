import path from 'path';

import { serial as test } from 'ava';
import del from 'del';

import compile from './utils/compile';
import getCompiler from './utils/getCompiler';
import fsFixtures from './utils/fs-fixtures';

import FileManagerPlugin from '../lib';

const fixturesDir = path.resolve(__dirname, 'fixtures');

const { existsSync } = fsFixtures(fixturesDir);

test.before(async () => {
  await del('*', {
    cwd: fixturesDir,
    onlyDirectories: true,
  });
});

test("should create a directory when ['/path/to/dir'] provided via onEnd", async (t) => {
  const config = {
    onStart: {
      mkdir: ['testing-mkdir-start', 'testing-mkdir2-start'],
    },
    onEnd: {
      mkdir: ['testing-mkdir-end', 'testing-mkdir2-end'],
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
