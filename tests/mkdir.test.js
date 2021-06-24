import { join, relative } from 'node:path';
import { existsSync } from 'node:fs';

import test from 'ava';
import del from 'del';

import compile from './utils/compile.js';
import getCompiler from './utils/getCompiler.js';
import tempy from './utils/tempy.js';

import FileManagerPlugin from '../src/index.js';

test.beforeEach(async (t) => {
  t.context.tmpdir = await tempy.dir({ suffix: 'mkdir-action' });
});

test.afterEach(async (t) => {
  await del(t.context.tmpdir);
});

test('should create the given directories', async (t) => {
  const { tmpdir } = t.context;

  const config = {
    context: tmpdir,
    events: {
      onStart: {
        mkdir: ['dir1', 'dir2'],
      },
      onEnd: {
        mkdir: ['dir3', 'dir4'],
      },
    },
  };

  const compiler = getCompiler();
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(existsSync(join(tmpdir, 'dir1')));
  t.true(existsSync(join(tmpdir, 'dir2')));
  t.true(existsSync(join(tmpdir, 'dir3')));
  t.true(existsSync(join(tmpdir, 'dir4')));
});

test('should create nested directories', async (t) => {
  const { tmpdir } = t.context;

  const config = {
    context: tmpdir,
    events: {
      onEnd: {
        mkdir: ['dir/depth1', 'dir/depth1/depth2'],
      },
    },
    runTasksInSeries: true,
  };

  const compiler = getCompiler();
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(existsSync(join(tmpdir, 'dir')));
  t.true(existsSync(join(tmpdir, 'dir/depth1')));
  t.true(existsSync(join(tmpdir, 'dir/depth1/depth2')));
});

test('should not overwite existing directories', async (t) => {
  const { tmpdir } = t.context;

  const dir = await tempy.dir({ root: tmpdir });
  const file = await tempy.file(dir, 'file');
  const dirName = relative(tmpdir, dir);

  const config = {
    context: tmpdir,
    events: {
      onEnd: {
        mkdir: [dirName],
      },
    },
  };

  const compiler = getCompiler();
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(existsSync(dir));
  t.true(existsSync(join(file)));
});
