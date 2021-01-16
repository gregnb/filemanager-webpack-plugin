import { join } from 'path';

import test from 'ava';
import del from 'del';

import compile from './utils/compile';
import getCompiler from './utils/getCompiler';
import getFixtruesDir from './utils/getFixturesDir';
import tempy from './utils/tempy';

import FileManagerPlugin from '../lib';
import { existsSync } from 'fs';

const fixturesDir = getFixtruesDir();

test.beforeEach(async (t) => {
  t.context.tmpdir = await tempy.dir({ suffix: 'other-options' });
});

test.afterEach(async (t) => {
  await del(t.context.tmpdir);
});

test(`should tasks in sequence with option 'runTasksInSeries'`, async (t) => {
  const { tmpdir } = t.context;

  const dir1 = tempy.getDirName('/');
  const dir2 = tempy.getDirName('/');

  const config = {
    context: fixturesDir,
    runTasksInSeries: true,
    events: {
      onEnd: {
        copy: [
          { source: 'dist/index.html', destination: join(tmpdir, dir1) },
          { source: join(tmpdir, dir1, 'index.html'), destination: join(tmpdir, dir2) },
        ],
      },
    },
  };

  const compiler = getCompiler(fixturesDir);
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(existsSync(join(tmpdir, dir1, 'index.html')));
  t.true(existsSync(join(tmpdir, dir2, 'index.html')));
});

test(`should resolve files from given 'context'`, async (t) => {
  const distDir = join(fixturesDir, 'dist');

  const config = {
    events: {
      onEnd: {
        copy: [{ source: 'index.html', destination: 'index.copied.html' }],
      },
    },
    context: distDir,
  };

  const compiler = getCompiler();
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(existsSync(join(distDir, 'index.html')));
  t.true(existsSync(join(distDir, 'index.copied.html')));
});
