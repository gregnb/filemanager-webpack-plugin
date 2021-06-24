import { existsSync } from 'node:fs';

import test from 'ava';
import del from 'del';

import compile from './utils/compile.js';
import getCompiler from './utils/getCompiler.js';
import tempy from './utils/tempy.js';

import FileManagerPlugin from '../src/index.js';

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

  t.true(existsSync(file1));
  t.true(existsSync(file2));
  t.true(existsSync(file3));

  const config = {
    context: tmpdir,
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

  t.true(existsSync(file1));
  t.true(existsSync(file2));
  t.true(existsSync(file3));

  const config = {
    context: tmpdir,
    events: {
      onEnd: {
        delete: ['./*'],
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

test('should accept options', async (t) => {
  const { tmpdir } = t.context;

  const file = await tempy.file(tmpdir);

  t.true(existsSync(file));

  const config = {
    context: tmpdir,
    events: {
      onEnd: {
        delete: [{ source: './*', options: { force: true } }, './*'],
      },
    },
  };

  const compiler = getCompiler();
  new FileManagerPlugin(config).apply(compiler);

  await compile(compiler);

  t.false(existsSync(file));
});
