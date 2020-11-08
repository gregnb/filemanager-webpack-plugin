import { basename, join } from 'path';
import { existsSync } from 'fs';

import test from 'ava';
import del from 'del';

import compile from './utils/compile';
import getCompiler from './utils/getCompiler';
import tempy from './utils/tempy';

import FileManagerPlugin from '../lib';

test.beforeEach(async (t) => {
  t.context.tmpdir = await tempy.dir({ suffix: 'multi-action' });
});

test.afterEach(async (t) => {
  await del(t.context.tmpdir);
});

test('should execute given actions in an event', async (t) => {
  const { tmpdir } = t.context;

  const dirName1 = tempy.getDirName();
  const destDir = tempy.getDirName();
  const file = await tempy.file(tmpdir, 'file');

  const config = {
    context: tmpdir,
    events: {
      onEnd: {
        mkdir: [dirName1],
        copy: [{ source: basename(file), destination: `${destDir}/file-copied` }],
      },
    },
  };

  const compiler = getCompiler();
  new FileManagerPlugin(config).apply(compiler);
  await compile(compiler);

  t.true(existsSync(join(tmpdir, dirName1)));
  t.true(existsSync(file));
  t.true(existsSync(join(tmpdir, destDir, 'file-copied')));
});
