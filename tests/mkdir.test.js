import path from 'path';

import { serial as test } from 'ava';

import compile from './utils/compile';
import getCompiler from './utils/getCompiler';
import fsFixtures from './utils/fs-fixtures';

import FileManagerPlugin from '../lib';

const fixturesDir = path.resolve(__dirname, 'fixtures');

const { existsSync } = fsFixtures(fixturesDir);
const compiler = getCompiler(fixturesDir);

test("should create a directory when ['/path/to/dir'] provided", async (t) => {
  const config = {
    onEnd: {
      mkdir: ['./testing/testdir'],
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  const result = existsSync('./testing/testdir');
  t.true(result);
  t.pass();
});
