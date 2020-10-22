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

test('should move files from source to destination', async (t) => {
  await mkdir('testing-move');
  await writeFile('testing-move/dummy.js');

  const config = {
    onEnd: {
      move: [{ source: './testing-move', destination: './testing-moved' }],
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(existsSync('./testing-moved'));
  t.true(existsSync('./testing-moved/dummy.js'));
  t.pass();
});
