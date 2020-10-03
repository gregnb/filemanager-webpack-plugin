import fs from 'fs';
import path from 'path';

import test from 'ava';

import compile from './utils/compile';
import getCompiler from './utils/getCompiler';
import fsFixtures from './utils/fs-fixtures';

import FileManagerPlugin from '../lib';

const fixturesDir = path.resolve(__dirname, 'fixtures');

const { existsSync } = fsFixtures(fixturesDir);
const compiler = getCompiler(fixturesDir);

test.serial("should create a directory when ['/path/to/dir'] provided", async (t) => {
  const config = {
    onEnd: {
      mkdir: ['./testing/testdir'],
    },
  };

  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  const result = existsSync('./testing/testdir');
  t.true(result);
  t.pass();
});
