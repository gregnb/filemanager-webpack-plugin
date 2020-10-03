import path from 'path';

import test from 'ava';

import compile from './utils/compile';
import getCompiler from './utils/getCompiler';
import fsFixtures from './utils/fs-fixtures';

import FileManagerPlugin from '../lib';

const fixturesDir = path.resolve(__dirname, 'fixtures');

const { mkdir, writeFile, existsSync } = fsFixtures(fixturesDir);
const compiler = getCompiler(fixturesDir);

test.before(async () => {
  await mkdir('./testing');
});

test.serial('should delete file when array of strings provided in delete function', async (t) => {
  await writeFile('./testing/deletable-file.js', '');

  const config = {
    onStart: {
      delete: ['./testing/deletable-file.js'],
    },
  };

  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  const result = existsSync('./testing/testdir');
  t.true(result);
  t.pass();
});

test.serial(
  'should fail webpack build when delete function receives anything other than an array of strings',
  async (t) => {
    const config = {
      onStart: {
        delete: [{ source: 'object instead of string' }],
      },
    };

    new FileManagerPlugin(config).apply(compiler);

    try {
      await compile(compiler);
    } catch {
      t.pass();
    }
  }
);

test.serial('should fail webpack build when string provided in delete function instead of array', async (t) => {
  const config = {
    onStart: {
      delete: 'string instead of array',
    },
  };

  new FileManagerPlugin(config).apply(compiler);

  try {
    await compile(compiler);
  } catch {
    t.pass();
  }
});
