import { join } from 'node:path';
import { existsSync } from 'node:fs';
import test from 'ava';
import del from 'del';

import compile from './utils/compile.js';
import getCompiler from './utils/getCompiler.js';
import getFixtruesDir from './utils/getFixturesDir.js';
import tempy from './utils/tempy.js';

import FileManagerPlugin from '../src/index.js';

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
