import { existsSync } from 'fs';
import { posix } from 'path';

import test from 'ava';
import del from 'del';

import compile from './utils/compile';
import getCompiler from './utils/getCompiler';
import tempy from './utils/tempy';

import FileManagerPlugin from '../lib';

test.beforeEach(async (t) => {
  t.context.tmpdir = await tempy.dir({ suffix: 'delete-action' });
});

test.afterEach(async (t) => {
  await del(t.context.tmpdir);
});

test('should delete file when array of strings provided in delete function', async (t) => {
  const { tmpdir } = t.context;

  const file1 = await tempy.file(tmpdir);
  const file2 = await tempy.file(tmpdir);
  const file3 = await tempy.file(tmpdir);

  const config = {
    events: {
      onStart: {
        delete: [file1],
      },
      onEnd: {
        delete: [file2, file3],
      },
    },
  };

  const compiler = getCompiler();
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.false(existsSync(file1));
  t.false(existsSync(file2));
  t.false(existsSync(file3));
});

test('should support glob', async (t) => {
  const { tmpdir } = t.context;

  const file1 = await tempy.file(tmpdir);
  const file2 = await tempy.file(tmpdir);
  const file3 = await tempy.file(tmpdir);

  const config = {
    events: {
      onEnd: {
        delete: [posix.join(tmpdir, '/*')],
      },
    },
  };

  const compiler = getCompiler();
  new FileManagerPlugin(config).apply(compiler);

  await compile(compiler);

  t.false(existsSync(file1));
  t.false(existsSync(file2));
  t.false(existsSync(file3));
});
