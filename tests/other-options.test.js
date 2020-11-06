import path from 'path';

import { serial as test } from 'ava';
import del from 'del';

import compile from './utils/compile';
import getCompiler from './utils/getCompiler';
import fsFixtures from './utils/fs-fixtures';

import FileManagerPlugin from '../lib';

const fixturesDir = path.resolve(__dirname, 'fixtures');

const { existsSync, mkdir } = fsFixtures(fixturesDir);

test.before(async () => {
  await del('*', {
    cwd: fixturesDir,
    onlyDirectories: true,
  });
});

test(`should tasks in sequence with option 'runTasksInSeries'`, async (t) => {
  await mkdir('testing-seq-dir1');
  await mkdir('testing-seq-dir2');

  const config = {
    events: {
      onEnd: {
        copy: [
          { source: 'dist/index.html', destination: 'testing-seq-dir1/' },
          { source: 'testing-seq-dir1/index.html', destination: 'testing-seq-dir2/' },
        ],
      },
    },
    runTasksInSeries: true,
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(existsSync('./testing-seq-dir1/index.html'));
  t.true(existsSync('./testing-seq-dir2/index.html'));
  t.pass();
});

test(`should resolve files from given 'context'`, async (t) => {
  const config = {
    events: {
      onEnd: {
        copy: [{ source: 'index.html', destination: 'index.copied.html' }],
      },
    },
    context: path.join(fixturesDir, 'dist'),
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(existsSync('dist/index.html'));
  t.true(existsSync('dist/index.copied.html'));
  t.pass();
});
