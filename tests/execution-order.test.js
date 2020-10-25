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

test('should execute actions in a given order', async (t) => {
  await mkdir('testing-move');
  await writeFile('testing-move/dummy.js');

  const config = {
    events: {
      onStart: [
        {
          mkdir: ['testing-seq-dir', 'testing-seq-dir-2'],
        },
        {
          delete: ['testing-seq-dir-2'],
        },
        {
          copy: [{ source: 'testing-seq-dir/', destination: 'testing-seq-dir-copied/' }],
        },
      ],
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(existsSync('./testing-seq-dir/'));
  t.true(existsSync('./testing-seq-dir-copied/'));
  t.pass();
});
