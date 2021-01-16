import { join, relative, basename } from 'path';

import test from 'ava';
import del from 'del';

import compile from './utils/compile';
import getCompiler from './utils/getCompiler';
import tempy from './utils/tempy';

import FileManagerPlugin from '../lib';
import { existsSync } from 'fs';

test.beforeEach(async (t) => {
  t.context.tmpdir = await tempy.dir({ suffix: 'move-action' });
});

test.afterEach(async (t) => {
  await del(t.context.tmpdir);
});

test('should move files from source to destination', async (t) => {
  const { tmpdir } = t.context;

  const dir = await tempy.dir({ root: tmpdir });
  const file = await tempy.file(dir, 'file');

  const srcDir = relative(tmpdir, dir);
  const destDir = tempy.getDirName();

  const config = {
    context: tmpdir,
    events: {
      onEnd: {
        move: [{ source: srcDir, destination: destDir }],
      },
    },
  };

  const compiler = getCompiler();
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.false(existsSync(join(tmpdir, srcDir)));
  t.true(existsSync(join(tmpdir, destDir)));
  t.true(existsSync(join(tmpdir, destDir, basename(file))));
});
