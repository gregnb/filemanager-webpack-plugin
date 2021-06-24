import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import test from 'ava';
import del from 'del';

import compile from './utils/compile.js';
import getCompiler from './utils/getCompiler.js';
import tempy from './utils/tempy.js';

import FileManagerPlugin from '../src/index.js';

test.beforeEach(async (t) => {
  t.context.tmpdir = await tempy.dir({ suffix: 'execution-order' });
});

test.afterEach(async (t) => {
  await del(t.context.tmpdir);
});

test('should execute actions in a given order', async (t) => {
  const { tmpdir } = t.context;

  const mDir = await tempy.dir({ root: tmpdir });
  await tempy.file(mDir, 'file');

  const dirName = relative(tmpdir, mDir);

  const config = {
    context: tmpdir,
    events: {
      onStart: [
        {
          mkdir: ['dir1', 'dir2'],
        },
        {
          delete: ['dir2'],
        },
        {
          copy: [{ source: `${dirName}/`, destination: 'dir-copied/' }],
        },
      ],
    },
  };

  const compiler = getCompiler();
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(existsSync(join(tmpdir, 'dir1')));
  t.false(existsSync(join(tmpdir, 'dir2')));
  t.false(existsSync(join(tmpdir, 'dir2')));
  t.true(existsSync(join(tmpdir, 'dir-copied/file')));
});
