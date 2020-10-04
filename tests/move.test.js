import fs from 'fs';
import path from 'path';

import test from 'ava';

import compile from './utils/compile';
import getCompiler from './utils/getCompiler';
import fsFixtures from './utils/fs-fixtures';

import FileManagerPlugin from '../lib';

const fixturesDir = path.resolve(__dirname, 'fixtures');

const { existsSync, writeFile } = fsFixtures(fixturesDir);

test.serial('should move files from source to destination', async (t) => {
  const config = {
    onEnd: {
      copy: [
        {
          source: './dist',
          destination: './testing-temp',
        },
      ],
      move: [{ source: './testing-temp', destination: './testing-moved' }],
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(existsSync('./testing-moved/bundle.js'));
  t.pass();
});
