import path from 'path';

import { serial as test } from 'ava';

import compile from './utils/compile';
import getCompiler from './utils/getCompiler';
import fsFixtures from './utils/fs-fixtures';

import FileManagerPlugin from '../lib';

const fixturesDir = path.resolve(__dirname, 'fixtures');

const { existsSync, mkdir, writeFile } = fsFixtures(fixturesDir);

test('should move files from source to destination', async (t) => {
  await mkdir('testing-move');

  const config = {
    onEnd: {
      move: [{ source: './testing-move', destination: './testing-moved' }],
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(existsSync('./testing-moved'));
  t.pass();
});
